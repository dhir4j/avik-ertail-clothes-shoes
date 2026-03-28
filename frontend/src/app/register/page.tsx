'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/lib/api/client';
import { Eye, EyeOff, ArrowRight, Check, CheckCircle2 } from 'lucide-react';

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordChecks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains a number', ok: /\d/.test(password) },
    { label: 'Passwords match', ok: password === confirm && confirm.length > 0 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }

    setLoading(true);

    try {
      const res = await apiClient.post('/auth/register', { name, email, password });
      const { token, user } = res.data.data;
      setAuth(user, token);
      router.push('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAF8] min-h-screen flex">

      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-[#0C0C0C] flex-col justify-between p-16">
        <Link href="/" className="text-[#FAFAF8]">
          <span className="text-2xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Outfit', fontWeight: 800, letterSpacing: '-0.04em' }}>
            AVIK ERETAIL
          </span>
        </Link>

        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="w-6 h-px bg-[#E11D48]" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#E11D48] font-bold" style={{ fontFamily: 'Space Mono' }}>
              New Member
            </span>
          </div>
          <h1 className="text-[56px] font-black uppercase leading-[0.9] tracking-tighter text-[#FAFAF8] mb-6" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
            JOIN
            <br />
            THE
            <br />
            <span className="text-[#E11D48]">CULTURE</span>
          </h1>
          <p className="text-[#6B6B6B] text-lg leading-relaxed max-w-md" style={{ fontFamily: 'Figtree', fontWeight: 300 }}>
            Get access to exclusive drops, early releases, and personalized recommendations.
          </p>
        </div>

        <div className="space-y-3">
          {[
            '✓ Early access to new drops',
            '✓ Order tracking & history',
            '✓ Exclusive member deals',
            '✓ Wishlist & collections',
          ].map(perk => (
            <p key={perk} className="text-[12px] text-[#6B6B6B]" style={{ fontFamily: 'Space Mono' }}>{perk}</p>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-12">
        <div className="lg:hidden mb-8">
          <Link href="/" className="text-xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
            AVIK ERETAIL
          </Link>
        </div>

        <div className="max-w-md w-full">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#78716C] mb-3" style={{ fontFamily: 'Space Mono' }}>
            Create account
          </p>
          <h2 className="text-3xl font-black uppercase tracking-tight text-[#0C0C0C] mb-8" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
            Join AVIK ERETAIL
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-[#FFF0EE] border border-[#E03A1E] px-4 py-3">
                <p className="text-[12px] text-[#E03A1E]" style={{ fontFamily: 'Space Mono' }}>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-1.5" style={{ fontFamily: 'Space Mono' }}>
                Full Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Your full name"
                className="input-base w-full px-4 py-2.5 text-sm"
              />
            </div>

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
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-[0.12em] uppercase text-[#78716C] mb-1.5" style={{ fontFamily: 'Space Mono' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="input-base w-full px-4 py-2.5 text-sm"
              />
            </div>

            {/* Password checks */}
            {password.length > 0 && (
              <div className="space-y-1.5">
                {passwordChecks.map(c => (
                  <div key={c.label} className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 flex items-center justify-center flex-shrink-0 ${c.ok ? 'text-[#E11D48]' : 'text-[#E0DFDC]'}`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-[11px] ${c.ok ? 'text-[#0C0C0C]' : 'text-[#78716C]'}`} style={{ fontFamily: 'Space Mono' }}>
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 mt-2"
              style={{ fontFamily: 'Outfit', fontWeight: 700, letterSpacing: '0.08em' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#FAFAF8] border-t-transparent animate-spin" />
              ) : (
                <>
                  CREATE ACCOUNT
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[13px] text-[#78716C] mt-6 text-center" style={{ fontFamily: 'Figtree' }}>
            Already have an account?{' '}
            <Link href="/login" className="text-[#0C0C0C] font-bold hover:text-[#E11D48] transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
