import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Clock, Users, Calendar, Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { PROGRAMS } from "@/data/programs";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = createMetadata({
  title: "Badminton Coaching Programs in Kochi | Kids, Juniors, Adults & Pros",
  description: "Explore all badminton training programs at S & A Badminton Academy Kochi. Structured coaching for kids (ages 5-9), junior development, adult fitness, competitive squad, and holiday camps.",
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
    <div className="py-8 sm:py-12 bg-[#090D16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ name: "Training Programs", url: "/programs" }]} />

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            All Academy Programs
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Coaching Programs Tailored to Every Skill Level & Age Group
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Whether your goal is recreational fitness, technical stroke perfection, or national ranking tournament titles, our certified coaching faculty provides a structured training home.
          </p>
        </div>

        {/* Program Cards Listing */}
        <div className="space-y-12 mb-20">
          {PROGRAMS.map((program, idx) => (
            <div
              key={program.slug}
              className="rounded-3xl bg-[#111827] border border-slate-800 hover:border-emerald-500/40 p-6 sm:p-8 lg:p-10 transition-all duration-300 shadow-xl overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left: Program Visual */}
                <div className={`lg:col-span-5 relative ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-slate-700 shadow-lg">
                    <Image
                      src={program.image}
                      alt={`${program.name} badminton coaching Kochi`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-transparent opacity-80" />

                    <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-[#090D16]/85 backdrop-blur-md border border-slate-700 text-white text-xs font-extrabold">
                      {program.badge}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#090D16]/85 backdrop-blur-md border border-slate-800">
                      <div className="text-xs font-bold text-white">{program.tagline}</div>
                    </div>
                  </div>
                </div>

                {/* Right: Program Copy & Specs */}
                <div className={`lg:col-span-7 space-y-5 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-xs">
                      {program.skillLevel}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                      Age: {program.targetAge}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {program.name}
                  </h2>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {program.shortDescription}
                  </p>

                  {/* Program Meta Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                      <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Duration</span>
                      </div>
                      <div className="font-bold text-white truncate">{program.duration}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                      <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Ratio</span>
                      </div>
                      <div className="font-bold text-white truncate">{program.batchRatio}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                      <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>Batches</span>
                      </div>
                      <div className="font-bold text-white truncate">Morning & Evening</div>
                    </div>
                  </div>

                  {/* Top 3 Benefits */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Key Highlights:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      {program.benefits.slice(0, 4).map((benefit, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-800">
                    <Link
                      href={`/programs/${program.slug}`}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#090D16] text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-500/20"
                    >
                      <span>Full Curriculum & Schedule</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <a
                      href={buildWhatsAppUrl({ programName: program.name })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                    >
                      <span>Enquire on WhatsApp</span>
                    </a>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Final Call to Action */}
      <FinalCTA />
    </div>
  );
}
