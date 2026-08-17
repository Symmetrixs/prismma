import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GlobalBackground from "@/components/GlobalBackground";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://prismma.net";
const SITE_NAME = "Prismma Express";
const SITE_DESCRIPTION =
  "We specialize in providing reliable and cost-effective logistics and courier solutions to businesses and individuals across air, sea, and land freight.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Moving the way, you want!`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Moving the way, you want!`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/assets/logos/prismma_main_logo.png",
        width: 190,
        height: 32,
        alt: SITE_NAME,
      },
    ],
    locale: "en_MY",
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} - Moving the way, you want!`,
    description: SITE_DESCRIPTION,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Prismma Express Sdn Bhd",
  legalName: "Prismma Express Sdn Bhd (967851-D)",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/logos/prismma_main_logo.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "NO. 736, Lorong Perindustrian Bukit Minyak 11, Kawasan Bukit Minyak",
    addressLocality: "Simpang Ampat",
    addressRegion: "Pulau Pinang",
    postalCode: "14100",
    addressCountry: "MY",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+6-010-660-6600",
    contactType: "customer service",
    email: "enquiry@prismma.net",
  },
  sameAs: ["https://www.facebook.com/profile.php?id=61552278613121"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <GlobalBackground />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
