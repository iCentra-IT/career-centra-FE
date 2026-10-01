import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import { Providers } from "./providers";

const SITE_URL = "https://careercentra.icentra.com";
const SITE_NAME = "CareerCentra";
// GA4 (G-3DCVQ0ECY2) is configured as a tag INSIDE this GTM container, not loaded separately here
// — Google's own guidance once GTM is already in place, since loading gtag.js directly alongside
// GTM double-fires pageviews/events. See the GA4 Configuration tag in the GTM workspace.
const GTM_ID = "GTM-T492M9HH";
const DEFAULT_DESCRIPTION =
  "CareerCentra is iCentra's career advancement platform — globally aligned certifications, executive programs, and workforce capability training in project management, agile, cybersecurity, AI and digital transformation.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Career Advancement Platform`,
    // Per-page metadata (e.g. `title: "Programs"`) is slotted into "%s | CareerCentra" — pages
    // that want a bare title instead (rare) can pass `title: { absolute: "..." }`.
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "project management certification",
    "PMP training",
    "PMI Dallas",
    "agile certification",
    "career development",
    "workforce capability training",
    "iCentra",
    "CareerCentra",
  ],
  authors: [{ name: SITE_NAME }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} — Career Advancement Platform`,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Career Advancement Platform`,
    description: DEFAULT_DESCRIPTION,
  },
};

// Confirmed real contact details — see the Privacy Policy page (Section 1, Data Controller).
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "CareerCentra",
  alternateName: "iCentra Solutions Limited",
  url: SITE_URL,
  logo: `${SITE_URL}/CareerCentra-full-logo.png`,
  description: DEFAULT_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Abuja",
    addressCountry: "NG",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+234-807-675-7797",
    email: "privacy@careercentra.icentra.com",
    contactType: "customer service",
  },
  sameAs: [
    "https://x.com",
    "https://www.facebook.com/share/19a78hWFxt/?mibextid=wwXIfr",
    "https://www.instagram.com/careercentra?stkn=eHo0cTdrbGVwNXc5",
    "https://youtube.com",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
      </head>
      <GoogleTagManager gtmId={GTM_ID} />
      <Providers>
        <body>
          {/* Noscript fallback for GTM — the GoogleTagManager component above only injects the
              <script> tags, not this; Google's own snippet calls for it as early in <body> as
              possible. */}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
          {children}
        </body>
      </Providers>
    </html>
  );
}
