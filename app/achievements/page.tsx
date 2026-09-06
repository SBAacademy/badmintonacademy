import React from "react";
import type { Metadata } from "next";
import { Trophy, Medal, Award, Star, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { ACHIEVEMENTS } from "@/data/achievements";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = createMetadata({
  title: "Tournament Achievements & State Medals | S & A Badminton Academy",
  description: "Explore the tournament victories, state and district championship medals won by athletes of S & A Badminton Academy Kochi.",
  path: "/achievements",
  keywords: [
    "badminton achievements Kochi",
    "Kerala state badminton medals",
    "badminton tournament champions Ernakulam",
    "junior badminton ranking winners",
  ],
});

export default function AchievementsPage() {
  return (
    <div className="py-8 sm:py-12 bg-[#090D16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ name: "Achievements & Medals", url: "/achievements" }]} />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            Tournament Hall of Fame
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Championship Honors & Player Progression Milestones
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Every medal represents hundreds of hours of 6-corner footwork, kinetic chain conditioning, and mental resilience cultivated across our Kochi training courts.
          </p>
        </div>

        {/* Achievements Timeline & Cards */}
        <div className="space-y-6 mb-20 max-w-4xl mx-auto">
          {ACHIEVEMENTS.map((ach) => (
            <div
              key={ach.id}
              className="p-6 sm:p-8 rounded-3xl bg-[#111827] border border-slate-800 hover:border-amber-500/40 transition-all duration-300 shadow-xl flex flex-col sm:flex-row items-start gap-6 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Trophy className="w-7 h-7" />
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Medal className="w-3.5 h-3.5" />
                    <span>{ach.badge}</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    Season {ach.year}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                  {ach.title}
                </h2>

                <div className="text-xs font-semibold text-emerald-400">
                  Athlete / Squad: <span className="text-slate-200">{ach.athleteOrTeam}</span>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-1">
                  {ach.description}
                </p>

                <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Category: {ach.category}</span>
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
