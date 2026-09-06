"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { ACADEMY_DATA } from "@/data/academy";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export function FinalCTA() {
  const handleWhatsApp = () => {
    trackEvent("whatsapp_click", { source: "final_cta" });
  };

  const handleCall = () => {
    trackEvent("phone_click", { source: "final_cta" });
  };

  return (
    <section className="py-24 lg:py-32 bg-[#0E141B] relative overflow-hidden border-t border-[#26313D]">
      {/* Subtle Atmospheric Warmth Behind Content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#B8F000]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-7">
        
        {/* Editorial Accent */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121A23] border border-[#26313D] text-[#B8F000] text-xs font-bold uppercase tracking-widest">
          <span>GET STARTED ON COURT</span>
        </div>

        {/* Athletic Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#F8FAFC] tracking-tight uppercase leading-tight">
          Ready to Step Onto The Court & <br className="hidden sm:inline" />
          <span className="text-[#B8F000]">Elevate Your Game?</span>
        </h2>

        {/* Supporting Copy */}
        <p className="text-[#A7B0BC] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Whether you’re enrolling your child for foundational agility or stepping back onto the court after work, our certified coaches across <strong className="text-[#F8FAFC]">Kadavanthra</strong>, <strong className="text-[#F8FAFC]">Edappally</strong>, and <strong className="text-[#F8FAFC]">Kakkanad</strong> are ready to welcome you.
        </p>

        {/* Standardized Primary & Secondary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/contact"
            className="w-full sm:w-auto px-9 py-4 rounded-xl bg-[#B8F000] hover:bg-[#c7fb1e] text-[#07100A] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all duration-200 group"
          >
            <span>BOOK A FREE TRIAL</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsApp}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#121A23] hover:bg-[#17212C] text-[#F8FAFC] font-semibold text-sm sm:text-base border border-[#26313D] hover:border-[#374758] transition-colors flex items-center justify-center gap-2.5"
          >
            <MessageCircle className="w-4 h-4 text-[#22C55E]" />
            <span>WHATSAPP US</span>
          </a>

          <a
            href={`tel:${ACADEMY_DATA.phone}`}
            onClick={handleCall}
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#080B10] hover:bg-[#121A23] text-[#A7B0BC] hover:text-[#F8FAFC] font-medium text-xs sm:text-sm border border-[#26313D] transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4 text-[#B8F000]" />
            <span>Call Desk</span>
          </a>
        </div>

        {/* Trust notes */}
        <div className="pt-4 text-xs text-[#6B7280] flex flex-wrap items-center justify-center gap-6 font-medium">
          <span>✓ Zero equipment needed for trial</span>
          <span>✓ Free 45-min coach evaluation</span>
          <span>✓ 3 Kochi locations</span>
        </div>

      </div>
    </section>
  );
}
