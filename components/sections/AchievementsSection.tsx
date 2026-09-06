import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ACHIEVEMENTS } from "@/data/achievements";

export function AchievementsSection() {
  return (
    <section 
      className="py-24 lg:py-36 bg-[#0B0F14] relative border-b border-[#1F2937] select-none"
      aria-label="Tournament Achievements Archive"
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Eyebrow & Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 sm:pb-16 border-b border-[#1F2937]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
                07 // ARCHIVE
              </span>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
                PODIUM TRACK RECORD
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.03em] uppercase leading-[0.95]">
              BUILT THROUGH <br />
              <span className="text-[#B8F000]">COMPETITION.</span>
            </h2>
          </div>

          <p className="text-sm sm:text-base text-[#A8B0BA] max-w-md font-normal leading-relaxed">
            Medals are won in training halls long before the final point. Our athletes consistently demonstrate tactical discipline across official ranking tournaments.
          </p>
        </div>

        {/* Editorial Timeline Archive List */}
        <div className="divide-y divide-[#1F2937] border-b border-[#1F2937] pt-8">
          {ACHIEVEMENTS.slice(0, 4).map((ach) => (
            <div
              key={ach.id}
              className="py-8 lg:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline group hover:bg-[#11161D]/60 px-4 sm:px-6 transition-colors"
            >
              {/* Year Column */}
              <div className="md:col-span-2">
                <span className="font-mono text-3xl sm:text-4xl font-black text-white/30 group-hover:text-[#B8F000] transition-colors">
                  {ach.year}
                </span>
                <div className="font-mono text-[10px] text-[#B8F000] tracking-widest uppercase mt-1">
                  {ach.category}
                </div>
              </div>

              {/* Title & Description */}
              <div className="md:col-span-7 space-y-2 text-left">
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight group-hover:text-white">
                  {ach.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#A8B0BA] leading-relaxed">
                  {ach.description}
                </p>
                <div className="font-mono text-[11px] text-[#A8B0BA] pt-1">
                  SQUAD / ATHLETES: <span className="text-white font-bold">{ach.athleteOrTeam}</span>
                </div>
              </div>

              {/* Badge & Result */}
              <div className="md:col-span-3 flex md:justify-end items-center">
                <div className="px-3.5 py-1.5 bg-[#07090D] border border-[#1F2937] group-hover:border-[#B8F000]/60 transition-colors">
                  <span className="font-mono text-xs font-bold text-[#B8F000] uppercase tracking-wider">
                    {ach.badge}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Link to Full Archive */}
        <div className="pt-12 flex items-center justify-between">
          <span className="font-mono text-xs text-[#A8B0BA] uppercase tracking-wider">
            OFFICIAL KERALA STATE &amp; DISTRICT ARCHIVE
          </span>
          <Link
            href="/achievements"
            className="inline-flex items-center gap-3 text-xs font-black tracking-widest text-[#B8F000] hover:text-white uppercase transition-colors"
          >
            <span>VIEW COMPLETE PODIUM ARCHIVE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
