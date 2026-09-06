import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Activity, MapPin, Trophy } from "lucide-react";

const WHY_PILLARS = [
  {
    num: "01",
    title: "Expert Coaching",
    subtitle: "Technical training & structured progression",
    description: "Every athlete is coached with proper stroke mechanics, racquet grip transitions, and kinetic energy transfer, ensuring rapid improvement without repetitive stress injuries.",
    icon: ShieldCheck,
  },
  {
    num: "02",
    title: "Player Development",
    subtitle: "Footwork, strokes, movement & fitness",
    description: "From 6-corner court agility and shadow drills to explosive vertical jump smashes and situational match play, our curriculum develops complete, intelligent athletes.",
    icon: Activity,
  },
  {
    num: "03",
    title: "Three Kochi Locations",
    subtitle: "Kadavanthra · Edappally · Kakkanad",
    description: "Train at full-scale arenas across Central, North, and East Kochi. Featuring international BWF-standard synthetic court mats laid over shock-absorbing wooden subfloors.",
    icon: MapPin,
  },
  {
    num: "04",
    title: "Beginner to Competitive",
    subtitle: "Programs designed around player level",
    description: "Dedicated batch cohorts for kids (ages 5–9), junior development (ages 10–16), adult corporate fitness, and elite tournament ranking squads.",
    icon: Trophy,
  },
];

export function WhySA() {
  return (
    <section className="py-20 lg:py-28 bg-[#0E141B] relative border-b border-[#26313D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#B8F000]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#B8F000]">
                WHY S & A BADMINTON
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight uppercase leading-tight">
              Built For Players Who <br className="hidden sm:inline" />
              <span className="text-[#B8F000]">Want To Improve.</span>
            </h2>
          </div>

          <p className="text-sm sm:text-base text-[#A7B0BC] max-w-md leading-relaxed">
            We don’t just rent courts — we systematically cultivate badminton athletes through sports science, qualified coaching pedigree, and modern training infrastructure.
          </p>
        </div>

        {/* 4 Large Editorial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {WHY_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.num}
                className="sports-card p-7 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-2xl font-black text-[#26313D] group-hover:text-[#B8F000] transition-colors">
                      {pillar.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#080B10] border border-[#26313D] flex items-center justify-center text-[#B8F000]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#B8F000] transition-colors">
                    {pillar.title}
                  </h3>

                  <div className="text-xs font-semibold text-[#A7B0BC] mt-1 mb-3">
                    {pillar.subtitle}
                  </div>

                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#26313D]/60 text-[11px] font-bold text-[#A7B0BC] flex items-center gap-1">
                  <span>Standard at all branches</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Visual Band: Training Photograph + Facility Note */}
        <div className="rounded-3xl bg-[#121A23] border border-[#26313D] overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10">
          <div className="lg:col-span-6 relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#080B10] border border-[#26313D]">
            <Image
              src="/images/training-coach.jpg"
              alt="S&A Badminton Academy coach training student on court"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="lg:col-span-6 space-y-5 text-left">
            <span className="text-xs font-bold text-[#B8F000] uppercase tracking-wider">
              Training Standards
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              BWF-Standard Synthetic Courts on Sprung Wood
            </h3>
            <p className="text-sm text-[#A7B0BC] leading-relaxed">
              Badminton involves sudden lunges and high-impact decelerations that place intense strain on player knees and ankles. All our courts across Kadavanthra, Edappally, and Kakkanad feature multi-layer shock-absorbing wooden subfloors, reducing joint impact by over 50% compared to concrete or tile floors.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#B8F000] hover:text-[#c7fb1e] transition-colors"
              >
                <span>View All Training Programs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
