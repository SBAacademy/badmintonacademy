import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  ShieldCheck,
  MapPin,
  MessageSquare,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata, SITE_URL } from "@/lib/seo";
import { getCoachBySlug, getCoaches, getCentres } from "@/lib/contentDb";
import { CoachEnquiryForm } from "@/components/coaches/CoachEnquiryForm";
import { CoachPhotoGallery } from "@/components/coaches/CoachPhotoGallery";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { formatWhatsAppDisplay, getCoachPrimaryPhoto } from "@/data/coaches";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

/**
 * Dynamic SEO metadata generator based on the coach's live database record.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const coach = await getCoachBySlug(slug);

  if (!coach || coach.isPublished === false || coach.status === "INACTIVE") {
    return {
      title: "Coach Not Found | S&A Badminton Academy",
      description: "The requested badminton coach profile could not be located.",
    };
  }

  const title = `${coach.name} – ${coach.role} | S&A Badminton Academy`;
  const description = `Train with ${coach.name}, ${coach.role} at S&A Badminton Academy, ${coach.primaryBranch}. Specializing in ${coach.specialization} with ${coach.experienceYears}+ years experience.`;
  const canonicalPath = `/coaches/${coach.slug || coach.id}`;

  return createMetadata({
    title,
    description,
    path: canonicalPath,
    keywords: [
      coach.name,
      `${coach.name} badminton coach`,
      `${coach.name} Kochi`,
      `${coach.role} Kochi`,
      coach.primaryBranch,
      coach.specialization,
      "badminton coaching Kochi",
      "BWF certified coach Kerala",
    ],
    ogImage: coach.image || "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop",
  });
}

/**
 * Generate static params for pre-rendering known coaches
 */
export async function generateStaticParams() {
  try {
    const coaches = await getCoaches();
    return coaches.map((c) => ({
      slug: c.slug || c.id,
    }));
  } catch {
    return [];
  }
}

export default async function CoachProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const coach = await getCoachBySlug(slug);

  if (!coach || coach.isPublished === false || coach.status === "INACTIVE") {
    notFound();
  }

  const allCentres = await getCentres({ includeInactive: false });
  const coachUrl = `${SITE_URL}/coaches/${coach.slug || coach.id}`;
  const hasWhatsApp = Boolean(coach.whatsappNumber && coach.whatsappNumber.trim());

  // Dynamic Person Schema for Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: coach.name,
    jobTitle: coach.role,
    image: coach.image || `${SITE_URL}/images/training-coach.jpg`,
    description: coach.bio,
    worksFor: {
      "@type": "SportsClub",
      name: "S & A Badminton Academy",
      url: SITE_URL,
    },
    url: coachUrl,
    knowsAbout: [coach.specialization, "Badminton Coaching", "Athletic Conditioning"],
    hasCredential: (coach.certifications || []).map((cert) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "degree",
      name: cert,
    })),
  };

  return (
    <div className="bg-[#07090D] min-h-screen text-white select-none">
      {/* Schema.org Person JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-12">
        {/* Navigation Breadcrumbs & Back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2937] pb-4">
          <Breadcrumbs
            items={[
              { name: "Coaches & Mentors", url: "/coaches" },
              { name: coach.name, url: `/coaches/${coach.slug || coach.id}` },
            ]}
          />

          <Link
            href="/coaches"
            className="inline-flex items-center gap-2 text-xs font-mono text-[#A8B0BA] hover:text-[#B8F000] uppercase transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Full Faculty Roster</span>
          </Link>
        </div>

        {/* Coach Hero Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start border-b border-[#1F2937] pb-16">
          {/* Portrait & Multi-Photo Gallery Column */}
          <div className="lg:col-span-5">
            <CoachPhotoGallery
              photos={coach.photos}
              images={coach.images}
              fallbackImage={coach.image}
              name={coach.name}
              role={coach.role}
              experienceYears={coach.experienceYears}
            />
            <div className="mt-3 max-w-md mx-auto">
              <div className="px-3 py-2 bg-[#0B0F14] border border-[#1F2937] font-mono text-xs text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#B8F000] shrink-0" />
                  <span className="truncate text-[11px] text-[#A8B0BA]">{coach.primaryBranch}</span>
                </div>
                {coach.photos && coach.photos.length > 1 && (
                  <span className="text-[10px] text-[#B8F000] font-bold">
                    {coach.photos.length} Court Photos
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Coach Bio & Quick Info Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
                  FACULTY // PROFILE
                </span>
                <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
                  CERTIFIED MENTOR
                </span>
              </div>

              <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-black uppercase tracking-[-0.04em] leading-[0.92] text-white">
                {coach.name}
              </h1>

              <div className="text-base sm:text-lg font-mono text-[#B8F000] font-bold uppercase tracking-tight">
                {coach.role}
              </div>
            </div>

            {/* Core Specialization Pill */}
            <div className="p-4 bg-[#0B0F14] border border-[#1F2937] flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#B8F000] shrink-0 mt-0.5" />
              <div>
                <span className="font-mono text-[10px] uppercase text-[#A8B0BA] tracking-wider block">
                  PRIMARY COACHING FOCUS:
                </span>
                <span className="font-bold text-white text-sm">
                  {coach.specialization}
                </span>
              </div>
            </div>

            {/* Narrative Bio */}
            <div className="space-y-3">
              <h2 className="font-mono text-xs uppercase tracking-widest text-[#A8B0BA] font-bold">
                Coaching Pedagogy &amp; Background
              </h2>
              <p className="text-sm sm:text-base text-[#D1D5DB] leading-relaxed font-normal">
                {coach.bio}
              </p>
            </div>

            {/* WhatsApp Quick Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href="#enquiry-section"
                className="px-6 py-3.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#B8F000]/10"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Book Training / Enquire on WhatsApp</span>
              </a>

              {hasWhatsApp && (
                <a
                  href={`https://wa.me/${coach.whatsappNumber}?text=${encodeURIComponent(
                    `Hello S&A Badminton Academy, I want to enquire about training with Coach ${coach.name}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-white font-mono text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-[#B8F000]" />
                  <span>Direct WhatsApp: {formatWhatsAppDisplay(coach.whatsappNumber)}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Accreditations & Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-[#1F2937] pb-16">
          {/* Verified Certifications */}
          <div className="bg-[#0B0F14] border border-[#1F2937] p-6 sm:p-8 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#B8F000]" />
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Verified Accreditations &amp; Diplomas
              </h3>
            </div>
            <div className="space-y-2.5 pt-2">
              {Array.isArray(coach.certifications) && coach.certifications.length > 0 ? (
                coach.certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#D1D5DB]">
                    <span className="w-1.5 h-1.5 bg-[#B8F000] rounded-full mt-2 shrink-0" />
                    <span>{cert}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#6B7280] font-mono">
                  Standard certified coaching faculty curriculum.
                </p>
              )}
            </div>
          </div>

          {/* Track Record & Achievements */}
          <div className="bg-[#0B0F14] border border-[#1F2937] p-6 sm:p-8 space-y-4 text-left">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#B8F000]" />
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Competitive Track Record &amp; Distinctions
              </h3>
            </div>
            <div className="space-y-2.5 pt-2">
              {coach.achievements.length > 0 ? (
                coach.achievements.map((ach, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#D1D5DB]">
                    <span className="w-1.5 h-1.5 bg-[#B8F000] rounded-full mt-2 shrink-0" />
                    <span>{ach}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#6B7280] font-mono">
                  Active competitive mentor across academy branches.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Coach-Specific WhatsApp Enquiry Section */}
        <section id="enquiry-section" className="scroll-mt-24">
          <CoachEnquiryForm
            coach={coach}
            initialCentres={allCentres.map((c) => ({
              slug: c.slug,
              name: c.name,
              shortName: c.shortName,
            }))}
          />
        </section>
      </div>

      {/* Campaign Ending CTA */}
      <FinalCTA />
    </div>
  );
}
