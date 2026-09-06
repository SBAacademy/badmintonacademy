import React from "react";
import { Search, Dumbbell, Zap, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    step: "01",
    name: "Assess",
    title: "Diagnostic Baseline Assessment",
    description: "Every athlete begins with a 45-minute evaluation analyzing hand-eye reaction, grip mechanics, split-step timing, and athletic stamina.",
    icon: Search,
  },
  {
    step: "02",
    name: "Train",
    title: "Biomechanics & 6-Corner Footwork",
    description: "Systematic stroke drilling under coach supervision. We refine kinetic shoulder rotation, drop shot touch, and effortless court recovery.",
    icon: Dumbbell,
  },
  {
    step: "03",
    name: "Develop",
    title: "Multi-Shuttle Cadence & Video Review",
    description: "High-cadence rapid shuttle feeds building anaerobic capacity. Video analysis sessions reveal micro-inefficiencies in body rotation.",
    icon: Zap,
  },
  {
    step: "04",
    name: "Compete",
    title: "Match Play & Tournament Readiness",
    description: "Athletes test skills in internal ranking ladders, pressure deuce simulations, and official District, State, and ranking tournaments.",
    icon: Trophy,
  }
];

export function MethodologySection() {
  return (
    <section className="py-20 lg:py-28 bg-[#080B10] relative border-b border-[#26313D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="w-5 h-0.5 bg-[#B8F000]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8F000]">
              COACHING METHODOLOGY
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight uppercase leading-tight">
            The 4-Stage Player Progression Pathway
          </h2>
          <p className="text-[#A7B0BC] text-sm sm:text-base leading-relaxed">
            A structured coaching progression that transforms raw enthusiasm into technical mastery, court discipline, and competitive composure.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="sports-card p-7 flex flex-col justify-between group text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-2xl font-black text-[#26313D] group-hover:text-[#B8F000] transition-colors">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#080B10] border border-[#26313D] flex items-center justify-center text-[#B8F000]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="text-xs font-bold uppercase tracking-wider mb-1 text-[#B8F000]">
                    Phase {item.step}: {item.name}
                  </div>

                  <h3 className="text-base font-bold text-[#F8FAFC] mb-2 group-hover:text-[#B8F000] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#26313D]/60 flex items-center text-[11px] font-semibold text-[#A7B0BC]">
                  <span>Milestone Evaluation</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#B8F000] hover:text-[#c7fb1e] uppercase tracking-wider"
          >
            <span>Book an initial skills assessment session</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
