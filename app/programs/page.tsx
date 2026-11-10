import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Target, Clock, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { PROGRAMS } from "@/data/programs";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { CentreGallerySection } from "@/components/sections/CentreGallerySection";

export const metadata: Metadata = createMetadata({
  title: "Badminton Coaching Programs in Kochi | Kids, Juniors, Adults & Pros",
  description: "Explore all badminton training programs at SBA Badminton Academy Kochi. Structured coaching for kids (ages 5-9), junior development, adult fitness, competitive squad, and holiday camps.",
  path: "/programs",
  keywords: [
    "badminton classes in Kochi",
    "badminton coaching programs",
    "kids badminton classes Kochi",
    "junior badminton coaching",
    "adult badminton classes",
    "badminton camp Kochi",
  ],
});

export default function ProgramsPage() {
  return (
    <div className="bg-[#07090D] min-h-screen text-white select-none">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ name: "Training Programs", url: "/programs" }]} />

        {/* Rebel Hero */}
        <div className="pt-8 pb-16 border-b border-[#1F2937] space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
              PATHWAYS // ALL TRACKS
            </span>
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
              ATHLETIC CURRICULUM
            </span>
          </div>

          <h1 className="text-[clamp(2.8rem,7vw,6.5rem)] font-black uppercase tracking-[-0.04em] leading-[0.92]">
            FIND YOUR <br />
            <span className="text-[#B8F000]">GAME.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#A8B0BA] max-w-2xl font-normal leading-relaxed">
            From children taking their first court steps to corporate athletes and state tournament qualifiers, our curriculum provides a disciplined, structured athletic training pathway.
          </p>
        </div>

        {/* Editorial Program Rows */}
        <div className="divide-y divide-[#1F2937] border-b border-[#1F2937]">
          {PROGRAMS.map((program, idx) => (
            <div
              key={program.slug}
              className="py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group hover:bg-[#0B0F14]/60 px-4 sm:px-6 transition-colors"
            >
              {/* Monospace Number & Badge */}
              <div className="lg:col-span-2 space-y-2 text-left">
                <span className="font-mono text-4xl sm:text-5xl font-black text-white/30 group-hover:text-[#B8F000] transition-colors">
                  0{idx + 1}
                </span>
                <div className="font-mono text-[10px] text-[#B8F000] tracking-widest uppercase">
                  {program.badge}
                </div>
              </div>

              {/* Title & Description */}
              <div className="lg:col-span-6 space-y-3 text-left">
                <div className="flex items-center gap-3 text-xs font-mono text-[#A8B0BA] uppercase">
                  <span>LEVEL: {program.skillLevel}</span>
                  <span>&bull;</span>
                  <span>AGE: {program.targetAge}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight group-hover:text-white">
                  {program.name}
                </h2>

                <p className="text-xs sm:text-sm text-[#A8B0BA] leading-relaxed max-w-xl">
                  {program.fullDescription}
                </p>

                <div className="flex flex-wrap gap-4 pt-2 font-mono text-xs text-[#A8B0BA]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#B8F000]" />
                    {program.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#B8F000]" />
                    {program.batchRatio} RATIO
                  </span>
                </div>
              </div>

              {/* Visual Thumbnail & CTA */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-4">
                <div className="relative aspect-[16/10] w-full lg:w-48 overflow-hidden bg-[#07090D] border border-[#1F2937]">
                  <Image
                    src={program.image}
                    alt={program.name}
                    fill
                    className="object-cover filter contrast-115 group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 1024px) 100vw, 200px"
                  />
                </div>

                <Link
                  href={`/programs/${program.slug}`}
                  className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-[#11161D] group-hover:bg-[#B8F000] text-white group-hover:text-[#07090D] font-black text-xs uppercase tracking-wider border border-[#1F2937] group-hover:border-[#B8F000] transition-all"
                >
                  <span>EXPLORE CURRICULUM</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Centre Arenas & Courts Gallery */}
      <CentreGallerySection
        eyebrow="FACILITY INFRASTRUCTURE // ALL VENUES"
        title="TRAINING CENTRES & COURTS GALLERY"
        description="Every program at SBA is conducted in world-class indoor badminton facilities with specialized wooden-sprung and synthetic rubber mat flooring."
      />

      {/* Campaign Ending CTA */}
      <FinalCTA />
    </div>
  );
}
