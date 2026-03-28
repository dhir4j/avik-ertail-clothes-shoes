'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { getProductBySlug, getRelatedProducts } from '@/lib/data';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import ProductCard from '@/components/product/ProductCard';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);
  const addItem = useCartStore(s => s.addItem);
  const user = useAuthStore(s => s.user);
  const router = useRouter();

  const [activeImage, setActiveImage] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
  const [specsOpen, setSpecsOpen] = useState(product?.section === 'Clothing' && isDesktop);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FAFAF8] px-6">
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#78716C] mb-4" style={{ fontFamily: 'Space Mono' }}>404</p>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-[#0C0C0C] mb-6" style={{ fontFamily: 'Outfit' }}>Not Found</h1>
        <Link href="/products" className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2 rounded-lg" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    );
  }

  const related = getRelatedProducts(product, 4);
  const rawImages = product.images.length > 0 ? product.images : [product.primaryImage].filter(Boolean);
  const allImages = rawImages.filter(img => !failedImages.has(img));

  const handleImageError = (img: string) => {
    setFailedImages(prev => {
      const next = new Set(prev);
      next.add(img);
      return next;
    });
    // If the active image just failed, move to next valid one
    setActiveImage(i => Math.max(0, i > 0 ? i - 1 : 0));
  };

  const handleAddToCart = () => {
    if (!user) {
      router.push(`/login?redirect=/products/${slug}`);
      return;
    }
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    const idNum = parseInt(product.id) || Math.abs(product.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
    addItem({
      productId: idNum,
      variantId: idNum * 100 + product.sizes.indexOf(selectedSize),
      name: product.name,
      size: selectedSize,
      color: product.color,
      price: product.price,
      imageUrl: product.primaryImage,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      {/* Breadcrumb — hidden on mobile, shown from sm */}
      <div className="border-b border-[#E0DFDC] hidden sm:block">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-[11px] overflow-x-auto hide-scrollbar" style={{ fontFamily: 'Space Mono' }}>
          <Link href="/" className="text-[#78716C] hover:text-[#0C0C0C] transition-colors whitespace-nowrap">Home</Link>
          <span className="text-[#E0DFDC]">/</span>
          <Link href="/products" className="text-[#78716C] hover:text-[#0C0C0C] transition-colors whitespace-nowrap">All Styles</Link>
          <span className="text-[#E0DFDC]">/</span>
          <Link href={`/products?section=${encodeURIComponent(product.section)}`} className="text-[#78716C] hover:text-[#0C0C0C] transition-colors whitespace-nowrap">{product.section}</Link>
          <span className="text-[#E0DFDC]">/</span>
          <Link href={`/products?gender=${encodeURIComponent(product.gender)}`} className="text-[#78716C] hover:text-[#0C0C0C] transition-colors whitespace-nowrap">{product.gender}</Link>
          <span className="text-[#E0DFDC]">/</span>
          <Link href={`/products?gender=${encodeURIComponent(product.gender)}&category=${encodeURIComponent(product.category)}`} className="text-[#78716C] hover:text-[#0C0C0C] transition-colors whitespace-nowrap">{product.category}</Link>
          <span className="text-[#E0DFDC]">/</span>
          <span className="text-[#0C0C0C] truncate max-w-[200px] whitespace-nowrap">{product.name}</span>
        </div>
      </div>

      {/* Mobile back link */}
      <div className="sm:hidden border-b border-[#E0DFDC]">
        <div className="px-4 py-3">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#78716C] hover:text-[#0C0C0C] transition-colors uppercase tracking-wider" style={{ fontFamily: 'Space Mono' }}>
            <ArrowLeft className="w-3 h-3" /> All Styles
          </Link>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-0 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 sm:border-x sm:border-[#E0DFDC]">

          {/* Left: Images */}
          <div className="sm:border-r sm:border-[#E0DFDC] py-4 sm:py-8 sm:pr-8 px-4 sm:px-0">
            {/* Main image */}
            <div className="aspect-square bg-[#F1F0EE] overflow-hidden mb-3 sm:mb-4 rounded-xl">
              {allImages[activeImage] ? (
                <img
                  src={allImages[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 sm:p-8"
                  onError={() => handleImageError(allImages[activeImage])}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-20 h-20 text-[#E0DFDC]" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {allImages.slice(0, 5).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square bg-[#F1F0EE] overflow-hidden border-2 transition-colors rounded-lg ${
                      activeImage === i ? 'border-[#0C0C0C]' : 'border-transparent hover:border-[#E0DFDC]'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-1.5 sm:p-2" onError={() => handleImageError(img)} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="py-4 sm:py-8 sm:pl-8 px-4 sm:px-0 flex flex-col">
            {/* Category + gender + colour */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <Link
                href={`/products?gender=${encodeURIComponent(product.gender)}&category=${encodeURIComponent(product.category)}`}
                className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#78716C] hover:text-[#E11D48] transition-colors"
                style={{ fontFamily: 'Space Mono' }}
              >
                {product.gender} · {product.category}
              </Link>
              {product.color && (
                <>
                  <span className="w-px h-3 bg-[#E0DFDC]" />
                  <span className="text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{product.color}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0C0C0C] leading-tight mb-4 sm:mb-6" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-[#E0DFDC]">
              <p className="text-3xl font-bold text-[#0C0C0C]" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>
                {product.priceFormatted}
              </p>
              <span className="text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>Incl. all taxes</span>
            </div>

            {/* Size selector */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#0C0C0C]" style={{ fontFamily: 'Space Mono' }}>
                  Select Size (IN/UK)
                </p>
                {sizeError && (
                  <p className="text-[11px] text-[#E03A1E] font-bold" style={{ fontFamily: 'Space Mono' }}>
                    Please select a size
                  </p>
                )}
              </div>

              {product.sizes.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      className={`py-3 sm:py-2.5 text-[13px] font-bold border transition-colors touch-manipulation rounded-lg ${
                        selectedSize === size
                          ? 'bg-[#0C0C0C] text-[#FAFAF8] border-[#0C0C0C]'
                          : 'bg-transparent text-[#0C0C0C] border-[#E0DFDC] hover:border-[#0C0C0C]'
                      }`}
                      style={{ fontFamily: 'Space Mono' }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[#E03A1E] text-sm" style={{ fontFamily: 'Space Mono' }}>Out of stock</p>
              )}
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.sizes.length === 0}
              className={`w-full py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-colors mb-4 rounded-lg ${
                added
                  ? 'bg-[#E11D48] text-white'
                  : 'bg-[#0C0C0C] text-[#FAFAF8] hover:bg-[#2A2924] disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              style={{ fontFamily: 'Outfit', fontWeight: 700 }}
            >
              <ShoppingBag className="w-4 h-4" />
              {added ? 'Added to Cart!' : selectedSize ? `Add to Cart — ${product.priceFormatted}` : 'Add to Cart'}
            </button>

            <Link
              href="/cart"
              className={`w-full py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 border border-[#E0DFDC] hover:border-[#0C0C0C] transition-colors rounded-lg ${added ? 'block' : 'hidden'}`}
              style={{ fontFamily: 'Outfit', fontWeight: 700 }}
            >
              View Cart
            </Link>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-[#E0DFDC]">
              {[
                { icon: '✓', label: 'Verified Quality', sub: '100% genuine' },
                { icon: '⚡', label: 'Fast Dispatch', sub: '24–48 hrs' },
                { icon: '↩', label: 'Easy Returns', sub: '7 days' },
              ].map(t => (
                <div key={t.label} className="text-center">
                  <p className="text-[#E11D48] text-lg mb-1">{t.icon}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#0C0C0C]" style={{ fontFamily: 'Outfit' }}>{t.label}</p>
                  <p className="text-[10px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{t.sub}</p>
                </div>
              ))}
            </div>

            {/* Specifications accordion */}
            {Object.keys(product.specifications).length > 0 && (
              <div className="mt-8 border-t border-[#E0DFDC]">
                <button
                  onClick={() => setSpecsOpen(!specsOpen)}
                  className="w-full flex items-center justify-between py-4 text-sm font-bold uppercase tracking-wider"
                  style={{ fontFamily: 'Outfit' }}
                >
                  Specifications
                  {specsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {specsOpen && (
                  <div className="pb-6 space-y-2">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="flex gap-4 text-[13px]">
                        <span className="text-[#78716C] w-36 flex-shrink-0" style={{ fontFamily: 'Space Mono' }}>{key}</span>
                        <span className="text-[#0C0C0C]" style={{ fontFamily: 'Figtree' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="py-8 sm:py-16 border-t border-[#E0DFDC] px-4 sm:px-0">
            <div className="flex items-baseline justify-between mb-6 sm:mb-10">
              <div className="flex items-center gap-4">
                <span className="text-[11px] tracking-[0.15em] uppercase text-[#78716C] font-bold" style={{ fontFamily: 'Space Mono' }}>More</span>
                <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
                  More {product.category}
                </h2>
              </div>
              <Link href={`/products?gender=${encodeURIComponent(product.gender)}&category=${encodeURIComponent(product.category)}`} className="text-[12px] font-bold uppercase tracking-widest text-[#E11D48] hover:text-[#0C0C0C] transition-colors" style={{ fontFamily: 'Outfit' }}>
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-[#E0DFDC] border border-[#E0DFDC]">
              {related.map(p => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    brand: p.category,
                    price: p.price,
                    priceFormatted: p.priceFormatted,
                    imageUrl: p.primaryImage,
                    color: p.color,
                    sizes: p.sizes,
                    section: p.section,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
