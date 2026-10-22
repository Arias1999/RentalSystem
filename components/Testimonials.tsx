'use client';
import { Star } from 'lucide-react';

const REVIEWS = [
  { name: 'Priya Sharma', location: 'Delhi', review: 'Absolutely seamless experience! The car was spotless and the booking process took less than 5 minutes. Will definitely use DriveEasy again for our next trip to Manali.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  { name: 'Rahul Mehta', location: 'Mumbai', review: 'Rented an SUV for a Leh-Ladakh road trip. The vehicle was well-maintained and the 24/7 support team was incredibly helpful when we had a minor query on the route.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
  { name: 'Ananya Iyer', location: 'Bangalore', review: 'Transparent pricing with zero hidden charges — exactly what they promise. The Innova we rented for a family trip to Shimla was comfortable and fuel-efficient.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
];

export default function Testimonials() {
  return (
    <section id="testimonials" style={{ padding: '80px 0', background: 'var(--bg-gray)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-tag">Testimonials</span>
          <h2 className="section-title">Real People. Real Journeys.</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>The following reviews are fictional and used for demonstration purposes only.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {REVIEWS.map(r => (
            <div key={r.name} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '28px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, flex: 1 }}>"{r.review}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <img src={r.avatar} alt={r.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.95rem' }}>{r.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
