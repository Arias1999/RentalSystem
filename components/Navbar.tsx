'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, Menu, X } from 'lucide-react';
import { OPEN_SIGNUP_EVENT } from '@/components/SignupModal';
import { OPEN_LOGIN_EVENT } from '@/components/LoginModal';
import { OPEN_PROFILE_EVENT } from '@/components/ProfileModal';
import { getBookings } from '@/lib/bookingStorage';
import { useAuth } from '@/lib/auth';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Cars', href: '/cars' },
  { label: 'Locations', href: '/locations' },
  { label: 'Deals', href: '/deals' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const update = () => setPendingCount(getBookings().filter(b => b.status === 'Pending' && b.customerEmail?.toLowerCase() === user?.email.toLowerCase()).length);
    update();
    window.addEventListener('focus', update);
    return () => window.removeEventListener('focus', update);
  }, [user]);

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff', boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.1)' : '0 1px 0 var(--border)', transition: 'box-shadow 0.3s' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--green)', letterSpacing: '-0.5px' }}>Drive<span style={{ color: 'var(--navy)' }}>Easy</span></span>
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 600 }}>RENT. EXPLORE. BELONG.</span>
        </Link>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }} className="desktop-nav">
          {NAV_LINKS.map(l => (
            <Link key={l.label} href={l.href} style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}>
              {l.label}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/my-bookings" style={{ position: 'relative', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}>
            My Bookings
            {pendingCount > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: 'var(--green)', color: '#fff', fontSize: '0.6rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingCount}</span>
            )}
          </Link>
          {user && <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_PROFILE_EVENT))} style={{ background: 'transparent', fontSize: '0.9rem', fontWeight: 600, color: 'var(--green)' }}>Profile</button>}
          {!user && <><button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_LOGIN_EVENT))} className="navbar-login">Sign in</button><button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_SIGNUP_EVENT))} className="navbar-signup">Sign Up</button></>}
          <Link href="/cars" onClick={event => { if (!authLoading && !user) { event.preventDefault(); router.push('/login?next=%2Fcars'); } }} className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.85rem' }}>Rent a Car</Link>
          <button onClick={() => setOpen(!open)} style={{ background: 'none', display: 'none', padding: '4px' }} className="mobile-menu-btn">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {open && (
        <div style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_LINKS.map(l => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
              style={{ padding: '10px 0', fontSize: '1rem', fontWeight: 500, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>
              {l.label}
            </Link>
          ))}
          <Link href="/my-bookings" onClick={() => setOpen(false)}
            style={{ padding: '10px 0', fontSize: '1rem', fontWeight: 600, color: 'var(--green)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            My Bookings {pendingCount > 0 && <span style={{ background: 'var(--green)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 7px', borderRadius: '20px' }}>{pendingCount} pending</span>}
          </Link>
          {user && <button type="button" onClick={() => { setOpen(false); window.dispatchEvent(new Event(OPEN_PROFILE_EVENT)); }} style={{ padding: '10px 0', textAlign: 'left', background: 'transparent', fontSize: '1rem', fontWeight: 600, color: 'var(--green)', borderBottom: '1px solid var(--border)' }}>Profile</button>}
          <a href="tel:+919876543210" style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--green)' }}>
            <Phone size={16} /> +91 98765 43210
          </a>
        </div>
      )}
      <style>{`@media (max-width: 768px) { .desktop-nav { display: none !important; } .mobile-menu-btn { display: flex !important; } }`}</style>
    </nav>
  );
}
