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

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <div className="border-b border-[#E0DFDC]">
        <div className="max-w-[860px] mx-auto px-6 py-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#78716C] mb-2" style={{ fontFamily: 'Space Mono' }}>Legal</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-[#0C0C0C]" style={{ fontFamily: 'Outfit', fontWeight: 800 }}>Privacy Policy</h1>
          <p className="text-[12px] text-[#78716C] mt-2" style={{ fontFamily: 'Space Mono' }}>Last updated: March 2026</p>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 pb-20">
        <P>This Privacy Policy describes how PuralityOnline Pvt Ltd (&ldquo;PuralityOnline,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, and shares information about you when you use our website at puralityonline.in and related services.</P>

        <H2>1. Information We Collect</H2>
        <P>We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support:</P>
        <ul className="mb-4 space-y-1">
          <Li>Name, email address, phone number, and shipping address</Li>
          <Li>Payment information (processed securely; we do not store card details)</Li>
          <Li>Order history and preferences</Li>
          <Li>Communications you send us</Li>
        </ul>
        <P>We also automatically collect certain information when you visit our site, including IP address, browser type, pages visited, and referring URLs.</P>

        <H2>2. How We Use Your Information</H2>
        <ul className="mb-4 space-y-1">
          <Li>To process and fulfil your orders</Li>
          <Li>To send order confirmations, shipping updates, and invoices</Li>
          <Li>To respond to your queries and provide customer support</Li>
          <Li>To send promotional communications (only with your consent)</Li>
          <Li>To detect and prevent fraud or misuse of our platform</Li>
          <Li>To improve our website and services</Li>
        </ul>

        <H2>3. Sharing of Information</H2>
        <P>We do not sell your personal information. We may share your information with:</P>
        <ul className="mb-4 space-y-1">
          <Li>Logistics and delivery partners to fulfil your orders</Li>
          <Li>Payment processors to handle transactions securely</Li>
          <Li>Service providers who assist in operating our platform (under strict confidentiality)</Li>
          <Li>Law enforcement or regulatory bodies when required by law</Li>
        </ul>

        <H2>4. Data Retention</H2>
        <P>We retain your personal information for as long as necessary to fulfil the purposes outlined in this policy, comply with legal obligations, and resolve disputes. Order records are retained for a minimum of 7 years as required under Indian accounting laws.</P>

        <H2>5. Your Rights</H2>
        <P>You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at contact@puralityonline.com. We will respond within 30 days.</P>

        <H2>6. Cookies</H2>
        <P>We use essential cookies to operate our website (session management, cart functionality). We do not use tracking cookies for advertising purposes without your consent.</P>

        <H2>7. Security</H2>
        <P>We implement industry-standard security measures to protect your information, including HTTPS encryption and secure payment gateways. However, no method of internet transmission is 100% secure.</P>

        <H2>8. Contact</H2>
        <P>For privacy-related queries, contact us at:</P>
        <div className="border border-[#E0DFDC] p-5 text-[13px] space-y-1" style={{ fontFamily: 'Space Mono' }}>
          <p className="font-bold text-[#0C0C0C]">PuralityOnline Pvt Ltd</p>
          <p className="text-[#78716C]">Plot No: 385/2522/3931, Floor - 02, Near Koel Campus, TBS Workspace, Nandan Kanan Road, Patia, Bhubaneswar, Khordha 751024</p>
          <p><a href="mailto:contact@puralityonline.com" className="text-[#E11D48] hover:underline">contact@puralityonline.com</a></p>
          <p><a href="tel:9625616800" className="text-[#E11D48] hover:underline">9625616800</a></p>
        </div>

        <div className="mt-12 flex gap-4 text-[12px]" style={{ fontFamily: 'Space Mono' }}>
          <Link href="/terms" className="text-[#78716C] hover:text-[#E11D48] transition-colors">Terms & Conditions →</Link>
          <Link href="/refund-policy" className="text-[#78716C] hover:text-[#E11D48] transition-colors">Refund Policy →</Link>
        </div>
      </div>
    </div>
  );
}
