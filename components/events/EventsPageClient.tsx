"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Filter,
  Trophy,
  Flame,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import {
  EventItem,
  EventType,
  EVENT_TYPE_LABELS,
} from "@/data/events";
import { EventCard } from "@/components/events/EventCard";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface EventsPageClientProps {
  initialEvents: EventItem[];
}

export function EventsPageClient({ initialEvents }: EventsPageClientProps) {
  const [activeType, setActiveType] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  // Separate upcoming/ongoing from completed
  const upcomingEvents = initialEvents.filter(
    (e) => e.status === "UPCOMING" || e.status === "ONGOING"
  );
  const pastEvents = initialEvents.filter((e) => e.status === "COMPLETED");

  const currentList = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  const filtered = currentList.filter((e) => {
    if (activeType === "ALL") return true;
    return e.eventType === activeType;
  });

  const featured = activeTab === "upcoming" ? filtered.find((e) => e.isFeatured) : null;
  const regularList = featured ? filtered.filter((e) => e.id !== featured.id) : filtered;

  const categories: { key: string; label: string }[] = [
    { key: "ALL", label: "All Events" },
    { key: "TOURNAMENT", label: "Tournaments" },
    { key: "COMPETITION", label: "Competitions" },
    { key: "CHAMPIONSHIP", label: "Championships" },
    { key: "TRAINING_CAMP", label: "Training Camps" },
    { key: "WORKSHOP", label: "Workshops" },
    { key: "ACADEMY_EVENT", label: "Academy Events" },
  ];

  return (
    <div className="space-y-10">
      {/* Tab Switcher: Upcoming vs Past Fixtures */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2937] pb-6">
        <div className="flex items-center gap-2 bg-[#0F141C] p-1.5 rounded-2xl border border-[#1F2937] self-start">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "upcoming"
                ? "bg-[#B8F000] text-[#07090D] shadow-md"
                : "text-[#A8B0BA] hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Upcoming Fixtures ({upcomingEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("past")}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "past"
                ? "bg-[#B8F000] text-[#07090D] shadow-md"
                : "text-[#A8B0BA] hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Completed Events ({pastEvents.length})</span>
          </button>
        </div>

        <div className="text-xs text-[#A8B0BA] font-mono">
          Showing {filtered.length} {activeTab === "upcoming" ? "upcoming" : "past"} {filtered.length === 1 ? "event" : "events"}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono text-[#A8B0BA] uppercase tracking-wider mr-1 flex items-center gap-1.5">
          <Filter className="w-3 h-3 text-[#B8F000]" />
          Filter:
        </span>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveType(cat.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              activeType === cat.key
                ? "bg-[#B8F000] text-[#07090D] border-[#B8F000] shadow-sm"
                : "bg-[#0F141C] text-[#A8B0BA] border-[#1F2937] hover:border-white/40 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured Spotlight (If in Upcoming and Matches Filter) */}
      {featured && (
        <div className="pt-2">
          <EventCard event={featured} featuredLayout={true} />
        </div>
      )}

      {/* Events Grid */}
      {regularList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {regularList.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      ) : !featured ? (
        <div className="py-24 text-center bg-[#0F141C] border border-[#1F2937] rounded-3xl p-8 space-y-4">
          <Calendar className="w-12 h-12 text-[#A8B0BA]/40 mx-auto" />
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              {activeTab === "upcoming" ? "No Upcoming Events In This Category" : "No Past Events Listed"}
            </h3>
            <p className="text-xs sm:text-sm text-[#A8B0BA] max-w-md mx-auto leading-relaxed">
              {activeTab === "upcoming"
                ? "There are currently no upcoming fixtures scheduled for this filter. Check back soon or message our admissions desk for upcoming tournament dates."
                : "No past events have been archived in this category."}
            </p>
          </div>

          <div className="pt-2">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#161F2C] hover:bg-[#1E293B] text-white border border-[#1F2937] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#22C55E]" />
              <span>Inquire via WhatsApp</span>
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
