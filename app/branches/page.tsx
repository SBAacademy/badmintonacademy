import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, ArrowRight, MessageCircle, Navigation, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { getCentres } from "@/lib/contentDb";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { CentreGallerySection } from "@/components/sections/CentreGallerySection";

export const revalidate = 300;

export const metadata: Metadata = createMetadata({
  title: "Badminton Academy Centres in Kochi | Kadavanthra, Kumbalanghi, Maradu, Palluruthy, Chullikal",
  description: "Explore all SBA Badminton Academy training centres across Kochi. Dedicated multi-court facilities in Kadavanthra, Kumbalanghi, Maradu, Palluruthy, and Chullikal.",
  path: "/branches",
  keywords: [
    "badminton academy near me",
    "badminton academy in Kadavanthra",
    "badminton coaching Kumbalanghi",
    "badminton academy Maradu",
    "badminton academy Palluruthy",
    "badminton coaching Chullikal",
    "badminton courts Kochi",
  ],
});

export default async function BranchesPage() {
  const centres = await getCentres({ includeInactive: false });

  return (
    <div className="bg-[#07090D] min-h-screen text-white select-none">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ name: "Our Centres", url: "/branches" }]} />

        {/* Rebel Hero */}
        <div className="pt-8 pb-16 border-b border-[#1F2937] space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
              NETWORK // HUBS
            </span>
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
              ARENA INFRASTRUCTURE
            </span>
          </div>

          <h1 className="text-[clamp(2.8rem,7vw,6.5rem)] font-black uppercase tracking-[-0.04em] leading-[0.92]">
            CENTRES ACROSS <br />
            <span className="text-[#B8F000]">GREATER KOCHI.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#A8B0BA] max-w-2xl font-normal leading-relaxed">
            Strategically positioned across Central, North, and East Kochi so students, junior athletes, and working professionals can access international-grade coaching without extensive transit.
          </p>
        </div>

        {/* Centre Directory */}
        {centres.length === 0 ? (
          <div className="py-16 text-center text-[#A8B0BA] border-b border-[#1F2937]">
            <p className="text-base sm:text-lg">No active training centres currently listed.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1F2937] border-b border-[#1F2937] py-8 space-y-12">
            {centres.map((centre, idx) => (
              <div
                key={centre.slug}
                className="pt-12 first:pt-0 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left group"
              >
                {/* Media Aspect */}
                <div className={`lg:col-span-5 relative ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0B0F14] border border-[#1F2937]">
                    <Image
                      src={centre.gallery?.[0]?.url || centre.image || "/images/badminton-arena.jpg"}
                      alt={`${centre.name} badminton courts Kochi`}
                      fill
                      className="object-cover filter contrast-115 group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 1024px) 100vw, 500px"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#07090D]/90 border border-[#1F2937] font-mono text-[10px] font-bold text-[#B8F000] uppercase">
                      {centre.courtInformation?.courtCount ? `${centre.courtInformation.courtCount} COURTS` : "EXPANSION"}
                    </div>
                    {centre.slug === "kadavanthra" && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#B8F000] text-[#07090D] font-mono text-[9px] font-black uppercase">
                        HQ
                      </div>
                    )}
                  </div>
                </div>

                {/* Centre Information */}
                <div className={`lg:col-span-7 space-y-5 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="space-y-1.5">
                    <div className="font-mono text-xs text-[#B8F000] uppercase tracking-wider">
                      0{idx + 1} // {centre.district || "Kochi"}
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white group-hover:text-[#B8F000] transition-colors">
                      {centre.name}
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-[#A8B0BA] leading-relaxed">
                    {centre.intro?.description || centre.description || ""}
                  </p>

                  {/* Address & Timings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-y border-[#1F2937] py-4">
                    <div className="space-y-1">
                      <div className="font-mono text-[10px] text-[#A8B0BA] uppercase">LOCATION</div>
                      <div className="text-white font-medium">{centre.address}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="font-mono text-[10px] text-[#A8B0BA] uppercase">SURFACE</div>
                      <div className="text-white font-medium flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#B8F000]" />
                        <span>{centre.courtInformation?.surfaceType || "BWF Standard Wooden Subfloor"}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href={`/${centre.slug}`}
                      className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider transition-all"
                    >
                      <span>EXPLORE {(centre.shortName || centre.name).toUpperCase()} CENTRE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <a
                      href={centre.googleMapsUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3.5 bg-[#11161D] hover:bg-[#17212C] text-white font-bold text-xs uppercase tracking-wider border border-[#1F2937] transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#B8F000]" />
                      <span>DIRECTIONS</span>
                    </a>

                    <a
                      href={buildWhatsAppUrl({ locationSlug: centre.slug, locationName: centre.name })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-3.5 bg-[#11161D] hover:bg-[#17212C] text-white font-bold text-xs uppercase tracking-wider border border-[#1F2937] transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>WHATSAPP</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Centre Court Visuals Gallery */}
      <CentreGallerySection
        eyebrow="NETWORK INFRASTRUCTURE // KOCHI CENTRES"
        title="CENTRES & COURTS PHOTO GALLERY"
        description="Take an interactive tour through our BWF Grade-1 certified badminton courts across Kadavanthra, Kumbalanghi, Maradu, Palluruthy, and Chullikal."
      />

      <FinalCTA initialCount={centres.length} />
    </div>
  );
}
