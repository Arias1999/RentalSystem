'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { register } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [next, setNext] = useState('/my-bookings');

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('next');
    if (requested?.startsWith('/') && !requested.startsWith('//')) setNext(requested);
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    const result = register(name.trim(), email.trim(), password, phone.trim(), { address: address.trim() });
    if (result.error) { setError(result.error); return; }
    router.push(next);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 13px', border: '1.5px solid var(--border)',
    borderRadius: 8, fontSize: '0.95rem', marginTop: 6,
  };

  return <>
    <Navbar />
    <main style={{ padding: '120px 24px 72px', minHeight: '78vh', background: 'var(--bg-gray)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', background: '#fff', borderRadius: 'var(--radius)', padding: 32, boxShadow: 'var(--shadow)' }}>
        <span className="section-tag">Join DriveEasy</span>
        <h1 style={{ color: 'var(--navy)', marginBottom: 8 }}>Create your account</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Enter your contact details to create your account.</p>
        <form onSubmit={submit} style={{ display: 'grid', gap: 15 }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Full name
            <input required autoComplete="name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Email
            <input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Phone number
            <input required type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Home address
            <textarea required autoComplete="street-address" rows={2} value={address} onChange={e => setAddress(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
          </label>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Password
            <input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Confirm password
            <input required type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} />
          </label>
          {error && <p role="alert" style={{ color: '#dc2626', fontSize: '0.88rem' }}>{error}</p>}
          <button className="btn-primary" type="submit" style={{ justifyContent: 'center' }}>Create Account</button>
        </form>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 20, fontSize: '0.9rem' }}>
          Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} style={{ color: 'var(--green)', fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </main>
    <Footer />
  </>;
}
