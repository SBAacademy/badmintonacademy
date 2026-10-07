import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { GalleryInteractive } from "@/components/gallery/GalleryInteractive";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = createMetadata({
  title: "Badminton Academy Photo & Video Gallery | Courts & Coaching",
  description: "Browse photos and videos of S & A Badminton Academy Kochi. Tour our synthetic courts across Kadavanthra, Kumbalanghi, Maradu, Palluruthy, and Chullikal, junior drills, and tournaments.",
  path: "/gallery",
  keywords: [
    "badminton courts photos Kochi",
    "badminton academy gallery",
    "badminton coaching pictures Kochi",
    "S&A badminton arena",
  ],
});

import { getGalleryItems, getCentres } from "@/lib/contentDb";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const [galleryItems, centres] = await Promise.all([
    getGalleryItems(),
    getCentres({ includeInactive: false }),
  ]);

  return (
    <div className="py-8 sm:py-12 bg-[#090D16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ name: "Photo & Video Gallery", url: "/gallery" }]} />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Visual Experience
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Inside S & A Badminton Academy
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Take a visual tour of our world-class synthetic courts, high-tempo training sessions, video analysis rooms, and tournament podium celebrations.
          </p>
        </div>

        {/* Interactive Filterable Gallery */}
        <GalleryInteractive initialItems={galleryItems} initialCentres={centres} />

      </div>

      <div className="mt-20">
        <FinalCTA />
      </div>
    </div>
  );
}
