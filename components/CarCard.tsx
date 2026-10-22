'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Fuel, Settings, Eye, ArrowRight } from 'lucide-react';
import type { Car } from '@/lib/cars';
import { getSession } from '@/lib/auth';

export default function CarCard({ car, bookingParams, rentalDays = 1 }: { car: Car; bookingParams?: Record<string, string>; rentalDays?: number }) {
  const router = useRouter();
  const detailQuery = new URLSearchParams(Object.entries(bookingParams || {}).filter(([, value]) => value));
  const queryString = detailQuery.toString();
  const detailHref = `/cars/${car.id}${queryString ? `?${queryString}` : ''}`;
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', transition: 'transform 0.25s, box-shadow 0.25s', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.14)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}>

      {/* Image */}
      <div style={{ position: 'relative', height: '180px', overflow: 'hidden', flexShrink: 0 }}>
        <img src={car.image} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <span style={{ position: 'absolute', top: '12px', left: '12px', background: car.available ? 'var(--green)' : '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>
          {car.available ? 'Available' : 'Unavailable'}
        </span>
        <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>
          {car.category}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '10px', fontSize: '1rem' }}>{car.name}</h3>

        {/* Specs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px' }}>
          {[
            { icon: <Settings size={12} />, label: car.transmission },
            { icon: <Users size={12} />, label: `${car.seats} Seats` },
            { icon: <Fuel size={12} />, label: car.fuel },
            { icon: <span style={{ fontSize: '0.7rem' }}>🏷️</span>, label: car.category },
          ].map(s => (
            <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--green)' }}>{s.icon}</span> {s.label}
            </span>
          ))}
        </div>

        {/* Price */}
        <div style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--green)' }}>₱{car.price.toLocaleString()}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/day</span>
          <div style={{ color: 'var(--navy)', fontSize: '0.85rem', fontWeight: 700, marginTop: 4 }}>₱{(car.price * rentalDays).toLocaleString()} estimated for {rentalDays} day{rentalDays === 1 ? '' : 's'}</div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <Link href={detailHref} onClick={event => { if (!getSession()) { event.preventDefault(); router.push(`/login?next=${encodeURIComponent(detailHref)}`); } }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '8px', border: '1.5px solid var(--green)', color: 'var(--green)', fontWeight: 600, fontSize: '0.82rem', background: 'transparent', textDecoration: 'none', transition: 'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--green-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <Eye size={14} /> View Details
          </Link>
          <Link href={car.available ? `${detailHref}${detailHref.includes('?') ? '&' : '?'}book=1` : '#'} onClick={event => { if (car.available && !getSession()) { event.preventDefault(); const href = `${detailHref}${detailHref.includes('?') ? '&' : '?'}book=1`; router.push(`/login?next=${encodeURIComponent(href)}`); } }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '8px', background: car.available ? 'var(--green)' : '#e5e7eb', color: car.available ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none', pointerEvents: car.available ? 'auto' : 'none' }}>
            Book Now <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
