import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileConversionBar } from "@/components/layout/MobileConversionBar";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { getOrganizationSchema } from "@/lib/seo";
import { ACADEMY_DATA } from "@/data/academy";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sabadmintonacademy.com"),
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
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://sabadmintonacademy.com",
    siteName: ACADEMY_DATA.name,
    title: `${ACADEMY_DATA.name} — Premier Badminton Coaching in Kochi`,
    description: ACADEMY_DATA.description,
    images: [
      {
        url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop",
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
    <html lang="en" className={jakarta.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased bg-[#080B10] text-[#F8FAFC] min-h-screen flex flex-col font-sans selection:bg-[#B8F000] selection:text-[#07100A]">
        <SEOJsonLd schema={getOrganizationSchema()} />
        <AnnouncementBar />
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <MobileConversionBar />
      </body>
    </html>
  );
}
