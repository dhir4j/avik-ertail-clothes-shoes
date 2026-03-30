'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/lib/api/client';
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Suspense } from 'react';

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const setAuth = useAuthStore(s => s.setAuth);
  const user = useAuthStore(s => s.user);

  if (user) {
    router.replace(user.role === 'admin' ? '/admin' : redirect);
    return null;
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { token, user } = res.data.data;
      setAuth(user, token);
      router.push(user.role === 'admin' ? '/admin' : redirect);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAF8] min-h-screen flex">

      {/* Left — branding panel */}
      <div className="hidden lg:flex w-1/2 bg-[#0C0C0C] flex-col justify-between p-16">
        <Link href="/" className="text-[#FAFAF8]">
          <span className="text-2xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Outfit', fontWeight: 800, letterSpacing: '-0.04em' }}>
            PuralityOnline
          </span>
        </Link>

        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="w-6 h-px bg-[#E11D48]" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#E11D48] font-bold" style={{ fontFamily: 'Space Mono' }}>
              Member Access
            </span>
          </div>
          <h1 className="text-[64px] font-black uppercase leading-[0.9] tracking-tighter text-[#FAFAF8] mb-6" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
            THE REAL
            <br />
            <span className="text-[#E11D48]">KICKS</span>
            <br />
            START HERE
          </h1>
          <p className="text-[#6B6B6B] text-lg leading-relaxed max-w-md" style={{ fontFamily: 'Figtree', fontWeight: 300 }}>
            Access exclusive drops, track your orders, and manage your sneaker collection.
          </p>
        </div>

        <div className="flex gap-8">
          {[
            { value: '122+', label: 'Styles' },
            { value: '10', label: 'Categories' },
            { value: '100%', label: 'Authentic' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-[#FAFAF8]" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{s.value}</p>
              <p className="text-[11px] text-[#6B6B6B] tracking-wider uppercase mt-0.5" style={{ fontFamily: 'Space Mono' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12">
        <div className="lg:hidden mb-8">
          <Link href="/" className="text-xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
            PuralityOnline
          </Link>
        </div>

        <div className="max-w-md w-full">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#78716C] mb-3" style={{ fontFamily: 'Space Mono' }}>
            Welcome back
          </p>
          <h2 className="text-3xl font-black uppercase tracking-tight text-[#0C0C0C] mb-8" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-[#FFF0EE] border border-[#E03A1E] px-4 py-3">
                <p className="text-[12px] text-[#E03A1E]" style={{ fontFamily: 'Space Mono' }}>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-1.5" style={{ fontFamily: 'Space Mono' }}>
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="input-base w-full px-4 py-2.5 pr-10 text-sm"
                />
                {isValidEmail(email) && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E11D48]">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-1.5" style={{ fontFamily: 'Space Mono' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-base w-full px-4 py-2.5 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#0C0C0C]"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
              style={{ fontFamily: 'Outfit', fontWeight: 700, letterSpacing: '0.08em' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#FAFAF8] border-t-transparent animate-spin" />
              ) : (
                <>
                  SIGN IN
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[13px] text-[#78716C] mt-6 text-center" style={{ fontFamily: 'Figtree' }}>
            New to PuralityOnline?{' '}
            <Link href="/register" className="text-[#0C0C0C] font-bold hover:text-[#E11D48] transition-colors">
              Create an account →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8]" />}>
      <LoginForm />
    </Suspense>
  );
}
