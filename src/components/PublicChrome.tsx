'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';

export default function PublicChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
      <main className={isAdmin ? 'w-full max-w-full' : 'flex-1 w-full max-w-full overflow-x-hidden pb-24 md:pb-0'}>
        {children}
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <MobileBottomNav />}
    </>
  );
}
