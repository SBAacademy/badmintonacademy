import React from "react";
import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { ACADEMY_DATA } from "@/data/academy";
import { getCentres } from "@/lib/contentDb";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { FAQSection } from "@/components/sections/FAQSection";

export const dynamic = "force-dynamic";

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

export default async function ContactPage() {
  const centres = await getCentres({ includeInactive: false });

  return (
    <div className="bg-[#07090D] min-h-screen text-white select-none">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ name: "Contact & Admissions", url: "/contact" }]} />

        {/* Rebel Hero */}
        <div className="pt-8 pb-16 border-b border-[#1F2937] space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
              ADMISSIONS // INITIATION
            </span>
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
              COACH EVALUATION &amp; SLOTS
            </span>
          </div>

          <h1 className="text-[clamp(2.8rem,7vw,6.5rem)] font-black uppercase tracking-[-0.04em] leading-[0.92]">
            LET&apos;S GET YOU <br />
            <span className="text-[#B8F000]">ON COURT.</span>
          </h1>

          <p className="text-base sm:text-xl text-[#A8B0BA] max-w-2xl font-normal leading-relaxed">
            Have questions regarding batch schedules, trial slots, or tournament training? Reach our coaching admissions desk directly.
          </p>
        </div>

        {/* 2-Column Conversion Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 border-b border-[#1F2937]">
          
          {/* Left Column: Direct Assistance & Operations */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {/* Quick Actions Card */}
            <div className="p-6 sm:p-8 bg-[#0B0F14] border border-[#1F2937] space-y-4">
              <span className="font-mono text-xs text-[#B8F000] uppercase tracking-widest">
                DIRECT ADMISSIONS HOTLINES
              </span>
              
              <div className="space-y-3">
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] hover:border-[#B8F000]/60 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#07090D] border border-[#1F2937] flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-[#22C55E]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white uppercase font-mono">WhatsApp Admissions</div>
                      <div className="text-[11px] text-[#A8B0BA] font-mono">Immediate slot confirmation</div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#B8F000] group-hover:translate-x-1 transition-transform">
                    CHAT &rarr;
                  </span>
                </a>

                <a
                  href={`tel:${ACADEMY_DATA.phone}`}
                  className="p-4 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] hover:border-[#B8F000]/60 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#07090D] border border-[#1F2937] flex items-center justify-center">
                      <Phone className="w-5 h-5 text-[#B8F000]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white uppercase font-mono">Call Coaching Desk</div>
                      <div className="text-[11px] text-[#A8B0BA] font-mono">{ACADEMY_DATA.phoneDisplay}</div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#B8F000] group-hover:translate-x-1 transition-transform">
                    CALL &rarr;
                  </span>
                </a>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="p-6 sm:p-8 bg-[#0B0F14] border border-[#1F2937] space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#B8F000] uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>OPERATIONAL SCHEDULE</span>
              </div>
              <h3 className="text-lg font-black uppercase text-white">{ACADEMY_DATA.operatingHours.days}</h3>
              <div className="space-y-1 text-xs font-mono text-[#A8B0BA]">
                <p>MORNING BATCHES: <strong className="text-white">{ACADEMY_DATA.operatingHours.morning}</strong></p>
                <p>EVENING BATCHES: <strong className="text-white">{ACADEMY_DATA.operatingHours.evening}</strong></p>
              </div>
            </div>

            {/* Centre Quick Directory */}
            <div className="p-6 sm:p-8 bg-[#0B0F14] border border-[#1F2937] space-y-3">
              <span className="font-mono text-xs font-bold text-[#B8F000] uppercase tracking-wider">
                ARENA HUBS
              </span>
              <div className="space-y-2 text-xs">
                {centres.map((b) => (
                  <div key={b.slug} className="p-3 bg-[#07090D] border border-[#1F2937] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{b.shortName || b.name}</div>
                      <div className="text-[11px] text-[#A8B0BA] font-mono truncate max-w-[220px]">{b.address || ""}</div>
                    </div>
                    <a
                      href={b.googleMapsUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-[#B8F000] hover:underline"
                    >
                      MAP &rarr;
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Booking Form */}
          <div className="lg:col-span-7">
            <EnquiryForm initialCentres={centres} />
          </div>

        </div>

        {/* Admissions FAQs */}
        <div className="pt-8">
          <FAQSection category="Admissions" limit={4} showSchema={false} />
        </div>

      </div>
    </div>
  );
}
