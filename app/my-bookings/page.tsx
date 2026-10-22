'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getBookings, cancelBooking, type Booking } from '@/lib/bookingStorage';
import { getSession } from '@/lib/auth';
import { Calendar, MapPin, Car, Clock, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STATUS_STYLE: Record<Booking['status'], { bg: string; color: string }> = {
  Pending:   { bg: '#fef9c3', color: '#854d0e' },
  Confirmed: { bg: '#dcfce7', color: '#166534' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const user = getSession();
    setSignedIn(!!user);
    setBookings(user ? getBookings().filter(booking => booking.customerEmail?.toLowerCase() === user.email.toLowerCase()) : []);
  }, []);

  const handleCancel = (id: string) => {
    cancelBooking(id);
    const user = getSession();
    setBookings(user ? getBookings().filter(booking => booking.customerEmail?.toLowerCase() === user.email.toLowerCase()) : []);
  };

  const pending = bookings.filter(b => b.status === 'Pending');
  const others  = bookings.filter(b => b.status !== 'Pending');

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-gray)' }}>
        <div style={{ background: 'var(--navy)', padding: '56px 24px', textAlign: 'center' }}>
          <div className="container">
            <span className="section-tag">My Bookings</span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, color: '#fff', margin: '12px 0 12px' }}>Your Booking History</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '480px', margin: '0 auto' }}>Track all your car rental bookings in one place.</p>
          </div>
        </div>

        <div className="container" style={{ padding: '48px 24px' }}>
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🚗</div>
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
                    🕐 Pending ({pending.length})
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    {pending.map(b => <BookingCard key={b.id} booking={b} onCancel={handleCancel} />)}
                  </div>
                </>
              )}
              {others.length > 0 && (
                <>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '20px' }}>
                    📋 Past Bookings ({others.length})
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {others.map(b => <BookingCard key={b.id} booking={b} onCancel={handleCancel} />)}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

function BookingCard({ booking: b, onCancel }: { booking: Booking; onCancel: (id: string) => void }) {
  const s = STATUS_STYLE[b.status];
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
      {b.carImage && (
        <div style={{ height: '140px', overflow: 'hidden' }}>
          <img src={b.carImage} alt={b.car} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Car size={15} color="var(--green)" />
              <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem' }}>{b.car}</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>#{b.id} · {new Date(b.createdAt).toLocaleDateString()}</span>
          </div>
          <span style={{ background: s.bg, color: s.color, fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
            {b.status}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <MapPin size={13} color="var(--green)" /> {b.pickup}
          </span>
          {b.dropoff && <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><MapPin size={13} color="var(--green)" /> Drop-off: {b.dropoff}</span>}
          <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Calendar size={13} color="var(--green)" />
            {b.pickupDate} {b.pickupTime} → {b.dropDate} {b.dropTime}
          </span>
          <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Clock size={13} color="var(--green)" />
            {b.option === 'self' ? '🚗 Self Drive' : '👤 With Driver'}
          </span>
        </div>

        {b.customerName && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 12 }}>Customer: {b.customerName} · {b.customerEmail}</p>}
        {typeof b.totalPrice === 'number' && <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 14, color: 'var(--navy)', fontSize: '0.9rem' }}>
          {b.promoCode && <p style={{ color: 'var(--green)', fontWeight: 700, marginBottom: 8 }}>Promo applied: {b.promoCode}</p>}
          {typeof b.subtotal === 'number' && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Subtotal</span><span>₱{b.subtotal.toLocaleString()}</span></div>}
          {typeof b.discountAmount === 'number' && b.discountAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: 'var(--green)' }}><span>Discount {b.promoCode && `(${b.promoCode})`}</span><span>−₱{b.discountAmount.toLocaleString()}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}><span>Total ({b.rentalDays} day{b.rentalDays === 1 ? '' : 's'})</span><strong>₱{b.totalPrice.toLocaleString()}</strong></div>
        </div>}
        {b.status === 'Pending' && (
          <button onClick={() => onCancel(b.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
            <X size={14} /> Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
}
