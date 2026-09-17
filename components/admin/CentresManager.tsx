"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ExternalLink,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Building2,
  Navigation,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { Centre } from "@/data/centres";
import { resolveAutomaticNeighborhoods } from "@/lib/constants";

export function CentresManager() {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCentre, setEditingCentre] = useState<Centre | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Centre | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State strictly: Photo, Description, Timing, Location, Contact Number (+ Identity/Status)
  const [form, setForm] = useState({
    name: "",
    shortName: "",
    slug: "",
    image: "/images/badminton-arena.jpg",
    timing: "5:00 AM – 10:00 PM (All 7 Days)",
    description: "",
    area: "",
    city: "Kochi",
    pincode: "682020",
    address: "",
    phone: "+91 94006 35548",
    phoneDisplay: "+91 94006 35548",
    whatsapp: "919400635548",
    whatsappDisplay: "+91 94006 35548",
    email: "",
    googleMapsUrl: "",
    googleMapsEmbedUrl: "",
    latitude: "",
    longitude: "",
    displayOrder: 1,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    courtCount: 4,
    surfaceType: "BWF Grade-1 Certified Synthetic Cushion Surface",
    facilities: "",
    seoTitle: "",
    seoDescription: "",
  });

  const fetchCentres = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/centres");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        const sorted = [...data.items].sort(
          (a: Centre, b: Centre) => (a.displayOrder || 0) - (b.displayOrder || 0)
        );
        setCentres(sorted);
      } else {
        setCentres([]);
      }
    } catch (err) {
      console.error("Failed to fetch centres:", err);
      setFeedback({ type: "error", text: "Failed to load centres from database." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, []);

  const openAddModal = () => {
    setEditingCentre(null);
    const nextOrder = centres.length > 0 ? Math.max(...centres.map((c) => c.displayOrder || 0)) + 1 : 1;
    setForm({
      name: "",
      shortName: "",
      slug: "",
      image: "/images/badminton-arena.jpg",
      timing: "5:00 AM – 10:00 PM (All 7 Days)",
      description: "",
      area: "",
      city: "Kochi",
      pincode: "682020",
      address: "",
      phone: "+91 94006 35548",
      phoneDisplay: "+91 94006 35548",
      whatsapp: "919400635548",
      whatsappDisplay: "+91 94006 35548",
      email: "",
      googleMapsUrl: "",
      googleMapsEmbedUrl: "",
      latitude: "",
      longitude: "",
      displayOrder: nextOrder,
      status: "ACTIVE",
      courtCount: 4,
      surfaceType: "BWF Grade-1 Certified Synthetic Cushion Surface",
      facilities: "",
      seoTitle: "",
      seoDescription: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (centre: Centre) => {
    setEditingCentre(centre);
    const timingVal = centre.openingHours?.morning
      ? (centre.openingHours.evening ? `${centre.openingHours.morning} | ${centre.openingHours.evening}` : centre.openingHours.morning)
      : "5:00 AM – 10:00 PM (All 7 Days)";

    setForm({
      name: centre.name,
      shortName: centre.shortName || centre.name,
      slug: centre.slug,
      image: centre.image || "/images/badminton-arena.jpg",
      timing: timingVal,
      description: centre.description || "",
      area: centre.area || "",
      city: centre.city || "Kochi",
      pincode: centre.pincode || centre.postalCode || "682020",
      address: centre.address || "",
      phone: centre.phone || "+91 94006 35548",
      phoneDisplay: centre.phoneDisplay || centre.phone || "+91 94006 35548",
      whatsapp: centre.whatsapp || "919400635548",
      whatsappDisplay: centre.whatsappDisplay || centre.whatsapp || "+91 94006 35548",
      email: centre.email || "",
      googleMapsUrl: centre.googleMapsUrl || "",
      googleMapsEmbedUrl: centre.googleMapsEmbedUrl || "",
      latitude: centre.latitude !== null && centre.latitude !== undefined ? String(centre.latitude) : "",
      longitude: centre.longitude !== null && centre.longitude !== undefined ? String(centre.longitude) : "",
      displayOrder: centre.displayOrder || 1,
      status: centre.status || "ACTIVE",
      courtCount: centre.courtCount || 4,
      surfaceType: centre.surfaceType || "BWF Grade-1 Certified Synthetic Cushion Surface",
      facilities: Array.isArray(centre.facilities) ? centre.facilities.join("\n") : "",
      seoTitle: centre.seoTitle || centre.seo?.title || "",
      seoDescription: centre.seoDescription || centre.seo?.description || "",
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (nameVal: string) => {
    if (!editingCentre) {
      const generatedSlug = nameVal
        .toLowerCase()
        .replace(/s\s*&\s*a\s*badminton\s*academy/gi, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setForm((prev) => ({
        ...prev,
        name: nameVal,
        slug: generatedSlug || prev.slug,
        shortName: prev.shortName || nameVal.replace(/s\s*&\s*a\s*badminton\s*academy\s*[-–—]?\s*/gi, "").trim(),
      }));
    } else {
      setForm((prev) => ({ ...prev, name: nameVal }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFeedback({ type: "error", text: "Centre name is required." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const payload = {
      ...form,
      slug: (form.slug || form.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      courtCount: Number(form.courtCount) || 4,
      surfaceType: form.surfaceType || "BWF Grade-1 Certified Synthetic Cushion Surface",
      image: form.image || "/images/badminton-arena.jpg",
      openingHours: { days: "All 7 Days", morning: form.timing, evening: "" },
      latitude: form.latitude.trim() ? Number(form.latitude) : null,
      longitude: form.longitude.trim() ? Number(form.longitude) : null,
      displayOrder: Number(form.displayOrder) || 1,
      isActive: form.status === "ACTIVE",
    };

    try {
      const res = await fetch("/api/content/centres", {
        method: editingCentre ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setFeedback({
          type: "success",
          text: editingCentre ? `Updated "${payload.name}" successfully.` : `Created "${payload.name}" successfully.`,
        });
        setIsModalOpen(false);
        await fetchCentres();
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to save centre." });
      }
    } catch (err) {
      console.error("Save error:", err);
      setFeedback({ type: "error", text: "Network error while saving centre." });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (centre: Centre) => {
    const nextStatus: "ACTIVE" | "INACTIVE" = centre.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/centres/${centre.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, isActive: nextStatus === "ACTIVE" }),
      });
      const data = await res.json();
      if (data.success) {
        setCentres((prev) =>
          prev.map((c) => (c.slug === centre.slug ? { ...c, status: nextStatus, isActive: nextStatus === "ACTIVE" } : c))
        );
        setFeedback({
          type: "success",
          text: `Centre "${centre.name}" is now ${nextStatus}.`,
        });
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to toggle status." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error toggling centre status." });
    }
  };

  const handleMoveOrder = async (centreSlug: string, direction: "up" | "down") => {
    const currentIndex = centres.findIndex((c) => c.slug === centreSlug);
    if (currentIndex === -1) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === centres.length - 1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const reordered = [...centres];
    const temp = reordered[currentIndex];
    reordered[currentIndex] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Recalculate order indices
    const orders = reordered.map((c, idx) => ({ id: c.slug, displayOrder: idx + 1 }));

    // Optimistic update
    setCentres(reordered.map((c, idx) => ({ ...c, displayOrder: idx + 1 })));

    try {
      const res = await fetch("/api/content/centres", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", orders }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: "Centre display order updated." });
      } else {
        await fetchCentres();
      }
    } catch {
      await fetchCentres();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const targetSlug = deleteTarget.slug;
    const targetName = deleteTarget.name;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/centres/${encodeURIComponent(targetSlug)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        // Remove immediately from list
        setCentres((prev) => prev.filter((c) => c.slug !== targetSlug && c.id !== targetSlug));
        setFeedback({
          type: "success",
          text: data.message || `Center "${targetName}" deleted successfully.`,
        });
        setDeleteTarget(null);
        await fetchCentres();
      } else {
        setFeedback({
          type: "error",
          text: data.message || `Failed to delete center "${targetName}".`,
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error while deleting center." });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered List
  const filteredCentres = centres.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.area && c.area.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === "ACTIVE") return matchesSearch && (c.status === "ACTIVE" || !c.status);
    if (statusFilter === "INACTIVE") return matchesSearch && c.status === "INACTIVE";
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#B8F000]/10 border border-[#B8F000]/30 text-[#B8F000]">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                Centres &amp; Hubs Management
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Admin-controlled canonical badminton training centres, court infrastructure &amp; dynamic routing.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#B8F000]/10 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Centre</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-mono animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0D111A] border border-slate-800 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by centre name, slug, area, or address..."
            className="w-full pl-10 pr-4 py-2 bg-[#07090D] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000] font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#07090D] border border-slate-800 rounded-xl shrink-0">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-colors cursor-pointer ${
                statusFilter === tab
                  ? "bg-[#B8F000] text-[#07090D]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#B8F000] animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading centres from database...</p>
        </div>
      ) : filteredCentres.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-[#0D111A] border border-slate-800 rounded-2xl">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">No Centres Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? "No centres match your current search query." : "No centres currently configured in database."}
          </p>
        </div>
      ) : (
        <div className="bg-[#0D111A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Desktop Table: Unified Shared Column Grid */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-[1050px]">
              {/* Table Header */}
              <div className="grid grid-cols-[64px_minmax(250px,1.5fr)_minmax(280px,1.6fr)_minmax(180px,1fr)_90px_80px] items-center gap-4 px-4 py-3 bg-[#07090D] text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-800 select-none">
                <div className="text-center font-bold">Order</div>
                <div className="text-left font-bold">Centre &amp; Photo</div>
                <div className="text-left font-bold">Location &amp; Neighborhoods</div>
                <div className="text-left font-bold">Contact</div>
                <div className="text-center font-bold">Status</div>
                <div className="text-right font-bold">Actions</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-slate-800/60 font-mono text-xs">
                {filteredCentres.map((c, index) => {
                  const autoNeighborhoods = resolveAutomaticNeighborhoods(c.address, c.name);
                  return (
                    <div
                      key={c.slug}
                      className="grid grid-cols-[64px_minmax(250px,1.5fr)_minmax(280px,1.6fr)_minmax(180px,1fr)_90px_80px] items-center gap-4 px-4 py-4 min-h-[110px] hover:bg-slate-900/40 transition-colors group"
                    >
                      {/* 1. Order Column */}
                      <div className="flex flex-col items-center justify-center gap-1 select-none">
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(c.slug, "up")}
                          disabled={index === 0}
                          aria-label="Move centre up"
                          title={index === 0 ? "Already at top" : "Move Up"}
                          className="w-5 h-4 flex items-center justify-center text-slate-500 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <span className="w-7 h-7 rounded-lg bg-[#07090D] border border-slate-800 flex items-center justify-center font-bold text-[#B8F000] text-xs shadow-inner">
                          {c.displayOrder || index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(c.slug, "down")}
                          disabled={index === filteredCentres.length - 1}
                          aria-label="Move centre down"
                          title={index === filteredCentres.length - 1 ? "Already at bottom" : "Move Down"}
                          className="w-5 h-4 flex items-center justify-center text-slate-500 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* 2. Centre Details & Photo Column */}
                      <div className="flex items-start gap-3 min-w-0 pr-2">
                        {c.image ? (
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 mt-0.5 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={c.image}
                              alt={c.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/badminton-arena.jpg";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#07090D] border border-slate-800 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                            <Building2 className="w-5 h-5 text-slate-500" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-white text-[13px] tracking-tight leading-[1.3] group-hover:text-[#B8F000] transition-colors">
                              {c.name}
                            </span>
                            {c.slug === "kadavanthra" && (
                              <span className="px-1.5 py-0.5 bg-[#B8F000]/10 border border-[#B8F000]/40 text-[#B8F000] text-[9px] font-bold rounded tracking-wider uppercase shrink-0">
                                HQ
                              </span>
                            )}
                            {c.isPlaceholder && (
                              <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/40 text-blue-400 text-[9px] font-bold rounded tracking-wider uppercase shrink-0">
                                UPCOMING
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug font-sans">
                            {c.description || "Dedicated badminton coaching arena in Kochi."}
                          </p>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-1 font-mono">
                            <span>Slug: <code className="text-[#B8F000]">/{c.slug}</code></span>
                            {c.openingHours?.morning && (
                              <>
                                <span>&bull;</span>
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5 text-[#B8F000]" />
                                  {c.openingHours.morning}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 3. Location & Automatic Neighborhoods Column */}
                      <div className="flex flex-col justify-center min-w-0 pr-2">
                        <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#B8F000] shrink-0" />
                          <span className="truncate">{c.area || c.city || "Kochi"}</span>
                        </div>
                        <p
                          className="text-[11px] text-slate-400 leading-snug line-clamp-1 mt-0.5 font-mono"
                          title={c.address || undefined}
                        >
                          {c.address || "Address not configured"}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {autoNeighborhoods.slice(0, 3).map((nb) => (
                            <span key={nb} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-[#B8F000] font-mono whitespace-nowrap">
                              {nb}
                            </span>
                          ))}
                          {autoNeighborhoods.length > 3 && (
                            <span className="text-[9px] text-slate-500 font-mono self-center">
                              +{autoNeighborhoods.length - 3}
                            </span>
                          )}
                        </div>
                        {c.googleMapsUrl && (
                          <a
                            href={c.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-[#B8F000] hover:underline font-mono mt-1 w-fit"
                          >
                            <span>Google Maps</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                      {/* 4. Contact Column */}
                      <div className="flex flex-col justify-center min-w-0 font-mono text-[11px] space-y-1.5">
                        <div className="flex items-center gap-1.5 text-slate-300 whitespace-nowrap">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="whitespace-nowrap">{c.phoneDisplay || c.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400 whitespace-nowrap">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="whitespace-nowrap">{c.whatsappDisplay || c.whatsapp}</span>
                        </div>
                      </div>

                    {/* 6. Status Column */}
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(c)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                          c.status === "ACTIVE"
                            ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                            : "bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
                        }`}
                        title={`Click to switch to ${c.status === "ACTIVE" ? "Inactive" : "Active"}`}
                        aria-label={`Toggle status for ${c.name}, currently ${c.status || "ACTIVE"}`}
                      >
                        {c.status === "ACTIVE" ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-400" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-amber-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* 7. Actions Column */}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        title="Edit Centre"
                        aria-label={`Edit ${c.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
                        className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        title="Delete / Deactivate Centre"
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>

          {/* Mobile View: Structured Record Cards */}
          <div className="md:hidden divide-y divide-slate-800/80 font-mono">
            {filteredCentres.map((c, index) => (
              <div key={c.slug} className="p-4 space-y-4 bg-[#0D111A]">
                {/* Mobile Top Row: Order, Name, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#07090D] border border-slate-800 flex items-center justify-center font-bold text-[#B8F000] text-xs shrink-0">
                      {c.displayOrder || index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-white text-sm tracking-tight leading-snug">
                          {c.name}
                        </h3>
                        {c.slug === "kadavanthra" && (
                          <span className="px-1.5 py-0.5 bg-[#B8F000]/10 border border-[#B8F000]/40 text-[#B8F000] text-[9px] font-bold rounded">
                            HQ
                          </span>
                        )}
                        {c.isPlaceholder && (
                          <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/40 text-blue-400 text-[9px] font-bold rounded">
                            UPCOMING
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        <span>Slug: <code className="text-[#B8F000]">/{c.slug}</code></span>
                        <span className="mx-1 text-slate-600">&bull;</span>
                        <span>Short: {c.shortName || c.name}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(c)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      c.status === "ACTIVE"
                        ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
                        : "bg-amber-500/15 border border-amber-500/40 text-amber-300"
                    }`}
                  >
                    {c.status === "ACTIVE" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{c.status === "ACTIVE" ? "Active" : "Inactive"}</span>
                  </button>
                </div>

                {/* Mobile Location & Automatic Neighborhoods Block */}
                <div className="space-y-2.5 text-xs bg-[#07090D] p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Location</span>
                    <span className="text-slate-200 font-medium truncate block mt-0.5">{c.area || c.city || "Kochi"}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{c.address || "Address not configured"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold mb-1">Automatic Neighborhoods</span>
                    <div className="flex flex-wrap gap-1">
                      {resolveAutomaticNeighborhoods(c.address, c.name).slice(0, 4).map((nb) => (
                        <span key={nb} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-[#B8F000] font-mono whitespace-nowrap">
                          {nb}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between">
                    <div className="text-[11px] text-slate-300">
                      <span className="text-slate-500 text-[10px] uppercase block font-bold">Contact</span>
                      <span>{c.phoneDisplay || c.phone}</span>
                    </div>
                    {c.googleMapsUrl && (
                      <a
                        href={c.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#B8F000] hover:underline flex items-center gap-1"
                      >
                        <span>Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Mobile Action Bar: Reorder + Edit/Delete */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(c.slug, "up")}
                      disabled={index === 0}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-20 text-[11px] font-bold"
                    >
                      &uarr; Up
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(c.slug, "down")}
                      disabled={index === filteredCentres.length - 1}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-20 text-[11px] font-bold"
                    >
                      &darr; Down
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(c)}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6">
          <div className="bg-[#0D111A] border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-4 sm:my-8 relative flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]">
            {/* Modal Header */}
            <div className="shrink-0 bg-[#0D111A] border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-[#B8F000]/10 border border-[#B8F000]/30 text-[#B8F000]">
                  <Building2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight font-mono">
                    {editingCentre ? `Edit Centre: ${editingCentre.shortName || editingCentre.name}` : "Add New Training Centre"}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Dynamic SBA facility configuration &amp; public routing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 font-mono text-xs">
                {/* 1. Identity & Facility Photo */}
                <div className="bg-[#07090D] border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5 text-[#B8F000] font-bold text-xs uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-[#B8F000] shadow-[0_0_8px_rgba(184,240,0,0.6)]" />
                      <span>1. Centre Identity &amp; Photo</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Core Facility</span>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold text-[11px]">Centre Full Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. S & A Badminton Academy — Edappally"
                        className="w-full px-3.5 h-10 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-slate-300 mb-1.5 font-semibold text-[11px]">Short Display Name *</label>
                        <input
                          type="text"
                          required
                          value={form.shortName}
                          onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                          placeholder="e.g. Edappally Centre"
                          className="w-full px-3.5 h-10 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1.5 font-semibold text-[11px]">URL Slug *</label>
                        <input
                          type="text"
                          required
                          value={form.slug}
                          onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })}
                          placeholder="e.g. edappally"
                          className="w-full px-3.5 h-10 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all font-mono"
                        />
                      </div>
                    </div>

                    {/* Centre Photo */}
                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold text-[11px] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[#B8F000]" />
                          <span>Centre Photo URL *</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">Displayed on homepage &amp; cards</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          required
                          value={form.image}
                          onChange={(e) => setForm({ ...form, image: e.target.value })}
                          placeholder="/images/badminton-arena.jpg or https://..."
                          className="flex-1 px-3.5 h-10 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all font-mono"
                        />
                        {form.image && (
                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={form.image}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/badminton-arena.jpg";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Description & Timing */}
                <div className="bg-[#07090D] border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5 text-[#B8F000] font-bold text-xs uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-[#B8F000] shadow-[0_0_8px_rgba(184,240,0,0.6)]" />
                      <span>2. Description &amp; Timing</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Overview &amp; Hours</span>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold text-[11px]">Description *</label>
                      <textarea
                        rows={3}
                        required
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Comprehensive overview of academy facilities, accessibility, and coaching focus..."
                        className="w-full px-3.5 py-2.5 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all resize-y font-mono min-h-[72px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold text-[11px] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#B8F000]" />
                        <span>Timing / Operating Hours *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.timing}
                        onChange={(e) => setForm({ ...form, timing: e.target.value })}
                        placeholder="e.g. 5:00 AM – 10:00 PM (All 7 Days)"
                        className="w-full px-3.5 h-10 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Location & Automatic Neighborhoods */}
                <div className="bg-[#07090D] border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5 text-[#B8F000] font-bold text-xs uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-[#B8F000] shadow-[0_0_8px_rgba(184,240,0,0.6)]" />
                      <span>3. Location &amp; Navigation</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Geo &amp; Maps</span>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold text-[11px]">Address *</label>
                      <input
                        type="text"
                        required
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="e.g. Metro Pillar 412, Near Toll Junction, Edappally, Kochi 682024"
                        className="w-full px-3.5 h-10 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-slate-300 mb-1.5 font-semibold text-[11px]">Area / Locality *</label>
                        <input
                          type="text"
                          required
                          value={form.area}
                          onChange={(e) => setForm({ ...form, area: e.target.value })}
                          placeholder="e.g. Edappally"
                          className="w-full px-3.5 h-10 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1.5 font-semibold text-[11px]">City *</label>
                        <input
                          type="text"
                          required
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          placeholder="e.g. Kochi"
                          className="w-full px-3.5 h-10 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1.5 font-semibold text-[11px]">Pincode / Postal</label>
                        <input
                          type="text"
                          value={form.pincode}
                          onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                          placeholder="e.g. 682024"
                          className="w-full px-3.5 h-10 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold text-[11px]">Google Maps Directions URL</label>
                      <input
                        type="url"
                        value={form.googleMapsUrl}
                        onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                        placeholder="https://maps.google.com/?q=..."
                        className="w-full px-3.5 h-10 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all font-mono"
                      />
                    </div>

                    {/* Live Automatic Neighborhoods Preview */}
                    <div className="pt-2 border-t border-slate-800/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          Neighborhoods Served (Automatic Calculation)
                        </span>
                        <span className="text-[10px] text-[#B8F000] font-mono">
                          Auto-resolved from Location
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-[#0D111A] border border-slate-800/80">
                        {resolveAutomaticNeighborhoods(`${form.address} ${form.area}`, form.name).map((n) => (
                          <span
                            key={n}
                            className="px-2 py-0.5 rounded bg-slate-800/90 text-[10px] text-[#B8F000] border border-slate-700/60 font-mono"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Contact & WhatsApp Card */}
                <div className="bg-[#07090D] border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5 text-[#B8F000] font-bold text-xs uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-[#B8F000] shadow-[0_0_8px_rgba(184,240,0,0.6)]" />
                      <span>4. Direct Contact Numbers</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Enquiry Hotline</span>
                  </div>

                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-slate-300 mb-1.5 font-semibold text-[11px]">Phone Number *</label>
                        <input
                          type="text"
                          required
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value, phoneDisplay: e.target.value })}
                          placeholder="+91 94006 35548"
                          className="w-full px-3.5 h-10 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 mb-1.5 font-semibold text-[11px]">WhatsApp Number *</label>
                        <input
                          type="text"
                          required
                          value={form.whatsapp}
                          onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, ""), whatsappDisplay: e.target.value })}
                          placeholder="919400635548"
                          className="w-full px-3.5 h-10 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold text-[11px]">Email Address</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="edappally@sabadminton.com"
                        className="w-full px-3.5 h-10 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Display Order & Status */}
                <div className="bg-[#07090D] border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5 text-[#B8F000] font-bold text-xs uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-[#B8F000] shadow-[0_0_8px_rgba(184,240,0,0.6)]" />
                      <span>5. Display &amp; Status</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Ordering</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold text-[11px]">Display Order *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={form.displayOrder}
                        onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                        className="w-full px-3.5 h-10 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1.5 font-semibold text-[11px]">Status *</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                        className="w-full px-3.5 h-10 bg-[#0D111A] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]/30 transition-all font-mono cursor-pointer"
                      >
                        <option value="ACTIVE">ACTIVE (Published)</option>
                        <option value="INACTIVE">INACTIVE (Hidden)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="shrink-0 bg-[#0D111A] border-t border-slate-800 px-6 py-4 flex items-center justify-end gap-3 z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs font-mono font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#B8F000]/10 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingCentre ? "Save Changes" : "Create Centre"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D111A] border border-rose-500/30 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl font-mono">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">
                  Delete Center
                </h3>
                <p className="text-[11px] text-slate-400">
                  Permanent removal from database
                </p>
              </div>
            </div>

            <div className="bg-[#07090D] border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
              <p className="text-slate-200 font-bold">
                Are you sure you want to delete this center? This action cannot be undone.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <p className="text-[#B8F000] font-black text-sm">
                  {deleteTarget.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  Slug: /{deleteTarget.slug} &bull; {deleteTarget.area || deleteTarget.city || "Kochi"}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Associated coaches, students, or inquiries will be safely preserved and unassigned without losing their profile data.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition-colors cursor-pointer font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-600/20"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
