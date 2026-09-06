import React from "react";
import { ShieldCheck, Video, Activity, Users, Flame, Trophy } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "BWF Grade-1 Shock-Absorbing Courts",
    description: "Every court at Kadavanthra, Edappally, and Kakkanad features multi-layer synthetic court mats laid over sprung teakwood timber, absorbing 60% of vertical shock to protect player joints.",
    tag: "Joint Safety"
  },
  {
    icon: Video,
    title: "Biomechanical HD Video Stroke Analysis",
    description: "Our coaching rooms feature multi-angle slow-motion camera rigs to inspect racket head speed, kinetic rotation, and footwork recovery frame-by-frame.",
    tag: "Tech-Driven"
  },
  {
    icon: Users,
    title: "Strict 1:6 to 1:8 Coach-Student Ratio",
    description: "We cap court occupancy to guarantee that every athlete receives personalized tactical feedback and continuous multi-shuttle drill feeds without long waiting queues.",
    tag: "High Attention"
  },
  {
    icon: Activity,
    title: "Certified Strength & Agility Conditioning",
    description: "On-court physical conditioning designed by certified trainers, developing explosive vertical jump smash power, lateral agility, core stability, and cardio stamina.",
    tag: "Athletic Fitness"
  },
  {
    icon: Flame,
    title: "Age-Specific Structured Pedagogy",
    description: "Tailored curriculums: Fun motor-skill games for kids 5–9, stroke mastery for juniors 10–16, cardio biomechanics for adults, and pro drilling for competitive athletes.",
    tag: "Scientific Roadmap"
  },
  {
    icon: Trophy,
    title: "Official District & State Association Backing",
    description: "Registered academy athletes receive direct association affiliation, tournament seeding assistance, and courtside coach accompaniment at district and state championships.",
    tag: "Podium Track"
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-[#090D16] relative border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Why S & A Badminton Academy
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Athletic Excellence & Player Development
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            We don’t just rent courts — we systematically build athletes through sports science, certified coaching pedigree, and premier badminton infrastructure.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative p-6 rounded-2xl bg-[#111827]/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-[#162035]/80 transition-all duration-300 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-[#090D16] transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/80 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center text-xs font-medium text-slate-500 group-hover:text-emerald-400 transition-colors">
                  <span>Standard at all 3 Kochi branches</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
