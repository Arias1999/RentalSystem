'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';

const PUBLIC_PATHS = ['/', '/login', '/register', '/cars', '/locations', '/deals', '/about', '/blog', '/contact'];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorizedPath, setAuthorizedPath] = useState<string | null>(null);
  const isPublic = PUBLIC_PATHS.includes(pathname || '/');

  useEffect(() => {
    if (isPublic) return;
    if (getSession()) {
      setAuthorizedPath(pathname);
      return;
    }
    const requested = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    router.replace(`/login?next=${encodeURIComponent(requested)}`);
  }, [isPublic, pathname, router]);

  if (isPublic || authorizedPath === pathname) return <>{children}</>;
  return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>Please sign in to continue…</main>;
}
