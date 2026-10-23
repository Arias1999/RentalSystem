'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Save, X } from 'lucide-react';
import { getSession, logout, updateProfile, type User } from '@/lib/auth';

export const OPEN_PROFILE_EVENT = 'driveeasy:open-profile';
type ProfileFields = Pick<User, 'name' | 'phone' | 'address'>;

export default function ProfileModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [fields, setFields] = useState<ProfileFields>({ name: '', phone: '', address: '' });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const show = () => {
      setOpen(true);
      setLoading(true);
      setEditing(false);
      setError('');
      setSaved(false);
      void getSession().then(currentUser => {
        if (!currentUser) {
          setOpen(false);
          router.push('/login?next=%2Fprofile');
          return;
        }
        setUser(currentUser);
        setFields({ name: currentUser.name, phone: currentUser.phone || '', address: currentUser.address || '' });
      }).catch(cause => setError(cause instanceof Error ? cause.message : 'Could not load your profile.'))
        .finally(() => setLoading(false));
    };
    window.addEventListener(OPEN_PROFILE_EVENT, show);
    return () => window.removeEventListener(OPEN_PROFILE_EVENT, show);
  }, [router]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('signup-modal-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('signup-modal-open');
    };
  }, [open]);

  const startEditing = () => {
    if (!user) return;
    setFields({ name: user.name, phone: user.phone || '', address: user.address || '' });
    setError('');
    setSaved(false);
    setEditing(true);
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!fields.name.trim()) { setError('Enter your name.'); return; }
    if (!fields.phone.trim()) { setError('Enter your phone number.'); return; }
    const result = await updateProfile({ name: fields.name.trim(), phone: fields.phone.trim(), address: fields.address.trim() });
    if (result.error || !result.user) { setError(result.error || 'Could not update your profile.'); return; }
    setUser(result.user);
    setFields({ name: result.user.name, phone: result.user.phone || '', address: result.user.address || '' });
    setEditing(false);
    setSaved(true);
  };

  const signOut = async () => {
    await logout();
    setOpen(false);
    router.push('/');
  };

  if (!open) return null;

  return <div className="signup-overlay profile-modal-overlay" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}>
    <section className="signup-card profile-modal-card" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
      <button className="signup-close" type="button" onClick={() => setOpen(false)} aria-label="Close profile"><X size={21} /></button>
      <span className="signup-pill">YOUR ACCOUNT</span>
      <div className="profile-modal-heading">
        <div><h2 id="profile-modal-title">My Profile</h2><p className="signup-subtitle">View and update your contact information.</p></div>
        {user && !editing && <button type="button" onClick={startEditing} className="btn-outline profile-edit-button"><Pencil size={15} /> Edit</button>}
      </div>
      {loading ? <p className="profile-modal-status">Loading profile…</p> : error && !editing ? <p className="signup-message error" role="alert">{error}</p> : editing ? (
        <form className="profile-modal-form" onSubmit={saveProfile}>
          <label>Full name<input required autoComplete="name" value={fields.name} onChange={event => setFields(current => ({ ...current, name: event.target.value }))} /></label>
          <label>Email<input type="email" value={user?.email || ''} readOnly /></label>
          <label>Phone number<input required type="tel" autoComplete="tel" value={fields.phone} onChange={event => setFields(current => ({ ...current, phone: event.target.value }))} /></label>
          <label>Home address<textarea rows={3} autoComplete="street-address" value={fields.address} onChange={event => setFields(current => ({ ...current, address: event.target.value }))} /></label>
          {error && <p className="signup-message error" role="alert">{error}</p>}
          <div className="profile-modal-actions"><button className="signup-submit" type="submit"><Save size={16} /> Save Changes</button><button className="profile-cancel" type="button" onClick={() => { setEditing(false); setError(''); }}>Cancel</button></div>
        </form>
      ) : (
        <div className="profile-modal-details">
          <ProfileItem label="Full name" value={user?.name} /><ProfileItem label="Email" value={user?.email} />
          <ProfileItem label="Phone number" value={user?.phone} /><ProfileItem label="Home address" value={user?.address} />
          {saved && <p className="signup-message success" role="status">Your profile was updated.</p>}
          <div className="profile-modal-actions"><button className="profile-cancel" type="button" onClick={() => { setOpen(false); router.push('/my-bookings'); }}>My Bookings</button><button className="profile-signout" type="button" onClick={() => void signOut()}>Sign Out</button></div>
        </div>
      )}
    </section>
  </div>;
}

function ProfileItem({ label, value }: { label: string; value?: string }) {
  return <div className="profile-modal-item"><span>{label}</span><strong>{value || 'Not provided'}</strong></div>;
}
