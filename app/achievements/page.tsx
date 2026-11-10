import React from "react";
import Image from "next/image";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = createMetadata({
  title: "Tournament Achievements & State Medals | SBA Badminton Academy",
  description: "Explore the tournament victories, state and district championship medals won by athletes of SBA Badminton Academy Kochi.",
  path: "/achievements",
  keywords: [
    "badminton achievements Kochi",
    "Kerala state badminton medals",
    "badminton tournament champions Ernakulam",
    "junior badminton ranking winners",
  ],
});

import { getAchievements } from "@/lib/contentDb";

export default async function AchievementsPage() {
  const achievements = await getAchievements();

  return (
    <div className="bg-[#07090D] min-h-screen text-white select-none">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ name: "Tournament Archive", url: "/achievements" }]} />

        {/* Rebel Hero */}
        <div className="pt-8 pb-16 border-b border-[#1F2937] space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
              ARCHIVE // MEDALS
            </span>
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
              PODIUM TRACK RECORD
            </span>
          </div>

          <h1 className="text-[clamp(2.8rem,7vw,6rem)] font-black uppercase tracking-[-0.04em] leading-[0.92]">
            BUILT THROUGH <br />
            <span className="text-[#B8F000]">COMPETITION.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#A8B0BA] max-w-2xl font-normal leading-relaxed">
            Every title represents thousands of repetitions on court. Below is our verified record of state, district, and regional tournament milestones.
          </p>
        </div>

        {/* Timeline Archive */}
        <div className="divide-y divide-[#1F2937] border-b border-[#1F2937] py-8">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline group hover:bg-[#0B0F14]/60 px-4 sm:px-6 transition-colors"
            >
              {/* Year Column */}
              <div className="md:col-span-2 space-y-1 text-left">
                <span className="font-mono text-4xl sm:text-5xl font-black text-white/30 group-hover:text-[#B8F000] transition-colors">
                  {ach.year}
                </span>
                <div className="font-mono text-[10px] text-[#B8F000] tracking-widest uppercase">
                  {ach.category}
                </div>
              </div>

              {/* Title & Description */}
              <div className="md:col-span-7 space-y-2 text-left">
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight group-hover:text-white">
                  {ach.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#A8B0BA] leading-relaxed">
                  {ach.description}
                </p>
                <div className="font-mono text-xs text-[#A8B0BA] pt-2">
                  ATHLETE / SQUAD: <span className="text-white font-bold">{ach.athleteOrTeam}</span>
                </div>
              </div>

              {/* Result Badge & Photo */}
              <div className="md:col-span-3 flex flex-col md:items-end justify-center gap-2">
                {ach.image && (
                  <div className="relative w-full md:w-36 h-20 bg-[#07090D] border border-[#1F2937] overflow-hidden">
                    <Image
                      src={ach.image}
                      alt={ach.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="px-4 py-2 bg-[#11161D] border border-[#1F2937] group-hover:border-[#B8F000]/60 transition-colors">
                  <span className="font-mono text-xs font-bold text-[#B8F000] uppercase tracking-wider">
                    {ach.badge}
                  </span>
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
