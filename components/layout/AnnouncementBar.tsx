"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { ACADEMY_DATA } from "@/data/academy";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !ACADEMY_DATA.announcement.enabled) return null;

  return (
    <aside
      aria-label="Announcement"
      className="relative z-50 bg-[#07090D] text-[#A8B0BA] text-xs h-10 border-b border-[#1F2937] flex items-center"
    >
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-6 xl:px-8 flex items-center justify-between gap-4">
        {/* Left Message Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-black tracking-widest bg-[#B8F000]/15 text-[#B8F000] border border-[#B8F000]/30 shrink-0 uppercase font-mono">
            <span className="sm:hidden">2026–27</span>
            <span className="hidden sm:inline">{ACADEMY_DATA.announcement.badge}</span>
          </span>
          <span className="font-semibold text-white text-[11px] sm:text-xs tracking-tight truncate">
            {ACADEMY_DATA.announcement.text}
          </span>
        </div>

        {/* Right CTA & Close Action */}
        <div className="flex items-center gap-4 shrink-0 pl-2">
          <Link
            href={ACADEMY_DATA.announcement.ctaLink}
            className="hidden md:inline-flex items-center gap-1.5 font-extrabold text-[#B8F000] hover:text-[#c7fb1e] text-xs uppercase tracking-wider transition-colors group"
          >
            <span>{ACADEMY_DATA.announcement.ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            onClick={() => setIsVisible(false)}
            className="text-[#9CA3AF] hover:text-white p-1 rounded hover:bg-[#17212C] transition-colors"
            aria-label="Close announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
