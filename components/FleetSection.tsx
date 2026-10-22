'use client';
import Link from 'next/link';
import CarCard from '@/components/CarCard';
import { ALL_CARS } from '@/lib/cars';

export default function FleetSection() {
  const availableCars = ALL_CARS.filter(car => car.available);

  return (
    <section id="fleet" style={{ padding: '80px 0', background: 'var(--bg-gray)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-tag">Our Fleet</span>
          <h2 className="section-title">Cars Available for Rent</h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            Browse our available cars and choose the right ride for your South Cebu trip.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {availableCars.map(car => <CarCard key={car.id} car={car} />)}
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/cars" className="btn-outline">View All Cars</Link>
        </div>
      </div>
    </section>
  );
}
