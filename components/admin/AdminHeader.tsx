"use client";

import React from "react";
import Link from "next/link";
import {
  Menu,
  RefreshCw,
  Plus,
  ExternalLink,
  Users,
  Image as ImageIcon,
  BookOpen,
  Users2,
  Trophy,
  MapPin,
  LayoutDashboard,
  Star,
  Target,
  Calendar,
} from "lucide-react";
import { AdminTab } from "./AdminSidebar";

interface AdminHeaderProps {
  activeTab: AdminTab;
  onOpenMobile: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenAddModal: () => void;
  lastRefreshedAt?: Date | null;
}

const TAB_INFO: Record<
  AdminTab,
  {
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    publicUrl?: string;
    publicLabel?: string;
    primaryActionLabel?: string;
  }
> = {
  overview: {
    title: "Academy Dashboard",
    subtitle: "At-a-glance performance, pending follow-ups, and admissions pulse",
    icon: LayoutDashboard,
    primaryActionLabel: "+ Add Inquiry",
  },
  leads: {
    title: "Student Admissions & Inquiries",
    subtitle: "Manage parent inquiries, WhatsApp follow-ups, trials, and enrolments",
    icon: Users,
    primaryActionLabel: "+ Add Inquiry",
  },
  centres: {
    title: "Centres & Arena Infrastructure",
    subtitle: "Manage academy centres, court counts, addresses, map links, and display order",
    icon: MapPin,
    publicUrl: "/branches",
    publicLabel: "View Centres Directory",
  },
  programs: {
    title: "Training Programs & Tracks",
    subtitle: "Manage training tracks, descriptions, and homepage program cards",
    icon: Target,
    publicUrl: "/programs",
    publicLabel: "View Programs Page",
  },
  events: {
    title: "Events & Tournaments",
    subtitle: "Manage upcoming badminton tournaments, championships, camps, workshops & academy events",
    icon: Calendar,
    publicUrl: "/events",
    publicLabel: "View Public Events",
  },
  gallery: {
    title: "Court & Training Gallery",
    subtitle: "Manage court photos, training drill highlights, and tournament images",
    icon: ImageIcon,
    publicUrl: "/gallery",
    publicLabel: "View Gallery Page",
  },
  coaches: {
    title: "Coaches & Training Staff",
    subtitle: "Manage head coaches, training specializations, and career achievements",
    icon: Users2,
    publicUrl: "/coaches",
    publicLabel: "View Coaches Page",
  },
  achievements: {
    title: "Track Record & Hall of Fame",
    subtitle: "State & national championship medals, academy milestones, and records",
    icon: Trophy,
    publicUrl: "/achievements",
    publicLabel: "View Achievements",
  },
  blog: {
    title: "Blog Articles & Guides",
    subtitle: "Publish badminton training tips, Kochi coaching guides, and SEO articles",
    icon: BookOpen,
    publicUrl: "/blog",
    publicLabel: "View Blog",
  },
  testimonials: {
    title: "Reviews & Student Feedback",
    subtitle: "Verified Google ratings, parent reviews, and trainee testimonials",
    icon: Star,
    publicUrl: "/testimonials",
    publicLabel: "View Reviews",
  },
};

export function AdminHeader({
  activeTab,
  onOpenMobile,
  onRefresh,
  isRefreshing,
  onOpenAddModal,
  lastRefreshedAt,
}: AdminHeaderProps) {
  const info = TAB_INFO[activeTab];
  const Icon = info.icon;

  return (
    <header className="sticky top-0 z-30 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobile}
            className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 items-center justify-center text-[#B8F000]">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {info.title}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                {info.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Public Page Link if CMS */}
          {info.publicUrl && (
            <Link
              href={info.publicUrl}
              target="_blank"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <span>{info.publicLabel || "Live Page"}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#B8F000]" />
            </Link>
          )}

          {/* Sync / Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#B8F000]" : "text-slate-400"}`}
            />
            <span className="hidden sm:inline">Sync</span>
          </button>

          {/* Primary Action Button (for overview & leads) */}
          {(activeTab === "overview" || activeTab === "leads") && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#B8F000] hover:bg-[#cbf722] text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-[#B8F000]/10 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{info.primaryActionLabel || "Add New"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
