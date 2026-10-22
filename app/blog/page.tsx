'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, Clock, ArrowRight, User, MapPin } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

const POSTS: Post[] = [
  { id: 1, title: 'The South Cebu Road Trip: A 3-Day Itinerary', excerpt: 'Follow the coast from Carcar to Santander, with time for waterfalls, beaches, local food, and the small towns that make the journey memorable.', author: 'DriveEasy Team', date: 'Oct 21, 2026', readTime: '7 min read', category: 'Road Trips', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=85' },
  { id: 2, title: 'Kawasan Falls: What to Know Before You Go', excerpt: 'Plan your visit to the turquoise cascades of Badian, including what to bring and how to make the most of a day in the area.', author: 'DriveEasy Team', date: 'Oct 14, 2026', readTime: '5 min read', category: 'Destinations', image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=700&q=80' },
  { id: 3, title: 'Oslob and Beyond: Make a Day of the South Coast', excerpt: 'Pair an early start in Oslob with nearby heritage stops, coastal views, and a relaxed drive through the southern towns.', author: 'DriveEasy Team', date: 'Oct 7, 2026', readTime: '6 min read', category: 'Destinations', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&q=80' },
  { id: 4, title: 'A Local\'s Guide to Driving in South Cebu', excerpt: 'A few practical pointers for winding coastal roads, market stops, parking, and taking your time between destinations.', author: 'DriveEasy Team', date: 'Sep 29, 2026', readTime: '4 min read', category: 'Travel Tips', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=700&q=80' },
  { id: 5, title: 'Best Stops Along the Carcar to Moalboal Route', excerpt: 'Turn the drive into part of the adventure with heritage, local snacks, viewpoints, and a swim when you reach the coast.', author: 'DriveEasy Team', date: 'Sep 18, 2026', readTime: '5 min read', category: 'Road Trips', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700&q=80' },
  { id: 6, title: 'Choosing the Right Rental for Your Cebu Trip', excerpt: 'Compare a compact car, SUV, or van based on your group, luggage, and the places you want to explore around South Cebu.', author: 'DriveEasy Team', date: 'Sep 5, 2026', readTime: '3 min read', category: 'Car Rental', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=700&q=80' },
];

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-gray)' }}>
        <section style={{ background: 'var(--navy)', color: '#fff', padding: '68px 24px 76px', textAlign: 'center' }}>
          <div className="container">
            <span className="section-tag">The DriveEasy Journal</span>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, margin: '12px 0 16px' }}>Find Your Way Around South Cebu</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '580px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7 }}>Local guides, road trip ideas, and useful tips for exploring the coast, waterfalls, and towns at your own pace.</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '22px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}><MapPin size={16} /> Carcar to Santander</div>
          </div>
        </section>
        <div className="container" style={{ padding: '56px 24px 72px' }}>
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div><span className="section-tag">Stories & Guides</span><h2 className="section-title" style={{ marginBottom: 0 }}>Plan a better South Cebu trip</h2></div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{POSTS.length} travel guides</span>
          </div>
          <article className="featured-post" style={{ background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', marginBottom: '40px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr' }}>
            <img src={POSTS[0].image} alt="Tropical coastline in South Cebu" style={{ width: '100%', height: '100%', minHeight: '300px', objectFit: 'cover' }} />
            <div style={{ padding: 'clamp(24px, 4vw, 42px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
              <span style={{ background: 'var(--green-light)', color: 'var(--green)', fontSize: '0.75rem', fontWeight: 700, padding: '5px 12px', borderRadius: '20px' }}>{POSTS[0].category} · Featured</span>
              <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 800, color: 'var(--navy)', margin: '16px 0 12px', lineHeight: 1.25 }}>{POSTS[0].title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '20px' }}>{POSTS[0].excerpt}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '22px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={14} /> {POSTS[0].author}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} /> {POSTS[0].date}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} /> {POSTS[0].readTime}</span>
              </div>
              <a href="#guides" className="btn-primary" style={{ display: 'inline-flex' }}>Explore the guides <ArrowRight size={16} /></a>
            </div>
          </article>
          <div id="guides" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
            {POSTS.slice(1).map(post => (
              <article key={post.id} style={{ background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', transition: 'transform 0.25s, box-shadow 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}>
                <div style={{ height: '210px', overflow: 'hidden' }}><img src={post.image} alt={post.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} /></div>
                <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ background: 'var(--green-light)', color: 'var(--green)', fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', alignSelf: 'flex-start' }}>{post.category}</span>
                  <h3 style={{ fontSize: '1.08rem', fontWeight: 750, color: 'var(--navy)', lineHeight: 1.4 }}>{post.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.65, flex: 1 }}>{post.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.76rem', borderTop: '1px solid var(--border)', paddingTop: '13px', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {post.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {post.readTime}</span>
                    <a href="#" aria-label={`Read ${post.title}`} style={{ marginLeft: 'auto', color: 'var(--green)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>Read <ArrowRight size={13} /></a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <style>{`@media (max-width: 700px) { .featured-post { grid-template-columns: 1fr !important; } .featured-post > img { min-height: 220px !important; max-height: 260px; } }`}</style>
    </>
  );
}
