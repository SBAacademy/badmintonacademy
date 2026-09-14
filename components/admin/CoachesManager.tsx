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
  ArrowUp,
  ArrowDown,
  LayoutGrid,
  ListOrdered,
  Camera,
  Star,
} from "lucide-react";
import { Coach, CoachPhoto, normalizeWhatsAppNumber, formatWhatsAppDisplay, DEFAULT_COACH_IMAGE, getCoachPrimaryPhoto } from "@/data/coaches";
import { CoachMultiPhotoUpload } from "./CoachMultiPhotoUpload";
import { Centre } from "@/data/centres";

const DEFAULT_AVATAR = "/images/training-coach.jpg";

export function CoachesManager() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("ALL");
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [reordering, setReordering] = useState(false);

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
    primaryBranch: "",
    specialization: "",
    certifications: "",
    achievements: "",
    bio: "",
    image: DEFAULT_AVATAR,
    photos: [] as CoachPhoto[],
    isPublished: true,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    displayOrder: 1,
  });

  const fetchCentres = async () => {
    try {
      const res = await fetch("/api/centres");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setCentres(data.items);
      }
    } catch (err) {
      console.error("Failed to load centres in CoachesManager:", err);
    }
  };

  const fetchCoaches = async () => {
    setLoading(true);
    setLoadError(null);
    setFeedbackMessage(null);
    try {
      const res = await fetch("/api/content/coaches");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        const sorted = [...data.items].sort(
          (a: Coach, b: Coach) => (a.displayOrder || 0) - (b.displayOrder || 0)
        );
        setCoaches(sorted);
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
    fetchCentres();
  }, []);

  const openAddModal = () => {
    setEditingCoach(null);
    const nextOrder = coaches.length > 0
      ? Math.max(...coaches.map((c) => c.displayOrder || 0)) + 1
      : 1;

    const defaultBranch = centres[0]?.name || "All Centres";

    setForm({
      name: "",
      slug: "",
      whatsappNumber: "",
      role: "Senior Badminton Coach",
      experienceYears: 8,
      primaryBranch: defaultBranch,
      specialization: "Singles Tactical Footwork & Match Conditioning",
      certifications: "BWF Level 1 Certified Coach\nNIS Sports Coaching Diploma",
      achievements: "Former State Senior Medalist\nCoached Ernakulam District Squad",
      bio: "Dedicated badminton trainer with extensive experience mentoring junior and adult athletes in Kochi.",
      image: DEFAULT_AVATAR,
      photos: [],
      isPublished: true,
      status: "ACTIVE",
      displayOrder: nextOrder,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coach: Coach) => {
    setEditingCoach(coach);
    
    // Normalize existing photos
    const existingPhotos: CoachPhoto[] = Array.isArray(coach.photos) && coach.photos.length > 0
      ? coach.photos
      : Array.isArray(coach.images) && coach.images.length > 0
      ? coach.images.map((url, i) => ({
          id: `photo_${coach.id}_${i + 1}`,
          coachId: coach.id,
          imageUrl: url,
          sortOrder: i + 1,
          isPrimary: i === 0,
        }))
      : coach.image
      ? [
          {
            id: `photo_${coach.id}_1`,
            coachId: coach.id,
            imageUrl: coach.image,
            sortOrder: 1,
            isPrimary: true,
          },
        ]
      : [];

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
      photos: existingPhotos,
      isPublished: coach.isPublished !== false,
      status: coach.status || "ACTIVE",
      displayOrder: coach.displayOrder || 1,
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

    // Determine primary photo URL
    const primary = form.photos.find((p) => p.isPrimary) || form.photos[0];
    const primaryImgUrl = primary ? primary.imageUrl : (form.image?.trim() || DEFAULT_AVATAR);

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
      image: primaryImgUrl,
      images: form.photos.map((p) => p.imageUrl),
      photos: form.photos,
      isPublished: form.isPublished,
      status: form.status,
      displayOrder: Number(form.displayOrder) || 1,
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
          setCoaches((prev) => {
            const updated = prev.map((c) => (c.id === editingCoach.id ? data.item : c));
            return updated.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          });
          setFeedbackMessage({ type: "success", text: `Updated "${data.item.name}" successfully with ${form.photos.length} photo(s).` });
        } else {
          setCoaches((prev) => {
            const updated = [data.item, ...prev];
            return updated.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          });
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

  // Reorder coach position (Move Up / Down)
  const handleMoveCoachOrder = async (coachId: string, direction: "up" | "down") => {
    const currentIndex = coaches.findIndex((c) => c.id === coachId);
    if (currentIndex === -1) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === coaches.length - 1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const reordered = [...coaches];
    const temp = reordered[currentIndex];
    reordered[currentIndex] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Clean 1-based sequential displayOrder
    const updatedList = reordered.map((c, idx) => ({
      ...c,
      displayOrder: idx + 1,
    }));

    setCoaches(updatedList);
    setReordering(true);

    try {
      const res = await fetch("/api/content/coaches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          orders: updatedList.map((c) => ({ id: c.id, displayOrder: c.displayOrder })),
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setCoaches(data.items);
        setFeedbackMessage({ type: "success", text: "Display order updated and synced to public site." });
      }
    } catch (err) {
      console.error("Failed to reorder coaches:", err);
      fetchCoaches();
    } finally {
      setReordering(false);
    }
  };

  // Direct manual index edit
  const handleUpdateCoachIndex = async (coachId: string, newOrder: number) => {
    if (isNaN(newOrder) || newOrder < 1) return;
    const updated = coaches.map((c) => (c.id === coachId ? { ...c, displayOrder: newOrder } : c));
    updated.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    setCoaches(updated);
    setReordering(true);

    try {
      const res = await fetch("/api/content/coaches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          orders: updated.map((c) => ({ id: c.id, displayOrder: c.displayOrder })),
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setCoaches(data.items);
        setFeedbackMessage({ type: "success", text: `Position updated to #${newOrder}.` });
      }
    } catch (err) {
      console.error("Failed to update index:", err);
    } finally {
      setReordering(false);
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
      coach.primaryBranch?.toLowerCase().includes(selectedBranchFilter.toLowerCase()) ||
      selectedBranchFilter.toLowerCase().includes(coach.primaryBranch?.toLowerCase() || "");

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

      {/* Search & Branch & View Toolbar */}
      <div className="p-4 bg-[#0B0F14] border border-[#1F2937] flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Filter */}
          <div className="flex items-center gap-1.5 bg-[#07090D] border border-[#1F2937] p-1 font-mono text-[11px] overflow-x-auto max-w-full">
            <span className="text-[#6B7280] px-1.5 uppercase shrink-0">Branch:</span>
            <button
              type="button"
              onClick={() => setSelectedBranchFilter("ALL")}
              className={`px-2 py-1 uppercase transition-colors cursor-pointer shrink-0 ${
                selectedBranchFilter === "ALL"
                  ? "bg-[#B8F000] text-[#07090D] font-bold"
                  : "text-[#A8B0BA] hover:text-white"
              }`}
            >
              ALL
            </button>
            {centres.map((c) => {
              const filterLabel = c.shortName || c.name.replace(/ Branch| \(Headquarters\)/i, "");
              const isSelected = selectedBranchFilter === c.name || selectedBranchFilter === filterLabel;
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setSelectedBranchFilter(filterLabel)}
                  className={`px-2 py-1 uppercase transition-colors cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-[#B8F000] text-[#07090D] font-bold"
                      : "text-[#A8B0BA] hover:text-white"
                  }`}
                >
                  {filterLabel}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle: Cards vs Reorder Table */}
          <div className="flex items-center bg-[#07090D] border border-[#1F2937] p-1 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-2.5 py-1 uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === "cards"
                  ? "bg-[#B8F000] text-[#07090D] font-bold"
                  : "text-[#A8B0BA] hover:text-white"
              }`}
              title="Card Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#B8F000] text-[#07090D] font-bold"
                  : "text-[#A8B0BA] hover:text-white"
              }`}
              title="Display Order & Index Table view"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Ordering Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Coach Cards Grid / Table View */}
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
      ) : viewMode === "table" ? (
        /* ========================================================================= */
        /* ORDER & INDEX TABLE VIEW                                                 */
        /* ========================================================================= */
        <div className="bg-[#0B0F14] border border-[#1F2937] overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#07090D] text-[#A8B0BA] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 w-28">Order / Index</th>
                <th className="py-3 px-4">Coach &amp; Primary Photo</th>
                <th className="py-3 px-4">Role &amp; Branch</th>
                <th className="py-3 px-4">Photos Gallery</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {filteredCoaches.map((coach, index) => {
                const isLive = coach.isPublished !== false && coach.status !== "INACTIVE";
                const photoCount = coach.photos?.length || (coach.images?.length ?? (coach.image ? 1 : 0));
                const primaryImg = getCoachPrimaryPhoto(coach);

                return (
                  <tr
                    key={coach.id}
                    className="hover:bg-[#11161D]/70 transition-colors group"
                  >
                    {/* Display Order with Up/Down Arrows */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveCoachOrder(coach.id, "up")}
                            disabled={reordering || index === 0}
                            className="p-1 bg-[#11161D] hover:bg-[#B8F000] hover:text-[#07090D] border border-[#1F2937] text-[#A8B0BA] disabled:opacity-20 cursor-pointer"
                            title="Move coach earlier in public order"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveCoachOrder(coach.id, "down")}
                            disabled={reordering || index === coaches.length - 1}
                            className="p-1 bg-[#11161D] hover:bg-[#B8F000] hover:text-[#07090D] border border-[#1F2937] text-[#A8B0BA] disabled:opacity-20 cursor-pointer"
                            title="Move coach later in public order"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        <input
                          type="number"
                          min={1}
                          value={coach.displayOrder || index + 1}
                          onChange={(e) => handleUpdateCoachIndex(coach.id, Number(e.target.value))}
                          className="w-12 py-1 px-1.5 bg-[#07090D] border border-[#1F2937] text-white text-center font-bold text-xs focus:outline-none focus:border-[#B8F000]"
                          title="Direct order index (1 = First)"
                        />
                      </div>
                    </td>

                    {/* Coach Avatar & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-14 bg-[#07090D] border border-[#1F2937] shrink-0 overflow-hidden">
                          <Image
                            src={primaryImg}
                            alt={coach.name}
                            fill
                            className="object-cover object-top"
                            sizes="44px"
                            unoptimized
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm group-hover:text-[#B8F000] transition-colors">
                            {coach.name}
                          </div>
                          <div className="text-[10px] text-[#6B7280]">
                            /coaches/{coach.slug || coach.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role & Branch */}
                    <td className="py-3 px-4">
                      <div className="text-white text-xs font-bold">{coach.role}</div>
                      <div className="text-[#A8B0BA] text-[10px] flex items-center gap-1 mt-0.5">
                        <span>📍 {coach.primaryBranch}</span>
                      </div>
                    </td>

                    {/* Photos Count & Mini Previews */}
                    <td className="py-3 px-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-[#B8F000]/10 border border-[#B8F000]/30 text-[#B8F000] text-[10px] font-bold flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>{photoCount} Photo{photoCount !== 1 ? "s" : ""}</span>
                          </span>
                        </div>
                        {coach.photos && coach.photos.length > 1 && (
                          <div className="flex items-center gap-1">
                            {coach.photos.slice(0, 4).map((p, i) => (
                              <div
                                key={p.id || i}
                                className={`relative w-6 h-7 border overflow-hidden ${
                                  p.isPrimary ? "border-[#B8F000]" : "border-[#1F2937]"
                                }`}
                                title={p.isPrimary ? "Primary cover photo" : `Photo ${i + 1}`}
                              >
                                <Image
                                  src={p.imageUrl}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="24px"
                                  unoptimized
                                />
                              </div>
                            ))}
                            {coach.photos.length > 4 && (
                              <span className="text-[9px] text-[#6B7280]">
                                +{coach.photos.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {isLive ? (
                        <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase">
                          ● Live
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-500/40 text-amber-400 text-[10px] font-bold uppercase">
                          ○ Hidden
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/coaches/${coach.slug || coach.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-[#B8F000] transition-colors"
                          title="View live profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(coach)}
                          className={`p-1.5 border transition-colors cursor-pointer ${
                            isLive
                              ? "bg-[#11161D] hover:bg-amber-950/40 border-[#1F2937] text-[#A8B0BA] hover:text-amber-400"
                              : "bg-[#11161D] hover:bg-emerald-950/40 border-amber-500/40 text-amber-400 hover:text-emerald-400"
                          }`}
                          title={isLive ? "Unpublish from website" : "Publish to live website"}
                        >
                          {isLive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(coach)}
                          className="p-1.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-[#B8F000] transition-colors cursor-pointer"
                          title="Edit coach photos & details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(coach.id, coach.name)}
                          className="p-1.5 bg-[#11161D] hover:bg-rose-950/40 border border-[#1F2937] hover:border-rose-500/40 text-[#6B7280] hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete coach"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* ========================================================================= */
        /* CARDS GRID VIEW                                                          */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredCoaches.map((coach, index) => {
            const isLive = coach.isPublished !== false && coach.status !== "INACTIVE";
            const photoCount = coach.photos?.length || (coach.images?.length ?? (coach.image ? 1 : 0));
            const primaryImg = getCoachPrimaryPhoto(coach);

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
                  {/* Portrait & Order Overlays */}
                  <div className="relative aspect-[3/4] w-full bg-[#07090D] overflow-hidden">
                    <Image
                      src={primaryImg}
                      alt={coach.name}
                      fill
                      className={`object-cover object-top transition-transform duration-300 ${
                        isLive ? "group-hover:scale-105" : "grayscale"
                      }`}
                      sizes="(max-width: 640px) 100vw, 25vw"
                      unoptimized
                    />

                    {/* Order & Experience Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                      <span className="px-2 py-0.5 bg-[#B8F000] font-mono text-[10px] text-[#07090D] font-black uppercase tracking-wider shadow-md">
                        #{coach.displayOrder || index + 1}
                      </span>
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

                    {/* Quick Move Up / Down Buttons on Card */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                      <button
                        type="button"
                        onClick={() => handleMoveCoachOrder(coach.id, "up")}
                        disabled={reordering || index === 0}
                        className="p-1 bg-[#07090D]/90 hover:bg-[#B8F000] hover:text-[#07090D] border border-[#1F2937] text-white disabled:opacity-20 transition-colors cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCoachOrder(coach.id, "down")}
                        disabled={reordering || index === coaches.length - 1}
                        className="p-1 bg-[#07090D]/90 hover:bg-[#B8F000] hover:text-[#07090D] border border-[#1F2937] text-white disabled:opacity-20 transition-colors cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Bottom Branch & Photos Count Badges */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 z-10">
                      <span className="px-2 py-0.5 bg-[#07090D]/90 backdrop-blur-sm border border-[#1F2937] font-mono text-[9px] text-white block truncate">
                        📍 {coach.primaryBranch}
                      </span>
                      <span className="px-2 py-0.5 bg-[#07090D]/95 border border-[#1F2937] font-mono text-[9px] text-[#B8F000] shrink-0 flex items-center gap-1 font-bold">
                        <Camera className="w-2.5 h-2.5" />
                        <span>{photoCount}</span>
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
                      title="Edit Coach Profile & Photos"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-2xl w-full max-h-[92vh] flex flex-col bg-[#0B0F14] border border-[#1F2937] shadow-2xl relative overflow-hidden">
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#1F2937] shrink-0 bg-[#0B0F14]">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#B8F000]" />
                <span>{editingCoach ? "Edit Coach Profile" : "Add New Coach to Faculty"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#A8B0BA] hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 font-mono text-xs flex-1">
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

                {/* WhatsApp Number & Dynamic URL Slug - Prominently Highlighted */}
                <div className="p-3.5 bg-[#07090D] border-2 border-[#B8F000]/40 space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-[#1F2937]">
                    <span className="text-[11px] font-bold text-[#B8F000] uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#B8F000]" />
                      <span>WhatsApp / Contact Number &amp; Profile Link</span>
                    </span>
                    <span className="px-1.5 py-0.5 bg-[#B8F000]/10 font-mono text-[9px] text-[#B8F000] uppercase font-bold">
                      Click-to-Chat
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#A8B0BA] uppercase mb-1 font-bold flex items-center justify-between">
                        <span>WhatsApp Number</span>
                        <span className="text-[9px] text-[#6B7280]">Supports +91 / local</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-[#A8B0BA] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={form.whatsappNumber}
                          onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3 py-2 bg-[#0B0F14] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                        />
                      </div>
                      {form.whatsappNumber.trim() ? (
                        <div className="mt-1.5 text-[10px] text-emerald-400 flex items-center gap-1.5 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>
                            ✓ Stored as: <strong>{normalizeWhatsAppNumber(form.whatsappNumber)}</strong>
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1 text-[10px] text-[#6B7280]">
                          Optional. Leave blank to disable direct WhatsApp CTA.
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#A8B0BA] uppercase mb-1 font-bold flex items-center justify-between">
                        <span>Public Profile Slug</span>
                        <span className="text-[9px] text-[#6B7280]">Auto-generated</span>
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
                        URL: <span className="text-[#B8F000]">/coaches/{form.slug || "coach-slug"}</span>
                      </div>
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
                    {/* Preserve existing branch if historical/deactivated */}
                    {form.primaryBranch && !centres.some((c) => c.name === form.primaryBranch) && form.primaryBranch !== "All Centres" && (
                      <option value={form.primaryBranch}>
                        {form.primaryBranch} (Historical)
                      </option>
                    )}
                    {centres.map((c) => (
                      <option key={c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="All Centres">All Centres</option>
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
                  <label className="block text-[#A8B0BA] uppercase mb-1 flex items-center justify-between">
                    <span>Display Order</span>
                    <span className="text-[9px] text-[#B8F000]">#1 appears first</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) || 1 })}
                    placeholder="1"
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

              {/* Multiple Photos Upload & Management */}
              <CoachMultiPhotoUpload
                coachId={editingCoach?.id || "new"}
                photos={form.photos}
                onChange={(updatedPhotos) => {
                  const primary = updatedPhotos.find((p) => p.isPrimary) || updatedPhotos[0];
                  setForm((prev) => ({
                    ...prev,
                    photos: updatedPhotos,
                    image: primary ? primary.imageUrl : DEFAULT_AVATAR,
                  }));
                }}
                maxPhotos={12}
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

              </div>

              {/* Sticky Modal Footer */}
              <div className="p-4 border-t border-[#1F2937] bg-[#07090D] flex items-center justify-between shrink-0 font-mono">
                <span className="text-[10px] text-[#6B7280]">
                  {form.whatsappNumber.trim() ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>WhatsApp: {normalizeWhatsAppNumber(form.whatsappNumber)}</span>
                    </span>
                  ) : (
                    <span className="text-amber-400">⚠ No WhatsApp number</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-[#11161D] hover:bg-[#17212C] text-[#A8B0BA] hover:text-white uppercase font-bold text-xs cursor-pointer border border-[#1F2937]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black uppercase text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
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
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

