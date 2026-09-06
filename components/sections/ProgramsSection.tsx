"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle, Check, Users, Clock, Target } from "lucide-react";
import { PROGRAMS, Program } from "@/data/programs";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

// Map each program index to an authentic sports visual asset
const PROGRAM_IMAGES: Record<string, string> = {
  "kids-badminton-coaching": "/images/training-coach.jpg",
  "junior-badminton-coaching": "/images/badminton-junior.jpg",
  "adult-badminton-coaching": "/images/badminton-arena.jpg",
  "advanced-competitive-training": "/images/hero-athlete.jpg",
  "summer-weekend-badminton-camp": "/images/badminton-arena.jpg",
};

export function ProgramsSection() {
  const [activeSlug, setActiveSlug] = useState<string>(PROGRAMS[0].slug);

  const selectedProgram: Program =
    PROGRAMS.find((p) => p.slug === activeSlug) || PROGRAMS[0];

  const handleProgramWhatsApp = (name: string) => {
    trackEvent("program_enquiry", { program: name, source: "rebel_programs" });
  };

  return (
    <section 
      className="py-24 lg:py-36 bg-[#07090D] relative border-b border-[#1F2937] select-none"
      aria-label="Academy Programs Experience"
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 sm:pb-16 border-b border-[#1F2937]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
                03 // PATHWAYS
              </span>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
                ATHLETIC CURRICULUM
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.03em] uppercase leading-[0.95]">
              TRAIN FOR YOUR <br />
              <span className="text-[#B8F000]">SPECIFIC GOAL.</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#B8F000] hover:text-white uppercase transition-colors"
            >
              <span>VIEW ALL 5 TRACKS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Desktop Editorial Interactive Experience (Hidden on Mobile) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-10 items-stretch pt-12">
          
          {/* Left Column: Interactive Program Selector */}
          <div className="lg:col-span-5 flex flex-col divide-y divide-[#1F2937] border-y border-[#1F2937]">
            {PROGRAMS.map((program, idx) => {
              const isActive = program.slug === selectedProgram.slug;
              const numStr = `0${idx + 1}`;
              return (
                <button
                  key={program.slug}
                  type="button"
                  onMouseEnter={() => setActiveSlug(program.slug)}
                  onFocus={() => setActiveSlug(program.slug)}
                  onClick={() => setActiveSlug(program.slug)}
                  className={`py-6 px-4 text-left transition-all duration-200 flex items-center justify-between group ${
                    isActive
                      ? "bg-[#11161D] border-l-4 border-l-[#B8F000] pl-6"
                      : "hover:bg-[#0B0F14] hover:pl-6"
                  }`}
                  aria-selected={isActive}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-xs font-black transition-colors ${
                        isActive ? "text-[#B8F000]" : "text-[#A8B0BA]/40 group-hover:text-white"
                      }`}>
                        {numStr}
                      </span>
                      <span className="text-[10px] font-mono tracking-wider text-[#A8B0BA] uppercase">
                        {program.skillLevel}
                      </span>
                    </div>

                    <h3 className={`text-xl font-black uppercase tracking-tight transition-colors ${
                      isActive ? "text-white" : "text-[#A8B0BA] group-hover:text-white"
                    }`}>
                      {program.shortName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-mono font-bold uppercase transition-opacity ${
                      isActive ? "opacity-100 text-[#B8F000]" : "opacity-0 group-hover:opacity-100 text-[#A8B0BA]"
                    }`}>
                      SELECT
                    </span>
                    <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${
                      isActive ? "text-[#B8F000] translate-x-1" : "text-[#1F2937] group-hover:text-white"
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Dynamic Editorial Preview Panel */}
          <div className="lg:col-span-7 bg-[#0B0F14] border border-[#1F2937] p-8 lg:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Top Photo Strip */}
              <div className="relative aspect-[16/9] overflow-hidden bg-[#07090D] border border-[#1F2937]">
                <Image
                  src={PROGRAM_IMAGES[selectedProgram.slug] || "/images/training-coach.jpg"}
                  alt={selectedProgram.name}
                  fill
                  className="object-cover object-center filter contrast-110"
                  sizes="(max-width: 1280px) 50vw, 600px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#07090D]/90 border border-[#1F2937] font-mono text-[10px] font-bold text-[#B8F000] uppercase tracking-wider">
                  {selectedProgram.badge}
                </div>
              </div>

              {/* Title & Objective */}
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  {selectedProgram.name}
                </h3>
                <p className="text-sm text-[#A8B0BA] leading-relaxed">
                  {selectedProgram.fullDescription}
                </p>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-3 gap-3 border-y border-[#1F2937] py-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#A8B0BA] uppercase">
                    <Target className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span>LEVEL</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1 uppercase">
                    {selectedProgram.skillLevel}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#A8B0BA] uppercase">
                    <Clock className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span>TIMING</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1 uppercase">
                    {selectedProgram.duration}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#A8B0BA] uppercase">
                    <Users className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span>COACH RATIO</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1 uppercase">
                    {selectedProgram.batchRatio}
                  </div>
                </div>
              </div>

              {/* Core Outcomes */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold text-[#A8B0BA] uppercase tracking-wider">
                  TACTICAL OUTCOMES:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#A8B0BA]">
                  {selectedProgram.benefits.slice(0, 4).map((b, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B8F000] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Action Bar */}
            <div className="pt-6 mt-6 border-t border-[#1F2937] flex items-center gap-4">
              <Link
                href={`/programs/${selectedProgram.slug}`}
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider transition-all"
              >
                <span>EXPLORE {selectedProgram.shortName} →</span>
              </Link>

              <a
                href={buildWhatsAppUrl({ programName: selectedProgram.name })}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleProgramWhatsApp(selectedProgram.name)}
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-[#11161D] hover:bg-[#17212C] text-white font-bold text-xs uppercase tracking-wider border border-[#1F2937] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                <span>WHATSAPP ADMISSIONS</span>
              </a>
            </div>

          </div>
        </div>

        {/* Mobile Dedicated Horizontal Snap Carousel (No hover dependency, 48px touch targets) */}
        <div className="lg:hidden pt-8">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 no-scrollbar -mx-4 px-4">
            {PROGRAMS.map((program, idx) => (
              <div
                key={program.slug}
                className="snap-center shrink-0 w-[85vw] max-w-[340px] bg-[#0B0F14] border border-[#1F2937] p-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Visual Crop */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#07090D] border border-[#1F2937]">
                    <Image
                      src={PROGRAM_IMAGES[program.slug] || "/images/training-coach.jpg"}
                      alt={program.name}
                      fill
                      className="object-cover"
                      sizes="340px"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#07090D]/90 font-mono text-[9px] font-bold text-[#B8F000]">
                      0{idx + 1} // {program.badge}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#A8B0BA]">
                      {program.skillLevel}
                    </span>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                      {program.shortName}
                    </h3>
                    <p className="text-xs text-[#A8B0BA] line-clamp-2 leading-relaxed">
                      {program.fullDescription}
                    </p>
                  </div>

                  <div className="py-2 border-y border-[#1F2937] flex items-center justify-between text-[11px] font-mono text-[#A8B0BA]">
                    <span>RATIO: {program.batchRatio}</span>
                    <span>{program.duration}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 space-y-2">
                  <Link
                    href={`/programs/${program.slug}`}
                    className="w-full min-h-[48px] px-4 py-3 bg-[#B8F000] text-[#07090D] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <span>VIEW PROGRAM</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/contact"
                    className="w-full min-h-[48px] px-4 py-3 bg-[#11161D] text-white font-bold text-xs uppercase tracking-wider border border-[#1F2937] flex items-center justify-center"
                  >
                    BOOK TRIAL
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center font-mono text-[10px] text-[#A8B0BA] tracking-widest uppercase pt-1">
            ← SWIPE TO EXPLORE 5 PROGRAMS →
          </div>
        </div>

      </div>
    </section>
  );
}
