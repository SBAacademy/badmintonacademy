import React from "react";
import type { Metadata } from "next";
import { HeroSection } from "@/components/hero/HeroSection";
import { WhySA } from "@/components/sections/WhySA";
import { TrustStats } from "@/components/sections/TrustStats";
import { ProgramsSection } from "@/components/sections/ProgramsSection";
import { MethodologySection } from "@/components/sections/MethodologySection";
import { CoachesSpotlight } from "@/components/sections/CoachesSpotlight";
import { BranchesSection } from "@/components/sections/BranchesSection";
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
      {/* 1. High-Performance Athletic Animated Hero */}
      <HeroSection />

      {/* 2. Brand Story / Why S&A Visual Section */}
      <WhySA />

      {/* 3. Verified Statistics & Trust Indicators */}
      <TrustStats />

      {/* 4. Training Programs Showcase */}
      <ProgramsSection />

      {/* 5. 4-Stage Coaching Methodology */}
      <MethodologySection />

      {/* 6. Certified Coaches Spotlight */}
      <CoachesSpotlight />

      {/* 7. Academy Branches Across Kochi */}
      <BranchesSection />

      {/* 8. Recent Tournament Achievements */}
      <AchievementsSection />

      {/* 9. Photo & Video Gallery Preview */}
      <GalleryPreview />

      {/* 10. Student & Parent Reviews */}
      <TestimonialsSection />

      {/* 11. FAQ Accordion */}
      <FAQSection limit={6} />

      {/* 12. Final Standardized CTA */}
      <FinalCTA />
    </>
  );
}
