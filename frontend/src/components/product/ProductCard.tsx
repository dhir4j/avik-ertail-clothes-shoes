'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';

export interface ProductSummary {
  id: string | number;
  slug: string;
  name: string;
  brand: string;
  price: number;
  priceFormatted?: string;
  imageUrl: string;
  color?: string;
  sizes?: string[];
  isNew?: boolean;
  section?: string; // 'Footwear' | 'Clothing'
}

export default function ProductCard({ product }: { product: ProductSummary }) {
  const addItem = useCartStore(s => s.addItem);
  const user = useAuthStore(s => s.user);
  const router = useRouter();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/products/${product.slug}`);
      return;
    }
    const idNum = typeof product.id === 'number' ? product.id : parseInt(product.id) || 0;
    addItem({
      productId: idNum,
      variantId: idNum,
      name: product.name,
      size: product.sizes?.[0] || 'One Size',
      color: product.color,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
    });
  };

  const formatted = product.priceFormatted ?? ('₹' + product.price.toLocaleString('en-IN'));

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="product-card overflow-hidden relative rounded-xl">
        {product.isNew && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className="inline-block rounded-md bg-[#0C0C0C] text-white px-2 py-0.5"
              style={{ fontFamily: 'Space Mono', fontSize: 10 }}
            >
              NEW
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
          <span
            className="inline-block rounded-md bg-white/90 text-[#0C0C0C] border border-[#E0DFDC] px-2 py-0.5 backdrop-blur-sm"
            style={{ fontFamily: 'Space Mono', fontSize: 10 }}
          >
            {product.brand.toUpperCase()}
          </span>
          {product.section && (
            <span
              className="inline-block rounded-full bg-[#0C0C0C]/70 text-white px-2.5 py-0.5 backdrop-blur-sm"
              style={{ fontFamily: 'Space Mono', fontSize: 9 }}
            >
              {product.section}
            </span>
          )}
        </div>

        <div className="relative aspect-square bg-[#F1F0EE] overflow-hidden rounded-t-[11px]">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-[#E0DFDC]" />
            </div>
          )}

          {/* Quick add — slides up on hover */}
          <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <button
              onClick={handleQuickAdd}
              className="w-full bg-[#0C0C0C] text-white py-3 text-[12px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#1A1A1A] transition-colors rounded-b-[11px]"
              style={{ fontFamily: 'Outfit' }}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {user ? 'Quick Add' : 'Sign In to Buy'}
            </button>
          </div>
        </div>

        <div className="p-4">
          <p
            className="text-[11px] text-[#78716C] tracking-widest uppercase mb-1"
            style={{ fontFamily: 'Space Mono' }}
          >
            {product.color || product.brand}
          </p>
          <h3
            className="font-bold text-[#0C0C0C] text-sm leading-tight mb-3 line-clamp-2 group-hover:text-[#E11D48] transition-colors"
            style={{ fontFamily: 'Outfit', fontWeight: 700 }}
          >
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <p
              className="text-base font-bold text-[#0C0C0C]"
              style={{ fontFamily: 'Space Mono', fontWeight: 700 }}
            >
              {formatted}
            </p>
            {product.sizes && product.sizes.length > 0 && (
              <p className="text-[10px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                {product.sizes.length} sizes
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
