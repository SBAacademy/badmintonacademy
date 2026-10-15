"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MessageSquare, ArrowRight } from "lucide-react";
import { Testimonial } from "@/data/testimonials";

// Configurable Autoplay Interval in Milliseconds (5.5 seconds per slide)
const AUTOPLAY_INTERVAL = 5500;

interface ReviewsSliderSectionProps {
  initialReviews?: Testimonial[];
}

export function ReviewsSliderSection({ initialReviews }: ReviewsSliderSectionProps) {
  const [reviews, setReviews] = useState<Testimonial[]>(() => {
    if (initialReviews && initialReviews.length > 0) {
      return initialReviews.filter((r: any) => r.status === "APPROVED" || r.isApproved === true || (r.status !== "PENDING" && r.isApproved !== false));
    }
    return [];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Client-side refresh from API to catch newly approved reviews
  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) return;

    fetch("/api/content/testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          const approved = data.items.filter((r: any) => r.status === "APPROVED" || r.isApproved === true || (r.status !== "PENDING" && r.isApproved !== false));
          if (approved.length > 0) {
            setReviews(approved);
          }
        }
      })
      .catch(() => {});
  }, [initialReviews]);

  const total = reviews.length;

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Continuous Autoplay Timer
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [total, isPaused, handleNext]);

  // Mobile Touch Gestures (Swipe Left / Right)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (total === 0) {
    return null;
  }

  const current = reviews[currentIndex] || reviews[0];

  return (
    <section 
      className="py-20 lg:py-28 bg-[#07090D] relative border-t border-[#1F2937] overflow-hidden select-none"
      aria-label="Student & Parent Reviews Slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Eyebrow & Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#1F2937]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
                10 // VOICES
              </span>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
                COMMUNITY EXPERIENCES
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-[-0.03em] uppercase leading-[0.95]">
              ATHLETE &amp; PARENT <br />
              <span className="text-[#B8F000]">REVIEWS.</span>
            </h2>
          </div>

          {/* Navigation Controls & Progress */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              className="w-10 h-10 bg-[#0B0F14] hover:bg-[#11161D] border border-[#1F2937] hover:border-[#B8F000] text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-mono text-xs text-[#A8B0BA] px-1 select-none">
              <span className="text-[#B8F000] font-bold">{String(currentIndex + 1).padStart(2, "0")}</span>
              <span className="text-slate-600"> / </span>
              <span>{String(total).padStart(2, "0")}</span>
            </span>

            <button
              type="button"
              onClick={handleNext}
              className="w-10 h-10 bg-[#0B0F14] hover:bg-[#11161D] border border-[#1F2937] hover:border-[#B8F000] text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Next review"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Slider Stage */}
        <div className="relative pt-10 sm:pt-12">
          {/* Main Slide Card */}
          <div className="bg-[#0B0F14] border border-[#1F2937] p-8 sm:p-12 relative overflow-hidden transition-all duration-300">
            {/* Subtle background quotation icon accent */}
            <div className="absolute top-4 right-6 text-[#1F2937]/30 pointer-events-none select-none">
              <MessageSquare className="w-24 h-24 sm:w-32 sm:h-32 stroke-[1]" />
            </div>

            <div className="relative z-10 max-w-4xl space-y-6 text-left">
              {/* Review Content */}
              <blockquote className="text-xl sm:text-2xl lg:text-3xl font-medium text-white leading-relaxed break-words">
                &ldquo;{current.content}&rdquo;
              </blockquote>

              {/* Attribution: Name & Centre Only (Strictly No Ratings/Badges) */}
              <div className="pt-6 border-t border-[#1F2937] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                    {current.name}
                  </h3>
                  <div className="text-xs font-mono text-[#B8F000] uppercase tracking-wider">
                    {current.branch || "S&A Badminton Academy"}
                  </div>
                </div>

                <Link
                  href="/testimonials"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#A8B0BA] hover:text-white uppercase transition-colors self-start sm:self-auto"
                >
                  <span>ALL REVIEWS</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B8F000]" />
                </Link>
              </div>
            </div>
          </div>

          {/* Stepper Progress Indicator */}
          {total > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-6">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1 transition-all duration-300 cursor-pointer ${
                    idx === currentIndex
                      ? "w-8 bg-[#B8F000]"
                      : "w-2 bg-[#1F2937] hover:bg-slate-700"
                  }`}
                  aria-label={`Jump to review ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
