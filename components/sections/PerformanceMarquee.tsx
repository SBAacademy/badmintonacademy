import React from "react";

const BAND_1_ITEMS = [
  "BADMINTON",
  "SPEED",
  "DISCIPLINE",
  "PRECISION",
  "POWER",
  "AGILITY",
  "KOCHI",
];

const BAND_2_ITEMS = [
  "KIDS",
  "JUNIORS",
  "ADULTS",
  "COMPETITIVE",
  "WEEKEND CAMPS",
  "SUMMER CAMPS",
  "HIGH PERFORMANCE",
];

export function PerformanceMarquee() {
  return (
    <section 
      className="relative overflow-hidden bg-[#07090D] border-b border-[#1F2937] py-4 select-none"
      aria-label="Academy performance attributes"
    >
      {/* Subtle structural edge lines */}
      <div className="absolute inset-0 pointer-events-none border-y border-[#1F2937]/50" />

      {/* Band 1 — Left Marquee: Athletic Core Attributes */}
      <div className="flex overflow-hidden py-1 whitespace-nowrap">
        <div className="flex animate-marquee-left items-center gap-8 shrink-0 text-white">
          {[...BAND_1_ITEMS, ...BAND_1_ITEMS, ...BAND_1_ITEMS, ...BAND_1_ITEMS].map((item, index) => (
            <span key={index} className="flex items-center gap-8">
              <span className="font-mono text-xs sm:text-sm font-black tracking-[0.25em] uppercase text-white/90">
                {item}
              </span>
              <span className="text-[#B8F000] font-black text-xs opacity-70 tracking-widest">
                ///
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Band 2 — Right Marquee: Academy Tracks */}
      <div className="flex overflow-hidden py-1 whitespace-nowrap">
        <div className="flex animate-marquee-right items-center gap-8 shrink-0 text-[#A8B0BA]">
          {[...BAND_2_ITEMS, ...BAND_2_ITEMS, ...BAND_2_ITEMS, ...BAND_2_ITEMS].map((item, index) => (
            <span key={index} className="flex items-center gap-8">
              <span className="font-mono text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#A8B0BA] hover:text-[#B8F000] transition-colors">
                {item}
              </span>
              <span className="w-1.5 h-1.5 bg-[#B8F000]/60 rounded-none shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
