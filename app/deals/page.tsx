'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tag, Clock, ArrowRight } from 'lucide-react';

interface Deal {
  id: number;
  title: string;
  desc: string;
  discount: string;
  validUntil: string;
  code: string;
  color: string;
  badge: string;
}

const DEALS: Deal[] = [
  { id: 4, title: 'First Ride Discount', desc: 'New to DriveEasy? Get â‚±300 off your first booking. Apply the code at booking. No minimum booking value required.', discount: 'â‚±300 OFF', validUntil: 'Dec 31, 2026', code: 'FIRST300', color: '#fce8f3', badge: 'New Users' },
];

export default function DealsPage() {
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Coupon code "${code}" copied. Paste it into the vehicle booking form and choose Apply.`);
  };

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-gray)' }}>
        <div style={{ background: 'var(--navy)', padding: '60px 24px', textAlign: 'center' }}>
          <div className="container">
            <span className="section-tag">Exclusive Offers</span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#fff', margin: '12px 0 16px' }}>Hot Deals & Discounts</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '520px', margin: '0 auto', fontSize: '1rem' }}>Save more on every ride. Use these exclusive coupon codes at checkout.</p>
          </div>
        </div>
        <div className="container" style={{ padding: '56px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {DEALS.map(deal => (
              <div key={deal.id} style={{ background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: deal.color, padding: '24px 24px 16px', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--green)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>{deal.badge}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Tag size={20} color="var(--green)" />
                    <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--green)' }}>{deal.discount}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)' }}>{deal.title}</h3>
                </div>
                <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{deal.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Clock size={13} /> Valid until: {deal.validUntil}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px dashed var(--green)', borderRadius: '8px', overflow: 'hidden', marginTop: 'auto' }}>
                    <span style={{ flex: 1, padding: '10px 14px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--green)', letterSpacing: '0.08em', background: 'var(--green-light)' }}>{deal.code}</span>
                    <button onClick={() => copyCode(deal.code)}
                      style={{ padding: '10px 16px', background: 'var(--green)', color: '#fff', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--green-dark)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'var(--green)')}>
                      Copy
                    </button>
                  </div>
                  <a href={`/cars?promo=${encodeURIComponent(deal.code)}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green)', fontWeight: 600, fontSize: '0.875rem' }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                    Book Now <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}