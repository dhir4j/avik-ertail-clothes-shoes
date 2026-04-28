import Link from 'next/link';

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-black uppercase tracking-wider text-[#0C0C0C] mt-10 mb-3" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[14px] text-[#6B6B6B] leading-relaxed mb-3" style={{ fontFamily: 'Figtree' }}>{children}</p>;
}
function Li({ children }: { children: React.ReactNode }) {
  return <li className="text-[14px] text-[#6B6B6B] leading-relaxed mb-1.5 flex gap-2"><span className="text-[#E11D48] flex-shrink-0 mt-0.5">—</span><span>{children}</span></li>;
}

export default function RefundPolicyPage() {
  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <div className="border-b border-[#E0DFDC]">
        <div className="max-w-[860px] mx-auto px-6 py-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#78716C] mb-2" style={{ fontFamily: 'Space Mono' }}>Legal</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>Refund &amp; Return Policy</h1>
          <p className="text-[12px] text-[#78716C] mt-2" style={{ fontFamily: 'Space Mono' }}>Last updated: March 2026</p>
        </div>
      </div>

      {/* TL;DR */}
      <div className="max-w-[860px] mx-auto px-6 pt-8">
        <div className="bg-[#0C0C0C] p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { n: '7 Days', label: 'Return window from delivery' },
            { n: '100%', label: 'Refund if item is inauthentic' },
            { n: '3–5 Days', label: 'Refund processing time' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-black text-[#E11D48]" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{s.n}</p>
              <p className="text-[11px] text-[#6B6B6B] mt-1 uppercase tracking-wider" style={{ fontFamily: 'Space Mono' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 pb-20">

        <H2>1. Return Eligibility</H2>
        <P>We accept returns within 7 calendar days of delivery, subject to the following conditions:</P>
        <ul className="mb-4 space-y-1">
          <Li>Item must be unworn and undamaged (no sole wear, no creasing, no stains)</Li>
          <Li>Original packaging must be intact — shoebox, tissue, tags, and any accessories included</Li>
          <Li>Return request must be initiated within 7 days of delivery confirmation</Li>
          <Li>Item must be the same pair delivered (we photograph all outgoing orders)</Li>
        </ul>

        <H2>2. Non-Returnable Items</H2>
        <ul className="mb-4 space-y-1">
          <Li>Items that have been worn, used, or show signs of wear</Li>
          <Li>Items returned without original packaging or missing tags</Li>
          <Li>Items returned after 7 days of delivery</Li>
          <Li>Socks, insoles, and other consumable accessories (for hygiene reasons)</Li>
          <Li>Items purchased during clearance sales (unless inauthentic)</Li>
        </ul>

        <H2>3. Authenticity Guarantee</H2>
        <P>Every pair we sell is authenticated before dispatch. However, if you believe the item you received is not authentic:</P>
        <ul className="mb-4 space-y-1">
          <Li>Contact us within 7 days with photographs and a description of your concern</Li>
          <Li>We will arrange a pickup at our cost and conduct an independent authentication check</Li>
          <Li>If the item is confirmed inauthentic, you will receive a <strong className="text-[#0C0C0C] font-bold">full refund</strong> — no questions asked</Li>
          <Li>This guarantee applies regardless of the 7-day return window for authenticity disputes</Li>
        </ul>

        <H2>4. How to Initiate a Return</H2>
        <ol className="mb-4 space-y-2">
          {[
            'Email us at contact@puralityonline.com or call 9625616800 with your order ID and reason for return.',
            'Our team will respond within 24 hours with pickup scheduling.',
            'Pack the item securely in original packaging. We will arrange a courier pickup.',
            'Once the item is received and inspected, refund will be processed within 3–5 business days.',
          ].map((step, i) => (
            <li key={i} className="text-[14px] text-[#6B6B6B] leading-relaxed flex gap-3" style={{ fontFamily: 'Figtree' }}>
              <span className="text-[#E11D48] font-bold text-[12px] flex-shrink-0 mt-0.5" style={{ fontFamily: 'Space Mono' }}>{String(i + 1).padStart(2, '0')}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <H2>5. Refund Methods</H2>
        <ul className="mb-4 space-y-1">
          <Li>Original payment method (UPI, card, wallet) — standard refund timeline: 3–5 business days</Li>
          <Li>Store credit (PuralityOnline wallet) — available immediately upon return approval</Li>
          <Li>Bank transfer — for orders paid via cash or where original payment method is unavailable</Li>
        </ul>

        <H2>6. Exchanges</H2>
        <P>We offer exchanges for different sizes, subject to stock availability. To request an exchange, contact us within 7 days of delivery. Exchange shipping is free for the first exchange per order.</P>

        <H2>7. Damaged or Wrong Item</H2>
        <P>If you receive a damaged item or the wrong product, please contact us within 48 hours of delivery with photographs. We will arrange a replacement or full refund at no cost to you.</P>

        <H2>8. Contact for Returns</H2>
        <div className="border border-[#E0DFDC] p-5 text-[13px] space-y-1" style={{ fontFamily: 'Space Mono' }}>
          <p className="font-bold text-[#0C0C0C]">Returns &amp; Refunds — PuralityOnline</p>
          <p className="text-[#78716C]">Plot No: 385/2522/3931, Floor - 02, Near Koel Campus, TBS Workspace, Nandan Kanan Road, Patia, Bhubaneswar, Khordha 751024</p>
          <p><a href="mailto:contact@puralityonline.com" className="text-[#E11D48] hover:underline">contact@puralityonline.com</a></p>
          <p><a href="tel:9625616800" className="text-[#E11D48] hover:underline">9625616800</a> — Available Mon–Sat, 10 AM to 7 PM</p>
        </div>

        <div className="mt-12 flex gap-4 text-[12px]" style={{ fontFamily: 'Space Mono' }}>
          <Link href="/privacy-policy" className="text-[#78716C] hover:text-[#E11D48] transition-colors">Privacy Policy →</Link>
          <Link href="/terms" className="text-[#78716C] hover:text-[#E11D48] transition-colors">Terms & Conditions →</Link>
        </div>
      </div>
    </div>
  );
}
