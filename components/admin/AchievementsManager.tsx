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
  Trophy,
  Award,
  Medal,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { Achievement, ACHIEVEMENTS } from "@/data/achievements";
import { ImageUploadField } from "./ImageUploadField";

const CATEGORIES: Achievement["category"][] = [
  "State Championship",
  "District Title",
  "National Qualification",
  "Academy Milestone",
];

export function AchievementsManager() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Achievement | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Achievement>>({
    year: "2024",
    title: "",
    category: "State Championship",
    athleteOrTeam: "",
    badge: "Gold Medal",
    description: "",
    image: "",
  });

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/achievements");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        setItems(ACHIEVEMENTS);
      }
    } catch {
      setItems(ACHIEVEMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      year: new Date().getFullYear().toString(),
      title: "",
      category: "State Championship",
      athleteOrTeam: "",
      badge: "Gold Medal",
      description: "",
      image: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Achievement) => {
    setEditingItem(item);
    setForm({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.year) return;
    setSaving(true);

    try {
      if (editingItem) {
        // Update
        const res = await fetch("/api/content/achievements", {
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
        const res = await fetch("/api/content/achievements", {
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
      console.error("Failed to save achievement:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Permanently remove milestone "${title}" from track record?`)) {
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await fetch(`/api/content/achievements?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete achievement:", err);
      fetchAchievements();
    }
  };

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.athleteOrTeam.toLowerCase().includes(q) ||
      item.year.includes(q) ||
      item.description.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#0B0F14] border border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#B8F000] font-bold uppercase tracking-widest">
              WEBSITE CMS // TRACK RECORD
            </span>
            <span className="px-2 py-0.5 bg-[#B8F000]/10 border border-[#B8F000]/30 font-mono text-[10px] text-[#B8F000]">
              {items.length} Milestones Live
            </span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">
            Tournament Achievements &amp; Medals
          </h2>
          <p className="text-xs text-[#A8B0BA] font-mono">
            Manage state championships, district titles, and national qualifications displayed on <a href="/achievements" target="_blank" className="text-[#B8F000] hover:underline">/achievements</a>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchAchievements}
            disabled={loading}
            className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reload from Neon DB"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#B8F000]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <a
            href="/achievements"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#B8F000]" />
            <span className="hidden sm:inline">View Public Archive</span>
          </a>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Achievement</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-[#0B0F14] border border-[#1F2937] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A8B0BA] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search milestones by title, athlete name, year..."
            className="w-full pl-9 pr-4 py-2 bg-[#07090D] border border-[#1F2937] text-white text-xs font-mono focus:outline-none focus:border-[#B8F000]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setCategoryFilter("All")}
            className={`px-3 py-1.5 font-mono text-xs uppercase font-bold border transition-colors whitespace-nowrap ${
              categoryFilter === "All"
                ? "bg-[#B8F000] text-[#07090D] border-[#B8F000]"
                : "bg-[#07090D] text-[#A8B0BA] border-[#1F2937] hover:text-white"
            }`}
          >
            All ({items.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 font-mono text-xs uppercase font-bold border transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-[#B8F000] text-[#07090D] border-[#B8F000]"
                  : "bg-[#07090D] text-[#A8B0BA] border-[#1F2937] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Items List */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center bg-[#0B0F14] border border-[#1F2937] text-[#A8B0BA] font-mono text-xs">
          No achievements match your filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-[#0B0F14] border border-[#1F2937] hover:border-[#B8F000]/60 flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#07090D] border border-[#1F2937] text-[#B8F000] font-mono text-sm font-black flex items-center justify-center shrink-0">
                  {item.year}
                </div>

                {item.image && (
                  <div className="relative w-20 h-16 bg-[#07090D] border border-[#1F2937] shrink-0 overflow-hidden hidden sm:block">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-[#11161D] border border-[#1F2937] font-mono text-[9px] text-[#B8F000] uppercase font-bold">
                      {item.category}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 font-mono text-[9px] text-amber-400 font-bold">
                      🏆 {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-[#B8F000] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <div className="text-xs font-mono text-[#B8F000]">
                    Athletes: <span className="text-white">{item.athleteOrTeam}</span>
                  </div>

                  <p className="text-xs font-mono text-[#A8B0BA] leading-relaxed max-w-3xl">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0 font-mono text-xs border-t md:border-t-0 pt-3 md:pt-0 border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="p-2 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-[#B8F000] transition-colors"
                  title="Edit Milestone"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-2 bg-[#11161D] hover:bg-rose-950/40 border border-[#1F2937] hover:border-rose-500/40 text-[#6B7280] hover:text-rose-400 transition-colors"
                  title="Delete Milestone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
                <Trophy className="w-4 h-4 text-[#B8F000]" />
                <span>{editingItem ? "Edit Tournament Milestone" : "Add New Tournament Milestone"}</span>
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
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Year *</label>
                  <input
                    type="text"
                    required
                    value={form.year || ""}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    placeholder="2024"
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[#A8B0BA] uppercase mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Achievement["category"] })}
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Milestone / Championship Title *</label>
                <input
                  type="text"
                  required
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Kerala State Junior Championship — Gold & Silver Double"
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Athletes / Team Name *</label>
                  <input
                    type="text"
                    required
                    value={form.athleteOrTeam || ""}
                    onChange={(e) => setForm({ ...form, athleteOrTeam: e.target.value })}
                    placeholder="e.g. Arjun K. & Neha Menon (U-17)"
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Medal / Badge Ribbon</label>
                  <input
                    type="text"
                    value={form.badge || ""}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g. Gold & Silver Medals"
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Tournament Description *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Details of tournament victories, scores, ranking and medals won..."
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              <ImageUploadField
                label="Trophy / Podium Photo (Optional)"
                value={form.image || ""}
                onChange={(url) => setForm({ ...form, image: url })}
                aspectRatio="16/9"
                helpText="Upload a tournament podium, medal ceremony, or victory picture from your computer or paste an external URL."
              />

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
                  {saving ? "Saving to Neon DB..." : editingItem ? "Update Milestone" : "Save Milestone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
