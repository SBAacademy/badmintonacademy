"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
  X,
  Check,
  RefreshCw,
  Camera,
  MapPin,
  Tag,
} from "lucide-react";
import { GalleryItem, GALLERY_ITEMS } from "@/data/gallery";
import { ImageUploadField } from "./ImageUploadField";
import { Centre } from "@/data/centres";

const CATEGORIES: GalleryItem["category"][] = [
  "Courts & Arena",
  "Training Drills",
  "Tournaments",
  "Juniors & Camps",
  "Coaching Sessions",
];

export function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<GalleryItem>>({
    title: "",
    category: "Courts & Arena",
    branch: "",
    image: "",
    caption: "",
  });

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/gallery");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        setItems(GALLERY_ITEMS);
      }
    } catch {
      setItems(GALLERY_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
    const fetchCentres = async () => {
      try {
        const res = await fetch("/api/centres", { cache: "no-store" });
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setCentres(data.items);
        }
      } catch (err) {
        console.error("Failed to load centres in GalleryManager:", err);
      }
    };
    fetchCentres();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    const defaultBranch = centres[0]?.shortName || centres[0]?.name || "All Centres";
    setForm({
      title: "",
      category: "Courts & Arena",
      branch: defaultBranch,
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop",
      caption: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setForm({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.image) return;
    setSaving(true);

    try {
      if (editingItem) {
        // Update
        const res = await fetch("/api/content/gallery", {
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
        const res = await fetch("/api/content/gallery", {
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
      console.error("Failed to save gallery item:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Permanently delete photo "${title}" from website gallery?`)) {
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await fetch(`/api/content/gallery?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete gallery item:", err);
      fetchGallery();
    }
  };

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.caption.toLowerCase().includes(q) ||
      item.branch.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header with Stats & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#0B0F14] border border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#B8F000] font-bold uppercase tracking-widest">
              WEBSITE CMS // MEDIA
            </span>
            <span className="px-2 py-0.5 bg-[#B8F000]/10 border border-[#B8F000]/30 font-mono text-[10px] text-[#B8F000]">
              {items.length} Photos Live
            </span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">
            Court &amp; Training Gallery Manager
          </h2>
          <p className="text-xs text-[#A8B0BA] font-mono">
            Manage high-resolution court visuals, junior drills, and tournament photos displayed on <a href="/gallery" target="_blank" className="text-[#B8F000] hover:underline">/gallery</a>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchGallery}
            disabled={loading}
            className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reload from Neon DB"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#B8F000]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <a
            href="/gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#B8F000]" />
            <span className="hidden sm:inline">View Public Page</span>
          </a>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Photo</span>
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
            placeholder="Search photos by title, caption, branch..."
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

      {/* Photo Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center bg-[#0B0F14] border border-[#1F2937] text-[#A8B0BA] font-mono text-xs">
          No gallery photos match your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#0B0F14] border border-[#1F2937] hover:border-[#B8F000]/60 overflow-hidden flex flex-col justify-between group transition-all"
            >
              <div>
                {/* Photo Thumbnail */}
                <div className="relative aspect-[16/10] w-full bg-[#07090D] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 bg-[#07090D]/90 backdrop-blur-sm border border-[#1F2937] font-mono text-[9px] text-[#B8F000] uppercase font-bold">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 bg-[#07090D]/90 backdrop-blur-sm border border-[#1F2937] font-mono text-[9px] text-white uppercase font-bold">
                      {item.branch}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3.5 space-y-1.5">
                  <h3 className="font-bold text-white text-xs leading-snug group-hover:text-[#B8F000] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-mono text-[#A8B0BA] line-clamp-2 leading-relaxed">
                    {item.caption}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 border-t border-[#1F2937] bg-[#07090D] flex items-center justify-between font-mono text-xs">
                <span className="text-[9px] text-[#6B7280]">ID: {item.id}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-[#B8F000] transition-colors"
                    title="Edit Photo Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 bg-[#11161D] hover:bg-rose-950/40 border border-[#1F2937] hover:border-rose-500/40 text-[#6B7280] hover:text-rose-400 transition-colors"
                    title="Delete Photo"
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
                <Camera className="w-4 h-4 text-[#B8F000]" />
                <span>{editingItem ? "Edit Gallery Photo" : "Add New Gallery Photo"}</span>
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
              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Central Arena 6-Court Layout"
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as GalleryItem["category"] })}
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Branch / Location</label>
                  <select
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  >
                    {form.branch && !centres.some((c) => (c.shortName || c.name) === form.branch) && form.branch !== "All Centres" && (
                      <option value={form.branch}>{form.branch} (Historical)</option>
                    )}
                    {centres.map((c) => {
                      const val = c.shortName || c.name;
                      return (
                        <option key={c.slug} value={val}>
                          {c.name}
                        </option>
                      );
                    })}
                    <option value="All Centres">All Centres</option>
                  </select>
                </div>
              </div>

              <ImageUploadField
                label="Gallery Photo"
                value={form.image || ""}
                onChange={(url) => setForm({ ...form, image: url })}
                required
                aspectRatio="16/9"
                helpText="Upload a high-res photo from your device or paste an external URL."
              />

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Caption / Description</label>
                <textarea
                  rows={2}
                  value={form.caption || ""}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  placeholder="e.g. BWF Grade-1 certified courts with glare-free 750 Lux overhead illumination..."
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
                  {saving ? "Saving to Neon DB..." : editingItem ? "Update Photo" : "Save Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
