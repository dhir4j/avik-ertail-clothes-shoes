import Link from 'next/link';
import NewsletterForm from '@/components/home/NewsletterForm';
import { getSectionCategoryMap } from '@/lib/data';

const COMPANY = {
  name: 'PuralityOnline Pvt Ltd',
  phone: '9625616800',
  email: 'contact@puralityonline.com',
  address: 'Plot No: 385/2522/3931, Floor - 02, Near Koel Campus, TBS Workspace, Nandan Kanan Road, Patia, Bhubaneswar, Khordha 751024',
};

export default function Footer() {
  const sectionMap = getSectionCategoryMap();

  // Flatten categories into compact pill data: { label, href }[]
  const categoryPills: { section: string; gender: string; cat: string; href: string }[] = [];
  for (const section of Object.keys(sectionMap)) {
    for (const gender of Object.keys(sectionMap[section])) {
      for (const cat of Object.keys(sectionMap[section][gender])) {
        categoryPills.push({
          section,
          gender,
          cat,
          href: `/products?section=${encodeURIComponent(section)}&gender=${encodeURIComponent(gender)}&category=${encodeURIComponent(cat)}`,
        });
      }
    }
  }

  return (
    <footer className="bg-[#0C0C0C] text-[#F0EDE8]">
      {/* Main grid */}
      <div className="border-b border-[#1C1C1C]">
        <div className="max-w-[1440px] mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6">

            {/* Brand + company info */}
            <div className="md:col-span-3">
              <Link href="/" className="inline-block mb-4">
                <span className="text-2xl font-black uppercase tracking-tighter text-[#F0EDE8]" style={{ fontFamily: 'Outfit', fontWeight: 800, letterSpacing: '-0.04em' }}>
                  PuralityOnline
                </span>
              </Link>
              <p className="text-[#6B6862] text-[12px] leading-relaxed mb-5" style={{ fontFamily: 'Figtree' }}>
                India&apos;s curated multi-category retail destination. Premium footwear and wholesale clothing — authenticated, affordable, delivered.
              </p>
              <div className="space-y-1.5 text-[11px]" style={{ fontFamily: 'Space Mono' }}>
                <p className="text-[#3A3936] leading-relaxed">{COMPANY.name}</p>
                <a href={`tel:${COMPANY.phone}`} className="block text-[#6B6862] hover:text-[#E11D48] transition-colors">
                  {COMPANY.phone}
                </a>
                <a href={`mailto:${COMPANY.email}`} className="block text-[#6B6862] hover:text-[#E11D48] transition-colors">
                  {COMPANY.email}
                </a>
                <p className="text-[#3A3936] leading-relaxed max-w-xs">
                  {COMPANY.address}
                </p>
              </div>
            </div>

            {/* Shop — compact category pills grouped by section */}
            <div className="md:col-span-5">
              <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#6B6862] mb-4" style={{ fontFamily: 'Space Mono' }}>Shop</p>

              <div className="mb-3">
                <Link href="/products" className="text-[13px] text-[#7A7670] hover:text-[#F0EDE8] transition-colors" style={{ fontFamily: 'Figtree' }}>
                  All Products
                </Link>
              </div>

              {Object.keys(sectionMap).map(section => (
                <div key={section} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-[#F0EDE8] uppercase tracking-wide" style={{ fontFamily: 'Outfit' }}>{section}</span>
                    <span className="flex-1 h-px bg-[#1C1C1C]" />
                  </div>

                  {Object.keys(sectionMap[section]).map(gender => (
                    <div key={gender} className="mb-2">
                      <Link
                        href={`/products?section=${encodeURIComponent(section)}&gender=${encodeURIComponent(gender)}`}
                        className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#6B6862] hover:text-[#E11D48] transition-colors mb-1.5"
                        style={{ fontFamily: 'Space Mono' }}
                      >
                        {gender}&apos;s
                      </Link>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {Object.keys(sectionMap[section][gender]).map(cat => (
                          <Link
                            key={cat}
                            href={`/products?section=${encodeURIComponent(section)}&gender=${encodeURIComponent(gender)}&category=${encodeURIComponent(cat)}`}
                            className="text-[11px] text-[#3A3936] hover:text-[#E11D48] transition-colors whitespace-nowrap leading-relaxed"
                            style={{ fontFamily: 'Figtree' }}
                          >
                            {cat}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Company links */}
            <div className="md:col-span-2">
              <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#6B6862] mb-4" style={{ fontFamily: 'Space Mono' }}>Company</p>
              <ul className="space-y-2">
                {[
                  { label: 'About Us', href: '/about' },
                  { label: 'My Orders', href: '/orders' },
                  { label: 'My Profile', href: '/profile' },
                  { label: 'Privacy Policy', href: '/privacy-policy' },
                  { label: 'Terms & Conditions', href: '/terms' },
                  { label: 'Refund Policy', href: '/refund-policy' },
                ].map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-[13px] text-[#7A7670] hover:text-[#F0EDE8] transition-colors" style={{ fontFamily: 'Figtree' }}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-2">
              <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#6B6862] mb-3" style={{ fontFamily: 'Space Mono' }}>Stay in the Loop</p>
              <p className="text-[13px] text-[#6B6862] mb-4 leading-relaxed" style={{ fontFamily: 'Figtree' }}>
                New drops, restocks, exclusive deals — straight to your inbox.
              </p>
              <div className="rounded-lg overflow-hidden">
                <NewsletterForm />
              </div>
              <p className="text-[10px] text-[#3A3936] mt-3" style={{ fontFamily: 'Space Mono' }}>
                No spam. Unsubscribe anytime.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1440px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-[10px] text-[#3A3936]" style={{ fontFamily: 'Space Mono' }}>
          &copy; {new Date().getFullYear()} PuralityOnline Pvt Ltd &middot; ALL RIGHTS RESERVED
        </p>
        <div className="flex flex-wrap gap-5">
          {[
            { label: 'Privacy Policy', href: '/privacy-policy' },
            { label: 'Terms', href: '/terms' },
            { label: 'Refund Policy', href: '/refund-policy' },
            { label: 'About', href: '/about' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[10px] text-[#3A3936] hover:text-[#F0EDE8] transition-colors tracking-wider uppercase rounded"
              style={{ fontFamily: 'Space Mono' }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
