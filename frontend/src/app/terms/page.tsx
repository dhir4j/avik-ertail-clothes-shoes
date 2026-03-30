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

export default function TermsPage() {
  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <div className="border-b border-[#E0DFDC]">
        <div className="max-w-[860px] mx-auto px-6 py-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#78716C] mb-2" style={{ fontFamily: 'Space Mono' }}>Legal</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>Terms &amp; Conditions</h1>
          <p className="text-[12px] text-[#78716C] mt-2" style={{ fontFamily: 'Space Mono' }}>Last updated: March 2026</p>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 pb-20">
        <P>By accessing and using the PuralityOnline website (puralityonline.in) and purchasing our products, you agree to be bound by these Terms and Conditions. Please read them carefully before placing an order.</P>

        <H2>1. About Us</H2>
        <P>PuralityOnline Pvt Ltd is a registered company in India operating an authenticated sneaker retail platform. Our registered address is RZ-B-153, GF Shop No. 2, Kh No. 31/8, Dabri Extn, Dabri, New Delhi — 110045.</P>

        <H2>2. Products and Authenticity</H2>
        <ul className="mb-4 space-y-1">
          <Li>All products listed on PuralityOnline are authenticated prior to listing and sale.</Li>
          <Li>Product images and descriptions are provided for reference. Minor variations in colour may occur due to photography conditions.</Li>
          <Li>All sizes are listed in UK sizing unless otherwise specified.</Li>
          <Li>We reserve the right to cancel or refuse any order at our discretion, including suspected fraudulent orders.</Li>
        </ul>

        <H2>3. Pricing and Payment</H2>
        <ul className="mb-4 space-y-1">
          <Li>All prices are in Indian Rupees (INR) and include applicable GST.</Li>
          <Li>Prices are subject to change without notice. The price at the time of order placement is binding.</Li>
          <Li>Orders are confirmed only after successful payment verification.</Li>
          <Li>We accept UPI, credit/debit cards, net banking, and wallets (availability may vary).</Li>
        </ul>

        <H2>4. Shipping and Delivery</H2>
        <ul className="mb-4 space-y-1">
          <Li>Orders are typically dispatched within 24–48 hours of payment confirmation.</Li>
          <Li>Delivery timelines vary by location: 2–5 business days for most metros, up to 7 days for other areas.</Li>
          <Li>Free shipping on orders above ₹2,000. Shipping charges apply below this threshold.</Li>
          <Li>Risk of loss transfers to the buyer upon dispatch. We provide tracking information for all shipments.</Li>
          <Li>PuralityOnline is not responsible for delays caused by courier partners or unforeseen circumstances.</Li>
        </ul>

        <H2>5. Returns and Refunds</H2>
        <P>Please refer to our separate <Link href="/refund-policy" className="text-[#E11D48] hover:underline">Refund Policy</Link> for complete details. In summary:</P>
        <ul className="mb-4 space-y-1">
          <Li>Returns accepted within 7 days for unworn, undamaged items in original packaging.</Li>
          <Li>Full refund if item is found to be inauthentic — no questions asked.</Li>
          <Li>Exchange requests are subject to stock availability.</Li>
        </ul>

        <H2>6. User Accounts</H2>
        <ul className="mb-4 space-y-1">
          <Li>You are responsible for maintaining the confidentiality of your account credentials.</Li>
          <Li>You must provide accurate and complete registration information.</Li>
          <Li>We reserve the right to suspend or terminate accounts that violate these terms.</Li>
          <Li>One account per person. Duplicate or shared accounts may be deactivated.</Li>
        </ul>

        <H2>7. Intellectual Property</H2>
        <P>All content on this website — including brand name, logo, product descriptions, photographs, and design — is the property of PuralityOnline Pvt Ltd or its licensors. You may not reproduce, distribute, or create derivative works without written permission.</P>

        <H2>8. Limitation of Liability</H2>
        <P>PuralityOnline&apos;s liability is limited to the purchase price of the product in question. We are not liable for indirect, incidental, or consequential damages arising from use of our platform or products.</P>

        <H2>9. Governing Law</H2>
        <P>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in New Delhi.</P>

        <H2>10. Contact</H2>
        <div className="border border-[#E0DFDC] p-5 text-[13px] space-y-1" style={{ fontFamily: 'Space Mono' }}>
          <p className="font-bold text-[#0C0C0C]">PuralityOnline Pvt Ltd</p>
          <p className="text-[#78716C]">RZ-B-153, GF Shop No. 2, Kh No. 31/8, Dabri Extn, New Delhi — 110045</p>
          <p><a href="mailto:contact@puralityonline.com" className="text-[#E11D48] hover:underline">contact@puralityonline.com</a></p>
          <p><a href="tel:9625616800" className="text-[#E11D48] hover:underline">9625616800</a></p>
        </div>

        <div className="mt-12 flex gap-4 text-[12px]" style={{ fontFamily: 'Space Mono' }}>
          <Link href="/privacy-policy" className="text-[#78716C] hover:text-[#E11D48] transition-colors">Privacy Policy →</Link>
          <Link href="/refund-policy" className="text-[#78716C] hover:text-[#E11D48] transition-colors">Refund Policy →</Link>
        </div>
      </div>
    </div>
  );
}
