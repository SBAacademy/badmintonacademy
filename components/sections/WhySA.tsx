import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const MANIFESTO_POINTS = [
  {
    num: "01",
    tagline: "DISCIPLINE OVER MOTIVATION.",
    subtitle: "Motivation is temporary. Daily habits build champions.",
    body: "We do not rely on occasional enthusiasm. We build rigorous, structured athletic routines where players show up, drill fundamentals, and develop mental stamina court by court.",
  },
  {
    num: "02",
    tagline: "TECHNIQUE OVER SHORTCUTS.",
    subtitle: "Power without precision is wasted kinetic force.",
    body: "Every stroke is broken down to racquet grip dynamics, hip rotation, kinetic energy transfer, and clean footwork recoveries. Speed without correct mechanics causes injuries; correct mechanics produce effortless speed.",
  },
  {
    num: "03",
    tagline: "CONSISTENCY OVER EXCUSES.",
    subtitle: "Show up. Put in the hours. Master the game.",
    body: "Whether starting at age 6 in foundation batches or competing on state-level ranking circuits, progress is measured in thousands of repetitions, high-pressure drills, and honest match reviews.",
  },
];

export function WhySA() {
  return (
    <section 
      className="py-24 lg:py-36 bg-[#07090D] relative border-b border-[#1F2937] overflow-hidden select-none"
      aria-label="Academy Philosophy and Manifesto"
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Eyebrow & Category Index */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 sm:pb-16 border-b border-[#1F2937]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
                02 // MANIFESTO
              </span>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
                THE REBEL PHILOSOPHY
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.03em] uppercase leading-[0.95]">
              HOW CHAMPIONS <br />
              <span className="text-[#B8F000]">ARE FORGED.</span>
            </h2>
          </div>

          <div className="max-w-md text-left">
            <p className="text-sm sm:text-base text-[#A8B0BA] leading-relaxed font-normal">
              Most academies teach badminton like a hobby. We treat it as a disciplined athletic discipline. No gimmicks, no easy shortcuts — just elite fundamentals practiced with unyielding focus.
            </p>
          </div>
        </div>

        {/* 3 Staggered Manifesto Columns with Thin Lime Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#1F2937] border-b border-[#1F2937]">
          {MANIFESTO_POINTS.map((item) => (
            <div 
              key={item.num}
              className="py-12 lg:py-16 lg:px-10 first:pl-0 last:pr-0 flex flex-col justify-between group transition-colors hover:bg-[#0B0F14]/50"
            >
              <div className="space-y-6">
                {/* Numeric Index + Lime Vertical Rule */}
                <div className="flex items-center gap-4">
                  <span className="font-mono text-3xl sm:text-4xl font-black text-white/40 group-hover:text-[#B8F000] transition-colors">
                    {item.num}
                  </span>
                  <div className="w-12 h-0.5 bg-[#1F2937] group-hover:bg-[#B8F000] group-hover:w-16 transition-all duration-300" />
                </div>

                {/* Tagline */}
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-[#B8F000] transition-colors">
                  {item.tagline}
                </h3>

                {/* Subtitle */}
                <div className="text-xs sm:text-sm font-semibold text-[#B8F000] tracking-wide uppercase">
                  {item.subtitle}
                </div>

                {/* Body description */}
                <p className="text-xs sm:text-sm text-[#A8B0BA] leading-relaxed font-normal">
                  {item.body}
                </p>
              </div>

              <div className="pt-8 mt-8 border-t border-[#1F2937]/50 flex items-center justify-between text-[11px] font-mono text-[#A8B0BA]/60 uppercase tracking-wider">
                <span>ATHLETIC STANDARD</span>
                <span className="text-[#B8F000]">CONFIRMED</span>
              </div>
            </div>
          ))}
        </div>

        {/* Cinematic Editorial Feature: Court Infrastructure & Athlete Concentration */}
        <div className="mt-16 lg:mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-[#0B0F14] border border-[#1F2937] p-6 sm:p-10 lg:p-12">
          
          <div className="lg:col-span-6 relative aspect-[16/10] overflow-hidden bg-[#07090D] border border-[#1F2937]">
            <Image
              src="/images/training-coach.jpg"
              alt="Real S&A coach working on court stroke mechanics with athlete"
              fill
              className="object-cover object-center filter grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Cinematic dark corner mask */}
            <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.7)] pointer-events-none" />
          </div>

          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-[#B8F000]" />
              <span className="font-mono text-xs font-bold text-[#B8F000] uppercase tracking-widest">
                VERIFIED TRAINING INFRASTRUCTURE
              </span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-snug">
              BWF-GRADE SYNTHETIC MATS ON SHOCK-ABSORBING SPRUNG WOOD
            </h3>

            <p className="text-sm sm:text-base text-[#A8B0BA] leading-relaxed">
              Competitive badminton requires brutal deceleration and explosive lateral change-of-direction. To protect knees and ankles from cumulative joint stress, all academy courts across Kadavanthra, Kumbalanghi, Maradu, Palluruthy, and Chullikal utilize tournament-spec synthetic mats installed over shock-absorbing sprung wooden subfloors.
            </p>

            <div className="pt-2">
              <Link
                href="/programs"
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#11161D] hover:bg-[#17212C] text-white text-xs font-black uppercase tracking-wider border border-[#1F2937] hover:border-[#B8F000]/60 transition-colors group"
              >
                <span>EXPLORE TRAINING TRACKS</span>
                <ArrowRight className="w-4 h-4 text-[#B8F000] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
