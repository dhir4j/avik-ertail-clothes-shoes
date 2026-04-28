import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-12 border-b border-[#E0DFDC]">
      <div className="lg:col-span-3">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#E11D48]" style={{ fontFamily: 'Space Mono' }}>{n}</span>
        <h2 className="text-xl font-black uppercase tracking-tight text-[#0C0C0C] mt-2" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>{title}</h2>
      </div>
      <div className="lg:col-span-9 text-[#78716C] leading-relaxed" style={{ fontFamily: 'Figtree', fontWeight: 300 }}>
        {children}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-[#FAFAF8] min-h-screen">

      {/* Hero */}
      <div className="bg-[#0C0C0C] border-b border-[#1A1A1A]">
        <div className="max-w-[1440px] mx-auto px-6 py-20">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#E11D48] mb-4 flex items-center gap-3" style={{ fontFamily: 'Space Mono' }}>
            <span className="w-5 h-px bg-[#E11D48]" /> About Us
          </p>
          <h1
            className="font-black uppercase text-[#FAFAF8] leading-[0.88] tracking-tighter max-w-3xl"
            style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(48px, 8vw, 96px)' }}
          >
            QUALITY
            <br />
            <span className="text-[#E11D48]">FIRST.</span>
          </h1>
          <p className="text-[#6B6B6B] text-lg mt-8 max-w-xl leading-relaxed" style={{ fontFamily: 'Figtree', fontWeight: 300 }}>
            PuralityOnline was built on one conviction — that every customer in India deserves access to verified, quality products at fair prices.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-[#E0DFDC] bg-[#F1F0EE]">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-3 sm:grid-cols-3 divide-x divide-[#E0DFDC]">
            {[
              { n: '800+', label: 'Verified Products' },
              { n: '2', label: 'Categories' },
              { n: '100%', label: 'Genuine — Always' },
            ].map(s => (
              <div key={s.label} className="px-4 py-5 sm:px-8 sm:py-8">
                <p className="text-2xl sm:text-3xl font-black text-[#0C0C0C] leading-none mb-1" style={{ fontFamily: 'Space Mono', fontWeight: 700 }}>{s.n}</p>
                <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#78716C]" style={{ fontFamily: 'Space Mono' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-6">

        <Section n="01" title="Our Story">
          <p className="mb-4">
            PuralityOnline Pvt Ltd started in Bhubaneswar with a simple mission: bring curated, quality fashion and footwear to Indian consumers with complete transparency and authenticity.
          </p>
          <p className="mb-4">
            The Indian retail market needed a destination that combined premium footwear with quality wholesale clothing — all verified, fairly priced, and delivered to your doorstep. We decided to build that.
          </p>
          <p>
            Today, we serve customers across the country with a catalog spanning premium sneakers, everyday footwear, and a comprehensive range of men&apos;s and women&apos;s clothing sourced directly from manufacturers.
          </p>
        </Section>

        <Section n="02" title="Quality Process">
          <p className="mb-6">Our quality process is non-negotiable. Every product — whether footwear or clothing — goes through verification:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { step: '01', t: 'Source Verification', d: 'We source from authorised retailers, verified sellers, and direct manufacturers. No grey-market products.' },
              { step: '02', t: 'Quality Inspection', d: 'Materials, stitching, construction, and finishing — checked against quality benchmarks before listing.' },
              { step: '03', t: 'Fair Pricing', d: 'We work directly with suppliers to eliminate middlemen and pass the savings to our customers.' },
              { step: '04', t: 'Fast Delivery', d: 'Orders dispatched within 24-48 hours with reliable shipping partners across India.' },
            ].map(s => (
              <div key={s.step} className="border border-[#E0DFDC] rounded-xl p-5">
                <p className="text-[10px] text-[#E11D48] font-bold mb-2" style={{ fontFamily: 'Space Mono' }}>{s.step}</p>
                <p className="text-sm font-bold text-[#0C0C0C] mb-1" style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{s.t}</p>
                <p className="text-[13px]">{s.d}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section n="03" title="Our Promise">
          <p className="mb-4">
            If any product you receive doesn&apos;t meet our quality standards, we will make it right — whether through replacement or full refund. Our reputation is built on trust.
          </p>
          <p>
            We believe the best way to serve Indian consumers is to make quality retail trustworthy, accessible, and affordable. That starts with us.
          </p>
        </Section>

        <Section n="04" title="Contact Us">
          <div className="space-y-2 text-[13px]" style={{ fontFamily: 'Space Mono' }}>
            <p><span className="text-[#78716C]">Company —</span> PuralityOnline Pvt Ltd</p>
            <p><span className="text-[#78716C]">Address —</span> Plot No: 385/2522/3931, Floor - 02, Near Koel Campus, TBS Workspace, Nandan Kanan Road, Patia, Bhubaneswar, Khordha 751024</p>
            <p><span className="text-[#78716C]">Phone —</span> <a href="tel:9625616800" className="text-[#E11D48] hover:underline">9625616800</a></p>
            <p><span className="text-[#78716C]">Email —</span> <a href="mailto:contact@puralityonline.com" className="text-[#E11D48] hover:underline">contact@puralityonline.com</a></p>
          </div>
        </Section>

      </div>

      {/* CTA */}
      <div className="bg-[#0C0C0C] mt-0">
        <div className="max-w-[1440px] mx-auto px-6 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-[#E11D48] uppercase mb-2" style={{ fontFamily: 'Space Mono' }}>Ready?</p>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#FAFAF8]" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>
              Shop the Collection
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#E11D48] text-white px-8 py-3.5 rounded-lg text-[12px] font-bold uppercase tracking-widest hover:bg-[#BE123C] transition-colors"
            style={{ fontFamily: 'Outfit', fontWeight: 700 }}
          >
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
