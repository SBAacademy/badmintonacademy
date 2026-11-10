import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, ShieldCheck, MapPin, ArrowRight, Camera } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = createMetadata({
  title: "Certified Badminton Coaches in Kochi | BWF & NIS Mentors",
  description: "Meet the elite coaching panel at SBA Badminton Academy Kochi. BWF Level 1 & 2 certified trainers, NIS diploma holders, and former state champions.",
  path: "/coaches",
  keywords: [
    "badminton coaches in Kochi",
    "BWF certified badminton coach",
    "NIS badminton coach Kerala",
    "badminton training mentor",
  ],
});

import { getCoaches } from "@/lib/contentDb";

export const revalidate = 60;

export default async function CoachesPage() {
  const coaches = await getCoaches();

  return (
    <div className="bg-[#07090D] min-h-screen text-white select-none">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ name: "Coaches & Mentors", url: "/coaches" }]} />

        {/* Rebel Hero */}
        <div className="pt-8 pb-16 border-b border-[#1F2937] space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
              FACULTY // MENTORS
            </span>
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
              COACHING PEDIGREE
            </span>
          </div>

          <h1 className="text-[clamp(2.8rem,7vw,6rem)] font-black uppercase tracking-[-0.04em] leading-[0.92]">
            COACHING THAT <br />
            <span className="text-[#B8F000]">BUILDS PLAYERS.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#A8B0BA] max-w-2xl font-normal leading-relaxed">
            Our coaching team unites official BWF-certified trainers, NIS diploma holders, and former state champions dedicated to player longevity, biomechanical precision, and competitive grit.
          </p>
        </div>

        {/* Editorial Coach Portraits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-16 border-b border-[#1F2937]">
          {coaches.map((coach, idx) => (
            <div
              key={coach.id}
              className="bg-[#0B0F14] border border-[#1F2937] p-6 sm:p-8 flex flex-col justify-between group hover:border-[#B8F000]/60 transition-colors"
            >
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Portrait */}
                  <Link
                    href={`/coaches/${coach.slug || coach.id}`}
                    className="relative w-28 h-36 sm:w-32 sm:h-40 overflow-hidden bg-[#07090D] shrink-0 border border-[#1F2937] group/img block"
                  >
                    <Image
                      src={coach.image || "/images/training-coach.jpg"}
                      alt={coach.name}
                      fill
                      className="object-cover object-top filter grayscale contrast-125 group-hover:grayscale-0 group-hover/img:scale-105 transition-all duration-300"
                      sizes="130px"
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.2 bg-[#07090D]/90 font-mono text-[9px] text-[#B8F000] font-bold">
                      0{coach.displayOrder || idx + 1}
                    </div>
                    {coach.photos && coach.photos.length > 1 && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-[#07090D]/90 border border-[#1F2937] font-mono text-[8px] text-[#B8F000] font-bold flex items-center gap-1">
                        <Camera className="w-2.5 h-2.5" />
                        <span>{coach.photos.length}</span>
                      </div>
                    )}
                  </Link>

                  {/* Identification */}
                  <div className="space-y-1.5 text-left">
                    <div className="font-mono text-[10px] text-[#B8F000] uppercase tracking-wider font-bold">
                      {coach.experienceYears}+ YEARS EXPERIENCE
                    </div>
                    <Link href={`/coaches/${coach.slug || coach.id}`} className="block">
                      <h2 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-[#B8F000] transition-colors">
                        {coach.name}
                      </h2>
                    </Link>
                    <div className="text-xs font-mono text-[#A8B0BA] uppercase">
                      {coach.role}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#A8B0BA] pt-1 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-[#B8F000] shrink-0" />
                      <span>{coach.primaryBranch}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#A8B0BA] leading-relaxed text-left">
                  {coach.bio}
                </p>

                {/* Verified Certifications (if present) */}
                {Array.isArray(coach.certifications) && coach.certifications.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-[#1F2937] text-left">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#A8B0BA]">
                      VERIFIED ACCREDITATIONS:
                    </div>
                    <div className="space-y-1">
                      {coach.certifications.map((cert, cIdx) => (
                        <div key={cIdx} className="flex items-start gap-2 text-xs text-white">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#B8F000] shrink-0 mt-0.5" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Achievements (if present) */}
                {Array.isArray(coach.achievements) && coach.achievements.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-[#1F2937] text-left">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#A8B0BA]">
                      NOTABLE TRACK RECORD:
                    </div>
                    <div className="space-y-1">
                      {coach.achievements.map((ach, aIdx) => (
                        <div key={aIdx} className="text-xs text-[#A8B0BA] flex items-start gap-2">
                          <span className="text-[#B8F000] font-mono">&bull;</span>
                          <span>{ach}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Specialization & Profile Link Footer */}
              <div className="pt-4 mt-6 border-t border-[#1F2937] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-[11px]">
                <div className="text-left text-[#A8B0BA] uppercase">
                  SPECIALIZATION: <span className="text-white font-bold">{coach.specialization}</span>
                </div>
                <Link
                  href={`/coaches/${coach.slug || coach.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#B8F000] text-[#07090D] font-bold uppercase tracking-wider text-[11px] hover:bg-[#cbf722] transition-colors shrink-0 self-start sm:self-auto"
                >
                  <span>View Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Campaign Ending CTA */}
      <FinalCTA />
    </div>
  );
}
