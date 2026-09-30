"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { LeadItem } from "@/lib/db";
import { AdminSidebar, AdminTab, CurrentUser } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminLeadsManager } from "@/components/admin/AdminLeadsManager";
import { AdminLeadDrawer } from "@/components/admin/AdminLeadDrawer";
import { AdminAddLeadModal } from "@/components/admin/AdminAddLeadModal";
import { ChangePasswordModal } from "@/components/admin/ChangePasswordModal";

// Modular CMS Managers
import { GalleryManager } from "@/components/admin/GalleryManager";
import { BlogManager } from "@/components/admin/BlogManager";
import { CoachesManager } from "@/components/admin/CoachesManager";
import { AchievementsManager } from "@/components/admin/AchievementsManager";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { CentresManager } from "@/components/admin/CentresManager";
import { ProgramsManager } from "@/components/admin/ProgramsManager";
import { EventsManager } from "@/components/admin/EventsManager";

export default function AdminDashboardPage() {
  const router = useRouter();

  // Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

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

  // Verify server-side authenticated session on mount
  useEffect(() => {
    let mounted = true;

    async function verifySession() {
      try {
        const res = await fetch("/api/admin/auth/me", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }

        const data = await res.json();
        if (!data.success || !data.data?.user) {
          router.replace("/admin/login");
          return;
        }

        if (mounted) {
          setCurrentUser(data.data.user);
          setIsAuthenticated(true);
          setIsVerifyingAuth(false);
        }
      } catch (err) {
        console.error("Session verification failed:", err);
        router.replace("/admin/login");
      }
    }

    verifySession();

    return () => {
      mounted = false;
    };
  }, [router]);

  // Fetch inquiries (only once session is established)
  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const res = await fetch("/api/enquiries");
      if (res.status === 401 || res.status === 403) {
        window.location.replace("/admin/login");
        return;
      }
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

  // Terminate session, clear auth cookies, and redirect
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Failed to call logout endpoint:", err);
    }
    // Hard navigate to prevent browser back-button caching
    window.location.replace("/admin/login");
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
  // Clean, Minimal Session Verification Loader
  // -------------------------------------------------------------
  if (isVerifyingAuth || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090D] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0D111A] border border-slate-800 text-[#B8F000] flex items-center justify-center mx-auto shadow-2xl relative">
            <div className="w-6 h-6 border-2 border-[#B8F000] border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              S&amp;A Badminton Academy
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verifying administrative session...
            </p>
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
        currentUser={currentUser}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
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
          {activeTab === "events" && <EventsManager />}
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

      {/* Admin Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}
