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
  { city: 'Badian', address: 'Kawasan Falls Junction, Badian', hours: '7am – 8pm', image: '/images/badian.png', lat: 9.8667, lng: 123.3944 },
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
        <section className="locations-hero-cover">
          <div className="locations-hero-layout">
            <div className="locations-hero-copy">
            <span className="section-tag">Our Locations</span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#fff', margin: '12px 0 16px' }}>Find Us Near You</h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '520px', margin: '0 auto' }}>
              Pick up your car at any of our South Cebu locations — from Carcar down to Badian.
            </p>
            </div>
            <div>
              <div id="locations-map" className="locations-hero-map">
                <MapView locations={mapLocations} selected={selected} />
              </div>
              {selected && (
                <p className="locations-map-note">
                  Showing <strong>{selected}</strong> on the map.{' '}
                  <button onClick={() => setSelected(null)}>Reset</button>
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Map + Cards layout */}
        <div className="container locations-content">
          <div className="locations-grid">
            {LOCATIONS.map(loc => (
              <div key={loc.city} className="location-card"
                onClick={() => setSelected(loc.city)}
                style={{ background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', cursor: 'pointer', transition: 'transform 0.25s, box-shadow 0.25s', outline: selected === loc.city ? '2px solid var(--green)' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                <img src={loc.image} alt={loc.city} className="location-card-image" />
                <div className="location-card-content">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '10px', color: 'var(--navy)' }}>{loc.city}</h3>
                  <div className="location-card-details">
                    <span style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}><MapPin size={14} color="var(--green)" style={{ marginTop: '2px', flexShrink: 0 }} />{loc.address}</span>
                    <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Clock size={14} color="var(--green)" />{loc.hours}</span>
                  </div>
                  <div className="location-card-actions">
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

        </div>

        <Destinations />
      </div>
      <Footer />
    </>
  );
}
