import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { ACADEMY_DATA } from "@/data/academy";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy | S & A Badminton Academy",
  description: "Privacy policy for S & A Badminton Academy website, trial bookings, and student enquiry information.",
  path: "/privacy",
  noIndex: true,
});

export default function PrivacyPage() {
  return (
    <div className="py-8 sm:py-12 bg-[#090D16]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ name: "Privacy Policy", url: "/privacy" }]} />

        <div className="space-y-6 text-slate-300 text-sm leading-relaxed mb-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Privacy Policy
          </h1>

          <p>Last updated: {new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</p>

          <h2 className="text-xl font-bold text-white pt-4">1. Information We Collect</h2>
          <p>
            When you submit a trial booking request or enquiry on the {ACADEMY_DATA.name} website, we collect your name, contact phone number, email address (optional), player age group, and preferred branch/program.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">2. How We Use Your Information</h2>
          <p>
            Your information is used solely to contact you regarding coaching batch availability, court trial scheduling, and administrative communications. We do not sell, rent, or trade your personal data to third parties.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">3. WhatsApp & Telephone Communications</h2>
          <p>
            By submitting your phone number, you consent to receive direct telephone calls or WhatsApp messages from our official admissions desk for trial coordination. You may opt-out at any time by replying &ldquo;STOP&rdquo;.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">4. Data Security</h2>
          <p>
            We implement strict technical and organizational safeguards to ensure your lead information is transmitted securely and stored in protected administrative environments.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">5. Contact Us</h2>
          <p>
            If you have questions regarding our privacy practices, contact us at: <br />
            Email: <a href={`mailto:${ACADEMY_DATA.email}`} className="text-emerald-400">{ACADEMY_DATA.email}</a> <br />
            Phone: {ACADEMY_DATA.phoneDisplay}
          </p>
        </div>
      </div>
    </div>
  );
}
