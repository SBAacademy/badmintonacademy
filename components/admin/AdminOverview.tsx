"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  CalendarCheck,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  Phone,
  MessageCircle,
  AlertCircle,
  Plus,
  CheckCircle2,
  ChevronRight,
  Download,
  UserPlus,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import { LeadItem } from "@/lib/db";
import { AdminTab } from "./AdminSidebar";
import { Centre } from "@/data/centres";

interface AdminOverviewProps {
  leads: LeadItem[];
  onSelectLead: (lead: LeadItem) => void;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  onNavigateTab: (tab: AdminTab) => void;
}

export function AdminOverview({
  leads,
  onSelectLead,
  onOpenAddModal,
  onExportCSV,
  onNavigateTab,
}: AdminOverviewProps) {
  const [activeCentres, setActiveCentres] = useState<Centre[]>([]);

  useEffect(() => {
    fetch("/api/centres", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items)) {
          setActiveCentres(data.items);
        }
      })
      .catch((err) => console.error("Failed to load centres in AdminOverview:", err));
  }, []);

  const newLeads = leads.filter((l) => l.status === "NEW");
  const contactedLeads = leads.filter((l) => l.status === "CONTACTED");
  const trialLeads = leads.filter((l) => l.status === "TRIAL_SCHEDULED");
  const enrolledLeads = leads.filter((l) => l.status === "ENROLLED");

  // Dynamic Centres inquiries count
  const centreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activeCentres.forEach((c) => {
      counts[c.slug] = 0;
    });
    leads.forEach((l) => {
      const key = l.branch?.toLowerCase();
      if (key) {
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [leads, activeCentres]);

  // Recent 5 leads that need attention (NEW first, then CONTACTED)
  const urgentLeads = [...newLeads, ...contactedLeads].slice(0, 5);

  const getCleanPhone = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, "");
    return clean.length === 10 ? `91${clean}` : clean;
  };

  return (
    <div className="space-y-7">
      
      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div
          onClick={() => onNavigateTab("leads")}
          className="p-5 rounded-2xl bg-[#0D111A] border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>TOTAL INQUIRIES</span>
            <Users className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {leads.length}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <span>View all leads</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Needs Action / New */}
        <div
          onClick={() => onNavigateTab("leads")}
          className="p-5 rounded-2xl bg-[#0D111A] border border-amber-500/30 hover:border-amber-500/50 transition-all cursor-pointer shadow-sm group relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-amber-400" />
          <div className="flex items-center justify-between text-amber-400 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              NEEDS CALL / NEW
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300 mt-2">
            {newLeads.length}
          </div>
          <div className="text-xs text-amber-400/80 mt-1">
            Awaiting first contact
          </div>
        </div>

        {/* Trials Scheduled */}
        <div
          onClick={() => onNavigateTab("leads")}
          className="p-5 rounded-2xl bg-[#0D111A] border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>TRIALS BOOKED</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2">
            {trialLeads.length}
          </div>
          <div className="text-xs text-indigo-400 mt-1">
            Trial sessions on court
          </div>
        </div>

        {/* Enrolled */}
        <div
          onClick={() => onNavigateTab("leads")}
          className="p-5 rounded-2xl bg-[#0D111A] border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ENROLLED STUDENTS</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            {enrolledLeads.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Active academy members
          </div>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="p-4 rounded-2xl bg-[#0A0E17] border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Quick Actions:
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-3.5 py-2 rounded-xl bg-[#B8F000] hover:bg-[#cbf722] text-black font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Walk-in Lead</span>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#B8F000]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("gallery")}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Upload Court Photos</span>
          </button>
        </div>
      </div>

      {/* 2-Column Content: Urgent Follow-ups & Centre Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Priority Follow-ups */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Priority Follow-ups (New &amp; Inbound)</span>
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab("leads")}
              className="text-xs font-semibold text-[#B8F000] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all inquiries</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {urgentLeads.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0D111A] border border-slate-800 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">All caught up!</div>
              <p className="text-xs text-slate-400 mt-1">
                There are no pending new inquiries waiting for contact.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {urgentLeads.map((lead) => {
                const isNew = lead.status === "NEW";
                const phone = getCleanPhone(lead.phone);
                const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
                  `Hello ${lead.name}, this is SBA Badminton Academy Kochi. We received your inquiry and would like to schedule a free trial session for you!`
                )}`;

                return (
                  <div
                    key={lead.id}
                    className="p-4 rounded-2xl bg-[#0D111A] border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    {/* Left details */}
                    <div
                      onClick={() => onSelectLead(lead)}
                      className="cursor-pointer space-y-1 flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {lead.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isNew
                              ? "bg-amber-400/10 text-amber-400 border border-amber-400/30"
                              : "bg-sky-400/10 text-sky-400 border border-sky-400/30"
                          }`}
                        >
                          {isNew ? "New Lead" : "Contacted"}
                        </span>
                        <span className="text-xs text-slate-500 hidden sm:inline">
                          {new Date(lead.submittedAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="capitalize flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#B8F000]" />
                          {lead.branch.replace("-", " ")}
                        </span>
                        <span className="capitalize">{lead.program.replace(/-/g, " ")}</span>
                        <span>{lead.ageCategory}</span>
                      </div>
                    </div>

                    {/* Right Communication buttons */}
                    <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${lead.phone}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#B8F000]" />
                        <span>Call</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => onSelectLead(lead)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="View Full Profile & Notes"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Centre Breakdown & Quick Guide */}
        <div className="space-y-6">
          {/* Centre Distribution */}
          <div className="p-5 rounded-2xl bg-[#0D111A] border border-slate-800/80 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#B8F000]" />
              <span>Inquiries by Centre</span>
            </h3>

            <div className="space-y-3">
              {activeCentres.map((c, i) => {
                const count = centreCounts[c.slug] || 0;
                const colors = ["bg-[#B8F000]", "bg-sky-400", "bg-purple-400", "bg-emerald-400", "bg-amber-400"];
                const textColors = ["text-[#B8F000]", "text-sky-400", "text-purple-400", "text-emerald-400", "text-amber-400"];
                const color = colors[i % colors.length];
                const textColor = textColors[i % textColors.length];
                const pct = leads.length ? Math.min(100, Math.round((count / leads.length) * 100)) : 0;
                return (
                  <div key={c.slug}>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                      <span>{c.shortName || c.name}</span>
                      <span className={`font-bold ${textColor}`}>{count}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs space-y-2 text-slate-400">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>Pipeline Stage Guide</span>
            </div>
            <p>
              <strong>New:</strong> Inquiries directly from the website. Call or WhatsApp parent.
            </p>
            <p>
              <strong>Trial Booked:</strong> Student confirmed date to visit for coach assessment.
            </p>
            <p>
              <strong>Enrolled:</strong> Student joined monthly/annual batch.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
