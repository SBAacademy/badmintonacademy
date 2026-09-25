"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Trophy, Sparkles } from "lucide-react";
import { EventItem } from "@/data/events";
import { EventCard } from "@/components/events/EventCard";

interface UpcomingEventsSectionProps {
  initialEvents?: EventItem[];
}

export function UpcomingEventsSection({ initialEvents }: UpcomingEventsSectionProps) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents || []);
  const [loading, setLoading] = useState(!initialEvents);

  useEffect(() => {
    fetch("/api/events?status=upcoming", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items)) {
          setEvents(data.items);
        }
      })
      .catch((err) => console.error("Failed to load upcoming events:", err))
      .finally(() => setLoading(false));
  }, []);

  // Strict requirement: If zero upcoming events exist in database, hide section completely
  // Never display hardcoded dummy or fake tournaments.
  if (!loading && events.length === 0) {
    return null;
  }

  const featured = events.find((e) => e.isFeatured);
  const regularEvents = featured ? events.filter((e) => e.id !== featured.id) : events;

  return (
    <section
      className="py-24 lg:py-36 bg-[#07090D] relative border-b border-[#1F2937] select-none"
      aria-label="Upcoming Badminton Events and Tournaments"
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#1F2937]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase rounded-sm">
                FIXTURES // CALENDAR
              </span>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
                ACADEMY COMPETITIONS
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.03em] uppercase leading-[0.95]">
              UPCOMING EVENTS &amp; <br />
              <span className="text-[#B8F000]">TOURNAMENTS.</span>
            </h2>
          </div>

          <div className="space-y-3 text-left md:text-right">
            <p className="text-sm sm:text-base text-[#A8B0BA] max-w-md font-normal leading-relaxed">
              Step onto the arena. From sanctioned ranking championships to grassroots camps, explore upcoming events across our Kochi centres.
            </p>
            <div>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-xs font-black text-[#B8F000] hover:text-white uppercase tracking-wider transition-colors"
              >
                <span>VIEW FULL CALENDAR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Event Spotlight (If Set) */}
        {featured && (
          <div className="pt-2">
            <EventCard event={featured} featuredLayout={true} />
          </div>
        )}

        {/* Regular Events Grid */}
        {regularEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {regularEvents.slice(0, featured ? 3 : 6).map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}

        {/* Bottom Explorer Action */}
        <div className="pt-8 text-center border-t border-[#1F2937]">
          <Link
            href="/events"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#11161D] hover:bg-[#17212C] text-white border border-[#1F2937] hover:border-[#B8F000]/60 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md group"
          >
            <Calendar className="w-4 h-4 text-[#B8F000]" />
            <span>EXPLORE ALL EVENTS &amp; TOURNAMENTS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
