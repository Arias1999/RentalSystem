'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type ContactForm = { name: string; email: string; phone: string; message: string };
type CustomerMessage = { id: string; message: string; admin_reply: string | null; created_at: string; replied_at: string | null };

export default function ContactPage() {
  const router = useRouter();
  const [form, setForm] = useState<ContactForm>({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!user) return;
    setForm(current => ({
      ...current,
      name: current.name || user.name,
      email: current.email || user.email,
      phone: current.phone || user.phone || '',
    }));
  }, [user]);

  const loadMessages = useCallback(async () => {
    if (!user) { setMessages([]); return; }
    const { data, error } = await getSupabaseBrowserClient().from('customer_messages')
      .select('id, message, admin_reply, created_at, replied_at')
      .eq('customer_id', user.id).order('created_at', { ascending: false });
    if (error) { setMessageError(error.message); return; }
    setMessageError('');
    setMessages((data || []) as CustomerMessage[]);
  }, [user]);

  useEffect(() => {
    void loadMessages();
    if (!user) return;
    const timer = window.setInterval(() => void loadMessages(), 20000);
    window.addEventListener('focus', loadMessages);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', loadMessages); };
  }, [loadMessages, user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessageError('');
    setSent(false);
    if (!user) {
      router.push('/login?next=%2Fcontact');
      return;
    }
    setSending(true);
    const { error } = await getSupabaseBrowserClient().from('customer_messages').insert({
      customer_id: user.id,
      customer_name: form.name.trim(),
      customer_email: form.email.trim(),
      customer_phone: form.phone.trim() || null,
      message: form.message.trim(),
    });
    if (error) setMessageError(error.message);
    else {
      setSent(true);
      setForm(current => ({ ...current, message: '' }));
      await loadMessages();
    }
    setSending(false);
  };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.9rem' };

  return <>
    <Navbar />
    <main style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-gray)' }}>
      <div className="container" style={{ padding: '64px 24px' }}>
        <span className="section-tag">Contact Us</span><h1 className="section-title">Get in Touch</h1>
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 48, marginTop: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { icon: <MapPin size={20} />, title: 'Our Office', text: 'Sun valley V-Rama, Cebu City' },
              { icon: <Phone size={20} />, title: 'Phone', text: '+91 98765 43210' },
              { icon: <Mail size={20} />, title: 'Email', text: 'hello@driveeasy.in' },
              { icon: <Clock size={20} />, title: 'Business Hours', text: 'Mon–Sat: 8am – 8pm\nSun: 9am – 5pm' },
            ].map(item => <div key={item.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: '#fff', padding: 20, borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
              <div style={{ background: 'var(--green-light)', color: 'var(--green)', padding: 10, borderRadius: 8, flexShrink: 0 }}>{item.icon}</div>
              <div><div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--navy)' }}>{item.title}</div><div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{item.text}</div></div>
            </div>)}
          </div>
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 36, boxShadow: 'var(--shadow)' }}>
            {sent ? <div style={{ textAlign: 'center', padding: '40px 0' }}><div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div><h3 style={{ color: 'var(--navy)', marginBottom: 8 }}>Message Sent!</h3><p style={{ color: 'var(--text-muted)' }}>We’ll get back to you within 24 hours.</p></div> :
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Send Us a Message</h3>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Full Name<input required type="text" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, display: 'block', marginTop: 6 }} /></label>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Email<input required type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ ...inputStyle, display: 'block', marginTop: 6 }} /></label>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Phone<input required type="tel" placeholder="Your phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ ...inputStyle, display: 'block', marginTop: 6 }} /></label>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Message<textarea required rows={4} placeholder="How can we help you?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ ...inputStyle, display: 'block', marginTop: 6, resize: 'vertical' }} /></label>
                <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}><Send size={16} /> Send Message</button>
              </form>}
            {user && <section aria-labelledby="customer-messages-title" style={{ marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <h3 id="customer-messages-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--navy)', fontSize: '1.05rem', marginBottom: 16 }}><MessageCircle size={18} color="var(--green)" /> Your messages and replies</h3>
              {messages.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>Your messages and admin replies will appear here.</p> : <div style={{ display: 'grid', gap: 14 }}>
                {messages.map(item => <article key={item.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14, background: '#fff' }}>
                  <small style={{ display: 'block', color: 'var(--text-muted)', marginBottom: 8 }}>{new Date(item.created_at).toLocaleString()}</small>
                  <p style={{ color: 'var(--navy)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{item.message}</p>
                  <div style={{ marginTop: 12, borderLeft: '3px solid var(--green)', background: 'var(--green-light)', padding: '10px 12px', borderRadius: '0 7px 7px 0' }}>
                    <strong style={{ display: 'block', color: 'var(--green)', fontSize: '0.78rem', marginBottom: 4 }}>DriveEasy Support</strong>
                    <p style={{ color: item.admin_reply ? 'var(--navy)' : 'var(--text-muted)', fontSize: '0.86rem', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{item.admin_reply || 'Waiting for an admin response.'}</p>
                  </div>
                </article>)}
              </div>}
            </section>}
          </div>
        </div>
      </div>
    </main>
    <Footer />
    <style>{`@media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr !important; gap: 28px !important; } }`}</style>
  </>;
}
