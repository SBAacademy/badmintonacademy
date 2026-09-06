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
  Kanban,
  LayoutList,
  BarChart3,
  Calendar,
  Send,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  MapPin,
  Check,
} from "lucide-react";
import { LOCATIONS } from "@/data/locations";
import { PROGRAMS } from "@/data/programs";
import { LeadItem } from "@/lib/db";

const STATUS_CONFIG: Record<
  LeadItem["status"],
  { label: string; bg: string; text: string; border: string; barColor: string; description: string }
> = {
  NEW: {
    label: "NEW LEADS",
    bg: "bg-[#B8F000]/10",
    text: "text-[#B8F000]",
    border: "border-[#B8F000]/40",
    barColor: "bg-[#B8F000]",
    description: "Requires immediate follow-up",
  },
  CONTACTED: {
    label: "CONTACTED",
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "border-sky-500/40",
    barColor: "bg-sky-400",
    description: "Discussion / follow-up in progress",
  },
  TRIAL_SCHEDULED: {
    label: "TRIAL SCHEDULED",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/40",
    barColor: "bg-amber-400",
    description: "Assessment court time booked",
  },
  ENROLLED: {
    label: "ENROLLED",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
    barColor: "bg-emerald-400",
    description: "Registered academy athlete",
  },
  DROPPED: {
    label: "DROPPED / ARCHIVED",
    bg: "bg-slate-800/40",
    text: "text-slate-400",
    border: "border-slate-700",
    barColor: "bg-slate-600",
    description: "Not interested or slot unavailable",
  },
};

const STAGES: LeadItem["status"][] = [
  "NEW",
  "CONTACTED",
  "TRIAL_SCHEDULED",
  "ENROLLED",
  "DROPPED",
];

function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

export default function AdminCRMPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // CRM Data & UI states
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "table" | "analytics">("kanban");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [branchFilter, setBranchFilter] = useState<string>("ALL");

  // Drawer / Detail state
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [drawerNotes, setDrawerNotes] = useState("");
  const [notesSaveStatus, setNotesSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Add Manual Lead Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLeadSubmitting, setAddLeadSubmitting] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    ageCategory: "Junior (Ages 10-16)",
    preferredBranch: "kadavanthra",
    preferredProgram: "junior-badminton-coaching",
    preferredSlot: "Evening (04:30 PM - 07:30 PM)",
    message: "Direct Walk-in / Phone Call",
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
      if (data.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
        setLastRefreshed(new Date());

        // Sync selected lead if open
        if (selectedLead) {
          const updated = data.leads.find((l: LeadItem) => l.id === selectedLead.id);
          if (updated) setSelectedLead(updated);
        }
      }
    } catch (err) {
      console.error("Failed to fetch leads from CRM API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated]);

  // Handle drawer open
  const openLeadDrawer = (lead: LeadItem) => {
    setSelectedLead(lead);
    setDrawerNotes(lead.notes || "");
    setNotesSaveStatus("idle");
  };

  // Update lead status
  const handleStatusChange = async (id: string, newStatus: LeadItem["status"]) => {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus, updatedAt: new Date().toISOString() } : l))
    );
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead((prev) => prev ? { ...prev, status: newStatus } : null);
    }

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

  // Save drawer notes
  const handleSaveDrawerNotes = async () => {
    if (!selectedLead) return;
    setNotesSaveStatus("saving");

    try {
      const res = await fetch("/api/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedLead.id, notes: drawerNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === selectedLead.id ? { ...l, notes: drawerNotes } : l))
        );
        setSelectedLead((prev) => prev ? { ...prev, notes: drawerNotes } : null);
        setNotesSaveStatus("saved");
        setTimeout(() => setNotesSaveStatus("idle"), 2500);
      }
    } catch (err) {
      console.error("Failed to save note:", err);
      setNotesSaveStatus("idle");
    }
  };

  // Delete lead
  const handleDeleteLead = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete lead: ${name}?`)) {
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (selectedLead?.id === id) setSelectedLead(null);

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
    setAddLeadSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLeadForm,
          utm_source: "admin_manual",
          utm_medium: "desk",
        }),
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
          message: "Direct Walk-in / Phone Call",
        });
        await fetchLeads();
      }
    } catch (err) {
      console.error("Failed to add manual lead:", err);
    } finally {
      setAddLeadSubmitting(false);
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
      "Message",
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
      l.message ? `"${l.message.replace(/"/g, '""')}"` : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SA_Badminton_CRM_Leads_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.notes && l.notes.toLowerCase().includes(q)) ||
        (l.message && l.message.toLowerCase().includes(q));

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
    const contacted = leads.filter((l) => l.status === "CONTACTED").length;
    const trialScheduled = leads.filter((l) => l.status === "TRIAL_SCHEDULED").length;
    const enrolled = leads.filter((l) => l.status === "ENROLLED").length;
    const dropped = leads.filter((l) => l.status === "DROPPED").length;
    const conversionRate = total > 0 ? Math.round((enrolled / total) * 100) : 0;

    // Breakdown by branch
    const branchCounts: Record<string, number> = {};
    leads.forEach((l) => {
      branchCounts[l.branch] = (branchCounts[l.branch] || 0) + 1;
    });

    // Breakdown by program
    const programCounts: Record<string, number> = {};
    leads.forEach((l) => {
      programCounts[l.program] = (programCounts[l.program] || 0) + 1;
    });

    return {
      total,
      newLeads,
      contacted,
      trialScheduled,
      enrolled,
      dropped,
      conversionRate,
      branchCounts,
      programCounts,
    };
  }, [leads]);

  // Auth Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090D] flex items-center justify-center p-4 select-none">
        <div className="max-w-md w-full bg-[#0B0F14] border border-[#1F2937] p-8 space-y-6 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-[#B8F000]" />

          <div className="w-14 h-14 bg-[#07090D] border border-[#1F2937] text-[#B8F000] flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="font-mono text-[10px] text-[#B8F000] uppercase tracking-widest font-bold">
              NEON POSTGRESQL &bull; CRM GATEWAY
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
                Incorrect PIN. Default access PIN is: 1234
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              UNLOCK CRM DASHBOARD
            </button>
          </form>

          <div className="text-[10px] font-mono text-[#A8B0BA]/60 pt-2 border-t border-[#1F2937]">
            Default Access PIN: 1234 &bull; S&amp;A Badminton Academy Kochi
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090D] text-white select-none pb-24">
      {/* Top CRM App Bar */}
      <header className="border-b border-[#1F2937] bg-[#0B0F14] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl 2xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Brand & Connection Status */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-2.5 py-1.5 bg-[#07090D] border border-[#1F2937] text-[#B8F000] font-mono text-xs font-bold uppercase hover:border-[#B8F000] transition-colors"
            >
              &larr; Website
            </Link>
            <div className="h-6 w-px bg-[#1F2937] hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black uppercase text-white tracking-tight">
                  Admissions CRM
                </h1>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#B8F000] bg-[#B8F000]/10 border border-[#B8F000]/30 px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B8F000] animate-pulse" />
                  NEON DB LIVE
                </span>
              </div>
              <div className="font-mono text-[10px] text-[#A8B0BA] hidden sm:block">
                S&amp;A BADMINTON ACADEMY &bull; {leads.length} LEADS TRACKED
                {lastRefreshed && (
                  <span className="text-[#6B7280]"> &bull; Synced {formatTimeAgo(lastRefreshed.toISOString())}</span>
                )}
              </div>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="hidden md:flex items-center bg-[#07090D] p-1 border border-[#1F2937]">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase font-bold transition-colors ${
                viewMode === "kanban"
                  ? "bg-[#B8F000] text-[#07090D]"
                  : "text-[#A8B0BA] hover:text-white"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase font-bold transition-colors ${
                viewMode === "table"
                  ? "bg-[#B8F000] text-[#07090D]"
                  : "text-[#A8B0BA] hover:text-white"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("analytics")}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase font-bold transition-colors ${
                viewMode === "analytics"
                  ? "bg-[#B8F000] text-[#07090D]"
                  : "text-[#A8B0BA] hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchLeads}
              disabled={loading}
              className="p-2 sm:px-3 sm:py-2 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh from Neon PostgreSQL"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#B8F000]" : ""}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="p-2 sm:px-3 sm:py-2 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export leads to CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#B8F000]" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 sm:px-4 py-2 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Lead</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAuthenticated(false);
                sessionStorage.removeItem("sa_crm_auth");
              }}
              className="p-2 bg-[#11161D] border border-[#1F2937] text-[#A8B0BA] hover:text-rose-400 transition-colors cursor-pointer"
              title="Lock CRM"
            >
              <Unlock className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main CRM Workspace */}
      <main className="max-w-7xl 2xl:max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Metric KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div 
            onClick={() => setStatusFilter("ALL")}
            className={`p-3.5 sm:p-4 bg-[#0B0F14] border cursor-pointer transition-colors ${
              statusFilter === "ALL" ? "border-[#B8F000] bg-[#11161D]" : "border-[#1F2937] hover:border-[#374151]"
            }`}
          >
            <span className="font-mono text-[10px] uppercase text-[#A8B0BA] flex items-center justify-between">
              TOTAL LEADS
              <Users className="w-3 h-3 text-[#A8B0BA]" />
            </span>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {metrics.total}
            </div>
            <div className="text-[10px] font-mono text-[#6B7280]">All time recorded</div>
          </div>

          <div 
            onClick={() => setStatusFilter("NEW")}
            className={`p-3.5 sm:p-4 bg-[#0B0F14] border cursor-pointer transition-colors ${
              statusFilter === "NEW" ? "border-[#B8F000] bg-[#11161D]" : "border-[#B8F000]/40 hover:border-[#B8F000]"
            }`}
          >
            <span className="font-mono text-[10px] uppercase text-[#B8F000] font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#B8F000] rounded-full animate-pulse" />
                NEW
              </span>
              <Sparkles className="w-3 h-3 text-[#B8F000]" />
            </span>
            <div className="text-2xl font-black text-[#B8F000] font-mono mt-1">
              {metrics.newLeads}
            </div>
            <div className="text-[10px] font-mono text-[#A8B0BA]">Needs immediate call</div>
          </div>

          <div 
            onClick={() => setStatusFilter("CONTACTED")}
            className={`p-3.5 sm:p-4 bg-[#0B0F14] border cursor-pointer transition-colors ${
              statusFilter === "CONTACTED" ? "border-sky-400 bg-[#11161D]" : "border-[#1F2937] hover:border-sky-500/40"
            }`}
          >
            <span className="font-mono text-[10px] uppercase text-sky-400 font-bold flex items-center justify-between">
              CONTACTED
              <MessageCircle className="w-3 h-3 text-sky-400" />
            </span>
            <div className="text-2xl font-black text-sky-400 font-mono mt-1">
              {metrics.contacted}
            </div>
            <div className="text-[10px] font-mono text-[#6B7280]">In communication</div>
          </div>

          <div 
            onClick={() => setStatusFilter("TRIAL_SCHEDULED")}
            className={`p-3.5 sm:p-4 bg-[#0B0F14] border cursor-pointer transition-colors ${
              statusFilter === "TRIAL_SCHEDULED" ? "border-amber-400 bg-[#11161D]" : "border-[#1F2937] hover:border-amber-500/40"
            }`}
          >
            <span className="font-mono text-[10px] uppercase text-amber-400 font-bold flex items-center justify-between">
              TRIALS
              <Calendar className="w-3 h-3 text-amber-400" />
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              {metrics.trialScheduled}
            </div>
            <div className="text-[10px] font-mono text-[#6B7280]">Slot confirmed</div>
          </div>

          <div 
            onClick={() => setStatusFilter("ENROLLED")}
            className={`p-3.5 sm:p-4 bg-[#0B0F14] border cursor-pointer transition-colors ${
              statusFilter === "ENROLLED" ? "border-emerald-400 bg-[#11161D]" : "border-[#1F2937] hover:border-emerald-500/40"
            }`}
          >
            <span className="font-mono text-[10px] uppercase text-emerald-400 font-bold flex items-center justify-between">
              ENROLLED
              <Award className="w-3 h-3 text-emerald-400" />
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {metrics.enrolled}
            </div>
            <div className="text-[10px] font-mono text-[#6B7280]">Paid student batch</div>
          </div>

          <div className="p-3.5 sm:p-4 bg-[#0B0F14] border border-[#1F2937]">
            <span className="font-mono text-[10px] uppercase text-cyan-400 font-bold flex items-center justify-between">
              CONVERSION
              <TrendingUp className="w-3 h-3 text-cyan-400" />
            </span>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
              {metrics.conversionRate}%
            </div>
            <div className="text-[10px] font-mono text-[#6B7280]">Enrolled vs Total</div>
          </div>

        </div>

        {/* Search & Filtering Toolbar */}
        <div className="p-3.5 sm:p-4 bg-[#0B0F14] border border-[#1F2937] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Quick Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A8B0BA] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads by name, phone, message, or coach notes..."
              className="w-full pl-9 pr-4 py-2 bg-[#07090D] border border-[#1F2937] text-white text-xs font-mono focus:outline-none focus:border-[#B8F000]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8B0BA] hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Mobile View Toggle */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            
            {/* Centre Filter */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-3 py-2 bg-[#07090D] border border-[#1F2937] text-[#A8B0BA] text-xs font-mono focus:outline-none focus:border-[#B8F000] cursor-pointer"
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
              className="px-3 py-2 bg-[#07090D] border border-[#1F2937] text-[#A8B0BA] text-xs font-mono focus:outline-none focus:border-[#B8F000] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>

            {/* Mobile View Toggle */}
            <div className="flex md:hidden items-center bg-[#07090D] border border-[#1F2937]">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`p-2 ${viewMode === "kanban" ? "text-[#B8F000] bg-[#11161D]" : "text-[#A8B0BA]"}`}
                title="Pipeline View"
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-2 ${viewMode === "table" ? "text-[#B8F000] bg-[#11161D]" : "text-[#A8B0BA]"}`}
                title="Table View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("analytics")}
                className={`p-2 ${viewMode === "analytics" ? "text-[#B8F000] bg-[#11161D]" : "text-[#A8B0BA]"}`}
                title="Analytics View"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: KANBAN PIPELINE BOARD                                 */}
        {/* ------------------------------------------------------------- */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
            {STAGES.map((stageKey) => {
              const cfg = STATUS_CONFIG[stageKey];
              const stageLeads = filteredLeads.filter((l) => l.status === stageKey);

              return (
                <div
                  key={stageKey}
                  className="bg-[#0B0F14] border border-[#1F2937] flex flex-col max-h-[800px]"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-[#1F2937] bg-[#07090D] flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.barColor}`} />
                      <span className="font-mono text-xs font-bold text-white uppercase">
                        {cfg.label}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#A8B0BA] bg-[#11161D] px-2 py-0.5 border border-[#1F2937]">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards Container */}
                  <div className="p-2 space-y-2.5 overflow-y-auto min-h-[140px]">
                    {stageLeads.length === 0 ? (
                      <div className="py-8 text-center text-[11px] font-mono text-[#6B7280]">
                        No leads in {cfg.label.toLowerCase()}
                      </div>
                    ) : (
                      stageLeads.map((lead) => {
                        const branchObj = Object.values(LOCATIONS).find((b) => b.slug === lead.branch);
                        const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
                        const whatsappChatUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Hello ${lead.name}! This is S&A Badminton Academy following up on your Free Trial enquiry for our ${branchObj?.shortName || "Kochi"} centre.`
                        )}`;

                        return (
                          <div
                            key={lead.id}
                            onClick={() => openLeadDrawer(lead)}
                            className="p-3 bg-[#07090D] border border-[#1F2937] hover:border-[#B8F000]/60 transition-all cursor-pointer space-y-2.5 group relative"
                          >
                            {/* Card Header: Name & Time */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-bold text-white text-xs group-hover:text-[#B8F000] transition-colors leading-tight">
                                {lead.name}
                              </div>
                              <span className="font-mono text-[9px] text-[#6B7280] shrink-0">
                                {formatTimeAgo(lead.submittedAt)}
                              </span>
                            </div>

                            {/* Phone & Centre */}
                            <div className="space-y-1 font-mono text-[10px]">
                              <div className="text-[#B8F000] font-bold">
                                {lead.phone}
                              </div>
                              <div className="text-[#A8B0BA] flex items-center gap-1.5 flex-wrap">
                                <span className="px-1.5 py-0.5 bg-[#11161D] border border-[#1F2937] text-white uppercase text-[9px]">
                                  {branchObj?.shortName || lead.branch}
                                </span>
                                <span className="text-[#6B7280] truncate max-w-[120px]">
                                  {lead.slot.split("(")[0].trim()}
                                </span>
                              </div>
                            </div>

                            {/* Notes / Message Preview */}
                            {(lead.notes || lead.message) && (
                              <p className="text-[10px] text-[#9CA3AF] bg-[#0B0F14] p-1.5 border border-[#1F2937] line-clamp-2 italic font-mono">
                                {lead.notes ? `Note: ${lead.notes}` : `"${lead.message}"`}
                              </p>
                            )}

                            {/* Quick Action Footer */}
                            <div 
                              className="pt-1.5 border-t border-[#1F2937] flex items-center justify-between"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-1">
                                <a
                                  href={whatsappChatUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-[#11161D] hover:bg-[#22C55E]/20 text-[#22C55E] border border-[#1F2937] hover:border-[#22C55E] transition-colors"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>

                                <a
                                  href={`tel:${lead.phone}`}
                                  className="p-1.5 bg-[#11161D] hover:bg-[#B8F000]/20 text-[#B8F000] border border-[#1F2937] hover:border-[#B8F000] transition-colors"
                                  title="Direct Call"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              </div>

                              {/* Stage advance dropdown */}
                              <select
                                value={lead.status}
                                onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadItem["status"])}
                                className="px-1.5 py-1 text-[9px] font-mono bg-[#11161D] border border-[#1F2937] text-[#A8B0BA] hover:text-white cursor-pointer"
                              >
                                {STAGES.map((s) => (
                                  <option key={s} value={s}>
                                    &rarr; {s.replace("_", " ")}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: TABLE LIST VIEW                                       */}
        {/* ------------------------------------------------------------- */}
        {viewMode === "table" && (
          <div className="bg-[#0B0F14] border border-[#1F2937] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1F2937] bg-[#07090D] font-mono text-[10px] text-[#A8B0BA] uppercase">
                    <th className="py-3 px-4">Student Info</th>
                    <th className="py-3 px-4">Centre &bull; Program</th>
                    <th className="py-3 px-4">Slot &bull; Age</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Coach Notes</th>
                    <th className="py-3 px-4 text-right">Quick Contact</th>
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
                      const cfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
                      const branchObj = Object.values(LOCATIONS).find((b) => b.slug === lead.branch);
                      const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
                      const whatsappChatUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `Hello ${lead.name}! This is S&A Badminton Academy following up on your Free Trial enquiry for our ${branchObj?.shortName || "Kochi"} centre.`
                      )}`;

                      return (
                        <tr
                          key={lead.id}
                          onClick={() => openLeadDrawer(lead)}
                          className="hover:bg-[#11161D] transition-colors cursor-pointer group"
                        >
                          {/* Student Info */}
                          <td className="py-3.5 px-4 align-top space-y-0.5">
                            <div className="font-bold text-white group-hover:text-[#B8F000] transition-colors">
                              {lead.name}
                            </div>
                            <div className="text-[#B8F000] font-bold text-[11px]">
                              {lead.phone}
                            </div>
                            <div className="text-[10px] text-[#6B7280]">
                              {formatTimeAgo(lead.submittedAt)} &bull; {lead.utmSource || "direct"}
                            </div>
                          </td>

                          {/* Centre & Program */}
                          <td className="py-3.5 px-4 align-top space-y-0.5">
                            <div className="font-bold text-white uppercase text-[11px]">
                              {branchObj?.shortName || lead.branch}
                            </div>
                            <div className="text-[11px] text-[#A8B0BA] capitalize truncate max-w-[200px]">
                              {lead.program.replace(/-/g, " ")}
                            </div>
                          </td>

                          {/* Slot & Age */}
                          <td className="py-3.5 px-4 align-top space-y-0.5">
                            <div className="text-white text-[11px]">{lead.ageCategory}</div>
                            <div className="text-[10px] text-[#A8B0BA] truncate max-w-[180px]">
                              {lead.slot}
                            </div>
                          </td>

                          {/* Stage Selector */}
                          <td className="py-3.5 px-4 align-top" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={lead.status}
                              onChange={(e) =>
                                handleStatusChange(lead.id, e.target.value as LeadItem["status"])
                              }
                              className={`px-2 py-1 text-[10px] font-mono font-bold uppercase border cursor-pointer ${cfg.bg} ${cfg.text} ${cfg.border} bg-[#07090D]`}
                            >
                              {STAGES.map((s) => (
                                <option key={s} value={s}>
                                  {STATUS_CONFIG[s].label}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Coach Notes Preview */}
                          <td className="py-3.5 px-4 align-top max-w-[220px]">
                            {lead.notes ? (
                              <p className="text-[11px] text-[#A8B0BA] line-clamp-2 leading-snug">
                                {lead.notes}
                              </p>
                            ) : (
                              <span className="text-[10px] text-[#6B7280] italic group-hover:text-[#B8F000]">
                                + Add note
                              </span>
                            )}
                          </td>

                          {/* Quick Contact */}
                          <td 
                            className="py-3.5 px-4 align-top text-right space-x-1 whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={whatsappChatUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-7 h-7 bg-[#11161D] hover:bg-[#22C55E]/20 text-[#22C55E] border border-[#1F2937] hover:border-[#22C55E] transition-colors"
                              title="WhatsApp Student"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>

                            <a
                              href={`tel:${lead.phone}`}
                              className="inline-flex items-center justify-center w-7 h-7 bg-[#11161D] hover:bg-[#B8F000]/20 text-[#B8F000] border border-[#1F2937] hover:border-[#B8F000] transition-colors"
                              title="Direct Call"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleDeleteLead(lead.id, lead.name)}
                              className="inline-flex items-center justify-center w-7 h-7 bg-[#11161D] hover:bg-rose-950/40 text-[#6B7280] hover:text-rose-400 border border-[#1F2937] hover:border-rose-500/40 transition-colors cursor-pointer"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: CRM ANALYTICS & INSIGHTS                              */}
        {/* ------------------------------------------------------------- */}
        {viewMode === "analytics" && (
          <div className="space-y-6">
            {/* Conversion Funnel */}
            <div className="p-6 bg-[#0B0F14] border border-[#1F2937] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    Admissions Conversion Funnel
                  </h3>
                  <p className="text-xs text-[#A8B0BA] font-mono">
                    Visual tracking from initial enquiry to paid batch enrolment
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-[#B8F000]/10 border border-[#B8F000]/30 font-mono text-xs text-[#B8F000] font-bold">
                  {metrics.conversionRate}% Overall Conversion
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                
                <div className="p-4 bg-[#07090D] border border-[#1F2937] space-y-1 text-center">
                  <div className="font-mono text-[10px] text-[#A8B0BA] uppercase">1. ENQUIRIES</div>
                  <div className="text-2xl font-black font-mono text-white">{metrics.total}</div>
                  <div className="text-[10px] font-mono text-[#6B7280]">100% Top of Funnel</div>
                </div>

                <div className="p-4 bg-[#07090D] border border-[#1F2937] space-y-1 text-center">
                  <div className="font-mono text-[10px] text-sky-400 uppercase">2. CONTACTED</div>
                  <div className="text-2xl font-black font-mono text-sky-400">{metrics.contacted + metrics.trialScheduled + metrics.enrolled}</div>
                  <div className="text-[10px] font-mono text-[#6B7280]">
                    {metrics.total > 0 ? Math.round(((metrics.contacted + metrics.trialScheduled + metrics.enrolled) / metrics.total) * 100) : 0}% Reached
                  </div>
                </div>

                <div className="p-4 bg-[#07090D] border border-[#1F2937] space-y-1 text-center">
                  <div className="font-mono text-[10px] text-amber-400 uppercase">3. TRIAL ATTENDED</div>
                  <div className="text-2xl font-black font-mono text-amber-400">{metrics.trialScheduled + metrics.enrolled}</div>
                  <div className="text-[10px] font-mono text-[#6B7280]">
                    {metrics.total > 0 ? Math.round(((metrics.trialScheduled + metrics.enrolled) / metrics.total) * 100) : 0}% Scheduled
                  </div>
                </div>

                <div className="p-4 bg-[#07090D] border border-[#B8F000]/40 space-y-1 text-center bg-[#B8F000]/5">
                  <div className="font-mono text-[10px] text-[#B8F000] uppercase font-bold">4. ENROLLED</div>
                  <div className="text-2xl font-black font-mono text-[#B8F000]">{metrics.enrolled}</div>
                  <div className="text-[10px] font-mono text-[#B8F000]">
                    {metrics.conversionRate}% Converted
                  </div>
                </div>

              </div>
            </div>

            {/* Centre Breakdown & Program Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Centre Breakdown */}
              <div className="p-6 bg-[#0B0F14] border border-[#1F2937] space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#B8F000]" />
                  <span>Enquiries by Centre</span>
                </h3>

                <div className="space-y-3">
                  {Object.values(LOCATIONS).map((loc) => {
                    const count = metrics.branchCounts[loc.slug] || 0;
                    const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;

                    return (
                      <div key={loc.slug} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-white font-bold">{loc.name}</span>
                          <span className="text-[#A8B0BA]">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-[#07090D] border border-[#1F2937]">
                          <div 
                            className="h-full bg-[#B8F000] transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Program Breakdown */}
              <div className="p-6 bg-[#0B0F14] border border-[#1F2937] space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#B8F000]" />
                  <span>Enquiries by Coaching Track</span>
                </h3>

                <div className="space-y-3">
                  {PROGRAMS.map((prog) => {
                    const count = metrics.programCounts[prog.slug] || 0;
                    const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;

                    return (
                      <div key={prog.slug} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-white font-bold">{prog.name}</span>
                          <span className="text-[#A8B0BA]">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-[#07090D] border border-[#1F2937]">
                          <div 
                            className="h-full bg-sky-400 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ------------------------------------------------------------- */}
      {/* SLIDE-OVER LEAD DETAIL DRAWER                                 */}
      {/* ------------------------------------------------------------- */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden select-text">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedLead(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-[#0B0F14] border-l border-[#1F2937] flex flex-col shadow-2xl">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#1F2937] bg-[#07090D] flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#A8B0BA] uppercase">
                      ID: {selectedLead.id}
                    </span>
                    <span className="text-[#6B7280]">&bull;</span>
                    <span className="font-mono text-[10px] text-[#A8B0BA]">
                      {new Date(selectedLead.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    {selectedLead.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="p-2 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. Stage Stepper */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-[#A8B0BA] font-bold tracking-wider">
                    PIPELINE STAGE
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {STAGES.map((s) => {
                      const isActive = selectedLead.status === s;
                      const cfg = STATUS_CONFIG[s];
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleStatusChange(selectedLead.id, s)}
                          className={`py-2 px-1 text-center font-mono text-[9px] uppercase font-bold border transition-all cursor-pointer ${
                            isActive
                              ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-1 ring-[#B8F000]`
                              : "bg-[#07090D] text-[#6B7280] border-[#1F2937] hover:text-white"
                          }`}
                        >
                          {s.replace("_", " ")}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. WhatsApp Instant Follow-up Templates */}
                <div className="p-4 bg-[#07090D] border border-[#1F2937] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#22C55E] uppercase font-bold flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                      <span>1-Click WhatsApp Direct Templates</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#6B7280]">Target: {selectedLead.phone}</span>
                  </div>

                  {(() => {
                    const cleanPhone = selectedLead.phone.replace(/[^0-9]/g, "");
                    const branchObj = Object.values(LOCATIONS).find((b) => b.slug === selectedLead.branch);
                    const progObj = PROGRAMS.find((p) => p.slug === selectedLead.program);

                    const template1 = `Hello ${selectedLead.name}! 🏸 This is Coach from S&A Badminton Academy. We received your Free Trial enquiry for our ${branchObj?.name || "Kochi"} centre (${progObj?.name || selectedLead.program}). Would you be available this week for your 45-minute court evaluation?`;
                    const template2 = `Hello ${selectedLead.name}! 🏸 Your Free Assessment Trial at S&A Badminton Academy (${branchObj?.name || "Kochi"}) is confirmed for ${selectedLead.slot}. Please arrive 10 minutes early in sports attire and non-marking badminton shoes. Looking forward to having you on court!`;
                    const template3 = `Hi ${selectedLead.name}! 🏸 Thank you for attending your assessment session at S&A Badminton Academy today. Our coaching team was impressed with your energy! We would love to welcome you into our ${progObj?.name || "regular"} training batch. Let us know if you would like us to send the admission details.`;

                    return (
                      <div className="space-y-2">
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(template1)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] hover:border-[#22C55E]/60 flex items-center justify-between transition-colors group text-left"
                        >
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-[#22C55E]">
                              Template 1: Initial Trial Welcome
                            </div>
                            <div className="text-[10px] text-[#A8B0BA] line-clamp-1">
                              &ldquo;{template1}&rdquo;
                            </div>
                          </div>
                          <Send className="w-3.5 h-3.5 text-[#22C55E] shrink-0 ml-2" />
                        </a>

                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(template2)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] hover:border-amber-400/60 flex items-center justify-between transition-colors group text-left"
                        >
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-amber-400">
                              Template 2: Trial Slot Confirmation
                            </div>
                            <div className="text-[10px] text-[#A8B0BA] line-clamp-1">
                              &ldquo;{template2}&rdquo;
                            </div>
                          </div>
                          <Send className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />
                        </a>

                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(template3)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] hover:border-emerald-400/60 flex items-center justify-between transition-colors group text-left"
                        >
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-emerald-400">
                              Template 3: Post-Trial Admission Offer
                            </div>
                            <div className="text-[10px] text-[#A8B0BA] line-clamp-1">
                              &ldquo;{template3}&rdquo;
                            </div>
                          </div>
                          <Send className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                        </a>
                      </div>
                    );
                  })()}
                </div>

                {/* 3. Candidate Dossier */}
                <div className="p-4 bg-[#07090D] border border-[#1F2937] space-y-3 font-mono text-xs">
                  <div className="text-[10px] uppercase text-[#A8B0BA] font-bold border-b border-[#1F2937] pb-2">
                    CANDIDATE DOSSIER
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#6B7280] text-[10px] block">TELEPHONE:</span>
                      <a href={`tel:${selectedLead.phone}`} className="text-[#B8F000] font-bold hover:underline">
                        {selectedLead.phone}
                      </a>
                    </div>

                    <div>
                      <span className="text-[#6B7280] text-[10px] block">EMAIL:</span>
                      <span className="text-white">
                        {selectedLead.email || "Not provided"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#6B7280] text-[10px] block">TARGET CENTRE:</span>
                      <span className="text-white font-bold uppercase">
                        {selectedLead.branch}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#6B7280] text-[10px] block">COACHING TRACK:</span>
                      <span className="text-white capitalize">
                        {selectedLead.program.replace(/-/g, " ")}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#6B7280] text-[10px] block">AGE CATEGORY:</span>
                      <span className="text-white">
                        {selectedLead.ageCategory}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#6B7280] text-[10px] block">PREFERRED TIME:</span>
                      <span className="text-white">
                        {selectedLead.slot}
                      </span>
                    </div>
                  </div>

                  {selectedLead.message && (
                    <div className="pt-2 border-t border-[#1F2937]">
                      <span className="text-[#6B7280] text-[10px] block">STUDENT GOALS / INQUIRY MESSAGE:</span>
                      <p className="text-white italic mt-1 bg-[#0B0F14] p-2 border border-[#1F2937]">
                        &ldquo;{selectedLead.message}&rdquo;
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#1F2937] text-[10px] text-[#6B7280] flex justify-between">
                    <span>SOURCE: {selectedLead.utmSource || "direct"} / {selectedLead.utmMedium || "website"}</span>
                    <span>CAMPAIGN: {selectedLead.utmCampaign || "organic"}</span>
                  </div>
                </div>

                {/* 4. Coach Internal Notes */}
                <div className="p-4 bg-[#07090D] border border-[#1F2937] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-white uppercase font-bold">
                      Coach &amp; Admissions Notes
                    </span>
                    {notesSaveStatus === "saved" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#B8F000]">
                        <Check className="w-3.5 h-3.5" /> Saved to Neon DB
                      </span>
                    )}
                  </div>

                  <textarea
                    rows={4}
                    value={drawerNotes}
                    onChange={(e) => setDrawerNotes(e.target.value)}
                    placeholder="Record trial session observations, player level, parent phone call notes, follow-up agreements..."
                    className="w-full p-3 bg-[#0B0F14] border border-[#1F2937] text-white text-xs font-mono focus:outline-none focus:border-[#B8F000]"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveDrawerNotes}
                      disabled={notesSaveStatus === "saving"}
                      className="px-4 py-2 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {notesSaveStatus === "saving" ? "Saving..." : "Save Internal Notes"}
                    </button>
                  </div>
                </div>

                {/* 5. Danger Zone: Delete */}
                <div className="pt-4 border-t border-[#1F2937] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#6B7280]">
                    PERMANENT ACTIONS
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteLead(selectedLead.id, selectedLead.name)}
                    className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-400 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ADD MANUAL LEAD MODAL                                         */}
      {/* ------------------------------------------------------------- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-lg w-full bg-[#0B0F14] border border-[#1F2937] p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#B8F000]" />
                <span>Log Walk-in / Phone Enquiry</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#A8B0BA] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualLead} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Student / Parent Name *</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  placeholder="e.g. Rahul Menon"
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    placeholder="+91 98470 00000"
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    placeholder="name@gmail.com"
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Centre</label>
                  <select
                    value={newLeadForm.preferredBranch}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, preferredBranch: e.target.value })}
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  >
                    {Object.values(LOCATIONS).map((loc) => (
                      <option key={loc.slug} value={loc.slug}>
                        {loc.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Program Track</label>
                  <select
                    value={newLeadForm.preferredProgram}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, preferredProgram: e.target.value })}
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  >
                    {PROGRAMS.map((prog) => (
                      <option key={prog.slug} value={prog.slug}>
                        {prog.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Notes / Call Summary</label>
                <textarea
                  rows={3}
                  value={newLeadForm.message}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, message: e.target.value })}
                  placeholder="Notes from telephone or walk-in enquiry..."
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#11161D] text-[#A8B0BA] hover:text-white uppercase font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLeadSubmitting}
                  className="px-6 py-2 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black uppercase text-xs transition-colors"
                >
                  {addLeadSubmitting ? "Saving..." : "Save Lead into Neon DB"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
