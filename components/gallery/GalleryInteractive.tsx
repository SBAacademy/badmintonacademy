"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Eye, MapPin } from "lucide-react";
import { GALLERY_ITEMS, GalleryItem } from "@/data/gallery";

const CATEGORIES = [
  "All",
  "Courts & Arena",
  "Training Drills",
  "Tournaments",
  "Juniors & Camps",
  "Coaching Sessions",
];

export function GalleryInteractive({ initialItems }: { initialItems?: GalleryItem[] }) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems || GALLERY_ITEMS);
  const [activeCategory, setActiveCategory] = useState("All");
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
  }, []);

  const filteredItems = activeCategory === "All"
    ? items
    : items.filter((item) => item.category === activeCategory);

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
    <div>
      {/* Filter Category Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-emerald-500 text-[#090D16] shadow-md shadow-emerald-500/20"
                  : "bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Gallery Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative rounded-2xl overflow-hidden aspect-square bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 shadow-lg cursor-pointer"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
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
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedItem && (
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
                src={selectedItem.image}
                alt={selectedItem.title}
                fill
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
      )}
    </div>
  );
}
