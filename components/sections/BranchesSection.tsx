"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, ArrowRight, MessageCircle, Navigation, ShieldCheck } from "lucide-react";
import { BRANCHES } from "@/data/branches";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export function BranchesSection() {
  const handleWhatsAppBranch = (branchName: string) => {
    trackEvent("whatsapp_click", { branch: branchName, source: "branches_section" });
  };

  const handleDirections = (branchName: string) => {
    trackEvent("map_directions_click", { branch: branchName, source: "branches_section" });
  };

  return (
    <section className="py-20 lg:py-28 bg-[#080B10] relative border-b border-[#26313D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="w-5 h-0.5 bg-[#B8F000]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8F000]">
              TRAINING LOCATIONS
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight uppercase leading-tight">
            Three Premier Training Hubs Across Kochi
          </h2>
          <p className="text-[#A7B0BC] text-sm sm:text-base leading-relaxed">
            Train at your nearest dedicated facility equipped with BWF-standard synthetic court mats on shock-absorbing wooden subfloors.
          </p>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {BRANCHES.map((branch) => (
            <div
              key={branch.slug}
              className="sports-card overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Branch Hero Image & Badge */}
                <div className="relative aspect-[16/10] w-full bg-[#080B10] overflow-hidden">
                  <Image
                    src={branch.image}
                    alt={`${branch.name} badminton courts Kochi`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121A23] via-transparent to-transparent opacity-90" />

                  {/* Court Count Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-[#080B10]/85 backdrop-blur-md border border-[#26313D] text-[#F8FAFC] text-xs font-extrabold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#B8F000]" />
                    <span>{branch.courtsCount} BWF Courts</span>
                  </div>

                  {branch.isHeadquarters && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-[#B8F000] text-[#07100A] text-[10px] font-extrabold uppercase tracking-wider">
                      Academy HQ
                    </div>
                  )}

                  <div className="absolute bottom-3 left-4 right-4 text-left">
                    <h3 className="text-xl font-bold text-[#F8FAFC] group-hover:text-[#B8F000] transition-colors">
                      {branch.shortName}
                    </h3>
                    <p className="text-xs text-[#A7B0BC] truncate mt-0.5">
                      {branch.landmark}
                    </p>
                  </div>
                </div>

                {/* Branch Details */}
                <div className="p-6 space-y-4 text-left">
                  {/* Address */}
                  <div className="flex items-start gap-2 text-xs text-[#A7B0BC]">
                    <MapPin className="w-4 h-4 text-[#B8F000] shrink-0 mt-0.5" />
                    <span>{branch.address}</span>
                  </div>

                  {/* Timings */}
                  <div className="flex items-start gap-2 text-xs text-[#A7B0BC]">
                    <Clock className="w-4 h-4 text-[#B8F000] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[#F8FAFC] font-semibold">{branch.timings.days}</div>
                      <div className="text-[11px] text-[#6B7280]">
                        {branch.timings.morning} | {branch.timings.evening}
                      </div>
                    </div>
                  </div>

                  {/* Flooring */}
                  <div className="flex items-start gap-2 text-xs text-[#6B7280]">
                    <ShieldCheck className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <span className="text-[11px] text-[#A7B0BC] leading-tight">
                      {branch.courtType}
                    </span>
                  </div>

                  {/* Facilities Pills */}
                  <div className="pt-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
                      Key Facilities:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {branch.facilities.slice(0, 4).map((fac, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-[#080B10] border border-[#26313D] text-[#A7B0BC] font-medium"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Buttons Footer */}
              <div className="p-6 pt-0 space-y-2.5">
                <Link
                  href={`/branches/${branch.slug}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#080B10] hover:bg-[#17212C] text-[#F8FAFC] text-xs font-bold flex items-center justify-center gap-1.5 border border-[#26313D] hover:border-[#374758] transition-colors"
                >
                  <span>Explore {branch.shortName} & Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B8F000]" />
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={buildWhatsAppUrl({ branchName: branch.name })}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleWhatsAppBranch(branch.name)}
                    className="py-2 px-3 rounded-lg bg-[#121A23] hover:bg-[#17212C] border border-[#26313D] text-[#F8FAFC] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={branch.googleMapDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleDirections(branch.name)}
                    className="py-2 px-3 rounded-lg bg-[#080B10] hover:bg-[#17212C] border border-[#26313D] text-[#A7B0BC] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span>Map Route</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
