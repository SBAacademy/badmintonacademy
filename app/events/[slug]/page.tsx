import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  MapPin,
  ExternalLink,
  MessageCircle,
  Phone,
  ArrowLeft,
  Share2,
  ShieldCheck,
  Trophy,
  Star,
  Users,
} from "lucide-react";
import { getEventBySlug, getEvents } from "@/lib/contentDb";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import {
  EVENT_TYPE_BADGES,
  EVENT_STATUS_LABELS,
  formatEventDate,
} from "@/data/events";
import { SITE_URL } from "@/lib/seo";
import { ACADEMY_DATA } from "@/data/academy";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const dynamic = "force-dynamic";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug, { includeUnpublished: false });

  if (!event) {
    return {
      title: "Event Not Found | S&A Badminton Academy",
    };
  }

  // Section 8: Target title format
  // Academy Tournament 2026 | Badminton Tournament in Kochi | S&A Badminton Academy
  const title = `${event.title} | Badminton Tournament in Kochi | S&A Badminton Academy`;

  // Section 8: Dynamic meta description using real event information
  // Example: Academy Tournament 2026 at S&A Badminton Academy, Kumbalanghi, Kochi. View tournament details, date, venue and event information.
  const centrePart = event.centreName || (event.venue.toLowerCase().includes("kumbalanghi") ? "Kumbalanghi" : event.venue.toLowerCase().includes("kadavanthra") ? "Kadavanthra" : "");
  const venueLocation = centrePart ? `${centrePart}, Kochi` : event.venue;
  const description = `${event.title} at S&A Badminton Academy, ${venueLocation}. View tournament details, date, venue and event information.`;

  const canonicalUrl = `${SITE_URL}/events/${event.slug}`;
  const ogImage = event.image || `${SITE_URL}/images/hero-athlete.jpg`;

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug, { includeUnpublished: false });

  // Strict: If event does not exist or is unpublished, return HTTP 404
  if (!event) {
    notFound();
  }

  const badge = EVENT_TYPE_BADGES[event.eventType] || EVENT_TYPE_BADGES.OTHER;
  const statusConfig = EVENT_STATUS_LABELS[event.status] || EVENT_STATUS_LABELS.UPCOMING;
  const canonicalUrl = `${SITE_URL}/events/${event.slug}`;

  // Clean date without inventing missing start/end times
  const cleanStartDate = event.eventDate?.includes("T")
    ? event.eventDate.split("T")[0]
    : event.eventDate;

  const venueName = event.centreName
    ? `S&A Badminton Academy — ${event.centreName}`
    : event.venue;

  // JSON-LD SportsEvent Schema Markup
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "@id": `${canonicalUrl}#event`,
    name: event.title,
    description: event.description || `${event.title} at ${venueName}, Kochi.`,
    startDate: cleanStartDate,
    eventStatus:
      event.status === "CANCELLED"
        ? "https://schema.org/EventCancelled"
        : event.status === "COMPLETED"
        ? "https://schema.org/EventCompleted"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: venueName,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.venue,
        addressLocality: event.centreName || "Kochi",
        addressRegion: "Kerala",
        addressCountry: "IN",
      },
    },
    image: [event.image || `${SITE_URL}/images/hero-athlete.jpg`],
    organizer: {
      "@type": "SportsOrganization",
      name: ACADEMY_DATA.name,
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      availability:
        event.status === "UPCOMING" || event.status === "ONGOING"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    },
  };

  const whatsappInquiryUrl = buildWhatsAppUrl({
    phone: event.contact ? event.contact.replace(/[^0-9]/g, "") : undefined,
    customMessage: `Hello S&A Academy, I would like more information/registration details regarding "${event.title}" scheduled on ${formatEventDate(event.eventDate)}.`,
  });

  return (
    <div className="bg-[#07090D] min-h-screen text-white select-none">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />

      <div className="max-w-6xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-8">
        {/* Navigation Breadcrumbs & Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2937] pb-4">
          <Breadcrumbs
            items={[
              { name: "Events & Tournaments", url: "/events" },
              { name: event.title, url: `/events/${event.slug}` },
            ]}
          />

          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#A8B0BA] hover:text-[#B8F000] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Events</span>
          </Link>
        </div>

        {/* Primary Page Header with Single H1 & Supporting Information */}
        <div className="space-y-3 pt-2 text-left border-b border-[#1F2937] pb-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-0.5 text-[11px] font-mono font-black uppercase rounded bg-[#B8F000] text-[#07090D] tracking-wider">
              {badge.label}
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-[#A8B0BA] uppercase">
              {event.centreName
                ? `S&A BADMINTON ACADEMY — ${event.centreName.toUpperCase()}`
                : "S&A BADMINTON ACADEMY"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#A8B0BA] pt-1">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <Calendar className="w-4 h-4 text-[#B8F000]" />
              <span>{formatEventDate(event.eventDate).toUpperCase()}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#B8F000]" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Hero Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Visual Poster Aspect */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-3xl overflow-hidden bg-[#0F141C] border border-[#1F2937] shadow-2xl">
              <Image
                src={event.image || "/images/badminton-arena.jpg"}
                alt={event.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-transparent to-transparent opacity-70" />

              {/* Badges on Poster */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 text-xs font-mono font-black uppercase rounded-lg border backdrop-blur-md shadow ${badge.bg} ${badge.text}`}>
                  {badge.icon} {badge.label}
                </span>

                <span className={`px-3 py-1 text-xs font-mono font-bold uppercase rounded-full border backdrop-blur-md flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.text}`}>
                  <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                  {statusConfig.label}
                </span>
              </div>

              {event.isFeatured && (
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-yellow-500 text-black text-xs font-mono font-black uppercase rounded-lg shadow-md flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-black" />
                  FEATURED EVENT
                </div>
              )}
            </div>

            {/* Event Description & Details */}
            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-[#B8F000]" />
                  <span>Event Overview &amp; Format</span>
                </h2>
                <div className="text-sm sm:text-base text-[#A8B0BA] leading-relaxed whitespace-pre-line font-normal space-y-4">
                  {event.description || "Official tournament hosted and organized under S & A Badminton Academy standards. Contact the admissions desk for category entries, reporting times, and draw announcements."}
                </div>
              </div>

              {/* Tournament Highlights Card */}
              <div className="bg-[#0F141C] border border-[#1F2937] p-6 rounded-2xl space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#B8F000]" />
                  <span>Academy Quality Guarantee</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#A8B0BA]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8F000]" />
                    <span>BWF Grade-1 certified sprung wooden courts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8F000]" />
                    <span>Certified umpires &amp; official scorekeeping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8F000]" />
                    <span>Physiotherapist &amp; warm-up area available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8F000]" />
                    <span>Medals, certificates &amp; cash awards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Key Details & Registration Card */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="bg-[#0F141C] border border-[#1F2937] p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl sticky top-24">
              <div className="space-y-1">
                <div className="font-mono text-xs text-[#B8F000] uppercase tracking-wider">
                  OFFICIAL FIXTURE
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight">
                  Registration &amp; Summary
                </h2>
              </div>

              {/* Schedule and Location Info */}
              <div className="space-y-4 border-y border-[#1F2937] py-6 text-xs">
                {/* Date */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#161F2C] rounded-xl border border-[#1F2937] text-[#B8F000] shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-[#A8B0BA] uppercase">DATE</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {formatEventDate(event.eventDate)}
                    </div>
                  </div>
                </div>

                {/* Venue */}
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#161F2C] rounded-xl border border-[#1F2937] text-[#B8F000] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-[#A8B0BA] uppercase">VENUE</div>
                    <div className="text-sm font-bold text-white mt-0.5 leading-snug">
                      {event.venue}
                    </div>

                    {event.centreSlug && (
                      <div className="mt-2">
                        <Link
                          href={`/${event.centreSlug}`}
                          className="inline-flex items-center gap-1.5 text-xs text-[#B8F000] hover:underline font-mono font-bold"
                        >
                          <span>Explore {event.centreName || event.centreSlug} Centre Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact */}
                {event.contact && (
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-[#161F2C] rounded-xl border border-[#1F2937] text-[#B8F000] shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-[#A8B0BA] uppercase">DESK CONTACT / WHATSAPP</div>
                      <div className="text-sm font-bold text-white mt-0.5 font-mono">
                        {event.contact}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-mono font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md group"
                >
                  <MessageCircle className="w-4 h-4 text-[#07090D]" />
                  <span>ENQUIRE ON WHATSAPP</span>
                </a>
              </div>

              {/* Sharing Note */}
              <p className="text-[11px] font-mono text-[#A8B0BA] text-center pt-2">
                Share this tournament with fellow badminton players &amp; clubs.
              </p>
            </div>
          </div>
        </div>
      </div>

      <FinalCTA />
    </div>
  );
}
