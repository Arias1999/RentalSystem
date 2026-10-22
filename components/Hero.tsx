'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, MapPin, Headphones, Car, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const FEATURES = [
  { icon: <Car size={18} />, label: 'Wide Range of Vehicles' },
  { icon: <Shield size={18} />, label: 'Fully Insured & Safe' },
  { icon: <MapPin size={18} />, label: 'Multiple Locations' },
  { icon: <Headphones size={18} />, label: '24/7 Customer Support' },
];

export default function Hero() {
  const router = useRouter();
  const { user, loading } = useAuth();
  return (
    <section id="home" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f1f2e 0%, #1a3a2a 60%, #0f1f2e 100%)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', paddingTop: '70px' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.18 }} />
      <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%', padding: '80px 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', background: 'rgba(26,107,60,0.3)', color: '#6ee7a0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '20px', marginBottom: '24px', border: '1px solid rgba(110,231,160,0.3)' }}>
            Premium Car Rentals
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1.12, marginBottom: '24px' }}>
            Premium Car Rentals<br />
            <span style={{ color: '#6ee7a0' }}>for Every Journey</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            Reliable cars. Flexible rentals. Unforgettable journeys. Whether it's a weekend getaway, a business trip, or your next big adventure — we've got you covered.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '56px' }}>
            <Link href="/cars" onClick={event => { if (!loading && !user) { event.preventDefault(); router.push('/login?next=%2Fcars'); } }} style={{ background: 'var(--green)', color: '#fff', padding: '15px 36px', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s, transform 0.2s', boxShadow: '0 8px 24px rgba(26,107,60,0.4)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-dark)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Rent a Car <ArrowRight size={18} />
            </Link>
            <Link href="/cars" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '15px 36px', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1.5px solid rgba(255,255,255,0.25)', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}>
              Browse Cars
            </Link>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {FEATURES.map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 16px', color: '#fff', fontSize: '0.85rem', fontWeight: 500, backdropFilter: 'blur(4px)' }}>
                <span style={{ color: '#6ee7a0' }}>{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '56px' }}>
            <img src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1000&q=80" alt="Premium SUV"
              style={{ width: '100%', maxWidth: '700px', borderRadius: '20px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
