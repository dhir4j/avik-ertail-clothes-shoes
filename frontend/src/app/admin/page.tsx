'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag, Users, TrendingUp, Package,
  BarChart3, AlertCircle, ArrowUpRight, LogOut, Check, X, ChevronDown,
} from 'lucide-react';
import { getAllProducts, getCategories } from '@/lib/data';
import { apiClient } from '@/lib/api/client';

// ── Static catalog analytics from local JSON data ─────────────────
const allProducts = getAllProducts();
const categories = getCategories();
const totalProducts = allProducts.length;
const totalCategories = categories.length;
const prices = allProducts.map(p => p.price);
const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
const minPrice = Math.min(...prices);
const maxPrice = Math.max(...prices);

const brandStats = categories.map(c => ({
  name: `${c.gender} ${c.category}`,
  count: c.count,
  share: Math.round((c.count / totalProducts) * 100),
  avgPrice: Math.round(allProducts.filter(p => p.gender === c.gender && p.category === c.category).reduce((s, p) => s + p.price, 0) / c.count),
  totalValue: allProducts.filter(p => p.gender === c.gender && p.category === c.category).reduce((s, p) => s + p.price, 0),
}));

const priceBands = [
  { label: '< ₹5K',    count: allProducts.filter(p => p.price < 5000).length },
  { label: '₹5K–10K',  count: allProducts.filter(p => p.price >= 5000  && p.price < 10000).length },
  { label: '₹10K–20K', count: allProducts.filter(p => p.price >= 10000 && p.price < 20000).length },
  { label: '₹20K–50K', count: allProducts.filter(p => p.price >= 20000 && p.price < 50000).length },
  { label: '₹50K+',    count: allProducts.filter(p => p.price >= 50000).length },
];

// ── Types ──────────────────────────────────────────────────────────
type OrderStatus = 'awaiting_payment' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: number;
  customer: string;
  email: string;
  amount: number;
  status: OrderStatus;
  payment_method: string;
  date: string;
  items: number;
}

interface AppUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const STATUS_META: Record<OrderStatus, { label: string; color: string; dot: string; bg: string }> = {
  awaiting_payment: { label: 'Awaiting Payment', color: '#E03A1E', dot: '#E03A1E', bg: '#FFF0EE' },
  confirmed:        { label: 'Confirmed',         color: '#9333EA', dot: '#9333EA', bg: '#F5F3FF' },
  processing:       { label: 'Processing',        color: '#E11D48', dot: '#E11D48', bg: '#FFF8EE' },
  shipped:          { label: 'Shipped',            color: '#2563EB', dot: '#2563EB', bg: '#EFF6FF' },
  delivered:        { label: 'Delivered',          color: '#16A34A', dot: '#16A34A', bg: '#F0FDF4' },
  cancelled:        { label: 'Cancelled',          color: '#78716C', dot: '#78716C', bg: '#F1F0EE' },
};

const STATUS_FLOW: OrderStatus[] = ['awaiting_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

type AdminTab = 'overview' | 'orders' | 'products' | 'users';

// ── Status dropdown ────────────────────────────────────────────────
function StatusDropdown({ orderId, current, onUpdate }: { orderId: number; current: OrderStatus; onUpdate: (id: number, s: OrderStatus) => void }) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const meta = STATUS_META[current] ?? STATUS_META.processing;

  const handleOpen = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + window.scrollY + 2, left: r.left + window.scrollX });
    }
    setOpen(!open);
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-1.5 border text-[11px] font-bold cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap"
        style={{ color: meta.color, borderColor: meta.color, backgroundColor: meta.bg, fontFamily: 'Space Mono' }}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: meta.dot }} />
        {meta.label}
        <ChevronDown className="w-3 h-3 ml-0.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed bg-[#FAFAF8] border border-[#E0DFDC] shadow-lg z-50 w-52"
            style={{ top: dropPos.top, left: dropPos.left }}
          >
            {STATUS_FLOW.map(s => {
              const m = STATUS_META[s];
              return (
                <button
                  key={s}
                  onClick={() => { onUpdate(orderId, s); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold hover:bg-[#F1F0EE] transition-colors text-left"
                  style={{ fontFamily: 'Space Mono' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.dot }} />
                  <span style={{ color: m.color }}>{m.label}</span>
                  {s === current && <Check className="w-3 h-3 ml-auto text-[#0C0C0C]" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────
export default function AdminPage() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [toast, setToast] = useState<{ id: number; status: OrderStatus } | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin') { router.push('/'); return; }

    setOrdersLoading(true);
    apiClient.get('/admin/orders?limit=100')
      .then(res => {
        const data: {
          id: number;
          user?: { name?: string; email?: string };
          total_price?: number;
          order_status?: string;
          payment_method?: string;
          created_at?: string;
          items_count?: number;
        }[] = res.data?.data ?? [];
        setOrders(data.map(o => ({
          id: o.id,
          customer: o.user?.name ?? '—',
          email: o.user?.email ?? '—',
          amount: o.total_price ?? 0,
          status: (o.order_status as OrderStatus) ?? 'awaiting_payment',
          payment_method: o.payment_method ?? 'cod',
          date: o.created_at?.split('T')[0] ?? '',
          items: o.items_count ?? 0,
        })));
      })
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [user, router]);

  useEffect(() => {
    if (tab !== 'users' || users.length > 0) return;
    setUsersLoading(true);
    apiClient.get('/admin/users?limit=100')
      .then(res => setUsers(res.data?.data ?? []))
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
  }, [tab]);

  if (!user || user.role !== 'admin') return null;

  const updateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await apiClient.put(`/admin/orders/${orderId}/status`, { order_status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setToast({ id: orderId, status: newStatus });
      setTimeout(() => setToast(null), 3000);
    } catch {
      alert('Failed to update order status.');
    }
  };

  const pendingCount = orders.filter(o => o.status === 'awaiting_payment').length;
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((t, o) => t + o.amount, 0);
  const totalCatalogValue = allProducts.reduce((t, p) => t + p.price, 0);

  const navItems: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview',  label: 'Overview',  icon: <BarChart3   className="w-4 h-4" /> },
    { key: 'orders',    label: 'Orders',    icon: <Package     className="w-4 h-4" /> },
    { key: 'products',  label: 'Products',  icon: <ShoppingBag className="w-4 h-4" /> },
    { key: 'users',     label: 'Users',     icon: <Users       className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-[#FAFAF8] min-h-screen">

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#0C0C0C] text-[#FAFAF8] px-5 py-3 shadow-xl">
          <Check className="w-4 h-4 text-[#E11D48]" />
          <span className="text-[12px] font-bold" style={{ fontFamily: 'Space Mono' }}>
            #{toast.id} → {STATUS_META[toast.status].label}
          </span>
          <button onClick={() => setToast(null)}><X className="w-3.5 h-3.5 text-[#6B6B6B] hover:text-[#FAFAF8]" /></button>
        </div>
      )}

      {/* Top bar */}
      <div className="bg-[#0C0C0C] border-b border-[#1F1F1F]">
        <div className="max-w-[1440px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/" className="text-[#FAFAF8] text-lg font-black uppercase tracking-tighter" style={{ fontFamily: 'Outfit', fontWeight: 800, letterSpacing: '-0.04em' }}>AVIK ERETAIL</Link>
            <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#E11D48] border border-[#E11D48] px-2 py-0.5" style={{ fontFamily: 'Space Mono' }}>Admin</span>
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-[#E03A1E]" style={{ fontFamily: 'Space Mono' }}>
                <AlertCircle className="w-3.5 h-3.5" />{pendingCount} pending
              </div>
            )}
          </div>
          <div className="flex items-center gap-5">
            <Link href="/" className="text-[11px] text-[#6B6B6B] hover:text-[#FAFAF8] transition-colors" style={{ fontFamily: 'Space Mono' }}>← Storefront</Link>
            <span className="text-[11px] text-[#6B6B6B]" style={{ fontFamily: 'Space Mono' }}>{user.email}</span>
            <button onClick={() => { logout(); router.push('/'); }} className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B] hover:text-[#E03A1E] transition-colors" style={{ fontFamily: 'Space Mono' }}>
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="border-b border-[#E0DFDC] bg-[#FAFAF8]">
        <div className="max-w-[1440px] mx-auto px-6 flex">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ${tab === item.key ? 'border-[#0C0C0C] text-[#0C0C0C]' : 'border-transparent text-[#78716C] hover:text-[#0C0C0C]'}`}
              style={{ fontFamily: 'Outfit' }}
            >
              {item.icon}{item.label}
              {item.key === 'orders' && pendingCount > 0 && (
                <span className="w-4 h-4 bg-[#E03A1E] text-[#FAFAF8] text-[9px] font-bold flex items-center justify-center" style={{ fontFamily: 'Space Mono' }}>{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E0DFDC] border border-[#E0DFDC]">
              {[
                { icon: <ShoppingBag className="w-5 h-5" />, label: 'Total Products', value: totalProducts.toLocaleString(), sub: `${totalCategories} categories`, color: '#E11D48' },
                { icon: <TrendingUp  className="w-5 h-5" />, label: 'Catalog Value',  value: '₹' + (totalCatalogValue / 100000).toFixed(1) + 'L', sub: `Avg ₹${avgPrice.toLocaleString('en-IN')}`, color: '#16A34A' },
                { icon: <Package     className="w-5 h-5" />, label: 'Orders',         value: ordersLoading ? '…' : orders.length.toString(), sub: `${pendingCount} awaiting payment`, color: '#2563EB' },
                { icon: <Users       className="w-5 h-5" />, label: 'Revenue',        value: ordersLoading ? '…' : '₹' + (totalRevenue / 1000).toFixed(1) + 'K', sub: 'from confirmed orders', color: '#9333EA' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-[#FAFAF8] p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div style={{ color: kpi.color }}>{kpi.icon}</div>
                    <ArrowUpRight className="w-4 h-4 text-[#E0DFDC]" />
                  </div>
                  <p className="text-2xl font-bold text-[#0C0C0C] mb-1" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{kpi.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]" style={{ fontFamily: 'Outfit' }}>{kpi.label}</p>
                  <p className="text-[11px] text-[#78716C] mt-1" style={{ fontFamily: 'Space Mono' }}>{kpi.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="border border-[#E0DFDC]">
                <div className="px-5 py-4 border-b border-[#E0DFDC] flex items-center justify-between">
                  <h3 className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>Products by Category</h3>
                  <button onClick={() => setTab('products')} className="text-[11px] text-[#E11D48] font-bold hover:text-[#0C0C0C]" style={{ fontFamily: 'Outfit' }}>View All →</button>
                </div>
                <div className="divide-y divide-[#E0DFDC]">
                  {brandStats.map(b => (
                    <div key={b.name} className="flex items-center gap-4 px-5 py-3">
                      <span className="text-[12px] font-bold text-[#0C0C0C] w-28 flex-shrink-0" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{b.name}</span>
                      <div className="flex-1 bg-[#F1F0EE] h-1.5"><div className="h-full bg-[#E11D48]" style={{ width: `${b.share}%` }} /></div>
                      <span className="text-[11px] text-[#78716C] w-10 text-right flex-shrink-0" style={{ fontFamily: 'Space Mono' }}>{b.count}</span>
                      <span className="text-[11px] text-[#78716C] w-16 text-right flex-shrink-0" style={{ fontFamily: 'Space Mono' }}>₹{Math.round(b.avgPrice / 1000)}K avg</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-[#E0DFDC]">
                <div className="px-5 py-4 border-b border-[#E0DFDC]">
                  <h3 className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>Price Distribution</h3>
                </div>
                <div className="p-5 space-y-3">
                  {priceBands.map(band => (
                    <div key={band.label} className="flex items-center gap-3">
                      <span className="text-[11px] text-[#78716C] w-20 flex-shrink-0" style={{ fontFamily: 'Space Mono' }}>{band.label}</span>
                      <div className="flex-1 bg-[#F1F0EE] h-5 relative overflow-hidden">
                        <div className="h-full bg-[#0C0C0C]" style={{ width: `${Math.round((band.count / totalProducts) * 100)}%` }} />
                        {band.count > 0 && (
                          <span className={`absolute inset-0 flex items-center px-2 text-[10px] font-bold ${band.count / totalProducts > 0.1 ? 'text-[#FAFAF8]' : 'text-[#78716C] justify-end'}`} style={{ fontFamily: 'Space Mono' }}>{band.count}</span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#78716C] w-8 text-right flex-shrink-0" style={{ fontFamily: 'Space Mono' }}>{Math.round((band.count / totalProducts) * 100)}%</span>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-5 border-t border-[#E0DFDC] pt-4 grid grid-cols-2 gap-4">
                  {[{ label: 'Min Price', value: '₹' + minPrice.toLocaleString('en-IN') }, { label: 'Max Price', value: '₹' + maxPrice.toLocaleString('en-IN') }].map(s => (
                    <div key={s.label}>
                      <p className="text-[10px] text-[#78716C] uppercase tracking-wider" style={{ fontFamily: 'Space Mono' }}>{s.label}</p>
                      <p className="font-bold text-[#0C0C0C]" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border border-[#E0DFDC]">
              <div className="px-5 py-4 border-b border-[#E0DFDC] flex items-center justify-between">
                <h3 className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>Recent Orders</h3>
                <button onClick={() => setTab('orders')} className="text-[11px] text-[#E11D48] font-bold hover:text-[#0C0C0C]" style={{ fontFamily: 'Outfit' }}>Manage →</button>
              </div>
              {ordersLoading ? (
                <div className="p-8 text-center text-[#78716C] text-sm" style={{ fontFamily: 'Space Mono' }}>Loading…</div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-[#78716C] text-sm" style={{ fontFamily: 'Space Mono' }}>No orders yet.</div>
              ) : (
                <div className="divide-y divide-[#E0DFDC]">
                  {orders.slice(0, 5).map(order => {
                    const s = STATUS_META[order.status] ?? STATUS_META.processing;
                    return (
                      <div key={order.id} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="text-[12px] font-bold text-[#0C0C0C] flex-shrink-0" style={{ fontFamily: 'Space Mono' }}>#{order.id}</span>
                          <span className="text-[12px] text-[#78716C] truncate" style={{ fontFamily: 'Figtree' }}>{order.customer}</span>
                        </div>
                        <div className="flex items-center gap-6 flex-shrink-0">
                          <span className="text-[12px] font-bold text-[#0C0C0C]" style={{ fontFamily: 'Space Mono' }}>₹{order.amount.toLocaleString('en-IN')}</span>
                          <StatusDropdown orderId={order.id} current={order.status} onUpdate={updateOrderStatus} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-[#E0DFDC] border border-[#E0DFDC] mb-8">
              {STATUS_FLOW.map(s => {
                const m = STATUS_META[s];
                const count = orders.filter(o => o.status === s).length;
                return (
                  <div key={s} className="bg-[#FAFAF8] p-4">
                    <p className="text-xl font-bold mb-1" style={{ fontFamily: 'Space Mono', fontWeight: 700, color: m.color }}>{count}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]" style={{ fontFamily: 'Outfit' }}>{m.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="border border-[#E0DFDC]">
              <div className="px-5 py-4 border-b border-[#E0DFDC] flex items-center justify-between">
                <h3 className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                  All Orders <span className="ml-2 text-[#0C0C0C]">{orders.length}</span>
                </h3>
                <p className="text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                  Revenue: <span className="font-bold text-[#0C0C0C]">₹{totalRevenue.toLocaleString('en-IN')}</span>
                </p>
              </div>
              {ordersLoading ? (
                <div className="p-8 text-center text-[#78716C] text-sm" style={{ fontFamily: 'Space Mono' }}>Loading orders…</div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center text-[#78716C] text-sm" style={{ fontFamily: 'Space Mono' }}>No orders yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E0DFDC] bg-[#F1F0EE]">
                        {['Order ID', 'Customer', 'Date', 'Payment', 'Amount', 'Status', 'Update'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0DFDC]">
                      {orders.map(order => {
                        const s = STATUS_META[order.status] ?? STATUS_META.processing;
                        return (
                          <tr key={order.id} className="hover:bg-[#F1F0EE] transition-colors">
                            <td className="px-4 py-3 font-bold text-[12px] text-[#0C0C0C]" style={{ fontFamily: 'Space Mono' }}>#{order.id}</td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-[13px] text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{order.customer}</p>
                              <p className="text-[10px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{order.email}</p>
                            </td>
                            <td className="px-4 py-3 text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{order.date}</td>
                            <td className="px-4 py-3 text-[11px] text-[#78716C] uppercase" style={{ fontFamily: 'Space Mono' }}>{order.payment_method}</td>
                            <td className="px-4 py-3 font-bold text-[#0C0C0C] text-[12px]" style={{ fontFamily: 'Space Mono' }}>₹{order.amount.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                                <span className="text-[11px] font-bold" style={{ fontFamily: 'Space Mono', color: s.color }}>{s.label}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <StatusDropdown orderId={order.id} current={order.status} onUpdate={updateOrderStatus} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E0DFDC] border border-[#E0DFDC] mb-8">
              {[
                { label: 'Total Products', value: totalProducts.toLocaleString() },
                { label: 'Categories',     value: totalCategories.toString() },
                { label: 'Avg. Price',     value: '₹' + avgPrice.toLocaleString('en-IN') },
                { label: 'Catalog Value',  value: '₹' + (totalCatalogValue / 100000).toFixed(1) + 'L' },
              ].map(s => (
                <div key={s.label} className="bg-[#FAFAF8] p-5">
                  <p className="text-2xl font-bold text-[#0C0C0C]" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{s.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] mt-1" style={{ fontFamily: 'Outfit' }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div className="border border-[#E0DFDC]">
              <div className="px-5 py-4 border-b border-[#E0DFDC]">
                <h3 className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>Category Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0DFDC] bg-[#F1F0EE]">
                      {['Category', 'Products', 'Share', 'Avg. Price', 'Catalog Value'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0DFDC]">
                    {brandStats.map(b => (
                      <tr key={b.name} className="hover:bg-[#F1F0EE] transition-colors">
                        <td className="px-4 py-3 font-bold text-[13px] text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{b.name}</td>
                        <td className="px-4 py-3 font-bold text-[#0C0C0C] text-[12px]" style={{ fontFamily: 'Space Mono' }}>{b.count}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-[#F1F0EE] h-1.5"><div className="h-full bg-[#E11D48]" style={{ width: `${b.share}%` }} /></div>
                            <span className="text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{b.share}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#78716C] text-[12px]" style={{ fontFamily: 'Space Mono' }}>₹{b.avgPrice.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-[#78716C] text-[12px]" style={{ fontFamily: 'Space Mono' }}>₹{(b.totalValue / 100000).toFixed(1)}L</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="border border-[#E0DFDC] mt-8">
              <div className="px-5 py-4 border-b border-[#E0DFDC]">
                <h3 className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>Price Band Distribution</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-5 gap-3 h-36 items-end">
                  {priceBands.map(band => (
                    <div key={band.label} className="flex flex-col items-center gap-2">
                      <span className="text-[11px] font-bold text-[#0C0C0C]" style={{ fontFamily: 'Space Mono' }}>{band.count}</span>
                      <div className="w-full bg-[#0C0C0C]" style={{ height: `${Math.max(4, (band.count / Math.max(...priceBands.map(b => b.count))) * 100)}%` }} />
                      <span className="text-[10px] text-[#78716C] text-center leading-tight" style={{ fontFamily: 'Space Mono' }}>{band.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div className="border border-[#E0DFDC]">
            <div className="px-5 py-4 border-b border-[#E0DFDC] flex items-center justify-between">
              <h3 className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>
                Registered Users <span className="ml-2 text-[#0C0C0C]">{users.length}</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E0DFDC] bg-[#F1F0EE]">
                    {['ID', 'Name', 'Email', 'Role', 'Joined'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0DFDC]">
                  {usersLoading ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-[12px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>Loading…</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-[12px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>No users found.</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id} className="hover:bg-[#F1F0EE] transition-colors">
                      <td className="px-4 py-3 text-[12px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>#{u.id}</td>
                      <td className="px-4 py-3 font-bold text-[13px] text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{u.name}</td>
                      <td className="px-4 py-3 text-[12px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider ${u.role === 'admin' ? 'bg-[#E11D48] text-[#0C0C0C]' : 'bg-[#F1F0EE] text-[#78716C]'}`} style={{ fontFamily: 'Space Mono' }}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{u.created_at?.split('T')[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
