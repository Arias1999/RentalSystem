'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MapPin, X } from 'lucide-react';

interface Spot {
  name: string;
  type: string;
  description?: string;
  location?: string;
  cost?: string;
}

interface Destination {
  name: string;
  image: string;
  tag: string;
  spots: Spot[];
}

const DESTINATIONS: Destination[] = [
  {
    name: 'Sibonga', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80', tag: 'Religious',
    spots: [{ name: 'Simala Shrine', type: 'Pilgrimage' }, { name: 'Simala Parish Church', type: 'Heritage' }],
  },
  {
    name: 'Argao', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', tag: 'Heritage',
    spots: [{ name: 'Argao Church', type: 'Heritage' }, { name: 'Argao Heritage Park', type: 'Park' }, { name: 'Coastal Viewpoints', type: 'Scenic' }],
  },
  {
    name: 'Dalaguete', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80', tag: 'Mountain',
    spots: [{ name: 'Osmeña Peak', type: 'Mountain' }, { name: 'Casino Peak', type: 'Mountain' }, { name: 'Casay Beach Park', type: 'Beach' }, { name: 'Obong Spring', type: 'Spring' }],
  },
  {
    name: 'Alcoy', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80', tag: 'Beach',
    spots: [
      { name: 'Tingko Beach', type: 'Beach', description: 'White sand, clear water, swimming, cottages, and beach photography. Best for barkada outings and family trips.', location: 'Daan-Lungsod / Guiwang, Alcoy', cost: 'Public beach entrance fee may apply.' },
      { name: 'Nug-as Sea of Clouds', type: 'Viewpoint', description: 'A mountain viewpoint where you may see clouds covering the valleys at sunrise. Arrive early; the view depends on the weather.', location: 'Upland Alcoy' },
      { name: 'Nug-as Forest Reserve', type: 'Nature', description: 'A forest destination known for birdwatching, including the Cebu black shama or siloy. Contact the local tourism office before visiting to arrange access or a guide if needed.' },
      { name: 'Baluarte of Alcoy', type: 'Heritage', description: 'A historic coastal watchtower, suitable for a short heritage stop and photos while exploring the Tingko area.' },
      { name: 'Alcoy Seawall', type: 'Scenic', description: 'A simple seaside stop for ocean views, relaxing, and taking pictures.' },
      { name: 'Voda Krasna Resort', type: 'Resort', description: 'A beachfront resort with accommodations, a swimming pool, and dining options. Suitable for a more comfortable beach day or overnight stay.', location: 'Tingko Beach, Alcoy' },
      { name: 'Larville Pool Garden Resort', type: 'Resort', description: 'A pool and garden destination for families and friends who want a relaxing outing. Check current entrance rates and availability before going.' },
      { name: 'Coastal Rock Resort', type: 'Resort', description: 'A beachfront option with pool facilities and ocean views, suitable for groups and overnight stays.' },
      { name: 'Santa Rosa de Lima Parish Church', type: 'Church', description: 'Visit the local parish church for a quiet cultural and religious stop.' },
      { name: 'Diving & Snorkeling Spots', type: 'Diving', description: 'Explore marine life and coral reefs around the coast. Arrange a dive or snorkeling trip with a local operator and follow marine-safety guidance.' },
    ],
  },
  {
    name: 'Boljoon', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', tag: 'Heritage',
    spots: [{ name: 'Boljoon Church', type: 'Heritage' }, { name: 'Ili Rock', type: 'Scenic' }, { name: 'Coastal Viewpoints', type: 'Scenic' }],
  },
  {
    name: 'Oslob', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80', tag: 'Whale Sharks',
    spots: [{ name: 'Whale Shark Watching', type: 'Wildlife' }, { name: 'Tumalog Falls', type: 'Waterfall' }, { name: 'Sumilon Island & Sandbar', type: 'Island' }, { name: 'Cuartel Ruins', type: 'Heritage' }, { name: 'Oslob Heritage Church', type: 'Heritage' }],
  },
  {
    name: 'Samboan', image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600&q=80', tag: 'Waterfalls',
    spots: [{ name: 'Aguinid Falls', type: 'Waterfall' }, { name: 'Dao Falls', type: 'Waterfall' }, { name: 'Binalayan Hidden Falls', type: 'Waterfall' }, { name: 'St. Michael Archangel Church', type: 'Heritage' }, { name: "St. Jacob's Ladder", type: 'Scenic' }],
  },
  {
    name: 'Ginatilan', image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80', tag: 'Waterfalls',
    spots: [{ name: 'Inambakan Falls', type: 'Waterfall' }, { name: 'Kampael Falls', type: 'Waterfall' }, { name: 'Coastal Viewpoints', type: 'Scenic' }],
  },
  {
    name: 'Alegria', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80', tag: 'Canyoneering',
    spots: [{ name: 'Cambais Falls', type: 'Waterfall' }, { name: 'Alegria Canyoneering', type: 'Adventure' }, { name: 'Mountain & River Scenery', type: 'Scenic' }],
  },
  {
    name: 'Badian', image: '/images/badian.png', tag: 'Kawasan Falls',
    spots: [{ name: 'Kawasan Falls', type: 'Waterfall' }, { name: 'Lambug Beach', type: 'Beach' }, { name: 'Badian Highlands', type: 'Mountain' }, { name: 'Canyoneering', type: 'Adventure' }],
  },
  {
    name: 'Moalboal', image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600&q=80', tag: 'Diving',
    spots: [{ name: 'White Beach (Basdaku)', type: 'Beach' }, { name: 'Sardine Run', type: 'Wildlife' }, { name: 'Pescador Island', type: 'Island' }, { name: 'Panagsama Beach', type: 'Beach' }, { name: 'Sea Turtle Snorkeling', type: 'Diving' }],
  },
  {
    name: 'Barili', image: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=600&q=80', tag: 'Waterfall',
    spots: [{ name: 'Mantayupan Falls', type: 'Waterfall' }, { name: 'Barili Church', type: 'Heritage' }, { name: 'Countryside Viewpoints', type: 'Scenic' }],
  },
  {
    name: 'Aloguinsan', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80', tag: 'River Tour',
    spots: [{ name: 'Bojo River', type: 'River' }, { name: "Hermit's Cove", type: 'Beach' }, { name: 'Mangrove Scenery', type: 'Nature' }],
  },
  {
    name: 'Santander', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', tag: 'Coastal',
    spots: [{ name: 'Coastal Beaches & Resorts', type: 'Beach' }, { name: 'Liloan Port (Ferry to Negros)', type: 'Port' }, { name: 'Marine & Snorkeling Areas', type: 'Diving' }],
  },
];

const FEATURED_DESTINATIONS = ['Badian', 'Oslob', 'Moalboal'];

const TYPE_COLORS: Record<string, string> = {
  Waterfall: '#e0f2fe', Beach: '#fef9c3', Mountain: '#dcfce7', Heritage: '#fce7f3',
  Wildlife: '#ede9fe', Island: '#e0f2fe', Adventure: '#ffedd5', Diving: '#cffafe',
  River: '#d1fae5', Nature: '#dcfce7', Scenic: '#f0fdf4', Resort: '#fef3c7',
  Pilgrimage: '#fce7f3', Park: '#dcfce7', Spring: '#cffafe', Port: '#e0e7ff',
  Viewpoint: '#f0fdf4', Church: '#fce7f3',
  'Must Visit': '#fef9c3',
};

export default function Destinations({ showAll = false }: { showAll?: boolean }) {
  const visibleDestinations = showAll
    ? DESTINATIONS
    : DESTINATIONS.filter(destination => FEATURED_DESTINATIONS.includes(destination.name));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex === null || selectedIndex >= visibleDestinations.length ? null : visibleDestinations[selectedIndex];
  const isJourneyEnd = selectedIndex === visibleDestinations.length;

  return (
    <section id="destinations" style={{ padding: '80px 0', background: 'var(--bg-gray)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-tag">South Cebu</span>
          <h2 className="section-title">Drive to Your Next Journey</h2>
          <p className="section-desc" style={{ margin: '0 auto', textAlign: 'center' }}>
            Explore 14 stunning destinations from Carcar to Santander — waterfalls, beaches, mountains & more.
          </p>
        </div>

        {/* Grid */}
        <div className="destinations-grid">
          {visibleDestinations.map(d => (
            <div key={d.name}
              onClick={() => setSelectedIndex(visibleDestinations.indexOf(d))}
              style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', height: '220px', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget.querySelector('img') as HTMLImageElement).style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { (e.currentTarget.querySelector('img') as HTMLImageElement).style.transform = 'scale(1)'; }}>
              <img src={d.image} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)' }} />
              <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--green)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>{d.tag}</span>
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>{d.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginTop: '2px' }}>{d.spots.length} spots</div>
                </div>
                <div style={{ background: 'var(--green)', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ArrowRight size={15} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {!showAll && <div className="destination-view-all-wrap"><Link href="/destinations" className="destination-view-all">View All <ArrowRight size={16} /></Link></div>}
      </div>

      {/* Modal */}
      {(selected || isJourneyEnd) && (
        <div className="destination-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setSelectedIndex(null)}>
          {isJourneyEnd ? (
            <div className="destination-final-panel" onClick={e => e.stopPropagation()}>
              <span className="section-tag">South Cebu with DriveEasy</span>
              <h2>Drive to Your Next Journey</h2>
              <p>Discover more beautiful destinations in Southern Cebu with DriveEasy.</p>
              <div className="destination-modal-navigation destination-final-actions">
                <button className="destination-nav-button" onClick={() => setSelectedIndex(visibleDestinations.length - 1)}><ArrowLeft size={16} /> Back</button>
                <button className="destination-nav-button destination-nav-primary" onClick={() => setSelectedIndex(0)}>Explore Destinations <ArrowRight size={16} /></button>
              </div>
            </div>
          ) : selected && (
          <div className="destination-popup" style={{ background: '#fff', borderRadius: '16px', maxWidth: '520px', width: '100%', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}>
            {/* Modal image */}
            <div style={{ position: 'relative', height: '200px' }}>
              <img src={selected.image} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
              <button onClick={() => setSelectedIndex(null)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} />
              </button>
              <div style={{ position: 'absolute', bottom: '16px', left: '20px' }}>
                <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800 }}>{selected.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                  <MapPin size={12} /> {selected.name}, South Cebu, Philippines
                </div>
              </div>
            </div>

            {/* Spots list */}
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                Tourist Spots ({selected.spots.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
                {selected.spots.map((spot, i) => (
                  <div key={spot.name} style={{ background: TYPE_COLORS[spot.type] || '#f3f4f6', borderRadius: '10px', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: spot.description ? '6px' : 0 }}>
                      <span style={{ background: 'rgba(0,0,0,0.08)', color: 'var(--navy)', fontSize: '0.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: '20px' }}>{i + 1}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--navy)' }}>{spot.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{spot.type}</span>
                    </div>
                    {spot.description && <p style={{ fontSize: '0.78rem', color: '#444', margin: 0, lineHeight: 1.5 }}>{spot.description}</p>}
                    {spot.location && <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={10} /> {spot.location}</p>}
                    {spot.cost && <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>💰 {spot.cost}</p>}
                  </div>
                ))}
              </div>
              <div className="destination-modal-navigation">
                <button className="destination-nav-button" disabled={selectedIndex === 0} onClick={() => setSelectedIndex(index => Math.max(0, (index ?? 0) - 1))}><ArrowLeft size={16} /> Back</button>
                <button className="destination-nav-button destination-nav-primary" onClick={() => setSelectedIndex(index => index === null ? 0 : index + 1)}>
                  Next <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      )}
    </section>
  );
}
