import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const STAGES = [
  {
    num: "01",
    phase: "ASSESS",
    headline: "Kinetic & Mechanics Diagnostic",
    body: "Every athlete undergoes a 45-minute baseline evaluation: reaction speed, grip dynamics, split-step timing, and kinetic movement patterns.",
    metric: "BASELINE EVALUATION",
  },
  {
    num: "02",
    phase: "TRAIN",
    headline: "Stroke Biomechanics & 6-Corner Agility",
    body: "Intensive stroke drills under coach supervision. We build efficient shoulder rotation, precise net drops, and explosive lateral footwork recoveries.",
    metric: "FOUNDATION MASTERY",
  },
  {
    num: "03",
    phase: "DEVELOP",
    headline: "Multi-Shuttle Cadence & Match Tempo",
    body: "High-volume feeder drills pushing anaerobic stamina to tournament speed. Video analysis breakdowns target micro-inefficiencies in movement.",
    metric: "ANAEROBIC CONDITIONING",
  },
  {
    num: "04",
    phase: "COMPETE",
    headline: "High-Pressure Match Play & Rankings",
    body: "Players test tactical composure through deuce-point pressure simulations, internal ladder tournaments, and official BWF-circuit events.",
    metric: "TOURNAMENT READINESS",
  },
];

export function MethodologySection() {
  return (
    <section 
      className="py-24 lg:py-36 bg-[#0B0F14] relative border-b border-[#1F2937] select-none"
      aria-label="Coaching Methodology Sequence"
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Eyebrow & Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 sm:pb-16 border-b border-[#1F2937]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
                04 // METHOD
              </span>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
                DEVELOPMENT PIPELINE
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.03em] uppercase leading-[0.95]">
              HOW WE BUILD <br />
              <span className="text-[#B8F000]">BETTER PLAYERS.</span>
            </h2>
          </div>

          <p className="text-sm sm:text-base text-[#A8B0BA] max-w-md font-normal leading-relaxed">
            Progress is not accidental. It is engineered through a proven 4-stage athletic progression from initial diagnostic to competitive match play.
          </p>
        </div>

        {/* Desktop Horizontal Stepped Sequence */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-0 border-b border-[#1F2937] divide-x divide-[#1F2937] pt-8">
          {STAGES.map((stage, idx) => (
            <div
              key={stage.num}
              className="py-12 px-8 flex flex-col justify-between group hover:bg-[#11161D] transition-colors relative"
            >
              {/* Connector Step Line */}
              <div className="w-full h-0.5 bg-[#1F2937] mb-8 relative">
                <div className="absolute top-0 left-0 w-8 h-0.5 bg-[#B8F000] group-hover:w-full transition-all duration-300" />
                <div className="absolute -top-1.5 left-0 w-3.5 h-3.5 bg-[#07090D] border-2 border-[#B8F000]" />
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-4xl font-black text-white/30 group-hover:text-[#B8F000] transition-colors">
                    {stage.num}
                  </span>
                  <span className="font-mono text-xs font-black tracking-widest text-[#B8F000] uppercase">
                    STAGE {stage.num}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-white">
                  {stage.phase}
                </h3>

                <div className="text-xs font-bold text-[#A8B0BA] uppercase">
                  {stage.headline}
                </div>

                <p className="text-xs text-[#A8B0BA] leading-relaxed pt-2">
                  {stage.body}
                </p>
              </div>

              <div className="pt-8 mt-8 border-t border-[#1F2937]/50 font-mono text-[10px] text-[#A8B0BA] tracking-wider uppercase">
                {stage.metric}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Vertical Progression (Left-side lime connector line) */}
        <div className="lg:hidden pt-8 space-y-8 relative pl-6 border-l-2 border-[#1F2937]">
          {STAGES.map((stage) => (
            <div key={stage.num} className="relative space-y-2">
              {/* Node Indicator on the Left Line */}
              <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 bg-[#07090D] border-2 border-[#B8F000]" />

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-[#B8F000]">
                  {stage.num} //
                </span>
                <span className="font-black text-lg text-white uppercase tracking-tight">
                  {stage.phase}: {stage.headline}
                </span>
              </div>

              <p className="text-xs text-[#A8B0BA] leading-relaxed">
                {stage.body}
              </p>

              <div className="font-mono text-[10px] text-[#B8F000] uppercase tracking-wider pt-1">
                KEY OUTCOME: {stage.metric}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Editorial Direct Link */}
        <div className="pt-12 sm:pt-16 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="font-mono text-xs text-[#A8B0BA] uppercase tracking-wider">
            READY TO BENCHMARK YOUR CURRENT GAME?
          </span>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 text-xs font-black tracking-widest text-[#B8F000] hover:text-white uppercase transition-colors"
          >
            <span>SCHEDULE 45-MIN ASSESSMENT SESSION</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
