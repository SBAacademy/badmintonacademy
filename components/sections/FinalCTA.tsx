"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { ACADEMY_DATA } from "@/data/academy";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export function FinalCTA({ initialCount }: { initialCount?: number }) {
  const [centreCount, setCentreCount] = useState<number>(initialCount !== undefined ? initialCount : 0);

  useEffect(() => {
    fetch("/api/centres")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data.centres)
          ? data.centres
          : Array.isArray(data.items)
          ? data.items
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        if (list.length > 0 || data.success) {
          setCentreCount(list.length);
        }
      })
      .catch(() => {});
  }, []);

  const handleWhatsApp = () => {
    trackEvent("whatsapp_click", { source: "rebel_final_cta" });
  };

  const handleCall = () => {
    trackEvent("phone_click", { source: "rebel_final_cta" });
  };

  return (
    <section 
      className="py-28 lg:py-40 bg-[#07090D] relative overflow-hidden border-t border-[#1F2937] select-none"
      aria-label="Campaign Final Call to Action"
    >
      <div className="max-w-5xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left space-y-8">
        
        {/* Editorial Eyebrow with Monospace Index */}
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
            09 // INITIATION
          </span>
          <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
            READY TO LEVEL UP?
          </span>
        </div>

        {/* Colossal Sports Headline */}
        <h2 className="text-[clamp(2.5rem,7vw,6.5rem)] font-black text-white tracking-[-0.04em] uppercase leading-[0.92]">
          NO MORE WAITING. <br />
          <span className="text-[#B8F000]">CLAIM YOUR SPOT</span> <br />
          ON THE COURT.
        </h2>

        {/* Supporting Copy */}
        <p className="text-base sm:text-lg lg:text-xl text-[#A8B0BA] max-w-2xl font-normal leading-relaxed">
          Whether you’re enrolling your child for foundational agility or stepping back onto the court after work, our certified coaches across our strategic Kochi training facilities are ready to put you on court.
        </p>

        {/* Tactile Conversion CTAs */}
        <div className="space-y-3 pt-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
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

            <a
              href={`tel:${ACADEMY_DATA.phone}`}
              onClick={handleCall}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#0B0F14] hover:bg-[#11161D] text-[#A8B0BA] hover:text-white font-mono text-xs uppercase tracking-wider border border-[#1F2937] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#B8F000]" />
              <span>{ACADEMY_DATA.phone}</span>
            </a>
          </div>

          <p className="text-xs font-mono text-[#A8B0BA] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8F000]" />
            Shoes &amp; racket required for free trial.
          </p>
        </div>

        {/* Structural Footprint Guarantees */}
        <div className="pt-10 border-t border-[#1F2937] grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[11px] text-[#A8B0BA] uppercase tracking-wider">
          <div className="flex items-center gap-2 text-[#E5E7EB]">
            <span className="w-1.5 h-1.5 bg-[#B8F000]" />
            <span>SHOES &amp; RACKET REQUIRED FOR FREE TRIAL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#B8F000]" />
            <span>45-MIN INDIVIDUAL COACH ASSESSMENT</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#B8F000]" />
            <span>{centreCount} CENTRAL KOCHI FACILITIES</span>
          </div>
        </div>

      </div>
    </section>
  );
}
