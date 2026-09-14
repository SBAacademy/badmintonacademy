"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Camera,
  CheckCircle2,
} from "lucide-react";
import { CoachPhoto, DEFAULT_COACH_IMAGE } from "@/data/coaches";

interface CoachPhotoGalleryProps {
  photos?: CoachPhoto[];
  images?: string[];
  fallbackImage?: string;
  name: string;
  role?: string;
  experienceYears?: number;
}

export function CoachPhotoGallery({
  photos = [],
  images = [],
  fallbackImage,
  name,
  role,
  experienceYears,
}: CoachPhotoGalleryProps) {
  // Normalize photo URLs
  const photoUrls: string[] = React.useMemo(() => {
    if (photos && photos.length > 0) {
      // Primary photo first, then remaining in sortOrder
      const sorted = [...photos].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
      return sorted.map((p) => p.imageUrl).filter(Boolean);
    }
    if (images && images.length > 0) {
      return images.filter(Boolean);
    }
    if (fallbackImage && fallbackImage.trim()) {
      return [fallbackImage.trim()];
    }
    return [DEFAULT_COACH_IMAGE];
  }, [photos, images, fallbackImage]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const totalPhotos = photoUrls.length;
  const currentPhoto = photoUrls[currentIndex] || DEFAULT_COACH_IMAGE;

  const nextPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalPhotos);
  }, [totalPhotos]);

  const prevPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  }, [totalPhotos]);

  // Keyboard navigation for lightbox & gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen && totalPhotos <= 1) return;
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "Escape" && isLightboxOpen) setIsLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, nextPhoto, prevPhoto, totalPhotos]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextPhoto();
      } else {
        prevPhoto();
      }
    }
    setTouchStartX(null);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Main Athletic Portrait Container */}
      <div
        className="relative aspect-[3/4] w-full max-w-md mx-auto bg-[#0B0F14] border-2 border-[#1F2937] overflow-hidden group shadow-2xl transition-all"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={currentPhoto}
          alt={`${name} - Photo ${currentIndex + 1}`}
          fill
          priority={currentIndex === 0}
          className="object-cover object-top transition-all duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 1024px) 100vw, 40vw"
          unoptimized
        />

        {/* Top Athletic Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {experienceYears !== undefined && (
            <span className="px-2.5 py-1 bg-[#07090D]/90 backdrop-blur-md border border-[#1F2937] font-mono text-[10px] text-[#B8F000] uppercase font-bold tracking-wider">
              {experienceYears}+ YEARS EXPERIENCE
            </span>
          )}
          <span className="px-2.5 py-1 bg-emerald-950/90 border border-emerald-500/50 font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Verified Faculty</span>
          </span>
        </div>

        {/* Multi-Photo Counter Overlay (if multiple photos) */}
        {totalPhotos > 1 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2 py-1 bg-[#07090D]/90 backdrop-blur-md border border-[#1F2937] font-mono text-[10px] text-white flex items-center gap-1 font-bold">
              <Camera className="w-3 h-3 text-[#B8F000]" />
              <span>
                {currentIndex + 1} / {totalPhotos}
              </span>
            </span>
          </div>
        )}

        {/* Lightbox Trigger Button */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-3 right-3 p-2 bg-[#07090D]/90 hover:bg-[#11161D] border border-[#1F2937] hover:border-[#B8F000] text-white hover:text-[#B8F000] transition-colors z-10 cursor-pointer opacity-90 group-hover:opacity-100"
          title="Open fullscreen photo view"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Left / Right Chevrons (if multiple photos) */}
        {totalPhotos > 1 && (
          <>
            <button
              type="button"
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-[#07090D]/80 hover:bg-[#07090D] border border-[#1F2937] text-white hover:text-[#B8F000] transition-all opacity-80 hover:opacity-100 cursor-pointer z-10"
              title="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#07090D]/80 hover:bg-[#07090D] border border-[#1F2937] text-white hover:text-[#B8F000] transition-all opacity-80 hover:opacity-100 cursor-pointer z-10"
              title="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Strip (Only visible when > 1 photo exists) */}
      {totalPhotos > 1 && (
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {photoUrls.map((url, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-16 h-20 shrink-0 border overflow-hidden transition-all cursor-pointer ${
                    isActive
                      ? "border-2 border-[#B8F000] ring-2 ring-[#B8F000]/30 scale-105"
                      : "border-[#1F2937] opacity-60 hover:opacity-100"
                  }`}
                  title={`View photo ${idx + 1}`}
                >
                  <Image
                    src={url}
                    alt={`${name} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover object-top"
                    sizes="64px"
                    unoptimized
                  />
                  {idx === 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-[#07090D]/90 font-mono text-[8px] text-[#B8F000] font-bold text-center uppercase py-0.5">
                      Main
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Dot Indicators */}
          <div className="flex items-center justify-center gap-1.5 pt-2 sm:hidden">
            {photoUrls.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? "w-5 bg-[#B8F000]"
                    : "w-1.5 bg-[#1F2937] hover:bg-[#374151]"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between text-white font-mono text-xs z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span className="text-[#B8F000] font-bold uppercase">{name}</span>
              {role && <span className="text-[#6B7280] ml-2">// {role}</span>}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[#A8B0BA]">
                {currentIndex + 1} of {totalPhotos}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-1.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-white hover:text-[#B8F000] cursor-pointer"
                title="Close fullscreen view"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Image */}
          <div
            className="relative flex-1 my-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full max-h-[80vh] max-w-3xl">
              <Image
                src={currentPhoto}
                alt={`${name} full view`}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
                unoptimized
              />
            </div>

            {/* Navigation arrows in Lightbox */}
            {totalPhotos > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevPhoto}
                  className="absolute left-2 sm:left-4 p-3 bg-[#07090D]/80 hover:bg-[#07090D] border border-[#1F2937] text-white hover:text-[#B8F000] transition-colors cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={nextPhoto}
                  className="absolute right-2 sm:right-4 p-3 bg-[#07090D]/80 hover:bg-[#07090D] border border-[#1F2937] text-white hover:text-[#B8F000] transition-colors cursor-pointer"
                  title="Next"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails in Lightbox */}
          {totalPhotos > 1 && (
            <div
              className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {photoUrls.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-12 h-16 shrink-0 border overflow-hidden cursor-pointer transition-all ${
                    idx === currentIndex
                      ? "border-2 border-[#B8F000] scale-105"
                      : "border-[#1F2937] opacity-50 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
