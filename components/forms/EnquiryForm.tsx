"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, AlertCircle, Send, MessageCircle, Loader2 } from "lucide-react";
import { BRANCHES } from "@/data/branches";
import { PROGRAMS } from "@/data/programs";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

interface EnquiryFormProps {
  initialBranch?: string;
  initialProgram?: string;
}

export function EnquiryForm({ initialBranch = "", initialProgram = "" }: EnquiryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    ageCategory: "Junior (Ages 10-16)",
    preferredBranch: initialBranch || "kadavanthra",
    preferredProgram: initialProgram || "junior-badminton-coaching",
    preferredSlot: "Evening (04:30 PM - 07:30 PM)",
    message: "",
    botAddress: "",
  });

  const [utmParams, setUtmParams] = useState({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      setUtmParams({
        utm_source: urlParams.get("utm_source") || "direct",
        utm_medium: urlParams.get("utm_medium") || "website",
        utm_campaign: urlParams.get("utm_campaign") || "organic",
      });
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.botAddress.trim() !== "") {
      setSuccess(true);
      return;
    }

    const cleanPhone = formData.phone.replace(/[^0-9+]/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number so our coach can reach you.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ...utmParams,
          submittedAt: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        trackEvent("generate_lead", {
          branch: formData.preferredBranch,
          program: formData.preferredProgram,
        });

        try {
          confetti({
            particleCount: 70,
            spread: 55,
            origin: { y: 0.7 },
            colors: ["#B8F000", "#22C55E", "#F8FAFC"],
          });
        } catch {}
      } else {
        setError(result.message || "Unable to submit enquiry. Please try WhatsApp directly.");
      }
    } catch {
      setError("Network connection issue. Please contact us via WhatsApp directly.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const selectedBranchObj = BRANCHES.find((b) => b.slug === formData.preferredBranch);
    const selectedProgramObj = PROGRAMS.find((p) => p.slug === formData.preferredProgram);

    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-[#121A23] border border-[#26313D] shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-[#080B10] text-[#B8F000] flex items-center justify-center mx-auto border border-[#26313D]">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black text-[#F8FAFC]">
            Trial Request Received
          </h3>
          <p className="text-sm text-[#A7B0BC] max-w-md mx-auto leading-relaxed">
            Thank you, <strong className="text-[#F8FAFC]">{formData.name}</strong>. Our admissions coach at the{" "}
            <strong className="text-[#B8F000]">{selectedBranchObj?.shortName || "Kochi Academy"}</strong> will call you at{" "}
            <strong className="text-[#F8FAFC]">{formData.phone}</strong> within 2 hours to confirm your free slot.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#080B10] border border-[#26313D] text-xs text-[#A7B0BC] space-y-1 max-w-sm mx-auto text-left">
          <div><span className="font-semibold text-[#F8FAFC]">Selected Track:</span> {selectedProgramObj?.name || formData.preferredProgram}</div>
          <div><span className="font-semibold text-[#F8FAFC]">Preferred Slot:</span> {formData.preferredSlot}</div>
          <div><span className="font-semibold text-[#F8FAFC]">Target Arena:</span> {selectedBranchObj?.landmark || "Central Kochi"}</div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={buildWhatsAppUrl({
              branchName: selectedBranchObj?.shortName,
              programName: selectedProgramObj?.shortName,
              customMessage: `Hello S&A Academy! I just submitted a trial booking for ${formData.name} at ${selectedBranchObj?.shortName}. Could you share batch availability?`
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#B8F000] hover:bg-[#c7fb1e] text-[#07100A] font-extrabold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Connect on WhatsApp Now</span>
          </a>

          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#080B10] hover:bg-[#17212C] text-[#A7B0BC] hover:text-[#F8FAFC] text-xs font-semibold border border-[#26313D] transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 rounded-3xl bg-[#121A23] border border-[#26313D] shadow-2xl relative overflow-hidden">
      {/* Top Subtle Line */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-[#B8F000]" />

      <div className="mb-7 space-y-2 text-left">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-[#B8F000]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#B8F000]">
            FREE ASSESSMENT SESSION
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
          Book a Free Trial Session
        </h3>
        <p className="text-xs sm:text-sm text-[#A7B0BC]">
          Experience our BWF sprung wooden courts and receive a coach evaluation. No equipment required.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        
        {/* Anti-spam honeypot */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            id="botAddress"
            name="botAddress"
            value={formData.botAddress}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#A7B0BC] uppercase tracking-wider mb-1.5">
              Player / Parent Name <span className="text-[#B8F000]">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Nair"
              className="w-full px-4 py-3 rounded-xl bg-[#080B10] border border-[#26313D] text-[#F8FAFC] placeholder-[#6B7280] text-base sm:text-sm focus:outline-none focus:border-[#B8F000] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A7B0BC] uppercase tracking-wider mb-1.5">
              WhatsApp / Phone Number <span className="text-[#B8F000]">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +91 94006 XXXXX"
              className="w-full px-4 py-3 rounded-xl bg-[#080B10] border border-[#26313D] text-[#F8FAFC] placeholder-[#6B7280] text-base sm:text-sm focus:outline-none focus:border-[#B8F000] transition-colors"
            />
          </div>
        </div>

        {/* Email & Age Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#A7B0BC] uppercase tracking-wider mb-1.5">
              Email Address <span className="text-[#6B7280]">(Optional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="rahul@example.com"
              className="w-full px-4 py-3 rounded-xl bg-[#080B10] border border-[#26313D] text-[#F8FAFC] placeholder-[#6B7280] text-base sm:text-sm focus:outline-none focus:border-[#B8F000] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A7B0BC] uppercase tracking-wider mb-1.5">
              Age Category <span className="text-[#B8F000]">*</span>
            </label>
            <select
              name="ageCategory"
              value={formData.ageCategory}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-[#080B10] border border-[#26313D] text-[#F8FAFC] text-base sm:text-sm focus:outline-none focus:border-[#B8F000] transition-colors"
            >
              <option value="Kids (Ages 5-9)">Kids (Ages 5–9)</option>
              <option value="Junior (Ages 10-16)">Junior (Ages 10–16)</option>
              <option value="Adult / Corporate (18+) ">Adult / Corporate (18+)</option>
              <option value="Competitive Tournament Athlete">Competitive Tournament Athlete</option>
            </select>
          </div>
        </div>

        {/* Preferred Branch & Program */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#A7B0BC] uppercase tracking-wider mb-1.5">
              Preferred Kochi Branch <span className="text-[#B8F000]">*</span>
            </label>
            <select
              name="preferredBranch"
              value={formData.preferredBranch}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-[#080B10] border border-[#26313D] text-[#F8FAFC] text-base sm:text-sm focus:outline-none focus:border-[#B8F000] transition-colors"
            >
              {BRANCHES.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A7B0BC] uppercase tracking-wider mb-1.5">
              Preferred Program
            </label>
            <select
              name="preferredProgram"
              value={formData.preferredProgram}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-[#080B10] border border-[#26313D] text-[#F8FAFC] text-base sm:text-sm focus:outline-none focus:border-[#B8F000] transition-colors"
            >
              {PROGRAMS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preferred Slot */}
        <div>
          <label className="block text-xs font-bold text-[#A7B0BC] uppercase tracking-wider mb-1.5">
            Preferred Time Slot
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              "Morning (06:00 AM - 08:30 AM)",
              "Evening (04:30 PM - 07:30 PM)",
              "Late Night (08:00 PM+)",
            ].map((slot) => (
              <label
                key={slot}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                  formData.preferredSlot === slot
                    ? "bg-[#080B10] border-[#B8F000] text-[#B8F000] font-bold"
                    : "bg-[#080B10] border-[#26313D] text-[#6B7280] hover:border-[#374758] hover:text-[#A7B0BC]"
                }`}
              >
                <input
                  type="radio"
                  name="preferredSlot"
                  value={slot}
                  checked={formData.preferredSlot === slot}
                  onChange={handleChange}
                  className="text-[#B8F000] focus:ring-0"
                />
                <span className="truncate">{slot}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-bold text-[#A7B0BC] uppercase tracking-wider mb-1.5">
            Specific Goals or Player Level <span className="text-[#6B7280]">(Optional)</span>
          </label>
          <textarea
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            placeholder="e.g. Complete beginner, or junior preparing for school badminton team trials..."
            className="w-full px-4 py-3 rounded-xl bg-[#080B10] border border-[#26313D] text-[#F8FAFC] placeholder-[#6B7280] text-base sm:text-sm focus:outline-none focus:border-[#B8F000] transition-colors"
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-[#B8F000] hover:bg-[#c7fb1e] text-[#07100A] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Confirming Free Slot...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>CONFIRM FREE TRIAL SLOT</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-[#6B7280] pt-1">
          🔒 Contact details are kept strictly private. No spam calls.
        </p>
      </form>
    </div>
  );
}
