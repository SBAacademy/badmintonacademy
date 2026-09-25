"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Shield, Sparkles, MessageCircle } from "lucide-react";
import { ACADEMY_DATA } from "@/data/academy";
import { PROGRAMS } from "@/data/programs";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function Footer({ initialCentres }: { initialCentres?: any[] } = {}) {
  const [centres, setCentres] = useState<any[]>(initialCentres || []);
  const [programs, setPrograms] = useState<any[]>(PROGRAMS);

  useEffect(() => {
    fetch("/api/centres", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items)) {
          setCentres(data.items);
        }
      })
      .catch((err) => console.error("Failed to load centres in Footer:", err));

    fetch("/api/content/programs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setPrograms(data.items);
        }
      })
      .catch(() => { });
  }, []);
  return (
    <footer className="bg-[#07090D] border-t border-[#1F2937] text-[#A8B0BA] text-sm relative z-10 pb-32 lg:pb-12 select-none">
      {/* Top Athletic Lime Rule */}
      <div className="h-0.5 bg-[#B8F000]" />

      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">

        {/* Massive Editorial Brand Lockup */}
        <div className="pb-12 border-b border-[#1F2937] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1 text-left">
            <span className="font-mono text-xs font-black tracking-[0.3em] text-[#B8F000] uppercase">
              REBEL PERFORMANCE // ATHLETIC TRAINING
            </span>
            <div className="text-4xl sm:text-6xl font-black text-white tracking-[-0.04em] uppercase leading-none">
              S&amp;A BADMINTON ACADEMY
            </div>
          </div>
          <div className="font-mono text-xs text-[#A8B0BA] uppercase tracking-wider">
            {centres.length > 0
              ? `KOCHI • ${centres
                .map((c) => (c.shortName || c.name || "").replace(/\s+(Centre|Branch)$/i, "").toUpperCase())
                .filter(Boolean)
                .join(" • ")}`
              : "KOCHI"}
          </div>
        </div>

        {/* 5-Column Editorial Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pt-12">

          {/* Col 1: Brand & Philosophy */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <p className="text-sm text-[#A8B0BA] leading-relaxed max-w-sm">
              {ACADEMY_DATA.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold bg-[#11161D] text-white border border-[#1F2937]">
                <Shield className="w-3 h-3 text-[#B8F000]" />
                BWF &amp; NIS CERTIFIED FACULTY
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold bg-[#11161D] text-white border border-[#1F2937]">
                <Sparkles className="w-3 h-3 text-[#B8F000]" />
                SPRUNG WOODEN SUBFLOORS
              </span>
            </div>

            <div className="pt-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#A8B0BA]/60 mb-2">
                OFFICIAL SOCIAL ARCHIVE
              </div>
              <div className="flex items-center space-x-2.5">
                <a
                  href={ACADEMY_DATA.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-[#11161D] hover:bg-[#17212C] text-[#A8B0BA] hover:text-white flex items-center justify-center border border-[#1F2937] transition-colors"
                  aria-label="Follow on Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href={ACADEMY_DATA.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-[#11161D] hover:bg-[#17212C] text-[#A8B0BA] hover:text-white flex items-center justify-center border border-[#1F2937] transition-colors"
                  aria-label="Follow on Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.597 0 9 1.582 9 4.615V8z" />
                  </svg>
                </a>
                <a
                  href={ACADEMY_DATA.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-[#11161D] hover:bg-[#17212C] text-[#A8B0BA] hover:text-white flex items-center justify-center border border-[#1F2937] transition-colors"
                  aria-label="Subscribe on YouTube"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Programs */}
          <div className="space-y-3 text-left">
            <h4 className="text-white font-mono font-bold text-xs uppercase tracking-wider">
              Training Tracks
            </h4>
            <ul className="space-y-2 text-xs">
              {programs.slice(0, 5).map((program) => (
                <li key={program.slug || program.id}>
                  <Link
                    href={`/programs#${program.slug || program.id}`}
                    className="hover:text-[#B8F000] transition-colors block py-0.5"
                  >
                    {program.name}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  href="/programs"
                  className="text-[#B8F000] hover:underline font-mono text-[11px] font-bold uppercase tracking-wider block"
                >
                  View All Programs &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Dedicated Physical Centres (Local SEO) */}
          <div className="space-y-3 text-left">
            <h4 className="text-white font-mono font-bold text-xs uppercase tracking-wider">
              Physical Centres
            </h4>
            <ul className="space-y-3 text-xs">
              {centres.map((centre) => (
                <li key={centre.slug} className="border-b border-[#1F2937] pb-2 last:border-0">
                  <Link
                    href={`/${centre.slug}`}
                    className="font-bold text-white hover:text-[#B8F000] transition-colors block"
                  >
                    {centre.shortName || centre.name}
                  </Link>
                  <p className="text-[11px] text-[#A8B0BA] truncate mt-0.5">
                    {centre.address?.split(",")[1]?.trim() || centre.district || centre.city || "Kochi"}
                  </p>
                  <a
                    href={centre.googleMapsUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#B8F000] hover:underline inline-flex items-center gap-1 mt-0.5 font-mono"
                  >
                    <MapPin className="w-2.5 h-2.5" /> DIRECTIONS
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Operations */}
          <div className="space-y-3 text-left">
            <h4 className="text-white font-mono font-bold text-xs uppercase tracking-wider">
              Admissions Desk
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#B8F000] shrink-0 mt-0.5" />
                <span>{ACADEMY_DATA.headquartersAddress}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#B8F000] shrink-0" />
                <a href={`tel:${ACADEMY_DATA.phone}`} className="hover:text-white font-mono">
                  {ACADEMY_DATA.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#B8F000] shrink-0" />
                <a href={`mailto:${ACADEMY_DATA.email}`} className="hover:text-white">
                  {ACADEMY_DATA.email}
                </a>
              </li>
              <li className="flex items-start gap-2 pt-1">
                <Clock className="w-4 h-4 text-[#B8F000] shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium">{ACADEMY_DATA.operatingHours.days}</div>
                  <div className="text-[11px] text-[#A8B0BA] font-mono">
                    {ACADEMY_DATA.operatingHours.morning} | {ACADEMY_DATA.operatingHours.evening}
                  </div>
                </div>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>WHATSAPP DESK</span>
              </a>
              <p className="text-[11px] font-mono text-[#A8B0BA] text-center pt-2">
                Shoes &amp; racket required for free trial.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Legal */}
        <div className="mt-6 pt-6 border-t border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#A8B0BA]">
          <p>&copy; {new Date().getFullYear()} {ACADEMY_DATA.name}. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/events" className="hover:text-white transition-colors">Events</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/admin" className="text-[#A8B0BA]/50 hover:text-[#B8F000] transition-colors">CRM</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
