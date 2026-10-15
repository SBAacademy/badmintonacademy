import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { getEvents, getCentres } from "@/lib/contentDb";
import { EventsPageClient } from "@/components/events/EventsPageClient";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const revalidate = 300;

export const metadata: Metadata = createMetadata({
  title: "Badminton Tournaments & Events in Kochi | S & A Badminton Academy",
  description:
    "Explore upcoming badminton tournaments, championships, holiday training camps, and workshops across S & A Badminton Academy centres in Kadavanthra, Kumbalanghi, Maradu, Palluruthy, and Chullikal.",
  path: "/events",
  keywords: [
    "badminton tournaments in Kochi",
    "upcoming badminton tournament Kerala",
    "badminton championship Kochi",
    "badminton summer camp Kochi",
    "junior badminton tournament Ernakulam",
    "open badminton tournament registration",
  ],
});

export default async function EventsPage() {
  const [events, centres] = await Promise.all([
    getEvents({ includeUnpublished: false }),
    getCentres({ includeInactive: false }),
  ]);

  return (
    <div className="bg-[#07090D] min-h-screen text-white select-none">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ name: "Events & Tournaments", url: "/events" }]} />

        {/* Hero Header */}
        <div className="pt-4 pb-12 border-b border-[#1F2937] space-y-6 text-left">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase rounded-sm">
              ACADEMY FIXTURES
            </span>
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
              COMPETITIVE ARENA
            </span>
          </div>

          <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-black uppercase tracking-[-0.04em] leading-[0.92]">
            EVENTS &amp; <br />
            <span className="text-[#B8F000]">TOURNAMENTS.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#A8B0BA] max-w-2xl font-normal leading-relaxed">
            Test your skills on court. Register for sanctioned ranking tournaments, holiday development camps, stroke masterclasses, and internal academy championships across Kochi.
          </p>
        </div>

        {/* Interactive Event List & Filters */}
        <EventsPageClient initialEvents={events} />
      </div>

      <FinalCTA initialCount={centres.length} />
    </div>
  );
}
