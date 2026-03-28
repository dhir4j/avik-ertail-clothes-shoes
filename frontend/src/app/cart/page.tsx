'use client';

import { useCartStore } from '@/store/cart-store';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const total = getTotal();
  const freeShipping = total >= 2000;

  if (items.length === 0) {
    return (
      <div className="bg-[#FAFAF8] min-h-[70vh] flex flex-col items-center justify-center px-6">
        <ShoppingBag className="w-16 h-16 text-[#E0DFDC] mb-6" />
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#78716C] mb-3" style={{ fontFamily: 'Space Mono' }}>
          Cart is empty
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-[#0C0C0C] mb-8" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
          No Kicks Yet
        </h1>
        <Link
          href="/products"
          className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-sm"
          style={{ fontFamily: 'Outfit', fontWeight: 700, letterSpacing: '0.06em' }}
        >
          BROWSE COLLECTION
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      {/* Header */}
      <div className="border-b border-[#E0DFDC]">
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
            Your Cart
          </h1>
          <p className="text-[11px] text-[#78716C] mt-1" style={{ fontFamily: 'Space Mono' }}>
            {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-px border border-[#E0DFDC]">
            {items.map((item) => (
              <div key={item.variantId} className="bg-[#FAFAF8] flex gap-4 p-4 sm:p-6 border-b border-[#E0DFDC] last:border-b-0">
                {/* Image */}
                <div className="w-24 h-24 bg-[#F1F0EE] flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-[#E0DFDC]" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-[10px] text-[#78716C] tracking-widest uppercase mb-1" style={{ fontFamily: 'Space Mono' }}>
                        {item.color || ''}
                      </p>
                      <h3 className="font-bold text-sm text-[#0C0C0C] leading-tight line-clamp-2" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-[#78716C] mt-1" style={{ fontFamily: 'Space Mono' }}>
                        UK {item.size}
                      </p>
                    </div>
                    <p className="text-base font-bold text-[#0C0C0C] whitespace-nowrap flex-shrink-0" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity */}
                    <div className="flex items-center border border-[#E0DFDC]">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="p-2 hover:bg-[#F1F0EE] transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-[13px] font-bold" style={{ fontFamily: 'Space Mono' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="p-2 hover:bg-[#F1F0EE] transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="flex items-center gap-1.5 text-[11px] text-[#E03A1E] hover:text-[#0C0C0C] transition-colors font-bold uppercase tracking-wider"
                      style={{ fontFamily: 'Outfit' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-[84px] border border-[#E0DFDC]">
              <div className="p-6 border-b border-[#E0DFDC]">
                <h2 className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                  Order Summary
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#78716C]" style={{ fontFamily: 'Figtree' }}>Subtotal ({items.length} items)</span>
                  <span className="font-bold" style={{ fontFamily: 'Space Mono' }}>₹{total.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-[#78716C]" style={{ fontFamily: 'Figtree' }}>Shipping</span>
                  <span className={`font-bold ${freeShipping ? 'text-[#E11D48]' : ''}`} style={{ fontFamily: 'Space Mono' }}>
                    {freeShipping ? 'FREE' : '₹199'}
                  </span>
                </div>

                {!freeShipping && (
                  <p className="text-[11px] text-[#78716C] bg-[#F1F0EE] px-3 py-2" style={{ fontFamily: 'Space Mono' }}>
                    Add ₹{(2000 - total).toLocaleString('en-IN')} more for free shipping
                  </p>
                )}

                <div className="border-t border-[#E0DFDC] pt-4 flex justify-between">
                  <span className="font-bold uppercase tracking-wider text-sm" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Total</span>
                  <span className="text-xl font-bold" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>
                    ₹{(total + (freeShipping ? 0 : 199)).toLocaleString('en-IN')}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-sm mt-2"
                  style={{ fontFamily: 'Outfit', fontWeight: 700, letterSpacing: '0.08em' }}
                >
                  PROCEED TO CHECKOUT
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/products"
                  className="w-full py-3 flex items-center justify-center gap-2 text-sm border border-[#E0DFDC] hover:border-[#0C0C0C] transition-colors text-[#78716C] hover:text-[#0C0C0C]"
                  style={{ fontFamily: 'Outfit', fontWeight: 600, letterSpacing: '0.06em' }}
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Trust */}
              <div className="px-6 pb-6">
                <div className="border-t border-[#E0DFDC] pt-4 space-y-2">
                  {['✓ Authenticated sneakers', '⚡ Ships in 24–48 hours', '↩ 7-day easy returns'].map(t => (
                    <p key={t} className="text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{t}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
