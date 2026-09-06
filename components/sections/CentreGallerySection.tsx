"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Camera,
  Maximize2,
} from "lucide-react";
import { GalleryItem, GALLERY_ITEMS } from "@/data/gallery";

interface CentreGallerySectionProps {
  branchSlug?: string;
  branchName?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  initialItems?: GalleryItem[];
}

export function CentreGallerySection({
  branchSlug,
  branchName,
  eyebrow,
  title,
  description,
  initialItems,
}: CentreGallerySectionProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems || GALLERY_ITEMS);
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  // Fetch live items from Neon DB API
  useEffect(() => {
    fetch("/api/content/gallery")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.items) && d.items.length > 0) {
          setItems(d.items);
        }
      })
      .catch(() => {});
  }, []);

  // Filter items matching this centre, or fall back to all centre photos
  const centrePhotos = React.useMemo(() => {
    if (!branchSlug && !branchName) return items.slice(0, 6);

    const query = (branchSlug || branchName || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    const matched = items.filter((item) => {
      const itemBranch = (item.branch || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      return itemBranch.includes(query) || query.includes(itemBranch) || itemBranch === "allcentres";
    });

    if (matched.length >= 4) {
      return matched.slice(0, 6);
    }

    // If fewer than 4 photos for this specific centre, append general arena/court photos
    const otherPhotos = items.filter((i) => !matched.some((m) => m.id === i.id));
    return [...matched, ...otherPhotos].slice(0, 6);
  }, [items, branchSlug, branchName]);

  const defaultTitle = branchName
    ? `${branchName.toUpperCase()} — COURT & FACILITY GALLERY`
    : "CENTRE PHOTO GALLERY & ARENA VISUALS";

  const defaultDesc = branchName
    ? `Take a visual walkthrough of our BWF Grade-1 certified courts, anti-glare overhead illumination, and training sessions at ${branchName}.`
    : "Explore the international-grade playing conditions, multi-court layouts, and high-performance training across our Kochi centres.";

  const defaultEyebrow = branchName
    ? `ARENA TOUR // ${branchName.toUpperCase()}`
    : "08 // INFRASTRUCTURE";

  const handleNext = () => {
    if (!activePhoto) return;
    const idx = centrePhotos.findIndex((p) => p.id === activePhoto.id);
    const nextIdx = (idx + 1) % centrePhotos.length;
    setActivePhoto(centrePhotos[nextIdx]);
  };

  const handlePrev = () => {
    if (!activePhoto) return;
    const idx = centrePhotos.findIndex((p) => p.id === activePhoto.id);
    const prevIdx = (idx - 1 + centrePhotos.length) % centrePhotos.length;
    setActivePhoto(centrePhotos[prevIdx]);
  };

  return (
    <section 
      className="py-20 lg:py-28 bg-[#07090D] relative border-b border-[#1F2937] select-none"
      aria-label="Centre Photo Gallery"
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#1F2937]">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
                {eyebrow || defaultEyebrow}
              </span>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#B8F000]" />
                <span>CENTRE VISUALS</span>
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-[-0.03em] uppercase leading-[0.98]">
              {title || defaultTitle}
            </h2>
            
            <p className="text-xs sm:text-sm text-[#A8B0BA] font-normal leading-relaxed">
              {description || defaultDesc}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B0F14] hover:bg-[#11161D] border border-[#1F2937] hover:border-[#B8F000]/60 text-xs font-mono font-bold tracking-wider text-[#B8F000] hover:text-white uppercase transition-all"
            >
              <span>EXPLORE ALL PHOTOS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Gallery Grid (Editorial Dynamic Grid: 1 Hero Card + 4-5 Supporting Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-10">
          {centrePhotos.map((photo, idx) => (
            <div
              key={photo.id || idx}
              onClick={() => setActivePhoto(photo)}
              className="group relative aspect-[16/10] bg-[#0B0F14] border border-[#1F2937] hover:border-[#B8F000]/70 overflow-hidden cursor-pointer transition-all duration-300 shadow-md"
            >
              <Image
                src={photo.image}
                alt={photo.title}
                fill
                className="object-cover filter contrast-110 brightness-95 group-hover:scale-105 group-hover:brightness-105 transition-all duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized
              />

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
                <span className="px-2 py-0.5 bg-[#07090D]/90 border border-[#1F2937] text-[10px] font-mono font-bold text-[#B8F000] uppercase tracking-wider">
                  {photo.category}
                </span>

                {photo.branch && (
                  <span className="px-2 py-0.5 bg-[#07090D]/90 border border-[#1F2937] text-[10px] font-mono text-white flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-[#B8F000]" />
                    <span>{photo.branch}</span>
                  </span>
                )}
              </div>

              {/* Bottom Caption Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-[#07090D]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-left z-10">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight line-clamp-1">
                    {photo.title}
                  </h3>
                  <Maximize2 className="w-4 h-4 text-[#B8F000] shrink-0 ml-2" />
                </div>
                {photo.caption && (
                  <p className="text-[11px] font-mono text-[#A8B0BA] line-clamp-2 leading-relaxed">
                    {photo.caption}
                  </p>
                )}
                <span className="mt-2 text-[10px] font-mono font-bold text-[#B8F000] uppercase tracking-widest flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>Click to expand</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner with Quick Direct Actions */}
        <div className="mt-10 p-5 bg-[#0B0F14] border border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-left font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#B8F000] animate-pulse shrink-0" />
            <span className="text-[#A8B0BA]">
              All photos captured live at S&amp;A Badminton Academy centres in Kochi.
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/gallery"
              className="text-[#B8F000] hover:text-white font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <span>See Full Photo Stream</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Full-Screen Interactive Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setActivePhoto(null)}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-[#11161D] border border-[#1F2937] text-[#A8B0BA] hover:text-white hover:border-[#B8F000] transition-colors cursor-pointer"
            title="Close viewer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev Button */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[#11161D]/80 border border-[#1F2937] text-white hover:text-[#B8F000] hover:border-[#B8F000] transition-colors cursor-pointer hidden sm:block"
            title="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-[#11161D]/80 border border-[#1F2937] text-white hover:text-[#B8F000] hover:border-[#B8F000] transition-colors cursor-pointer hidden sm:block"
            title="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Modal Content Box */}
          <div className="relative max-w-5xl w-full bg-[#0B0F14] border border-[#1F2937] overflow-hidden shadow-2xl flex flex-col">
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[75vh] bg-black">
              <Image
                src={activePhoto.image}
                alt={activePhoto.title}
                fill
                className="object-contain"
                unoptimized
              />
            </div>

            {/* Lightbox Footer Info */}
            <div className="p-4 sm:p-6 bg-[#07090D] border-t border-[#1F2937] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#B8F000]/10 border border-[#B8F000]/30 text-[#B8F000] font-bold uppercase text-[10px]">
                    {activePhoto.category}
                  </span>
                  {activePhoto.branch && (
                    <span className="text-[#A8B0BA] text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#B8F000]" />
                      <span>{activePhoto.branch}</span>
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white uppercase">{activePhoto.title}</h3>
                {activePhoto.caption && (
                  <p className="text-[#A8B0BA] text-xs max-w-2xl">{activePhoto.caption}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3 py-1.5 bg-[#11161D] border border-[#1F2937] text-white text-xs sm:hidden"
                >
                  &larr; Prev
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3 py-1.5 bg-[#11161D] border border-[#1F2937] text-white text-xs sm:hidden"
                >
                  Next &rarr;
                </button>
                <Link
                  href="/gallery"
                  className="px-4 py-2 bg-[#B8F000] text-[#07090D] font-black uppercase text-xs hover:bg-[#cbf722] transition-colors"
                >
                  Open Gallery
                </Link>
              </div>
            </div>
          </div>

        </div>
      )}
    </section>
  );
}
