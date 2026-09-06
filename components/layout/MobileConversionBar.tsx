"use client";

import React from "react";
import Link from "next/link";
import { Phone, MessageCircle, CalendarCheck } from "lucide-react";
import { ACADEMY_DATA } from "@/data/academy";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export function MobileConversionBar() {
  const handleCall = () => {
    trackEvent("phone_click", { source: "mobile_bottom_bar" });
  };

  const handleWhatsApp = () => {
    trackEvent("whatsapp_click", { source: "mobile_bottom_bar" });
  };

  return (
    <aside
      aria-label="Quick Actions"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#1F2937] px-3 pt-2 shadow-2xl backdrop-blur-xl select-none"
      style={{
        backgroundColor: "rgba(7, 9, 13, 0.98)",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      }}
    >
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {/* Direct Call */}
        <a
          href={`tel:${ACADEMY_DATA.phone}`}
          onClick={handleCall}
          className="flex flex-col items-center justify-center min-h-[48px] py-1.5 px-2 bg-[#11161D] border border-[#1F2937] text-[#A8B0BA] hover:text-white text-[10px] font-mono font-bold uppercase tracking-wider active:scale-95 transition-transform"
        >
          <Phone className="w-4 h-4 text-[#B8F000] mb-0.5" />
          <span>Call Desk</span>
        </a>

        {/* WhatsApp Chat */}
        <a
          href={buildWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsApp}
          className="flex flex-col items-center justify-center min-h-[48px] py-1.5 px-2 bg-[#11161D] border border-[#1F2937] text-white text-[10px] font-mono font-bold uppercase tracking-wider active:scale-95 transition-transform"
        >
          <MessageCircle className="w-4 h-4 text-[#22C55E] mb-0.5" />
          <span>WhatsApp</span>
        </a>

        {/* Book Trial */}
        <Link
          href="/contact"
          className="flex flex-col items-center justify-center min-h-[48px] py-1.5 px-2 bg-[#B8F000] text-[#07090D] text-[10px] font-mono font-black uppercase tracking-wider active:scale-95 transition-transform shadow-md"
        >
          <CalendarCheck className="w-4 h-4 text-[#07090D] mb-0.5" />
          <span>Free Trial</span>
        </Link>
      </div>
    </aside>
  );
}
