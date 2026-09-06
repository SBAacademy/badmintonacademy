"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle, ChevronDown } from "lucide-react";
import { ACADEMY_DATA } from "@/data/academy";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export function HeroSection() {
  const handleWhatsApp = () => {
    trackEvent("whatsapp_click", { source: "hero_rebel" });
  };

  return (
    <section className="relative min-h-[90vh] lg:min-h-[95vh] flex items-center justify-center overflow-hidden bg-[#07090D] border-b border-[#1F2937]">
      {/* Full-bleed Athlete Action Photography with Vignette & Depth */}
      <div className="absolute inset-0 z-0 select-none">
        <div className="relative w-full h-full">
          <Image
            src="/images/hero-athlete.jpg"
            alt="Elite badminton athlete executing an explosive jump smash at S&A Badminton Academy Kochi"
            fill
            priority
            className="object-cover object-right lg:object-center opacity-85 transition-transform duration-700 hover:scale-[1.02]"
            sizes="100vw"
          />

          {/* Cinematic Editorial Gradients — Dark pitch black on left, revealing player on right */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, 
                rgba(7,9,13,0.98) 0%, 
                rgba(7,9,13,0.93) 45%, 
                rgba(7,9,13,0.60) 75%, 
                rgba(7,9,13,0.30) 100%)`,
            }}
          />

          {/* Mobile Vignette for Maximum Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-[#07090D]/75 to-[#07090D]/85 lg:hidden pointer-events-none" />

          {/* Cinematic subtle film grain & dark edge vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.8)] pointer-events-none" />
        </div>
      </div>

      {/* Hero Content Container */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-12 pb-16 lg:py-20">
        <div className="max-w-3xl lg:max-w-4xl text-left space-y-6 sm:space-y-8">
          
          {/* 01. Micro Eyebrow with Monospace Index */}
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[11px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
              01 // PERFORMANCE
            </span>
            <span className="text-[11px] sm:text-xs font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
              S&amp;A BADMINTON ACADEMY • KOCHI
            </span>
          </div>

          {/* 02. Colossal Asymmetric Editorial Typography */}
          <h1 className="text-[clamp(2.8rem,7.5vw,6.5rem)] font-black tracking-[-0.04em] text-white leading-[0.92] uppercase select-none">
            <span className="block text-white">TRAIN HARD.</span>
            <span className="block text-[#B8F000] my-1 sm:my-2">SMASH HARDER.</span>
            <span className="block text-white/95">MASTER THE COURT.</span>
          </h1>

          {/* 03. Supporting Performance Copy */}
          <p className="text-base sm:text-lg lg:text-xl text-[#A8B0BA] max-w-xl font-normal leading-relaxed">
            {ACADEMY_DATA.subheadline}
          </p>

          {/* 04. Tactile, High-Voltage Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-sm uppercase tracking-wider transition-all duration-150 group shadow-md"
            >
              <span>BOOK A FREE TRIAL</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-150" />
            </Link>

            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsApp}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-[#11161D] hover:bg-[#17212C] text-white font-bold text-sm uppercase tracking-wider border border-[#1F2937] hover:border-[#B8F000]/60 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#22C55E]" />
              <span>WHATSAPP ADMISSIONS</span>
            </a>
          </div>

          {/* 05. Safe Verified Operational Footprint */}
          <div className="pt-8 border-t border-[#1F2937] grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl">
            {ACADEMY_DATA.trustPillars.map((pillar, idx) => (
              <div key={idx} className="flex flex-col border-l-2 border-[#1F2937] pl-3.5 hover:border-[#B8F000] transition-colors">
                <span className="font-mono text-[10px] text-[#B8F000] font-bold">
                  0{idx + 1}
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-tight mt-0.5">
                  {pillar.title}
                </span>
                <span className="text-[11px] text-[#A8B0BA] mt-0.5 leading-snug">
                  {pillar.subtitle}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom Editorial Coordinates & Scroll Indicator */}
      <div className="hidden md:flex absolute bottom-6 left-8 right-8 z-10 items-center justify-between pointer-events-none text-[#A8B0BA] font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-[#B8F000] rounded-none animate-pulse" />
          <span className="tracking-widest uppercase text-white font-bold">
            01 / 04 CENTRES ACROSS KOCHI
          </span>
          <span className="text-[#1F2937]">|</span>
          <span className="text-[#A8B0BA]">KADAVANTHRA • EDAPPALLY • KAKKANAD</span>
        </div>

        <div className="flex items-center gap-2 text-[#A8B0BA] opacity-70">
          <span className="text-[10px] tracking-widest uppercase">SCROLL TO EXPLORE</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
