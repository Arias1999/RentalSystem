'use client';
import { useState } from 'react';
import { X } from 'lucide-react';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div style={{ background: 'var(--green)', color: '#fff', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', fontSize: '0.875rem', position: 'relative' }}>
      <span>For modern website design, contact us</span>
      <a href="/contact" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '4px 14px', borderRadius: '20px', fontWeight: 600, fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.4)', transition: 'background 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.35)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}>
        Get a Free Quote
      </a>
      <button onClick={() => setVisible(false)} style={{ position: 'absolute', right: '16px', background: 'none', color: '#fff', padding: '4px', display: 'flex', alignItems: 'center' }}>
        <X size={16} />
      </button>
    </div>
  );
}
