'use client';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import FleetSection from '@/components/FleetSection';
import WhyChooseUs from '@/components/WhyChooseUs';
import Destinations from '@/components/Destinations';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero />
        <FleetSection />
        <WhyChooseUs />
        <Destinations />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
