import React from "react";
import Link from "next/link";
import { Star, Quote, ArrowRight, CheckCircle } from "lucide-react";
import { TESTIMONIALS } from "@/data/testimonials";

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#080B10] relative border-b border-[#26313D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#B8F000]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#B8F000]">
                STUDENT & PARENT REVIEWS
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight uppercase leading-tight">
              Trusted by Badminton Families in Kochi
            </h2>
            <p className="text-[#A7B0BC] text-sm sm:text-base leading-relaxed">
              Real feedback from junior parents, amateur adult players, and tournament contenders across our Kadavanthra, Edappally, and Kakkanad facilities.
            </p>
          </div>

          <Link
            href="/testimonials"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#B8F000] hover:text-[#c7fb1e] uppercase tracking-wider group shrink-0"
          >
            <span>All Reviews</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="sports-card p-6 sm:p-7 flex flex-col justify-between text-left group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-[#B8F000] fill-[#B8F000]" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-[#26313D] group-hover:text-[#B8F000]/40 transition-colors" />
                </div>

                <div className="text-sm font-bold text-[#F8FAFC] mb-2">
                  &ldquo;{item.highlight}&rdquo;
                </div>

                <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed italic">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-6 pt-4 border-t border-[#26313D]/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#080B10] text-[#B8F000] border border-[#26313D] font-bold text-xs flex items-center justify-center shrink-0">
                  {item.avatarText}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1">
                    <span>{item.name}</span>
                    <CheckCircle className="w-3 h-3 text-[#22C55E]" />
                  </div>
                  <div className="text-[11px] text-[#6B7280]">{item.role}</div>
                  <div className="text-[10px] text-[#B8F000] font-medium">{item.branch}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
