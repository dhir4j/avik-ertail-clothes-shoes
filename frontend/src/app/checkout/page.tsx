'use client';

import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag, Lock, Truck,
  CreditCard, Smartphone, Building2, Wallet, Banknote,
  Clock, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { apiClient } from '@/lib/api/client';

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'Required'),
  lastName: z.string().min(2, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Min 10 digits'),
  address: z.string().min(5, 'Required'),
  city: z.string().min(2, 'Required'),
  state: z.string().min(2, 'Required'),
  pincode: z.string().min(6, 'Required'),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    sub: 'Visa · Mastercard · RuPay · Amex',
    icon: CreditCard,
    tags: ['VISA', 'MC', 'RUPAY', 'AMEX'],
    detail: 'Secure card payment via PCI-DSS compliant gateway. All major credit and debit cards accepted.',
  },
  {
    id: 'upi',
    label: 'UPI',
    sub: 'GPay · PhonePe · Paytm · BHIM · Any UPI app',
    icon: Smartphone,
    tags: ['GPay', 'PhonePe', 'Paytm', 'BHIM'],
    detail: 'Instant payment via any UPI app. Scan QR or pay via your UPI ID.',
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    sub: 'All major Indian banks supported',
    icon: Building2,
    tags: ['SBI', 'HDFC', 'ICICI', 'Axis', '+200'],
    detail: 'Secure redirect to your bank\'s net banking portal. All Indian banks supported.',
  },
  {
    id: 'wallet',
    label: 'Wallets',
    sub: 'Paytm · Mobikwik · Freecharge · Amazon Pay',
    icon: Wallet,
    tags: ['Paytm', 'Mobikwik', 'Amazon'],
    detail: 'Pay using your preferred digital wallet balance.',
  },
  {
    id: 'bnpl',
    label: 'Buy Now, Pay Later',
    sub: 'Simpl · LazyPay · ZestMoney · Snapmint',
    icon: Clock,
    tags: ['Simpl', 'LazyPay', 'ZestMoney'],
    detail: 'Split your purchase into easy EMIs or pay after delivery.',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    sub: 'Pay when your order arrives at your door',
    icon: Banknote,
    tags: [],
    detail: 'Available for orders up to ₹50,000. Pay cash or card to the delivery executive.',
  },
];

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-1.5" style={{ fontFamily: 'Space Mono' }}>
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-[#E03A1E] mt-1" style={{ fontFamily: 'Space Mono' }}>{error}</p>}
    </div>
  );
}

const inputClass = 'input-base w-full px-4 py-2.5 text-sm';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderError, setOrderError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('cod');

  const total = getTotal();
  const shipping = total >= 2000 ? 0 : 199;
  const grandTotal = total + shipping;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
    },
  });

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="bg-[#FAFAF8] min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#78716C] mb-4" style={{ fontFamily: 'Space Mono' }}>Your cart is empty</p>
          <Link href="/products" className="btn-primary px-6 py-3 text-sm inline-block" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="bg-[#FAFAF8] min-h-[80vh] flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 bg-[#0C0C0C] flex items-center justify-center mb-6">
          <span className="text-[#E11D48] text-2xl font-bold">✓</span>
        </div>
        <p className="text-[11px] tracking-[0.2em] uppercase text-[#E11D48] mb-3" style={{ fontFamily: 'Space Mono' }}>
          Order Confirmed
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-[#0C0C0C] mb-4" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
          You&apos;re All Set!
        </h1>
        <p className="text-[#78716C] mb-2" style={{ fontFamily: 'Figtree' }}>Order ID: <span className="font-bold text-[#0C0C0C]">{orderId}</span></p>
        <p className="text-sm text-[#78716C] max-w-sm text-center mb-8" style={{ fontFamily: 'Figtree' }}>
          Your order has been received. Our team will confirm and dispatch within 24–48 hours.
        </p>
        <div className="flex gap-4">
          <Link href="/orders" className="btn-primary px-6 py-3 text-sm" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
            VIEW ORDERS
          </Link>
          <Link href="/products" className="btn-outline px-6 py-3 text-sm" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
            SHOP MORE
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    setOrderError('');
    try {
      const res = await apiClient.post('/orders', {
        shipping_name: `${data.firstName} ${data.lastName}`.trim(),
        shipping_phone: data.phone,
        shipping_address_line1: data.address,
        shipping_city: data.city,
        shipping_state: data.state,
        shipping_postal_code: data.pincode,
        payment_method: selectedPayment,
        items: items.map(item => ({
          variant_id: item.variantId,
          name: item.name,
          size: item.size,
          color: item.color || '',
          price: item.price,
          quantity: item.quantity,
          image_url: item.imageUrl || '',
        })),
      });
      const numId = res.data.data.order_id;
      setOrderId('SS-' + String(numId).padStart(6, '0'));
      clearCart();
      setOrderPlaced(true);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setOrderError(message || 'Failed to place order. Please try again.');
    }
  };

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === selectedPayment)!;

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      {/* Header */}
      <div className="border-b border-[#E0DFDC]">
        <div className="max-w-[1440px] mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
              Checkout
            </h1>
            <p className="text-[11px] text-[#78716C] mt-1" style={{ fontFamily: 'Space Mono' }}>
              {items.length} item{items.length !== 1 ? 's' : ''} · ₹{grandTotal.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
            <Lock className="w-3.5 h-3.5" /> Secure Checkout
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Form */}
            <div className="lg:col-span-2 space-y-8">

              {/* Section 1: Contact */}
              <div className="border border-[#E0DFDC]">
                <div className="px-6 py-4 border-b border-[#E0DFDC] flex items-center gap-3">
                  <span className="w-6 h-6 bg-[#0C0C0C] text-[#FAFAF8] flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ fontFamily: 'Space Mono' }}>1</span>
                  <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Contact Information</h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="First Name" error={errors.firstName?.message}>
                    <input {...register('firstName')} className={inputClass} />
                  </FormField>
                  <FormField label="Last Name" error={errors.lastName?.message}>
                    <input {...register('lastName')} className={inputClass} />
                  </FormField>
                  <FormField label="Email" error={errors.email?.message}>
                    <input type="email" {...register('email')} className={inputClass} />
                  </FormField>
                  <FormField label="Phone" error={errors.phone?.message}>
                    <input {...register('phone')} className={inputClass} placeholder="+91 XXXXX XXXXX" />
                  </FormField>
                </div>
              </div>

              {/* Section 2: Shipping */}
              <div className="border border-[#E0DFDC]">
                <div className="px-6 py-4 border-b border-[#E0DFDC] flex items-center gap-3">
                  <span className="w-6 h-6 bg-[#0C0C0C] text-[#FAFAF8] flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ fontFamily: 'Space Mono' }}>2</span>
                  <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Shipping Address</h2>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <FormField label="Street Address" error={errors.address?.message}>
                      <input {...register('address')} className={inputClass} placeholder="House/Flat No., Street, Area" />
                    </FormField>
                  </div>
                  <FormField label="City" error={errors.city?.message}>
                    <input {...register('city')} className={inputClass} />
                  </FormField>
                  <FormField label="State" error={errors.state?.message}>
                    <div className="relative">
                      <select {...register('state')} className={`${inputClass} appearance-none cursor-pointer`} style={{ fontFamily: 'Space Mono' }}>
                        <option value="">Select state</option>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </FormField>
                  <FormField label="Pincode" error={errors.pincode?.message}>
                    <input {...register('pincode')} className={inputClass} placeholder="6-digit pincode" maxLength={6} />
                  </FormField>
                </div>
              </div>

              {/* Section 3: Payment */}
              <div className="border border-[#E0DFDC]">
                <div className="px-6 py-4 border-b border-[#E0DFDC] flex items-center gap-3">
                  <span className="w-6 h-6 bg-[#0C0C0C] text-[#FAFAF8] flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ fontFamily: 'Space Mono' }}>3</span>
                  <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Payment Method</h2>
                </div>

                {/* Payment method list */}
                <div className="divide-y divide-[#E0DFDC]">
                  {PAYMENT_METHODS.map(method => {
                    const Icon = method.icon;
                    const isSelected = selectedPayment === method.id;
                    return (
                      <div key={method.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedPayment(method.id)}
                          className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-colors ${
                            isSelected ? 'bg-[#F1F0EE]' : 'hover:bg-[#F1F0EE]/50'
                          }`}
                        >
                          {/* Radio indicator */}
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                            isSelected ? 'border-[#0C0C0C]' : 'border-[#E0DFDC]'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-[#0C0C0C]" />}
                          </div>

                          {/* Method icon */}
                          <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? 'bg-[#0C0C0C] text-[#FAFAF8]' : 'bg-[#F1F0EE] text-[#78716C]'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-[#0C0C0C]' : 'text-[#0C0C0C]'}`} style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
                              {method.label}
                            </p>
                            <p className="text-[11px] text-[#78716C] truncate" style={{ fontFamily: 'Figtree' }}>
                              {method.sub}
                            </p>
                          </div>

                          {/* Tags + Coming Soon badge */}
                          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                            {method.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-[#E0DFDC] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                                {tag}
                              </span>
                            ))}
                          </div>

                          {method.id !== 'cod' && (
                            <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/30 whitespace-nowrap" style={{ fontFamily: 'Space Mono' }}>
                              Coming Soon
                            </span>
                          )}
                          {method.id === 'cod' && (
                            <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-[#E6F5EC] text-[#2D8A4E] border border-[#2D8A4E]/30 whitespace-nowrap" style={{ fontFamily: 'Space Mono' }}>
                              Available
                            </span>
                          )}

                          <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform text-[#E0DFDC] ${isSelected ? 'rotate-90' : ''}`} />
                        </button>

                        {/* Expanded panel */}
                        {isSelected && method.id === 'cod' && (
                          <div className="mx-6 mb-4 border border-[#2D8A4E]/30 bg-[#E6F5EC]">
                            <div className="p-5 flex items-start gap-4">
                              <div className="w-10 h-10 bg-[#2D8A4E]/10 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-5 h-5 text-[#2D8A4E]" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#0C0C0C] mb-1" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Cash on Delivery</p>
                                <p className="text-[12px] text-[#6B6B6B] leading-relaxed" style={{ fontFamily: 'Figtree' }}>
                                  {method.detail}
                                </p>
                                <div className="mt-3 space-y-1.5">
                                  {[
                                    'No advance payment — pay only when your order arrives',
                                    'Pay by cash or card to the delivery executive',
                                    'Available for orders up to ₹50,000',
                                  ].map(note => (
                                    <p key={note} className="text-[11px] text-[#2D8A4E] font-bold flex gap-2" style={{ fontFamily: 'Space Mono' }}>
                                      <span>✓</span>{note}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {isSelected && method.id !== 'cod' && (
                          <div className="mx-6 mb-4 border border-[#E0DFDC] bg-white">
                            <div className="p-5 flex items-start gap-4">
                              <div className="w-10 h-10 bg-[#E11D48]/10 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-5 h-5 text-[#E11D48]" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-bold text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{method.label}</p>
                                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#E11D48] text-[#0C0C0C]" style={{ fontFamily: 'Space Mono' }}>
                                    Coming Soon
                                  </span>
                                </div>
                                <p className="text-[12px] text-[#78716C] leading-relaxed" style={{ fontFamily: 'Figtree' }}>
                                  {method.detail}
                                </p>
                                <p className="text-[11px] text-[#E11D48] mt-2 font-bold" style={{ fontFamily: 'Space Mono' }}>
                                  We&apos;re integrating this payment method. It will be available soon.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom notice */}
                <div className="px-6 py-4 border-t border-[#E0DFDC] bg-[#F1F0EE] flex items-center gap-3">
                  <Lock className="w-3.5 h-3.5 text-[#78716C] flex-shrink-0" />
                  <p className="text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                    Your payment info is encrypted and never stored on our servers. PCI-DSS compliant.
                  </p>
                </div>
              </div>

              {orderError && (
                <p className="text-[#E03A1E] text-sm text-center py-2 border border-[#E03A1E] px-4" style={{ fontFamily: 'Space Mono' }}>{orderError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0C0C0C] text-[#FAFAF8] py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-[#1F1F1F] disabled:opacity-60 transition-colors"
                style={{ fontFamily: 'Outfit', fontWeight: 700 }}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-[#FAFAF8] border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    PLACE ORDER — ₹{grandTotal.toLocaleString('en-IN')}
                  </>
                )}
              </button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-[84px] border border-[#E0DFDC]">
                <div className="px-5 py-4 border-b border-[#E0DFDC]">
                  <h3 className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                    Order Summary
                  </h3>
                </div>

                {/* Items */}
                <div className="divide-y divide-[#E0DFDC] max-h-60 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.variantId} className="flex gap-3 p-4">
                      <div className="w-14 h-14 bg-[#F1F0EE] flex-shrink-0 overflow-hidden">
                        {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-[#0C0C0C] line-clamp-2 leading-tight" style={{ fontFamily: 'Outfit' }}>{item.name}</p>
                        <p className="text-[10px] text-[#78716C] mt-0.5" style={{ fontFamily: 'Space Mono' }}>UK {item.size} · Qty {item.quantity}</p>
                      </div>
                      <p className="text-[12px] font-bold text-[#0C0C0C] flex-shrink-0" style={{ fontFamily: 'Space Mono' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-5 space-y-3 border-t border-[#E0DFDC]">
                  <div className="flex justify-between text-sm text-[#78716C]">
                    <span>Subtotal</span>
                    <span style={{ fontFamily: 'Space Mono' }}>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#78716C]">Shipping</span>
                    <span className={`font-bold ${shipping === 0 ? 'text-[#E11D48]' : ''}`} style={{ fontFamily: 'Space Mono' }}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#78716C]">Payment</span>
                    <span className="text-[#78716C] text-[11px]" style={{ fontFamily: 'Figtree' }}>
                      {selectedMethod.label}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-[#E0DFDC] pt-3 text-[#0C0C0C]">
                    <span style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Total</span>
                    <span style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <div className="border border-[#E0DFDC] p-3 space-y-2">
                    {[
                      { icon: <Lock className="w-3 h-3" />, text: 'Secure checkout' },
                      { icon: <Truck className="w-3 h-3" />, text: 'Dispatched in 24–48 hrs' },
                      { icon: <ShoppingBag className="w-3 h-3" />, text: '100% authenticated' },
                    ].map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                        <span className="text-[#E11D48]">{t.icon}</span>
                        {t.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
