import { Metadata } from "next";
import { ACADEMY_DATA } from "@/data/academy";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.soorajbadmintonacademy.in"
).replace(/\/+$/, "");

interface MetadataOptions {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

export function createMetadata({
  title,
  description,
  path = "",
  keywords = [],
  ogImage = "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop",
  noIndex = false,
}: MetadataOptions): Metadata {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${SITE_URL}${cleanPath === "/" ? "" : cleanPath}`;
  // Avoid duplicate academy branding suffix
  const cleanTitle = title
    .replace(/\s*\|\s*S\s*&\s*A\s*Badminton\s*Academy/gi, "")
    .replace(/\s*\|\s*S\s*&\s*A\s*BADMINTON\s*ACADEMY/gi, "")
    .trim();

  const fullTitle = path === "" || path === "/" 
    ? `${ACADEMY_DATA.name} | ${cleanTitle}`
    : `${cleanTitle} | ${ACADEMY_DATA.name}`;

  const defaultKeywords = [
    "badminton academy in Kochi",
    "badminton coaching in Kochi",
    "badminton coaching Kadavanthra",
    "badminton classes Edappally",
    "badminton coaching Kakkanad",
    "kids badminton coaching Kochi",
    "junior badminton training",
    "adult badminton classes Kochi",
    "competitive badminton training Kerala",
    "badminton camp Kochi",
  ];

  const mergedKeywords = Array.from(new Set([...keywords, ...defaultKeywords]));

  return {
    title: {
      absolute: fullTitle,
    },
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: ACADEMY_DATA.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${ACADEMY_DATA.name} - Badminton Coaching in Kochi`,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["SportsOrganization", "EducationalOrganization"],
    "@id": `${SITE_URL}/#organization`,
    name: ACADEMY_DATA.name,
    legalName: ACADEMY_DATA.name,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: ACADEMY_DATA.description,
    telephone: ACADEMY_DATA.phone,
    email: ACADEMY_DATA.email,
    foundingDate: `${ACADEMY_DATA.foundedYear}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: ACADEMY_DATA.headquartersAddress,
      addressLocality: ACADEMY_DATA.city,
      addressRegion: ACADEMY_DATA.state,
      postalCode: ACADEMY_DATA.postalCode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: ACADEMY_DATA.geo.latitude,
      longitude: ACADEMY_DATA.geo.longitude,
    },
    sameAs: [
      ACADEMY_DATA.socialLinks.instagram,
      ACADEMY_DATA.socialLinks.facebook,
      ACADEMY_DATA.socialLinks.youtube,
    ],
  };
}

export function getBranchLocalBusinessSchema(branch: {
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  geo: { latitude: number; longitude: number };
  image: string;
  timings: { morning: string; evening: string; days: string };
}) {
  return {
    "@context": "https://schema.org",
    "@type": ["SportsActivityLocation", "LocalBusiness"],
    "@id": `${SITE_URL}/${branch.slug}#centre`,
    name: branch.name,
    description: branch.description,
    url: `${SITE_URL}/${branch.slug}`,
    telephone: branch.phone,
    email: branch.email,
    image: branch.image,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.address,
      addressLocality: branch.city,
      addressRegion: branch.state,
      postalCode: branch.pincode,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: branch.geo.latitude,
      longitude: branch.geo.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "05:30",
        closes: "22:00",
      },
    ],
    parentOrganization: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
