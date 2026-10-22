'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Car, MapPin, Phone, ArrowRight, Users, BusFront } from 'lucide-react';

const VEHICLES = [
  { icon: <Car size={22} />, name: 'Economy cars', detail: 'Practical rides for everyday trips and couples.' },
  { icon: <Car size={22} />, name: 'Sedans', detail: 'A comfortable choice for longer drives.' },
  { icon: <Car size={22} />, name: 'SUVs & MUVs', detail: 'Extra room for family, friends, and luggage.' },
  { icon: <BusFront size={22} />, name: 'Group vans', detail: 'Space for barkada trips and bigger groups.', image: 'https://images.unsplash.com/photo-1691358999346-0e727f002902?w=700&q=85' },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px', minHeight: '100vh' }}>
        <section style={{ background: 'var(--navy)', color: '#fff', padding: '76px 24px 84px', textAlign: 'center' }}>
          <div className="container">
            <span className="section-tag">About DriveEasy</span>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, margin: '12px 0 18px' }}>Car Rental for Your South Cebu Trip</h1>
            <p style={{ color: 'rgba(255,255,255,0.72)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Choose a vehicle that fits your trip, then explore South Cebu from Carcar to the coast at your own pace.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '28px' }}>
              <Link href="/cars" className="btn-primary" style={{ display: 'inline-flex' }}>Browse Vehicles <ArrowRight size={16} /></Link>
              <Link href="/locations" className="btn-outline" style={{ borderColor: 'rgba(255,255,255,0.65)', color: '#fff', display: 'inline-flex' }}>Find Pickup Locations <MapPin size={16} /></Link>
            </div>
          </div>
        </section>

        <section className="container" style={{ padding: '64px 24px' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto 38px', textAlign: 'center' }}>
            <span className="section-tag">Our Vehicles</span>
            <h2 className="section-title">Pick the right ride for your group</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>From a compact car for a quick getaway to a roomy van for a group outing, DriveEasy offers rental options for different kinds of South Cebu trips.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
            {VEHICLES.map(vehicle => (
              <div key={vehicle.name} style={{ borderRadius: 'var(--radius)', background: 'var(--bg-gray)', overflow: 'hidden' }}>
                {'image' in vehicle && <img src={vehicle.image} alt="Passenger van for group travel" style={{ display: 'block', width: '100%', height: '150px', objectFit: 'cover' }} />}
                <div style={{ padding: '24px' }}>
                  <div style={{ color: 'var(--green)', marginBottom: '14px' }}>{vehicle.icon}</div>
                  <h3 style={{ color: 'var(--navy)', fontSize: '1.05rem', marginBottom: '7px' }}>{vehicle.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{vehicle.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: 'var(--bg-gray)', padding: '64px 24px' }}>
          <div className="container about-location" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            <div>
              <span className="section-tag">Where to Find Us</span>
              <h2 className="section-title">Pickup locations across South Cebu</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '22px' }}>
                Check the locations page to see pickup areas, addresses, and the map. The listed areas include Carcar, Argao, Dalaguete, Oslob, Moalboal, and Badian.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link href="/locations" className="btn-primary" style={{ display: 'inline-flex' }}><MapPin size={16} /> View Locations</Link>
                <Link href="/contact" className="btn-outline" style={{ display: 'inline-flex' }}><Phone size={16} /> Contact Us</Link>
              </div>
            </div>
            <div style={{ minHeight: '280px', borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative' }}>
              <img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=900&q=85" alt="Coastal road in the Philippines" style={{ width: '100%', height: '100%', minHeight: '280px', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(15,31,46,0.55), transparent 65%)' }} />
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: '#fff', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 700 }}><Users size={18} /> Your South Cebu journey starts here</div>
            </div>
          </div>
        </section>

        <section className="container" style={{ padding: '64px 24px 72px' }}>
          <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius)', padding: 'clamp(28px, 5vw, 48px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '28px', flexWrap: 'wrap' }}>
            <div style={{ maxWidth: '620px' }}>
              <span className="section-tag">Contact DriveEasy</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, margin: '4px 0 12px' }}>Need help choosing a vehicle?</h2>
              <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>Ask us about vehicle availability, booking details, or pickup areas across South Cebu. Send a message through our contact form and we'll be glad to help.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn-primary" style={{ display: 'inline-flex' }}><Phone size={16} /> Contact Us <ArrowRight size={16} /></Link>
              <Link href="/locations" className="btn-outline" style={{ borderColor: 'rgba(255,255,255,0.65)', color: '#fff', display: 'inline-flex' }}><MapPin size={16} /> Pickup Areas</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <style>{`@media (max-width: 768px) { .about-location { grid-template-columns: 1fr !important; gap: 28px !important; } }`}</style>
    </>
  );
}
