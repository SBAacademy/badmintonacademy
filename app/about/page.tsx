import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Check } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { ACADEMY_DATA } from "@/data/academy";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = createMetadata({
  title: "About SBA Badminton Academy | Coaching Philosophy & Infrastructure",
  description: "Learn about SBA Badminton Academy's vision, BWF certified coaches, world-class synthetic sprung wooden courts, and our athlete development philosophy in Kochi.",
  path: "/about",
  keywords: [
    "best badminton academy in Kochi",
    "professional badminton coaching Kochi",
    "badminton academy history Kochi",
    "BWF certified badminton coaching",
  ],
});

export default function AboutPage() {
  return (
    <div className="bg-[#07090D] min-h-screen text-white select-none">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ name: "About Us", url: "/about" }]} />

        {/* Rebel Editorial Hero */}
        <div className="pt-8 pb-16 border-b border-[#1F2937] space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
              ABOUT // SBA
            </span>
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
              ATHLETIC IDENTITY &amp; FOUNDATION
            </span>
          </div>

          <h1 className="text-[clamp(2.8rem,7vw,6rem)] font-black uppercase tracking-[-0.04em] leading-[0.92]">
            THE ACADEMY <br />
            <span className="text-[#B8F000]">BEHIND THE PLAYER.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#A8B0BA] max-w-2xl font-normal leading-relaxed">
            Founded in {ACADEMY_DATA.foundedYear}, SBA Badminton Academy was built with a singular mission: to provide world-class, injury-safe badminton coaching in Kerala, bridging the gap between casual recreation and elite competitive sports science.
          </p>
        </div>

        {/* Large Cinematic Photography Banner */}
        <div className="py-12 border-b border-[#1F2937]">
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-[#0B0F14] border border-[#1F2937]">
            <Image
              src="/images/badminton-arena.jpg"
              alt="SBA Badminton Academy Arena Kochi"
              fill
              className="object-cover filter contrast-110"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="font-mono text-xs text-[#B8F000] uppercase tracking-wider font-bold">
                OPERATIONAL CENTRES // KADAVANTHRA &bull; KUMBALANGHI &bull; MARADU &bull; PALLURUTHY &bull; CHULLIKAL
              </div>
              <div className="font-mono text-[11px] text-[#A8B0BA] uppercase">
                BWF-SPEC SYNTHETIC MATS ON SPRUNG WOOD
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Story & Philosophy Sequence */}
        <div className="py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-[#1F2937]">
          
          <div className="lg:col-span-5 space-y-4 text-left">
            <span className="font-mono text-xs text-[#B8F000] uppercase tracking-widest">
              01 // THE STORY
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-snug">
              FROM A SINGLE COURT TO A CITYWIDE MOVEMENT.
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-6 text-left text-sm sm:text-base text-[#A8B0BA] leading-relaxed">
            <p>
              Badminton in Kerala has unmatched grassroots passion. However, for decades, players lacked systematic biomechanical instruction and safe court infrastructure. Most training took place on hard concrete or tiles, causing premature meniscus wear and chronic ankle injuries.
            </p>
            <p>
              SBA changed that reality. By investing in international-standard tournament synthetic mats over shock-absorbing wooden subfloors, and uniting certified BWF coaches under one rigorous curriculum, we created an academy environment where talent is nurtured without physical breakdown.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 font-mono text-xs">
              <div className="p-4 bg-[#0B0F14] border border-[#1F2937] space-y-1">
                <span className="text-[#B8F000] font-bold">CERTIFIED PEDAGOGY</span>
                <p className="text-[#A8B0BA] text-[11px]">BWF &amp; NIS credentialed coaches leading every session.</p>
              </div>
              <div className="p-4 bg-[#0B0F14] border border-[#1F2937] space-y-1">
                <span className="text-[#B8F000] font-bold">JOINT SAFETY</span>
                <p className="text-[#A8B0BA] text-[11px]">Sprung subfloors absorbing over 50% of vertical shock.</p>
              </div>
            </div>
          </div>

        </div>

        {/* 3 Core Editorial Principles */}
        <div className="py-16 space-y-12">
          <div className="space-y-2 text-left">
            <span className="font-mono text-xs text-[#B8F000] uppercase tracking-widest">
              02 // CODE OF CONDUCT
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              OUR CORE OPERATIONAL PILLARS
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#1F2937] border-y border-[#1F2937]">
            <div className="py-8 lg:py-10 lg:pr-8 space-y-3 text-left">
              <span className="font-mono text-3xl font-black text-white/30">01</span>
              <h3 className="text-xl font-black uppercase text-white">Injury-Free Biomechanics</h3>
              <p className="text-xs sm:text-sm text-[#A8B0BA] leading-relaxed">
                Proper kinetic chain energy transfer prevents rotator cuff damage and patellar tendonitis. We teach athletes how to generate immense smash steepness through fluid core rotation rather than brute arm tension.
              </p>
            </div>

            <div className="py-8 lg:py-10 lg:px-8 space-y-3 text-left">
              <span className="font-mono text-3xl font-black text-white/30">02</span>
              <h3 className="text-xl font-black uppercase text-white">Documented Progression</h3>
              <p className="text-xs sm:text-sm text-[#A8B0BA] leading-relaxed">
                No student is thrown into unstructured matches without fundamentals. Beginners master grip rotation and split-step recovery before progressing to multi-shuttle high-tempo drills.
              </p>
            </div>

            <div className="py-8 lg:py-10 lg:pl-8 space-y-3 text-left">
              <span className="font-mono text-3xl font-black text-white/30">03</span>
              <h3 className="text-xl font-black uppercase text-white">Competitive Composure</h3>
              <p className="text-xs sm:text-sm text-[#A8B0BA] leading-relaxed">
                Matches are won between rallies. We teach emotional control under deuce pressure, sportsmanship in defeat, and disciplined tactical analysis after every competition.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Closing Campaign Action */}
      <FinalCTA />
    </div>
  );
}
