"use client";

import React, { useState, useEffect } from "react";
import { Send, MessageSquare, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Coach, formatWhatsAppDisplay } from "@/data/coaches";

interface CoachEnquiryFormProps {
  coach: Coach;
  initialCentres?: Array<{ slug: string; name: string; shortName?: string }>;
}

export function CoachEnquiryForm({ coach, initialCentres }: CoachEnquiryFormProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredCentre, setPreferredCentre] = useState(coach.primaryBranch || "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Centres
  const [centres, setCentres] = useState<Array<{ slug: string; name: string; shortName?: string }>>(initialCentres || []);
  const [loadingCentres, setLoadingCentres] = useState(!initialCentres || initialCentres.length === 0);
  const [centresError, setCentresError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCentres() {
      try {
        setLoadingCentres(true);
        setCentresError(null);
        const res = await fetch("/api/centres");
        const data = await res.json();
        if (isMounted) {
          if (data.success && Array.isArray(data.centres) && data.centres.length > 0) {
            setCentres(data.centres);
            if (!preferredCentre) {
              const matched = data.centres.find(
                (c: any) =>
                  c.slug === coach.primaryCentre ||
                  c.name === coach.primaryBranch ||
                  c.shortName === coach.primaryBranch
              );
              setPreferredCentre(matched ? (matched.shortName || matched.name) : (data.centres[0].shortName || data.centres[0].name));
            }
          } else {
            setCentresError("No active academy centres available.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load centres in CoachEnquiryForm:", err);
          setCentresError("Unable to load academy centres. Please check connection.");
        }
      } finally {
        if (isMounted) setLoadingCentres(false);
      }
    }

    loadCentres();
    return () => {
      isMounted = false;
    };
  }, [coach.primaryCentre, coach.primaryBranch]);

  const hasWhatsApp = Boolean(coach.whatsappNumber && coach.whatsappNumber.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!hasWhatsApp) {
      setErrorMessage("Direct WhatsApp enquiry is unavailable for this coach.");
      return;
    }

    setIsSubmitting(true);

    const coachUrl = typeof window !== "undefined"
      ? window.location.href
      : `https://www.soorajbadmintonacademy.in/coaches/${coach.slug || coach.id}`;

    const textLines = [
      `Hello S&A Badminton Academy,`,
      ``,
      `I am interested in training with Coach ${coach.name}.`,
      ``,
      `Name: ${name.trim()}`,
      age.trim() ? `Age: ${age.trim()}` : null,
      `Phone: ${cleanPhone}`,
      `Preferred Centre: ${preferredCentre}`,
      ``,
      `Message: ${message.trim() || "I would like to know more about the training schedule and coaching fees."}`,
      ``,
      `Source:`,
      `${coachUrl}`,
    ].filter(Boolean).join("\n");

    const whatsappUrl = `https://wa.me/${coach.whatsappNumber}?text=${encodeURIComponent(textLines)}`;

    setSubmitted(true);
    setIsSubmitting(false);

    // Open WhatsApp in new tab
    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="bg-[#0B0F14] border border-[#1F2937] p-6 sm:p-10 relative overflow-hidden">
      {/* Decorative Neon Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B8F000] to-transparent" />

      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B8F000]/10 border border-[#B8F000]/30 font-mono text-[11px] font-bold text-[#B8F000] uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>DIRECT COACH ENQUIRY</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Train with <span className="text-[#B8F000]">{coach.name}</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#A8B0BA] font-mono leading-relaxed">
            Fill out the details below to open a pre-filled WhatsApp message directly to {coach.name}’s faculty desk.
          </p>
        </div>


        {/* Success Banner */}
        {submitted && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 font-mono text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="font-bold uppercase tracking-wider">WhatsApp Opened in New Tab</span>
            </div>
            <p className="text-[#A8B0BA] text-[11px] leading-relaxed">
              Your message was pre-formatted. Tap <strong>Send</strong> in WhatsApp to deliver your enquiry directly to Coach {coach.name}.
            </p>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/40 text-rose-400 font-mono text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="enquiry-name" className="block text-[#A8B0BA] uppercase text-[10px] font-bold tracking-wider mb-1">
                Your Full Name *
              </label>
              <input
                id="enquiry-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Nair"
                className="w-full px-3.5 py-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000] text-xs transition-colors"
              />
            </div>

            <div>
              <label htmlFor="enquiry-age" className="block text-[#A8B0BA] uppercase text-[10px] font-bold tracking-wider mb-1">
                Player Age (Years)
              </label>
              <input
                id="enquiry-age"
                type="number"
                min="4"
                max="80"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 14 (or Adult)"
                className="w-full px-3.5 py-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000] text-xs transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="enquiry-phone" className="block text-[#A8B0BA] uppercase text-[10px] font-bold tracking-wider mb-1">
                Phone Number (WhatsApp) *
              </label>
              <input
                id="enquiry-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 98460 12345"
                className="w-full px-3.5 py-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000] text-xs transition-colors"
              />
            </div>

            <div>
              <label htmlFor="enquiry-centre" className="block text-[#A8B0BA] uppercase text-[10px] font-bold tracking-wider mb-1">
                Preferred Academy Centre *
              </label>
              {loadingCentres ? (
                <div className="w-full px-3.5 py-2.5 bg-[#07090D] border border-[#1F2937] text-slate-400 text-xs flex items-center gap-2 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B8F000]" />
                  <span>Loading centres...</span>
                </div>
              ) : centresError ? (
                <div className="w-full px-3.5 py-2 bg-rose-950/20 border border-rose-500/40 text-rose-300 text-[11px] font-mono">
                  {centresError}
                </div>
              ) : (
                <select
                  id="enquiry-centre"
                  required
                  value={preferredCentre}
                  onChange={(e) => setPreferredCentre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000] text-xs transition-colors"
                >
                  {centres.map((c) => {
                    const label = c.shortName || c.name;
                    return (
                      <option key={c.slug} value={label}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="enquiry-message" className="block text-[#A8B0BA] uppercase text-[10px] font-bold tracking-wider mb-1">
              Training Goals &amp; Questions (Optional)
            </label>
            <textarea
              id="enquiry-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Looking for competitive junior batch timing or private match conditioning slots..."
              className="w-full px-3.5 py-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000] text-xs transition-colors leading-relaxed"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !hasWhatsApp}
              className={`w-full py-3.5 px-6 font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                hasWhatsApp
                  ? "bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] shadow-lg shadow-[#B8F000]/10 hover:shadow-[#B8F000]/20 active:translate-y-0.5"
                  : "bg-[#1F2937] text-[#6B7280] cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {hasWhatsApp
                  ? "Open Direct WhatsApp Enquiry"
                  : "WhatsApp Enquiry Unavailable for this Coach"}
              </span>
            </button>
            {hasWhatsApp && (
              <p className="text-[10px] font-mono text-[#6B7280] text-center mt-2">
                Destination: {formatWhatsAppDisplay(coach.whatsappNumber)} &bull; Official WhatsApp Click-to-Chat
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
