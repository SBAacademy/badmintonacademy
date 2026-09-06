import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, ShieldCheck, ArrowRight, MessageCircle, Navigation } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { LOCATIONS } from "@/data/locations";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = createMetadata({
  title: "Badminton Academy Centres in Kochi | Kadavanthra, Edappally, Kakkanad",
  description: "Explore all S & A Badminton Academy training centres across Kochi. Dedicated multi-court facilities in Kadavanthra, Edappally, Kakkanad, and expanding locations.",
  path: "/branches",
  keywords: [
    "badminton academy near me",
    "badminton academy in Kadavanthra",
    "badminton coaching Edappally",
    "badminton academy Kakkanad",
    "badminton courts Kochi",
  ],
});

export default function BranchesPage() {
  const centres = Object.values(LOCATIONS);

  return (
    <div className="py-8 sm:py-12 bg-[#080B10] text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ name: "Our Centres", url: "/branches" }]} />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8F000]/10 border border-[#B8F000]/30 text-[#B8F000] text-xs font-bold uppercase tracking-wider">
            Centre Directory
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight uppercase leading-tight">
            Four Dedicated Badminton Arenas Across Kochi
          </h1>
          <p className="text-[#A7B0BC] text-sm sm:text-base leading-relaxed">
            Strategically positioned across Central, North, and East Kochi so students, junior athletes, and working professionals can access international-grade coaching without extensive city transit.
          </p>
        </div>

        {/* Detailed Centre Cards */}
        <div className="space-y-12 mb-20">
          {centres.map((centre, idx) => (
            <div
              key={centre.slug}
              className="rounded-3xl bg-[#121A23] border border-[#26313D] hover:border-[#374758] p-6 sm:p-8 lg:p-10 transition-all duration-300 shadow-xl overflow-hidden text-left"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Media Column */}
                <div className={`lg:col-span-5 relative ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[4/3] border border-[#26313D] shadow-lg">
                    <Image
                      src={centre.gallery[0]?.url || "/images/hero-athlete.jpg"}
                      alt={`${centre.name} badminton courts Kochi`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-transparent to-transparent opacity-85" />

                    <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-[#080B10]/90 backdrop-blur-md border border-[#26313D] text-[#F8FAFC] text-xs font-extrabold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#B8F000]" />
                      <span>{centre.courtInformation.courtCount ? `${centre.courtInformation.courtCount} Courts` : "Upcoming Arena"}</span>
                    </div>

                    {centre.slug === "kadavanthra" && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-[#B8F000] text-[#07100A] text-[10px] font-black uppercase tracking-wider">
                        Academy HQ
                      </div>
                    )}

                    {centre.isPlaceholder && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-[#22D3EE] text-[#07100A] text-[10px] font-black uppercase tracking-wider">
                        Coming Soon
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#080B10]/90 backdrop-blur-md border border-[#26313D]">
                      <div className="text-xs font-bold text-[#F8FAFC]">{centre.intro.subheading}</div>
                    </div>
                  </div>
                </div>

                {/* Details Column */}
                <div className={`lg:col-span-7 space-y-5 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div>
                    <span className="text-xs font-bold text-[#B8F000] uppercase tracking-wider">
                      {centre.city} • {centre.district}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight uppercase mt-1">
                      {centre.name}
                    </h2>
                  </div>

                  <p className="text-[#A7B0BC] text-sm sm:text-base leading-relaxed font-normal">
                    {centre.intro.description}
                  </p>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-[#080B10] border border-[#26313D]">
                      <MapPin className="w-4 h-4 text-[#B8F000] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#F8FAFC]">Physical Address</div>
                        <div className="text-[#A7B0BC] text-[11px] mt-0.5 leading-relaxed">{centre.address}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-xl bg-[#080B10] border border-[#26313D]">
                      <Clock className="w-4 h-4 text-[#B8F000] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#F8FAFC]">{centre.openingHours.days}</div>
                        <div className="text-[#A7B0BC] text-[11px] mt-0.5">
                          Morning: {centre.openingHours.morning} | Evening: {centre.openingHours.evening}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities List */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                      Arena Facilities:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {centre.facilities.slice(0, 5).map((fac, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-[#080B10] border border-[#26313D] text-[#A7B0BC] font-medium"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#26313D]">
                    <Link
                      href={`/${centre.slug}`}
                      className="px-6 py-3.5 rounded-xl bg-[#B8F000] hover:bg-[#c7fb1e] text-[#07100A] text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
                    >
                      <span>Explore {centre.shortName} Centre</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <a
                      href={buildWhatsAppUrl({ locationSlug: centre.slug, locationName: centre.name })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3.5 rounded-xl bg-[#121A23] hover:bg-[#17212C] border border-[#26313D] text-[#F8FAFC] text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                      <span>WhatsApp Desk</span>
                    </a>

                    <a
                      href={centre.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3.5 rounded-xl bg-[#080B10] hover:bg-[#17212C] text-[#A7B0BC] text-xs font-semibold flex items-center gap-1.5 border border-[#26313D] transition-colors"
                    >
                      <Navigation className="w-4 h-4 text-[#B8F000]" />
                      <span>Google Maps</span>
                    </a>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      <FinalCTA />
    </div>
  );
}
