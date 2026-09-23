"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Users,
  Phone,
  MessageCircle,
  Download,
  Plus,
  LayoutGrid,
  List,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { LeadItem } from "@/lib/db";
import { Centre } from "@/data/centres";
import { AGE_CATEGORIES } from "@/lib/constants";

interface AdminLeadsManagerProps {
  leads: LeadItem[];
  centres?: Centre[];
  onSelectLead: (lead: LeadItem) => void;
  onOpenAddModal: () => void;
  onStatusChange: (id: string, status: LeadItem["status"]) => Promise<void>;
  onExportCSV: () => void;
}

const STAGES: { id: string; label: string; stageKey?: LeadItem["status"]; color: string; bg: string }[] = [
  { id: "ALL", label: "All Inquiries", color: "text-slate-200", bg: "bg-slate-800" },
  { id: "NEW", label: "New Leads", stageKey: "NEW", color: "text-amber-400", bg: "bg-amber-400/10 border border-amber-400/30" },
  { id: "CONTACTED", label: "Contacted", stageKey: "CONTACTED", color: "text-sky-400", bg: "bg-sky-400/10 border border-sky-400/30" },
  { id: "TRIAL_SCHEDULED", label: "Trial Booked", stageKey: "TRIAL_SCHEDULED", color: "text-indigo-400", bg: "bg-indigo-400/10 border border-indigo-400/30" },
  { id: "ENROLLED", label: "Enrolled", stageKey: "ENROLLED", color: "text-emerald-400", bg: "bg-emerald-400/10 border border-emerald-400/30" },
  { id: "DROPPED", label: "Archived", stageKey: "DROPPED", color: "text-slate-400", bg: "bg-slate-800 border border-slate-700" },
];

export function AdminLeadsManager({
  leads,
  centres: initialCentres,
  onSelectLead,
  onOpenAddModal,
  onStatusChange,
  onExportCSV,
}: AdminLeadsManagerProps) {
  const [centres, setCentres] = useState<Centre[]>(initialCentres || []);
  const [activeStage, setActiveStage] = useState<string>("ALL");
  const [centreFilter, setCentreFilter] = useState<string>("ALL");
  const [ageCategoryFilter, setAgeCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  useEffect(() => {
    if (initialCentres && initialCentres.length > 0) {
      setCentres(initialCentres);
      return;
    }

    const fetchCentres = async () => {
      try {
        const res = await fetch("/api/centres", { cache: "no-store" });
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setCentres(data.items);
        }
      } catch (err) {
        console.error("Failed to load centres in AdminLeadsManager:", err);
      }
    };

    fetchCentres();
  }, [initialCentres]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((l) => {
        // Stage filter
        if (activeStage !== "ALL" && l.status !== activeStage) return false;

        // Centre filter
        if (centreFilter !== "ALL" && l.branch !== centreFilter) return false;

        // Age Category filter
        if (ageCategoryFilter !== "ALL" && l.ageCategory !== ageCategoryFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = l.name.toLowerCase().includes(q);
          const matchPhone = l.phone.includes(q);
          const matchEmail = l.email ? l.email.toLowerCase().includes(q) : false;
          const matchNotes = l.notes ? l.notes.toLowerCase().includes(q) : false;
          if (!matchName && !matchPhone && !matchEmail && !matchNotes) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [leads, activeStage, centreFilter, ageCategoryFilter, searchQuery]);

  // Stage counts
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: leads.length };
    STAGES.forEach((s) => {
      if (s.stageKey) {
        counts[s.id] = leads.filter((l) => l.status === s.stageKey).length;
      }
    });
    return counts;
  }, [leads]);

  const getCleanPhone = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, "");
    return clean.length === 10 ? `91${clean}` : clean;
  };

  const getStageBadge = (status: LeadItem["status"]) => {
    switch (status) {
      case "NEW":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
            New Lead
          </span>
        );
      case "CONTACTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-400/10 text-sky-400 border border-sky-400/30">
            Contacted
          </span>
        );
      case "TRIAL_SCHEDULED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-400/10 text-indigo-400 border border-indigo-400/30">
            Trial Booked
          </span>
        );
      case "ENROLLED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-400/10 text-emerald-400 border border-emerald-400/30">
            Enrolled 🎉
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
            Archived
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">

      {/* Stage Filter Buttons Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {STAGES.map((s) => {
          const count = stageCounts[s.id] || 0;
          const isActive = activeStage === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveStage(s.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#B8F000] text-black shadow-sm"
                  : "bg-[#0D111A] text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white"
              }`}
            >
              <span>{s.label}</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                  isActive ? "bg-black text-[#B8F000]" : "bg-slate-800 text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0D111A] border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or phone..."
            className="w-full pl-9 pr-3 py-2 bg-[#090C12] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
          />
        </div>

        {/* Right side controls: Centre filter, View switcher, Add button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* Centre Dropdown */}
          <select
            value={centreFilter}
            onChange={(e) => setCentreFilter(e.target.value)}
            className="px-3 py-2 bg-[#090C12] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-[#B8F000]"
          >
            <option value="ALL">All Centres</option>
            {centres.map((loc) => (
              <option key={loc.slug} value={loc.slug}>
                {loc.shortName || loc.name}
              </option>
            ))}
          </select>

          {/* Age Category Filter */}
          <select
            value={ageCategoryFilter}
            onChange={(e) => setAgeCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#090C12] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-[#B8F000]"
          >
            <option value="ALL">All Age Categories</option>
            {AGE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#090C12] p-1 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "cards" ? "bg-[#B8F000] text-black" : "text-slate-400 hover:text-white"
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "list" ? "bg-[#B8F000] text-black" : "text-slate-400 hover:text-white"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={onExportCSV}
            className="p-2 bg-[#090C12] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-[#B8F000]" />
          </button>
        </div>

      </div>

      {/* Leads Content */}
      {filteredLeads.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0D111A] border border-slate-800 text-center text-slate-400 space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-base font-bold text-white">No inquiries found</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery || centreFilter !== "ALL" || activeStage !== "ALL"
              ? "Try adjusting your search terms or filters to see inquiries."
              : "No student inquiries have been recorded yet."}
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="mt-2 px-4 py-2 rounded-xl bg-[#B8F000] text-black font-bold text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Inquiry</span>
          </button>
        </div>
      ) : viewMode === "cards" ? (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => {
            const phone = getCleanPhone(lead.phone);
            const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
              `Hello ${lead.name}, this is S&A Badminton Academy Kochi regarding your badminton coaching inquiry. We'd love to schedule your free trial session!`
            )}`;

            return (
              <div
                key={lead.id}
                className="p-5 rounded-2xl bg-[#0D111A] border border-slate-800/90 hover:border-slate-700 flex flex-col justify-between gap-4 transition-all shadow-sm"
              >
                {/* Header info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white">
                          {lead.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {lead.ageCategory}
                      </span>
                    </div>
                    {getStageBadge(lead.status)}
                  </div>

                  {/* Branch & Program */}
                  <div className="p-3 rounded-xl bg-[#080B10] border border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-200 capitalize">
                      <MapPin className="w-3.5 h-3.5 text-[#B8F000]" />
                      <span>{lead.branch.replace("-", " ")} Centre</span>
                    </div>
                    <div className="text-slate-400 capitalize pl-5">
                      {lead.program.replace(/-/g, " ")}
                    </div>
                    <div className="text-slate-500 text-[11px] pl-5">
                      Timing: {lead.slot}
                    </div>
                  </div>

                  {/* Notes snippet if exists */}
                  {lead.notes && (
                    <div className="text-xs text-slate-400 italic bg-slate-900/40 p-2 rounded-lg border border-slate-800/50 line-clamp-2">
                      "{lead.notes}"
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  
                  {/* Status Selector Dropdown */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">
                      Stage:
                    </span>
                    <select
                      value={lead.status}
                      onChange={(e) => onStatusChange(lead.id, e.target.value as LeadItem["status"])}
                      className="px-2.5 py-1 bg-[#090C12] border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#B8F000]"
                    >
                      <option value="NEW">New Lead</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="TRIAL_SCHEDULED">Trial Booked</option>
                      <option value="ENROLLED">Enrolled 🎉</option>
                      <option value="DROPPED">Archived</option>
                    </select>
                  </div>

                  {/* Direct WhatsApp & Call & View Details */}
                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      title="Open WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </a>

                    <a
                      href={`tel:${lead.phone}`}
                      className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                      title="Call Phone"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#B8F000]" />
                      <span>Call</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => onSelectLead(lead)}
                      className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Notes</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST TABLE VIEW */
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0D111A]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#090C12] text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Centre</th>
                <th className="p-3.5">Age Category</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredLeads.map((lead) => {
                const phone = getCleanPhone(lead.phone);
                const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
                  `Hello ${lead.name}, this is S&A Badminton Academy Kochi regarding your badminton coaching inquiry. We'd love to schedule your free trial session!`
                )}`;

                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5">
                      <div
                        onClick={() => onSelectLead(lead)}
                        className="cursor-pointer font-bold text-white hover:text-[#B8F000] transition-colors"
                      >
                        {lead.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(lead.submittedAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-slate-200 font-mono">{lead.phone}</div>
                      {lead.email && <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{lead.email}</div>}
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200 capitalize">
                        {lead.branch.replace("-", " ")}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {lead.program.replace(/-/g, " ")}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#11161D] text-[#B8F000] border border-slate-700/80 font-mono">
                        {lead.ageCategory || "—"}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <select
                        value={lead.status}
                        onChange={(e) => onStatusChange(lead.id, e.target.value as LeadItem["status"])}
                        className="px-2.5 py-1 bg-[#090C12] border border-slate-800 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#B8F000]"
                      >
                        <option value="NEW">New Lead</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="TRIAL_SCHEDULED">Trial Booked</option>
                        <option value="ENROLLED">Enrolled 🎉</option>
                        <option value="DROPPED">Archived</option>
                      </select>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                          title="Call"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#B8F000]" />
                        </a>
                        <button
                          type="button"
                          onClick={() => onSelectLead(lead)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-semibold cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
