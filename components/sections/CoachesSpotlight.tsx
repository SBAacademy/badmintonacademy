import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Camera } from "lucide-react";
import { COACHES, Coach } from "@/data/coaches";
import { getCoaches } from "@/lib/contentDb";

export async function CoachesSpotlight({ initialCoaches }: { initialCoaches?: Coach[] }) {
  const coaches = initialCoaches || (await getCoaches());
  return (
    <section 
      className="py-24 lg:py-36 bg-[#07090D] relative border-b border-[#1F2937] select-none"
      aria-label="Coaching Faculty"
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Eyebrow & Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 sm:pb-16 border-b border-[#1F2937]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
                06 // MENTORS
              </span>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
                COACHING PEDIGREE
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.03em] uppercase leading-[0.95]">
              COACHING THAT <br />
              <span className="text-[#B8F000]">BUILDS PLAYERS.</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href="/coaches"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#B8F000] hover:text-white uppercase transition-colors"
            >
              <span>VIEW FULL FACULTY ROSTER</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Editorial Coaches Grid: Large Portraits + Asymmetric Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
          {coaches.slice(0, 4).map((coach, idx) => (
            <Link
              key={coach.id}
              href={`/coaches/${coach.slug || coach.id}`}
              className="bg-[#0B0F14] border border-[#1F2937] flex flex-col justify-between group transition-colors hover:border-[#B8F000]/50 block cursor-pointer"
            >
              <div>
                {/* Large Editorial Portrait */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#07090D]">
                  <Image
                    src={coach.image || "/images/training-coach.jpg"}
                    alt={`${coach.name} - ${coach.role}`}
                    fill
                    className="object-cover object-top filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-transparent opacity-90" />
                  
                  {/* Monospace Index Overlay */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 bg-[#07090D]/90 border border-[#1F2937] font-mono text-[10px] font-bold text-[#B8F000]">
                    0{coach.displayOrder || idx + 1} // {coach.experienceYears}Y EXP
                  </div>

                  {/* Multi-Photo Indicator */}
                  {coach.photos && coach.photos.length > 1 && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#07090D]/90 border border-[#1F2937] font-mono text-[9px] text-[#B8F000] font-bold flex items-center gap-1">
                      <Camera className="w-2.5 h-2.5" />
                      <span>{coach.photos.length}</span>
                    </div>
                  )}

                  {/* Branch Tag */}
                  <div className="absolute bottom-3 left-4 right-4 text-left font-mono text-[10px] uppercase text-[#B8F000] tracking-wider truncate">
                    {coach.primaryBranch}
                  </div>
                </div>

                {/* Information Details */}
                <div className="p-5 space-y-3 text-left">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-[#B8F000] transition-colors">
                      {coach.name}
                    </h3>
                    <div className="text-xs font-mono text-[#A8B0BA] uppercase mt-0.5">
                      {coach.role}
                    </div>
                  </div>

                  {/* Verified Credentials */}
                  <div className="space-y-1 pt-1 border-t border-[#1F2937]">
                    {coach.certifications.slice(0, 2).map((cert, cIdx) => (
                      <div key={cIdx} className="flex items-start gap-1.5 text-[11px] text-[#A8B0BA] leading-tight">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#B8F000] shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{cert}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-[#A8B0BA] line-clamp-2 leading-relaxed pt-1">
                    {coach.bio}
                  </p>
                </div>
              </div>

              {/* Bottom Specialization Line */}
              <div className="p-4 bg-[#07090D] border-t border-[#1F2937] text-left font-mono text-[10px] text-[#A8B0BA] tracking-wider uppercase truncate flex items-center justify-between">
                <span>FOCUS: <span className="text-white">{coach.specialization}</span></span>
                <span className="text-[#B8F000] group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
