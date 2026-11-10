"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  BookOpen,
  Users2,
  Trophy,
  Star,
  ExternalLink,
  LogOut,
  X,
  Sparkles,
  MapPin,
  Target,
  Calendar,
  KeyRound,
  Shield,
} from "lucide-react";

export type AdminTab =
  | "overview"
  | "leads"
  | "centres"
  | "programs"
  | "events"
  | "gallery"
  | "blog"
  | "coaches"
  | "achievements"
  | "testimonials";

export interface CurrentUser {
  id?: string;
  email?: string;
  fullName?: string;
  role?: string;
}

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  newLeadsCount: number;
  totalLeadsCount: number;
  onLogout: () => void;
  currentUser?: CurrentUser | null;
  onOpenChangePassword?: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({
  activeTab,
  onSelectTab,
  newLeadsCount,
  totalLeadsCount,
  onLogout,
  currentUser,
  onOpenChangePassword,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const handleTabClick = (tab: AdminTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const navItems: {
    category: string;
    items: {
      id: AdminTab;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: React.ReactNode;
    }[];
  }[] = [
    {
      category: "Daily Operations",
      items: [
        {
          id: "overview",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          id: "leads",
          label: "Student Inquiries",
          icon: Users,
          badge:
            newLeadsCount > 0 ? (
              <span className="ml-auto px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#B8F000] text-black">
                {newLeadsCount} new
              </span>
            ) : (
              <span className="ml-auto text-xs text-slate-500 font-medium">
                {totalLeadsCount}
              </span>
            ),
        },
        {
          id: "centres",
          label: "Centres & Hubs",
          icon: MapPin,
        },
        {
          id: "programs",
          label: "Training Programs",
          icon: Target,
        },
        {
          id: "events",
          label: "Events & Tournaments",
          icon: Calendar,
        },
      ],
    },
    {
      category: "Website Content",
      items: [
        {
          id: "gallery",
          label: "Photo Gallery",
          icon: ImageIcon,
        },
        {
          id: "coaches",
          label: "Coaches & Staff",
          icon: Users2,
        },
        {
          id: "achievements",
          label: "Track Record & Awards",
          icon: Trophy,
        },
        {
          id: "blog",
          label: "Blog Articles",
          icon: BookOpen,
        },
        {
          id: "testimonials",
          label: "Reviews & Feedback",
          icon: Star,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B0F17] border-r border-slate-800/80 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B8F000] text-black font-black text-sm flex items-center justify-center shadow-[0_0_20px_rgba(184,240,0,0.25)]">
              SBA
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Badminton Admin</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Connected</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navItems.map((sec) => (
            <div key={sec.category} className="space-y-1">
              <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {sec.category}
              </div>
              <div className="space-y-1 pt-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#B8F000] text-black font-bold shadow-md shadow-[#B8F000]/10"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-black" : "text-slate-400"
                        }`}
                      />
                      <span>{item.label}</span>
                      {item.badge}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Help Card */}
          <div className="mt-6 p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/90 text-xs">
            <div className="flex items-center gap-2 text-[#B8F000] font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admissions Tip</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Parents who are called within 15 minutes of submitting an inquiry are 4x more likely to book a trial session.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-slate-800/80 space-y-2 bg-[#080B10]">
          {currentUser && (
            <div className="p-2.5 rounded-xl bg-[#0D111A] border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#B8F000]/10 border border-[#B8F000]/30 text-[#B8F000] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : "A"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {currentUser.fullName || "Administrator"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate leading-tight">
                    {currentUser.email || ""}
                  </p>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase flex-shrink-0">
                {currentUser.role === "SUPER_ADMIN" ? "Super Admin" : currentUser.role || "Admin"}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            {onOpenChangePassword && (
              <button
                type="button"
                onClick={onOpenChangePassword}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 border border-slate-800 transition-colors cursor-pointer"
                title="Change Password"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Password</span>
              </button>
            )}

            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 border border-slate-800 transition-colors"
              title="View Public Site"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#B8F000]" />
              <span>Website</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out / Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
