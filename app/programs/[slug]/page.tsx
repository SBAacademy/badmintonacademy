import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock, Users, Calendar, ShieldCheck, ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import { PROGRAMS } from "@/data/programs";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { createMetadata, getFAQSchema, SITE_URL } from "@/lib/seo";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { CentreGallerySection } from "@/components/sections/CentreGallerySection";

interface ProgramDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PROGRAMS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProgramDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = PROGRAMS.find((p) => p.slug === slug);

  if (!program) {
    return { title: "Program Not Found" };
  }

  return createMetadata({
    title: `${program.name} in Kochi | S & A Badminton Academy`,
    description: `${program.shortDescription} Structured badminton coaching in Kochi across Kadavanthra, Edappally & Kakkanad.`,
    path: `/programs/${program.slug}`,
    keywords: [
      program.name,
      `${program.shortName} Kochi`,
      `${program.targetAge} badminton coaching`,
      "badminton training Ernakulam",
    ],
    ogImage: program.image,
  });
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { slug } = await params;
  const program = PROGRAMS.find((p) => p.slug === slug);

  if (!program) {
    notFound();
  }

  // Schema for Course / Training Program
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: program.name,
    description: program.fullDescription,
    provider: {
      "@type": "SportsOrganization",
      name: "S & A BADMINTON ACADEMY",
      sameAs: SITE_URL,
    },
    educationalCredentialAwarded: "Certificate of Completion",
    timeRequired: program.duration,
  };

  const relatedPrograms = PROGRAMS.filter((p) => p.slug !== program.slug).slice(0, 3);

  return (
    <div className="py-8 sm:py-12 bg-[#090D16]">
      <SEOJsonLd schema={courseSchema} />
      {program.faqs && program.faqs.length > 0 && (
        <SEOJsonLd schema={getFAQSchema(program.faqs)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: "Programs", url: "/programs" },
            { name: program.shortName, url: `/programs/${program.slug}` },
          ]}
        />

        {/* Hero Banner for Program */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                {program.badge}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                {program.skillLevel}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {program.name}
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              {program.fullDescription}
            </p>

            {/* Quick Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2">
              <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Session Length</span>
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">{program.duration}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Coach Ratio</span>
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">{program.batchRatio}</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Batch Timings</span>
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">{program.schedule}</div>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#B8F000] hover:bg-[#c7fb1e] text-[#07100A] font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>BOOK A FREE TRIAL</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={buildWhatsAppUrl({ programName: program.name })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#121A23] hover:bg-[#17212C] text-[#F8FAFC] font-semibold text-sm flex items-center justify-center gap-2 border border-[#26313D] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                  <span>WHATSAPP US</span>
                </a>
              </div>

              <p className="text-xs font-mono text-[#A8B0BA] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8F000]" />
                Shoes &amp; racket required for free trial.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-square border border-slate-700 shadow-2xl">
              <Image
                src={program.image}
                alt={`${program.name} badminton training in Kochi`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#090D16]/90 backdrop-blur-md border border-slate-800">
                <div className="text-xs font-bold text-white">{program.tagline}</div>
                <div className="text-[11px] text-emerald-400 mt-0.5">
                  Conducted at Kadavanthra, Edappally & Kakkanad
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column: Curriculum & Benefits on Left, Booking Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          
          <div className="lg:col-span-7 space-y-12">
            
            {/* Step-by-Step Curriculum */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Syllabus & Progression
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Program Curriculum Breakdown
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Each phase is mastered before an athlete moves to higher-pressure drills.
                </p>
              </div>

              <div className="space-y-4">
                {program.curriculum.map((curr, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-white">{curr.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 pl-8 leading-relaxed">
                      {curr.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Who It Is Suitable For */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Who Is This Program Best For?
              </h3>
              <ul className="space-y-2.5">
                {program.suitableFor.map((item, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Core Training Highlights */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Training Infrastructure Highlights</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                {program.trainingHighlights.map((hl, hlIdx) => (
                  <div key={hlIdx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Program Specific FAQs */}
            {program.faqs && program.faqs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {program.faqs.map((faq, fIdx) => (
                    <div
                      key={fIdx}
                      className="p-5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2"
                    >
                      <div className="font-bold text-sm sm:text-base text-white">
                        {faq.question}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right: Sticky Booking Form */}
          <div className="lg:col-span-5">
            <div className="sticky top-28" id="booking-form">
              <EnquiryForm initialProgram={program.slug} />
            </div>
          </div>

        </div>

        {/* Related Programs Section */}
        <div className="pt-12 border-t border-slate-800/80 mb-16">
          <h3 className="text-xl font-bold text-white mb-6">Explore Other Training Pathways</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPrograms.map((rel) => (
              <Link
                key={rel.slug}
                href={`/programs/${rel.slug}`}
                className="group p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    {rel.badge}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">
                    {rel.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {rel.shortDescription}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Training Facilities & Courts Gallery */}
      <CentreGallerySection
        eyebrow="FACILITIES // S&A CENTRES"
        title="TRAINING COURTS & ARENA GALLERY"
        description="Our coaching sessions take place on international-standard BWF courts equipped with glare-free illumination and anti-injury flooring."
      />

      <FinalCTA />
    </div>
  );
}
