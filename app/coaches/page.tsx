import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Award, ShieldCheck, MapPin, CheckCircle2, Star } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { COACHES } from "@/data/coaches";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = createMetadata({
  title: "Certified Badminton Coaches in Kochi | BWF & NIS Mentors",
  description: "Meet the elite coaching panel at S & A Badminton Academy Kochi. BWF Level 1 & 2 certified trainers, NIS diploma holders, and former state champions.",
  path: "/coaches",
  keywords: [
    "badminton coaches in Kochi",
    "BWF certified badminton coach",
    "NIS badminton coach Kerala",
    "badminton training mentor",
  ],
});

export default function CoachesPage() {
  return (
    <div className="py-8 sm:py-12 bg-[#090D16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ name: "Coaches & Mentors", url: "/coaches" }]} />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Faculty & Mentors
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Learn from Certified Mentors & State Champions
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Our coaching team brings decades of tournament experience, official BWF certifications, and child sports psychology credentials to every training session.
          </p>
        </div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {COACHES.map((coach) => (
            <div
              key={coach.id}
              className="rounded-3xl bg-[#111827] border border-slate-800 hover:border-emerald-500/40 p-6 sm:p-8 transition-all duration-300 shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                    <Image
                      src={coach.image}
                      alt={`${coach.name} coach`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="112px"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <Award className="w-3.5 h-3.5" />
                      <span>{coach.experienceYears}+ Years Experience</span>
                    </div>
                    <h2 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {coach.name}
                    </h2>
                    <div className="text-xs font-semibold text-slate-300">
                      {coach.role}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{coach.primaryBranch}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {coach.bio}
                </p>

                {/* Certifications */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Certifications & Accreditations:
                  </div>
                  <div className="space-y-1">
                    {coach.certifications.map((cert, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-2 text-xs text-slate-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notable Achievements */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Key Athletic Career Milestones:
                  </div>
                  <div className="space-y-1">
                    {coach.achievements.map((ach, aIdx) => (
                      <div key={aIdx} className="flex items-start gap-2 text-xs text-slate-400">
                        <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Specialization: <strong className="text-emerald-400">{coach.specialization}</strong></span>
              </div>
            </div>
          ))}
        </div>

      </div>

      <FinalCTA />
    </div>
  );
}
