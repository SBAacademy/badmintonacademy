import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Shield, Sparkles, ExternalLink, MessageCircle } from "lucide-react";
import { ACADEMY_DATA } from "@/data/academy";
import { BRANCHES } from "@/data/branches";
import { PROGRAMS } from "@/data/programs";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="bg-[#080B10] border-t border-[#26313D] text-[#A7B0BC] text-sm relative z-10 pb-32 lg:pb-12">
      {/* Top Accent Line */}
      <div className="h-0.5 bg-[#B8F000]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Brand & Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#121A23] border border-[#26313D] group-hover:border-[#B8F000]/60 flex items-center justify-center transition-colors shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-[#B8F000]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="15" cy="8.5" r="5" strokeWidth="2" />
                  <line x1="11.5" y1="12" x2="4.5" y2="19" strokeWidth="2.5" />
                  <line x1="3.5" y1="18" x2="5.5" y2="20" strokeWidth="2.5" />
                  <line x1="15" y1="4" x2="15" y2="13" strokeWidth="1" strokeDasharray="1.2 1.5" />
                  <line x1="10.5" y1="8.5" x2="19.5" y2="8.5" strokeWidth="1" strokeDasharray="1.2 1.5" />
                  <circle cx="6" cy="6" r="1.4" fill="currentColor" stroke="none" />
                  <path d="M7 7l3.5 3.5" strokeWidth="1.4" />
                  <path d="M5.2 7.5l2 3.8" strokeWidth="1.2" />
                  <path d="M7.5 5.2l3.8 2" strokeWidth="1.2" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-base tracking-tight text-[#F8FAFC]">
                  S & A
                </span>
                <span className="text-[11px] font-bold text-[#A7B0BC] uppercase tracking-wider">
                  Badminton Academy
                </span>
              </div>
            </Link>

            <p className="text-[#A7B0BC] text-sm leading-relaxed max-w-sm">
              {ACADEMY_DATA.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#121A23] text-[#F8FAFC] border border-[#26313D]">
                <Shield className="w-3.5 h-3.5 text-[#B8F000]" />
                Certified Coaches
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#121A23] text-[#F8FAFC] border border-[#26313D]">
                <Sparkles className="w-3.5 h-3.5 text-[#B8F000]" />
                Sprung Wooden Subfloors
              </span>
            </div>

            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2">
                Follow S&A Academy
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href={ACADEMY_DATA.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#121A23] hover:bg-[#17212C] text-[#A7B0BC] hover:text-[#F8FAFC] flex items-center justify-center border border-[#26313D] transition-colors"
                  aria-label="Follow on Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href={ACADEMY_DATA.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#121A23] hover:bg-[#17212C] text-[#A7B0BC] hover:text-[#F8FAFC] flex items-center justify-center border border-[#26313D] transition-colors"
                  aria-label="Follow on Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.597 0 9 1.582 9 4.615V8z"/>
                  </svg>
                </a>
                <a
                  href={ACADEMY_DATA.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#121A23] hover:bg-[#17212C] text-[#A7B0BC] hover:text-[#F8FAFC] flex items-center justify-center border border-[#26313D] transition-colors"
                  aria-label="Subscribe on YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Programs */}
          <div className="space-y-3">
            <h4 className="text-[#F8FAFC] font-bold text-sm uppercase tracking-wider">
              Programs
            </h4>
            <ul className="space-y-2 text-xs">
              {PROGRAMS.map((program) => (
                <li key={program.slug}>
                  <Link
                    href={`/programs/${program.slug}`}
                    className="hover:text-[#B8F000] transition-colors block py-0.5"
                  >
                    {program.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/programs"
                  className="text-[#B8F000] hover:text-[#c7fb1e] font-semibold inline-flex items-center gap-1 pt-1"
                >
                  All Programs →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Branches (Local SEO) */}
          <div className="space-y-3">
            <h4 className="text-[#F8FAFC] font-bold text-sm uppercase tracking-wider">
              Kochi Hubs
            </h4>
            <ul className="space-y-3 text-xs">
              {BRANCHES.map((branch) => (
                <li key={branch.slug} className="border-b border-[#26313D]/60 pb-2 last:border-0">
                  <Link
                    href={`/branches/${branch.slug}`}
                    className="font-semibold text-[#F8FAFC] hover:text-[#B8F000] transition-colors block"
                  >
                    {branch.shortName}
                  </Link>
                  <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                    {branch.landmark}
                  </p>
                  <a
                    href={branch.googleMapDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#B8F000] hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    <MapPin className="w-3 h-3" /> Get Directions
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Operating Hours */}
          <div className="space-y-3">
            <h4 className="text-[#F8FAFC] font-bold text-sm uppercase tracking-wider">
              Contact & Enquiries
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#B8F000] shrink-0 mt-0.5" />
                <span>{ACADEMY_DATA.headquartersAddress}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#B8F000] shrink-0" />
                <a href={`tel:${ACADEMY_DATA.phone}`} className="hover:text-[#F8FAFC]">
                  {ACADEMY_DATA.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#B8F000] shrink-0" />
                <a href={`mailto:${ACADEMY_DATA.email}`} className="hover:text-[#F8FAFC]">
                  {ACADEMY_DATA.email}
                </a>
              </li>
              <li className="flex items-start gap-2 pt-1">
                <Clock className="w-4 h-4 text-[#B8F000] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[#F8FAFC] font-medium">{ACADEMY_DATA.operatingHours.days}</div>
                  <div className="text-[11px] text-[#6B7280]">
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
                className="w-full py-2.5 px-3 rounded-xl bg-[#121A23] hover:bg-[#17212C] border border-[#26313D] text-[#F8FAFC] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        </div>

        {/* Local SEO Strip */}
        <div className="mt-12 pt-6 border-t border-[#26313D]/60 text-[11px] text-[#6B7280] leading-relaxed">
          <span className="font-semibold text-[#A7B0BC]">Kochi Badminton Locations: </span>
          Badminton academy in Kadavanthra, coaching near Edappally, training Kakkanad Infopark, kids classes Kochi, junior tournament coaching Ernakulam, adult fitness batches Kochi.
        </div>

        {/* Bottom Legal */}
        <div className="mt-6 pt-6 border-t border-[#26313D]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B7280]">
          <p>© {new Date().getFullYear()} {ACADEMY_DATA.name}. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link href="/about" className="hover:text-[#F8FAFC] transition-colors">About</Link>
            <Link href="/blog" className="hover:text-[#F8FAFC] transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-[#F8FAFC] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#F8FAFC] transition-colors">Terms of Training</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
