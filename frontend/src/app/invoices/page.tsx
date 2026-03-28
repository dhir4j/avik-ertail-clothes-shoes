'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, ShoppingBag, FileText, LogOut, ArrowRight, Printer, Download, ChevronDown, Navigation, Package } from 'lucide-react';
import AccountMobileNav from '@/components/layout/AccountMobileNav';
import { apiClient } from '@/lib/api/client';
import { Suspense } from 'react';

const fmtOrderId = (id: number) => 'SS-' + String(id).padStart(6, '0');

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  delivered:        { label: 'Delivered',        color: '#2D8A4E', bg: '#E6F5EC', border: '#2D8A4E' },
  shipped:          { label: 'Shipped',           color: '#2563EB', bg: '#EFF6FF', border: '#2563EB' },
  processing:       { label: 'Processing',        color: '#E11D48', bg: '#FFF8EE', border: '#E11D48' },
  awaiting_payment: { label: 'Awaiting Payment',  color: '#E03A1E', bg: '#FFF0EE', border: '#E03A1E' },
  cancelled:        { label: 'Cancelled',         color: '#78716C', bg: '#F1F0EE', border: '#78716C' },
};

interface OrderSummary {
  id: number;
  total_price: number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

interface OrderDetail extends OrderSummary {
  items: { product_name_snapshot: string; size_snapshot: string; color_snapshot: string; price: number; quantity: number }[];
  upi_reference: string | null;
  shipping_name: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatPrice(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function InvoicesContent() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selected, setSelected] = useState<OrderDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    apiClient.get('/orders').then(res => {
      const list: OrderSummary[] = res.data.data || [];
      setOrders(list);
      const paramId = searchParams.get('order');
      const first = paramId ? list.find(o => String(o.id) === paramId) : list[0];
      if (first) fetchDetail(first.id);
    }).catch(() => {}).finally(() => setLoadingList(false));
  }, [user, router]);

  const fetchDetail = (id: number) => {
    setLoadingDetail(true);
    apiClient.get(`/orders/${id}`).then(res => {
      setSelected(res.data.data);
    }).catch(() => {}).finally(() => setLoadingDetail(false));
  };

  if (!user) return null;

  const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const subtotal = selected ? selected.items.reduce((s, i) => s + i.price * i.quantity, 0) : 0;
  const total = selected ? selected.total_price : 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * { visibility: hidden !important; }
            #invoice-print, #invoice-print * { visibility: visible !important; }
            #invoice-print {
              position: fixed !important;
              left: 0 !important; top: 0 !important;
              width: 100% !important;
              background: white !important;
              padding: 48px !important;
            }
          }
        `
      }} />

      <div className="bg-[#FAFAF8] min-h-screen">
        <div className="border-b border-[#E0DFDC]">
          <div className="max-w-[1440px] mx-auto px-6 py-6">
            <p className="text-[11px] tracking-[0.15em] uppercase text-[#78716C] mb-1" style={{ fontFamily: 'Space Mono' }}>My Account</p>
            <h1 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>Invoices</h1>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <AccountMobileNav initials={initials} name={user.name} email={user.email} active="invoices" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Sidebar */}
            <div className="hidden lg:block lg:col-span-1 no-print">
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
                    { icon: <User className="w-4 h-4" />, label: 'Profile', href: '/profile' },
                    { icon: <ShoppingBag className="w-4 h-4" />, label: 'My Orders', href: '/orders' },
                    { icon: <FileText className="w-4 h-4" />, label: 'Invoices', href: '/invoices', active: true },
                    { icon: <Navigation className="w-4 h-4" />, label: 'Track Order', href: '/track' },
                  ].map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-5 py-3.5 text-sm font-bold transition-colors ${'active' in item && item.active ? 'bg-[#0C0C0C] text-[#FAFAF8]' : 'text-[#78716C] hover:text-[#0C0C0C] hover:bg-[#F1F0EE]'}`}
                      style={{ fontFamily: 'Outfit', fontWeight: 600 }}
                    >
                      {item.icon}{item.label}
                    </Link>
                  ))}
                  {user.role === 'admin' && (
                    <Link href="/admin" className="flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-[#E11D48] hover:bg-[#F1F0EE] transition-colors" style={{ fontFamily: 'Outfit', fontWeight: 600 }}>
                      <ArrowRight className="w-4 h-4" />Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); router.push('/'); }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-[#E03A1E] hover:bg-[#FFF0EE] transition-colors"
                    style={{ fontFamily: 'Outfit', fontWeight: 600 }}
                  >
                    <LogOut className="w-4 h-4" />Sign Out
                  </button>
                </nav>
              </div>
            </div>

            {/* Main */}
            <div className="lg:col-span-3">

              {/* Order list */}
              <div className="border border-[#E0DFDC] mb-6 no-print">
                <div className="px-6 py-4 border-b border-[#E0DFDC] flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Order History</h2>
                  <span className="text-[10px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{orders.length} orders</span>
                </div>

                {loadingList ? (
                  <div className="p-8 text-center text-[#78716C] text-sm" style={{ fontFamily: 'Space Mono' }}>Loading…</div>
                ) : orders.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-10 h-10 text-[#E0DFDC] mx-auto mb-3" />
                    <p className="text-[#78716C] text-sm" style={{ fontFamily: 'Figtree' }}>No orders yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E0DFDC]">
                    {orders.map(order => {
                      const isSelected = selected?.id === order.id;
                      return (
                        <button
                          key={order.id}
                          onClick={() => fetchDetail(order.id)}
                          className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${isSelected ? 'bg-[#F1F0EE]' : 'hover:bg-[#F1F0EE]'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-1.5 h-8 flex-shrink-0 ${isSelected ? 'bg-[#E11D48]' : 'bg-[#E0DFDC]'}`} />
                            <div>
                              <p className="text-sm font-bold text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{fmtOrderId(order.id)}</p>
                              <p className="text-[11px] text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{formatDate(order.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-bold text-[#0C0C0C]" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{formatPrice(order.total_price)}</p>
                              {(() => {
                                const s = ORDER_STATUS_CONFIG[order.order_status];
                                return s ? (
                                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 border mt-0.5" style={{ fontFamily: 'Space Mono', color: s.color, background: s.bg, borderColor: s.border }}>
                                    {s.label}
                                  </span>
                                ) : null;
                              })()}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-[#78716C] transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Invoice detail */}
              {loadingDetail ? (
                <div className="border border-[#E0DFDC] p-12 text-center text-[#78716C] text-sm" style={{ fontFamily: 'Space Mono' }}>Loading invoice…</div>
              ) : selected ? (
                <div id="invoice-print" className="border border-[#E0DFDC] bg-white">

                  {/* Header */}
                  <div className="p-4 sm:p-8 border-b border-[#E0DFDC]">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>AVIK ERETAIL</h2>
                        <p className="text-[11px] text-[#78716C] mt-0.5" style={{ fontFamily: 'Figtree' }}>India's Premium Authenticated Sneaker Boutique</p>
                        <p className="text-[12px] text-[#6B6B6B] mt-2" style={{ fontFamily: 'Figtree' }}>orders@avikeretailshoes.com</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#78716C] mb-1" style={{ fontFamily: 'Space Mono' }}>Tax Invoice</p>
                        <p className="text-xl font-bold text-[#0C0C0C]" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{fmtOrderId(selected.id)}</p>
                        <p className="text-[12px] text-[#78716C] mt-1" style={{ fontFamily: 'Space Mono' }}>{formatDate(selected.created_at)}</p>
                        {(() => {
                          const s = ORDER_STATUS_CONFIG[selected.order_status];
                          return s ? (
                            <span className="inline-block mt-2 text-[10px] font-bold px-3 py-1 border" style={{ fontFamily: 'Space Mono', color: s.color, background: s.bg, borderColor: s.border }}>
                              {s.label.toUpperCase()}
                            </span>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Bill to */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 px-4 py-4 sm:px-8 sm:py-6 border-b border-[#E0DFDC]">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#78716C] mb-2" style={{ fontFamily: 'Space Mono' }}>Bill To</p>
                      <p className="text-sm font-bold text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{user.name}</p>
                      <p className="text-[12px] text-[#6B6B6B]" style={{ fontFamily: 'Figtree' }}>{user.email}</p>
                      <p className="text-[11px] text-[#78716C] mt-1" style={{ fontFamily: 'Space Mono' }}>
                        {selected.shipping_address_line1}
                        {selected.shipping_address_line2 ? `, ${selected.shipping_address_line2}` : ''}, {selected.shipping_city}, {selected.shipping_state} — {selected.shipping_postal_code}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#78716C] mb-2" style={{ fontFamily: 'Space Mono' }}>Payment Info</p>
                      <p className="text-[12px] text-[#6B6B6B]" style={{ fontFamily: 'Figtree' }}>Status: {selected.payment_status}</p>
                      {selected.upi_reference && (
                        <p className="text-[11px] text-[#78716C] mt-0.5" style={{ fontFamily: 'Space Mono' }}>UPI Ref: {selected.upi_reference}</p>
                      )}
                    </div>
                  </div>

                  {/* Line items */}
                  <div className="px-4 py-4 sm:px-8 sm:py-6 overflow-x-auto">
                    <table className="w-full min-w-[480px]">
                      <thead>
                        <tr className="border-b border-[#E0DFDC]">
                          {['Item', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
                            <th key={h} className={`pb-3 text-[10px] font-bold tracking-[0.18em] uppercase text-[#78716C] ${i === 0 ? 'text-left' : i === 1 ? 'text-center' : 'text-right'}`} style={{ fontFamily: 'Space Mono' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F0EE]">
                        {selected.items.map((item, i) => (
                          <tr key={i}>
                            <td className="py-4 pr-4">
                              <p className="text-sm font-bold text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{item.product_name_snapshot}</p>
                              <p className="text-[11px] text-[#78716C] mt-0.5" style={{ fontFamily: 'Space Mono' }}>
                                Size: {item.size_snapshot}{item.color_snapshot ? ` · ${item.color_snapshot}` : ''}
                              </p>
                            </td>
                            <td className="py-4 text-center text-sm text-[#0C0C0C]" style={{ fontFamily: 'Space Mono' }}>{item.quantity}</td>
                            <td className="py-4 text-right text-sm text-[#0C0C0C]" style={{ fontFamily: 'Space Mono' }}>{formatPrice(item.price)}</td>
                            <td className="py-4 text-right text-sm font-bold text-[#0C0C0C]" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{formatPrice(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="px-4 py-4 sm:px-8 sm:py-6 border-t border-[#E0DFDC] bg-[#FAFAF8]">
                    <div className="ml-auto max-w-xs space-y-2">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-[#78716C]" style={{ fontFamily: 'Figtree' }}>Subtotal</span>
                        <span style={{ fontFamily: 'Space Mono' }}>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold border-t border-[#E0DFDC] pt-3 mt-3">
                        <span style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Total</span>
                        <span className="text-[#E11D48]" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-4 sm:px-8 sm:py-5 border-t border-[#E0DFDC]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <p className="text-[11px] text-[#78716C] leading-relaxed" style={{ fontFamily: 'Figtree' }}>
                        This is a computer-generated invoice and does not require a signature.
                      </p>
                      <div className="flex gap-3 no-print">
                        <button
                          onClick={() => window.print()}
                          className="inline-flex items-center gap-2 bg-[#0C0C0C] text-[#FAFAF8] px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider hover:bg-[#1F1F1F] transition-colors"
                          style={{ fontFamily: 'Outfit', fontWeight: 700 }}
                        >
                          <Printer className="w-3.5 h-3.5" />Print
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="inline-flex items-center gap-2 border border-[#E0DFDC] text-[#0C0C0C] px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider hover:border-[#0C0C0C] hover:bg-[#F1F0EE] transition-colors"
                          style={{ fontFamily: 'Outfit', fontWeight: 700 }}
                        >
                          <Download className="w-3.5 h-3.5" />Save as PDF
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ) : null}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense>
      <InvoicesContent />
    </Suspense>
  );
}
