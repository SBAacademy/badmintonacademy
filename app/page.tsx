import React from "react";
import type { Metadata } from "next";
import { HeroSection } from "@/components/hero/HeroSection";
import { PerformanceMarquee } from "@/components/sections/PerformanceMarquee";
import { WhySA } from "@/components/sections/WhySA";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { MethodologySection } from "@/components/sections/MethodologySection";
import { BranchesSection } from "@/components/sections/BranchesSection";
import { CoachesSpotlight } from "@/components/sections/CoachesSpotlight";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { GalleryPreview } from "@/components/sections/GalleryPreview";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { ReviewsSliderSection } from "@/components/sections/ReviewsSliderSection";
import { createMetadata } from "@/lib/seo";
import { getCentres, getPrograms, getCoaches, getTestimonials } from "@/lib/contentDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = createMetadata({
  title: "Badminton Coaching & Academy in Kochi | Kadavanthra, Edappally, Kakkanad",
  description: "Join S & A Badminton Academy in Kochi. Premier badminton coaching for kids, juniors, adults & competitive athletes across Kadavanthra, Edappally, and Kakkanad. BWF sprung wooden courts & certified coaches.",
  path: "/",
  keywords: [
    "badminton academy in Kochi",
    "badminton coaching in Kochi",
    "badminton coaching Kadavanthra",
    "badminton academy Edappally",
    "badminton coaching Kakkanad",
    "kids badminton classes Kochi",
    "badminton summer camp Kochi",
  ],
});

export default async function HomePage() {
  const [centres, programs, coaches, testimonials] = await Promise.all([
    getCentres({ includeInactive: false }),
    getPrograms(),
    getCoaches(),
    getTestimonials({ includePending: false }),
  ]);

  return (
    <>
      {/* 01. Cinematic Athletic Hero */}
      <HeroSection initialCentres={centres} />

      {/* 02. Performance Ticker Marquee */}
      <PerformanceMarquee />

      {/* 03. Rebel Performance Manifesto */}
      <WhySA />

      {/* 04. Program Experience */}
      <ProgramsSection initialPrograms={programs} />

      {/* 05. 4-Stage Methodology Sequence */}
      <MethodologySection />

      {/* 06. Multi-Centre Arena Selector */}
      <BranchesSection initialCentres={centres} />

      {/* 07. Editorial Coaches Spotlight */}
      <CoachesSpotlight initialCoaches={coaches} />

      {/* 08. Trophy Wall Tournament Archive */}
      <AchievementsSection />

      {/* 09. Court Action Visual Gallery */}
      <GalleryPreview />

      {/* 10. FAQ Intel Briefing */}
      <FAQSection limit={6} />

      {/* 11. Final Campaign CTA */}
      <FinalCTA initialCount={centres.length} />

      {/* 12. Reviews Section (Directly Before Footer) */}
      <ReviewsSliderSection initialReviews={testimonials} />
    </>
  );
}
