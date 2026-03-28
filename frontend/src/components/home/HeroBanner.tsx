import Link from 'next/link';
import { ArrowRight, Shirt, Footprints, ArrowUpRight } from 'lucide-react';

interface CategoryEntry { gender: string; category: string; section: string; count: number }

function dedup(cats: CategoryEntry[]) {
  const seen = new Set<string>();
  return cats.filter(c => {
    const k = `${c.gender}-${c.category}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/* ─────────────────────────────────────────────
   MOBILE HERO
───────────────────────────────────────────── */
function MobileHero({ categories }: { categories: CategoryEntry[] }) {
  const fwCount = categories.filter(c => c.section === 'Footwear').reduce((s, c) => s + c.count, 0);
  const clCount = categories.filter(c => c.section === 'Clothing').reduce((s, c) => s + c.count, 0);
  const total = fwCount + clCount;

  return (
    <section className="md:hidden relative overflow-hidden bg-[#F5F3EF]">
      {/* Texture */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
        backgroundSize: '150px',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 60% 40% at 80% 10%, rgba(225,29,72,0.05) 0%, transparent 50%), linear-gradient(175deg, #F5F3EF 0%, #EDE9E3 60%, #F5F3EF 100%)',
      }} />

      <div className="relative px-5 pt-14 pb-8 flex flex-col min-h-[85svh]">
        {/* Overline */}
        <div className="flex items-center gap-2.5 mb-10">
          <span className="h-[2px] w-5 bg-[#E11D48]" />
          <span className="text-[9px] tracking-[0.3em] uppercase text-[#E11D48] font-bold" style={{ fontFamily: 'Space Mono' }}>
            New Delhi · India
          </span>
        </div>

        {/* Brand — full width stacked, mixed serif/sans */}
        <div className="mb-4">
          <p className="text-[11px] tracking-[0.4em] uppercase text-[#78716C] mb-3" style={{ fontFamily: 'Space Mono' }}>Welcome to</p>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(44px, 14vw, 80px)', letterSpacing: '-0.04em', lineHeight: 0.9 }} className="text-[#0C0C0C] uppercase">
            Avik<br />
            <span style={{ fontWeight: 200, letterSpacing: '-0.02em' }} className="text-[#0C0C0C]/40">E</span>
            <span style={{ fontWeight: 200, letterSpacing: '-0.02em' }} className="text-[#E11D48]">retail</span>
          </h1>
        </div>

        {/* Divider + tagline */}
        <div className="flex gap-3 mb-8 mt-2">
          <span className="w-[2px] bg-[#E11D48]/30 rounded-full flex-shrink-0" />
          <p className="text-[#78716C] text-sm leading-relaxed" style={{ fontFamily: 'Figtree', fontWeight: 400 }}>
            Curated fashion &amp; footwear.<br />
            Authenticated. Affordable.
          </p>
        </div>

        {/* Inline stats */}
        <div className="flex items-center divide-x divide-[#D6D2CB] mb-8">
          {[
            { n: `${total}+`, l: 'Styles' },
            { n: '100%', l: 'Genuine' },
            { n: '24h', l: 'Dispatch' },
          ].map(s => (
            <div key={s.l} className="pr-4 pl-4 first:pl-0">
              <p className="text-[#0C0C0C] text-base font-black leading-none" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{s.n}</p>
              <p className="text-[8px] text-[#78716C] uppercase tracking-widest mt-0.5" style={{ fontFamily: 'Space Mono' }}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* Section rows */}
        <div className="space-y-2.5 mb-8">
          <Link
            href="/products?section=Footwear"
            className="group flex items-center justify-between bg-white border border-[#E0DFDC] rounded-xl px-4 py-3.5 active:scale-[0.98] transition-transform shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FEF2F2] flex items-center justify-center">
                <Footprints className="w-4 h-4 text-[#E11D48]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Footwear</p>
                <p className="text-[10px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{fwCount} styles</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#D6D2CB] group-active:text-[#E11D48] transition-colors" />
          </Link>
          <Link
            href="/products?section=Clothing"
            className="group flex items-center justify-between bg-white border border-[#E0DFDC] rounded-xl px-4 py-3.5 active:scale-[0.98] transition-transform shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FEF2F2] flex items-center justify-center">
                <Shirt className="w-4 h-4 text-[#E11D48]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Clothing</p>
                <p className="text-[10px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{clCount} styles</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#D6D2CB] group-active:text-[#E11D48] transition-colors" />
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <Link
            href="/products"
            className="flex items-center justify-center gap-2.5 bg-[#0C0C0C] text-white py-4 rounded-xl text-[12px] font-bold uppercase tracking-[0.12em] active:bg-[#2A2A2A] transition-colors w-full"
            style={{ fontFamily: 'Outfit', fontWeight: 700 }}
          >
            Shop All Styles <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   DESKTOP HERO
───────────────────────────────────────────── */
function DesktopHero({ categories }: { categories: CategoryEntry[] }) {
  const footwearCats = dedup(categories.filter(c => c.section === 'Footwear')).slice(0, 4);
  const clothingCats = dedup(categories.filter(c => c.section === 'Clothing')).slice(0, 4);
  const totalProducts = categories.reduce((s, c) => s + c.count, 0);

  return (
    <section className="hidden md:block relative overflow-hidden border-b border-[#E0DFDC]" style={{ height: '92svh', minHeight: 560 }}>
      {/* Base */}
      <div className="absolute inset-0 bg-[#F5F3EF]" />
      <div className="absolute inset-0 opacity-25" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`,
        backgroundSize: '200px',
      }} />
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse 40% 40% at 10% 90%, rgba(225,29,72,0.04) 0%, transparent 60%),
          radial-gradient(ellipse 30% 30% at 90% 15%, rgba(225,29,72,0.03) 0%, transparent 50%),
          linear-gradient(160deg, #F5F3EF 0%, #EDE9E3 40%, #F5F3EF 70%, #EDE9E3 100%)
        `,
      }} />
      {/* Diagonal hatching */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(12,12,12,1) 40px, rgba(12,12,12,1) 41px)`,
      }} />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col" style={{ padding: 'clamp(24px, 3.5vw, 56px)' }}>
        <div className="max-w-[1440px] w-full mx-auto flex flex-col h-full">

          {/* Top bar */}
          <div className="flex items-center justify-between pb-6 border-b border-[#0C0C0C]/5 mb-auto">
            <div className="flex items-center gap-3">
              <span className="w-5 h-[2px] bg-[#E11D48]" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#E11D48] font-bold" style={{ fontFamily: 'Space Mono' }}>
                Fashion &amp; Footwear · India
              </span>
            </div>
            <div className="flex items-center gap-8">
              {[
                { n: `${totalProducts}+`, l: 'Products' },
                { n: '100%', l: 'Genuine' },
                { n: '48h', l: 'Delivery' },
              ].map(s => (
                <div key={s.l} className="flex items-baseline gap-1.5">
                  <span className="text-[#0C0C0C] text-sm font-black" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{s.n}</span>
                  <span className="text-[9px] text-[#78716C] uppercase tracking-wider" style={{ fontFamily: 'Space Mono' }}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main: two-column split */}
          <div className="flex items-end justify-between gap-16 my-auto">

            {/* Left: brand + tagline + CTA */}
            <div className="flex-1 max-w-3xl">
              <p className="text-[11px] tracking-[0.4em] uppercase text-[#78716C] mb-5" style={{ fontFamily: 'Space Mono' }}>Welcome to</p>

              {/* Brand typography — horizontal mixed weight */}
              <h1 className="uppercase text-[#0C0C0C] select-none" style={{ fontFamily: 'Outfit', lineHeight: 0.88 }}>
                <span style={{ fontWeight: 900, fontSize: 'clamp(80px, 11vw, 160px)', letterSpacing: '-0.05em', display: 'block' }}>
                  Avik
                </span>
                <span className="flex items-baseline" style={{ fontSize: 'clamp(80px, 11vw, 160px)', letterSpacing: '-0.03em' }}>
                  <span style={{ fontWeight: 200 }} className="text-[#0C0C0C]/30">E</span>
                  <span style={{ fontWeight: 200 }} className="text-[#E11D48]">retail</span>
                </span>
              </h1>

              {/* Tagline row */}
              <div className="flex items-start gap-4 mt-8 mb-10">
                <span className="w-[2px] h-11 bg-[#E11D48]/40 rounded-full flex-shrink-0 mt-0.5" />
                <p className="text-[#78716C] text-base leading-relaxed max-w-md" style={{ fontFamily: 'Figtree', fontWeight: 400 }}>
                  India&apos;s curated fashion &amp; footwear destination.
                  Authenticated quality, fair prices, delivered to your door.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2.5 bg-[#0C0C0C] text-white px-8 py-4 rounded-xl text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-[#2A2A2A] transition-all hover:gap-3.5"
                  style={{ fontFamily: 'Outfit', fontWeight: 700 }}
                >
                  Shop All Styles <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border border-[#0C0C0C]/12 text-[#78716C] px-6 py-4 rounded-xl text-[11px] font-bold uppercase tracking-[0.12em] hover:text-[#0C0C0C] hover:border-[#0C0C0C]/25 transition-all"
                  style={{ fontFamily: 'Outfit', fontWeight: 700 }}
                >
                  Our Story
                </Link>
              </div>
            </div>

            {/* Right: category cards */}
            <div className="hidden lg:flex flex-col gap-3 flex-shrink-0 w-[240px]">
              {/* Footwear card */}
              <Link
                href="/products?section=Footwear"
                className="group bg-white border border-[#E0DFDC] rounded-xl p-5 hover:border-[#E11D48]/30 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] flex items-center justify-center">
                      <Footprints className="w-3.5 h-3.5 text-[#E11D48]" />
                    </div>
                    <span className="text-[10px] tracking-[0.15em] uppercase text-[#E11D48] font-bold" style={{ fontFamily: 'Space Mono' }}>Footwear</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#D6D2CB] group-hover:text-[#E11D48] transition-colors" />
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  {footwearCats.map(c => (
                    <span key={`fw-${c.gender}-${c.category}`} className="text-[11px] text-[#78716C] group-hover:text-[#0C0C0C]/60 transition-colors" style={{ fontFamily: 'Figtree' }}>
                      {c.category}
                    </span>
                  ))}
                </div>
              </Link>

              {/* Clothing card */}
              <Link
                href="/products?section=Clothing"
                className="group bg-white border border-[#E0DFDC] rounded-xl p-5 hover:border-[#E11D48]/30 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] flex items-center justify-center">
                      <Shirt className="w-3.5 h-3.5 text-[#E11D48]" />
                    </div>
                    <span className="text-[10px] tracking-[0.15em] uppercase text-[#E11D48] font-bold" style={{ fontFamily: 'Space Mono' }}>Clothing</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#D6D2CB] group-hover:text-[#E11D48] transition-colors" />
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  {clothingCats.map(c => (
                    <span key={`cl-${c.gender}-${c.category}`} className="text-[11px] text-[#78716C] group-hover:text-[#0C0C0C]/60 transition-colors" style={{ fontFamily: 'Figtree' }}>
                      {c.category}
                    </span>
                  ))}
                </div>
              </Link>

              {/* Quick links */}
              <div className="flex gap-2 mt-1">
                <Link
                  href="/products?section=Footwear"
                  className="flex-1 flex items-center justify-center gap-1.5 border border-[#E0DFDC] rounded-lg py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#78716C] hover:text-[#E11D48] hover:border-[#E11D48]/30 transition-all bg-white"
                  style={{ fontFamily: 'Outfit', fontWeight: 700 }}
                >
                  <Footprints className="w-3 h-3" /> Shoes
                </Link>
                <Link
                  href="/products?section=Clothing"
                  className="flex-1 flex items-center justify-center gap-1.5 border border-[#E0DFDC] rounded-lg py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#78716C] hover:text-[#E11D48] hover:border-[#E11D48]/30 transition-all bg-white"
                  style={{ fontFamily: 'Outfit', fontWeight: 700 }}
                >
                  <Shirt className="w-3 h-3" /> Clothes
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E11D48]/20 to-transparent" />
    </section>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export default function HeroBanner({ categories }: { categories: CategoryEntry[] }) {
  return (
    <>
      <MobileHero categories={categories} />
      <DesktopHero categories={categories} />
    </>
  );
}
