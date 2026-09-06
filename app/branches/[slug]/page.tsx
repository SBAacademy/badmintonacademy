import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  Navigation, 
  MessageCircle, 
  Sparkles, 
  Award, 
  ArrowRight,
  HelpCircle 
} from "lucide-react";
import { BRANCHES } from "@/data/branches";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { createMetadata, getBranchLocalBusinessSchema, getFAQSchema } from "@/lib/seo";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { FinalCTA } from "@/components/sections/FinalCTA";

interface BranchDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BRANCHES.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: BranchDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const branch = BRANCHES.find((b) => b.slug === slug);

  if (!branch) {
    return { title: "Branch Not Found" };
  }

  return createMetadata({
    title: `${branch.name} | Badminton Coaching Near Me`,
    description: `${branch.description} Certified badminton coaching in ${branch.cityArea}, Kochi. ${branch.courtsCount} BWF synthetic courts on sprung teakwood.`,
    path: `/branches/${branch.slug}`,
    keywords: [
      `badminton academy ${branch.cityArea}`,
      `badminton coaching ${branch.cityArea}`,
      `badminton classes ${branch.shortName}`,
      "badminton court booking Kochi",
      "badminton coaching near me",
    ],
    ogImage: branch.image,
  });
}

export default async function BranchDetailPage({ params }: BranchDetailPageProps) {
  const { slug } = await params;
  const branch = BRANCHES.find((b) => b.slug === slug);

  if (!branch) {
    notFound();
  }

  const localBusinessSchema = getBranchLocalBusinessSchema({
    name: branch.name,
    slug: branch.slug,
    description: branch.description,
    address: branch.address,
    city: branch.city,
    state: branch.state,
    pincode: branch.pincode,
    phone: branch.phone,
    email: branch.email,
    geo: branch.geo,
    image: branch.image,
    timings: branch.timings,
  });

  const otherBranches = BRANCHES.filter((b) => b.slug !== branch.slug);

  return (
    <div className="py-8 sm:py-12 bg-[#090D16]">
      {/* Schema Injection */}
      <SEOJsonLd schema={localBusinessSchema} />
      {branch.faqs && branch.faqs.length > 0 && (
        <SEOJsonLd schema={getFAQSchema(branch.faqs)} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { name: "Branches", url: "/branches" },
            { name: branch.shortName, url: `/branches/${branch.slug}` },
          ]}
        />

        {/* Branch Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                {branch.cityArea}
              </span>
              {branch.isHeadquarters && (
                <span className="px-3 py-1 rounded-full bg-emerald-500 text-[#090D16] text-xs font-black uppercase tracking-wider">
                  Academy Central HQ
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {branch.name}
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              {branch.description}
            </p>

            {/* Quick Specs Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
              <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Court Specification</span>
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">
                  {branch.courtsCount} BWF Courts ({branch.courtType})
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Operational Timings</span>
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">
                  {branch.timings.morning} & {branch.timings.evening}
                </div>
              </div>
            </div>

            {/* Direct Conversion Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#enquiry-section"
                className="px-7 py-3.5 rounded-xl bg-[#B8F000] hover:bg-[#c7fb1e] text-[#07100A] font-extrabold text-sm flex items-center gap-2 shadow-sm transition-all"
              >
                <span>BOOK A FREE TRIAL</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={buildWhatsAppUrl({ branchName: branch.name })}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-[#121A23] hover:bg-[#17212C] text-[#F8FAFC] font-semibold text-sm flex items-center gap-2 border border-[#26313D] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                <span>WHATSAPP US</span>
              </a>

              <a
                href={branch.googleMapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-xl bg-[#080B10] hover:bg-[#17212C] text-[#A7B0BC] hover:text-[#F8FAFC] font-semibold text-sm flex items-center gap-1.5 border border-[#26313D] transition-colors"
              >
                <Navigation className="w-4 h-4 text-[#B8F000]" />
                <span>Get Route</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-square border border-slate-700 shadow-2xl">
              <Image
                src={branch.courtImage}
                alt={`${branch.name} court view`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-transparent opacity-80" />

              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#090D16]/90 backdrop-blur-md border border-slate-800">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{branch.lightingStandard}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Coach in Charge: <strong className="text-emerald-300">{branch.headCoachName}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column: Local SEO Content & Amenities on Left, Booking Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20" id="enquiry-section">
          
          <div className="lg:col-span-7 space-y-12">
            
            {/* Local SEO Editorial Content */}
            <div className="p-8 rounded-3xl bg-[#111827] border border-slate-800 space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Local Badminton Training Hub
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {branch.localSeoContent.heading}
                </h2>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {branch.localSeoContent.intro}
              </p>

              <div className="space-y-2 pt-2">
                <h3 className="text-base font-bold text-white">Why Train at This Branch?</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {branch.localSeoContent.whyThisBranch}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-base font-bold text-white">Transit & Metro Accessibility</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {branch.localSeoContent.connectivity}
                </p>
              </div>
            </div>

            {/* Complete Facility Amenities List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Arena Amenities & Court Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {branch.facilities.map((facility, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Programs Available at this Branch */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Coaching Programs Available at {branch.shortName}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {branch.programsAvailable.map((prog, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-3 rounded-xl bg-[#111827] border border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{prog}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Embedded Google Map Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Location & Directions
                </h3>
                <a
                  href={branch.googleMapDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Open in Google Maps</span>
                  <Navigation className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl aspect-[16/9] w-full bg-slate-900">
                <iframe
                  title={`Google Maps location for ${branch.name}`}
                  src={branch.googleMapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full grayscale-[30%] contrast-[110%]"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
                <div>
                  <span className="font-bold text-white">Full Address: </span>
                  {branch.address}
                </div>
                <a
                  href={`tel:${branch.phone}`}
                  className="font-bold text-emerald-400 hover:underline shrink-0"
                >
                  Direct: {branch.phoneDisplay}
                </a>
              </div>
            </div>

            {/* Local Branch FAQs */}
            {branch.faqs && branch.faqs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-400" />
                  <span>Frequently Asked Questions about {branch.shortName}</span>
                </h3>
                <div className="space-y-3">
                  {branch.faqs.map((faq, fIdx) => (
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

          {/* Right: Booking Form */}
          <div className="lg:col-span-5">
            <div className="sticky top-28">
              <EnquiryForm initialBranch={branch.slug} />
            </div>
          </div>

        </div>

        {/* Other Branches Section */}
        <div className="pt-12 border-t border-slate-800/80 mb-16">
          <h3 className="text-xl font-bold text-white mb-6">Explore Other Training Hubs in Kochi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {otherBranches.map((other) => (
              <Link
                key={other.slug}
                href={`/branches/${other.slug}`}
                className="group p-6 rounded-2xl bg-[#111827] border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    {other.cityArea}
                  </span>
                  <h4 className="text-lg font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">
                    {other.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {other.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span>{other.courtsCount} BWF Courts</span>
                  <div className="flex items-center gap-1">
                    <span>View Arena</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      <FinalCTA />
    </div>
  );
}
