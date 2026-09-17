"use client";

import React, { useState, useEffect } from "react";
import { Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { LeadItem } from "@/lib/db";
import { AdminSidebar, AdminTab } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminLeadsManager } from "@/components/admin/AdminLeadsManager";
import { AdminLeadDrawer } from "@/components/admin/AdminLeadDrawer";
import { AdminAddLeadModal } from "@/components/admin/AdminAddLeadModal";

// Modular CMS Managers
import { GalleryManager } from "@/components/admin/GalleryManager";
import { BlogManager } from "@/components/admin/BlogManager";
import { CoachesManager } from "@/components/admin/CoachesManager";
import { AchievementsManager } from "@/components/admin/AchievementsManager";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { CentresManager } from "@/components/admin/CentresManager";
import { ProgramsManager } from "@/components/admin/ProgramsManager";

export default function AdminDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Active Tab / Section
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Leads Data
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  // Drawer & Modal State
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Check existing session
  useEffect(() => {
    const auth = sessionStorage.getItem("sa_crm_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch inquiries
  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const res = await fetch("/api/enquiries");
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeads(data.leads);
        setLastRefreshedAt(new Date());

        // Refresh selected lead if drawer is open
        if (selectedLead) {
          const fresh = data.leads.find((l: LeadItem) => l.id === selectedLead.id);
          if (fresh) setSelectedLead(fresh);
        }
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated]);

  // Auth Handler
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("sa_crm_auth");
    setPinInput("");
  };

  // Status Change (Optimistic + Backend)
  const handleStatusChange = async (id: string, newStatus: LeadItem["status"]) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus, updatedAt: new Date().toISOString() } : l))
    );
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
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

  // Age Category Change
  const handleAgeCategoryChange = async (id: string, newAgeCategory: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ageCategory: newAgeCategory, updatedAt: new Date().toISOString() } : l))
    );
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead((prev) => (prev ? { ...prev, ageCategory: newAgeCategory } : null));
    }

    try {
      await fetch("/api/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ageCategory: newAgeCategory }),
      });
    } catch (err) {
      console.error("Failed to update age category:", err);
      fetchLeads();
    }
  };

  // Save Drawer Notes
  const handleSaveNotes = async (id: string, notes: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notes }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, notes } : l))
        );
        if (selectedLead && selectedLead.id === id) {
          setSelectedLead((prev) => (prev ? { ...prev, notes } : null));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to save notes:", err);
      return false;
    }
  };

  // Delete Lead
  const handleDeleteLead = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete inquiry for "${name}"?`)) {
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (selectedLead?.id === id) {
      setSelectedLead(null);
    }
    try {
      await fetch(`/api/enquiries?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete lead:", err);
      fetchLeads();
    }
  };

  // Add Manual Lead
  const handleAddLead = async (leadData: {
    name: string;
    phone: string;
    email?: string;
    branch: string;
    program: string;
    ageCategory: string;
    slot?: string;
    status: LeadItem["status"];
    notes?: string;
    message?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadData,
          utm_source: "admin_panel",
          utm_medium: "manual_entry",
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchLeads();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to create lead:", err);
      return false;
    }
  };

  // Export CSV
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
      `SA_Badminton_Inquiries_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const newLeadsCount = leads.filter((l) => l.status === "NEW").length;

  // -------------------------------------------------------------
  // Clean, Simple Auth Unlock Screen
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090D] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0D111A] border border-slate-800 rounded-3xl p-8 space-y-6 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-[#B8F000]" />

          <div className="w-16 h-16 rounded-2xl bg-[#B8F000]/10 border border-[#B8F000]/30 text-[#B8F000] flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              S&amp;A Badminton Academy
            </h1>
            <p className="text-sm text-slate-400">
              Admin &amp; Admissions Desk
            </p>
            <p className="text-xs text-slate-500">
              Enter authorized PIN to view student inquiries and manage website content.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN (e.g. 1234)"
              autoFocus
              className="w-full text-center tracking-[0.4em] font-mono text-2xl py-3 px-4 bg-[#090C12] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#B8F000]"
            />

            {pinError && (
              <div className="text-rose-400 text-xs font-semibold">
                Incorrect PIN. Default access PIN is: 1234
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#B8F000] hover:bg-[#cbf722] text-black font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Unlock Admin Panel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800/80">
            Kochi Centres: Kadavanthra &bull; Edappally &bull; Kakkanad
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Main Dashboard View
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#07090D] text-white flex">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        newLeadsCount={newLeadsCount}
        totalLeadsCount={leads.length}
        onLogout={handleLogout}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        
        {/* Top Header */}
        <AdminHeader
          activeTab={activeTab}
          onOpenMobile={() => setMobileNavOpen(true)}
          onRefresh={fetchLeads}
          isRefreshing={loadingLeads}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          lastRefreshedAt={lastRefreshedAt}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {activeTab === "overview" && (
            <AdminOverview
              leads={leads}
              onSelectLead={setSelectedLead}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onExportCSV={handleExportCSV}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === "leads" && (
            <AdminLeadsManager
              leads={leads}
              onSelectLead={setSelectedLead}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onStatusChange={handleStatusChange}
              onExportCSV={handleExportCSV}
            />
          )}

          {activeTab === "centres" && <CentresManager />}
          {activeTab === "programs" && <ProgramsManager />}
          {activeTab === "gallery" && <GalleryManager />}
          {activeTab === "coaches" && <CoachesManager />}
          {activeTab === "achievements" && <AchievementsManager />}
          {activeTab === "blog" && <BlogManager />}
          {activeTab === "testimonials" && <TestimonialsManager />}
        </main>
      </div>

      {/* Slide-over Student Detail Drawer */}
      <AdminLeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={handleStatusChange}
        onAgeCategoryChange={handleAgeCategoryChange}
        onSaveNotes={handleSaveNotes}
        onDeleteLead={handleDeleteLead}
      />

      {/* Add New Inquiry Modal */}
      <AdminAddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddLead={handleAddLead}
      />
    </div>
  );
}
