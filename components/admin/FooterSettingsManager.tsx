"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Share2,
  Shield,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sliders,
  RotateCcw,
} from "lucide-react";
import { FooterSettings, DEFAULT_FOOTER_SETTINGS } from "@/data/footer";

export function FooterSettingsManager() {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_FOOTER_SETTINGS);
  const [initialLoadedSettings, setInitialLoadedSettings] = useState<FooterSettings>(DEFAULT_FOOTER_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"admissions" | "social" | "brand">("admissions");

  const fetchSettings = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/cms/footer");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setInitialLoadedSettings(data.settings);
      } else {
        // Fallback to public content endpoint if admin cms route has differences
        const pubRes = await fetch("/api/content/footer");
        const pubData = await pubRes.json();
        if (pubData.success && pubData.settings) {
          setSettings(pubData.settings);
          setInitialLoadedSettings(pubData.settings);
        }
      }
    } catch (err) {
      console.error("Failed to load footer settings:", err);
      setFeedback({ type: "error", text: "Failed to load footer settings from database." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field: keyof FooterSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset all footer and admissions settings to system defaults?")) {
      setSettings(DEFAULT_FOOTER_SETTINGS);
      setFeedback({ type: "success", text: "Reset form to system defaults. Click 'Save Settings' to publish." });
    }
  };

  const handleDiscardChanges = () => {
    setSettings(initialLoadedSettings);
    setFeedback(null);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/cms/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const saved = data.settings || settings;
        setSettings(saved);
        setInitialLoadedSettings(saved);
        setFeedback({
          type: "success",
          text: "Footer & Admissions Desk settings saved and published to the live website!",
        });
      } else {
        // Try fallback to content route
        const fallbackRes = await fetch("/api/content/footer", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings }),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok && fallbackData.success) {
          const saved = fallbackData.settings || settings;
          setSettings(saved);
          setInitialLoadedSettings(saved);
          setFeedback({
            type: "success",
            text: "Footer settings updated successfully!",
          });
        } else {
          setFeedback({
            type: "error",
            text: data.error || data.message || "Failed to update footer settings.",
          });
        }
      }
    } catch (err) {
      console.error("Error saving footer settings:", err);
      setFeedback({ type: "error", text: "Network error while saving footer settings." });
    } finally {
      setSaving(false);
    }
  };

  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialLoadedSettings);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <Loader2 className="w-8 h-8 text-[#B8F000] animate-spin" />
        <p className="text-sm text-slate-400">Loading admissions &amp; footer settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Actions Bar */}
      <div className="bg-[#0D111A] border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#B8F000]/10 border border-[#B8F000]/30 text-[#B8F000] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Footer &amp; Admissions Desk Configuration
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Update headquarters contact details, operating hours, trial note, and official social media archive in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/#footer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <span>Live Preview</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          {isDirty && (
            <button
              type="button"
              onClick={handleDiscardChanges}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-transparent hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetToDefaults}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-colors cursor-pointer"
            title="Reset to initial factory defaults"
          >
            <span>Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#B8F000] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#a3d600] active:scale-95 transition-all shadow-[0_0_20px_rgba(184,240,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border text-xs ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{feedback.text}</div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Grid: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Tabs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("admissions")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "admissions"
                  ? "bg-[#B8F000] text-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Admissions Desk
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("social")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "social"
                  ? "bg-[#B8F000] text-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Social Media Handles
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("brand")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === "brand"
                  ? "bg-[#B8F000] text-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Brand &amp; Badges
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* TAB 1: Admissions Desk */}
            {activeTab === "admissions" && (
              <div className="bg-[#0D111A] border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
                  <MapPin className="w-4 h-4 text-[#B8F000]" />
                  <span>Headquarters &amp; Admissions Desk Details</span>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Campus / Headquarters Full Address
                  </label>
                  <textarea
                    rows={2}
                    value={settings.headquartersAddress}
                    onChange={(e) => handleChange("headquartersAddress", e.target.value)}
                    placeholder="SBA Sports Arena, Near Rajiv Gandhi Indoor Stadium, Kadavanthra, Kochi, Kerala 682020"
                    className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                  />
                  <p className="text-[11px] text-slate-500">
                    Renders with the map pin under the Admissions Desk column.
                  </p>
                </div>

                {/* Phone row: Dialable vs Display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#B8F000]" />
                      <span>Phone (Dialable Link)</span>
                    </label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+917907655513"
                      className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                    />
                    <p className="text-[10px] text-slate-500">E.164 format for tel: link (e.g. +917907655513)</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Phone Display Text
                    </label>
                    <input
                      type="text"
                      value={settings.phoneDisplay}
                      onChange={(e) => handleChange("phoneDisplay", e.target.value)}
                      placeholder="+91 79076 55513"
                      className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                    />
                    <p className="text-[10px] text-slate-500">Formatted text visible to users</p>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span>Official Admissions Email</span>
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="admissions@sabadminton.com"
                    className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                {/* Operating Hours: Days, Morning, Evening */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span>Operating Hours &amp; Batches</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400">Open Days</label>
                    <input
                      type="text"
                      value={settings.operatingHoursDays}
                      onChange={(e) => handleChange("operatingHoursDays", e.target.value)}
                      placeholder="Monday – Sunday (7 Days Open)"
                      className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400">Morning Timings</label>
                      <input
                        type="text"
                        value={settings.operatingHoursMorning}
                        onChange={(e) => handleChange("operatingHoursMorning", e.target.value)}
                        placeholder="05:30 AM – 10:30 AM"
                        className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400">Evening Timings</label>
                      <input
                        type="text"
                        value={settings.operatingHoursEvening}
                        onChange={(e) => handleChange("operatingHoursEvening", e.target.value)}
                        placeholder="04:00 PM – 10:00 PM"
                        className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                      />
                    </div>
                  </div>
                </div>

                {/* WhatsApp Desk Button & Number */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <MessageCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>WhatsApp Desk Direct Chat</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400">WhatsApp Number (digits only with country code)</label>
                      <input
                        type="text"
                        value={settings.whatsappNumber}
                        onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                        placeholder="917907655513"
                        className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400">Button CTA Label</label>
                      <input
                        type="text"
                        value={settings.whatsappButtonText}
                        onChange={(e) => handleChange("whatsappButtonText", e.target.value)}
                        placeholder="WHATSAPP DESK"
                        className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                      />
                    </div>
                  </div>

                  {/* Free Trial Note */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] text-slate-400">Trial Requirement Subtext Note</label>
                    <input
                      type="text"
                      value={settings.trialNote}
                      onChange={(e) => handleChange("trialNote", e.target.value)}
                      placeholder="Shoes & racket required for free trial."
                      className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                    />
                    <p className="text-[10px] text-slate-500">
                      Renders in mono under the WhatsApp Desk button in the footer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Social Media Handles */}
            {activeTab === "social" && (
              <div className="bg-[#0D111A] border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
                  <Share2 className="w-4 h-4 text-[#B8F000]" />
                  <span>Official Social Media Archive Handles</span>
                </div>
                <p className="text-xs text-slate-400">
                  Configure direct URLs for the social icon archive buttons in the footer.
                </p>

                {/* Instagram */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-pink-500" />
                      Instagram Profile URL
                    </span>
                    {settings.instagramUrl && (
                      <a
                        href={settings.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#B8F000] hover:underline flex items-center gap-1"
                      >
                        Test Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    value={settings.instagramUrl}
                    onChange={(e) => handleChange("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/sabadmintonacademy"
                    className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                {/* Facebook */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Facebook Page URL
                    </span>
                    {settings.facebookUrl && (
                      <a
                        href={settings.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#B8F000] hover:underline flex items-center gap-1"
                      >
                        Test Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    value={settings.facebookUrl}
                    onChange={(e) => handleChange("facebookUrl", e.target.value)}
                    placeholder="https://facebook.com/sabadmintonacademy"
                    className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                {/* YouTube */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      YouTube Channel URL
                    </span>
                    {settings.youtubeUrl && (
                      <a
                        href={settings.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#B8F000] hover:underline flex items-center gap-1"
                      >
                        Test Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    value={settings.youtubeUrl}
                    onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                    placeholder="https://youtube.com/@sabadmintonacademy"
                    className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                {/* Twitter / X */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      X (Formerly Twitter) Profile URL <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
                    </span>
                    {settings.twitterUrl && (
                      <a
                        href={settings.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#B8F000] hover:underline flex items-center gap-1"
                      >
                        Test Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    value={settings.twitterUrl || ""}
                    onChange={(e) => handleChange("twitterUrl", e.target.value)}
                    placeholder="https://x.com/sabadminton"
                    className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                {/* LinkedIn */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      LinkedIn Page URL <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
                    </span>
                    {settings.linkedinUrl && (
                      <a
                        href={settings.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#B8F000] hover:underline flex items-center gap-1"
                      >
                        Test Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    value={settings.linkedinUrl || ""}
                    onChange={(e) => handleChange("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/company/sabadmintonacademy"
                    className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Brand & Badges */}
            {activeTab === "brand" && (
              <div className="bg-[#0D111A] border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-sm font-bold text-white">
                  <Shield className="w-4 h-4 text-[#B8F000]" />
                  <span>Brand Identity &amp; Quality Badges</span>
                </div>

                {/* Academy Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Academy Display Name
                  </label>
                  <input
                    type="text"
                    value={settings.academyName || ""}
                    onChange={(e) => handleChange("academyName", e.target.value)}
                    placeholder="SBA BADMINTON ACADEMY"
                    className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                {/* Athletic Tagline */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Athletic Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.brandTagline}
                    onChange={(e) => handleChange("brandTagline", e.target.value)}
                    placeholder="REBEL PERFORMANCE // ATHLETIC TRAINING"
                    className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Footer Bio / Philosophy Description
                  </label>
                  <textarea
                    rows={4}
                    value={settings.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="SBA Badminton Academy is a premier athletic badminton training institution in Kochi..."
                    className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                {/* Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#B8F000]" />
                      <span>Quality Badge 1</span>
                    </label>
                    <input
                      type="text"
                      value={settings.badge1}
                      onChange={(e) => handleChange("badge1", e.target.value)}
                      placeholder="BWF & NIS CERTIFIED FACULTY"
                      className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#B8F000]" />
                      <span>Quality Badge 2</span>
                    </label>
                    <input
                      type="text"
                      value={settings.badge2}
                      onChange={(e) => handleChange("badge2", e.target.value)}
                      placeholder="SPRUNG WOODEN SUBFLOORS"
                      className="w-full bg-[#07090D] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                {isDirty ? "● Unsaved changes detected" : "All changes saved to database"}
              </span>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#B8F000] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#a3d600] active:scale-95 transition-all shadow-[0_0_20px_rgba(184,240,0,0.25)] disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save &amp; Publish Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Synced Dark Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B8F000] animate-pulse" />
                <span>Live Synced Website Preview</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Exact Dark Theme Styling</span>
            </div>

            {/* Themed Preview Box matching Footer.tsx */}
            <div className="bg-[#07090D] border border-[#1F2937] rounded-2xl p-6 text-[#A8B0BA] text-xs space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-[#B8F000]" />

              {/* Brand Header */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#26313D] shadow-sm shrink-0 bg-[#07090D]">
                  <Image
                    src="/images/logo.png"
                    alt="SBA"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="font-mono text-[9px] font-black tracking-[0.25em] text-[#B8F000] uppercase truncate">
                    {settings.brandTagline || "REBEL PERFORMANCE // ATHLETIC TRAINING"}
                  </div>
                  <div className="text-lg font-black text-white tracking-tight uppercase leading-tight truncate">
                    {settings.academyName || "SBA BADMINTON ACADEMY"}
                  </div>
                </div>
              </div>

              {/* Bio & Badges */}
              <div className="space-y-3">
                <p className="text-[11px] text-[#A8B0BA] leading-relaxed line-clamp-3">
                  {settings.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono font-bold bg-[#11161D] text-white border border-[#1F2937]">
                    <Shield className="w-2.5 h-2.5 text-[#B8F000]" />
                    {settings.badge1}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono font-bold bg-[#11161D] text-white border border-[#1F2937]">
                    <Sparkles className="w-2.5 h-2.5 text-[#B8F000]" />
                    {settings.badge2}
                  </span>
                </div>
              </div>

              {/* Social Archive Preview */}
              <div className="space-y-2 pt-2 border-t border-[#1F2937]">
                <div className="text-[9px] font-mono uppercase tracking-widest text-[#A8B0BA]/60">
                  OFFICIAL SOCIAL ARCHIVE
                </div>
                <div className="flex items-center space-x-2">
                  {settings.instagramUrl && (
                    <div className="w-7 h-7 bg-[#11161D] text-[#A8B0BA] flex items-center justify-center border border-[#1F2937]">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                  )}
                  {settings.facebookUrl && (
                    <div className="w-7 h-7 bg-[#11161D] text-[#A8B0BA] flex items-center justify-center border border-[#1F2937]">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.597 0 9 1.582 9 4.615V8z" />
                      </svg>
                    </div>
                  )}
                  {settings.youtubeUrl && (
                    <div className="w-7 h-7 bg-[#11161D] text-[#A8B0BA] flex items-center justify-center border border-[#1F2937]">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </div>
                  )}
                  {settings.twitterUrl && (
                    <div className="w-7 h-7 bg-[#11161D] text-[#A8B0BA] flex items-center justify-center border border-[#1F2937]">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                  )}
                  {settings.linkedinUrl && (
                    <div className="w-7 h-7 bg-[#11161D] text-[#A8B0BA] flex items-center justify-center border border-[#1F2937]">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Admissions Desk Column Preview */}
              <div className="space-y-3 pt-4 border-t border-[#1F2937]">
                <h4 className="text-white font-mono font-bold text-xs uppercase tracking-wider">
                  Admissions Desk
                </h4>

                <ul className="space-y-2 text-[11px]">
                  <li className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#B8F000] shrink-0 mt-0.5" />
                    <span>{settings.headquartersAddress}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#B8F000] shrink-0" />
                    <span className="font-mono text-white">{settings.phoneDisplay || settings.phone}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#B8F000] shrink-0" />
                    <span className="text-slate-300">{settings.email}</span>
                  </li>
                  <li className="flex items-start gap-2 pt-1">
                    <Clock className="w-3.5 h-3.5 text-[#B8F000] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-medium">{settings.operatingHoursDays}</div>
                      <div className="text-[10px] text-[#A8B0BA] font-mono">
                        {settings.operatingHoursMorning} | {settings.operatingHoursEvening}
                      </div>
                    </div>
                  </li>
                </ul>

                <div className="pt-2">
                  <div className="w-full py-2 px-3 bg-[#11161D] border border-[#1F2937] text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>{settings.whatsappButtonText || "WHATSAPP DESK"}</span>
                  </div>
                  <p className="text-[10px] font-mono text-[#A8B0BA] text-center pt-1.5">
                    {settings.trialNote}
                  </p>
                </div>
              </div>

              {/* Legal line */}
              <div className="pt-3 border-t border-[#1F2937] text-[10px] font-mono text-slate-500">
                &copy; {new Date().getFullYear()} {settings.academyName || "SBA BADMINTON ACADEMY"}. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

