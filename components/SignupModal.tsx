'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, X } from 'lucide-react';
import { register, resendSignupCode, verifySignupCode } from '@/lib/auth';
import { OPEN_LOGIN_EVENT } from '@/components/LoginModal';

export const OPEN_SIGNUP_EVENT = 'driveeasy:open-signup';

type SignupModalProps = { autoOpen?: boolean };

export default function SignupModal({ autoOpen = false }: SignupModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const show = () => { setOpen(true); setSuccess(''); setError(''); };
    window.addEventListener(OPEN_SIGNUP_EVENT, show);
    if (autoOpen) show();
    return () => window.removeEventListener(OPEN_SIGNUP_EVENT, show);
  }, [autoOpen]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) setOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('signup-modal-open');
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.classList.remove('signup-modal-open'); };
  }, [open, busy]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setSuccess('');
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      const result = await register(name.trim(), email.trim(), password, phone.trim(), { address: address.trim() });
      if (result.error) { setError(result.error); return; }
      if (result.needsEmailConfirmation) { setAwaitingCode(true); setSuccess(`Account created. Enter the 6-digit code sent to ${email.trim()}.`); return; }
      setSuccess('Your account was created successfully. Welcome to DriveEasy!');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Account creation failed. Please try again.'); }
    finally { setBusy(false); }
  };

  const verify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setSuccess('');
    if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit code from your email.'); return; }
    setBusy(true);
    try {
      const result = await verifySignupCode(email.trim(), otp);
      if (result.error) { setError(result.error); return; }
      setOpen(false);
      router.replace('/');
      window.dispatchEvent(new CustomEvent(OPEN_LOGIN_EVENT, { detail: { next: '/' } }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Verification failed. Please try again.'); }
    finally { setBusy(false); }
  };

  const resend = async () => {
    setBusy(true); setError('');
    try { const result = await resendSignupCode(email.trim()); if (result.error) setError(result.error); else setSuccess(`A new 6-digit code was sent to ${email.trim()}.`); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not resend the code. Please try again.'); }
    finally { setBusy(false); }
  };

  if (!open) return null;
  return <div className="signup-overlay" onMouseDown={event => { if (event.target === event.currentTarget && !busy) setOpen(false); }}>
    <section className="signup-card" role="dialog" aria-modal="true" aria-labelledby="signup-title">
      <button className="signup-close" type="button" onClick={() => setOpen(false)} aria-label="Close sign up" disabled={busy}><X size={21} /></button>
      <span className="signup-pill">JOIN DRIVEEASY</span>
      <h2 id="signup-title">{success && !awaitingCode ? 'You’re all set!' : 'Create your account'}</h2>
      <p className="signup-subtitle">{awaitingCode ? 'Check your inbox and enter the verification code.' : 'Enter your contact details to create your account.'}</p>
      {success && <p className="signup-message success" role="status">{success}</p>}
      {success && !awaitingCode ? <div className="signup-success-actions"><button className="signup-dismiss" type="button" onClick={() => setOpen(false)}>Close</button></div> : awaitingCode ? <form className="signup-form" onSubmit={verify}>
        <label>6-digit email code<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} /></label>
        {error && <p className="signup-message error" role="alert">{error}</p>}
        <button className="signup-submit" type="submit" disabled={busy}>{busy ? 'Verifying…' : 'Verify code'}</button>
        <button className="signup-resend" type="button" onClick={resend} disabled={busy}>Resend code</button>
      </form> : <form className="signup-form" onSubmit={submit}>
        <label>Full name<input required autoComplete="name" value={name} onChange={event => setName(event.target.value)} /></label>
        <label>Email<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></label>
        <label>Phone number<input required type="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} /></label>
        <label>Home address<textarea required autoComplete="street-address" rows={2} value={address} onChange={event => setAddress(event.target.value)} /></label>
        <label>Password<span className="signup-password"><input required type={showPassword ? 'text' : 'password'} minLength={8} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span><small>Use at least 8 characters.</small></label>
        <label>Confirm password<input required type={showPassword ? 'text' : 'password'} minLength={8} autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /></label>
        {error && <p className="signup-message error" role="alert">{error}</p>}
        <button className="signup-submit" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create Account'}</button>
      </form>}
      {!success && <p className="signup-login">Already have an account? <button type="button" onClick={() => { setOpen(false); window.dispatchEvent(new Event(OPEN_LOGIN_EVENT)); }}>Sign in</button></p>}
    </section>
  </div>;
}
