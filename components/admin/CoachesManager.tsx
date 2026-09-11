"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  X,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Phone,
  MessageSquare,
  Globe,
} from "lucide-react";
import { Coach, normalizeWhatsAppNumber, formatWhatsAppDisplay } from "@/data/coaches";
import { ImageUploadField } from "./ImageUploadField";

const BRANCHES = [
  "Kadavanthra (Headquarters)",
  "Edappally Branch",
  "Kakkanad Branch",
  "All Centres",
];

const DEFAULT_AVATAR = "/images/training-coach.jpg";

export function CoachesManager() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("ALL");
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    whatsappNumber: "",
    role: "",
    experienceYears: 10,
    primaryBranch: "Kadavanthra (Headquarters)",
    specialization: "",
    certifications: "",
    achievements: "",
    bio: "",
    image: DEFAULT_AVATAR,
    isPublished: true,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    displayOrder: 0,
  });

  const fetchCoaches = async () => {
    setLoading(true);
    setLoadError(null);
    setFeedbackMessage(null);
    try {
      const res = await fetch("/api/content/coaches");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setCoaches(data.items);
      } else {
        setCoaches([]);
        setLoadError(data.message || "Unable to load coaches. Please refresh or try again.");
      }
    } catch (err) {
      console.error("Failed to load coaches:", err);
      setCoaches([]);
      setLoadError("Unable to load coaches. Please refresh or try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const openAddModal = () => {
    setEditingCoach(null);
    setForm({
      name: "",
      slug: "",
      whatsappNumber: "",
      role: "Senior Badminton Coach",
      experienceYears: 8,
      primaryBranch: "Kadavanthra (Headquarters)",
      specialization: "Singles Tactical Footwork & Match Conditioning",
      certifications: "BWF Level 1 Certified Coach\nNIS Sports Coaching Diploma",
      achievements: "Former State Senior Medalist\nCoached Ernakulam District Squad",
      bio: "Dedicated badminton trainer with extensive experience mentoring junior and adult athletes in Kochi.",
      image: DEFAULT_AVATAR,
      isPublished: true,
      status: "ACTIVE",
      displayOrder: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coach: Coach) => {
    setEditingCoach(coach);
    setForm({
      name: coach.name,
      slug: coach.slug || coach.id,
      whatsappNumber: coach.whatsappNumber || "",
      role: coach.role,
      experienceYears: coach.experienceYears,
      primaryBranch: coach.primaryBranch,
      specialization: coach.specialization,
      certifications: (coach.certifications || []).join("\n"),
      achievements: (coach.achievements || []).join("\n"),
      bio: coach.bio,
      image: coach.image || DEFAULT_AVATAR,
      isPublished: coach.isPublished !== false,
      status: coach.status || "ACTIVE",
      displayOrder: coach.displayOrder || 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) return;
    setSaving(true);
    setFeedbackMessage(null);

    const rawSlug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
    const cleanId = editingCoach ? editingCoach.id : cleanSlug;

    const payload = {
      id: cleanId,
      slug: cleanSlug,
      name: form.name.trim(),
      role: form.role.trim(),
      whatsappNumber: form.whatsappNumber.trim() ? normalizeWhatsAppNumber(form.whatsappNumber) : null,
      experienceYears: Number(form.experienceYears) || 5,
      primaryBranch: form.primaryBranch,
      specialization: form.specialization.trim(),
      certifications: form.certifications.split("\n").map((c) => c.trim()).filter(Boolean),
      achievements: form.achievements.split("\n").map((a) => a.trim()).filter(Boolean),
      bio: form.bio.trim(),
      image: form.image?.trim() || DEFAULT_AVATAR,
      isPublished: form.isPublished,
      status: form.status,
      displayOrder: Number(form.displayOrder) || 0,
    };

    try {
      const method = editingCoach ? "PUT" : "POST";
      const res = await fetch("/api/content/coaches", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.item) {
        if (editingCoach) {
          setCoaches((prev) =>
            prev.map((c) => (c.id === editingCoach.id ? data.item : c))
          );
          setFeedbackMessage({ type: "success", text: `Updated "${data.item.name}" successfully.` });
        } else {
          setCoaches((prev) => [data.item, ...prev]);
          setFeedbackMessage({ type: "success", text: `Created "${data.item.name}" and saved to database.` });
        }
        setIsModalOpen(false);
      } else {
        setFeedbackMessage({ type: "error", text: data.message || "Failed to save coach." });
      }
    } catch (err) {
      console.error("Failed to save coach:", err);
      setFeedbackMessage({ type: "error", text: "Network error while saving coach." });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (coach: Coach) => {
    const newPublished = coach.isPublished === false ? true : false;
    const updatedCoach = { ...coach, isPublished: newPublished };

    // Optimistic update
    setCoaches((prev) => prev.map((c) => (c.id === coach.id ? updatedCoach : c)));

    try {
      const res = await fetch("/api/content/coaches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCoach),
      });
      const data = await res.json();
      if (!data.success) {
        // Revert on error
        setCoaches((prev) => prev.map((c) => (c.id === coach.id ? coach : c)));
        setFeedbackMessage({ type: "error", text: data.message || "Failed to update publication status." });
      } else {
        setFeedbackMessage({
          type: "success",
          text: `"${coach.name}" is now ${newPublished ? "Published (LIVE on website)" : "Hidden (Unpublished)"}.`,
        });
      }
    } catch {
      setCoaches((prev) => prev.map((c) => (c.id === coach.id ? coach : c)));
      setFeedbackMessage({ type: "error", text: "Failed to toggle status due to network issue." });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}"? This action permanently deletes the coach from PostgreSQL.`)) {
      return;
    }
    setFeedbackMessage(null);
    try {
      const res = await fetch(`/api/content/coaches?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.items)) {
          setCoaches(data.items);
        } else {
          setCoaches((prev) => prev.filter((c) => c.id !== id));
        }
        setFeedbackMessage({ type: "success", text: data.message || `Removed "${name}".` });
      } else {
        setFeedbackMessage({ type: "error", text: data.message || "Failed to delete coach." });
      }
    } catch (err) {
      console.error("Failed to delete coach:", err);
      setFeedbackMessage({ type: "error", text: "Network error while deleting coach." });
      fetchCoaches();
    }
  };

  const filteredCoaches = coaches.filter((coach) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      coach.name.toLowerCase().includes(q) ||
      coach.role.toLowerCase().includes(q) ||
      coach.specialization.toLowerCase().includes(q) ||
      coach.primaryBranch.toLowerCase().includes(q);

    const matchesBranch =
      selectedBranchFilter === "ALL" ||
      coach.primaryBranch.toLowerCase().includes(selectedBranchFilter.toLowerCase());

    return matchesSearch && matchesBranch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#0B0F14] border border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#B8F000] font-bold uppercase tracking-widest">
              WEBSITE CMS // FACULTY
            </span>
            <span className="px-2 py-0.5 bg-[#B8F000]/10 border border-[#B8F000]/30 font-mono text-[10px] text-[#B8F000]">
              {coaches.filter((c) => c.isPublished !== false && c.status !== "INACTIVE").length} Live on Website
            </span>
            <span className="px-2 py-0.5 bg-[#1F2937] border border-[#374151] font-mono text-[10px] text-[#A8B0BA]">
              {coaches.length} Total in DB
            </span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">
            Coaching Panel &amp; Mentors Manager
          </h2>
          <p className="text-xs text-[#A8B0BA] font-mono">
            Authoritative faculty management. Changes sync directly to PostgreSQL and update <a href="/coaches" target="_blank" className="text-[#B8F000] hover:underline">/coaches</a> and the homepage immediately.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchCoaches}
            disabled={loading}
            className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reload from Neon PostgreSQL"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#B8F000]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <a
            href="/coaches"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#B8F000]" />
            <span className="hidden sm:inline">View Public Roster</span>
          </a>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Coach</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-3 border font-mono text-xs flex items-center justify-between transition-all ${
            feedbackMessage.type === "success"
              ? "bg-[#B8F000]/10 border-[#B8F000]/40 text-[#B8F000]"
              : "bg-rose-500/10 border-rose-500/40 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="hover:opacity-75 cursor-pointer ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Branch Toolbar */}
      <div className="p-4 bg-[#0B0F14] border border-[#1F2937] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A8B0BA] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coaches by name, specialization, role..."
            className="w-full pl-9 pr-4 py-2 bg-[#07090D] border border-[#1F2937] text-white text-xs font-mono focus:outline-none focus:border-[#B8F000]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#07090D] border border-[#1F2937] p-1 font-mono text-[11px]">
          <span className="text-[#6B7280] px-2 uppercase">Branch:</span>
          {["ALL", "Kadavanthra", "Edappally", "Kakkanad"].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBranchFilter(b)}
              className={`px-2 py-1 uppercase transition-colors ${
                selectedBranchFilter === b
                  ? "bg-[#B8F000] text-[#07090D] font-bold"
                  : "text-[#A8B0BA] hover:text-white"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Coach Cards Grid / Status View */}
      {loading ? (
        <div className="py-20 text-center bg-[#0B0F14] border border-[#1F2937] text-[#A8B0BA] font-mono text-xs flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#B8F000]" />
          <span>Loading faculty roster from PostgreSQL...</span>
        </div>
      ) : loadError ? (
        <div className="py-20 text-center bg-[#0B0F14] border border-rose-500/30 text-rose-400 font-mono text-xs space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="font-bold">{loadError}</p>
          <button
            type="button"
            onClick={fetchCoaches}
            className="px-4 py-2 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-white font-mono text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#B8F000]" />
            <span>Retry</span>
          </button>
        </div>
      ) : coaches.length === 0 ? (
        <div className="py-20 text-center bg-[#0B0F14] border border-[#1F2937] text-[#A8B0BA] font-mono text-xs space-y-3">
          <p className="text-white font-bold text-sm">No coaches found.</p>
          <p className="text-xs text-[#6B7280]">Database contains no coaches. Click below to add a coach.</p>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 bg-[#B8F000] text-[#07090D] font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Coach</span>
          </button>
        </div>
      ) : filteredCoaches.length === 0 ? (
        <div className="py-20 text-center bg-[#0B0F14] border border-[#1F2937] text-[#A8B0BA] font-mono text-xs">
          No coaches match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredCoaches.map((coach) => {
            const isLive = coach.isPublished !== false && coach.status !== "INACTIVE";

            return (
              <div
                key={coach.id}
                className={`bg-[#0B0F14] border overflow-hidden flex flex-col justify-between group transition-all ${
                  isLive
                    ? "border-[#1F2937] hover:border-[#B8F000]/60"
                    : "border-amber-500/30 opacity-80 hover:opacity-100"
                }`}
              >
                <div>
                  {/* Portrait */}
                  <div className="relative aspect-[3/4] w-full bg-[#07090D] overflow-hidden">
                    <Image
                      src={coach.image || DEFAULT_AVATAR}
                      alt={coach.name}
                      fill
                      className={`object-cover object-top transition-transform duration-300 ${
                        isLive ? "group-hover:scale-105" : "grayscale"
                      }`}
                      sizes="(max-width: 640px) 100vw, 25vw"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="px-2 py-0.5 bg-[#07090D]/90 backdrop-blur-sm border border-[#1F2937] font-mono text-[9px] text-[#B8F000] uppercase font-bold">
                        {coach.experienceYears}Y Exp
                      </span>
                      {isLive ? (
                        <span className="px-1.5 py-0.5 bg-emerald-950/90 border border-emerald-500/50 font-mono text-[9px] text-emerald-400 font-bold uppercase">
                          ● Live
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-amber-950/90 border border-amber-500/50 font-mono text-[9px] text-amber-400 font-bold uppercase">
                          ○ Hidden
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="px-2 py-0.5 bg-[#07090D]/90 backdrop-blur-sm border border-[#1F2937] font-mono text-[9px] text-white block truncate">
                        📍 {coach.primaryBranch}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-[#B8F000] transition-colors">
                        {coach.name}
                      </h3>
                      <div className="text-[11px] text-[#B8F000] font-mono font-bold">
                        {coach.role}
                      </div>
                    </div>

                    <p className="text-[11px] font-mono text-[#A8B0BA] line-clamp-2 leading-relaxed">
                      {coach.bio}
                    </p>

                    {/* WhatsApp Status Indicator */}
                    <div className="pt-1">
                      {coach.whatsappNumber ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-1">
                          <MessageSquare className="w-3 h-3 shrink-0" />
                          <span className="truncate">WA: {formatWhatsAppDisplay(coach.whatsappNumber)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>⚠ WhatsApp not configured</span>
                        </div>
                      )}
                    </div>

                    {/* Certifications chips */}
                    <div className="space-y-1 pt-1">
                      {(coach.certifications || []).slice(0, 2).map((cert, i) => (
                        <div
                          key={i}
                          className="text-[10px] font-mono text-[#6B7280] truncate flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3 h-3 text-[#B8F000] shrink-0" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 border-t border-[#1F2937] bg-[#07090D] flex items-center justify-between font-mono text-xs">
                  <a
                    href={`/coaches/${coach.slug || coach.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#B8F000] hover:underline flex items-center gap-1 font-mono font-bold"
                    title="Preview public coach profile"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(coach)}
                      className={`p-1.5 border font-mono text-[10px] flex items-center gap-1 transition-colors cursor-pointer ${
                        isLive
                          ? "bg-[#11161D] hover:bg-amber-950/40 border-[#1F2937] text-[#A8B0BA] hover:text-amber-400"
                          : "bg-[#11161D] hover:bg-emerald-950/40 border-amber-500/40 text-amber-400 hover:text-emerald-400"
                      }`}
                      title={isLive ? "Unpublish from public website" : "Publish to live website"}
                    >
                      {isLive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(coach)}
                      className="p-1.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-[#B8F000] transition-colors cursor-pointer"
                      title="Edit Coach Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(coach.id, coach.name)}
                      className="p-1.5 bg-[#11161D] hover:bg-rose-950/40 border border-[#1F2937] hover:border-rose-500/40 text-[#6B7280] hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete / Archive Coach"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Coach Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="max-w-2xl w-full bg-[#0B0F14] border border-[#1F2937] p-6 space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#B8F000]" />
                <span>{editingCoach ? "Edit Coach Profile" : "Add New Coach to Faculty"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#A8B0BA] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Coach Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        name: newName,
                        slug: !editingCoach
                          ? newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                          : prev.slug,
                      }));
                    }}
                    placeholder="e.g. Coach Anand Varma"
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Role / Title *</label>
                  <input
                    type="text"
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="e.g. Head Coach & Technical Director"
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>
              </div>

              {/* WhatsApp Number & Dynamic URL Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#07090D] border border-[#1F2937]">
                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-white">
                      <Phone className="w-3.5 h-3.5 text-[#B8F000]" />
                      <span>WhatsApp Number</span>
                    </span>
                    <span className="text-[9px] text-[#6B7280]">International format</span>
                  </label>
                  <input
                    type="text"
                    value={form.whatsappNumber}
                    onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-[#0B0F14] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                  {form.whatsappNumber.trim() ? (
                    <div className="mt-1.5 text-[10px] text-emerald-400 flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        ✓ Stored as: <strong>{normalizeWhatsAppNumber(form.whatsappNumber)}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 text-[10px] text-[#6B7280]">
                      Optional. Leave blank to disable WhatsApp enquiry CTA.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-white">
                      <Globe className="w-3.5 h-3.5 text-[#B8F000]" />
                      <span>Public Profile Slug</span>
                    </span>
                    <span className="text-[9px] text-[#6B7280]">URL identifier</span>
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2 bg-[#11161D] border border-r-0 border-[#1F2937] text-[#6B7280] text-[11px] select-none">
                      /coaches/
                    </span>
                    <input
                      type="text"
                      required
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                      placeholder="sooraj-m-s"
                      className="w-full px-3 py-2 bg-[#0B0F14] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-[#A8B0BA] truncate">
                    Preview: <span className="text-[#B8F000]">/coaches/{form.slug || "coach-slug"}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[#A8B0BA] uppercase mb-1">Primary Branch</label>
                  <select
                    value={form.primaryBranch}
                    onChange={(e) => setForm({ ...form, primaryBranch: e.target.value })}
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  >
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={form.experienceYears}
                    onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Specialization / Focus Area</label>
                <input
                  type="text"
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  placeholder="e.g. High-Performance Singles & Tactical Match Biomechanics"
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              <ImageUploadField
                label="Coach Portrait / Headshot"
                value={form.image || ""}
                onChange={(url) => setForm({ ...form, image: url || DEFAULT_AVATAR })}
                required
                aspectRatio="1/1"
                helpText="Upload a photo from your computer, paste an external URL, or keep default academy portrait."
              />

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Certifications (1 per line)</label>
                <textarea
                  rows={2}
                  value={form.certifications}
                  onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                  placeholder="BWF Level 2 Certified Coach&#10;NIS Diploma in Sports Coaching"
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Career Achievements (1 per line)</label>
                <textarea
                  rows={2}
                  value={form.achievements}
                  onChange={(e) => setForm({ ...form, achievements: e.target.value })}
                  placeholder="Former Kerala State Senior Men's Singles Champion&#10;Coached 18+ National Championship Qualifiers"
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Coach Biography *</label>
                <textarea
                  rows={3}
                  required
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Professional summary, coaching approach, and pedigree..."
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              {/* Status & Publication Toggles */}
              <div className="p-3 bg-[#07090D] border border-[#1F2937] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublishedCheck"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="w-4 h-4 accent-[#B8F000] cursor-pointer"
                  />
                  <label htmlFor="isPublishedCheck" className="text-white uppercase font-bold cursor-pointer">
                    Publish Live on Website
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[#A8B0BA] uppercase text-[10px]">Status:</span>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                    className="px-2 py-1 bg-[#11161D] border border-[#1F2937] text-white text-[11px] focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#11161D] text-[#A8B0BA] hover:text-white uppercase font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black uppercase text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to PostgreSQL...</span>
                    </>
                  ) : editingCoach ? (
                    "Update Coach"
                  ) : (
                    "Save Coach"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

