"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  MessageCircle,
  Phone,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  RefreshCw,
  Trash2,
  Lock,
  Unlock,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Filter,
  X,
} from "lucide-react";
import { LOCATIONS } from "@/data/locations";
import { PROGRAMS } from "@/data/programs";

interface LeadItem {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  ageCategory: string;
  branch: string;
  program: string;
  slot: string;
  message?: string;
  status: "NEW" | "CONTACTED" | "TRIAL_SCHEDULED" | "ENROLLED" | "DROPPED";
  notes?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  submittedAt: string;
  updatedAt?: string;
}

const STATUS_CONFIG: Record<
  LeadItem["status"],
  { label: string; bg: string; text: string; border: string }
> = {
  NEW: {
    label: "NEW",
    bg: "bg-[#B8F000]/10",
    text: "text-[#B8F000]",
    border: "border-[#B8F000]/40",
  },
  CONTACTED: {
    label: "CONTACTED",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/40",
  },
  TRIAL_SCHEDULED: {
    label: "TRIAL SCHEDULED",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/40",
  },
  ENROLLED: {
    label: "ENROLLED",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
  },
  DROPPED: {
    label: "DROPPED",
    bg: "bg-slate-800/40",
    text: "text-slate-400",
    border: "border-slate-700",
  },
};

export default function AdminCRMPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [branchFilter, setBranchFilter] = useState<string>("ALL");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New lead form state
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    ageCategory: "Junior (Ages 10-16)",
    preferredBranch: "kadavanthra",
    preferredProgram: "junior-badminton-coaching",
    preferredSlot: "Evening (04:30 PM - 07:30 PM)",
    message: "Phone/Walk-in Enquiry",
  });

  // Check auth session on load
  useEffect(() => {
    const storedAuth = sessionStorage.getItem("sa_crm_auth");
    if (storedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 1234 or 9400 (matches academy desk)
    if (pinInput === "1234" || pinInput === "9400") {
      setIsAuthenticated(true);
      sessionStorage.setItem("sa_crm_auth", "true");
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/enquiries");
      const data = await res.json();
      if (data.success && data.leads) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated]);

  // Update lead status
  const handleStatusChange = async (id: string, newStatus: LeadItem["status"]) => {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );

    try {
      await fetch("/api/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      fetchLeads();
    }
  };

  // Save note
  const handleSaveNote = async (id: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, notes: noteText } : l))
    );
    setEditingNotesId(null);

    try {
      await fetch("/api/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notes: noteText }),
      });
    } catch (err) {
      console.error("Failed to save note:", err);
      fetchLeads();
    }
  };

  // Delete lead
  const handleDeleteLead = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete lead: ${name}?`)) {
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
    try {
      await fetch(`/api/enquiries?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete lead:", err);
      fetchLeads();
    }
  };

  // Add manual lead
  const handleAddManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeadForm),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setNewLeadForm({
          name: "",
          phone: "",
          email: "",
          ageCategory: "Junior (Ages 10-16)",
          preferredBranch: "kadavanthra",
          preferredProgram: "junior-badminton-coaching",
          preferredSlot: "Evening (04:30 PM - 07:30 PM)",
          message: "Phone/Walk-in Enquiry",
        });
        fetchLeads();
      }
    } catch (err) {
      console.error("Failed to add manual lead:", err);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const headers = [
      "ID",
      "Date",
      "Name",
      "Phone",
      "Email",
      "Age Category",
      "Centre",
      "Program",
      "Preferred Slot",
      "Status",
      "Notes",
      "Source",
    ];

    const rows = leads.map((l) => [
      l.id,
      new Date(l.submittedAt).toLocaleDateString("en-IN"),
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      l.email ? `"${l.email}"` : "",
      `"${l.ageCategory}"`,
      l.branch,
      l.program,
      `"${l.slot}"`,
      l.status,
      l.notes ? `"${l.notes.replace(/"/g, '""')}"` : "",
      l.utmSource || "direct",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SA_Badminton_Leads_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch =
        !searchQuery ||
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone.includes(searchQuery) ||
        (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.notes && l.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" || l.status === statusFilter;

      const matchesBranch =
        branchFilter === "ALL" || l.branch === branchFilter;

      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [leads, searchQuery, statusFilter, branchFilter]);

  // CRM Analytics Metrics
  const metrics = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter((l) => l.status === "NEW").length;
    const trialScheduled = leads.filter(
      (l) => l.status === "TRIAL_SCHEDULED"
    ).length;
    const enrolled = leads.filter((l) => l.status === "ENROLLED").length;
    const conversionRate = total > 0 ? Math.round((enrolled / total) * 100) : 0;

    return { total, newLeads, trialScheduled, enrolled, conversionRate };
  }, [leads]);

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090D] flex items-center justify-center p-4 select-none">
        <div className="max-w-md w-full bg-[#0B0F14] border border-[#1F2937] p-8 space-y-6 text-center">
          <div className="w-14 h-14 bg-[#07090D] border border-[#1F2937] text-[#B8F000] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="font-mono text-[10px] text-[#B8F000] uppercase tracking-widest font-bold">
              ADMISSIONS &bull; CRM GATEWAY
            </div>
            <h1 className="text-2xl font-black uppercase text-white tracking-tight">
              S&amp;A Admissions Desk
            </h1>
            <p className="text-xs text-[#A8B0BA]">
              Enter authorized PIN to view student enquiries and CRM pipeline.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN (e.g. 1234)"
              autoFocus
              className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 px-4 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
            />

            {pinError && (
              <div className="text-rose-400 text-xs font-mono">
                Incorrect PIN. Default is: 1234
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider transition-all"
            >
              UNLOCK CRM DASHBOARD
            </button>
          </form>

          <div className="text-[10px] font-mono text-[#A8B0BA]/60 pt-2">
            Default Access PIN: 1234 &bull; S&amp;A Badminton Academy
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090D] text-white select-none pb-20">
      
      {/* Top CRM Header */}
      <header className="border-b border-[#1F2937] bg-[#0B0F14] sticky top-0 z-30">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-2.5 py-1 bg-[#07090D] border border-[#1F2937] text-[#B8F000] font-mono text-xs font-bold uppercase hover:border-[#B8F000]"
            >
              &larr; WEBSITE
            </Link>
            <div className="h-6 w-px bg-[#1F2937] hidden sm:block" />
            <div>
              <h1 className="text-base sm:text-lg font-black uppercase text-white tracking-tight flex items-center gap-2">
                <span>ADMISSIONS CRM</span>
                <span className="text-[10px] font-mono font-bold text-[#07090D] bg-[#B8F000] px-1.5 py-0.2">
                  LIVE
                </span>
              </h1>
              <div className="font-mono text-[10px] text-[#A8B0BA] hidden sm:block">
                S&amp;A BADMINTON ACADEMY &bull; KOCHI LEADS PIPELINE
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchLeads}
              disabled={loading}
              className="px-3 py-2 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
              title="Refresh Pipeline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#B8F000]" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
              title="Export all leads to CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#B8F000]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lead</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAuthenticated(false);
                sessionStorage.removeItem("sa_crm_auth");
              }}
              className="p-2 bg-[#11161D] border border-[#1F2937] text-[#A8B0BA] hover:text-rose-400 transition-colors"
              title="Lock Dashboard"
            >
              <Unlock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 bg-[#0B0F14] border border-[#1F2937] space-y-1">
            <span className="font-mono text-[10px] uppercase text-[#A8B0BA]">TOTAL ENQUIRIES</span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {metrics.total}
            </div>
            <div className="text-[10px] font-mono text-[#A8B0BA]">All time leads logged</div>
          </div>

          <div className="p-4 sm:p-5 bg-[#0B0F14] border border-[#B8F000]/40 space-y-1">
            <span className="font-mono text-[10px] uppercase text-[#B8F000] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#B8F000] animate-pulse" />
              NEW / UNCONTACTED
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#B8F000] font-mono">
              {metrics.newLeads}
            </div>
            <div className="text-[10px] font-mono text-[#A8B0BA]">Needs immediate follow-up</div>
          </div>

          <div className="p-4 sm:p-5 bg-[#0B0F14] border border-[#1F2937] space-y-1">
            <span className="font-mono text-[10px] uppercase text-amber-400 font-bold">
              TRIAL SCHEDULED
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {metrics.trialScheduled}
            </div>
            <div className="text-[10px] font-mono text-[#A8B0BA]">Awaiting court attendance</div>
          </div>

          <div className="p-4 sm:p-5 bg-[#0B0F14] border border-[#1F2937] space-y-1">
            <span className="font-mono text-[10px] uppercase text-emerald-400 font-bold">
              ENROLLED STUDENTS
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {metrics.enrolled}
            </div>
            <div className="text-[10px] font-mono text-[#A8B0BA]">Converted to paid batch</div>
          </div>

          <div className="p-4 sm:p-5 bg-[#0B0F14] border border-[#1F2937] space-y-1 col-span-2 lg:col-span-1">
            <span className="font-mono text-[10px] uppercase text-cyan-400 font-bold">
              CONVERSION RATE
            </span>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
              {metrics.conversionRate}%
            </div>
            <div className="text-[10px] font-mono text-[#A8B0BA]">Enrolled vs total leads</div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 bg-[#0B0F14] border border-[#1F2937] space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#A8B0BA] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, email, notes..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#07090D] border border-[#1F2937] text-white text-xs font-mono focus:outline-none focus:border-[#B8F000]"
              />
            </div>

            {/* Centre Filter */}
            <div className="flex items-center gap-2">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2.5 bg-[#07090D] border border-[#1F2937] text-[#A8B0BA] text-xs font-mono focus:outline-none focus:border-[#B8F000]"
              >
                <option value="ALL">All Centres</option>
                {Object.values(LOCATIONS).map((loc) => (
                  <option key={loc.slug} value={loc.slug}>
                    {loc.shortName}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-[#07090D] border border-[#1F2937] text-[#A8B0BA] text-xs font-mono focus:outline-none focus:border-[#B8F000]"
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="TRIAL_SCHEDULED">Trial Scheduled</option>
                <option value="ENROLLED">Enrolled</option>
                <option value="DROPPED">Dropped</option>
              </select>
            </div>

          </div>

          {/* Quick status tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {["ALL", "NEW", "CONTACTED", "TRIAL_SCHEDULED", "ENROLLED", "DROPPED"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 font-mono text-[10px] uppercase font-bold border transition-colors whitespace-nowrap ${
                  statusFilter === s
                    ? "bg-[#B8F000] text-[#07090D] border-[#B8F000]"
                    : "bg-[#07090D] text-[#A8B0BA] border-[#1F2937] hover:text-white"
                }`}
              >
                {s === "ALL" ? "All Leads" : s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-[#0B0F14] border border-[#1F2937] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1F2937] bg-[#07090D] font-mono text-[10px] text-[#A8B0BA] uppercase">
                  <th className="py-3 px-4">Lead Info</th>
                  <th className="py-3 px-4">Centre &bull; Program</th>
                  <th className="py-3 px-4">Age &bull; Time Slot</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Coach Notes</th>
                  <th className="py-3 px-4 text-right">Direct Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937] text-xs font-mono">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#A8B0BA]">
                      No leads match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
                    const branchObj = Object.values(LOCATIONS).find(
                      (b) => b.slug === lead.branch
                    );
                    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");

                    const whatsappChatUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `Hello ${lead.name}! This is S&A Badminton Academy following up on your Free Trial enquiry for our ${branchObj?.shortName || "Kochi"} centre.`
                    )}`;

                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-[#11161D] transition-colors group"
                      >
                        {/* 1. Lead Info */}
                        <td className="py-4 px-4 align-top space-y-1">
                          <div className="font-bold text-white text-sm">
                            {lead.name}
                          </div>
                          <div className="text-[#B8F000] font-mono font-bold">
                            {lead.phone}
                          </div>
                          {lead.email && (
                            <div className="text-[11px] text-[#A8B0BA] truncate max-w-[180px]">
                              {lead.email}
                            </div>
                          )}
                          <div className="text-[9px] text-[#6B7280]">
                            {new Date(lead.submittedAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            &bull; {lead.utmSource || "direct"}
                          </div>
                        </td>

                        {/* 2. Centre & Program */}
                        <td className="py-4 px-4 align-top space-y-1">
                          <div className="font-bold text-white uppercase text-[11px]">
                            {branchObj?.shortName || lead.branch}
                          </div>
                          <div className="text-[11px] text-[#A8B0BA] capitalize">
                            {lead.program.replace(/-/g, " ")}
                          </div>
                          {lead.message && (
                            <div className="text-[10px] text-[#6B7280] italic max-w-[200px] line-clamp-2">
                              &ldquo;{lead.message}&rdquo;
                            </div>
                          )}
                        </td>

                        {/* 3. Age & Time Slot */}
                        <td className="py-4 px-4 align-top space-y-1">
                          <div className="text-white text-[11px]">
                            {lead.ageCategory}
                          </div>
                          <div className="text-[10px] text-[#A8B0BA]">
                            {lead.slot}
                          </div>
                        </td>

                        {/* 4. Status Selector */}
                        <td className="py-4 px-4 align-top">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleStatusChange(
                                lead.id,
                                e.target.value as LeadItem["status"]
                              )
                            }
                            className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase border cursor-pointer ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} bg-[#07090D]`}
                          >
                            <option value="NEW">NEW</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="TRIAL_SCHEDULED">TRIAL SCHEDULED</option>
                            <option value="ENROLLED">ENROLLED</option>
                            <option value="DROPPED">DROPPED</option>
                          </select>
                        </td>

                        {/* 5. Coach Notes */}
                        <td className="py-4 px-4 align-top space-y-1 max-w-[220px]">
                          {editingNotesId === lead.id ? (
                            <div className="space-y-1.5">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                rows={2}
                                className="w-full p-1.5 bg-[#07090D] border border-[#B8F000] text-white text-[11px] font-mono focus:outline-none"
                              />
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSaveNote(lead.id)}
                                  className="px-2 py-0.5 bg-[#B8F000] text-[#07090D] font-bold text-[10px]"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingNotesId(null)}
                                  className="px-2 py-0.5 bg-[#11161D] text-[#A8B0BA] text-[10px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setEditingNotesId(lead.id);
                                setNoteText(lead.notes || "");
                              }}
                              className="cursor-pointer hover:text-white transition-colors group/note"
                            >
                              {lead.notes ? (
                                <p className="text-[11px] text-[#A8B0BA] leading-snug">
                                  {lead.notes}
                                </p>
                              ) : (
                                <span className="text-[10px] text-[#6B7280] italic group-hover/note:text-[#B8F000]">
                                  + Click to add notes
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 6. Direct Actions */}
                        <td className="py-4 px-4 align-top text-right space-x-1.5 whitespace-nowrap">
                          {/* WhatsApp Hotline */}
                          <a
                            href={whatsappChatUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-8 h-8 bg-[#11161D] hover:bg-[#22C55E]/20 text-[#22C55E] border border-[#1F2937] hover:border-[#22C55E] transition-colors"
                            title="Chat with student on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* Direct Phone Call */}
                          <a
                            href={`tel:${lead.phone}`}
                            className="inline-flex items-center justify-center w-8 h-8 bg-[#11161D] hover:bg-[#B8F000]/20 text-[#B8F000] border border-[#1F2937] hover:border-[#B8F000] transition-colors"
                            title="Call student directly"
                          >
                            <Phone className="w-4 h-4" />
                          </a>

                          {/* Delete Lead */}
                          <button
                            type="button"
                            onClick={() => handleDeleteLead(lead.id, lead.name)}
                            className="inline-flex items-center justify-center w-8 h-8 bg-[#11161D] hover:bg-rose-950/40 text-[#6B7280] hover:text-rose-400 border border-[#1F2937] hover:border-rose-500/40 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Manual Add Lead Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#0B0F14] border border-[#1F2937] p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="font-black uppercase text-white tracking-tight">
                Log New Student / Walk-in Lead
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#A8B0BA] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualLead} className="space-y-4 text-left font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.name}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, name: e.target.value })
                    }
                    placeholder="e.g. Anand Menon"
                    className="w-full p-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>
                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newLeadForm.phone}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, phone: e.target.value })
                    }
                    placeholder="+91 94006..."
                    className="w-full p-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">
                    Target Centre *
                  </label>
                  <select
                    value={newLeadForm.preferredBranch}
                    onChange={(e) =>
                      setNewLeadForm({
                        ...newLeadForm,
                        preferredBranch: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  >
                    {Object.values(LOCATIONS).map((loc) => (
                      <option key={loc.slug} value={loc.slug}>
                        {loc.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">
                    Training Track
                  </label>
                  <select
                    value={newLeadForm.preferredProgram}
                    onChange={(e) =>
                      setNewLeadForm({
                        ...newLeadForm,
                        preferredProgram: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  >
                    {PROGRAMS.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">
                  Age Category
                </label>
                <select
                  value={newLeadForm.ageCategory}
                  onChange={(e) =>
                    setNewLeadForm({
                      ...newLeadForm,
                      ageCategory: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                >
                  <option value="Kids (Ages 5-9)">Kids (Ages 5–9)</option>
                  <option value="Junior (Ages 10-16)">Junior (Ages 10–16)</option>
                  <option value="Adult / Corporate (18+) ">Adult / Corporate (18+)</option>
                  <option value="Competitive Tournament Athlete">Competitive Tournament Athlete</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">
                  Initial Notes / Background
                </label>
                <textarea
                  rows={2}
                  value={newLeadForm.message}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, message: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-[#11161D] text-[#A8B0BA] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#B8F000] text-[#07090D] font-black uppercase tracking-wider"
                >
                  Save to CRM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
