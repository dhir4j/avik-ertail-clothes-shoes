'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, LayoutGrid, User, Search } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';

export default function BottomNav() {
  const pathname = usePathname();
  const items = useCartStore(s => s.items);
  const user = useAuthStore(s => s.user);
  const cartCount = items.reduce((t, i) => t + i.quantity, 0);
  const setMobileSearchOpen = useUIStore(s => s.setMobileSearchOpen);

  const navItems = [
    { href: '/',          icon: Home,        label: 'Home',    action: null },
    { href: '/products',  icon: LayoutGrid,  label: 'Shop',    action: null },
    { href: null,         icon: Search,      label: 'Search',  action: () => setMobileSearchOpen(true) },
    { href: '/cart',      icon: ShoppingBag, label: 'Cart',    action: null },
    { href: user ? '/profile' : '/login', icon: User, label: user ? 'Me' : 'Sign In', action: null },
  ];

  const isActive = (href: string | null) => {
    if (!href) return false;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-md border-t border-[#E0DFDC]"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      <div className="grid grid-cols-5 h-[56px]">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const commonClass = `relative flex flex-col items-center justify-center gap-[3px] transition-colors active:scale-95 ${
            active ? 'text-[#E11D48]' : 'text-[#9A9690]'
          }`;
          const content = (
            <>
              {active && (
                <span className="absolute top-0 inset-x-[25%] h-[2px] bg-[#E11D48] rounded-full" />
              )}
              <div className="relative">
                <Icon
                  className={`transition-all ${active ? 'w-[19px] h-[19px]' : 'w-[18px] h-[18px]'}`}
                  strokeWidth={active ? 2.2 : 1.6}
                />
                {item.label === 'Cart' && cartCount > 0 && (
                  <span
                    className="absolute -top-[5px] -right-[6px] min-w-[14px] h-[14px] bg-[#E11D48] text-white flex items-center justify-center px-[3px] rounded-full"
                    style={{ fontFamily: 'Space Mono', fontSize: 8, fontWeight: 700, lineHeight: 1 }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span
                className={`tracking-[0.04em] uppercase leading-none transition-all ${active ? 'text-[#E11D48]' : 'text-[#9A9690]'}`}
                style={{ fontFamily: 'Space Mono', fontSize: 8, fontWeight: 700 }}
              >
                {item.label}
              </span>
            </>
          );

          if (item.action) {
            return (
              <button key={item.label} onClick={item.action} className={commonClass}>
                {content}
              </button>
            );
          }

          return (
            <Link key={item.label} href={item.href!} className={commonClass}>
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
