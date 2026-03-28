'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, ShoppingBag, FileText, LogOut, Save, ArrowRight, Navigation } from 'lucide-react';
import AccountMobileNav from '@/components/layout/AccountMobileNav';
import { useEffect } from 'react';

export default function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise(r => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      {/* Header */}
      <div className="border-b border-[#E0DFDC]">
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          <p className="text-[11px] tracking-[0.15em] uppercase text-[#78716C] mb-1" style={{ fontFamily: 'Space Mono' }}>My Account</p>
          <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
            Profile
          </h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <AccountMobileNav initials={initials} name={user.name} email={user.email} active="profile" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar — desktop only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="border border-[#E0DFDC]">
              {/* Avatar */}
              <div className="p-6 border-b border-[#E0DFDC] flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-[#0C0C0C] flex items-center justify-center">
                  <span className="text-[#E11D48] text-xl font-bold" style={{ fontFamily: 'Outfit' }}>{initials}</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{user.name}</p>
                  <p className="text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{user.email}</p>
                </div>
                {user.role === 'admin' && (
                  <span className="badge bg-[#E11D48] text-[#0C0C0C] text-[10px]" style={{ fontFamily: 'Space Mono' }}>
                    ADMIN
                  </span>
                )}
              </div>

              {/* Nav */}
              <nav className="divide-y divide-[#E0DFDC]">
                {[
                  { icon: <User className="w-4 h-4" />, label: 'Profile', href: '/profile', active: true },
                  { icon: <ShoppingBag className="w-4 h-4" />, label: 'My Orders', href: '/orders', active: false },
                  { icon: <FileText className="w-4 h-4" />, label: 'Invoices', href: '/invoices', active: false },
                  { icon: <Navigation className="w-4 h-4" />, label: 'Track Order', href: '/track', active: false },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-5 py-3.5 text-sm font-bold transition-colors ${
                      item.active
                        ? 'bg-[#0C0C0C] text-[#FAFAF8]'
                        : 'text-[#78716C] hover:text-[#0C0C0C] hover:bg-[#F1F0EE]'
                    }`}
                    style={{ fontFamily: 'Outfit', fontWeight: 600 }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-[#E11D48] hover:bg-[#F1F0EE] transition-colors"
                    style={{ fontFamily: 'Outfit', fontWeight: 600 }}
                  >
                    <ArrowRight className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-[#E03A1E] hover:bg-[#FFF0EE] transition-colors"
                  style={{ fontFamily: 'Outfit', fontWeight: 600 }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-3">
            <div className="border border-[#E0DFDC]">
              <div className="px-6 py-4 border-b border-[#E0DFDC]">
                <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
                  Personal Information
                </h2>
              </div>

              <form onSubmit={handleSave} className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-1.5" style={{ fontFamily: 'Space Mono' }}>
                      Full Name
                    </label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="input-base w-full px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-1.5" style={{ fontFamily: 'Space Mono' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-base w-full px-4 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-1.5" style={{ fontFamily: 'Space Mono' }}>
                      Account Type
                    </label>
                    <div className="input-base px-4 py-2.5 text-sm text-[#78716C] bg-[#F1F0EE]">
                      {user.role === 'admin' ? 'Administrator' : 'Customer'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-1.5" style={{ fontFamily: 'Space Mono' }}>
                      Member ID
                    </label>
                    <div className="input-base px-4 py-2.5 text-sm text-[#78716C] bg-[#F1F0EE]" style={{ fontFamily: 'Space Mono' }}>
                      #{String(user.id).padStart(6, '0')}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#E0DFDC] flex items-center justify-between">
                  <button
                    type="submit"
                    className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors ${
                      saved
                        ? 'bg-[#E11D48] text-[#0C0C0C]'
                        : 'bg-[#0C0C0C] text-[#FAFAF8] hover:bg-[#1F1F1F]'
                    }`}
                    style={{ fontFamily: 'Outfit', fontWeight: 700 }}
                  >
                    <Save className="w-4 h-4" />
                    {saved ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Change password section */}
            <div className="border border-[#E0DFDC] mt-6">
              <div className="px-6 py-4 border-b border-[#E0DFDC]">
                <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
                  Security
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-1.5" style={{ fontFamily: 'Space Mono' }}>
                      Current Password
                    </label>
                    <input type="password" placeholder="••••••••" className="input-base w-full px-4 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-1.5" style={{ fontFamily: 'Space Mono' }}>
                      New Password
                    </label>
                    <input type="password" placeholder="••••••••" className="input-base w-full px-4 py-2.5 text-sm" />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    className="px-6 py-2.5 text-sm font-bold uppercase tracking-wider border border-[#E0DFDC] hover:border-[#0C0C0C] hover:bg-[#F1F0EE] transition-colors"
                    style={{ fontFamily: 'Outfit', fontWeight: 700 }}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
