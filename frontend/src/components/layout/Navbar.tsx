'use client';

import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X, ArrowRight, Package, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { getCategoryMap, searchProducts, getSectionCategoryMap } from '@/lib/data';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/ui-store';

export default function Navbar() {
  const items = useCartStore(s => s.items);
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const cartCount = items.reduce((t, i) => t + i.quantity, 0);
  const router = useRouter();

  const categoryMap = getCategoryMap();
  const sectionMap = getSectionCategoryMap();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { mobileSearchOpen, setMobileSearchOpen } = useUIStore();
  const [shopOpen, setShopOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) {
        setShopOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const liveResults = searchQuery.trim().length > 1
    ? searchProducts(searchQuery.trim()).slice(0, 5)
    : [];

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
      setSearchQuery('');
    }
  }, [searchQuery, router]);

  const handleResultClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setSearchFocused(false);
    setSearchQuery('');
  };

  const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[68px] bg-[#FAFAF8] transition-all duration-300 border-b ${scrolled ? 'border-[#0C0C0C]/15 shadow-sm' : 'border-[#E0DFDC]'}`}
      >
        <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center gap-0">

          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-1 flex-shrink-0 group mr-8">
            <span className="text-xl font-extrabold uppercase tracking-tight text-[#0C0C0C] leading-none" style={{ fontFamily: 'Outfit', fontWeight: 800, letterSpacing: '-0.02em' }}>
              PURALITY
            </span>
            <span className="text-xl font-light uppercase tracking-tight text-[#0C0C0C]/60 leading-none" style={{ fontFamily: 'Outfit', fontWeight: 300, letterSpacing: '-0.02em' }}>
              ONLINE
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-0 mr-4">
            <Link
              href="/products"
              className="px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#78716C] hover:text-[#0C0C0C] transition-colors whitespace-nowrap rounded-lg hover:bg-[#F1F0EE]"
              style={{ fontFamily: 'Outfit', fontWeight: 600 }}
            >
              All Styles
            </Link>

            <Link
              href="/products?section=Footwear"
              className="px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#78716C] hover:text-[#0C0C0C] transition-colors whitespace-nowrap rounded-lg hover:bg-[#F1F0EE]"
              style={{ fontFamily: 'Outfit', fontWeight: 600 }}
            >
              Footwear
            </Link>

            <Link
              href="/products?section=Clothing"
              className="px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#78716C] hover:text-[#0C0C0C] transition-colors whitespace-nowrap rounded-lg hover:bg-[#F1F0EE]"
              style={{ fontFamily: 'Outfit', fontWeight: 600 }}
            >
              Clothing
            </Link>

            {/* Shop dropdown — grouped by Section > Gender > Category */}
            <div ref={shopRef} className="relative">
              <button
                onClick={() => setShopOpen(v => !v)}
                className={`flex items-center gap-1 px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors rounded-lg ${shopOpen ? 'text-[#0C0C0C] bg-[#F1F0EE]' : 'text-[#78716C] hover:text-[#0C0C0C] hover:bg-[#F1F0EE]'}`}
                style={{ fontFamily: 'Outfit', fontWeight: 600 }}
              >
                Shop
                <ChevronDown className={`w-3 h-3 transition-transform ${shopOpen ? 'rotate-180' : ''}`} />
              </button>

              {shopOpen && (
                <div className="absolute top-full left-0 mt-1.5 bg-[#FAFAF8] border border-[#E0DFDC] shadow-lg rounded-xl z-50 flex overflow-hidden">
                  {Object.keys(sectionMap).map(section => (
                    <div key={section} className="min-w-[180px]">
                      <div className="px-4 py-3 border-b border-[#E0DFDC] bg-[#F1F0EE]">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#E11D48]" style={{ fontFamily: 'Space Mono' }}>
                          {section}
                        </span>
                      </div>
                      {Object.keys(sectionMap[section]).map(gender => (
                        <div key={gender}>
                          <Link
                            href={`/products?gender=${encodeURIComponent(gender)}`}
                            onClick={() => setShopOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 border-b border-[#F1F0EE] bg-[#FAFAF8] hover:bg-[#F1F0EE] transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
                              {gender}
                            </span>
                          </Link>
                          {Object.keys(sectionMap[section][gender]).map(cat => (
                            <Link
                              key={cat}
                              href={`/products?gender=${encodeURIComponent(gender)}&category=${encodeURIComponent(cat)}`}
                              onClick={() => setShopOpen(false)}
                              className="flex items-center justify-between px-4 py-2.5 text-[13px] text-[#0C0C0C] hover:bg-[#F1F0EE] transition-colors border-b border-[#F1F0EE] last:border-b-0"
                              style={{ fontFamily: 'Figtree' }}
                            >
                              <span>{cat}</span>
                              <span className="text-[10px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                                {sectionMap[section][gender][cat]}
                              </span>
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#78716C] hover:text-[#0C0C0C] transition-colors rounded-lg hover:bg-[#F1F0EE]"
              style={{ fontFamily: 'Outfit', fontWeight: 600 }}
            >
              About
            </Link>
          </nav>

          {/* Search bar -- desktop */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-sm ml-auto relative">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className={`flex items-center gap-2 border px-3.5 py-2 bg-[#F1F0EE] rounded-lg transition-colors ${searchFocused ? 'border-[#0C0C0C]' : 'border-[#E0DFDC]'}`}>
                <Search className="w-3.5 h-3.5 text-[#78716C] flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search styles, colours..."
                  className="flex-1 bg-transparent text-[12px] outline-none text-[#0C0C0C] placeholder:text-[#78716C]"
                  style={{ fontFamily: 'Figtree' }}
                />
                {searchQuery && (
                  <button type="button" onClick={() => { setSearchQuery(''); inputRef.current?.focus(); }}>
                    <X className="w-3.5 h-3.5 text-[#78716C] hover:text-[#0C0C0C]" />
                  </button>
                )}
              </div>
            </form>

            {/* Live results */}
            {searchFocused && searchQuery.trim().length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#FAFAF8] border border-[#E0DFDC] rounded-xl z-50 shadow-lg overflow-hidden">
                {liveResults.length > 0 ? (
                  <>
                    {liveResults.map(p => (
                      <button
                        key={p.slug}
                        onClick={() => handleResultClick(p.slug)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F1F0EE] transition-colors text-left border-b border-[#E0DFDC] last:border-b-0"
                      >
                        <div className="w-9 h-9 bg-[#F1F0EE] rounded-lg flex-shrink-0 overflow-hidden">
                          {p.primaryImage && <img src={p.primaryImage} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain p-1" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-[#0C0C0C] truncate" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{p.name}</p>
                          <p className="text-[10px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{p.gender} · {p.category} · {p.priceFormatted}</p>
                        </div>
                        <ArrowRight className="w-3 h-3 text-[#E0DFDC] flex-shrink-0" />
                      </button>
                    ))}
                    <button
                      onClick={() => { router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`); setSearchFocused(false); setSearchQuery(''); }}
                      className="w-full flex items-center justify-between px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#E11D48] hover:bg-[#F1F0EE] transition-colors"
                      style={{ fontFamily: 'Outfit' }}
                    >
                      All results for &ldquo;{searchQuery}&rdquo;
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-4 text-[12px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                    No results for &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 ml-2">

            {/* Mobile search */}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden p-2.5 hover:bg-[#F1F0EE] rounded-lg transition-colors"
            >
              <Search className="w-4 h-4 text-[#0C0C0C]" />
            </button>

            {/* User menu */}
            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg transition-colors ${profileOpen ? 'bg-[#F1F0EE]' : 'hover:bg-[#F1F0EE]'}`}
                >
                  <div className="w-6 h-6 bg-[#0C0C0C] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#E11D48] text-[9px] font-bold" style={{ fontFamily: 'Outfit' }}>{initials}</span>
                  </div>
                  <span className="text-[12px] font-medium hidden sm:block text-[#0C0C0C]" style={{ fontFamily: 'Space Mono' }}>
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#FAFAF8] border border-[#E0DFDC] shadow-lg rounded-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E0DFDC]">
                      <p className="text-[12px] font-bold text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{user.name}</p>
                      <p className="text-[10px] text-[#78716C] truncate" style={{ fontFamily: 'Space Mono' }}>{user.email}</p>
                    </div>

                    {user.role === 'admin' && (
                      <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[12px] font-bold text-[#E11D48] hover:bg-[#F1F0EE] border-b border-[#E0DFDC] transition-colors" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
                        <Settings className="w-3.5 h-3.5" />
                        Admin Panel
                      </Link>
                    )}

                    <Link href="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#0C0C0C] hover:bg-[#F1F0EE] transition-colors" style={{ fontFamily: 'Figtree' }}>
                      <User className="w-3.5 h-3.5 text-[#78716C]" />
                      My Profile
                    </Link>
                    <Link href="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#0C0C0C] hover:bg-[#F1F0EE] transition-colors border-b border-[#E0DFDC]" style={{ fontFamily: 'Figtree' }}>
                      <Package className="w-3.5 h-3.5 text-[#78716C]" />
                      My Orders
                    </Link>

                    <button
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-[13px] text-[#E03A1E] hover:bg-red-50 transition-colors rounded-b-xl"
                      style={{ fontFamily: 'Figtree' }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold uppercase tracking-wider text-[#0C0C0C] hover:bg-[#F1F0EE] rounded-lg transition-colors"
                style={{ fontFamily: 'Outfit', fontWeight: 600 }}
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative p-2.5 hover:bg-[#F1F0EE] rounded-lg transition-colors">
              <ShoppingBag className="w-4 h-4 text-[#0C0C0C]" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold text-white bg-[#E11D48] rounded-full"
                  style={{ fontFamily: 'Space Mono' }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2.5 hover:bg-[#F1F0EE] rounded-lg transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[200] bg-[#FAFAF8]">
          <div className="flex items-center gap-3 px-4 h-[68px] border-b border-[#E0DFDC]">
            <Search className="w-4 h-4 text-[#78716C] flex-shrink-0" />
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`); setMobileSearchOpen(false); setSearchQuery(''); } }} className="flex-1">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products, brands..."
                className="w-full bg-transparent text-base outline-none text-[#0C0C0C] placeholder:text-[#78716C]"
                style={{ fontFamily: 'Figtree' }}
              />
            </form>
            <button onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); }}>
              <X className="w-5 h-5 text-[#0C0C0C]" />
            </button>
          </div>
          <div className="overflow-y-auto">
            {searchQuery.trim().length > 1 && liveResults.length > 0 && (
              <div className="divide-y divide-[#E0DFDC]">
                {liveResults.map(p => (
                  <button
                    key={p.slug}
                    onClick={() => { handleResultClick(p.slug); setMobileSearchOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[#F1F0EE] text-left"
                  >
                    <div className="w-12 h-12 bg-[#F1F0EE] rounded-lg flex-shrink-0 overflow-hidden">
                      {p.primaryImage && <img src={p.primaryImage} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain p-1" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0C0C0C] truncate" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{p.name}</p>
                      <p className="text-[11px] text-[#78716C] mt-0.5" style={{ fontFamily: 'Space Mono' }}>{p.gender} · {p.category} · {p.priceFormatted}</p>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => { router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`); setMobileSearchOpen(false); setSearchQuery(''); }}
                  className="w-full flex items-center justify-between px-4 py-4 text-[12px] font-bold text-[#E11D48]"
                  style={{ fontFamily: 'Outfit' }}
                >
                  All results for &ldquo;{searchQuery}&rdquo;
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {searchQuery.trim().length > 1 && liveResults.length === 0 && (
              <div className="px-4 py-8 text-center text-[#78716C] text-sm" style={{ fontFamily: 'Space Mono' }}>
                No results for &ldquo;{searchQuery}&rdquo;
              </div>
            )}
            {searchQuery.trim().length <= 1 && (
              <div className="p-4 space-y-4">
                {Object.keys(sectionMap).map(section => (
                  <div key={section}>
                    <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#E11D48] mb-3" style={{ fontFamily: 'Space Mono' }}>{section}</p>
                    {Object.keys(sectionMap[section]).map(gender => (
                      <div key={gender} className="mb-3">
                        <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-2" style={{ fontFamily: 'Space Mono' }}>{gender}</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(sectionMap[section][gender]).map(cat => (
                            <button
                              key={cat}
                              onClick={() => { router.push(`/products?gender=${encodeURIComponent(gender)}&category=${encodeURIComponent(cat)}`); setMobileSearchOpen(false); }}
                              className="px-3 py-1.5 border border-[#E0DFDC] rounded-lg text-[12px] font-semibold uppercase tracking-wider hover:bg-[#0C0C0C] hover:text-[#FAFAF8] hover:border-[#0C0C0C] transition-colors"
                              style={{ fontFamily: 'Outfit' }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-[#0C0C0C]/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto w-72 h-full bg-[#FAFAF8] flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0DFDC]">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-baseline gap-1">
                <span className="text-lg font-extrabold uppercase tracking-tight" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>PURALITY</span>
                <span className="text-lg font-light uppercase tracking-tight text-[#0C0C0C]/60" style={{ fontFamily: 'Outfit', fontWeight: 300 }}>ONLINE</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-[#F1F0EE] transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <nav className="flex flex-col p-5 gap-1 flex-1">
              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-2 mt-1" style={{ fontFamily: 'Space Mono' }}>Shop</p>
              <Link href="/products" onClick={() => setMobileOpen(false)} className="flex items-center justify-between py-2.5 text-base font-bold uppercase tracking-tight text-[#0C0C0C] hover:text-[#E11D48] transition-colors border-b border-[#F1F0EE] rounded-lg px-2 hover:bg-[#F1F0EE]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
                All Styles <ChevronR />
              </Link>

              {Object.keys(sectionMap).map(section => (
                <div key={section}>
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#E11D48] mt-5 mb-2" style={{ fontFamily: 'Space Mono' }}>{section}</p>
                  {Object.keys(sectionMap[section]).map(gender => (
                    <div key={gender}>
                      <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-[#78716C] mt-3 mb-1 px-2" style={{ fontFamily: 'Space Mono' }}>{gender}</p>
                      {Object.keys(sectionMap[section][gender]).map(cat => (
                        <Link
                          key={cat}
                          href={`/products?gender=${encodeURIComponent(gender)}&category=${encodeURIComponent(cat)}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between py-2 px-2 text-sm font-semibold uppercase tracking-tight text-[#0C0C0C] hover:text-[#E11D48] hover:bg-[#F1F0EE] transition-colors border-b border-[#F1F0EE] rounded-lg"
                          style={{ fontFamily: 'Outfit', fontWeight: 600 }}
                        >
                          <span>{cat}</span>
                          <span className="text-[10px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{sectionMap[section][gender][cat]}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              ))}

              <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C] mt-5 mb-2" style={{ fontFamily: 'Space Mono' }}>Info</p>
              <Link href="/about" onClick={() => setMobileOpen(false)} className="py-2 px-2 text-sm font-semibold uppercase tracking-tight text-[#78716C] hover:text-[#0C0C0C] hover:bg-[#F1F0EE] rounded-lg transition-colors" style={{ fontFamily: 'Outfit' }}>About Us</Link>
              <Link href="/refund-policy" onClick={() => setMobileOpen(false)} className="py-2 px-2 text-sm font-semibold uppercase tracking-tight text-[#78716C] hover:text-[#0C0C0C] hover:bg-[#F1F0EE] rounded-lg transition-colors" style={{ fontFamily: 'Outfit' }}>Refund Policy</Link>
            </nav>

            <div className="p-5 border-t border-[#E0DFDC] space-y-1">
              {user ? (
                <>
                  <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-2" style={{ fontFamily: 'Space Mono' }}>Account</p>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2.5 px-2 text-sm font-bold text-[#0C0C0C] hover:text-[#E11D48] hover:bg-[#F1F0EE] rounded-lg transition-colors" style={{ fontFamily: 'Outfit' }}>
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <Link href="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2.5 px-2 text-sm font-bold text-[#0C0C0C] hover:text-[#E11D48] hover:bg-[#F1F0EE] rounded-lg transition-colors" style={{ fontFamily: 'Outfit' }}>
                    <Package className="w-4 h-4" /> My Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2.5 px-2 text-sm font-bold text-[#E11D48] hover:bg-[#F1F0EE] rounded-lg transition-colors" style={{ fontFamily: 'Outfit' }}>
                      <Settings className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-2 py-2.5 px-2 text-sm font-bold text-[#E03A1E] w-full text-left hover:bg-red-50 rounded-lg transition-colors"
                    style={{ fontFamily: 'Outfit' }}
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm rounded-xl"
                  style={{ fontFamily: 'Outfit', fontWeight: 700 }}
                >
                  <User className="w-4 h-4" /> Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChevronR() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M4.5 9L7.5 6L4.5 3" stroke="#E0DFDC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
