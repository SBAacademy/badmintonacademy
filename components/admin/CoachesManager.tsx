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
  Award,
  ShieldCheck,
  MapPin,
  UserCheck,
} from "lucide-react";
import { Coach, COACHES } from "@/data/coaches";
import { ImageUploadField } from "./ImageUploadField";

const BRANCHES = [
  "Kadavanthra (Headquarters)",
  "Edappally Branch",
  "Kakkanad Branch",
  "All Centres",
];

export function CoachesManager() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "",
    experienceYears: 10,
    primaryBranch: "Kadavanthra (Headquarters)",
    specialization: "",
    certifications: "",
    achievements: "",
    bio: "",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
  });

  const fetchCoaches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/coaches");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setCoaches(data.items);
      } else {
        setCoaches(COACHES);
      }
    } catch {
      setCoaches(COACHES);
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
      role: "Senior Badminton Coach",
      experienceYears: 8,
      primaryBranch: "Kadavanthra (Headquarters)",
      specialization: "Singles Tactical Footwork & Match Conditioning",
      certifications: "BWF Level 1 Certified Coach\nNIS Sports Coaching Diploma",
      achievements: "Former State Senior Medalist\nCoached Ernakulam District Squad",
      bio: "Dedicated badminton trainer with extensive experience mentoring junior and adult athletes in Kochi.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coach: Coach) => {
    setEditingCoach(coach);
    setForm({
      name: coach.name,
      role: coach.role,
      experienceYears: coach.experienceYears,
      primaryBranch: coach.primaryBranch,
      specialization: coach.specialization,
      certifications: coach.certifications.join("\n"),
      achievements: coach.achievements.join("\n"),
      bio: coach.bio,
      image: coach.image,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role) return;
    setSaving(true);

    const payload = {
      name: form.name,
      role: form.role,
      experienceYears: Number(form.experienceYears) || 5,
      primaryBranch: form.primaryBranch,
      specialization: form.specialization,
      certifications: form.certifications.split("\n").map((c) => c.trim()).filter(Boolean),
      achievements: form.achievements.split("\n").map((a) => a.trim()).filter(Boolean),
      bio: form.bio,
      image: form.image,
    };

    try {
      if (editingCoach) {
        // Update
        const res = await fetch("/api/content/coaches", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCoach.id, ...payload }),
        });
        const data = await res.json();
        if (data.success && data.item) {
          setCoaches((prev) =>
            prev.map((c) => (c.id === editingCoach.id ? data.item : c))
          );
          setIsModalOpen(false);
        }
      } else {
        // Create
        const id = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const res = await fetch("/api/content/coaches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...payload }),
        });
        const data = await res.json();
        if (data.success && data.item) {
          setCoaches((prev) => [data.item, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error("Failed to save coach:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Permanently remove "${name}" from coaching faculty roster?`)) {
      return;
    }
    setCoaches((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/content/coaches?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete coach:", err);
      fetchCoaches();
    }
  };

  const filteredCoaches = coaches.filter((coach) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      coach.name.toLowerCase().includes(q) ||
      coach.role.toLowerCase().includes(q) ||
      coach.specialization.toLowerCase().includes(q) ||
      coach.primaryBranch.toLowerCase().includes(q)
    );
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
              {coaches.length} Coaches Live
            </span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">
            Coaching Panel &amp; Mentors Manager
          </h2>
          <p className="text-xs text-[#A8B0BA] font-mono">
            Manage certified BWF coaches and NIS mentors displayed on <a href="/coaches" target="_blank" className="text-[#B8F000] hover:underline">/coaches</a>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchCoaches}
            disabled={loading}
            className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reload from Neon DB"
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

      {/* Search Toolbar */}
      <div className="p-4 bg-[#0B0F14] border border-[#1F2937]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A8B0BA] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coaches by name, specialization, role, branch..."
            className="w-full pl-9 pr-4 py-2 bg-[#07090D] border border-[#1F2937] text-white text-xs font-mono focus:outline-none focus:border-[#B8F000]"
          />
        </div>
      </div>

      {/* Coach Cards Grid */}
      {filteredCoaches.length === 0 ? (
        <div className="py-20 text-center bg-[#0B0F14] border border-[#1F2937] text-[#A8B0BA] font-mono text-xs">
          No coaches match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredCoaches.map((coach) => (
            <div
              key={coach.id}
              className="bg-[#0B0F14] border border-[#1F2937] hover:border-[#B8F000]/60 overflow-hidden flex flex-col justify-between group transition-all"
            >
              <div>
                {/* Portrait */}
                <div className="relative aspect-[3/4] w-full bg-[#07090D] overflow-hidden">
                  <Image
                    src={coach.image}
                    alt={coach.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, 25vw"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 bg-[#07090D]/90 backdrop-blur-sm border border-[#1F2937] font-mono text-[9px] text-[#B8F000] uppercase font-bold">
                      {coach.experienceYears} Years Exp
                    </span>
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

                  {/* Certifications chips */}
                  <div className="space-y-1 pt-1">
                    {coach.certifications.slice(0, 2).map((cert, i) => (
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
                <span className="text-[9px] text-[#6B7280]">ID: {coach.id}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(coach)}
                    className="p-1.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-[#B8F000] transition-colors"
                    title="Edit Coach Profile"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(coach.id, coach.name)}
                    className="p-1.5 bg-[#11161D] hover:bg-rose-950/40 border border-[#1F2937] hover:border-rose-500/40 text-[#6B7280] hover:text-rose-400 transition-colors"
                    title="Delete Coach"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                className="text-[#A8B0BA] hover:text-white"
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
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Primary Branch / Centre</label>
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
                  <label className="block text-[#A8B0BA] uppercase mb-1">Coaching Experience (Years)</label>
                  <input
                    type="number"
                    value={form.experienceYears}
                    onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
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
                onChange={(url) => setForm({ ...form, image: url })}
                required
                aspectRatio="1/1"
                helpText="Upload a square or portrait photo from your computer or paste an external link."
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
                  {saving ? "Saving to Neon DB..." : editingCoach ? "Update Coach" : "Save Coach"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
