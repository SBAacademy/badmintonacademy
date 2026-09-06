import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye } from "lucide-react";
import { GALLERY_ITEMS } from "@/data/gallery";

export function GalleryPreview() {
  return (
    <section className="py-20 lg:py-28 bg-[#0E141B] relative border-b border-[#26313D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#B8F000]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#B8F000]">
                LIFE ON COURT
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight uppercase leading-tight">
              Training, Matches & Celebrations
            </h2>
            <p className="text-[#A7B0BC] text-sm sm:text-base leading-relaxed">
              A glimpse into our high-energy training sessions, video stroke analysis, junior coaching drills, and court action across Kochi.
            </p>
          </div>

          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#B8F000] hover:text-[#c7fb1e] uppercase tracking-wider group shrink-0"
          >
            <span>Full Gallery</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GALLERY_ITEMS.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              href="/gallery"
              className="group relative aspect-square rounded-2xl overflow-hidden bg-[#080B10] border border-[#26313D] block shadow-md hover:border-[#B8F000]/60 transition-all duration-300"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-left">
                <div className="w-8 h-8 rounded-full bg-[#121A23] text-[#B8F000] border border-[#26313D] flex items-center justify-center mb-2">
                  <Eye className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[#F8FAFC] leading-snug">
                  {item.title}
                </div>
                <div className="text-[10px] text-[#B8F000] font-medium mt-0.5">
                  {item.category} • {item.branch}
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
