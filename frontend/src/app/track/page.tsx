'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, ShoppingBag, FileText, Navigation, LogOut, ArrowRight,
  Package, Truck, CheckCircle2, Clock, MapPin, Search, AlertCircle,
} from 'lucide-react';
import AccountMobileNav from '@/components/layout/AccountMobileNav';
import { apiClient } from '@/lib/api/client';

const fmtOrderId = (id: number) => 'SS-' + String(id).padStart(6, '0');

type StepStatus = 'done' | 'current' | 'pending';

interface TrackingStep { label: string; note: string; status: StepStatus; }

const STATUS_STEPS: Record<string, number> = {
  awaiting_payment: 0,
  confirmed:        1,
  processing:       2,
  shipped:          3,
  delivered:        4,
};

const STEPS_DEF = [
  { label: 'Order Placed',       note: 'Order received' },
  { label: 'Confirmed',          note: 'Order confirmed & being prepared' },
  { label: 'Processing',         note: 'Being packed and authenticated' },
  { label: 'Shipped',            note: 'Out for delivery' },
  { label: 'Delivered',          note: 'Package delivered' },
];

function buildSteps(orderStatus: string): TrackingStep[] {
  if (orderStatus === 'cancelled') {
    return STEPS_DEF.map(s => ({ ...s, status: 'pending' as StepStatus }));
  }
  const currentIdx = STATUS_STEPS[orderStatus] ?? 0;
  return STEPS_DEF.map((s, i) => ({
    ...s,
    status: i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'pending',
  }));
}

const STATUS_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  delivered:        { color: '#2D8A4E', bg: '#E6F5EC', border: '#2D8A4E' },
  shipped:          { color: '#2563EB', bg: '#EFF6FF', border: '#2563EB' },
  processing:       { color: '#E11D48', bg: '#FFF8EE', border: '#E11D48' },
  confirmed:        { color: '#9333EA', bg: '#F5F3FF', border: '#9333EA' },
  awaiting_payment: { color: '#E03A1E', bg: '#FFF0EE', border: '#E03A1E' },
  cancelled:        { color: '#78716C', bg: '#F1F0EE', border: '#78716C' },
};

const STEP_ICONS = [Package, Clock, Package, Truck, CheckCircle2];

interface OrderSummary { id: number; order_status: string; created_at: string; total_price: number; }
interface OrderDetail extends OrderSummary {
  items: { product_name_snapshot: string; size_snapshot: string; quantity: number }[];
  payment_method: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
}

export default function TrackPage() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const router = useRouter();

  const [input, setInput] = useState('');
  const [result, setResult] = useState<OrderDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    apiClient.get('/orders?limit=5').then(res => setRecentOrders(res.data.data || [])).catch(() => {});
  }, [user, router]);

  if (!user) return null;

  const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const fetchOrder = async (rawId: string) => {
    const numId = parseInt(rawId.replace(/\D/g, ''), 10);
    if (!numId) { setResult(null); setNotFound(true); return; }
    setLoading(true);
    setNotFound(false);
    setResult(null);
    try {
      const res = await apiClient.get(`/orders/${numId}`);
      setResult(res.data.data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(input.trim());
  };

  const steps = result ? buildSteps(result.order_status) : [];
  const doneCount = steps.filter(s => s.status === 'done').length;
  const progressPct = result ? (doneCount / (steps.length - 1)) * 100 : 0;
  const statusConf = result ? STATUS_COLORS[result.order_status] : null;

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <div className="border-b border-[#E0DFDC]">
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          <p className="text-[11px] tracking-[0.15em] uppercase text-[#78716C] mb-1" style={{ fontFamily: 'Space Mono' }}>My Account</p>
          <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>Track Order</h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <AccountMobileNav initials={initials} name={user.name} email={user.email} active="track" />

        {/* Mobile recent order chips */}
        {recentOrders.length > 0 && (
          <div className="lg:hidden mb-4 overflow-x-auto hide-scrollbar -mx-4 px-4">
            <div className="flex gap-2 pb-1" style={{ width: 'max-content' }}>
              {recentOrders.map(ord => {
                const s = STATUS_COLORS[ord.order_status];
                return (
                  <button
                    key={ord.id}
                    onClick={() => { setInput(fmtOrderId(ord.id)); fetchOrder(String(ord.id)); }}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border border-[#E0DFDC] bg-[#F1F0EE] hover:border-[#0C0C0C] transition-colors"
                  >
                    <p className="text-[11px] font-bold text-[#0C0C0C]" style={{ fontFamily: 'Space Mono' }}>{fmtOrderId(ord.id)}</p>
                    {s && <span className="text-[9px] font-bold px-1.5 py-0.5 border" style={{ fontFamily: 'Space Mono', color: s.color, background: s.bg, borderColor: s.border }}>{ord.order_status}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="border border-[#E0DFDC]">
              <div className="p-6 border-b border-[#E0DFDC] flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-[#0C0C0C] flex items-center justify-center">
                  <span className="text-[#E11D48] text-xl font-bold" style={{ fontFamily: 'Outfit' }}>{initials}</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{user.name}</p>
                  <p className="text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{user.email}</p>
                </div>
              </div>
              <nav className="divide-y divide-[#E0DFDC]">
                {[
                  { icon: <User className="w-4 h-4" />,        label: 'Profile',      href: '/profile' },
                  { icon: <ShoppingBag className="w-4 h-4" />, label: 'My Orders',    href: '/orders' },
                  { icon: <FileText className="w-4 h-4" />,    label: 'Invoices',     href: '/invoices' },
                  { icon: <Navigation className="w-4 h-4" />,  label: 'Track Order',  href: '/track', active: true },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-5 py-3.5 text-sm font-bold transition-colors ${'active' in item && item.active ? 'bg-[#0C0C0C] text-[#FAFAF8]' : 'text-[#78716C] hover:text-[#0C0C0C] hover:bg-[#F1F0EE]'}`}
                    style={{ fontFamily: 'Outfit', fontWeight: 600 }}
                  >{item.icon}{item.label}</Link>
                ))}
                {user.role === 'admin' && (
                  <Link href="/admin" className="flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-[#E11D48] hover:bg-[#F1F0EE] transition-colors" style={{ fontFamily: 'Outfit', fontWeight: 600 }}>
                    <ArrowRight className="w-4 h-4" />Admin Panel
                  </Link>
                )}
                <button onClick={() => { logout(); router.push('/'); }} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-[#E03A1E] hover:bg-[#FFF0EE] transition-colors" style={{ fontFamily: 'Outfit', fontWeight: 600 }}>
                  <LogOut className="w-4 h-4" />Sign Out
                </button>
              </nav>
            </div>

            {/* Recent orders quick-track */}
            {recentOrders.length > 0 && (
              <div className="border border-[#E0DFDC] mt-4">
                <div className="px-5 py-3 border-b border-[#E0DFDC]">
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>Recent Orders</p>
                </div>
                <div className="divide-y divide-[#E0DFDC]">
                  {recentOrders.map(ord => {
                    const s = STATUS_COLORS[ord.order_status];
                    return (
                      <button key={ord.id} onClick={() => { setInput(fmtOrderId(ord.id)); fetchOrder(String(ord.id)); }}
                        className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#F1F0EE] transition-colors"
                      >
                        <div className="text-left">
                          <p className="text-[11px] font-bold text-[#0C0C0C]" style={{ fontFamily: 'Space Mono' }}>{fmtOrderId(ord.id)}</p>
                          <p className="text-[10px] text-[#78716C]" style={{ fontFamily: 'Figtree' }}>{new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                        </div>
                        {s && <span className="text-[9px] font-bold px-1.5 py-0.5 border" style={{ fontFamily: 'Space Mono', color: s.color, background: s.bg, borderColor: s.border }}>{ord.order_status}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Main */}
          <div className="lg:col-span-3 space-y-6">

            {/* Search */}
            <div className="border border-[#E0DFDC] bg-white">
              <div className="px-6 py-5">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#78716C] mb-3" style={{ fontFamily: 'Space Mono' }}>Enter your Order ID</p>
                <form onSubmit={handleSearch} className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="e.g. SS-000001"
                      className="input-base w-full pl-10 pr-4 py-3 text-sm"
                      style={{ fontFamily: 'Space Mono' }}
                    />
                  </div>
                  <button type="submit" className="bg-[#0C0C0C] text-[#FAFAF8] px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-[#1F1F1F] transition-colors flex-shrink-0" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
                    {loading ? '…' : 'Track'}
                  </button>
                </form>
                <p className="text-[11px] text-[#78716C] mt-2" style={{ fontFamily: 'Figtree' }}>
                  Find your Order ID under{' '}
                  <Link href="/orders" className="text-[#E11D48] font-bold hover:underline">My Orders</Link>.
                </p>
              </div>
            </div>

            {/* Not found */}
            {notFound && (
              <div className="border border-[#E03A1E] bg-[#FFF0EE] px-6 py-5 flex items-center gap-4">
                <AlertCircle className="w-5 h-5 text-[#E03A1E] flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[#E03A1E]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Order not found</p>
                  <p className="text-[12px] text-[#E03A1E]/80 mt-0.5" style={{ fontFamily: 'Space Mono' }}>Check the ID and try again, or view <Link href="/orders" className="underline">My Orders</Link>.</p>
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <>
                <div className="border border-[#E0DFDC] bg-white">
                  <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-[#E0DFDC] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>Order ID</p>
                      <p className="text-base sm:text-lg font-bold text-[#0C0C0C]" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{fmtOrderId(result.id)}</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>Placed</p>
                        <p className="text-sm font-bold text-[#0C0C0C]" style={{ fontFamily: 'Space Mono' }}>{new Date(result.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>Payment</p>
                        <p className="text-sm font-bold text-[#0C0C0C] uppercase" style={{ fontFamily: 'Space Mono' }}>{result.payment_method}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>Total</p>
                        <p className="text-sm font-bold text-[#0C0C0C]" style={{ fontFamily: 'Space Mono' }}>₹{result.total_price.toLocaleString('en-IN')}</p>
                      </div>
                      {statusConf && (
                        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 border" style={{ fontFamily: 'Space Mono', color: statusConf.color, background: statusConf.bg, borderColor: statusConf.border }}>
                          {result.order_status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-6 py-4 border-b border-[#E0DFDC]">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#78716C] mb-3" style={{ fontFamily: 'Space Mono' }}>Items</p>
                    <div className="space-y-2">
                      {result.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#F1F0EE] flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-[#78716C]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{item.product_name_snapshot}</p>
                            <p className="text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>Size: {item.size_snapshot} · Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="px-6 py-4 flex items-center gap-3 text-[12px]" style={{ fontFamily: 'Space Mono' }}>
                    <MapPin className="w-4 h-4 text-[#E11D48] flex-shrink-0" />
                    <span className="text-[#6B6B6B]">
                      {result.shipping_address_line1}{result.shipping_address_line2 ? `, ${result.shipping_address_line2}` : ''}, {result.shipping_city}, {result.shipping_state} — {result.shipping_postal_code}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="border border-[#E0DFDC] bg-white">
                  <div className="px-6 py-4 border-b border-[#E0DFDC] flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Shipment Progress</h2>
                    <p className="text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{doneCount} / {steps.length} steps</p>
                  </div>
                  <div className="h-1 bg-[#F1F0EE]">
                    <div className="h-full bg-[#E11D48] transition-all duration-700" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div className="px-6 py-6">
                    <div className="relative">
                      <div className="absolute left-[18px] top-6 bottom-6 w-px bg-[#E0DFDC]" />
                      <div className="space-y-0">
                        {steps.map((step, i) => {
                          const Icon = STEP_ICONS[i] || Package;
                          const isDone = step.status === 'done';
                          const isCurrent = step.status === 'current';
                          return (
                            <div key={i} className="relative flex items-start gap-5 pb-8 last:pb-0">
                              <div className={`relative z-10 w-9 h-9 flex items-center justify-center flex-shrink-0 border-2 transition-all ${isDone ? 'bg-[#E11D48] border-[#E11D48] text-[#0C0C0C]' : isCurrent ? 'bg-[#0C0C0C] border-[#0C0C0C] text-[#FAFAF8] ring-4 ring-[#0C0C0C]/10' : 'bg-[#FAFAF8] border-[#E0DFDC] text-[#E0DFDC]'}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 pt-1.5">
                                <p className={`text-sm font-bold uppercase tracking-wide ${isDone || isCurrent ? 'text-[#0C0C0C]' : 'text-[#E0DFDC]'}`} style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
                                  {step.label}
                                  {isCurrent && <span className="ml-2 inline-block text-[9px] font-bold px-2 py-0.5 bg-[#0C0C0C] text-[#FAFAF8] align-middle" style={{ fontFamily: 'Space Mono' }}>CURRENT</span>}
                                </p>
                                <p className={`text-[12px] mt-1 ${isDone || isCurrent ? 'text-[#6B6B6B]' : 'text-[#E0DFDC]'}`} style={{ fontFamily: 'Figtree' }}>{step.note}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-[#E0DFDC] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[12px] text-[#78716C]" style={{ fontFamily: 'Figtree' }}>Have a question about your order?</p>
                  <div className="flex gap-3 text-[11px]" style={{ fontFamily: 'Space Mono' }}>
                    <a href="tel:9625616800" className="text-[#E11D48] hover:underline font-bold">9625616800</a>
                    <span className="text-[#E0DFDC]">·</span>
                    <a href="mailto:contact@avikeretail.com" className="text-[#E11D48] hover:underline font-bold">contact@avikeretail.com</a>
                  </div>
                </div>
              </>
            )}

            {!result && !notFound && !loading && (
              <div className="border border-[#E0DFDC] bg-white px-6 py-16 text-center">
                <div className="w-16 h-16 bg-[#F1F0EE] flex items-center justify-center mx-auto mb-5">
                  <Navigation className="w-7 h-7 text-[#78716C]" />
                </div>
                <h2 className="font-black uppercase tracking-tight text-lg text-[#0C0C0C] mb-2" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>Track Your Order</h2>
                <p className="text-[13px] text-[#78716C] max-w-sm mx-auto mb-6" style={{ fontFamily: 'Figtree' }}>Enter your Order ID above or pick a recent order from the sidebar.</p>
                <Link href="/orders" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#E11D48] hover:underline" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
                  View My Orders <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
