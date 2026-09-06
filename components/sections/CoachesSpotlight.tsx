import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, ShieldCheck, MapPin } from "lucide-react";
import { COACHES } from "@/data/coaches";

export function CoachesSpotlight() {
  return (
    <section className="py-20 lg:py-28 bg-[#0E141B] relative border-b border-[#26313D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#B8F000]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#B8F000]">
                FACULTY & MENTORS
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight uppercase leading-tight">
              Trained by Certified Mentors & State Champions
            </h2>
            <p className="text-[#A7B0BC] text-sm sm:text-base leading-relaxed">
              Our coaching panel features BWF-certified coaches, NIS diploma graduates, and former state champions dedicated to player safety and technical perfection.
            </p>
          </div>

          <Link
            href="/coaches"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#B8F000] hover:text-[#c7fb1e] uppercase tracking-wider group shrink-0"
          >
            <span>Full Coach Roster</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Coach Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COACHES.map((coach) => (
            <div
              key={coach.id}
              className="sports-card overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Photo with Dark Overlay */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#080B10]">
                  <Image
                    src={coach.image}
                    alt={`${coach.name} - ${coach.role}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121A23] via-transparent to-transparent opacity-90" />

                  {/* Experience Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#080B10]/85 backdrop-blur-md border border-[#26313D] text-[#F8FAFC] text-[11px] font-bold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span>{coach.experienceYears}+ Yrs Exp</span>
                  </div>

                  {/* Branch Tag */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1 text-[11px] font-semibold text-[#B8F000]">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{coach.primaryBranch}</span>
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-5 space-y-3 text-left">
                  <div>
                    <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-[#B8F000] transition-colors">
                      {coach.name}
                    </h3>
                    <div className="text-xs font-semibold text-[#A7B0BC] mt-0.5">
                      {coach.role}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-1">
                    {coach.certifications.slice(0, 2).map((cert, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-1.5 text-[11px] text-[#A7B0BC]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#B8F000] shrink-0" />
                        <span className="truncate">{cert}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-[#6B7280] line-clamp-3 leading-relaxed pt-1">
                    {coach.bio}
                  </p>
                </div>
              </div>

              {/* Bottom Specialization Footer */}
              <div className="px-5 py-3 bg-[#080B10] border-t border-[#26313D] text-[11px] text-[#6B7280] font-medium text-left">
                Specialization: <span className="text-[#A7B0BC]">{coach.specialization}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
