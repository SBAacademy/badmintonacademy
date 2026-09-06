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

const BRANCHES = [
  "Kadavanthra Branch",
  "Edappally Branch",
  "Kakkanad Branch",
  "All Centres",
];

export function TestimonialsManager() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Testimonial>>({
    name: "",
    role: "",
    branch: "Kadavanthra Branch",
    rating: 5,
    highlight: "",
    content: "",
    avatarText: "SK",
  });

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/testimonials");
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
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      name: "",
      role: "Parent of Junior Player",
      branch: "Kadavanthra Branch",
      rating: 5,
      highlight: "Exceptional individual attention and footwork improvement",
      content: "My child has shown tremendous growth in agility and court discipline since joining S&A Badminton Academy.",
      avatarText: "SK",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Testimonial) => {
    setEditingItem(item);
    setForm({ ...item });
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
      avatarText: prev.avatarText || initials,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.content) return;
    setSaving(true);

    try {
      if (editingItem) {
        // Update
        const res = await fetch("/api/content/testimonials", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingItem.id, ...form }),
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
          body: JSON.stringify(form),
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

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.role.toLowerCase().includes(q) ||
      item.highlight.toLowerCase().includes(q) ||
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
              {items.length} Reviews Live &bull; 5.0 ★
            </span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">
            Student &amp; Parent Reviews Manager
          </h2>
          <p className="text-xs text-[#A8B0BA] font-mono">
            Manage genuine athlete reviews and verified testimonials displayed on <a href="/testimonials" target="_blank" className="text-[#B8F000] hover:underline">/testimonials</a>.
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

      {/* Search Toolbar */}
      <div className="p-4 bg-[#0B0F14] border border-[#1F2937]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A8B0BA] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews by parent name, role, branch, or quote..."
            className="w-full pl-9 pr-4 py-2 bg-[#07090D] border border-[#1F2937] text-white text-xs font-mono focus:outline-none focus:border-[#B8F000]"
          />
        </div>
      </div>

      {/* Testimonials Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center bg-[#0B0F14] border border-[#1F2937] text-[#A8B0BA] font-mono text-xs">
          No reviews match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#0B0F14] border border-[#1F2937] hover:border-[#B8F000]/60 p-5 flex flex-col justify-between group transition-all"
            >
              <div className="space-y-3">
                {/* Header: Stars & Branch */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="px-2 py-0.5 bg-[#11161D] border border-[#1F2937] font-mono text-[9px] text-[#A8B0BA]">
                    {item.branch}
                  </span>
                </div>

                {/* Highlight */}
                <h3 className="font-bold text-white text-sm leading-snug group-hover:text-[#B8F000] transition-colors">
                  &ldquo;{item.highlight}&rdquo;
                </h3>

                {/* Quote Content */}
                <p className="text-xs font-mono text-[#A8B0BA] leading-relaxed line-clamp-4">
                  {item.content}
                </p>

                {/* Reviewer Profile */}
                <div className="flex items-center gap-3 pt-2 border-t border-[#1F2937]">
                  <div className="w-8 h-8 bg-[#11161D] border border-[#1F2937] text-[#B8F000] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {item.avatarText || "SK"}
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">{item.name}</div>
                    <div className="text-[10px] font-mono text-[#6B7280] truncate max-w-[200px]">
                      {item.role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 mt-4 border-t border-[#1F2937] flex items-center justify-between font-mono text-xs">
                <span className="text-[9px] text-[#6B7280]">ID: {item.id}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-[#B8F000] transition-colors"
                    title="Edit Review"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1.5 bg-[#11161D] hover:bg-rose-950/40 border border-[#1F2937] hover:border-rose-500/40 text-[#6B7280] hover:text-rose-400 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-lg w-full bg-[#0B0F14] border border-[#1F2937] p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <MessageSquareQuote className="w-4 h-4 text-[#B8F000]" />
                <span>{editingItem ? "Edit Student/Parent Review" : "Add New Student/Parent Review"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#A8B0BA] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Reviewer Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name || ""}
                    onChange={handleNameChange}
                    placeholder="e.g. Dr. Sandeep Kurup"
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Role / Parent Details *</label>
                  <input
                    type="text"
                    required
                    value={form.role || ""}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="e.g. Parent of Junior Player (11 yrs)"
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Centre / Branch</label>
                  <select
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
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
                  <label className="block text-[#A8B0BA] uppercase mb-1">Star Rating (1 - 5)</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  >
                    <option value={5}>★★★★★ (5 Stars)</option>
                    <option value={4}>★★★★☆ (4 Stars)</option>
                    <option value={3}>★★★☆☆ (3 Stars)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Key Highlight / Headline *</label>
                <input
                  type="text"
                  required
                  value={form.highlight || ""}
                  onChange={(e) => setForm({ ...form, highlight: e.target.value })}
                  placeholder="e.g. Remarkable footwork progress and court discipline"
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Full Review Testimony *</label>
                <textarea
                  rows={4}
                  required
                  value={form.content || ""}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Detailed feedback regarding coaching progress, court conditions, coach patience, tournament support..."
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#11161D] text-[#A8B0BA] hover:text-white uppercase font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black uppercase text-xs transition-colors cursor-pointer"
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
