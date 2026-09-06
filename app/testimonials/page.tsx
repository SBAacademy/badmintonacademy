import React from "react";
import type { Metadata } from "next";
import { Star, Quote, CheckCircle, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { TESTIMONIALS } from "@/data/testimonials";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = createMetadata({
  title: "Parent & Student Reviews | S & A Badminton Academy Kochi",
  description: "Read genuine feedback and parent testimonials about S & A Badminton Academy coaching across Kadavanthra, Edappally, and Kakkanad.",
  path: "/testimonials",
  keywords: [
    "badminton academy reviews Kochi",
    "S&A badminton parent reviews",
    "best badminton coaching feedback",
  ],
});

import { getTestimonials } from "@/lib/contentDb";

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div className="py-8 sm:py-12 bg-[#090D16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ name: "Testimonials & Reviews", url: "/testimonials" }]} />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Verified Feedback
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            What Parents & Athletes Say About S & A Academy
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Real experiences from junior parents, amateur adult players, corporate fitness enthusiasts, and competitive athletes training with us daily.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="p-8 rounded-3xl bg-[#111827] border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between shadow-xl relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-700 group-hover:text-emerald-500/40 transition-colors" />
                </div>

                <div className="text-base font-bold text-white mb-2">
                  &ldquo;{item.highlight}&rdquo;
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-[#090D16] font-bold text-sm flex items-center justify-center shrink-0">
                  {item.avatarText}
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1">
                    <span>{item.name}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                  </div>
                  <div className="text-xs text-slate-400">{item.role}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">{item.branch}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <FinalCTA />
    </div>
  );
}
