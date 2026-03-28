'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {/* pb-[56px] on mobile offsets the fixed BottomNav; md:pb-0 removes it on desktop */}
      <main className="min-h-screen pt-[68px] pb-[56px] md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
