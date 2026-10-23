'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CarCard from '@/components/CarCard';
import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { ALL_CARS, CATEGORIES, TRANSMISSIONS, FUELS } from '@/lib/cars';

const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A–Z' },
];

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px 9px 34px', border: '1.5px solid var(--border)',
  borderRadius: '8px', fontSize: '0.875rem', outline: 'none', background: '#fff',
};
const sel: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)',
  borderRadius: '8px', fontSize: '0.875rem', outline: 'none', background: '#fff',
};

function CarsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const initialPickupDate = searchParams.get('pickupDate') || today;
  const promo = searchParams.get('promo') || '';
  const initialDays = Math.min(30, Math.max(1, Number(searchParams.get('days')) || (searchParams.get('dropDate') ? Math.ceil((new Date(`${searchParams.get('dropDate')}T12:00:00`).getTime() - new Date(`${initialPickupDate}T12:00:00`).getTime()) / 86400000) : 1)));
  const addDays = (date: string, count: number) => {
    const value = new Date(`${date}T12:00:00`);
    value.setDate(value.getDate() + count);
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  };

  const [pickup, setPickup]           = useState(searchParams.get('pickup') || '');
  const [dropoff, setDropoff]         = useState(searchParams.get('dropoff') || '');
  const [pickupDate, setPickupDate]   = useState(initialPickupDate);
  const [dropDate, setDropDate]       = useState(searchParams.get('dropDate') || addDays(initialPickupDate, initialDays));
  const [rentalDays, setRentalDays]   = useState(initialDays);
  const [pickupTime, setPickupTime]   = useState(searchParams.get('pickupTime') || '10:00');
  const [dropTime, setDropTime]       = useState(searchParams.get('dropTime') || '10:00');
  const [category, setCategory]       = useState(searchParams.get('type') || 'All');
  const [transmission, setTransmission] = useState('All');
  const [fuel, setFuel]               = useState('All');
  const [maxPrice, setMaxPrice]       = useState(10000);
  const [sort, setSort]               = useState('price-asc');
  const [search, setSearch]           = useState('');
  const [dateError, setDateError]     = useState('');
  const [locationError, setLocationError] = useState('');

  const handleDropDate = (v: string) => {
    if (v < pickupDate || (v === pickupDate && dropTime <= pickupTime)) { setDateError('Drop-off must be after pick-up'); return; }
    setDateError('');
    setDropDate(v);
    const selectedDays = Math.max(1, Math.ceil((new Date(`${v}T12:00:00`).getTime() - new Date(`${pickupDate}T12:00:00`).getTime()) / 86400000));
    setRentalDays(Math.min(30, selectedDays));
  };

  const handleRentalDays = (value: number) => {
    setRentalDays(value);
    setDropDate(addDays(pickupDate, value));
    setDateError('');
  };

  const applySearch = () => {
    if (!pickup.trim()) { setLocationError('Enter a pick-up location.'); return; }
    if (!pickupDate || !dropDate || dropDate < pickupDate || (dropDate === pickupDate && dropTime <= pickupTime)) {
      setDateError('Choose a drop-off time after pick-up.'); return;
    }
    setLocationError(''); setDateError('');
    const params = new URLSearchParams({ pickup, dropoff, pickupDate, pickupTime, dropDate, dropTime, days: String(rentalDays), promo });
    router.replace(`/cars?${params.toString()}`);
    window.requestAnimationFrame(() => document.getElementById('car-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const filtered = useMemo(() => {
    let list = ALL_CARS.filter(c =>
      (category === 'All' || c.category === category) &&
      (transmission === 'All' || c.transmission === transmission) &&
      (fuel === 'All' || c.fuel === fuel) &&
      c.price <= maxPrice &&
      (!pickup || ['carcar', 'argao', 'dalaguete', 'oslob', 'moalboal', 'badian', 'south cebu'].some(place => place.includes(pickup.trim().toLowerCase()) || pickup.trim().toLowerCase().includes(place))) &&
      (search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase()))
    );
    if (sort === 'price-asc')  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'name-asc')   list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [category, transmission, fuel, maxPrice, sort, search, pickup]);

  const clearFilters = () => {
    setPickup(''); setDropoff('');
    setCategory('All'); setTransmission('All'); setFuel('All');
    setMaxPrice(10000); setSearch(''); setSort('price-asc');
  };

  const hasFilters = pickup !== '' || category !== 'All' || transmission !== 'All' || fuel !== 'All' || maxPrice < 10000 || search !== '';

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-gray)' }}>
      {/* Search bar */}
      <div style={{ background: 'var(--navy)', padding: '32px 24px' }}>
        <div className="container">
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(1.4rem,3vw,2rem)', marginBottom: '20px' }}>Find Your Perfect Car</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: '#fff', borderRadius: '12px', padding: '16px' }}>
            {/* Pickup location */}
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Pick-up Location</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--green)' }} />
                <input list="south-cebu-pickups" value={pickup} onChange={e => { setPickup(e.target.value); setLocationError(''); }} placeholder="City or area" style={{ ...inp, borderColor: locationError ? '#ef4444' : 'var(--border)' }} />
                <datalist id="south-cebu-pickups">{['Carcar', 'Argao', 'Dalaguete', 'Oslob', 'Moalboal', 'Badian'].map(place => <option key={place} value={place} />)}</datalist>
              </div>
              {locationError && <p style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '3px' }}>{locationError}</p>}
            </div>
            {/* Pickup date */}
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Pick-up Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--green)' }} />
                <input type="date" value={pickupDate} min={today} onChange={e => { const nextPickup = e.target.value; setPickupDate(nextPickup); setDropDate(addDays(nextPickup, rentalDays)); setDateError(''); }} style={inp} />
              </div>
            </div>
            {/* Drop-off date */}
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Drop-off Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--green)' }} />
                <input type="date" value={dropDate} min={pickupDate} onChange={e => handleDropDate(e.target.value)} style={{ ...inp, borderColor: dateError ? '#ef4444' : 'var(--border)' }} />
              </div>
              {dateError && <p style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '3px' }}>{dateError}</p>}
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Pick-up Time</label>
              <input type="time" value={pickupTime} onChange={e => { setPickupTime(e.target.value); if (dropDate === pickupDate && dropTime <= e.target.value) setDateError('Drop-off must be after pick-up.'); else setDateError(''); }} style={{ ...sel, padding: '9px 10px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Drop-off Time</label>
              <input type="time" value={dropTime} onChange={e => { setDropTime(e.target.value); if (dropDate === pickupDate && e.target.value <= pickupTime) setDateError('Drop-off must be after pick-up.'); else setDateError(''); }} style={{ ...sel, padding: '9px 10px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Drop-off Location</label>
              <input list="south-cebu-pickups" value={dropoff} onChange={e => setDropoff(e.target.value)} placeholder="Same or another area" style={{ ...sel, padding: '9px 10px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Rental Duration</label>
              <select value={rentalDays} onChange={e => handleRentalDays(Number(e.target.value))} style={sel}>
                {Array.from({ length: 30 }, (_, index) => index + 1).map(day => <option key={day} value={day}>{day} day{day === 1 ? '' : 's'}</option>)}
              </select>
            </div>
            <button onClick={applySearch} className="btn-primary" style={{ justifyContent: 'center', alignSelf: 'end', minHeight: '40px' }}>Book Now <ArrowRight size={15} /></button>
          </div>
        </div>
      </div>

      <div id="car-results" className="container" style={{ padding: '32px 24px', scrollMarginTop: '90px' }}>
        {/* Filter toolbar */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px', maxWidth: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cars..." style={{ ...inp, border: '1px solid var(--border)' }} />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...sel, width: 'auto' }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={transmission} onChange={e => setTransmission(e.target.value)} style={{ ...sel, width: 'auto' }}>
            {TRANSMISSIONS.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={fuel} onChange={e => setFuel(e.target.value)} style={{ ...sel, width: 'auto' }}>
            {FUELS.map(f => <option key={f}>{f}</option>)}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ ...sel, width: 'auto' }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Max ₱{maxPrice.toLocaleString()}</span>
            <input type="range" min={1000} max={10000} step={500} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
              style={{ accentColor: 'var(--green)', width: '100px' }} />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {/* Results count */}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
          {filtered.length} car{filtered.length !== 1 ? 's' : ''} found
          <span style={{ color: 'var(--green)', fontWeight: 600 }}> · {rentalDays}-day rental · estimated total shown per car</span>
        </p>

        {/* Grid or empty state */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🚗</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>No cars match your filters</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Try adjusting the category, transmission, or price range.</p>
            <button onClick={clearFilters} className="btn-primary">Clear All Filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {filtered.map(car => <CarCard key={car.id} car={car} rentalDays={rentalDays} bookingParams={{ pickup, dropoff, pickupDate, pickupTime, dropDate, dropTime, days: String(rentalDays), promo }} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CarsPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Loading...</p></div>}>
        <CarsContent />
      </Suspense>
      <Footer />
    </>
  );
}
