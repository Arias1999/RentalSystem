'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Destinations from '@/components/Destinations';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import type { MapLocation } from '@/components/MapView';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

interface Location {
  city: string;
  address: string;
  hours: string;
  image: string;
  lat: number;
  lng: number;
}

const LOCATIONS: Location[] = [
  { city: 'Carcar', address: 'Carcar Public Market Area, Carcar City', hours: '7am – 9pm', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', lat: 10.1053, lng: 123.6394 },
  { city: 'Argao', address: 'Argao Town Center, Argao', hours: '7am – 8pm', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80', lat: 9.8808, lng: 123.6097 },
  { city: 'Dalaguete', address: 'Dalaguete Municipal Hall Area', hours: '8am – 7pm', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80', lat: 9.7617, lng: 123.5358 },
  { city: 'Oslob', address: 'Oslob Whale Shark Area, Tan-awan', hours: '6am – 6pm', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80', lat: 9.5177, lng: 123.3944 },
  { city: 'Moalboal', address: 'Panagsama Beach Road, Moalboal', hours: '7am – 9pm', image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600&q=80', lat: 9.9333, lng: 123.3972 },
  { city: 'Badian', address: 'Kawasan Falls Junction, Badian', hours: '7am – 8pm', image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80', lat: 9.8667, lng: 123.3944 },
];

export default function LocationsPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const viewOnMap = (city: string) => {
    setSelected(city);
    document.getElementById('locations-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const mapLocations: MapLocation[] = LOCATIONS.map(l => ({
    name: l.city, address: l.address, lat: l.lat, lng: l.lng,
  }));

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-gray)' }}>

        {/* Hero banner */}
        <div style={{ background: 'var(--navy)', padding: '60px 24px', textAlign: 'center' }}>
          <div className="container">
            <span className="section-tag">Our Locations</span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#fff', margin: '12px 0 16px' }}>Find Us Near You</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '520px', margin: '0 auto' }}>
              Pick up your car at any of our South Cebu locations — from Carcar down to Badian.
            </p>
          </div>
        </div>

        {/* Map + Cards layout */}
        <div className="container" style={{ padding: '56px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            {LOCATIONS.map(loc => (
              <div key={loc.city}
                onClick={() => setSelected(loc.city)}
                style={{ background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', cursor: 'pointer', transition: 'transform 0.25s, box-shadow 0.25s', outline: selected === loc.city ? '2px solid var(--green)' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                <img src={loc.image} alt={loc.city} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                <div style={{ padding: '18px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px', color: 'var(--navy)' }}>{loc.city}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><MapPin size={14} color="var(--green)" style={{ marginTop: '2px', flexShrink: 0 }} />{loc.address}</span>
                    <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Clock size={14} color="var(--green)" />{loc.hours}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <a href={`/cars`} className="btn-primary" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.82rem' }}>
                      Browse Cars <ArrowRight size={13} />
                    </a>
                    <button onClick={e => { e.stopPropagation(); viewOnMap(loc.city); }}
                      style={{ padding: '8px 14px', borderRadius: '8px', border: '1.5px solid var(--green)', background: 'transparent', color: 'var(--green)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                      View on Map
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          <div id="locations-map" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', height: '480px', background: '#e5e7eb', scrollMarginTop: '90px' }}>
            <MapView locations={mapLocations} selected={selected} />
          </div>
          {selected && (
            <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing <strong>{selected}</strong> on the map.{' '}
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                Reset
              </button>
            </p>
          )}
        </div>

        <Destinations />
      </div>
      <Footer />
    </>
  );
}
