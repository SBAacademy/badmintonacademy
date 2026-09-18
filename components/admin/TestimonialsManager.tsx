"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  X,
  RefreshCw,
  Star,
  Quote,
  CheckCircle,
  MessageSquareQuote,
} from "lucide-react";
import { Testimonial, TESTIMONIALS } from "@/data/testimonials";
import { Centre } from "@/data/centres";

export function TestimonialsManager() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tabFilter, setTabFilter] = useState<"APPROVED" | "PENDING">("APPROVED");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    branch: string;
    content: string;
    avatarText?: string;
  }>({
    name: "",
    branch: "",
    content: "",
    avatarText: "SA",
  });

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/testimonials?includePending=true");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        setItems(TESTIMONIALS);
      }
    } catch {
      setItems(TESTIMONIALS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
    const fetchCentres = async () => {
      try {
        const res = await fetch("/api/centres");
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setCentres(data.items);
        }
      } catch (err) {
        console.error("Failed to load centres in TestimonialsManager:", err);
      }
    };
    fetchCentres();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    const defaultBranch = centres[0]?.name || "Kadavanthra (Headquarters)";
    setForm({
      name: "",
      branch: defaultBranch,
      content: "",
      avatarText: "SA",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Testimonial) => {
    setEditingItem(item);
    setForm({
      name: item.name || "",
      branch: item.branch || (centres[0]?.name || "Kadavanthra (Headquarters)"),
      content: item.content || "",
      avatarText: item.avatarText || "SA",
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameVal = e.target.value;
    const parts = nameVal.trim().split(" ");
    let initials = "SA";
    if (parts.length >= 2) initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    else if (parts.length === 1 && parts[0].length >= 2) initials = parts[0].substring(0, 2).toUpperCase();

    setForm((prev) => ({
      ...prev,
      name: nameVal,
      avatarText: initials,
    }));
  };

  const handleApprove = async (item: Testimonial) => {
    try {
      const res = await fetch("/api/content/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, status: "APPROVED", isApproved: true }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "APPROVED" as any, isApproved: true as any } : i))
        );
      }
    } catch (err) {
      console.error("Failed to approve review:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.content.trim()) return;
    setSaving(true);

    const defaultBranch = centres[0]?.name || "Kadavanthra (Headquarters)";
    const payload = {
      ...form,
      name: form.name.trim(),
      content: form.content.trim(),
      branch: form.branch || defaultBranch,
      role: editingItem?.role || "Student / Parent",
      rating: 5,
      highlight: form.content.trim().slice(0, 75),
      status: "APPROVED",
      isApproved: true,
    };

    try {
      if (editingItem) {
        // Update
        const res = await fetch("/api/content/testimonials", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingItem.id, ...payload }),
        });
        const data = await res.json();
        if (data.success && data.item) {
          setItems((prev) =>
            prev.map((i) => (i.id === editingItem.id ? data.item : i))
          );
          setIsModalOpen(false);
        }
      } else {
        // Create
        const res = await fetch("/api/content/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.item) {
          setItems((prev) => [data.item, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error("Failed to save review:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Permanently remove review by "${name}"?`)) {
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await fetch(`/api/content/testimonials?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete review:", err);
      fetchTestimonials();
    }
  };

  const pendingItems = items.filter((i: any) => i.status === "PENDING" || (i.isApproved === false && i.status !== "APPROVED"));
  const approvedItems = items.filter((i: any) => i.status === "APPROVED" || i.isApproved === true || (i.status !== "PENDING" && i.isApproved !== false));

  const currentTabItems = tabFilter === "PENDING" ? pendingItems : approvedItems;
  const filteredItems = currentTabItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.branch.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#0B0F14] border border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#B8F000] font-bold uppercase tracking-widest">
              WEBSITE CMS // REVIEWS
            </span>
            <span className="px-2 py-0.5 bg-[#B8F000]/10 border border-[#B8F000]/30 font-mono text-[10px] text-[#B8F000]">
              {approvedItems.length} Live &bull; {pendingItems.length} Pending
            </span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">
            Student &amp; Parent Reviews Manager
          </h2>
          <p className="text-xs text-[#A8B0BA] font-mono">
            Manage genuine athlete reviews and feedback displayed across the website.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchTestimonials}
            disabled={loading}
            className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reload from Neon DB"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#B8F000]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <a
            href="/testimonials"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#B8F000]" />
            <span className="hidden sm:inline">View Public Reviews</span>
          </a>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Review</span>
          </button>
        </div>
      </div>

      {/* Moderation Tabs: Live Reviews vs Pending Submissions */}
      <div className="flex items-center gap-3 border-b border-[#1F2937] pb-3 font-mono text-xs">
        <button
          type="button"
          onClick={() => setTabFilter("APPROVED")}
          className={`px-4 py-2 font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
            tabFilter === "APPROVED"
              ? "bg-[#B8F000] text-[#07090D] shadow"
              : "bg-[#0B0F14] border border-[#1F2937] text-slate-400 hover:text-white"
          }`}
        >
          <span>Live Approved Reviews</span>
          <span className="px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">
            {approvedItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTabFilter("PENDING")}
          className={`px-4 py-2 font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
            tabFilter === "PENDING"
              ? "bg-amber-400 text-[#07090D] shadow"
              : "bg-[#0B0F14] border border-[#1F2937] text-slate-400 hover:text-white"
          }`}
        >
          <span>Pending Submissions</span>
          {pendingItems.length > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
              {pendingItems.length} new
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
              0
            </span>
          )}
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 bg-[#0B0F14] border border-[#1F2937]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A8B0BA] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews by name, centre, or review text..."
            className="w-full pl-9 pr-4 py-2 bg-[#07090D] border border-[#1F2937] text-white text-xs font-mono focus:outline-none focus:border-[#B8F000]"
          />
        </div>
      </div>

      {/* Testimonials Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center bg-[#0B0F14] border border-[#1F2937] text-[#A8B0BA] font-mono text-xs">
          {tabFilter === "PENDING"
            ? "No pending review submissions waiting for review."
            : "No reviews match your search criteria."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isPending = (item as any).status === "PENDING";
            return (
              <div
                key={item.id}
                className={`bg-[#0B0F14] border p-5 flex flex-col justify-between group transition-all ${
                  isPending
                    ? "border-amber-500/50 bg-amber-950/10"
                    : "border-[#1F2937] hover:border-[#B8F000]/60"
                }`}
              >
                <div className="space-y-3">
                  {/* Header: Centre & Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-[#11161D] border border-[#1F2937] font-mono text-[10px] text-[#B8F000] font-bold">
                      📍 {item.branch}
                    </span>

                    {isPending ? (
                      <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[9px] font-bold uppercase tracking-wider">
                        Pending Approval
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider">
                        Live
                      </span>
                    )}
                  </div>

                  {/* Review Content */}
                  <p className="text-xs font-mono text-slate-300 leading-relaxed line-clamp-5">
                    &ldquo;{item.content}&rdquo;
                  </p>

                  {/* Reviewer Profile */}
                  <div className="flex items-center gap-3 pt-3 border-t border-[#1F2937]">
                    <div className="w-8 h-8 bg-[#11161D] border border-[#1F2937] text-[#B8F000] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {item.avatarText || "SA"}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{item.name}</div>
                      <div className="text-[10px] font-mono text-[#6B7280]">
                        {item.branch}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 mt-4 border-t border-[#1F2937] flex items-center justify-between font-mono text-xs">
                  {isPending ? (
                    <button
                      type="button"
                      onClick={() => handleApprove(item)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve Review</span>
                    </button>
                  ) : (
                    <span className="text-[9px] text-[#6B7280]">ID: {item.id}</span>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-1.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-[#B8F000] transition-colors cursor-pointer"
                      title="Edit Review"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-1.5 bg-[#11161D] hover:bg-rose-950/40 border border-[#1F2937] hover:border-rose-500/40 text-[#6B7280] hover:text-rose-400 transition-colors cursor-pointer"
                      title={isPending ? "Reject & Delete" : "Delete Review"}
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

      {/* Add / Edit Modal - STRICTLY: Name, Centre, Review */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-[#0B0F14] border border-[#1F2937] p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4 text-[#B8F000]" />
                <span>{editingItem ? "Edit Review" : "Add New Review"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#A8B0BA] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
              {/* 1. Name */}
              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1 font-bold">Reviewer Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Dr. Sandeep Kurup"
                  className="w-full px-3 py-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              {/* 2. Centre (Dynamic Select from Centres DB) */}
              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1 font-bold">Centre *</label>
                <select
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000] cursor-pointer"
                >
                  {centres.map((c) => (
                    <option key={c.slug} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  {centres.length === 0 && (
                    <option value="Kadavanthra (Headquarters)">
                      Kadavanthra (Headquarters)
                    </option>
                  )}
                </select>
              </div>

              {/* 3. Review Content */}
              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1 font-bold">Review Content *</label>
                <textarea
                  rows={5}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Enter genuine athlete or parent feedback here..."
                  className="w-full px-3 py-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000] resize-y"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-[#11161D] text-[#A8B0BA] hover:text-white uppercase font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black uppercase text-xs transition-colors cursor-pointer"
                >
                  {saving ? "Saving to Neon DB..." : editingItem ? "Update Review" : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
