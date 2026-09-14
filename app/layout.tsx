import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppLayoutWrapper } from "@/components/layout/AppLayoutWrapper";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { getOrganizationSchema, SITE_URL } from "@/lib/seo";
import { ACADEMY_DATA } from "@/data/academy";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${ACADEMY_DATA.name} | Badminton Coaching in Kochi`,
    template: `%s | ${ACADEMY_DATA.name}`,
  },
  description: ACADEMY_DATA.description,
  keywords: [
    "badminton academy in Kochi",
    "badminton coaching in Kochi",
    "badminton classes in Kochi",
    "badminton coaching for kids",
    "junior badminton coaching",
    "badminton coaching Kadavanthra",
    "badminton academy Edappally",
    "badminton coaching Kakkanad",
    "adult badminton classes",
    "badminton summer camp Kochi",
  ],
  authors: [{ name: ACADEMY_DATA.name }],
  creator: ACADEMY_DATA.name,
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: ACADEMY_DATA.name,
    title: `${ACADEMY_DATA.name} — Premier Badminton Coaching in Kochi`,
    description: ACADEMY_DATA.description,
    images: [
      {
        url: `${SITE_URL}/images/hero-athlete.jpg`,
        width: 1200,
        height: 630,
        alt: `${ACADEMY_DATA.name} Badminton Arena`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${ACADEMY_DATA.name} | Badminton Coaching in Kochi`,
    description: ACADEMY_DATA.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable} data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased bg-[#07090D] text-[#FFFFFF] min-h-screen flex flex-col font-sans selection:bg-[#B8F000] selection:text-[#07100A]">
        <SEOJsonLd schema={getOrganizationSchema()} />
        <AppLayoutWrapper>{children}</AppLayoutWrapper>
      </body>
    </html>
  );
}
