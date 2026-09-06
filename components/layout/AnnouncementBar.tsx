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
      className="relative z-50 bg-[#0E141B] text-[#A7B0BC] text-xs h-11 border-b border-[#26313D] flex items-center"
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Message Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
          <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold tracking-wider bg-[#B8F000]/15 text-[#B8F000] border border-[#B8F000]/30 shrink-0 uppercase">
            <span className="sm:hidden">2026–27</span>
            <span className="hidden sm:inline">{ACADEMY_DATA.announcement.badge}</span>
          </span>
          <span className="font-medium text-[#F8FAFC] text-[11px] sm:text-[13px] truncate">
            {ACADEMY_DATA.announcement.text}
          </span>
        </div>

        {/* Right CTA & Close Action */}
        <div className="flex items-center gap-4 shrink-0 pl-2">
          <Link
            href={ACADEMY_DATA.announcement.ctaLink}
            className="hidden md:inline-flex items-center gap-1.5 font-bold text-[#B8F000] hover:text-[#c7fb1e] text-xs transition-colors group"
          >
            <span>{ACADEMY_DATA.announcement.ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            onClick={() => setIsVisible(false)}
            className="text-[#6B7280] hover:text-[#F8FAFC] p-1 rounded-md hover:bg-[#17212C] transition-colors"
            aria-label="Close announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
