'use client';
import { MousePointerClick, Key, Compass } from 'lucide-react';

const STEPS = [
  { num: '01', icon: <MousePointerClick size={28} />, title: 'Book Online', desc: 'Choose your location, dates and car.' },
  { num: '02', icon: <Key size={28} />, title: 'Pick Up', desc: 'Get your car and hit the road.' },
  { num: '03', icon: <Compass size={28} />, title: 'Explore', desc: 'Make unforgettable memories.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '80px 0', background: '#fff' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span className="section-tag">How It Works</span>
          <h2 className="section-title">Get on the Road in 3 Simple Steps</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '48px', left: '20%', right: '20%', height: '2px', background: 'linear-gradient(to right, var(--green), var(--green-light))', zIndex: 0 }} className="connector" />
          {STEPS.map((s, i) => (
            <div key={s.num} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: i === 1 ? 'var(--green)' : 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: i === 1 ? '#fff' : 'var(--green)', boxShadow: i === 1 ? '0 8px 24px rgba(26,107,60,0.35)' : 'none', border: '4px solid #fff' }}>
                {s.icon}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--green)', letterSpacing: '0.1em', marginBottom: '8px' }}>{s.num}</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>{s.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 640px) { #how-it-works .container > div:last-child { grid-template-columns: 1fr !important; } .connector { display: none; } }`}</style>
    </section>
  );
}
