'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ALL_CARS } from '@/lib/cars';
import { getSession } from '@/lib/auth';
import { saveBooking } from '@/lib/bookingStorage';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { FIRST_RIDE_PROMO, isPromoCurrent } from '@/lib/promotions';
import { ArrowLeft, Car, CheckCircle, Fuel, Settings, Users } from 'lucide-react';
import Link from 'next/link';

type Details = { pickup: string; dropoff: string; pickupDate: string; pickupTime: string; dropDate: string; dropTime: string; name: string; email: string; phone: string };
type PaymentMethod = 'COD' | 'GCash';
const LOCATIONS = ['Carcar', 'Argao', 'Dalaguete', 'Oslob', 'Moalboal', 'Badian'];
const formatDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const today = () => formatDate(new Date());
const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return formatDate(d); };

export default function CarDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const car = ALL_CARS.find(item => item.id === Number(id));
  const [details, setDetails] = useState<Details>({ pickup: '', dropoff: '', pickupDate: '', pickupTime: '10:00', dropDate: '', dropTime: '10:00', name: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ready, setReady] = useState(false);
  const [carAvailable, setCarAvailable] = useState(false);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const query = (key: string, fallback: string) => params.get(key) || fallback;
    void getSession().then(user => {
      if (!active) return;
      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`);
        return;
      }
      let saved: Partial<Details> = {};
      try { saved = JSON.parse(sessionStorage.getItem('driveeasy_booking_draft') || '{}'); } catch { /* ignore invalid draft */ }
      setDetails({
        pickup: saved.pickup || query('pickup', ''), dropoff: saved.dropoff || query('dropoff', ''),
        pickupDate: saved.pickupDate || query('pickupDate', today()), pickupTime: saved.pickupTime || query('pickupTime', '10:00'),
        dropDate: saved.dropDate || query('dropDate', tomorrow()), dropTime: saved.dropTime || query('dropTime', '10:00'),
        name: saved.name || user.name || '', email: saved.email || user.email || '', phone: saved.phone || user.phone || '',
      });
      setPromoInput(query('promo', '').toUpperCase());
      setReady(true);
    });
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    let active = true;
    if (!car) return;
    const refreshAvailability = async () => {
      try {
        const { data } = await getSupabaseBrowserClient().from('cars').select('available').eq('id', car.id).maybeSingle();
        if (active) setCarAvailable(data?.available === true);
      } catch { /* Keep the current availability if the network is temporarily unavailable. */ }
    };
    void refreshAvailability();
    const intervalId = window.setInterval(() => { void refreshAvailability(); }, 15000);
    window.addEventListener('focus', refreshAvailability);
    return () => { active = false; window.clearInterval(intervalId); window.removeEventListener('focus', refreshAvailability); };
  }, [car]);

  const rentalDays = useMemo(() => {
    if (!details.pickupDate || !details.dropDate) return 1;
    const start = new Date(`${details.pickupDate}T${details.pickupTime}`);
    const end = new Date(`${details.dropDate}T${details.dropTime}`);
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  }, [details.pickupDate, details.pickupTime, details.dropDate, details.dropTime]);
  const subtotal = car ? car.price * rentalDays : 0;
  const discountAmount = appliedPromo === FIRST_RIDE_PROMO.code ? Math.min(FIRST_RIDE_PROMO.discountAmount, subtotal) : 0;
  const totalPrice = subtotal - discountAmount;
  if (!car) return <><Navbar /><main className="container" style={{ padding: '120px 24px', textAlign: 'center' }}><h1>Vehicle not found</h1><Link href="/cars" className="btn-primary" style={{ display: 'inline-flex', marginTop: 20 }}>Browse cars</Link></main><Footer /></>;
  if (!ready) return <><Navbar /><main style={{ paddingTop: 120, minHeight: '70vh', textAlign: 'center', color: 'var(--text-muted)' }}>Checking your account…</main><Footer /></>;

  const set = (key: keyof Details, value: string) => setDetails(current => ({ ...current, [key]: value }));
  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    const user = await getSession();
    if (code !== FIRST_RIDE_PROMO.code) { setAppliedPromo(''); setPromoMessage('That promo code is not valid.'); return; }
    if (!isPromoCurrent()) { setAppliedPromo(''); setPromoMessage('This promo code has expired.'); return; }
    if (!user) { setAppliedPromo(''); setPromoMessage('Sign in to use this first-booking promo.'); return; }
    const { data: previousBooking, error: historyError } = await getSupabaseBrowserClient()
      .from('bookings').select('id').eq('user_id', user.id).neq('status', 'Cancelled').limit(1).maybeSingle();
    if (historyError) { setAppliedPromo(''); setPromoMessage('Could not verify your booking history. Please try again.'); return; }
    const hasPreviousBooking = !!previousBooking;
    if (hasPreviousBooking) { setAppliedPromo(''); setPromoMessage('FIRST300 is for your first booking only.'); return; }
    setAppliedPromo(code);
    setPromoMessage(`Promo applied! ₱${Math.min(FIRST_RIDE_PROMO.discountAmount, subtotal).toLocaleString()} off your booking.`);
  };

  const confirmBooking = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!carAvailable) { setError('This car is unavailable because it has already been booked. Please choose another car.'); return; }
    if (!details.pickup.trim() || !details.dropoff.trim()) { setError('Enter both pick-up and drop-off locations.'); return; }
    if (!details.pickupDate || !details.dropDate || details.pickupDate < today() || new Date(`${details.dropDate}T${details.dropTime}`) <= new Date(`${details.pickupDate}T${details.pickupTime}`)) { setError('Choose valid rental dates and times.'); return; }
    if (!details.name.trim() || !details.email.trim() || !details.phone.trim()) { setError('Complete your contact details to continue.'); return; }
    setError('');
    const user = await getSession();
    if (!user) {
      sessionStorage.setItem('driveeasy_booking_draft', JSON.stringify(details));
      router.push(`/login?next=${encodeURIComponent(`/cars/${car.id}?book=1`)}`);
      return;
    }
    setBookingBusy(true);
    const { error: bookingError } = await getSupabaseBrowserClient().from('bookings').insert({
      user_id: user.id,
      car_id: car.id,
      car_name: car.name,
      car_type: car.category,
      car_image: car.image,
      pickup_location: details.pickup.trim(),
      dropoff_location: details.dropoff.trim(),
      pickup_date: details.pickupDate,
      pickup_time: details.pickupTime,
      dropoff_date: details.dropDate,
      dropoff_time: details.dropTime,
      rental_option: 'self',
      payment_method: paymentMethod,
      customer_name: details.name.trim(),
      customer_email: user.email || details.email.trim(),
      customer_phone: details.phone.trim(),
      daily_rate: car.price,
      rental_days: rentalDays,
      subtotal,
      promo_code: appliedPromo || null,
      discount_amount: discountAmount,
      total_price: totalPrice,
      status: 'Pending',
    });
    if (bookingError) {
      setBookingBusy(false);
      setError(bookingError.code === '23505'
        ? 'Sorry, another customer just booked this car. Please choose a different vehicle.'
        : bookingError.message);
      return;
    }
    saveBooking({ car: car.name, carType: car.category, carImage: car.image, pickup: details.pickup, dropoff: details.dropoff, pickupDate: details.pickupDate, pickupTime: details.pickupTime, dropDate: details.dropDate, dropTime: details.dropTime, option: 'self', paymentMethod, customerName: details.name, customerEmail: user.email || details.email, customerPhone: details.phone, dailyRate: car.price, rentalDays, subtotal, promoCode: appliedPromo || undefined, discountAmount, totalPrice });
    sessionStorage.removeItem('driveeasy_booking_draft');
    setCarAvailable(false);
    setSubmitted(true);
    setBookingBusy(false);
  };

  const field = (label: string, key: keyof Details, type = 'text', required = true) => (
    <label key={key} style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>{label}
      <input required={required} type={type} readOnly={key === 'email'} min={type === 'date' ? (key === 'pickupDate' ? today() : details.pickupDate) : undefined} value={details[key]} onChange={e => set(key, e.target.value)} style={{ width: '100%', marginTop: 5, padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', color: 'var(--text)', background: key === 'email' ? 'var(--bg-gray)' : '#fff' }} />
    </label>
  );

  return <>
    <Navbar />
    <main style={{ paddingTop: 100, minHeight: '100vh', background: 'var(--bg-gray)' }}>
      <div className="container" style={{ padding: '24px 24px 64px' }}>
        <Link href="/cars" style={{ color: 'var(--green)', display: 'inline-flex', gap: 6, alignItems: 'center', marginBottom: 20, fontWeight: 600 }}><ArrowLeft size={16} /> Back to cars</Link>
        <div className="car-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 32, alignItems: 'start' }}>
          <section style={{ background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <img src={car.image} alt={car.name} style={{ width: '100%', height: 350, objectFit: 'cover' }} />
            <div style={{ padding: 28 }}>
              <span className="section-tag">{car.category}</span><h1 style={{ color: 'var(--navy)', fontSize: '2rem', marginBottom: 10 }}>{car.name}</h1>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 22 }}>{car.description}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {[['Transmission', car.transmission, <Settings size={16} />], ['Seats', `${car.seats} passengers`, <Users size={16} />], ['Fuel', car.fuel, <Fuel size={16} />], ['Availability', carAvailable ? 'Available' : 'Unavailable', <CheckCircle size={16} />]].map(([label, value, icon]) => <div key={String(label)} style={{ display: 'flex', gap: 10, color: 'var(--green)', background: 'var(--bg-gray)', padding: 14, borderRadius: 8 }}><span>{icon}</span><span style={{ color: 'var(--text)' }}><small style={{ display: 'block', color: 'var(--text-muted)' }}>{label}</small><b>{value}</b></span></div>)}
              </div>
              <h2 style={{ color: 'var(--navy)', fontSize: '1.05rem', marginTop: 24, marginBottom: 10 }}>Vehicle features</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>{car.features.join(' · ')}</p>
            </div>
          </section>
          <section style={{ background: '#fff', padding: 28, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
            {submitted ? <div style={{ textAlign: 'center', padding: '36px 8px' }}><CheckCircle size={52} color="var(--green)" /><h2 style={{ color: 'var(--navy)', margin: '12px 0 8px' }}>Booking received</h2>{appliedPromo && <p style={{ color: 'var(--green)', fontWeight: 700, marginBottom: 6 }}>Promo applied: {appliedPromo} · ₱{discountAmount.toLocaleString()} off</p>}<p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Your total is ₱{totalPrice.toLocaleString()}.</p><Link href="/my-bookings" className="btn-primary" style={{ display: 'inline-flex' }}>View My Bookings</Link></div> : <>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--navy)', marginBottom: 4 }}>Book this vehicle</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 20 }}>₱{car.price.toLocaleString()} per day</p>
              <form onSubmit={confirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>Pick-up location<select required value={details.pickup} onChange={e => set('pickup', e.target.value)} style={{ width: '100%', marginTop: 5, padding: 10, border: '1.5px solid var(--border)', borderRadius: 8, background: '#fff' }}><option value="">Select area</option>{LOCATIONS.map(location => <option key={location}>{location}</option>)}</select></label>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700 }}>Drop-off location<select required value={details.dropoff} onChange={e => set('dropoff', e.target.value)} style={{ width: '100%', marginTop: 5, padding: 10, border: '1.5px solid var(--border)', borderRadius: 8, background: '#fff' }}><option value="">Select area</option>{LOCATIONS.map(location => <option key={location}>{location}</option>)}</select></label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{field('Pick-up date', 'pickupDate', 'date')}{field('Pick-up time', 'pickupTime', 'time')}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{field('Drop-off date', 'dropDate', 'date')}{field('Drop-off time', 'dropTime', 'time')}</div>
                <div>
                  <label htmlFor="booking-promo" style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>Promo code</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input id="booking-promo" value={promoInput} onChange={e => { setPromoInput(e.target.value.toUpperCase()); setAppliedPromo(''); setPromoMessage(''); }} placeholder="Enter coupon code" style={{ flex: 1, minWidth: 0, padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, textTransform: 'uppercase' }} />
                    <button type="button" onClick={applyPromo} className="btn-outline" style={{ padding: '9px 14px' }}>Apply</button>
                  </div>
                  {promoMessage && <p role="status" style={{ color: appliedPromo ? 'var(--green)' : '#dc2626', fontSize: '0.82rem', marginTop: 6 }}>{promoMessage}</p>}
                </div>
                <h3 style={{ color: 'var(--navy)', fontSize: '1rem', marginTop: 8 }}>Customer details</h3>
                {field('Full name', 'name')}{field('Email', 'email', 'email')}{field('Phone number', 'phone', 'tel')}
                <fieldset style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                  <legend style={{ color: 'var(--navy)', fontSize: '0.9rem', fontWeight: 700, padding: '0 5px' }}>Payment method</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {(['COD', 'GCash'] as const).map(method => <label key={method} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, border: `1px solid ${paymentMethod === method ? 'var(--green)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', color: 'var(--navy)', fontWeight: 650 }}><input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />{method === 'COD' ? 'Cash on Delivery' : 'GCash'}</label>)}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.76rem', margin: '9px 0 0' }}>{paymentMethod === 'COD' ? 'Pay in cash when you receive the vehicle.' : 'GCash payment instructions will be provided by the rental team after booking.'}</p>
                </fieldset>
                <div style={{ background: 'var(--green-light)', borderRadius: 8, padding: 16, color: 'var(--green)', marginTop: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}><span>₱{car.price.toLocaleString()} × {rentalDays} day{rentalDays === 1 ? '' : 's'}</span><span>₱{subtotal.toLocaleString()}</span></div>
                  {appliedPromo && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginTop: 8 }}><span>Promo {appliedPromo}</span><span>−₱{discountAmount.toLocaleString()}</span></div>}
                  <div style={{ borderTop: '1px solid rgba(26,107,60,0.2)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}><span>{appliedPromo ? 'Total after discount' : 'Estimated total'}</span><span>₱{totalPrice.toLocaleString()}</span></div>
                </div>
                {error && <p role="alert" style={{ color: '#dc2626', fontSize: '0.85rem' }}>{error}</p>}
                <button type="submit" className="btn-primary" disabled={!carAvailable || bookingBusy} style={{ justifyContent: 'center', padding: 13, opacity: carAvailable && !bookingBusy ? 1 : 0.5 }}>{bookingBusy ? 'Booking…' : carAvailable ? 'Confirm Booking' : 'Car Unavailable'} <ArrowLeft size={15} style={{ transform: 'rotate(180deg)' }} /></button>
              </form>
            </>}
          </section>
        </div>
      </div>
    </main>
    <Footer />
    <style>{`@media(max-width:850px){.car-detail-grid{grid-template-columns:1fr!important}}`}</style>
  </>;
}
