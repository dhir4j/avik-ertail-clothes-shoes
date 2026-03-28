'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    const handle = email.split('@')[0];
    return (
      <div className="flex items-start gap-3 py-3">
        <CheckCircle2 className="w-5 h-5 text-[#E11D48] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-[#FAFAF8]" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
            You&apos;re in, {handle}!
          </p>
          <p className="text-[11px] text-[#78716C] mt-0.5" style={{ fontFamily: 'Space Mono' }}>
            New drops & restocks straight to your inbox.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handle} className="flex">
      <div className="relative flex-1">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full bg-[#1A1A1A] border border-[#1F1F1F] px-4 py-2.5 text-sm text-[#FAFAF8] outline-none placeholder:text-[#6B6B6B] transition-colors"
          style={{
            fontFamily: 'Space Mono',
            fontSize: 12,
            borderColor: isValid && email ? '#E11D48' : undefined,
          }}
        />
        {isValid && email && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E11D48]">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
      <button
        type="submit"
        disabled={!isValid || loading}
        className="bg-[#E11D48] hover:bg-[#F43F5E] disabled:opacity-50 text-[#0C0C0C] px-5 py-2.5 text-[11px] font-bold tracking-widest uppercase transition-colors whitespace-nowrap"
        style={{ fontFamily: 'Outfit' }}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-[#0C0C0C] border-t-transparent animate-spin inline-block" />
        ) : 'Join'}
      </button>
    </form>
  );
}
