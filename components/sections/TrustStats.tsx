"use client";

import React from "react";
import { Users, MapPin, Clock, Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ACADEMY_DATA } from "@/data/academy";

const STAT_ITEMS = [
  {
    icon: Users,
    value: ACADEMY_DATA.stats.studentsTrained,
    label: "Athletes Trained",
    detail: "Kids, juniors & adults",
  },
  {
    icon: MapPin,
    value: `${ACADEMY_DATA.stats.branchesCount} Hubs`,
    label: "Training Locations",
    detail: "Kadavanthra · Edappally · Kakkanad",
  },
  {
    icon: ShieldCheck,
    value: "Certified",
    label: "Coaching Mentors",
    detail: "BWF & NIS certified faculty",
  },
  {
    icon: Award,
    value: "14 Courts",
    label: "BWF Synthetic Mats",
    detail: "Sprung wooden subfloors",
  },
  {
    icon: Clock,
    value: ACADEMY_DATA.stats.trainingHoursWeekly,
    label: "Weekly Training",
    detail: "Morning, evening & weekends",
  },
  {
    icon: CheckCircle2,
    value: "100%",
    label: "Structured Pedagogy",
    detail: "Stage-by-stage progression",
  },
];

export function TrustStats() {
  return (
    <section className="py-12 bg-[#080B10] border-b border-[#26313D] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {STAT_ITEMS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#121A23] border border-[#26313D] hover:border-[#374758] transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-[#0E141B] text-[#B8F000] flex items-center justify-center mb-2.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-[#F8FAFC] mt-1">
                  {stat.label}
                </div>
                <div className="text-[11px] text-[#6B7280] mt-0.5">
                  {stat.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
