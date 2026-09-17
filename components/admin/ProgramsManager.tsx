"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  X,
  RefreshCw,
  Target,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ProgramItem } from "@/lib/contentDb";

export function ProgramsManager() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProgramItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State: Strictly Name of Training and Description only
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const fetchPrograms = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/content/programs");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setPrograms(data.items);
      } else {
        setPrograms([]);
      }
    } catch (err) {
      console.error("Failed to load programs:", err);
      setFeedback({ type: "error", text: "Failed to load training programs." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const openAddModal = () => {
    setEditingProgram(null);
    setForm({
      name: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (program: ProgramItem) => {
    setEditingProgram(program);
    setForm({
      name: program.name,
      description: program.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) {
      setFeedback({ type: "error", text: "Name and Description are both required." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      if (editingProgram) {
        // Edit Program
        const res = await fetch("/api/content/programs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: editingProgram.slug,
            name: form.name.trim(),
            description: form.description.trim(),
          }),
        });

        const data = await res.json();
        if (data.success) {
          setPrograms((prev) =>
            prev.map((p) => (p.slug === editingProgram.slug ? data.item : p))
          );
          setIsModalOpen(false);
          setFeedback({ type: "success", text: "Training program updated successfully." });
        } else {
          setFeedback({ type: "error", text: data.message || "Failed to update training program." });
        }
      } else {
        // Add Program
        const res = await fetch("/api/content/programs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim(),
          }),
        });

        const data = await res.json();
        if (data.success) {
          setPrograms(data.items || [data.item, ...programs]);
          setIsModalOpen(false);
          setFeedback({ type: "success", text: "New training program added successfully." });
        } else {
          setFeedback({ type: "error", text: data.message || "Failed to create training program." });
        }
      }
    } catch (err) {
      console.error("Save training program error:", err);
      setFeedback({ type: "error", text: "Error connecting to server. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/content/programs?slug=${encodeURIComponent(deleteTarget.slug)}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setPrograms((prev) => prev.filter((p) => p.slug !== deleteTarget.slug));
        setDeleteTarget(null);
        setFeedback({ type: "success", text: "Training program deleted successfully." });
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to delete training program." });
      }
    } catch (err) {
      console.error("Delete program error:", err);
      setFeedback({ type: "error", text: "Error deleting program. Please try again." });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPrograms = programs.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-mono ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#0B0F14] border border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#B8F000] font-bold uppercase tracking-widest">
              WEBSITE CMS // TRAINING
            </span>
            <span className="px-2 py-0.5 bg-[#B8F000]/10 border border-[#B8F000]/30 font-mono text-[10px] text-[#B8F000]">
              {programs.length} Active Tracks
            </span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">
            Training Programs Manager
          </h2>
          <p className="text-xs text-[#A8B0BA] font-mono">
            Manage training curriculum and descriptions displayed dynamically on the Homepage and Programs page.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchPrograms}
            disabled={loading}
            className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reload from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#B8F000]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <a
            href="/programs"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#B8F000]" />
            <span className="hidden sm:inline">View On Site</span>
          </a>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Training Program</span>
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
            placeholder="Search training programs by name or description keywords..."
            className="w-full pl-9 pr-4 py-2 bg-[#07090D] border border-[#1F2937] text-white text-xs font-mono focus:outline-none focus:border-[#B8F000]"
          />
        </div>
      </div>

      {/* Programs List */}
      {loading ? (
        <div className="p-16 text-center bg-[#0B0F14] border border-[#1F2937]">
          <Loader2 className="w-8 h-8 text-[#B8F000] animate-spin mx-auto mb-3" />
          <div className="text-xs font-mono text-[#A8B0BA]">Loading training programs from database...</div>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="p-16 text-center bg-[#0B0F14] border border-[#1F2937] space-y-3">
          <Target className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-base font-bold text-white">No training programs found</div>
          <p className="text-xs text-[#A8B0BA] max-w-sm mx-auto font-mono">
            {searchQuery ? "No training programs match your search query." : "No training programs currently in the database. Add your first program above."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrograms.map((program, idx) => (
            <div
              key={program.slug}
              className="p-6 bg-[#0B0F14] border border-[#1F2937] hover:border-[#B8F000]/50 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#B8F000]">
                      0{idx + 1}
                    </span>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                      {program.name}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-[#A8B0BA] leading-relaxed line-clamp-4">
                  {program.description}
                </p>
              </div>

              {/* Action Bar */}
              <div className="pt-4 mt-4 border-t border-[#1F2937] flex items-center justify-between text-xs font-mono">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                  ID: {program.slug}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(program)}
                    className="p-2 bg-[#11161D] hover:bg-[#17212C] text-[#A8B0BA] hover:text-white border border-[#1F2937] flex items-center gap-1 transition-colors cursor-pointer"
                    title="Edit Training Program"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(program)}
                    className="p-2 bg-[#11161D] hover:bg-rose-950/40 text-rose-400 border border-[#1F2937] hover:border-rose-800/60 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Delete Training Program"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal: Strictly Name of Training and Description only */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#0B0F14] border border-[#1F2937] p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#B8F000] uppercase tracking-widest font-bold">
                  {editingProgram ? "EDIT TRAINING" : "ADD NEW TRAINING"}
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-0.5">
                  {editingProgram ? editingProgram.name : "New Training Program"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              {/* Field 1: Name of Training */}
              <div>
                <label className="block text-[#A8B0BA] uppercase tracking-wider mb-1 font-bold">
                  1. Name of Training *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Beginner Training"
                  className="w-full px-3.5 py-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000] text-sm"
                />
              </div>

              {/* Field 2: Description */}
              <div>
                <label className="block text-[#A8B0BA] uppercase tracking-wider mb-1 font-bold">
                  2. Description *
                </label>
                <textarea
                  rows={5}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Structured badminton training designed for beginners to develop fundamental skills."
                  className="w-full px-3.5 py-2.5 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000] text-xs leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-[#1F2937] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-[#11161D] text-[#A8B0BA] hover:text-white uppercase font-bold text-xs border border-[#1F2937]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black uppercase text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProgram ? "Update Training" : "Save Training"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0D111A] border border-rose-900/50 rounded-2xl p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Delete Training Program?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              Are you sure you want to delete <span className="text-white font-bold">&ldquo;{deleteTarget.name}&rdquo;</span>? This will immediately remove it from the database and the homepage.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? "Deleting..." : "Delete Training"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
