import type { Metadata, Viewport } from "next";
import ClientLayout from "@/components/layout/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "AVIK ERETAIL — Fashion & Footwear Destination",
  description: "India's curated multi-category retail destination. Premium footwear and wholesale clothing — authenticated, affordable, delivered.",
  metadataBase: new URL("https://www.avikeretail.com"),
  openGraph: {
    title: "AVIK ERETAIL — Fashion & Footwear Destination",
    description: "India's curated multi-category retail destination. Premium footwear and wholesale clothing — authenticated, affordable, delivered.",
    url: "https://www.avikeretail.com",
    siteName: "AVIK ERETAIL",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AVIK ERETAIL — Fashion & Footwear Destination",
    description: "India's curated multi-category retail destination. Premium footwear and wholesale clothing.",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Figtree:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
