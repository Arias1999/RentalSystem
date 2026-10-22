'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BookingForm from '@/components/BookingForm';
import { Shield, MapPin, Headphones, Car } from 'lucide-react';

const PERKS = [
  { icon: <Car size={20} />, title: 'Wide Range', desc: 'Economy to Luxury' },
  { icon: <Shield size={20} />, title: 'Fully Insured', desc: 'Safe & covered' },
  { icon: <MapPin size={20} />, title: '25+ Locations', desc: 'Across India' },
  { icon: <Headphones size={20} />, title: '24/7 Support', desc: 'Always here' },
];

export default function BookingPage() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-gray)' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f1f2e 0%, #1a3a2a 100%)', padding: '56px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
          <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <span style={{ display: 'inline-block', background: 'rgba(26,107,60,0.35)', color: '#6ee7a0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '20px', marginBottom: '16px', border: '1px solid rgba(110,231,160,0.3)' }}>Book a Car</span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>Find & Book Your Perfect Car</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '500px', margin: '0 auto' }}>Fill in your trip details below and we'll show you the best available cars.</p>
          </div>
        </div>
        <div className="container" style={{ padding: '48px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: '40px', alignItems: 'start' }} className="booking-grid">
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '8px' }}>Why Book with DriveEasy?</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.7 }}>Transparent pricing, well-maintained vehicles, and 24/7 support — everything you need for a stress-free journey.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                {PERKS.map(p => (
                  <div key={p.title} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '20px', boxShadow: 'var(--shadow)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ background: 'var(--green-light)', color: 'var(--green)', padding: '10px', borderRadius: '8px', flexShrink: 0 }}>{p.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.95rem' }}>{p.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <img src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80" alt="Premium SUV"
                style={{ width: '100%', borderRadius: '16px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', objectFit: 'cover', maxHeight: '300px' }} />
            </div>
            <div style={{ position: 'sticky', top: '96px' }}>
              <BookingForm />
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <style>{`@media (max-width: 900px) { .booking-grid { grid-template-columns: 1fr !important; } }`}</style>
    </>
  );
}
