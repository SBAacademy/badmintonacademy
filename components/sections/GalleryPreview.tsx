import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye } from "lucide-react";
import { GALLERY_ITEMS } from "@/data/gallery";

export function GalleryPreview() {
  return (
    <section 
      className="py-24 lg:py-36 bg-[#07090D] relative border-b border-[#1F2937] select-none"
      aria-label="Court Action Gallery Preview"
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Eyebrow & Category Index */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 sm:pb-16 border-b border-[#1F2937]">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
                09 // VISUALS
              </span>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
                LIFE ON COURT
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-[-0.03em] uppercase leading-[0.95]">
              TRAINING, DRILLS <br />
              <span className="text-[#B8F000]">&amp; TOURNAMENT RALLIES.</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#B8F000] hover:text-white uppercase transition-colors"
            >
              <span>VIEW COMPLETE GALLERY</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Editorial Sports Gallery Grid: Hard corners, 1px borders */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12">
          {GALLERY_ITEMS.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              href="/gallery"
              className="group relative aspect-square overflow-hidden bg-[#0B0F14] border border-[#1F2937] block hover:border-[#B8F000]/70 transition-colors"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover filter contrast-115 group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-[#07090D]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4 text-left">
                <div className="w-7 h-7 bg-[#11161D] text-[#B8F000] border border-[#1F2937] flex items-center justify-center mb-2">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-white uppercase tracking-tight leading-snug">
                  {item.title}
                </div>
                <div className="font-mono text-[10px] text-[#B8F000] mt-0.5 uppercase tracking-wider">
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
