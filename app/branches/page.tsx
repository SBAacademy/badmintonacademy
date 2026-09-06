import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, ShieldCheck, ArrowRight, MessageCircle, Navigation, Award } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { BRANCHES } from "@/data/branches";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = createMetadata({
  title: "Badminton Academy Branches in Kochi | Kadavanthra, Edappally, Kakkanad",
  description: "Find S & A Badminton Academy near you in Kochi. 3 international-standard training centers across Kadavanthra, Edappally, and Kakkanad with 14 synthetic courts on sprung teakwood.",
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
  return (
    <div className="py-8 sm:py-12 bg-[#090D16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ name: "Training Branches", url: "/branches" }]} />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Our Kochi Locations
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            3 Premier Training Centers Across Kochi
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Strategically located across Central, North, and East Kochi so students and working professionals can access BWF-standard coaching without commuting across the city.
          </p>
        </div>

        {/* Detailed Branch Cards */}
        <div className="space-y-12 mb-20">
          {BRANCHES.map((branch, idx) => (
            <div
              key={branch.slug}
              className="rounded-3xl bg-[#111827] border border-slate-800 hover:border-emerald-500/40 p-6 sm:p-8 lg:p-10 transition-all duration-300 shadow-xl overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Media Column */}
                <div className={`lg:col-span-5 relative ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[4/3] border border-slate-700 shadow-lg">
                    <Image
                      src={branch.image}
                      alt={`${branch.name} badminton courts Kochi`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-transparent opacity-80" />

                    <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-[#090D16]/85 backdrop-blur-md border border-slate-700 text-white text-xs font-extrabold">
                      {branch.courtsCount} BWF Courts
                    </div>

                    {branch.isHeadquarters && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-emerald-500 text-[#090D16] text-[10px] font-black uppercase tracking-wider">
                        Academy HQ
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#090D16]/85 backdrop-blur-md border border-slate-800">
                      <div className="text-xs font-bold text-white">{branch.tagline}</div>
                    </div>
                  </div>
                </div>

                {/* Details Column */}
                <div className={`lg:col-span-7 space-y-5 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      {branch.cityArea}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                      {branch.name}
                    </h2>
                  </div>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {branch.description}
                  </p>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white">Full Address</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{branch.address}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                      <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white">{branch.timings.days}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {branch.timings.morning} | {branch.timings.evening}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amenities List */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Arena Infrastructure:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {branch.facilities.slice(0, 5).map((fac, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800">
                    <Link
                      href={`/branches/${branch.slug}`}
                      className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#090D16] text-xs font-bold flex items-center gap-2 transition-colors shadow-md shadow-emerald-500/20"
                    >
                      <span>Explore Branch & Schedule</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <a
                      href={buildWhatsAppUrl({ branchName: branch.name })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Desk</span>
                    </a>

                    <a
                      href={branch.googleMapDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition-colors"
                    >
                      <Navigation className="w-4 h-4 text-cyan-400" />
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
