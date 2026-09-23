"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Navigation, MessageCircle, ArrowRight, Clock, Phone } from "lucide-react";
import { LOCATIONS, LocationData } from "@/data/locations";
import { Centre } from "@/data/centres";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";
import { resolveAutomaticNeighborhoods } from "@/lib/constants";

export function BranchesSection({ initialCentres }: { initialCentres?: Centre[] }) {
  const [dynamicCentres, setDynamicCentres] = useState<Centre[]>(initialCentres || []);

  useEffect(() => {
    fetch("/api/centres")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data.centres)
          ? data.centres
          : Array.isArray(data.items)
            ? data.items
            : Array.isArray(data.data)
              ? data.data
              : Array.isArray(data)
                ? data
                : [];
        if (Array.isArray(list)) {
          setDynamicCentres(list);
        }
      })
      .catch((err) => console.error("Failed to load centres in BranchesSection:", err));
  }, []);

  const locationsList: LocationData[] = dynamicCentres.map((c) => {
    const staticLoc = LOCATIONS[c.slug as keyof typeof LOCATIONS];
    const autoNeighborhoods = resolveAutomaticNeighborhoods(c.address, c.name);
    const morningTiming = c.openingHours?.morning
      ? `${c.openingHours.morning}${c.openingHours.evening ? ` | ${c.openingHours.evening}` : ""}`
      : "5:00 AM – 10:00 PM (All 7 Days)";

    const primaryImage = c.image || c.courtImage || (staticLoc as any)?.image || "/images/badminton-arena.jpg";

    return {
      ...(staticLoc || {}),
      ...c,
      slug: c.slug,
      name: c.name,
      shortName: c.shortName || c.name,
      district: c.district || "Kochi",
      address: c.address || "",
      phone: c.phone || "+91 94006 35548",
      phoneDisplay: c.phoneDisplay || c.phone || "+91 94006 35548",
      email: c.email || "",
      whatsapp: (c as any).whatsapp || "919400635548",
      whatsappDisplay: (c as any).whatsappDisplay || "+91 94006 35548",
      googleMapsUrl: c.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(c.address || c.name + " Kochi")}`,
      image: primaryImage,
      gallery: (c as any).gallery?.length > 0 ? (c as any).gallery : [{ url: primaryImage, caption: c.name }],
      courtInformation: {
        courtCount: c.courtCount || 3,
        surfaceType: c.surfaceType || "BWF Grade-1 Certified Synthetic Surface",
      },
      openingHours: {
        days: "Monday - Sunday (7 Days Open)",
        morning: morningTiming,
        evening: "",
      },
      intro: {
        heading: c.name,
        subheading: c.shortName || "Premier Badminton Arena",
        description: c.description || (staticLoc as any)?.intro?.description || "Dedicated badminton coaching and athletic conditioning arena in Kochi.",
        neighbourhoodsServed: autoNeighborhoods,
        connectivity: "Easily accessible from major transit corridors across Kochi",
      },
      facilities: c.facilities || (staticLoc as any)?.facilities || [],
      coaches: c.coaches || (staticLoc as any)?.coaches || [],
      programs: [],
      testimonials: c.testimonials || [],
      achievements: [],
      localFAQs: [],
      seo: {
        title: c.seoTitle || c.seo?.title || `${c.name} | S & A Badminton Academy`,
        description: c.seoDescription || c.seo?.description || c.description || "",
        primaryKeyword: c.seo?.primaryKeyword || `badminton coaching in ${c.name}`,
        secondaryKeywords: c.seo?.secondaryKeywords || [],
        relatedKeywords: c.seo?.relatedKeywords || [],
      },
    } as unknown as LocationData;
  });

  const [selectedSlug, setSelectedSlug] = useState<string>(locationsList[0]?.slug || "kadavanthra");

  useEffect(() => {
    if (!locationsList.some((l) => l.slug === selectedSlug) && locationsList[0]) {
      setSelectedSlug(locationsList[0].slug);
    }
  }, [locationsList, selectedSlug]);

  const activeCentre: LocationData =
    locationsList.find((l) => l.slug === selectedSlug) || locationsList[0];

  const handleWhatsAppLocation = (locName: string, locSlug: string) => {
    trackEvent("whatsapp_click", { location: locSlug, source: "rebel_arena_selector" });
  };

  const handleDirections = (locName: string, locSlug: string) => {
    trackEvent("map_directions_click", { location: locSlug, source: "rebel_arena_selector" });
  };

  if (locationsList.length === 0) {
    return null;
  }

  return (
    <section
      className="py-24 lg:py-36 bg-[#07090D] relative border-b border-[#1F2937] select-none"
      aria-label="Multi-Centre Arena Selector"
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Editorial Eyebrow & Category Index */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 sm:pb-16 border-b border-[#1F2937]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
                05 // LOCATIONS
              </span>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
                ARENA NETWORK
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.03em] uppercase leading-[0.95]">
              TRAIN AT {locationsList.length} STRATEGIC <br />
              <span className="text-[#B8F000]">KOCHI CENTRES.</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href="/branches"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#B8F000] hover:text-white uppercase transition-colors"
            >
              <span>EXPLORE ALL CENTRES DIRECTORY</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Desktop 2-Column Arena Selector (Hidden on mobile) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-10 items-stretch pt-12">

          {/* Left Column: Centre Index List */}
          <div className="lg:col-span-5 flex flex-col divide-y divide-[#1F2937] border-y border-[#1F2937]">
            {locationsList.map((loc, idx) => {
              const isActive = loc.slug === activeCentre.slug;
              const numStr = `0${idx + 1}`;
              return (
                <button
                  key={loc.slug}
                  type="button"
                  onMouseEnter={() => setSelectedSlug(loc.slug)}
                  onFocus={() => setSelectedSlug(loc.slug)}
                  onClick={() => setSelectedSlug(loc.slug)}
                  className={`py-6 px-5 text-left transition-all duration-200 flex items-center justify-between group ${isActive
                    ? "bg-[#11161D] border-l-4 border-l-[#B8F000] pl-7"
                    : "hover:bg-[#0B0F14] hover:pl-7"
                    }`}
                  aria-selected={isActive}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-xs font-black transition-colors ${isActive ? "text-[#B8F000]" : "text-[#A8B0BA]/40 group-hover:text-white"
                        }`}>
                        {numStr}
                      </span>
                      <span className="text-[10px] font-mono tracking-wider text-[#A8B0BA] uppercase">
                        {loc.district}
                      </span>
                      {loc.slug === "kadavanthra" && (
                        <span className="px-1.5 py-0.2 bg-[#B8F000] text-[#07090D] font-mono text-[9px] font-black">
                          HQ
                        </span>
                      )}
                      {loc.isPlaceholder && (
                        <span className="px-1.5 py-0.2 bg-[#1F2937] text-[#A8B0BA] font-mono text-[9px]">
                          EXPANSION
                        </span>
                      )}
                    </div>

                    <h3 className={`text-2xl font-black uppercase tracking-tight transition-colors ${isActive ? "text-white" : "text-[#A8B0BA] group-hover:text-white"
                      }`}>
                      {loc.shortName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-mono font-bold uppercase transition-opacity ${isActive ? "opacity-100 text-[#B8F000]" : "opacity-0 group-hover:opacity-100 text-[#A8B0BA]"
                      }`}>
                      VIEW
                    </span>
                    <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${isActive ? "text-[#B8F000] translate-x-1" : "text-[#1F2937] group-hover:text-white"
                      }`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Arena Spotlight Panel */}
          <div className="lg:col-span-7 bg-[#0B0F14] border border-[#1F2937] p-8 lg:p-10 flex flex-col justify-between">
            <div className="space-y-6">

              {/* Centre Photography */}
              <div className="relative aspect-[16/9] overflow-hidden bg-[#07090D] border border-[#1F2937]">
                <Image
                  src={activeCentre.image || activeCentre.gallery?.[0]?.url || "/images/badminton-arena.jpg"}
                  alt={`${activeCentre.name} badminton courts Kochi`}
                  fill
                  className="object-cover filter contrast-110"
                  sizes="(max-width: 1280px) 50vw, 600px"
                  unoptimized={Boolean(activeCentre.image && (activeCentre.image.startsWith("http") || activeCentre.image.startsWith("data:")))}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#07090D]/90 border border-[#1F2937] font-mono text-[10px] font-bold text-[#B8F000] uppercase tracking-wider">
                  {activeCentre.district ? `${activeCentre.district} ARENA` : "ACTIVE CENTRE"}
                </div>
              </div>

              {/* Centre Identity & Address */}
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 text-xs font-mono text-[#B8F000] uppercase">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{activeCentre.address}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  {activeCentre.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#A8B0BA] leading-relaxed">
                  {activeCentre.intro.description}
                </p>
              </div>

              {/* Timings & Direct Contact */}
              <div className="grid grid-cols-2 gap-4 border-y border-[#1F2937] py-4 text-xs">
                <div>
                  <div className="font-mono text-[10px] text-[#A8B0BA] uppercase tracking-wider mb-1">
                    OPERATIONAL TIMINGS
                  </div>
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span>{activeCentre.openingHours?.morning || "5:00 AM – 10:00 PM"}</span>
                  </div>
                </div>

                <div>
                  <div className="font-mono text-[10px] text-[#A8B0BA] uppercase tracking-wider mb-1">
                    DIRECT CONTACT
                  </div>
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span>{activeCentre.phoneDisplay || activeCentre.phone || "+91 94006 35548"}</span>
                  </div>
                </div>
              </div>

              {/* Areas Served for Local SEO */}
              <div className="space-y-1.5 text-left">
                <span className="font-mono text-[10px] text-[#A8B0BA] uppercase tracking-wider">
                  NEIGHBORHOODS SERVED:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeCentre.intro.neighbourhoodsServed.slice(0, 6).map((area: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-[#11161D] border border-[#1F2937] text-[10px] font-mono text-[#A8B0BA]"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Direct Conversion Actions — SEO Friendly Links */}
            <div className="pt-6 mt-6 border-t border-[#1F2937] space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/${activeCentre.slug}`}
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider transition-all"
                >
                  <span>EXPLORE {activeCentre.shortName.toUpperCase()} →</span>
                </Link>

                <a
                  href={activeCentre.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleDirections(activeCentre.name, activeCentre.slug)}
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-[#11161D] hover:bg-[#17212C] text-white font-bold text-xs uppercase tracking-wider border border-[#1F2937] transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#B8F000]" />
                  <span>GET DIRECTIONS</span>
                </a>

                <a
                  href={buildWhatsAppUrl({ locationSlug: activeCentre.slug, locationName: activeCentre.name })}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleWhatsAppLocation(activeCentre.name, activeCentre.slug)}
                  className="inline-flex items-center gap-2 px-4 py-3.5 bg-[#11161D] hover:bg-[#17212C] text-white font-bold text-xs uppercase tracking-wider border border-[#1F2937] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                  <span>WHATSAPP</span>
                </a>
              </div>

              <p className="text-xs font-mono text-[#A8B0BA] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8F000]" />
                Shoes &amp; racket required for free trial.
              </p>
            </div>

          </div>

        </div>

        {/* Mobile Dedicated Stacked Accordion (Zero hover dependency, 48px touch targets) */}
        <div className="lg:hidden pt-8 space-y-4">
          {locationsList.map((loc, idx) => {
            const isExpanded = loc.slug === selectedSlug;
            return (
              <div
                key={loc.slug}
                className="bg-[#0B0F14] border border-[#1F2937] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setSelectedSlug(isExpanded ? "" : loc.slug)}
                  className="w-full min-h-[56px] px-5 py-4 text-left flex items-center justify-between transition-colors active:bg-[#11161D]"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-[#B8F000]">
                      0{idx + 1}
                    </span>
                    <span className="font-black text-lg text-white uppercase tracking-tight">
                      {loc.shortName}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#B8F000]">
                    {isExpanded ? "−" : "+"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="p-5 border-t border-[#1F2937] space-y-4 bg-[#07090D]">
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#0B0F14] border border-[#1F2937]">
                      <Image
                        src={loc.image || loc.gallery?.[0]?.url || "/images/badminton-arena.jpg"}
                        alt={loc.name}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        unoptimized={Boolean(loc.image && (loc.image.startsWith("http") || loc.image.startsWith("data:")))}
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <div className="text-xs text-[#B8F000] font-mono flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{loc.address}</span>
                      </div>
                      <p className="text-xs text-[#A8B0BA] leading-relaxed pt-1">
                        {loc.intro.description}
                      </p>
                      <div className="pt-2 grid grid-cols-1 gap-1.5 text-xs text-[#A8B0BA] border-t border-[#1F2937]/50 mt-2">
                        <div className="flex items-center gap-1.5 text-white font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#B8F000] shrink-0" />
                          <span>{loc.openingHours?.morning || "5:00 AM – 10:00 PM"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#B8F000] shrink-0" />
                          <span>{loc.phoneDisplay || loc.phone || "+91 94006 35548"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <Link
                        href={`/${loc.slug}`}
                        className="w-full min-h-[48px] px-4 py-3 bg-[#B8F000] text-[#07090D] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <span>EXPLORE {loc.shortName.toUpperCase()} CENTRE</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={loc.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[48px] px-3 py-2 bg-[#11161D] text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 border border-[#1F2937]"
                        >
                          <Navigation className="w-3.5 h-3.5 text-[#B8F000]" />
                          <span>DIRECTIONS</span>
                        </a>

                        <a
                          href={buildWhatsAppUrl({ locationSlug: loc.slug, locationName: loc.name })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[48px] px-3 py-2 bg-[#11161D] text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 border border-[#1F2937]"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                          <span>WHATSAPP</span>
                        </a>
                      </div>

                      <p className="text-[10px] font-mono text-center text-[#A8B0BA] pt-0.5">
                        Shoes &amp; racket required for free trial.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
