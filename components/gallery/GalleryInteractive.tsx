"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Eye, MapPin } from "lucide-react";
import { GalleryItem } from "@/data/gallery";
import { normalizeImageSrc, isInternalImage } from "@/lib/imageUtils";

import { Centre } from "@/data/centres";

interface GalleryInteractiveProps {
  initialItems?: GalleryItem[];
  initialCentres?: Centre[];
}

const CATEGORIES = [
  "All",
  "Courts & Arena",
  "Training Drills",
  "Tournaments",
  "Juniors & Camps",
  "Coaching Sessions",
];

export function GalleryInteractive({
  initialItems,
  initialCentres,
}: GalleryInteractiveProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems || []);
  const [centres, setCentres] = useState<Centre[]>(initialCentres || []);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeBranchKey, setActiveBranchKey] = useState("all");
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  React.useEffect(() => {
    fetch("/api/content/gallery")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.items)) {
          setItems(d.items);
        }
      })
      .catch(() => {});

    fetch("/api/centres", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.items)) {
          setCentres(d.items);
        }
      })
      .catch(() => {});
  }, []);

  // Dynamically compute unique, clean centre filters from active centres + existing items
  const branchFilters = React.useMemo(() => {
    const clean = (s?: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    const getCleanLabel = (name?: string, shortName?: string) => {
      const raw = (shortName || name || "").trim();
      return raw
        .replace(/^S\s*&\s*A\s+Badminton\s+Academy\s*[–—\-:]\s*/i, "")
        .replace(/\s+(Centre|Branch)$/i, "")
        .trim();
    };

    const list: Array<{
      key: string;
      label: string;
      slug?: string;
      name?: string;
      shortName?: string;
    }> = [{ key: "all", label: "All Centres" }];

    // 1. Add active centres from database / API
    if (Array.isArray(centres) && centres.length > 0) {
      for (const c of centres) {
        if (c.status === "INACTIVE" || c.isActive === false) continue;
        const label = getCleanLabel(c.name, c.shortName);
        if (!label) continue;
        const key = c.slug || clean(label);
        if (!list.some((existing) => existing.key === key)) {
          list.push({
            key,
            label,
            slug: c.slug,
            name: c.name,
            shortName: c.shortName,
          });
        }
      }
    }

    // 2. Also ensure any specific branch present on gallery items is represented
    for (const item of items) {
      if (!item.branch) continue;
      const b = item.branch.trim();
      const bClean = clean(b);
      if (!bClean || bClean === "allcentres" || bClean === "all") continue;

      const alreadyExists = list.some((f) => {
        if (f.key === "all") return false;
        const fClean = clean(f.label);
        const sClean = clean(f.slug);
        return (
          fClean === bClean ||
          sClean === bClean ||
          (fClean.length > 3 && bClean.includes(fClean)) ||
          (bClean.length > 3 && fClean.includes(bClean))
        );
      });

      if (!alreadyExists) {
        const label = getCleanLabel(b, b);
        list.push({
          key: clean(b),
          label: label || b,
          slug: clean(b),
          name: b,
        });
      }
    }

    return list;
  }, [centres, items]);

  const currentBranchKey = branchFilters.some((f) => f.key === activeBranchKey)
    ? activeBranchKey
    : "all";

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    if (!matchesCategory) return false;

    if (currentBranchKey === "all") return true;

    const activeOption = branchFilters.find((f) => f.key === currentBranchKey);
    if (!activeOption) return true;

    const itemBranch = (item.branch || "").trim();
    const bClean = itemBranch.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!bClean) return false;

    // Photos tagged for All Centres show across every centre
    if (bClean === "allcentres" || bClean === "all") return true;

    const clean = (s?: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const fClean = clean(activeOption.label);
    const sClean = clean(activeOption.slug);
    const nClean = clean(activeOption.name);
    const snClean = clean(activeOption.shortName);

    return (
      bClean === fClean ||
      bClean === sClean ||
      (sClean.length > 0 && bClean.includes(sClean)) ||
      (fClean.length > 0 && bClean.includes(fClean)) ||
      (bClean.length > 3 && fClean.includes(bClean)) ||
      (nClean.length > 0 && (nClean.includes(bClean) || bClean.includes(nClean))) ||
      (snClean.length > 0 && (snClean.includes(bClean) || bClean.includes(snClean)))
    );
  });

  const handleNext = () => {
    if (!selectedItem) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === selectedItem.id);
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setSelectedItem(filteredItems[nextIndex]);
  };

  const handlePrev = () => {
    if (!selectedItem) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === selectedItem.id);
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedItem(filteredItems[prevIndex]);
  };

  return (
    <div className="space-y-8">
      {/* 1. Centre / Branch Selector Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <span className="text-xs font-mono uppercase font-bold text-[#A8B0BA] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#B8F000]" />
          <span>Select Centre:</span>
        </span>
        <div className="flex items-center gap-2 flex-wrap justify-center font-mono text-xs">
          {branchFilters.map((option) => {
            const isActive = currentBranchKey === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setActiveBranchKey(option.key)}
                className={`px-3.5 py-1.5 border uppercase font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#B8F000] text-[#07090D] border-[#B8F000] shadow-[0_0_12px_rgba(184,240,0,0.2)]"
                    : "bg-[#0B0F14] text-[#A8B0BA] border-[#1F2937] hover:border-[#374151] hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Filter Category Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-4">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 text-xs font-mono transition-all cursor-pointer ${
                isActive
                  ? "bg-[#1F2937] text-white border border-[#B8F000]/60 font-bold"
                  : "bg-transparent text-[#6B7280] border border-transparent hover:text-[#A8B0BA]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Gallery Media Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#0B0F14] border border-[#1F2937]">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#1F2937] flex items-center justify-center text-[#B8F000]">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">No Photos in This Selection</h3>
          <p className="text-xs text-[#A8B0BA] font-mono mt-1 max-w-md mx-auto">
            Visuals for this centre or category will be updated shortly. Switch to &quot;All Centres&quot; or explore other categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveBranchKey("all");
              setActiveCategory("All");
            }}
            className="mt-4 px-4 py-2 bg-[#B8F000] text-[#07090D] font-mono text-xs font-black uppercase tracking-wider cursor-pointer hover:bg-[#cbf722] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const itemImage = normalizeImageSrc(item.image);
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative rounded-2xl overflow-hidden aspect-square bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 shadow-lg cursor-pointer"
              >
                <Image
                  src={itemImage}
                  alt={item.title}
                  fill
                  unoptimized={isInternalImage(itemImage)}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                    {item.caption}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-2">
                    <MapPin className="w-3 h-3" />
                    <span>{item.branch} Branch</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {selectedItem && (() => {
        const modalImage = normalizeImageSrc(selectedItem.image);
        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox preview"
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800 transition-colors"
                aria-label="Close image preview"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:-left-14 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-2 sm:-right-14 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Large Image */}
              <div className="relative w-full aspect-[16/10] max-h-[70vh] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                <Image
                  src={modalImage}
                  alt={selectedItem.title}
                  fill
                  unoptimized={isInternalImage(modalImage)}
                  className="object-cover"
                  sizes="(max-width: 1200px) 90vw, 1000px"
                />
              </div>

              {/* Caption Bar */}
              <div className="w-full mt-4 p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-left">
                <div>
                  <h4 className="text-base font-bold text-white">{selectedItem.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedItem.caption}</p>
                </div>
                <div className="text-xs font-semibold text-emerald-400 px-2.5 py-1 rounded-md bg-emerald-500/10 shrink-0">
                  {selectedItem.branch} Arena
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
