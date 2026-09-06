import React from "react";
import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, MessageCircle, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { ACADEMY_DATA } from "@/data/academy";
import { BRANCHES } from "@/data/branches";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { FAQSection } from "@/components/sections/FAQSection";

export const metadata: Metadata = createMetadata({
  title: "Contact & Book Free Trial | S & A Badminton Academy Kochi",
  description: "Get in touch with S & A Badminton Academy in Kochi. Book a free trial assessment, enquire about batch timings across Kadavanthra, Edappally, and Kakkanad.",
  path: "/contact",
  keywords: [
    "badminton academy contact Kochi",
    "book badminton trial session",
    "badminton coaching admission Kochi",
    "S&A badminton phone number",
  ],
});

export default function ContactPage() {
  return (
    <div className="py-8 sm:py-12 bg-[#090D16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ name: "Contact & Admissions", url: "/contact" }]} />

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Admissions & Trial Bookings
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Connect With Our Coaching Admissions Desk
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Have questions about age batches, court availability, or want to schedule your free 45-minute skills evaluation? Reach us via phone, WhatsApp, or the booking form below.
          </p>
        </div>

        {/* 2-Column: Quick Contact info on Left, Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Quick Actions Card */}
            <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white">Direct Assistance</h2>
              
              <div className="space-y-3">
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">WhatsApp Concierge</div>
                      <div className="text-[11px] text-emerald-400">Instant batch advice & slots</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                    Chat →
                  </span>
                </a>

                <a
                  href={`tel:${ACADEMY_DATA.phone}`}
                  className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Call Admissions Desk</div>
                      <div className="text-[11px] text-slate-400">{ACADEMY_DATA.phoneDisplay}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-transform">
                    Call →
                  </span>
                </a>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Operating Timings</span>
              </div>
              <h3 className="text-base font-bold text-white">{ACADEMY_DATA.operatingHours.days}</h3>
              <div className="space-y-1 text-xs text-slate-300">
                <p>Morning Coaching: <strong className="text-white">{ACADEMY_DATA.operatingHours.morning}</strong></p>
                <p>Evening Coaching: <strong className="text-white">{ACADEMY_DATA.operatingHours.evening}</strong></p>
              </div>
            </div>

            {/* Academy Locations in Kochi */}
            <div className="p-6 rounded-3xl bg-[#111827] border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Our 3 Kochi Arenas</span>
              </h3>

              <div className="space-y-3 text-xs">
                {BRANCHES.map((b) => (
                  <div key={b.slug} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>{b.shortName}</span>
                      <span className="text-[10px] text-emerald-400 font-normal">{b.courtsCount} Courts</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{b.address}</p>
                    <a
                      href={b.googleMapDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-400 hover:underline inline-block pt-0.5"
                    >
                      Get Directions →
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Booking Form Column */}
          <div className="lg:col-span-7">
            <EnquiryForm />
          </div>

        </div>

        {/* FAQs */}
        <div className="pt-12 border-t border-slate-800/80">
          <FAQSection category="Admissions" limit={4} showSchema={false} />
        </div>

      </div>
    </div>
  );
}
