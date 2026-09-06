import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Award, HeartHandshake, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { ACADEMY_DATA } from "@/data/academy";
import { TrustStats } from "@/components/sections/TrustStats";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = createMetadata({
  title: "About S & A Badminton Academy | Coaching Philosophy & Infrastructure",
  description: "Learn about S & A Badminton Academy's vision, BWF certified coaches, world-class synthetic sprung wooden courts, and our athlete development philosophy in Kochi.",
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
    <div className="py-8 sm:py-12 bg-[#090D16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ name: "About Us", url: "/about" }]} />

        {/* Hero Section of About */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              About Our Academy
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Building Badminton Champions Through Sports Science & Pure Passion
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Founded in {ACADEMY_DATA.foundedYear}, <strong className="text-white">S & A Badminton Academy</strong> was established with a singular mission: to provide world-class, injury-safe badminton coaching to aspiring athletes in Kerala, removing the gap between recreational play and international-standard athletic development.
            </p>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Over the last decade, we have expanded from a single arena in Kadavanthra to three flagship facilities across Kochi—training over {ACADEMY_DATA.stats.studentsTrained} students ranging from 5-year-old beginners to Kerala State ranking champions and corporate fitness athletes.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Affiliated with District Associations
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                BWF Certified Coaches Only
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Sprung Wooden Subflooring
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-square border border-slate-700 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop"
                alt="S&A Badminton Academy Court Arena in Kochi"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#090D16]/90 backdrop-blur-md border border-slate-800">
                <div className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Facility Standard
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  14 BWF-Approved Courts Across 3 Kochi Hubs
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Philosophy & Pillars */}
        <div className="mb-20 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Our Core Coaching Pillars
            </h2>
            <p className="text-slate-400 text-sm">
              We believe great badminton players are shaped by proper biomechanics, character discipline, and progressive physical conditioning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Injury-Free Biomechanics</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Badminton places immense demand on knees, ankles, and shoulders. We pair shock-absorbing sprung wooden court surfaces with proper kinetic chain stroke mechanics so athletes can train intensively without joint injury.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Structured Progression</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                No child or beginner is thrown into random matches. Every student follows a documented curriculum progressing through 4 defined stages: grip, 6-corner footwork, stroke repetition, and situational match play.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111827] border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Character & Sportsmanship</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Sports build life habits. We cultivate mental resilience, punctuality, humility in victory, and analytical composure in defeat—qualities that empower students far beyond the boundary lines.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Statistics Strip */}
      <TrustStats />

      {/* Closing Call to Action */}
      <FinalCTA />
    </div>
  );
}
