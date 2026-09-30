import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Shield,
  ArrowRight,
  MessageCircle,
  ExternalLink,
  Users,
  Award,
  ChevronDown,
  Navigation
} from "lucide-react";
import { ACADEMY_DATA } from "@/data/academy";
import type { LocationData } from "@/data/locations";
import { getCentreBySlug, getCentres } from "@/lib/contentDb";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { CentreGallerySection } from "@/components/sections/CentreGallerySection";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface LocationPageProps {
  params: Promise<{
    location: string;
  }>;
}

export async function generateStaticParams() {
  const dynamicCentres = await getCentres({ includeInactive: false });
  return dynamicCentres.map((c) => ({
    location: c.slug,
  }));
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const dynamicCentre = await getCentreBySlug(resolvedParams.location);

  if (!dynamicCentre || dynamicCentre.status === "INACTIVE" || dynamicCentre.isActive === false) {
    return {
      title: "Centre Not Found | S & A Badminton Academy",
    };
  }

  const location = dynamicCentre;
  const canonicalUrl = `${SITE_URL}/${location.slug}`;

  const title = dynamicCentre?.seo?.title || `${location.name} | S & A Badminton Academy`;
  const description = dynamicCentre?.seo?.description || dynamicCentre?.description || "";
  const primaryKeyword = dynamicCentre?.seo?.primaryKeyword || "badminton coaching";
  const secondaryKeywords = dynamicCentre?.seo?.secondaryKeywords || [];
  const relatedKeywords = dynamicCentre?.seo?.relatedKeywords || [];

  return {
    title,
    description,
    keywords: [primaryKeyword, ...secondaryKeywords, ...relatedKeywords],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: ACADEMY_DATA.name,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: dynamicCentre?.image || `${SITE_URL}/images/hero-athlete.jpg`,
          width: 1200,
          height: 630,
          alt: `${location.name} - Badminton Court & Coaching in Kochi`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [dynamicCentre?.image || `${SITE_URL}/images/hero-athlete.jpg`],
    },
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const resolvedParams = await params;
  const dynamicCentre = await getCentreBySlug(resolvedParams.location);

  if (!dynamicCentre || dynamicCentre.status === "INACTIVE" || dynamicCentre.isActive === false) {
    notFound();
  }

  // Construct authoritative location entity from PostgreSQL dynamicCentre
  const location: LocationData = {
    slug: dynamicCentre.slug || resolvedParams.location,
    name: dynamicCentre.name || "",
    shortName: dynamicCentre.shortName || dynamicCentre.name || "",
    city: dynamicCentre.city || "Kochi",
    district: dynamicCentre.district || "Kochi",
    state: dynamicCentre.state || "Kerala",
    country: (dynamicCentre as any)?.country || "India",
    address: dynamicCentre.address || "",
    postalCode: (dynamicCentre as any)?.postalCode || "682020",
    phone: dynamicCentre.phone || "+91 79076 55513",
    phoneDisplay: (dynamicCentre as any)?.phoneDisplay || dynamicCentre.phone || "+91 79076 55513",
    whatsapp: (dynamicCentre as any)?.whatsapp || (dynamicCentre as any)?.whatsappNumber || "917907655513",
    whatsappDisplay: (dynamicCentre as any)?.whatsappDisplay || (dynamicCentre as any)?.whatsappNumber || "+91 79076 55513",
    email: dynamicCentre.email || "",
    latitude: dynamicCentre.latitude ?? null,
    longitude: dynamicCentre.longitude ?? null,
    googleMapsUrl: dynamicCentre.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(dynamicCentre.address || dynamicCentre.name + " Kochi")}`,
    googleMapsEmbedUrl: (() => {
      let rawEmbed = dynamicCentre.googleMapsEmbedUrl?.trim();
      if (rawEmbed) {
        const iframeMatch = rawEmbed.match(/src=["']([^"']+)["']/i);
        if (iframeMatch) {
          rawEmbed = iframeMatch[1];
        }
        if (rawEmbed) return rawEmbed;
      }
      const mapQuery = (dynamicCentre.latitude && dynamicCentre.longitude)
        ? `${dynamicCentre.latitude},${dynamicCentre.longitude}`
        : (dynamicCentre.address || `${dynamicCentre.name || "Badminton Academy"} ${dynamicCentre.city || "Kochi"}`);
      return `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    })(),
    googleBusinessProfileUrl: (dynamicCentre as any)?.googleBusinessProfileUrl || null,
    gallery: (dynamicCentre.gallery && dynamicCentre.gallery.length > 0)
      ? dynamicCentre.gallery
      : [
          {
            url: dynamicCentre.image || "/images/badminton-arena.jpg",
            caption: dynamicCentre.name || "Badminton Training Centre",
          },
        ],
    courtInformation: {
      courtCount: dynamicCentre.courtInformation?.courtCount ?? dynamicCentre.courtCount ?? 4,
      surfaceType: dynamicCentre.courtInformation?.surfaceType || dynamicCentre.surfaceType || "BWF Approved Sprung Wooden Subfloor",
      subfloor: (dynamicCentre.courtInformation as any)?.subfloor || "Sprung Wooden Subfloor",
      lightingStandard: (dynamicCentre.courtInformation as any)?.lightingStandard || "Glare-Free High Bay LED (500+ Lux)",
      ceilingClearance: (dynamicCentre.courtInformation as any)?.ceilingClearance || "30 Feet International Clear Height",
    },
    openingHours: {
      days: (dynamicCentre.openingHours as any)?.days || "Monday - Sunday (7 Days Open)",
      morning: (dynamicCentre.openingHours as any)?.morning || "05:30 AM - 08:30 AM",
      evening: (dynamicCentre.openingHours as any)?.evening || "04:30 PM - 07:30 PM",
    },
    intro: {
      heading: (dynamicCentre.intro as any)?.heading || `${dynamicCentre.name || "Badminton Training"} in Kochi`,
      subheading: (dynamicCentre.intro as any)?.subheading || "World-Class Badminton Infrastructure & Coaching",
      description: dynamicCentre.intro?.description || dynamicCentre.description || "",
      neighbourhoodsServed: (dynamicCentre.intro as any)?.neighbourhoodsServed || [dynamicCentre.district || "Kochi"],
      connectivity: (dynamicCentre.intro as any)?.connectivity || "Easily accessible via major transport networks in Kochi.",
    },
    facilities: (dynamicCentre.facilities && dynamicCentre.facilities.length > 0)
      ? dynamicCentre.facilities
      : [
          "BWF Standard Wooden Subfloor Courts",
          "Specialized Anti-Glare High Lux LED Lighting",
          "Dedicated Player Warm-Up & Physical Conditioning Zone",
          "Player Changing Rooms & Clean Restroom Facilities",
          "Filtered Drinking Water & Hydration Stations",
          "Dedicated Visitor & Parent Viewing Gallery",
          "Convenient On-Site Two-Wheeler & Four-Wheeler Parking",
          "Professional Racket Restringing & Gear Locker",
        ],
    coaches: (dynamicCentre as any).coaches || [],
    programs: (dynamicCentre as any).programs || [],
    testimonials: (dynamicCentre as any).testimonials || [],
    achievements: (dynamicCentre as any).achievements || [],
    localFAQs: (dynamicCentre.localFAQs && dynamicCentre.localFAQs.length > 0)
      ? dynamicCentre.localFAQs
      : [],
    seo: {
      title: dynamicCentre.seo?.title || dynamicCentre.seoTitle || `${dynamicCentre.name || "Centre"} | S & A Badminton Academy`,
      description: dynamicCentre.seo?.description || dynamicCentre.seoDescription || dynamicCentre.description || "",
      primaryKeyword: dynamicCentre.seo?.primaryKeyword || "badminton academy",
      secondaryKeywords: dynamicCentre.seo?.secondaryKeywords || [],
      relatedKeywords: dynamicCentre.seo?.relatedKeywords || [],
    },
    image: dynamicCentre.image,
  };

  const canonicalUrl = `${SITE_URL}/${location.slug}`;

  // Other active centres for internal linking
  const activeCentres = await getCentres({ includeInactive: false });
  const otherCentres = activeCentres.filter((l) => l.slug !== location.slug);

  // LocalBusiness & SportsActivityLocation JSON-LD Schema
  const locationSchema = {
    "@context": "https://schema.org",
    "@type": ["SportsActivityLocation", "LocalBusiness"],
    "@id": `${canonicalUrl}#centre`,
    name: location.name,
    description: location.seo.description,
    url: canonicalUrl,
    telephone: location.phone,
    email: location.email,
    image: `${SITE_URL}/images/hero-athlete.jpg`,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address,
      addressLocality: location.city,
      addressRegion: location.state,
      postalCode: location.postalCode,
      addressCountry: "IN",
    },
    ...(location.latitude && location.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: location.latitude,
            longitude: location.longitude,
          },
        }
      : {}),
    parentOrganization: {
      "@type": "SportsClub",
      name: ACADEMY_DATA.name,
      url: SITE_URL,
      logo: `${SITE_URL}/images/hero-athlete.jpg`,
      telephone: ACADEMY_DATA.phone,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "05:30",
        closes: "22:00",
      },
    ],
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Centres",
        item: `${SITE_URL}/branches`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: location.shortName,
        item: canonicalUrl,
      },
    ],
  };

  // FAQPage Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: location.localFAQs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="bg-[#080B10] text-[#F8FAFC] min-h-screen">
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(locationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 1. Breadcrumbs */}
      <div className="border-b border-[#26313D] bg-[#0E141B]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumbs
            items={[
              { name: "Centres", url: "/branches" },
              { name: location.shortName, url: `/${location.slug}` },
            ]}
          />
        </div>
      </div>

      {/* 2. Local SEO Hero Section */}
      <section className="relative overflow-hidden border-b border-[#26313D] py-14 lg:py-20 bg-gradient-to-b from-[#0E141B] to-[#080B10]">
        <div className="absolute inset-0 pointer-events-none opacity-10 court-grid-subtle" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#B8F000]/10 text-[#B8F000] border border-[#B8F000]/30 uppercase tracking-widest">
                <MapPin className="w-3.5 h-3.5" />
                <span>{location.city} • {location.district}</span>
              </div>

              {/* Primary H1 */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#F8FAFC] leading-[1.06]">
                Badminton Academy in <span className="text-[#B8F000]">{location.shortName.replace(" Centre", "")}</span>
              </h1>

              <p className="text-base sm:text-lg text-[#A7B0BC] leading-relaxed max-w-2xl font-normal">
                {location.intro.description}
              </p>

              {/* 3 Conversion CTAs */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <Link
                    href={`/contact?branch=${location.slug}`}
                    className="px-7 py-4 rounded-xl bg-[#B8F000] hover:bg-[#c7fb1e] text-[#07100A] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all duration-200 group"
                  >
                    <span>BOOK A FREE TRIAL</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <a
                    href={buildWhatsAppUrl({
                      locationSlug: location.slug,
                      locationName: location.name,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-4 rounded-xl bg-[#121A23] hover:bg-[#17212C] text-[#F8FAFC] font-semibold text-sm sm:text-base border border-[#26313D] hover:border-[#374758] transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                    <span>WHATSAPP THIS CENTRE</span>
                  </a>

                  <a
                    href={location.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-4 rounded-xl bg-transparent hover:bg-[#121A23] text-[#A7B0BC] hover:text-[#F8FAFC] font-semibold text-sm border border-[#26313D]/80 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-4 h-4 text-[#B8F000]" />
                    <span>GET DIRECTIONS</span>
                  </a>
                </div>

                <p className="text-xs font-mono text-[#A8B0BA] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B8F000]" />
                  Shoes &amp; racket required for free trial.
                </p>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-[#26313D]/70">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Court Surface</div>
                  <div className="text-xs sm:text-sm font-bold text-[#F8FAFC] truncate">{location.courtInformation.surfaceType.split(" ")[0]} Cushion</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Subflooring</div>
                  <div className="text-xs sm:text-sm font-bold text-[#F8FAFC] truncate">Sprung Wood Base</div>
                </div>
                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Admissions</div>
                  <div className="text-xs sm:text-sm font-bold text-[#B8F000]">Batches Open</div>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-[#26313D] bg-[#121A23] shadow-2xl group">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={location.gallery[0]?.url || "/images/hero-athlete.jpg"}
                    alt={`Badminton court and training action at S&A Badminton Academy ${location.shortName}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-transparent to-transparent" />
                </div>

                <div className="p-5 space-y-2 bg-[#121A23]">
                  <div className="text-xs font-bold text-[#B8F000] uppercase tracking-wider">
                    {location.name}
                  </div>
                  <div className="text-xs text-[#A7B0BC] leading-relaxed flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#B8F000] shrink-0 mt-0.5" />
                    <span>{location.address}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Location Introduction & Neighbourhoods Served */}
      <section className="py-16 lg:py-20 border-b border-[#26313D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#B8F000]">
                <span>Community & Location Context</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F8FAFC]">
                {location.intro.heading}
              </h2>

              <p className="text-base text-[#A7B0BC] leading-relaxed font-normal">
                {location.intro.description}
              </p>

              <div className="pt-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] mb-3">
                  Neighbourhoods & Commuters We Serve:
                </div>
                <div className="flex flex-wrap gap-2">
                  {location.intro.neighbourhoodsServed.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#121A23] text-[#F8FAFC] border border-[#26313D]"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0E141B] border border-[#26313D] flex items-start gap-3 mt-4">
                <Navigation className="w-5 h-5 text-[#B8F000] shrink-0 mt-0.5" />
                <div className="text-xs text-[#A7B0BC] leading-relaxed">
                  <strong className="text-[#F8FAFC] font-semibold">Commute & Connectivity: </strong>
                  {location.intro.connectivity}
                </div>
              </div>
            </div>

            {/* Quick Specs Card */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#121A23] border border-[#26313D] space-y-4 text-left">
              <div className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider border-b border-[#26313D] pb-3">
                {location.shortName} Specifications
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-[#26313D]/50">
                  <span className="text-[#6B7280]">Courts</span>
                  <span className="font-bold text-[#F8FAFC]">
                    {location.courtInformation.courtCount ? `${location.courtInformation.courtCount} Courts` : "To be confirmed"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#26313D]/50">
                  <span className="text-[#6B7280]">Mat Surface</span>
                  <span className="font-bold text-[#F8FAFC] text-right max-w-[200px] truncate">
                    {location.courtInformation.surfaceType}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#26313D]/50">
                  <span className="text-[#6B7280]">Subflooring</span>
                  <span className="font-bold text-[#F8FAFC] text-right max-w-[200px] truncate">
                    {location.courtInformation.subfloor}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-[#26313D]/50">
                  <span className="text-[#6B7280]">Lighting</span>
                  <span className="font-bold text-[#F8FAFC] text-right">
                    {location.courtInformation.lightingStandard}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[#6B7280]">Vertical Clearance</span>
                  <span className="font-bold text-[#F8FAFC]">
                    {location.courtInformation.ceilingClearance}
                  </span>
                </div>
              </div>

              <Link
                href={`/contact?branch=${location.slug}`}
                className="w-full py-3 rounded-xl bg-[#B8F000] hover:bg-[#c7fb1e] text-[#07100A] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors mt-4"
              >
                <span>Book Free Assessment Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Programs Available at This Centre */}
      <section className="py-16 lg:py-24 border-b border-[#26313D] bg-[#0E141B]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-[#B8F000] mb-2">
              Structured Developmental Pathways
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F8FAFC]">
              Badminton Coaching Programs at {location.shortName}
            </h2>
            <p className="text-sm sm:text-base text-[#A7B0BC] mt-2">
              Stage-specific coaching groups designed around player age, skill foundation, and tournament aspirations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {location.programs.map((prog, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#121A23] border border-[#26313D] hover:border-[#374758] flex flex-col justify-between transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#B8F000]/10 text-[#B8F000] border border-[#B8F000]/30 uppercase">
                      {prog.targetAge}
                    </span>
                    <span className="text-xs font-semibold text-[#6B7280]">
                      {prog.level}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#B8F000] transition-colors">
                    {prog.name}
                  </h3>

                  <p className="text-xs text-[#A7B0BC] leading-relaxed">
                    {prog.description}
                  </p>

                  <div className="text-xs text-[#6B7280] flex items-center gap-1.5 pt-2 border-t border-[#26313D]/50">
                    <Clock className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span className="truncate">{prog.schedule}</span>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href={`/contact?branch=${location.slug}&program=${prog.slug}`}
                    className="w-full py-2.5 rounded-xl bg-[#080B10] hover:bg-[#B8F000] text-[#F8FAFC] hover:text-[#07100A] border border-[#26313D] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Enquire for {prog.name.split(" ")[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Centre Facilities Checklist */}
      <section className="py-16 lg:py-20 border-b border-[#26313D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="max-w-2xl mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-[#B8F000] mb-2">
              Infrastructure & Amenities
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F8FAFC]">
              Facilities at {location.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {location.facilities.map((fac, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#121A23] border border-[#26313D] flex items-start gap-3 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-[#B8F000] shrink-0 mt-0.5" />
                <span className="text-[#F8FAFC] font-medium leading-relaxed">{fac}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5.5 Centre Photo Gallery */}
      <CentreGallerySection
        branchSlug={location.slug}
        branchName={location.shortName}
        eyebrow={`FACILITY TOUR // ${location.shortName.toUpperCase()}`}
        title={`${location.shortName} Court & Facility Gallery`}
        description={`Explore the BWF-grade wooden/synthetic courts, 750 Lux anti-glare illumination, and training sessions at ${location.name}.`}
      />

      {/* 6. Coaching Faculty Spotlight */}
      <section className="py-16 lg:py-20 border-b border-[#26313D] bg-[#0E141B]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="max-w-2xl mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-[#B8F000] mb-2">
              Mentorship & Discipline
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F8FAFC]">
              Coaches at {location.shortName}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {location.coaches.map((c, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#121A23] border border-[#26313D] space-y-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#080B10] border border-[#26313D] flex items-center justify-center font-black text-[#B8F000]">
                    {c.name.split(" ").pop()?.[0] || "C"}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F8FAFC]">{c.name}</h3>
                    <div className="text-xs text-[#B8F000] font-medium">{c.role}</div>
                  </div>
                </div>

                <div className="text-xs text-[#6B7280]">
                  <strong className="text-[#A7B0BC]">Focus: </strong>
                  {c.specialization}
                </div>

                <p className="text-xs text-[#A7B0BC] leading-relaxed pt-1">
                  {c.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Testimonials for This Centre */}
      {location.testimonials.length > 0 && (
        <section className="py-16 lg:py-20 border-b border-[#26313D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <div className="max-w-2xl mb-10">
              <div className="text-xs font-bold uppercase tracking-widest text-[#B8F000] mb-2">
                Player & Parent Feedback
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F8FAFC]">
                What Our {location.shortName} Community Says
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              {location.testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#121A23] border border-[#26313D] space-y-4 text-left"
                >
                  <p className="text-sm text-[#F8FAFC] italic leading-relaxed">
                    "{t.quote}"
                  </p>
                  <div className="border-t border-[#26313D]/60 pt-3">
                    <div className="text-xs font-bold text-[#F8FAFC]">{t.author}</div>
                    <div className="text-[11px] text-[#6B7280]">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Location Information, Timings & Interactive Map */}
      <section className="py-16 lg:py-24 border-b border-[#26313D] bg-[#0E141B]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start text-left">
            
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#B8F000] mb-2">
                  Visit The Arena
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F8FAFC]">
                  Location & Operating Hours
                </h2>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#121A23] border border-[#26313D]">
                  <MapPin className="w-5 h-5 text-[#B8F000] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#F8FAFC] mb-0.5">Physical Address</div>
                    <div className="text-[#A7B0BC] leading-relaxed">{location.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#121A23] border border-[#26313D]">
                  <Clock className="w-5 h-5 text-[#B8F000] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#F8FAFC] mb-0.5">Training Hours ({location.openingHours.days})</div>
                    <div className="text-[#A7B0BC]">Morning: {location.openingHours.morning}</div>
                    <div className="text-[#A7B0BC]">Evening: {location.openingHours.evening}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#121A23] border border-[#26313D]">
                  <Phone className="w-5 h-5 text-[#B8F000] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#F8FAFC] mb-0.5">Contact & Desk Support</div>
                    <div className="text-[#A7B0BC]">
                      Call: <a href={`tel:${location.phone}`} className="text-[#F8FAFC] hover:text-[#B8F000] font-semibold">{location.phoneDisplay}</a>
                    </div>
                    <div className="text-[#A7B0BC]">
                      WhatsApp: <a href={buildWhatsAppUrl({ locationName: location.name })} target="_blank" rel="noopener noreferrer" className="text-[#22C55E] hover:underline font-semibold">{location.whatsappDisplay}</a>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href={location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#121A23] hover:bg-[#17212C] text-[#F8FAFC] font-bold text-xs uppercase tracking-wider border border-[#26313D] transition-colors"
              >
                <Navigation className="w-4 h-4 text-[#B8F000]" />
                <span>Open Google Maps Directions</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#6B7280]" />
              </a>
            </div>

            {/* Embedded Google Map */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden border border-[#26313D] h-[380px] lg:h-[440px] w-full relative bg-[#121A23]">
                {location.googleMapsEmbedUrl ? (
                  <iframe
                    title={`Google Maps location for ${location.name}`}
                    src={location.googleMapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <Navigation className="w-10 h-10 text-[#B8F000] mb-3 opacity-60" />
                    <p className="text-sm font-semibold text-[#F8FAFC] mb-1">{location.name}</p>
                    <p className="text-xs text-[#A7B0BC] max-w-sm mb-4">{location.address}</p>
                    <a
                      href={location.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#B8F000] text-[#0A0E14] font-bold text-xs uppercase tracking-wider hover:bg-[#cbf533] transition-colors"
                    >
                      <span>Open Google Maps Directions</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Location-Specific FAQs */}
      <section className="py-16 lg:py-20 border-b border-[#26313D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-[#B8F000] mb-2">
              Frequently Asked Questions
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#F8FAFC]">
              {location.shortName} Coaching FAQs
            </h2>
          </div>

          <div className="space-y-4">
            {location.localFAQs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#121A23] border border-[#26313D] space-y-2 text-left"
              >
                <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC]">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Internal Link Mesh: Other S&A Centres */}
      <section className="py-16 lg:py-20 border-b border-[#26313D] bg-[#0E141B]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="max-w-2xl mb-8">
            <div className="text-xs font-bold uppercase tracking-widest text-[#B8F000] mb-2">
              Explore Our Greater Kochi Network
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#F8FAFC]">
              Other S & A Badminton Academy Centres
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherCentres.map((c) => (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="p-5 rounded-2xl bg-[#121A23] border border-[#26313D] hover:border-[#B8F000]/60 transition-all group block"
              >
                <div className="text-xs font-bold text-[#B8F000] uppercase tracking-wider mb-1">
                  {c.shortName || c.name}
                </div>
                <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-white transition-colors mb-2">
                  {c.name}
                </h3>
                <p className="text-xs text-[#A7B0BC] line-clamp-2 mb-4">
                  {c.intro?.description || c.description || ""}
                </p>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-[#B8F000]">
                  <span>Explore Centre</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Final Assessment Trial CTA */}
      <section className="py-16 lg:py-20 text-center relative overflow-hidden bg-gradient-to-b from-[#080B10] to-[#0E141B]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#F8FAFC]">
            Start Training at <span className="text-[#B8F000]">{location.shortName}</span>
          </h2>
          <p className="text-sm sm:text-base text-[#A7B0BC]">
            Join our structured batch programs for kids, juniors, and adults. Book an assessment trial with our head coaching team today.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href={`/contact?branch=${location.slug}`}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#B8F000] hover:bg-[#c7fb1e] text-[#07100A] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>BOOK A FREE TRIAL</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={buildWhatsAppUrl({ locationName: location.name })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#121A23] hover:bg-[#17212C] text-[#F8FAFC] font-bold text-sm sm:text-base border border-[#26313D] flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                <span>WHATSAPP US</span>
              </a>
            </div>

            <p className="text-xs font-mono text-[#A8B0BA] flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8F000]" />
              Shoes &amp; racket required for free trial.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
