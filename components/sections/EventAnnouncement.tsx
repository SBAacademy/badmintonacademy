"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { EventItem } from "@/data/events";

interface EventAnnouncementProps {
  initialEvents?: EventItem[];
}

function formatAnnouncementDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.toUpperCase();
    return d
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
      .toUpperCase();
  } catch {
    return (dateStr || "").toUpperCase();
  }
}

export function EventAnnouncement({ initialEvents }: EventAnnouncementProps) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents || []);
  const [loading, setLoading] = useState(!initialEvents);

  useEffect(() => {
    if (initialEvents !== undefined) return;

    fetch("/api/events?status=upcoming")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items)) {
          setEvents(data.items);
        }
      })
      .catch((err) => console.error("Failed to load announcement event:", err))
      .finally(() => setLoading(false));
  }, [initialEvents]);

  // Gracefully hide if no upcoming published event exists
  if (!loading && (!events || events.length === 0)) {
    return null;
  }

  // Pick the featured event or the earliest upcoming published event
  const activeEvent = events.find((e) => e.isFeatured) || events[0];

  if (!activeEvent) {
    return null;
  }

  const formattedDate = formatAnnouncementDate(activeEvent.eventDate);
  const eventUrl = "#events";

  return (
    <section
      aria-label="Upcoming event announcement"
      className="relative bg-[#07090D] border-y border-[#263342] py-5 lg:py-6 overflow-hidden select-none transition-colors duration-200"
    >
      {/* 01. Subtle atmospheric brand glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_90%_at_50%_50%,rgba(184,240,0,0.08),transparent_70%)]"
      />

      {/* 02. Precision lime accent highlight at the top edge */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B8F000]/40 to-transparent pointer-events-none"
      />

      {/* 03. Crisp structural bottom border highlight */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#263342] to-transparent pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={eventUrl}
          aria-label={`Upcoming Event: ${activeEvent.title}, ${formattedDate}. View event details.`}
          className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F000] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07090D]"
        >
          {/* Desktop & Tablet Layout (Strong Visual Hierarchy) */}
          <div className="hidden md:flex flex-col gap-2.5">
            {/* Top Tier: Live Announcement Status Indicator */}
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 bg-[#B8F000] rounded-none shrink-0" />
              <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8F000] opacity-50 motion-reduce:hidden" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#B8F000]" />
              </span>
              <span className="font-mono text-xs font-black tracking-[0.25em] uppercase text-[#B8F000]">
                UPCOMING EVENT
              </span>
            </div>

            {/* Main Tier: Hero Title + Event Date + Action CTA */}
            <div className="flex items-center justify-between gap-6">
              {/* Event Title (Hero of the section) & Date Meta */}
              <div className="flex items-center gap-4 lg:gap-6 min-w-0">
                <h2 className="text-lg lg:text-[22px] font-black text-white uppercase tracking-tight group-hover:text-[#B8F000] transition-colors duration-200 truncate">
                  {activeEvent.title}
                </h2>

                {formattedDate && (
                  <>
                    <span className="text-[#2D3748] select-none text-base shrink-0">•</span>
                    <div className="flex items-center gap-2 text-sm font-mono text-[#A8B0BA] font-semibold shrink-0">
                      <Calendar className="w-4 h-4 text-[#B8F000] shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                  </>
                )}

                {(activeEvent.centreName || activeEvent.venue) && (
                  <span className="hidden xl:inline text-xs font-mono text-[#A8B0BA]/60 truncate">
                    ({activeEvent.centreName || activeEvent.venue})
                  </span>
                )}
              </div>

              {/* Action CTA */}
              <div className="flex items-center gap-2 shrink-0 font-mono text-xs sm:text-sm font-black tracking-[0.15em] text-[#B8F000] group-hover:text-white uppercase transition-colors duration-200">
                <span>VIEW EVENT</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200 motion-reduce:transform-none" />
              </div>
            </div>
          </div>

          {/* Mobile Layout (Compact, High-Visibility Stacked Announcement) */}
          <div className="flex md:hidden flex-col gap-2.5">
            {/* Top Tier: Live Indicator & Label */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#B8F000] rounded-none shrink-0" />
                <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8F000] opacity-50 motion-reduce:hidden" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#B8F000]" />
                </span>
                <span className="font-mono text-xs font-black tracking-[0.22em] uppercase text-[#B8F000]">
                  UPCOMING EVENT
                </span>
              </div>
            </div>

            {/* Event Title (Prominent, High Contrast) */}
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight leading-snug group-hover:text-[#B8F000] transition-colors duration-200">
              {activeEvent.title}
            </h2>

            {/* Date & Location */}
            {formattedDate && (
              <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-[#A8B0BA] font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#B8F000] shrink-0" />
                <span>{formattedDate}</span>
                {activeEvent.centreName && (
                  <span className="text-[#A8B0BA]/60 truncate">
                    • {activeEvent.centreName}
                  </span>
                )}
              </div>
            )}

            {/* Action CTA */}
            <div className="pt-1 flex items-center gap-2 font-mono text-xs sm:text-sm font-black tracking-wider text-[#B8F000] group-hover:text-white uppercase transition-colors duration-200">
              <span>VIEW EVENT</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200 motion-reduce:transform-none" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
