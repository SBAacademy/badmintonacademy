import React from "react";
import Link from "next/link";
import { Trophy, Medal, ArrowRight, Star } from "lucide-react";
import { ACHIEVEMENTS } from "@/data/achievements";

export function AchievementsSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#080B10] relative border-b border-[#26313D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#B8F000]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#B8F000]">
                TOURNAMENT HONORS
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight uppercase leading-tight">
              A Proven Record of Tournament Success
            </h2>
            <p className="text-[#A7B0BC] text-sm sm:text-base leading-relaxed">
              Podium medals and championship milestones won by our academy athletes across Kerala State and Ernakulam District championships.
            </p>
          </div>

          <Link
            href="/achievements"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#B8F000] hover:text-[#c7fb1e] uppercase tracking-wider group shrink-0"
          >
            <span>All Tournament Wins</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Achievements Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ACHIEVEMENTS.slice(0, 3).map((ach) => (
            <div
              key={ach.id}
              className="sports-card p-6 sm:p-7 flex flex-col justify-between group text-left"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#080B10] border border-[#26313D] text-[#B8F000] flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#6B7280]">
                    {ach.year}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B8F000] bg-[#B8F000]/10 px-2.5 py-0.5 rounded-md border border-[#B8F000]/20 mb-2">
                  <Medal className="w-3 h-3" />
                  <span>{ach.badge}</span>
                </div>

                <h3 className="text-base font-bold text-[#F8FAFC] mb-2 group-hover:text-[#B8F000] transition-colors">
                  {ach.title}
                </h3>

                <div className="text-xs font-semibold text-[#A7B0BC] mb-2">
                  Squad: <span className="text-[#F8FAFC]">{ach.athleteOrTeam}</span>
                </div>

                <p className="text-xs text-[#6B7280] leading-relaxed">
                  {ach.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-[#26313D]/60 flex items-center justify-between text-[11px] text-[#6B7280] font-medium">
                <span>{ach.category}</span>
                <span className="text-[#B8F000] flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#B8F000]" />
                  Verified Medal
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
