'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { login } from '@/lib/auth';

export const OPEN_LOGIN_EVENT = 'driveeasy:open-login';

export default function LoginModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nextPath, setNextPath] = useState('/my-bookings');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const show = (event: Event) => {
      const requested = (event as CustomEvent<{ next?: string }>).detail?.next;
      setNextPath(requested?.startsWith('/') && !requested.startsWith('//') ? requested : '/my-bookings');
      setError('');
      setOpen(true);
    };
    window.addEventListener(OPEN_LOGIN_EVENT, show);
    return () => window.removeEventListener(OPEN_LOGIN_EVENT, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) setOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('signup-modal-open');
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.classList.remove('signup-modal-open'); };
  }, [open, busy]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const result = await login(email.trim(), password);
      if (result.error) { setError(result.error); return; }
      setOpen(false);
      router.push(result.isAdmin ? '/admin' : nextPath);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Sign in failed. Please try again.'); }
    finally { setBusy(false); }
  };

  if (!open) return null;
  return <div className="signup-overlay" onMouseDown={event => { if (event.target === event.currentTarget && !busy) setOpen(false); }}>
    <section className="signup-card login-modal-card" role="dialog" aria-modal="true" aria-labelledby="login-title">
      <button className="signup-close" type="button" onClick={() => setOpen(false)} aria-label="Close sign in" disabled={busy}><X size={21} /></button>
      <span className="signup-pill">WELCOME BACK</span>
      <h2 id="login-title">Sign in to DriveEasy</h2>
      <p className="signup-subtitle">Sign in to confirm your car rental booking.</p>
      <form className="signup-form login-modal-form" onSubmit={submit}>
        <label>Email<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></label>
        <label>Password<input required type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} /></label>
        {error && <p className="signup-message error" role="alert">{error}</p>}
        <button className="signup-submit" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
      </form>
      <p className="signup-login">New to DriveEasy? <button type="button" onClick={() => { setOpen(false); window.dispatchEvent(new Event('driveeasy:open-signup')); }}>Create an account</button></p>
    </section>
  </div>;
}
