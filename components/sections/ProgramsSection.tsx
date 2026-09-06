"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Clock, Users, Calendar, MessageCircle } from "lucide-react";
import { PROGRAMS } from "@/data/programs";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

export function ProgramsSection() {
  const [activeTab, setActiveTab] = useState(PROGRAMS[0].slug);

  const selectedProgram = PROGRAMS.find((p) => p.slug === activeTab) || PROGRAMS[0];

  const handleProgramWhatsApp = (programName: string) => {
    trackEvent("program_enquiry", { program: programName, source: "homepage_tabs" });
  };

  return (
    <section className="py-20 lg:py-28 bg-[#0E141B] relative border-b border-[#26313D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#B8F000]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#B8F000]">
                TRAINING PROGRAMS
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight uppercase leading-tight">
              Structured Coaching for Every Age & Ambition
            </h2>
            <p className="text-[#A7B0BC] text-sm sm:text-base leading-relaxed">
              From children taking their first court steps to corporate fitness players and state ranking tournament contenders.
            </p>
          </div>

          <Link
            href="/programs"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#B8F000] hover:text-[#c7fb1e] uppercase tracking-wider group shrink-0"
          >
            <span>Compare All Programs</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {PROGRAMS.map((program) => {
            const isActive = activeTab === program.slug;
            return (
              <button
                key={program.slug}
                onClick={() => setActiveTab(program.slug)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 border cursor-pointer ${
                  isActive
                    ? "bg-[#B8F000] text-[#07100A] border-[#B8F000] shadow-sm"
                    : "bg-[#121A23] text-[#A7B0BC] border-[#26313D] hover:border-[#374758] hover:text-[#F8FAFC]"
                }`}
              >
                {program.shortName} ({program.badge})
              </button>
            );
          })}
        </div>

        {/* Featured Program Showcase Card */}
        <div className="sports-card p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Program Copy & Highlights */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-md bg-[#B8F000]/10 text-[#B8F000] font-bold text-xs uppercase tracking-wider border border-[#B8F000]/20">
                  {selectedProgram.badge}
                </span>
                <span className="px-3 py-1 rounded-md bg-[#080B10] text-[#A7B0BC] text-xs font-semibold border border-[#26313D]">
                  {selectedProgram.skillLevel}
                </span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
                {selectedProgram.name}
              </h3>

              <p className="text-[#A7B0BC] text-sm sm:text-base leading-relaxed">
                {selectedProgram.fullDescription}
              </p>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-1">
                <div className="p-3.5 rounded-xl bg-[#080B10] border border-[#26313D]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span>Duration</span>
                  </div>
                  <div className="text-xs font-bold text-[#F8FAFC] truncate">{selectedProgram.duration}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080B10] border border-[#26313D]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-1">
                    <Users className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span>Coach Ratio</span>
                  </div>
                  <div className="text-xs font-bold text-[#F8FAFC] truncate">{selectedProgram.batchRatio}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080B10] border border-[#26313D]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span>Batches</span>
                  </div>
                  <div className="text-xs font-bold text-[#F8FAFC] truncate">Morning & Evening</div>
                </div>
              </div>

              {/* Key Benefits List */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold uppercase tracking-wider text-[#A7B0BC]">
                  Core Outcomes:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#A7B0BC]">
                  {selectedProgram.benefits.slice(0, 4).map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#B8F000] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Standardized Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#26313D]">
                <Link
                  href={`/programs/${selectedProgram.slug}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#B8F000] hover:bg-[#c7fb1e] text-[#07100A] text-xs font-extrabold flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Explore Program Curriculum</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={buildWhatsAppUrl({ programName: selectedProgram.name })}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleProgramWhatsApp(selectedProgram.name)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#080B10] hover:bg-[#17212C] text-[#F8FAFC] text-xs font-semibold flex items-center justify-center gap-2 border border-[#26313D] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                  <span>WhatsApp Us</span>
                </a>
              </div>
            </div>

            {/* Right: Media Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-square border border-[#26313D] shadow-xl bg-[#080B10]">
                <Image
                  src={selectedProgram.image}
                  alt={`${selectedProgram.name} badminton training in Kochi`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-transparent to-transparent opacity-80" />

                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-[#080B10]/90 backdrop-blur-md border border-[#26313D] text-left">
                  <div className="text-xs font-bold text-[#F8FAFC]">{selectedProgram.tagline}</div>
                  <div className="text-[11px] text-[#B8F000] font-medium mt-0.5">
                    Kadavanthra · Edappally · Kakkanad
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
