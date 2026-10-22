'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

type ContactForm = { name: string; email: string; phone: string; message: string };

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); setSent(true); };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.9rem' };

  return <>
    <Navbar />
    <main style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--bg-gray)' }}>
      <div className="container" style={{ padding: '64px 24px' }}>
        <span className="section-tag">Contact Us</span><h1 className="section-title">Get in Touch</h1>
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 48, marginTop: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { icon: <MapPin size={20} />, title: 'Our Office', text: 'Sun valley V-Rama,Cebu City – 110016' },
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
          </div>
        </div>
      </div>
    </main>
    <Footer />
    <style>{`@media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr !important; gap: 28px !important; } }`}</style>
  </>;
}
