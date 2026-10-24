'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { register, resendSignupCode, verifySignupCode } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [next, setNext] = useState('/my-bookings');

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('next');
    if (requested?.startsWith('/') && !requested.startsWith('//')) setNext(requested);
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await register(name.trim(), email.trim(), password, phone.trim(), { address: address.trim(), licenseNumber: licenseNumber.trim(), licenseExpiry });
      if (result.error) { setError(result.error); return; }
      if (result.needsEmailConfirmation) {
        setAwaitingCode(true);
        setNotice(`Account created. Enter the 6-digit code sent to ${email.trim()}.`);
        return;
      }
      router.push(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Account creation failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit code from your email.'); return; }
    setBusy(true);
    setError('');
    try {
      const result = await verifySignupCode(email.trim(), otp);
      if (result.error) { setError(result.error); return; }
      router.replace(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Code verification failed. Please try again.');
    } finally { setBusy(false); }
  };

  const resendCode = async () => {
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await resendSignupCode(email.trim());
      if (result.error) { setError(result.error); return; }
      setNotice(`A new 6-digit code was sent to ${email.trim()}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not resend the code. Please try again.');
    } finally { setBusy(false); }
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
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{awaitingCode ? 'Check your inbox and enter the verification code.' : 'Enter your contact details to create your account.'}</p>
        {awaitingCode ? <form onSubmit={verifyCode} style={{ display: 'grid', gap: 15 }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>6-digit email code
            <input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} style={{ width: '100%', padding: '11px 13px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '1.2rem', marginTop: 6, letterSpacing: '0.4em', textAlign: 'center' }} />
          </label>
          {error && <p role="alert" style={{ color: '#dc2626', fontSize: '0.88rem' }}>{error}</p>}
          {notice && <p role="status" style={{ color: 'var(--green)', fontSize: '0.88rem' }}>{notice}</p>}
          <button className="btn-primary" type="submit" disabled={busy} style={{ justifyContent: 'center', opacity: busy ? 0.7 : 1 }}>{busy ? 'Verifying…' : 'Verify code'}</button>
          <button type="button" onClick={resendCode} disabled={busy} style={{ border: 0, background: 'transparent', color: 'var(--green)', fontWeight: 700, cursor: 'pointer' }}>Resend code</button>
        </form> : <form onSubmit={submit} style={{ display: 'grid', gap: 15 }}>
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
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Driver’s license number
            <input required autoComplete="off" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Driver’s license expiry date
            <input required type="date" min={new Date().toISOString().slice(0, 10)} value={licenseExpiry} onChange={e => setLicenseExpiry(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Password
            <input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Confirm password
            <input required type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} />
          </label>
          {error && <p role="alert" style={{ color: '#dc2626', fontSize: '0.88rem' }}>{error}</p>}
          {notice && <p role="status" style={{ color: 'var(--green)', fontSize: '0.88rem' }}>{notice}</p>}
          <button className="btn-primary" type="submit" disabled={busy} style={{ justifyContent: 'center', opacity: busy ? 0.7 : 1 }}>{busy ? 'Creating account…' : 'Create Account'}</button>
        </form>}
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 20, fontSize: '0.9rem' }}>
          Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} style={{ color: 'var(--green)', fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </main>
    <Footer />
  </>;
}
