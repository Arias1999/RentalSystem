'use client';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const BENEFITS = [
  { title: 'Transparent Pricing', desc: 'No hidden charges. Ever.' },
  { title: 'Well-Maintained Vehicles', desc: 'Clean, safe and road-ready.' },
  { title: 'Wide Network', desc: 'Airport, city and outstation locations.' },
  { title: '24/7 Assistance', desc: "We're always here for you." },
];

export default function WhyChooseUs() {
  return (
    <section id="about-preview" style={{ padding: '80px 0', background: '#fff' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80" alt="South Cebu coastal road"
              style={{ width: '100%', height: '480px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} />
            <div style={{ position: 'absolute', bottom: '24px', left: '24px', background: 'var(--green)', color: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 8px 24px rgba(26,107,60,0.4)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>50K+</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Happy Customers</div>
            </div>
          </div>
          <div>
            <span className="section-tag">Why Choose Us</span>
            <h2 className="section-title">More Than Just a Rental</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.7 }}>
              At DriveEasy, we make car rentals simple, transparent, and hassle-free. From affordable rates to premium vehicles, we're here to keep you moving.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {BENEFITS.map(b => (
                <div key={b.title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={22} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{b.title}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}> — {b.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/about" className="btn-primary">About Us <ArrowRight size={16} /></Link>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { #about-preview .container > div { grid-template-columns: 1fr !important; gap: 32px !important; } }`}</style>
    </section>
  );
}
