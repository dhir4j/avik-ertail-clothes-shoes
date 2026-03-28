import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ShieldCheck, PackageCheck, BadgeIndianRupee, Truck } from 'lucide-react';
import {
  getAllProducts,
  getCategories,
  getCategoryMap,
  getSectionCategoryMap,
  getProductsByCategory,
  getFeaturedProducts,
  getProductsBySection,
} from '@/lib/data';
import ProductCard from '@/components/product/ProductCard';
import HeroBanner from '@/components/home/HeroBanner';

export default function Home() {
  const allProducts = getAllProducts();
  const categories = getCategories();
  const categoryMap = getCategoryMap();
  const sectionCategoryMap = getSectionCategoryMap();
  const featured = getFeaturedProducts(8);
  const newArrivals = allProducts.slice(-8).reverse();

  // Footwear categories by gender
  const footwearMap = sectionCategoryMap['Footwear'] || {};
  const footwearMenTiles = Object.keys(footwearMap['Men'] || {}).map(cat => ({
    category: cat,
    count: footwearMap['Men'][cat],
    product: getProductsByCategory('Men', cat)[0],
  }));
  const footwearWomenTiles = Object.keys(footwearMap['Women'] || {}).map(cat => ({
    category: cat,
    count: footwearMap['Women'][cat],
    product: getProductsByCategory('Women', cat)[0],
  }));

  // Clothing categories by gender
  const clothingMap = sectionCategoryMap['Clothing'] || {};
  const clothingMenTiles = Object.keys(clothingMap['Men'] || {}).map(cat => ({
    category: cat,
    count: clothingMap['Men'][cat],
    product: getProductsByCategory('Men', cat)[0],
  }));
  const clothingWomenTiles = Object.keys(clothingMap['Women'] || {}).map(cat => ({
    category: cat,
    count: clothingMap['Women'][cat],
    product: getProductsByCategory('Women', cat)[0],
  }));

  // Marquee items from all categories
  const marqueeItems = categories.map(c => `${c.section} / ${c.gender} ${c.category}`);

  const totalFootwear = getProductsBySection('Footwear').length;
  const totalClothing = getProductsBySection('Clothing').length;

  return (
    <div className="bg-[#FAFAF8] pb-[72px] md:pb-0">

      {/* ── HERO BANNER CAROUSEL ── */}
      <HeroBanner categories={categories} />

      {/* ── SECTION TABS MARQUEE ── */}
      <div className="border-b border-[#E0DFDC] py-2.5 sm:py-3 bg-[#0C0C0C] overflow-hidden">
        <div className="flex gap-0 whitespace-nowrap animate-[scroll_30s_linear_infinite]">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="flex gap-0">
              {marqueeItems.map(label => (
                <span key={label + i} className="inline-flex items-center gap-3 pr-10 text-[11px] font-bold tracking-[0.18em] text-[#FAFAF8] uppercase" style={{ fontFamily: 'Outfit' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] flex-shrink-0" />
                  {label}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── SHOP FOOTWEAR ── */}
      <section className="border-b border-[#E0DFDC]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          <div className="flex items-baseline justify-between mb-5 sm:mb-8 md:mb-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-[10px] tracking-[0.18em] uppercase text-[#78716C] font-bold" style={{ fontFamily: 'Space Mono' }}>01 /</span>
              <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                Shop Footwear
              </h2>
            </div>
            <Link href="/products?section=Footwear" className="text-[11px] font-bold uppercase tracking-widest text-[#E11D48] hover:text-[#0C0C0C] transition-colors flex items-center gap-1" style={{ fontFamily: 'Outfit' }}>
              All Footwear ({totalFootwear}) <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Men's Footwear */}
          {footwearMenTiles.length > 0 && (
            <div className="mb-8 md:mb-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#78716C] mb-3 sm:mb-5" style={{ fontFamily: 'Space Mono' }}>Men</p>

              {/* Mobile: horizontal scroll */}
              <div className="md:hidden -mx-4 overflow-x-auto hide-scrollbar">
                <div className="flex gap-2.5 px-4 pb-1" style={{ width: 'max-content' }}>
                  {footwearMenTiles.map(t => (
                    <Link
                      key={t.category}
                      href={`/products?gender=Men&category=${encodeURIComponent(t.category)}`}
                      className="flex-shrink-0 w-[130px] bg-[#F1F0EE] border border-[#E0DFDC] rounded-xl overflow-hidden active:bg-[#0C0C0C] active:border-[#0C0C0C] transition-colors"
                    >
                      <div className="w-[130px] h-[100px] bg-[#E8E7E4] flex items-center justify-center p-2 overflow-hidden rounded-t-xl">
                        {t.product?.primaryImage
                          ? <img src={t.product.primaryImage} alt={t.category} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                          : <span className="text-[#E0DFDC] text-3xl font-black" style={{ fontFamily: 'Outfit' }}>-</span>
                        }
                      </div>
                      <div className="p-2.5 border-t border-[#E0DFDC]">
                        <p className="text-[10px] font-black uppercase tracking-wide text-[#0C0C0C] leading-tight" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>{t.category}</p>
                        <p className="text-[9px] text-[#78716C] mt-0.5" style={{ fontFamily: 'Space Mono' }}>{t.count} styles</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Desktop: editorial tiles */}
              <div className="hidden md:grid md:grid-cols-3 gap-3">
                {footwearMenTiles.slice(0, 3).map(t => (
                  <Link
                    key={t.category}
                    href={`/products?gender=Men&category=${encodeURIComponent(t.category)}`}
                    className="group relative bg-[#F1F0EE] rounded-xl overflow-hidden aspect-[4/3] flex flex-col justify-between p-6 hover:shadow-lg transition-shadow duration-300"
                  >
                    {t.product?.primaryImage && (
                      <div className="absolute inset-0 flex items-center justify-center p-8 opacity-70 group-hover:opacity-90 transition-opacity duration-500">
                        <img
                          src={t.product.primaryImage}
                          alt={t.category}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    )}
                    <div className="relative z-10">
                      <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                        {t.count} styles
                      </span>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#0C0C0C] group-hover:text-[#E11D48] transition-colors" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                        {t.category}
                      </h3>
                      <p className="text-[11px] text-[#78716C] mt-1 flex items-center gap-1" style={{ fontFamily: 'Figtree' }}>
                        Shop now <ArrowRight className="w-3 h-3" />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop: remaining small tiles */}
              {footwearMenTiles.length > 3 && (
                <div className="hidden md:grid md:grid-cols-4 gap-3 mt-3">
                  {footwearMenTiles.slice(3).map(t => (
                    <Link
                      key={t.category}
                      href={`/products?gender=Men&category=${encodeURIComponent(t.category)}`}
                      className="group bg-[#FAFAF8] hover:bg-[#0C0C0C] transition-colors duration-200 py-5 px-4 flex flex-col items-center justify-center gap-1.5 text-center rounded-lg border border-[#E0DFDC]"
                    >
                      <span className="text-[12px] font-bold uppercase tracking-wider text-[#0C0C0C] group-hover:text-[#FAFAF8] transition-colors" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                        {t.category}
                      </span>
                      <span className="text-[10px] text-[#78716C] group-hover:text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                        {t.count}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Women's Footwear */}
          {footwearWomenTiles.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#78716C] mb-3 sm:mb-5" style={{ fontFamily: 'Space Mono' }}>Women</p>

              {/* Mobile: horizontal scroll */}
              <div className="md:hidden -mx-4 overflow-x-auto hide-scrollbar">
                <div className="flex gap-2.5 px-4 pb-1" style={{ width: 'max-content' }}>
                  {footwearWomenTiles.map(t => (
                    <Link
                      key={t.category}
                      href={`/products?gender=Women&category=${encodeURIComponent(t.category)}`}
                      className="flex-shrink-0 w-[130px] bg-[#F1F0EE] border border-[#E0DFDC] rounded-xl overflow-hidden active:bg-[#0C0C0C] active:border-[#0C0C0C] transition-colors"
                    >
                      <div className="w-[130px] h-[100px] bg-[#E8E7E4] flex items-center justify-center p-2 overflow-hidden rounded-t-xl">
                        {t.product?.primaryImage
                          ? <img src={t.product.primaryImage} alt={t.category} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                          : <span className="text-[#E0DFDC] text-3xl font-black" style={{ fontFamily: 'Outfit' }}>-</span>
                        }
                      </div>
                      <div className="p-2.5 border-t border-[#E0DFDC]">
                        <p className="text-[10px] font-black uppercase tracking-wide text-[#0C0C0C] leading-tight" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>{t.category}</p>
                        <p className="text-[9px] text-[#78716C] mt-0.5" style={{ fontFamily: 'Space Mono' }}>{t.count} styles</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Desktop: editorial tiles */}
              <div className="hidden md:grid md:grid-cols-3 gap-3">
                {footwearWomenTiles.slice(0, 3).map(t => (
                  <Link
                    key={t.category}
                    href={`/products?gender=Women&category=${encodeURIComponent(t.category)}`}
                    className="group relative bg-[#F1F0EE] rounded-xl overflow-hidden aspect-[4/3] flex flex-col justify-between p-6 hover:shadow-lg transition-shadow duration-300"
                  >
                    {t.product?.primaryImage && (
                      <div className="absolute inset-0 flex items-center justify-center p-8 opacity-70 group-hover:opacity-90 transition-opacity duration-500">
                        <img
                          src={t.product.primaryImage}
                          alt={t.category}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    )}
                    <div className="relative z-10">
                      <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                        {t.count} styles
                      </span>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#0C0C0C] group-hover:text-[#E11D48] transition-colors" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                        {t.category}
                      </h3>
                      <p className="text-[11px] text-[#78716C] mt-1 flex items-center gap-1" style={{ fontFamily: 'Figtree' }}>
                        Shop now <ArrowRight className="w-3 h-3" />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {footwearWomenTiles.length > 3 && (
                <div className="hidden md:grid md:grid-cols-4 gap-3 mt-3">
                  {footwearWomenTiles.slice(3).map(t => (
                    <Link
                      key={t.category}
                      href={`/products?gender=Women&category=${encodeURIComponent(t.category)}`}
                      className="group bg-[#FAFAF8] hover:bg-[#0C0C0C] transition-colors duration-200 py-5 px-4 flex flex-col items-center justify-center gap-1.5 text-center rounded-lg border border-[#E0DFDC]"
                    >
                      <span className="text-[12px] font-bold uppercase tracking-wider text-[#0C0C0C] group-hover:text-[#FAFAF8] transition-colors" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                        {t.category}
                      </span>
                      <span className="text-[10px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                        {t.count}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── SHOP CLOTHING ── */}
      <section className="border-b border-[#E0DFDC]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          <div className="flex items-baseline justify-between mb-5 sm:mb-8 md:mb-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-[10px] tracking-[0.18em] uppercase text-[#78716C] font-bold" style={{ fontFamily: 'Space Mono' }}>02 /</span>
              <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                Shop Clothing
              </h2>
            </div>
            <Link href="/products?section=Clothing" className="text-[11px] font-bold uppercase tracking-widest text-[#E11D48] hover:text-[#0C0C0C] transition-colors flex items-center gap-1" style={{ fontFamily: 'Outfit' }}>
              All Clothing ({totalClothing}) <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Men's Clothing */}
          {clothingMenTiles.length > 0 && (
            <div className="mb-8 md:mb-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#78716C] mb-3 sm:mb-5" style={{ fontFamily: 'Space Mono' }}>Men</p>

              {/* Mobile: horizontal scroll */}
              <div className="md:hidden -mx-4 overflow-x-auto hide-scrollbar">
                <div className="flex gap-2.5 px-4 pb-1" style={{ width: 'max-content' }}>
                  {clothingMenTiles.map(t => (
                    <Link
                      key={t.category}
                      href={`/products?gender=Men&category=${encodeURIComponent(t.category)}`}
                      className="flex-shrink-0 w-[130px] bg-[#F1F0EE] border border-[#E0DFDC] rounded-xl overflow-hidden active:bg-[#0C0C0C] active:border-[#0C0C0C] transition-colors"
                    >
                      <div className="w-[130px] h-[100px] bg-[#E8E7E4] flex items-center justify-center p-2 overflow-hidden rounded-t-xl">
                        {t.product?.primaryImage
                          ? <img src={t.product.primaryImage} alt={t.category} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                          : <span className="text-[#E0DFDC] text-3xl font-black" style={{ fontFamily: 'Outfit' }}>-</span>
                        }
                      </div>
                      <div className="p-2.5 border-t border-[#E0DFDC]">
                        <p className="text-[10px] font-black uppercase tracking-wide text-[#0C0C0C] leading-tight" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>{t.category}</p>
                        <p className="text-[9px] text-[#78716C] mt-0.5" style={{ fontFamily: 'Space Mono' }}>{t.count} styles</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Desktop: editorial tiles */}
              <div className="hidden md:grid md:grid-cols-3 gap-3">
                {clothingMenTiles.slice(0, 3).map(t => (
                  <Link
                    key={t.category}
                    href={`/products?gender=Men&category=${encodeURIComponent(t.category)}`}
                    className="group relative bg-[#F1F0EE] rounded-xl overflow-hidden aspect-[4/3] flex flex-col justify-between p-6 hover:shadow-lg transition-shadow duration-300"
                  >
                    {t.product?.primaryImage && (
                      <div className="absolute inset-0 flex items-center justify-center p-8 opacity-70 group-hover:opacity-90 transition-opacity duration-500">
                        <img
                          src={t.product.primaryImage}
                          alt={t.category}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    )}
                    <div className="relative z-10">
                      <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                        {t.count} styles
                      </span>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#0C0C0C] group-hover:text-[#E11D48] transition-colors" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                        {t.category}
                      </h3>
                      <p className="text-[11px] text-[#78716C] mt-1 flex items-center gap-1" style={{ fontFamily: 'Figtree' }}>
                        Shop now <ArrowRight className="w-3 h-3" />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {clothingMenTiles.length > 3 && (
                <div className="hidden md:grid md:grid-cols-4 gap-3 mt-3">
                  {clothingMenTiles.slice(3).map(t => (
                    <Link
                      key={t.category}
                      href={`/products?gender=Men&category=${encodeURIComponent(t.category)}`}
                      className="group bg-[#FAFAF8] hover:bg-[#0C0C0C] transition-colors duration-200 py-5 px-4 flex flex-col items-center justify-center gap-1.5 text-center rounded-lg border border-[#E0DFDC]"
                    >
                      <span className="text-[12px] font-bold uppercase tracking-wider text-[#0C0C0C] group-hover:text-[#FAFAF8] transition-colors" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                        {t.category}
                      </span>
                      <span className="text-[10px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                        {t.count}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Women's Clothing */}
          {clothingWomenTiles.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#78716C] mb-3 sm:mb-5" style={{ fontFamily: 'Space Mono' }}>Women</p>

              {/* Mobile: horizontal scroll */}
              <div className="md:hidden -mx-4 overflow-x-auto hide-scrollbar">
                <div className="flex gap-2.5 px-4 pb-1" style={{ width: 'max-content' }}>
                  {clothingWomenTiles.map(t => (
                    <Link
                      key={t.category}
                      href={`/products?gender=Women&category=${encodeURIComponent(t.category)}`}
                      className="flex-shrink-0 w-[130px] bg-[#F1F0EE] border border-[#E0DFDC] rounded-xl overflow-hidden active:bg-[#0C0C0C] active:border-[#0C0C0C] transition-colors"
                    >
                      <div className="w-[130px] h-[100px] bg-[#E8E7E4] flex items-center justify-center p-2 overflow-hidden rounded-t-xl">
                        {t.product?.primaryImage
                          ? <img src={t.product.primaryImage} alt={t.category} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                          : <span className="text-[#E0DFDC] text-3xl font-black" style={{ fontFamily: 'Outfit' }}>-</span>
                        }
                      </div>
                      <div className="p-2.5 border-t border-[#E0DFDC]">
                        <p className="text-[10px] font-black uppercase tracking-wide text-[#0C0C0C] leading-tight" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>{t.category}</p>
                        <p className="text-[9px] text-[#78716C] mt-0.5" style={{ fontFamily: 'Space Mono' }}>{t.count} styles</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Desktop: editorial tiles */}
              <div className="hidden md:grid md:grid-cols-3 gap-3">
                {clothingWomenTiles.slice(0, 3).map(t => (
                  <Link
                    key={t.category}
                    href={`/products?gender=Women&category=${encodeURIComponent(t.category)}`}
                    className="group relative bg-[#F1F0EE] rounded-xl overflow-hidden aspect-[4/3] flex flex-col justify-between p-6 hover:shadow-lg transition-shadow duration-300"
                  >
                    {t.product?.primaryImage && (
                      <div className="absolute inset-0 flex items-center justify-center p-8 opacity-70 group-hover:opacity-90 transition-opacity duration-500">
                        <img
                          src={t.product.primaryImage}
                          alt={t.category}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    )}
                    <div className="relative z-10">
                      <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                        {t.count} styles
                      </span>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#0C0C0C] group-hover:text-[#E11D48] transition-colors" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                        {t.category}
                      </h3>
                      <p className="text-[11px] text-[#78716C] mt-1 flex items-center gap-1" style={{ fontFamily: 'Figtree' }}>
                        Shop now <ArrowRight className="w-3 h-3" />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {clothingWomenTiles.length > 3 && (
                <div className="hidden md:grid md:grid-cols-4 gap-3 mt-3">
                  {clothingWomenTiles.slice(3).map(t => (
                    <Link
                      key={t.category}
                      href={`/products?gender=Women&category=${encodeURIComponent(t.category)}`}
                      className="group bg-[#FAFAF8] hover:bg-[#0C0C0C] transition-colors duration-200 py-5 px-4 flex flex-col items-center justify-center gap-1.5 text-center rounded-lg border border-[#E0DFDC]"
                    >
                      <span className="text-[12px] font-bold uppercase tracking-wider text-[#0C0C0C] group-hover:text-[#FAFAF8] transition-colors" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                        {t.category}
                      </span>
                      <span className="text-[10px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                        {t.count}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURED PICKS ── */}
      <section className="border-b border-[#E0DFDC]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          <div className="flex items-baseline justify-between mb-5 sm:mb-8 md:mb-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-[10px] tracking-[0.18em] uppercase text-[#78716C] font-bold" style={{ fontFamily: 'Space Mono' }}>03 /</span>
              <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                Featured Picks
              </h2>
            </div>
            <Link href="/products" className="text-[11px] font-bold uppercase tracking-widest text-[#E11D48] hover:text-[#0C0C0C] transition-colors flex items-center gap-1" style={{ fontFamily: 'Outfit' }}>
              Shop All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {featured.map(p => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id, slug: p.slug, name: p.name, brand: p.category,
                  price: p.price, priceFormatted: p.priceFormatted,
                  imageUrl: p.primaryImage, color: p.color, sizes: p.sizes,
                  isNew: true, section: p.section,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND PROMISE — dark editorial ── */}
      <section className="border-b border-[#E0DFDC] bg-[#0C0C0C]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5 sm:mb-8">
                <span className="w-8 h-px bg-[#E11D48]" />
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#E11D48] font-bold" style={{ fontFamily: 'Space Mono' }}>
                  Our Promise
                </span>
              </div>
              <h2 className="text-[clamp(36px,7vw,72px)] font-black uppercase leading-[0.9] tracking-tighter text-[#FAFAF8] mb-4 sm:mb-6" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                QUALITY
                <br />
                <span className="text-[#E11D48]">VERIFIED.</span>
                <br />
                ALWAYS.
              </h2>
              <p className="text-[#78716C] text-sm sm:text-base leading-relaxed max-w-md" style={{ fontFamily: 'Figtree', fontWeight: 300 }}>
                AVIK ERETAIL is your trusted multi-category retailer. Every product that enters our warehouse goes through a rigorous quality verification process before it ever ships. No exceptions.
              </p>
              <Link
                href="/products"
                className="mt-6 sm:mt-8 inline-flex items-center gap-2 text-[#FAFAF8] border-b border-[#FAFAF8]/30 pb-0.5 text-sm font-bold hover:border-[#E11D48] hover:text-[#E11D48] transition-colors"
                style={{ fontFamily: 'Outfit', fontWeight: 700, letterSpacing: '0.06em' }}
              >
                BROWSE COLLECTION <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { step: '01', icon: ShieldCheck, title: 'Source Verification', desc: 'Every product sourced only from authorised brands, retailers, and verified sellers.' },
                { step: '02', icon: PackageCheck, title: 'Quality Inspection', desc: 'Materials, construction, and packaging inspected by experts before listing.' },
                { step: '03', icon: BadgeIndianRupee, title: 'Fair Pricing', desc: 'Transparent pricing with no hidden markups. Best value across footwear and clothing.' },
                { step: '04', icon: Truck, title: 'Fast Delivery', desc: 'Reliable shipping across India with tracking and careful packaging for every order.' },
              ].map(s => (
                <div key={s.step} className="bg-[#161616] rounded-xl p-4 sm:p-6 hover:bg-[#1E1E1E] transition-colors">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <p className="text-[10px] text-[#E11D48] font-bold tracking-[0.15em]" style={{ fontFamily: 'Space Mono' }}>{s.step}</p>
                    <s.icon className="w-3.5 h-3.5 text-[#E11D48]" />
                  </div>
                  <h4 className="text-[#FAFAF8] font-bold text-xs sm:text-sm uppercase tracking-wide mb-1.5 sm:mb-2" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{s.title}</h4>
                  <p className="text-[#78716C] text-[12px] sm:text-[13px] leading-relaxed hidden sm:block" style={{ fontFamily: 'Figtree' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="border-b border-[#E0DFDC]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          <div className="flex items-baseline justify-between mb-5 sm:mb-8 md:mb-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-[10px] tracking-[0.18em] uppercase text-[#78716C] font-bold" style={{ fontFamily: 'Space Mono' }}>04 /</span>
              <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                New Arrivals
              </h2>
            </div>
            <Link href="/products" className="text-[11px] font-bold uppercase tracking-widest text-[#E11D48] hover:text-[#0C0C0C] transition-colors flex items-center gap-1" style={{ fontFamily: 'Outfit' }}>
              See All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {newArrivals.map(p => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id, slug: p.slug, name: p.name, brand: p.category,
                  price: p.price, priceFormatted: p.priceFormatted,
                  imageUrl: p.primaryImage, color: p.color, sizes: p.sizes,
                  section: p.section,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="border-b border-[#E0DFDC]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E0DFDC]">
            {[
              {
                number: '100%',
                title: 'Genuine Products',
                desc: 'Every item undergoes strict quality verification. Found an issue? Full refund, no questions asked.',
              },
              {
                number: '7D',
                title: 'Hassle-Free Returns',
                desc: 'Changed your mind? Return any unused item within 7 days for a full refund or store credit.',
              },
            ].map(item => (
              <div key={item.title} className="px-4 py-8 sm:px-8 sm:py-12">
                <p className="text-[clamp(28px,4vw,48px)] font-black text-[#0C0C0C] leading-none mb-3 sm:mb-4" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>
                  {item.number}
                </p>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#0C0C0C] mb-2 sm:mb-3" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                  {item.title}
                </h3>
                <p className="text-[13px] text-[#78716C] leading-relaxed" style={{ fontFamily: 'Figtree' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="bg-[#0C0C0C]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
            <div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#E11D48] font-bold mb-2 sm:mb-3" style={{ fontFamily: 'Space Mono' }}>
                Ready to Shop?
              </p>
              <h2 className="text-[clamp(28px,5vw,56px)] font-black uppercase leading-[0.9] tracking-tighter text-[#FAFAF8]" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                {allProducts.length}+ STYLES.
                <br />
                ONE PLACE.
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-[#E11D48] text-white px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#BE123C] transition-colors whitespace-nowrap rounded-lg"
                style={{ fontFamily: 'Outfit', fontWeight: 700 }}
              >
                SHOP NOW
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 border border-[#2A2A2A] text-[#78716C] px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-bold uppercase tracking-widest hover:border-[#FAFAF8] hover:text-[#FAFAF8] transition-colors whitespace-nowrap rounded-lg"
                style={{ fontFamily: 'Outfit', fontWeight: 700 }}
              >
                CREATE ACCOUNT
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
