'use client';
import { useState } from 'react';
import { MapPin, Calendar, Clock, Car, CheckCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReactNode, Suspense } from 'react';

interface FormState {
  pickup: string;
  pickupDate: string;
  pickupTime: string;
  dropDate: string;
  dropTime: string;
  carType: string;
}

interface Errors { pickup?: string; pickupDate?: string; dropDate?: string; }

const CAR_TYPES = ['Any Type', 'Economy', 'Sedan', 'SUV', 'Luxury', 'MUV', 'Tempo'];

function Field({ icon, label, error, children }: { icon: ReactNode; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--green)', display: 'flex' }}>{icon}</span>
        {children}
      </div>
      {error && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>{error}</p>}
    </div>
  );
}

function BookingFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date().toISOString().split('T')[0];

  const carName = searchParams.get('car') || '';
  const carType = searchParams.get('carType') || 'Any Type';
  const carImage = searchParams.get('carImage') || '';

  const [form, setForm] = useState<FormState>({
    pickup: '',
    pickupDate: today,
    pickupTime: '10:00',
    dropDate: today,
    dropTime: '10:00',
    carType: CAR_TYPES.includes(carType) ? carType : 'Any Type',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof FormState, v: string) => setForm(p => ({ ...p, [k]: v }));

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.pickup.trim()) e.pickup = 'Pickup location is required';
    if (!form.pickupDate) e.pickupDate = 'Required';
    if (!form.dropDate) e.dropDate = 'Required';
    if (form.dropDate < form.pickupDate) e.dropDate = 'Drop-off must be after pickup';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    setSubmitted(true);
    const params = new URLSearchParams({
      pickup: form.pickup.trim(),
      pickupDate: form.pickupDate,
      pickupTime: form.pickupTime,
      dropDate: form.dropDate,
      dropTime: form.dropTime,
      days: String(Math.max(1, Math.ceil((new Date(`${form.dropDate}T${form.dropTime}`).getTime() - new Date(`${form.pickupDate}T${form.pickupTime}`).getTime()) / 86400000))),
    });
    if (form.carType !== 'Any Type') params.set('type', form.carType);
    const promo = searchParams.get('promo');
    if (promo) params.set('promo', promo);
    router.push(`/cars?${params.toString()}`);
  };

  const inputStyle = (err?: string): React.CSSProperties => ({
    width: '100%', padding: '10px 12px 10px 36px',
    border: `1.5px solid ${err ? '#ef4444' : 'var(--border)'}`,
    borderRadius: '8px', fontSize: '0.875rem', background: '#fff', outline: 'none',
  });

  if (submitted) {
    return (
      <div style={{ background: '#fff', borderRadius: '16px', padding: '48px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', textAlign: 'center' }}>
        <CheckCircle size={52} color="var(--green)" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '8px' }}>Finding available carsâ€¦</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose a vehicle to continue your booking.</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '4px' }}>Book Your Car</h3>
      {carName ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--green-light)', border: '1px solid var(--green)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
          <Car size={16} color="var(--green)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy)' }}>{carName}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{form.carType}</span>
        </div>
      ) : (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Fill in the details to confirm your booking</p>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Field icon={<MapPin size={15} />} label="Pickup Location" error={errors.pickup}>
          <input value={form.pickup} onChange={e => set('pickup', e.target.value)} placeholder="City, airport or address" style={inputStyle(errors.pickup)} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field icon={<Calendar size={15} />} label="Pickup Date" error={errors.pickupDate}>
            <input type="date" value={form.pickupDate} min={today} onChange={e => set('pickupDate', e.target.value)} style={inputStyle(errors.pickupDate)} />
          </Field>
          <Field icon={<Clock size={15} />} label="Pickup Time">
            <input type="time" value={form.pickupTime} onChange={e => set('pickupTime', e.target.value)} style={inputStyle()} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field icon={<Calendar size={15} />} label="Drop-off Date" error={errors.dropDate}>
            <input type="date" value={form.dropDate} min={form.pickupDate} onChange={e => set('dropDate', e.target.value)} style={inputStyle(errors.dropDate)} />
          </Field>
          <Field icon={<Clock size={15} />} label="Drop-off Time">
            <input type="time" value={form.dropTime} onChange={e => set('dropTime', e.target.value)} style={inputStyle()} />
          </Field>
        </div>
        {!carName && (
          <Field icon={<Car size={15} />} label="Car Type">
            <select value={form.carType} onChange={e => set('carType', e.target.value)} style={{ ...inputStyle(), appearance: 'none' }}>
              {CAR_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
        )}
        <button type="submit" className="btn-primary" style={{ justifyContent: 'center', padding: '14px', fontSize: '1rem', marginTop: '4px' }}>
          Find available cars
        </button>
      </form>
    </div>
  );
}

export default function BookingForm() {
  return (
    <Suspense fallback={<div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>Loading...</div>}>
      <BookingFormInner />
    </Suspense>
  );
}
