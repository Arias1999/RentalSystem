'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Booking } from '@/lib/bookingStorage';
import { getSession } from '@/lib/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { Calendar, MapPin, Car, X, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const STATUS_STYLE: Record<Booking['status'], { bg: string; color: string }> = {
  Pending:   { bg: '#fef9c3', color: '#854d0e' },
  Confirmed: { bg: '#dcfce7', color: '#166534' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b' },
  Returned: { bg: '#dbeafe', color: '#1d4ed8' },
};

type BookingReview = { booking_id: string; rating: number; comment: string; created_at: string };
type ReviewDraft = { rating: number; comment: string };

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reviews, setReviews] = useState<Record<string, BookingReview>>({});
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, ReviewDraft>>({});
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({});
  const [reviewBusyId, setReviewBusyId] = useState('');

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const user = await getSession();
      if (!active) return;
      setSignedIn(!!user);
      if (!user) { setBookings([]); setLoading(false); return; }
      const { data, error } = await getSupabaseBrowserClient().from('bookings')
        .select('id, car_name, car_type, car_image, pickup_location, dropoff_location, pickup_date, pickup_time, dropoff_date, dropoff_time, rental_option, customer_name, customer_email, customer_phone, daily_rate, rental_days, subtotal, promo_code, discount_amount, total_price, status, created_at')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      if (!active) return;
      if (error) setLoadError(error.message);
      else {
        setLoadError('');
        setBookings((data || []).map(row => ({
          id: row.id,
          car: row.car_name,
          carType: row.car_type,
          carImage: row.car_image,
          pickup: row.pickup_location,
          dropoff: row.dropoff_location || undefined,
          pickupDate: row.pickup_date,
          pickupTime: row.pickup_time,
          dropDate: row.dropoff_date,
          dropTime: row.dropoff_time,
          option: row.rental_option,
          customerName: row.customer_name || undefined,
          customerEmail: row.customer_email || undefined,
          customerPhone: row.customer_phone || undefined,
          dailyRate: row.daily_rate == null ? undefined : Number(row.daily_rate),
          rentalDays: row.rental_days || undefined,
          subtotal: row.subtotal == null ? undefined : Number(row.subtotal),
          promoCode: row.promo_code || undefined,
          discountAmount: Number(row.discount_amount || 0),
          totalPrice: row.total_price == null ? undefined : Number(row.total_price),
          status: row.status as Booking['status'],
          createdAt: row.created_at,
        })));
        const { data: reviewRows, error: reviewError } = await getSupabaseBrowserClient().from('booking_reviews')
          .select('booking_id, rating, comment, created_at').eq('customer_id', user.id);
        if (reviewError) setLoadError(reviewError.message);
        else setReviews(Object.fromEntries((reviewRows || []).map(review => [review.booking_id, review as BookingReview])));
      }
      setLoading(false);
    };
    void refresh();
    const intervalId = window.setInterval(() => { void refresh(); }, 15000);
    window.addEventListener('focus', refresh);
    return () => { active = false; window.clearInterval(intervalId); window.removeEventListener('focus', refresh); };
  }, []);

  const handleCancel = async (id: string) => {
    const user = await getSession();
    if (!user) return;
    const { error } = await getSupabaseBrowserClient().from('bookings').update({ status: 'Cancelled' })
      .eq('id', id).eq('user_id', user.id).eq('status', 'Pending');
    if (error) { setLoadError(error.message); return; }
    setBookings(current => current.map(booking => booking.id === id ? { ...booking, status: 'Cancelled' } : booking));
  };

  const submitReview = async (booking: Booking) => {
    const draft = reviewDrafts[booking.id] || { rating: 0, comment: '' };
    if (draft.rating < 1 || draft.rating > 5) {
      setReviewErrors(current => ({ ...current, [booking.id]: 'Choose a star rating before submitting.' }));
      return;
    }
    const user = await getSession();
    if (!user) { setReviewErrors(current => ({ ...current, [booking.id]: 'Sign in again to submit your rating.' })); return; }
    setReviewBusyId(booking.id);
    setReviewErrors(current => ({ ...current, [booking.id]: '' }));
    const { data, error } = await getSupabaseBrowserClient().from('booking_reviews').insert({
      booking_id: booking.id,
      customer_id: user.id,
      rating: draft.rating,
      comment: draft.comment.trim(),
    }).select('booking_id, rating, comment, created_at').single();
    if (error) setReviewErrors(current => ({ ...current, [booking.id]: error.message }));
    else setReviews(current => ({ ...current, [booking.id]: data as BookingReview }));
    setReviewBusyId('');
  };

  const pending = bookings.filter(b => b.status === 'Pending');
  const others  = bookings.filter(b => b.status !== 'Pending');

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-gray)' }}>
        <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'var(--navy)', backgroundImage: "linear-gradient(rgba(15, 31, 46, 0.72), rgba(15, 31, 46, 0.72)), url('/images/bookings-car-background.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 85%', backgroundRepeat: 'no-repeat', padding: '56px 24px', textAlign: 'center' }}>
          <div className="container">
            <span className="section-tag">My Bookings</span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, color: '#fff', margin: '12px 0 12px' }}>Your Booking History</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '480px', margin: '0 auto' }}>Track all your car rental bookings in one place.</p>
          </div>
        </div>

        <div className="container my-bookings-content">
          {loadError && <p role="alert" style={{ color: '#b42318', marginBottom: 18 }}>{loadError}</p>}
          {loading ? <p style={{ textAlign: 'center', padding: '70px 0', color: 'var(--text-muted)' }}>Loading your bookingsâ€¦</p> : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Image
                src="/images/car-transparent.png"
                alt="White SUV ready for your next trip"
                width={900}
                height={506}
                priority
                style={{ display: 'block', width: 'min(100%, 360px)', height: 'auto', objectFit: 'contain', margin: '0 auto 24px' }}
              />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>{signedIn ? 'No bookings yet' : 'Sign in to view your bookings'}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{signedIn ? 'Book a car to see it here.' : 'Your booking history is linked to your account.'}</p>
              <Link href={signedIn ? '/cars' : '/login?next=%2Fmy-bookings'} className="btn-primary" style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                {signedIn ? 'Browse Cars' : 'Sign In'} <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              {pending.length > 0 && (
                <>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '20px' }}>
                    ðŸ• Pending ({pending.length})
                  </h2>
                  <div className="my-bookings-grid my-bookings-grid-pending">
                    {pending.map(b => <BookingCard key={b.id} booking={b} onCancel={handleCancel} review={reviews[b.id]} reviewDraft={reviewDrafts[b.id] || { rating: 0, comment: '' }} reviewError={reviewErrors[b.id] || ''} reviewBusy={reviewBusyId === b.id} onReviewDraftChange={(draft) => setReviewDrafts(current => ({ ...current, [b.id]: draft }))} onSubmitReview={() => void submitReview(b)} />)}
                  </div>
                </>
              )}
              {others.length > 0 && (
                <>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '20px' }}>
                    ðŸ“‹ Past Bookings ({others.length})
                  </h2>
                  <div className="my-bookings-grid">
                    {others.map(b => <BookingCard key={b.id} booking={b} onCancel={handleCancel} review={reviews[b.id]} reviewDraft={reviewDrafts[b.id] || { rating: 0, comment: '' }} reviewError={reviewErrors[b.id] || ''} reviewBusy={reviewBusyId === b.id} onReviewDraftChange={(draft) => setReviewDrafts(current => ({ ...current, [b.id]: draft }))} onSubmitReview={() => void submitReview(b)} />)}
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0 12px' }}>
                <Link href="/cars" className="btn-primary" style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                  Book Now <ArrowRight size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

function BookingCard({ booking: b, onCancel, review, reviewDraft, reviewError, reviewBusy, onReviewDraftChange, onSubmitReview }: {
  booking: Booking;
  onCancel: (id: string) => void;
  review?: BookingReview;
  reviewDraft: ReviewDraft;
  reviewError: string;
  reviewBusy: boolean;
  onReviewDraftChange: (draft: ReviewDraft) => void;
  onSubmitReview: () => void;
}) {
  const s = STATUS_STYLE[b.status];
  return (
    <article className="my-booking-card">
      {b.carImage && (
        <div className="my-booking-image">
          <img src={b.carImage} alt={b.car} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '18px' }}>
          <div className="my-booking-card-heading">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Car size={15} color="var(--green)" />
              <span className="my-booking-car-name">{b.car}</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>#{b.id} Â· {new Date(b.createdAt).toLocaleDateString()}</span>
          </div>
          <span style={{ background: s.bg, color: s.color, fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
            {b.status}
          </span>
        </div>

        {b.status === 'Returned' && <p role="status" style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: 8, padding: '9px 11px', fontSize: '0.8rem', fontWeight: 650, marginBottom: 13 }}>âœ“ Vehicle returned and rental completed.</p>}

        {b.status === 'Returned' && <section aria-label="Rate this rental" style={{ border: '1px solid var(--border)', borderRadius: 9, padding: 14, marginBottom: 14 }}>
          {review ? <>
            <strong style={{ color: 'var(--navy)', fontSize: '0.86rem' }}>Your rating</strong>
            <div aria-label={`${review.rating} out of 5 stars`} style={{ display: 'flex', gap: 3, marginTop: 7 }}>
              {Array.from({ length: 5 }, (_, index) => <Star key={index} size={19} fill={index < review.rating ? '#eab308' : 'transparent'} color={index < review.rating ? '#eab308' : '#cbd5e1'} />)}
            </div>
            {review.comment && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 8, whiteSpace: 'pre-wrap' }}>{review.comment}</p>}
          </> : <>
            <strong style={{ color: 'var(--navy)', fontSize: '0.86rem' }}>How was your rental? Rate this vehicle</strong>
            <div role="radiogroup" aria-label="Rating from 1 to 5 stars" style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                return <button key={value} type="button" role="radio" aria-checked={reviewDraft.rating === value} aria-label={`${value} star${value === 1 ? '' : 's'}`} onClick={() => onReviewDraftChange({ ...reviewDraft, rating: value })} style={{ border: 0, padding: 3, background: 'transparent', cursor: 'pointer', color: value <= reviewDraft.rating ? '#eab308' : '#cbd5e1' }}><Star size={22} fill={value <= reviewDraft.rating ? '#eab308' : 'transparent'} /></button>;
              })}
            </div>
            <label style={{ display: 'grid', gap: 5, color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 10 }}>Comment (optional)
              <textarea rows={2} maxLength={2000} value={reviewDraft.comment} onChange={event => onReviewDraftChange({ ...reviewDraft, comment: event.target.value })} placeholder="Share a few words about your rental" style={{ width: '100%', resize: 'vertical', padding: 9, border: '1px solid var(--border)', borderRadius: 7, color: 'var(--navy)' }} />
            </label>
            {reviewError && <p role="alert" style={{ color: '#b42318', fontSize: '0.78rem', marginTop: 8 }}>{reviewError}</p>}
            <button type="button" onClick={onSubmitReview} disabled={reviewBusy} className="btn-primary" style={{ marginTop: 10, padding: '9px 13px', opacity: reviewBusy ? 0.7 : 1 }}>{reviewBusy ? 'Submittingâ€¦' : 'Submit rating'}</button>
          </>}
        </section>}

        <div className="my-booking-details">
          <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <MapPin size={13} color="var(--green)" /> {b.pickup}
          </span>
          {b.dropoff && <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><MapPin size={13} color="var(--green)" /> Drop-off: {b.dropoff}</span>}
          <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Calendar size={13} color="var(--green)" />
            {b.pickupDate} {b.pickupTime} â†’ {b.dropDate} {b.dropTime}
          </span>
          <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Clock size={13} color="var(--green)" />
          </span>
        </div>

        {b.customerName && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 12 }}>Customer: {b.customerName} Â· {b.customerEmail}</p>}
        {typeof b.totalPrice === 'number' && <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 14, color: 'var(--navy)', fontSize: '0.9rem' }}>
          {b.promoCode && <p style={{ color: 'var(--green)', fontWeight: 700, marginBottom: 8 }}>Promo applied: {b.promoCode}</p>}
          {typeof b.subtotal === 'number' && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Subtotal</span><span>â‚±{b.subtotal.toLocaleString()}</span></div>}
          {typeof b.discountAmount === 'number' && b.discountAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: 'var(--green)' }}><span>Discount {b.promoCode && `(${b.promoCode})`}</span><span>âˆ’â‚±{b.discountAmount.toLocaleString()}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}><span>Total ({b.rentalDays} day{b.rentalDays === 1 ? '' : 's'})</span><strong>â‚±{b.totalPrice.toLocaleString()}</strong></div>
        </div>}
        {b.status === 'Pending' && (
          <button onClick={() => onCancel(b.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
            <X size={14} /> Cancel Booking
          </button>
        )}
      </div>
    </article>
  );
}
