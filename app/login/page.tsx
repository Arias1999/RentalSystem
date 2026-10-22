'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { login } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState('/my-bookings');
  const [hasNext, setHasNext] = useState(false);
  useEffect(() => { const requested = new URLSearchParams(window.location.search).get('next'); if (requested?.startsWith('/') && !requested.startsWith('//')) { setNext(requested); setHasNext(true); } }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await login(email.trim(), password);
      if (result.error) { setError(result.error); return; }
      router.push(result.isAdmin ? '/admin' : next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sign in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 13px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.95rem', marginTop: 6 };
  return <><Navbar /><main style={{ padding: '120px 24px 72px', minHeight: '78vh', background: 'var(--bg-gray)' }}><div style={{ maxWidth: 460, margin: '0 auto', background: '#fff', borderRadius: 'var(--radius)', padding: 32, boxShadow: 'var(--shadow)' }}>
    <span className="section-tag">Welcome Back</span><h1 style={{ color: 'var(--navy)', marginBottom: 8 }}>Sign in to DriveEasy</h1><p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Sign in to confirm your car rental booking.</p>
    <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}><label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Email<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} /></label><label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Password<input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} /></label>
    {error && <p role="alert" style={{ color: '#dc2626', fontSize: '0.88rem' }}>{error}</p>}<button className="btn-primary" type="submit" disabled={busy} style={{ justifyContent: 'center', opacity: busy ? 0.7 : 1 }}>{busy ? 'Signing in…' : 'Sign In'}</button></form>
    <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 20, fontSize: '0.9rem' }}>New to DriveEasy? <Link href={`/register?next=${encodeURIComponent(next)}`} style={{ color: 'var(--green)', fontWeight: 700 }}>Create an account</Link></p>
  </div></main><Footer /></>;
}
