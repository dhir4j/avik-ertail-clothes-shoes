'use client';

import Link from 'next/link';
import { User, ShoppingBag, FileText, Navigation } from 'lucide-react';

interface Props {
  initials: string;
  name: string;
  email: string;
  active: 'profile' | 'orders' | 'invoices' | 'track';
}

const TABS = [
  { key: 'profile',  label: 'Profile',  icon: User,        href: '/profile' },
  { key: 'orders',   label: 'Orders',   icon: ShoppingBag, href: '/orders' },
  { key: 'invoices', label: 'Invoices', icon: FileText,    href: '/invoices' },
  { key: 'track',    label: 'Track',    icon: Navigation,  href: '/track' },
] as const;

export default function AccountMobileNav({ initials, name, email, active }: Props) {
  return (
    <div className="lg:hidden mb-4 border border-[#E0DFDC]">
      {/* Mini user strip */}
      <div className="px-4 py-3 border-b border-[#E0DFDC] flex items-center gap-3 bg-[#F1F0EE]">
        <div className="w-9 h-9 bg-[#0C0C0C] flex items-center justify-center flex-shrink-0">
          <span className="text-[#E11D48] text-[11px] font-bold" style={{ fontFamily: 'Outfit' }}>{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#0C0C0C] truncate" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{name}</p>
          <p className="text-[10px] text-[#78716C] truncate" style={{ fontFamily: 'Space Mono' }}>{email}</p>
        </div>
      </div>

      {/* Horizontal tabs */}
      <div className="flex overflow-x-auto hide-scrollbar divide-x divide-[#E0DFDC]">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#0C0C0C] text-[#FAFAF8]'
                  : 'text-[#78716C] hover:bg-[#F1F0EE] hover:text-[#0C0C0C]'
              }`}
              style={{ fontFamily: 'Outfit', fontWeight: 700 }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
