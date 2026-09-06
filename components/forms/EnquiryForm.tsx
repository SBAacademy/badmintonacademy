"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, AlertCircle, Send, MessageCircle, Loader2 } from "lucide-react";
import { LOCATIONS } from "@/data/locations";
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
      const branchParam = urlParams.get("branch");
      const programParam = urlParams.get("program");

      setFormData((prev) => ({
        ...prev,
        preferredBranch: branchParam || prev.preferredBranch,
        preferredProgram: programParam || prev.preferredProgram,
      }));

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
    const selectedBranchObj = Object.values(LOCATIONS).find((b) => b.slug === formData.preferredBranch);
    const selectedProgramObj = PROGRAMS.find((p) => p.slug === formData.preferredProgram);

    return (
      <div className="p-8 sm:p-10 bg-[#0B0F14] border border-[#1F2937] text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 bg-[#07090D] text-[#B8F000] flex items-center justify-center mx-auto border border-[#1F2937]">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">
            Trial Request Confirmed
          </h3>
          <p className="text-sm text-[#A8B0BA] max-w-md mx-auto leading-relaxed">
            Thank you, <strong className="text-white">{formData.name}</strong>. Our admissions coach at the{" "}
            <strong className="text-[#B8F000]">{selectedBranchObj?.shortName || "Kochi Academy"}</strong> will contact you at{" "}
            <strong className="text-white">{formData.phone}</strong> within 2 hours to confirm your free slot.
          </p>
        </div>

        <div className="p-4 bg-[#07090D] border border-[#1F2937] text-xs text-[#A8B0BA] space-y-1 max-w-sm mx-auto text-left font-mono">
          <div><span className="font-bold text-white">SELECTED TRACK:</span> {selectedProgramObj?.name || formData.preferredProgram}</div>
          <div><span className="font-bold text-white">PREFERRED SLOT:</span> {formData.preferredSlot}</div>
          <div><span className="font-bold text-white">TARGET ARENA:</span> {selectedBranchObj?.address.split(",")[1]?.trim() || selectedBranchObj?.city || "Central Kochi"}</div>
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
            className="w-full sm:w-auto px-6 py-3.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Connect on WhatsApp Now</span>
          </a>

          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="w-full sm:w-auto px-5 py-3.5 bg-[#11161D] hover:bg-[#17212C] text-[#A8B0BA] hover:text-white text-xs font-bold uppercase tracking-wider border border-[#1F2937] transition-colors"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 bg-[#0B0F14] border border-[#1F2937] relative overflow-hidden">
      {/* Top Subtle Line */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-[#B8F000]" />

      <div className="mb-7 space-y-2 text-left">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
            REGISTRATION // TRIAL
          </span>
          <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
            FREE ASSESSMENT SESSION
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          Book a Free Trial Session
        </h3>
        <p className="text-xs sm:text-sm text-[#A8B0BA]">
          Experience our BWF sprung wooden courts and receive an individual coach evaluation. Zero equipment required.
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
            <label className="block text-xs font-mono font-bold text-[#A8B0BA] uppercase tracking-wider mb-1.5">
              Player / Parent Name <span className="text-[#B8F000]">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Nair"
              className="w-full px-4 py-3 bg-[#07090D] border border-[#1F2937] text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#B8F000] transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#A8B0BA] uppercase tracking-wider mb-1.5">
              WhatsApp / Phone Number <span className="text-[#B8F000]">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +91 94006 XXXXX"
              className="w-full px-4 py-3 bg-[#07090D] border border-[#1F2937] text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#B8F000] transition-colors font-mono"
            />
          </div>
        </div>

        {/* Email & Age Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold text-[#A8B0BA] uppercase tracking-wider mb-1.5">
              Email Address <span className="text-[#6B7280]">(Optional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="rahul@example.com"
              className="w-full px-4 py-3 bg-[#07090D] border border-[#1F2937] text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#B8F000] transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#A8B0BA] uppercase tracking-wider mb-1.5">
              Age Category <span className="text-[#B8F000]">*</span>
            </label>
            <select
              name="ageCategory"
              value={formData.ageCategory}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#07090D] border border-[#1F2937] text-white text-sm focus:outline-none focus:border-[#B8F000] transition-colors font-mono"
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
            <label className="block text-xs font-mono font-bold text-[#A8B0BA] uppercase tracking-wider mb-1.5">
              Preferred Kochi Centre <span className="text-[#B8F000]">*</span>
            </label>
            <select
              name="preferredBranch"
              value={formData.preferredBranch}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#07090D] border border-[#1F2937] text-white text-sm focus:outline-none focus:border-[#B8F000] transition-colors font-mono"
            >
              {Object.values(LOCATIONS).map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#A8B0BA] uppercase tracking-wider mb-1.5">
              Preferred Track
            </label>
            <select
              name="preferredProgram"
              value={formData.preferredProgram}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#07090D] border border-[#1F2937] text-white text-sm focus:outline-none focus:border-[#B8F000] transition-colors font-mono"
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
          <label className="block text-xs font-mono font-bold text-[#A8B0BA] uppercase tracking-wider mb-1.5">
            Preferred Training Slot
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              "Morning (06:00 AM - 08:30 AM)",
              "Evening (04:30 PM - 07:30 PM)",
              "Late Night (08:00 PM+)",
            ].map((slot) => (
              <label
                key={slot}
                className={`flex items-center gap-2 p-3 border text-xs cursor-pointer transition-colors font-mono ${
                  formData.preferredSlot === slot
                    ? "bg-[#07090D] border-[#B8F000] text-[#B8F000] font-bold"
                    : "bg-[#07090D] border-[#1F2937] text-[#A8B0BA] hover:border-[#B8F000]/60 hover:text-white"
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
          <label className="block text-xs font-mono font-bold text-[#A8B0BA] uppercase tracking-wider mb-1.5">
            Specific Goals or Player Level <span className="text-[#6B7280]">(Optional)</span>
          </label>
          <textarea
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            placeholder="e.g. Complete beginner, or junior preparing for school badminton team trials..."
            className="w-full px-4 py-3 bg-[#07090D] border border-[#1F2937] text-white placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#B8F000] transition-colors font-mono"
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 cursor-pointer shadow-md"
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

        <p className="text-[11px] font-mono text-center text-[#A8B0BA] pt-1">
          🔒 Contact details are kept strictly private. Direct coach confirmation.
        </p>
      </form>
    </div>
  );
}
