'use client';
import { Smartphone, Zap, LayoutDashboard, Headphones, Tag } from 'lucide-react';

const FEATURES = [
  { icon: <Tag size={18} />, label: 'Exclusive App Deals' },
  { icon: <Zap size={18} />, label: 'Faster Bookings' },
  { icon: <LayoutDashboard size={18} />, label: 'Manage Your Trips' },
  { icon: <Headphones size={18} />, label: '24/7 Support' },
];

export default function AppPromotion() {
  return (
    <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a2a 100%)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1 }} />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '48px', alignItems: 'center' }}>
          <div>
            <span style={{ display: 'inline-block', background: 'rgba(110,231,160,0.15)', color: '#6ee7a0', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '20px', marginBottom: '16px', border: '1px solid rgba(110,231,160,0.3)' }}>Mobile App</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, color: '#fff', marginBottom: '16px', lineHeight: 1.2 }}>Take DriveEasy With You Everywhere</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '28px', maxWidth: '480px' }}>Book, manage, and track your rentals on the go. Download the DriveEasy app for exclusive deals and a faster booking experience.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
              {FEATURES.map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 14px', color: '#fff', fontSize: '0.85rem' }}>
                  <span style={{ color: '#6ee7a0' }}>{f.icon}</span> {f.label}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[{ label: 'App Store', sub: 'Download on the' }, { label: 'Google Play', sub: 'Get it on' }].map(btn => (
                <a key={btn.label} href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#000', color: '#fff', padding: '12px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#222')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#000')}>
                  <Smartphone size={22} />
                  <div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>{btn.sub}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{btn.label}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }} className="app-mockup">
            <div style={{ width: '200px', height: '380px', background: 'linear-gradient(145deg, #1a3a2a, #0f1f2e)', borderRadius: '32px', border: '3px solid rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '16px', width: '60px', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#6ee7a0' }}>Drive</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginTop: '-8px' }}>Easy</div>
              </div>
              <Smartphone size={48} color="rgba(110,231,160,0.4)" />
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '0 16px' }}>Your journey starts here</div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 640px) { .app-mockup { display: none !important; } }`}</style>
    </section>
  );
}
