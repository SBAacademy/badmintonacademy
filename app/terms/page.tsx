import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { ACADEMY_DATA } from "@/data/academy";

export const metadata: Metadata = createMetadata({
  title: "Terms & Conditions | SBA Badminton Academy",
  description: "Terms and conditions, court code of conduct, and coaching policies of SBA Badminton Academy.",
  path: "/terms",
  noIndex: true,
});

export default function TermsPage() {
  return (
    <div className="py-8 sm:py-12 bg-[#090D16]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ name: "Terms of Training", url: "/terms" }]} />

        <div className="space-y-6 text-slate-300 text-sm leading-relaxed mb-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Terms of Training & Court Code of Conduct
          </h1>

          <p>Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</p>

          <h2 className="text-xl font-bold text-white pt-4">1. Footwear & Court Etiquette</h2>
          <p>
            Non-marking indoor badminton court shoes are strictly mandatory across all branches (Kadavanthra, Kumbalanghi, Maradu, Palluruthy, and Chullikal). Shoes worn on outdoor roads or soil must not be stepped onto the synthetic courts.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">2. Session Punctuality & Attendance</h2>
          <p>
            Students must arrive 10 minutes prior to scheduled batch times for dynamic warm-ups and injury prevention stretches. Missed sessions without 24-hour advance notice cannot be refunded.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">3. Code of Sportsmanship</h2>
          <p>
            Respect for coaches, referees, fellow athletes, and facility staff is non-negotiable. Unsportsmanlike conduct, racket throwing, or profanity will result in immediate suspension from academy premises.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">4. Health & Medical Clearance</h2>
          <p>
            Parents and adult players must disclose any pre-existing cardiovascular, respiratory, or musculoskeletal conditions prior to commencing high-intensity athletic drilling.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">5. Governing Law</h2>
          <p>
            These terms are governed by the laws of Kerala, India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Ernakulam/Kochi.
          </p>
        </div>
      </div>
    </div>
  );
}
