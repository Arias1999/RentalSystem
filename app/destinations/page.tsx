import Navbar from '@/components/Navbar';
import Destinations from '@/components/Destinations';
import Footer from '@/components/Footer';

export default function DestinationsPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: '80px' }}>
        <Destinations showAll />
      </main>
      <Footer />
    </>
  );
}
