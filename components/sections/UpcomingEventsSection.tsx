"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, MapPin, MessageCircle } from "lucide-react";
import { EventItem, EVENT_TYPE_BADGES } from "@/data/events";

interface UpcomingEventsSectionProps {
  initialEvents?: EventItem[];
}

function formatEventDisplayDate(dateStr?: string | null): string {
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

function cleanExcerpt(text?: string | null): string {
  if (!text) return "";
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 0 &&
        !l.startsWith("🏸") &&
        !l.startsWith("Dear ") &&
        !l.toLowerCase().includes("academy tournament 2026")
    );
  const firstMeaningful = lines.find((l) => l.length > 35) || lines[0] || text;
  return firstMeaningful;
}

export function UpcomingEventsSection({ initialEvents }: UpcomingEventsSectionProps) {
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
      .catch((err) => console.error("Failed to load upcoming events:", err))
      .finally(() => setLoading(false));
  }, [initialEvents]);

  // Strict requirement: If zero upcoming events exist in database, hide section completely
  if (!loading && events.length === 0) {
    return null;
  }

  // Identify featured event and remaining secondary events
  const featured = events.find((e) => e.isFeatured) || events[0];
  const secondaryEvents = featured ? events.filter((e) => e.id !== featured.id) : [];

  if (!featured) {
    return null;
  }

  const featuredBadge = EVENT_TYPE_BADGES[featured.eventType] || EVENT_TYPE_BADGES.TOURNAMENT;
  const featuredDate = formatEventDisplayDate(featured.eventDate);

  return (
    <section
      id="events"
      className="py-20 lg:py-32 bg-[#07090D] relative border-b border-[#1F2937] select-none scroll-mt-20"
      aria-label="Academy Events & Tournaments"
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* 01. Editorial Eyebrow & Category Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 sm:pb-12 border-b border-[#1F2937]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
                03 // EVENTS &amp; TOURNAMENTS
              </span>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
                WHAT&apos;S HAPPENING AT SBA
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.03em] uppercase leading-[0.95]">
              THE COURT <br />
              <span className="text-[#B8F000]">IS ALWAYS ALIVE.</span>
            </h2>
          </div>

          <div className="max-w-md text-left md:text-right space-y-3">
            <p className="text-sm sm:text-base text-[#A8B0BA] leading-relaxed font-normal">
              Tournaments, training camps and academy events designed to bring players together, forge competitive grit, and master the game.
            </p>
            <div>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-xs font-mono font-black tracking-wider text-[#B8F000] hover:text-white uppercase transition-colors"
              >
                <span>VIEW FULL CALENDAR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 02. Featured Event: Editorial Split Layout */}
        <div className="relative bg-[#0B0F14] border border-[#1F2937] hover:border-[#B8F000]/50 transition-all duration-300 rounded-xl lg:rounded-2xl overflow-hidden group">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Left Column: Cinematic Event Photography */}
            <div className="lg:col-span-6 xl:col-span-7 relative min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] overflow-hidden bg-[#161F2C]">
              <Image
                src={featured.image || "/images/badminton-arena.jpg"}
                alt={featured.title}
                fill
                priority
                className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              {/* Subtle dark gradient overlay to focus typography */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/25 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#0B0F14]/20 lg:to-[#0B0F14]" />

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
                <span className="px-2.5 py-1 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase rounded-sm flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                  UPCOMING TOURNAMENT
                </span>

                <span
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-sm border backdrop-blur-md ${featuredBadge.bg} ${featuredBadge.text}`}
                >
                  {featuredBadge.icon} {featuredBadge.label}
                </span>
              </div>
            </div>

            {/* Right Column: Event Information & Action */}
            <div className="lg:col-span-6 xl:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 text-left">
              <div className="space-y-4">
                {/* Live Indicator */}
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-[#B8F000] rounded-none shrink-0" />
                  <span className="font-mono text-xs font-black tracking-[0.22em] text-[#B8F000] uppercase">
                    FEATURED FIXTURE
                  </span>
                </div>

                {/* Event Headline Title */}
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white group-hover:text-[#B8F000] transition-colors uppercase tracking-tight leading-[1.05]">
                  {featured.title}
                </h3>

                {/* Date & Location Pill Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1F2937]/80 text-xs">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-[#A8B0BA] uppercase tracking-wider">
                      EVENT DATE
                    </span>
                    <div className="text-white font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#B8F000]" />
                      <span>{featuredDate}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-[#A8B0BA] uppercase tracking-wider">
                      LOCATION / ARENA
                    </span>
                    <div className="text-white font-bold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B8F000]" />
                      <span className="truncate">
                        {featured.centreName || featured.venue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Short Editorial Excerpt */}
                {featured.description && (
                  <p className="text-sm text-[#A8B0BA] leading-relaxed line-clamp-3 font-normal pt-1">
                    {cleanExcerpt(featured.description)}
                  </p>
                )}
              </div>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#1F2937]">
                <Link
                  href={`/events/${featured.slug}`}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-mono font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-md group/btn"
                >
                  <span>VIEW EVENT DETAILS</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1.5 transition-transform" />
                </Link>

                <a
                  href={`https://wa.me/${(featured.contact || "917907655513").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi SBA Badminton Academy, I would like to enquire about ${featured.title} on ${featuredDate}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-[#161F2C] hover:bg-[#1E293B] border border-[#1F2937] hover:border-[#25D366]/60 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition-colors group/wa"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366] group-hover/wa:scale-110 transition-transform" />
                  <span>ENQUIRE ON WHATSAPP</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 03. Secondary Events Grid (If more than 1 upcoming event exists) */}
        {secondaryEvents.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#A8B0BA]">
              <span className="w-1.5 h-1.5 bg-[#B8F000] rounded-none shrink-0" />
              <span>MORE UPCOMING FIXTURES</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {secondaryEvents.slice(0, 4).map((evt) => {
                const badge = EVENT_TYPE_BADGES[evt.eventType] || EVENT_TYPE_BADGES.TOURNAMENT;
                const evtDate = formatEventDisplayDate(evt.eventDate);

                return (
                  <div
                    key={evt.id}
                    className="relative bg-[#0B0F14] border border-[#1F2937] hover:border-[#B8F000]/60 rounded-xl overflow-hidden group transition-all duration-300 flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      {/* Photo */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#161F2C]">
                        <Image
                          src={evt.image || "/images/badminton-arena.jpg"}
                          alt={evt.title}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-sm border backdrop-blur-md ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 sm:p-6 space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#A8B0BA]">
                          <Calendar className="w-3.5 h-3.5 text-[#B8F000]" />
                          <span>{evtDate}</span>
                          {(evt.centreName || evt.venue) && (
                            <>
                              <span>•</span>
                              <span className="truncate">{evt.centreName || evt.venue}</span>
                            </>
                          )}
                        </div>

                        <h4 className="text-lg sm:text-xl font-black text-white group-hover:text-[#B8F000] uppercase tracking-tight transition-colors line-clamp-1">
                          {evt.title}
                        </h4>

                        {evt.description && (
                          <p className="text-xs sm:text-sm text-[#A8B0BA] line-clamp-2 leading-relaxed">
                            {cleanExcerpt(evt.description)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="p-5 sm:p-6 pt-0">
                      <Link
                        href={`/events/${evt.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-mono font-black text-[#B8F000] group-hover:text-white uppercase tracking-wider transition-colors"
                      >
                        <span>VIEW EVENT DETAILS</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 04. Bottom Calendar Explorer Action */}
        <div className="pt-6 text-center border-t border-[#1F2937]">
          <Link
            href="/events"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#11161D] hover:bg-[#17212C] text-white border border-[#1F2937] hover:border-[#B8F000]/60 font-mono font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md group"
          >
            <Calendar className="w-4 h-4 text-[#B8F000]" />
            <span>EXPLORE ALL EVENTS &amp; TOURNAMENTS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
