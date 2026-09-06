"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle, CheckCircle2 } from "lucide-react";
import { ACADEMY_DATA } from "@/data/academy";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export function HeroSection() {
  const handleWhatsApp = () => {
    trackEvent("whatsapp_click", { source: "hero_primary" });
  };

  return (
    <section className="relative min-h-[82vh] lg:min-h-[86vh] flex items-center justify-center overflow-hidden bg-[#080B10] border-b border-[#26313D]">
      
      {/* Real High-Performance Badminton Athlete Photograph as Hero Right Backdrop */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <Image
            src="/images/hero-athlete.jpg"
            alt="Badminton athlete performing explosive jump smash at S&A Badminton Academy Kochi"
            fill
            priority
            className="object-cover object-right lg:object-center"
            sizes="100vw"
          />

          {/* Cinematic Editorial Gradient Mask - Keeps text readable while showcasing athlete */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, 
                rgba(8,11,16,0.98) 0%, 
                rgba(8,11,16,0.92) 42%, 
                rgba(8,11,16,0.60) 70%, 
                rgba(8,11,16,0.30) 100%)`,
            }}
          />

          {/* Subtle Mobile Bottom & Top Vignette for Maximum Contrast on Phones */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/60 to-[#080B10]/80 lg:hidden pointer-events-none" />

          {/* Subtle Warm Athletic Lime Atmospheric Halo Behind Player */}
          <div className="absolute top-1/3 right-1/4 w-[380px] h-[380px] bg-[#B8F000]/8 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>

      {/* Subtle Court Line Accent */}
      <div className="absolute inset-0 pointer-events-none opacity-10 court-grid-subtle" />

      {/* Hero Content Layer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-10 sm:py-12 lg:py-16">
        <div className="max-w-2xl lg:max-w-3xl space-y-5 sm:space-y-6 text-left">
          
          {/* 1. Editorial Eyebrow with Lime Accent Bar */}
          <div className="flex items-center gap-2.5">
            <span className="w-5 sm:w-6 h-0.5 bg-[#B8F000]" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#B8F000]">
              S & A BADMINTON ACADEMY • KOCHI & ERNAKULAM
            </span>
          </div>

          {/* 2. Bold Display Typography (Lines 1 & 2 in White, Line 3 in Athletic Lime #B8F000) */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-[#F8FAFC] leading-[1.06] uppercase">
            Train Hard. <br />
            Smash Harder. <br />
            <span className="text-[#B8F000]">
              Master The Court.
            </span>
          </h1>

          {/* 3. Editorial Description */}
          <p className="text-base sm:text-lg text-[#A7B0BC] max-w-xl font-normal leading-relaxed pt-1">
            {ACADEMY_DATA.subheadline}
          </p>

          {/* 4. Streamlined CTAs (Primary Book Free Trial + Secondary WhatsApp) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-3">
            <Link
              href="/contact"
              className="px-8 py-4 rounded-xl bg-[#B8F000] hover:bg-[#c7fb1e] text-[#07100A] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all duration-200 group"
            >
              <span>BOOK A FREE TRIAL</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsApp}
              className="px-7 py-4 rounded-xl bg-[#121A23]/90 hover:bg-[#17212C] text-[#F8FAFC] font-semibold text-sm sm:text-base border border-[#26313D] hover:border-[#374758] transition-colors flex items-center justify-center gap-2.5"
            >
              <MessageCircle className="w-4 h-4 text-[#22C55E]" />
              <span>WHATSAPP US</span>
            </a>
          </div>

          {/* 5. Safe, Data-Driven Trust Pillars (No unverified claims) */}
          <div className="pt-8 border-t border-[#26313D]/80 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
            {ACADEMY_DATA.trustPillars.map((pillar, idx) => (
              <div key={idx} className="flex items-start gap-2 text-left">
                <CheckCircle2 className="w-4 h-4 text-[#B8F000] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#F8FAFC] leading-tight">
                    {pillar.title}
                  </div>
                  <div className="text-[11px] text-[#6B7280] mt-0.5">
                    {pillar.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Subtle Secondary Floating Shuttlecock Silhouette in bottom-right corner */}
      <div className="hidden xl:block absolute bottom-8 right-12 z-10 pointer-events-none opacity-40 animate-subtle-float">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#B8F000" strokeWidth="1.5">
          <path d="M12 2l2.5 5.5L12 10l-2.5-2.5L12 2z" />
          <path d="M12 10v12" />
          <path d="M7 16a5 5 0 0 0 10 0" />
        </svg>
      </div>
    </section>
  );
}
