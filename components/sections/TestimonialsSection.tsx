"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS, Testimonial } from "@/data/testimonials";

export function TestimonialsSection({ initialTestimonials }: { initialTestimonials?: Testimonial[] }) {
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials || TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState(0);

  React.useEffect(() => {
    fetch("/api/content/testimonials")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.items)) {
          setItems(d.items);
        }
      })
      .catch(() => {});
  }, []);

  const currentItem = items[currentIndex] || items[0] || TESTIMONIALS[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  return (
    <section 
      className="py-24 lg:py-36 bg-[#07090D] relative border-b border-[#1F2937] select-none"
      aria-label="Editorial Testimonials"
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Eyebrow */}
        <div className="flex items-center justify-between pb-12 sm:pb-16 border-b border-[#1F2937]">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
              08 // VOICES
            </span>
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
              VERIFIED ATHLETE &amp; PARENT FEEDBACK
            </span>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="w-10 h-10 bg-[#11161D] border border-[#1F2937] hover:border-[#B8F000] text-white flex items-center justify-center transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-[#A8B0BA] px-2">
              {String(currentIndex + 1).padStart(2, "0")} / {String(items.length || 1).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="w-10 h-10 bg-[#11161D] border border-[#1F2937] hover:border-[#B8F000] text-white flex items-center justify-center transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Large Editorial Magazine Quote Composition */}
        <div className="pt-12 sm:pt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Colossal Magazine Quote */}
          <div className="lg:col-span-8 space-y-6 text-left">
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight leading-tight">
              &ldquo;{currentItem.content}&rdquo;
            </blockquote>
          </div>

          {/* Right: Attribution Card */}
          <div className="lg:col-span-4 bg-[#0B0F14] border border-[#1F2937] p-6 sm:p-8 space-y-4 text-left">
            <div className="space-y-1 border-b border-[#1F2937] pb-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                {currentItem.name}
              </h3>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-[#A8B0BA]">
                <span>CENTRE:</span>
                <span className="text-white font-bold">{currentItem.branch}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/testimonials"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#B8F000] hover:text-white uppercase transition-colors"
              >
                <span>READ ALL REVIEWS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
