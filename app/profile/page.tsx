'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Save, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSession, logout, updateProfile, type User } from '@/lib/auth';

type ProfileFields = Pick<User, 'name' | 'phone' | 'address'>;

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [fields, setFields] = useState<ProfileFields>({ name: '', phone: '', address: '' });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentUser = getSession();
    if (!currentUser) {
      router.replace('/login?next=%2Fprofile');
      return;
    }
    setUser(currentUser);
    setFields({ name: currentUser.name, phone: currentUser.phone || '', address: currentUser.address || '' });
  }, [router]);

  const startEditing = () => {
    if (!user) return;
    setFields({ name: user.name, phone: user.phone || '', address: user.address || '' });
    setError('');
    setSaved(false);
    setEditing(true);
  };

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    if (!fields.name.trim()) { setError('Enter your name.'); return; }
    if (!fields.phone.trim()) { setError('Enter your phone number.'); return; }
    const result = updateProfile({ name: fields.name.trim(), phone: fields.phone.trim(), address: fields.address.trim() });
    if (result.error || !result.user) { setError(result.error || 'Could not update your profile.'); return; }
    setUser(result.user);
    setFields({ name: result.user.name, phone: result.user.phone || '', address: result.user.address || '' });
    setEditing(false);
    setError('');
    setSaved(true);
  };

  const signOut = () => {
    logout();
    router.push('/');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 13px', border: '1.5px solid var(--border)',
    borderRadius: 8, fontSize: '0.95rem', marginTop: 6,
  };

  return <>
    <Navbar />
    <main style={{ padding: '120px 24px 72px', minHeight: '78vh', background: 'var(--bg-gray)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link href="/my-bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--green)', fontWeight: 600, marginBottom: 20 }}>
          <ArrowLeft size={16} /> My Bookings
        </Link>
        <section style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 32, boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
            <div>
              <span className="section-tag">Your Account</span>
              <h1 style={{ color: 'var(--navy)', marginBottom: 6 }}>Profile</h1>
              <p style={{ color: 'var(--text-muted)' }}>View and update your contact information.</p>
            </div>
            {user && !editing && <button type="button" onClick={startEditing} className="btn-outline" style={{ padding: '9px 15px' }}><Pencil size={15} /> Edit Profile</button>}
          </div>

          {saved && <p role="status" style={{ padding: '10px 12px', marginBottom: 18, borderRadius: 8, background: 'var(--green-light)', color: 'var(--green)' }}>Your profile was updated.</p>}

          {editing ? (
            <form onSubmit={saveProfile} style={{ display: 'grid', gap: 16 }}>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>Full name
                <input required autoComplete="name" value={fields.name} onChange={event => setFields({ ...fields, name: event.target.value })} style={inputStyle} />
              </label>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>Email
                <input type="email" value={user?.email || ''} readOnly style={{ ...inputStyle, background: '#f3f4f6', color: 'var(--text-muted)' }} />
              </label>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>Phone number
                <input required type="tel" autoComplete="tel" value={fields.phone} onChange={event => setFields({ ...fields, phone: event.target.value })} style={inputStyle} />
              </label>
              <label style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>Home address
                <textarea rows={3} autoComplete="street-address" value={fields.address} onChange={event => setFields({ ...fields, address: event.target.value })} style={{ ...inputStyle, resize: 'vertical' }} />
              </label>
              {error && <p role="alert" style={{ color: '#dc2626', fontSize: '0.88rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn-primary" type="submit"><Save size={16} /> Save Changes</button>
                <button className="btn-outline" type="button" onClick={() => { setEditing(false); setError(''); }}><X size={16} /> Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: 18 }}>
              <ProfileItem label="Full name" value={user?.name} />
              <ProfileItem label="Email" value={user?.email} />
              <ProfileItem label="Phone number" value={user?.phone} />
              <ProfileItem label="Home address" value={user?.address} />
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <Link href="/my-bookings" className="btn-outline">My Bookings</Link>
                <button type="button" onClick={signOut} style={{ background: 'transparent', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 16px', fontWeight: 600 }}>Sign Out</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
    <Footer />
  </>;
}

function ProfileItem({ label, value }: { label: string; value?: string }) {
  return <div>
    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
    <div style={{ color: 'var(--navy)', fontWeight: 600 }}>{value || 'Not provided'}</div>
  </div>;
}
