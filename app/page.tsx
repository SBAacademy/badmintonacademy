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
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { createMetadata } from "@/lib/seo";

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

export default function HomePage() {
  return (
    <>
      {/* 01. Cinematic Athletic Hero */}
      <HeroSection />

      {/* 02. Performance Ticker Marquee */}
      <PerformanceMarquee />

      {/* 03. Rebel Performance Manifesto */}
      <WhySA />

      {/* 04. Program Experience */}
      <ProgramsSection />

      {/* 05. 4-Stage Methodology Sequence */}
      <MethodologySection />

      {/* 06. Four-Centre Arena Selector */}
      <BranchesSection />

      {/* 07. Editorial Coaches Spotlight */}
      <CoachesSpotlight />

      {/* 08. Trophy Wall Tournament Archive */}
      <AchievementsSection />

      {/* 09. Court Action Visual Gallery */}
      <GalleryPreview />

      {/* 10. Editorial Testimonials */}
      <TestimonialsSection />

      {/* 11. FAQ Intel Briefing */}
      <FAQSection limit={6} />

      {/* 12. Final Campaign CTA */}
      <FinalCTA />
    </>
  );
}
