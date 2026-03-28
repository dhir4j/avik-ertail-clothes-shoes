'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, ShoppingBag, ArrowRight, Package, ChevronRight, FileText, Navigation } from 'lucide-react';
import AccountMobileNav from '@/components/layout/AccountMobileNav';
import { apiClient } from '@/lib/api/client';

const fmtOrderId = (id: number) => 'SS-' + String(id).padStart(6, '0');

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  delivered:        { label: 'Delivered',        color: '#2D8A4E', bg: '#E6F5EC' },
  shipped:          { label: 'Shipped',           color: '#2563EB', bg: '#EFF6FF' },
  processing:       { label: 'Processing',        color: '#E11D48', bg: '#FFF8EE' },
  awaiting_payment: { label: 'Awaiting Payment',  color: '#E03A1E', bg: '#FFF0EE' },
  cancelled:        { label: 'Cancelled',         color: '#78716C', bg: '#F1F0EE' },
};

interface Order {
  id: number;
  total_price: number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

export default function OrdersPage() {
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    apiClient.get('/orders').then(res => {
      setOrders(res.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  if (!user) return null;

  const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const delivered = orders.filter(o => o.order_status === 'delivered').length;
  const totalSpent = orders.reduce((t, o) => t + o.total_price, 0);

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <div className="border-b border-[#E0DFDC]">
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          <p className="text-[11px] tracking-[0.15em] uppercase text-[#78716C] mb-1" style={{ fontFamily: 'Space Mono' }}>My Account</p>
          <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>My Orders</h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <AccountMobileNav initials={initials} name={user.name} email={user.email} active="orders" />

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
                  { icon: <User className="w-4 h-4" />, label: 'Profile', href: '/profile', active: false },
                  { icon: <ShoppingBag className="w-4 h-4" />, label: 'My Orders', href: '/orders', active: true },
                  { icon: <FileText className="w-4 h-4" />, label: 'Invoices', href: '/invoices', active: false },
                  { icon: <Navigation className="w-4 h-4" />, label: 'Track Order', href: '/track', active: false },
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-5 py-3.5 text-sm font-bold transition-colors ${
                      item.active ? 'bg-[#0C0C0C] text-[#FAFAF8]' : 'text-[#78716C] hover:text-[#0C0C0C] hover:bg-[#F1F0EE]'
                    }`}
                    style={{ fontFamily: 'Outfit', fontWeight: 600 }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Orders list */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="border border-[#E0DFDC] p-16 text-center">
                <p className="text-[#78716C] text-sm" style={{ fontFamily: 'Space Mono' }}>Loading orders…</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="border border-[#E0DFDC] p-16 text-center">
                <Package className="w-12 h-12 text-[#E0DFDC] mx-auto mb-4" />
                <h2 className="font-black uppercase tracking-tight text-xl mb-3" style={{ fontFamily: 'Outfit' }}>No Orders Yet</h2>
                <p className="text-[#78716C] mb-6" style={{ fontFamily: 'Figtree' }}>Your order history will appear here.</p>
                <Link href="/products" className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
                  SHOP NOW <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary bar */}
                <div className="border border-[#E0DFDC] grid grid-cols-3">
                  {[
                    { value: orders.length, label: 'Total Orders' },
                    { value: delivered, label: 'Delivered' },
                    { value: `₹${totalSpent.toLocaleString('en-IN')}`, label: 'Total Spent' },
                  ].map(s => (
                    <div key={s.label} className="p-4 text-center border-r border-[#E0DFDC] last:border-r-0">
                      <p className="text-xl font-bold text-[#0C0C0C]" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{s.value}</p>
                      <p className="text-[10px] text-[#78716C] uppercase tracking-wider mt-0.5" style={{ fontFamily: 'Space Mono' }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Order cards */}
                {orders.map(order => {
                  const statusConf = STATUS_CONFIG[order.order_status] || STATUS_CONFIG.processing;
                  return (
                    <div key={order.id} className="border border-[#E0DFDC]">
                      <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-[#E0DFDC] flex flex-wrap items-center justify-between gap-3 bg-[#F1F0EE]">
                        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                          <div>
                            <p className="text-[10px] text-[#78716C] uppercase tracking-wider" style={{ fontFamily: 'Space Mono' }}>Order ID</p>
                            <p className="font-bold text-sm text-[#0C0C0C]" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{fmtOrderId(order.id)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#78716C] uppercase tracking-wider" style={{ fontFamily: 'Space Mono' }}>Placed</p>
                            <p className="font-bold text-sm text-[#0C0C0C]" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>
                              {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[#78716C] uppercase tracking-wider" style={{ fontFamily: 'Space Mono' }}>Total</p>
                            <p className="font-bold text-sm text-[#0C0C0C]" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>
                              ₹{order.total_price.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider border"
                            style={{ fontFamily: 'Space Mono', color: statusConf.color, backgroundColor: statusConf.bg, borderColor: statusConf.color }}
                          >
                            {statusConf.label}
                          </span>
                          <Link href={`/invoices?order=${order.id}`}>
                            <ChevronRight className="w-4 h-4 text-[#78716C]" />
                          </Link>
                        </div>
                      </div>

                      {order.order_status === 'awaiting_payment' && (
                        <div className="px-5 py-3 border-t border-[#E0DFDC] bg-[#FFF0EE]">
                          <p className="text-[11px] text-[#E03A1E]" style={{ fontFamily: 'Space Mono' }}>
                            ⚠ Payment pending verification. Our team will confirm within 1 hour.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
