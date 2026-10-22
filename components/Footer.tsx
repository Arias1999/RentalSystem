'use client';
import Link from 'next/link';
import { Phone, Mail, MapPin, Share2, MessageCircle, Send, Rss } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}>
      <div className="container" style={{ padding: '64px 24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '48px' }}>
          <div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6ee7a0' }}>Drive</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>Easy</span>
            </div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>RENT. EXPLORE. BELONG.</p>
            <p style={{ lineHeight: 1.7, marginBottom: '20px' }}>Making car rentals simple, transparent, and hassle-free across India.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[Share2, MessageCircle, Send, Rss].map((Icon, i) => (
                <a key={i} href="#" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--green)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '16px', fontSize: '0.95rem' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[['Home', '/'], ['Cars', '/cars'], ['Locations', '/locations'], ['About', '/about'], ['Contact', '/contact']].map(([label, href]) => (
                <Link key={label} href={href} style={{ transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#6ee7a0')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '16px', fontSize: '0.95rem' }}>Our Services</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Self Drive Rentals', 'Chauffeur Service', 'Airport Transfers', 'Outstation Trips', 'Corporate Rentals', 'Wedding Cars'].map(s => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '16px', fontSize: '0.95rem' }}>Contact Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <MapPin size={15} color="#6ee7a0" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>12, Green Park, New Delhi – 110016</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Phone size={15} color="#6ee7a0" />
                <a href="tel:+919876543210" style={{ transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#6ee7a0')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}>+91 98765 43210</a>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Mail size={15} color="#6ee7a0" />
                <a href="mailto:hello@driveeasy.in" style={{ transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#6ee7a0')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}>hello@driveeasy.in</a>
              </div>
              <div style={{ marginTop: '4px' }}>
                <div style={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}>Business Hours</div>
                <div>Mon–Sat: 8:00 AM – 8:00 PM</div>
                <div>Sunday: 9:00 AM – 5:00 PM</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span>© {new Date().getFullYear()} DriveEasy. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" style={{ transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#6ee7a0')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}>Privacy Policy</a>
            <a href="#" style={{ transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#6ee7a0')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
