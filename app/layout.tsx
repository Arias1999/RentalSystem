import type { Metadata } from 'next';
import './globals.css';
import AuthGate from '@/components/AuthGate';
import SignupModal from '@/components/SignupModal';
import LoginModal from '@/components/LoginModal';
import ProfileModal from '@/components/ProfileModal';

export const metadata: Metadata = {
  title: 'DriveEasy – Premium Car Rentals',
  description: 'Reliable cars. Flexible rentals. Unforgettable journeys.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><AuthGate>{children}</AuthGate><SignupModal /><LoginModal /><ProfileModal /></body>
    </html>
  );
}
