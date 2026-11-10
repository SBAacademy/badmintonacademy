"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  X,
  RefreshCw,
  Star,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Flame,
  Globe,
  Phone,
  Link as LinkIcon,
} from "lucide-react";
import Image from "next/image";
import {
  EventItem,
  EventType,
  EventStatus,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_BADGES,
  EVENT_STATUS_LABELS,
  formatEventDate,
} from "@/data/events";
import { Centre } from "@/data/centres";
import { ImageUploadField } from "./ImageUploadField";

const ALL_EVENT_TYPES: EventType[] = [
  "TOURNAMENT",
  "COMPETITION",
  "CHAMPIONSHIP",
  "TRAINING_CAMP",
  "WORKSHOP",
  "ACADEMY_EVENT",
  "SPECIAL_SESSION",
  "OTHER",
];

const ALL_STATUSES: EventStatus[] = [
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
];

export function EventsManager() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [form, setForm] = useState<Partial<EventItem>>({
    title: "",
    slug: "",
    description: "",
    eventType: "TOURNAMENT",
    eventDate: new Date().toISOString().split("T")[0],
    venue: "SBA Badminton Arena, Kadavanthra",
    centreSlug: "",
    image: "",
    contact: "+91 79076 55513",
    status: "UPCOMING",
    isFeatured: false,
    isPublished: true,
    displayOrder: 1,
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setEvents(data.items);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setFeedback({ type: "error", text: "Failed to load events from database." });
    } finally {
      setLoading(false);
    }
  };

  const fetchCentres = async () => {
    try {
      const res = await fetch("/api/centres", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setCentres(data.items);
      }
    } catch (err) {
      console.warn("Could not load centres for events selector:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchCentres();
  }, []);

  const openAddModal = () => {
    setEditingEvent(null);
    const today = new Date().toISOString().split("T")[0];
    setForm({
      title: "",
      slug: "",
      description: "",
      eventType: "TOURNAMENT",
      eventDate: today,
      venue: centres.length > 0 ? centres[0].name : "SBA Badminton Arena, Kadavanthra",
      centreSlug: centres.length > 0 ? centres[0].slug : "",
      image: "/images/badminton-arena.jpg",
      contact: "+91 79076 55513",
      status: "UPCOMING",
      isFeatured: false,
      isPublished: true,
      displayOrder: events.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: EventItem) => {
    setEditingEvent(item);
    setForm({
      ...item,
      eventDate: item.eventDate ? item.eventDate.split("T")[0] : "",
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setForm((prev) => {
      const update: Partial<EventItem> = { ...prev, title: val };
      if (!editingEvent) {
        // Auto-generate slug for new event
        update.slug = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      return update;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.eventDate || !form.venue) {
      setFeedback({ type: "error", text: "Title, date, and venue are required." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const payload = {
      ...form,
      startTime: null,
      endTime: null,
      registrationUrl: null,
    };

    try {
      if (editingEvent) {
        // Update existing
        const res = await fetch(`/api/admin/events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setFeedback({ type: "success", text: `Event "${data.event.title}" updated successfully.` });
          setIsModalOpen(false);
          await fetchEvents();
        } else {
          setFeedback({ type: "error", text: data.message || "Failed to update event." });
        }
      } else {
        // Create new
        const res = await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setFeedback({ type: "success", text: `Event "${data.event.title}" created successfully.` });
          setIsModalOpen(false);
          await fetchEvents();
        } else {
          setFeedback({ type: "error", text: data.message || "Failed to create event." });
        }
      }
    } catch {
      setFeedback({ type: "error", text: "Network error while saving event." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/events/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        setFeedback({ type: "success", text: `Event "${deleteTarget.title}" permanently deleted.` });
        setDeleteTarget(null);
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to delete event." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error while deleting event." });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (item: EventItem) => {
    const nextVal = !item.isPublished;
    try {
      const res = await fetch(`/api/admin/events/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextVal }),
      });
      const data = await res.json();
      if (data.success) {
        setEvents((prev) =>
          prev.map((e) => (e.id === item.id ? { ...e, isPublished: nextVal } : e))
        );
        setFeedback({
          type: "success",
          text: `Event "${item.title}" is now ${nextVal ? "Published" : "Unpublished"}.`,
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to toggle published state." });
    }
  };

  const handleToggleFeatured = async (item: EventItem) => {
    const nextVal = !item.isFeatured;
    try {
      const res = await fetch(`/api/admin/events/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: nextVal }),
      });
      const data = await res.json();
      if (data.success) {
        // If turning on, unmark any other featured
        setEvents((prev) =>
          prev.map((e) => ({
            ...e,
            isFeatured: e.id === item.id ? nextVal : nextVal ? false : e.isFeatured,
          }))
        );
        setFeedback({
          type: "success",
          text: `Event "${item.title}" is ${nextVal ? "now Featured" : "no longer Featured"}.`,
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to toggle featured state." });
    }
  };

  // Filtered List
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      (e.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.venue || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "ALL" || e.eventType === typeFilter;
    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalUpcoming = events.filter((e) => e.status === "UPCOMING" || e.status === "ONGOING").length;
  const totalTournaments = events.filter((e) => e.eventType === "TOURNAMENT" || e.eventType === "CHAMPIONSHIP").length;
  const featuredEvent = events.find((e) => e.isFeatured);

  return (
    <div className="space-y-6 select-none">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-[#B8F000]/10 border-[#B8F000]/30 text-[#B8F000]"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span className="text-sm font-medium">{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white"
            aria-label="Dismiss feedback"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0F141C] border border-[#1F2937] p-5 rounded-2xl">
          <div className="flex items-center justify-between text-[#A8B0BA]">
            <span className="text-xs font-mono uppercase tracking-wider">Total Events</span>
            <Calendar className="w-4 h-4 text-[#B8F000]" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{events.length}</div>
          <div className="text-[11px] text-[#A8B0BA] mt-1">Across all categories</div>
        </div>

        <div className="bg-[#0F141C] border border-[#1F2937] p-5 rounded-2xl">
          <div className="flex items-center justify-between text-[#A8B0BA]">
            <span className="text-xs font-mono uppercase tracking-wider">Upcoming &amp; Live</span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">{totalUpcoming}</div>
          <div className="text-[11px] text-[#A8B0BA] mt-1">Active on public site</div>
        </div>

        <div className="bg-[#0F141C] border border-[#1F2937] p-5 rounded-2xl">
          <div className="flex items-center justify-between text-[#A8B0BA]">
            <span className="text-xs font-mono uppercase tracking-wider">Tournaments</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 mt-2">{totalTournaments}</div>
          <div className="text-[11px] text-[#A8B0BA] mt-1">Competitive events</div>
        </div>

        <div className="bg-[#0F141C] border border-[#1F2937] p-5 rounded-2xl">
          <div className="flex items-center justify-between text-[#A8B0BA]">
            <span className="text-xs font-mono uppercase tracking-wider">Featured Event</span>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
          <div className="text-sm font-bold text-white mt-2 truncate">
            {featuredEvent ? featuredEvent.title : "None Set"}
          </div>
          <div className="text-[11px] text-[#A8B0BA] mt-1">Highlighted on homepage</div>
        </div>
      </div>

      {/* Control Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#0F141C] border border-[#1F2937] p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8B0BA]" />
            <input
              type="text"
              placeholder="Search by tournament title, venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161F2C] border border-[#1F2937] text-white pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#B8F000] placeholder:text-[#A8B0BA]/60"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#161F2C] border border-[#1F2937] text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#B8F000]"
          >
            <option value="ALL">All Categories</option>
            {ALL_EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {EVENT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#161F2C] border border-[#1F2937] text-white px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#B8F000]"
          >
            <option value="ALL">All Statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {EVENT_STATUS_LABELS[s].label}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="p-2.5 bg-[#161F2C] hover:bg-[#1E293B] text-white rounded-xl border border-[#1F2937] transition-colors"
            title="Refresh events from database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#B8F000]" : ""}`} />
          </button>

          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Events Table / Card List */}
      {loading ? (
        <div className="py-20 text-center text-[#A8B0BA]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#B8F000] mb-2" />
          <p className="text-xs font-mono uppercase tracking-wider">Loading events from PostgreSQL...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-20 text-center bg-[#0F141C] border border-[#1F2937] rounded-2xl p-8 space-y-4">
          <Calendar className="w-12 h-12 text-[#A8B0BA]/40 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Events Found</h3>
            <p className="text-xs text-[#A8B0BA] max-w-sm mx-auto">
              {events.length === 0
                ? "There are currently no events or tournaments in the database. Click \"Create Event\" to add the first upcoming tournament."
                : "No events match the current search or filter criteria."}
            </p>
          </div>
          {events.length === 0 && (
            <button
              onClick={openAddModal}
              className="px-5 py-2.5 bg-[#B8F000] text-[#07090D] font-bold text-xs uppercase tracking-wider rounded-xl inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Tournament</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((evt) => {
            const badge = EVENT_TYPE_BADGES[evt.eventType] || EVENT_TYPE_BADGES.OTHER;
            const statusConfig = EVENT_STATUS_LABELS[evt.status] || EVENT_STATUS_LABELS.UPCOMING;

            return (
              <div
                key={evt.id}
                className={`bg-[#0F141C] border ${
                  evt.isFeatured ? "border-yellow-500/50 bg-yellow-500/[0.02]" : "border-[#1F2937]"
                } p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-[#B8F000]/40 transition-colors group`}
              >
                {/* Left Side: Thumbnail & Core Details */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#161F2C] border border-[#1F2937] shrink-0">
                    <Image
                      src={evt.image || "/images/badminton-arena.jpg"}
                      alt={evt.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="96px"
                    />
                    {evt.isFeatured && (
                      <div className="absolute top-1 right-1 bg-yellow-500 text-black p-1 rounded-md shadow-sm">
                        <Star className="w-2.5 h-2.5 fill-black" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded border ${badge.bg} ${badge.text}`}>
                        {badge.icon} {badge.label}
                      </span>

                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full border flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        {statusConfig.label}
                      </span>

                      {!evt.isPublished && (
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Hidden / Draft
                        </span>
                      )}

                      {evt.centreName && (
                        <span className="px-2 py-0.5 text-[10px] font-mono text-[#A8B0BA] bg-[#161F2C] rounded border border-[#1F2937]">
                          📍 {evt.centreName}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-white group-hover:text-[#B8F000] transition-colors leading-tight">
                      {evt.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#A8B0BA]">
                      <span className="flex items-center gap-1.5 text-white font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#B8F000]" />
                        {formatEventDate(evt.eventDate)}
                      </span>

                      <span className="flex items-center gap-1.5 truncate max-w-xs text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-[#A8B0BA]" />
                        {evt.venue}
                      </span>
                    </div>

                    {evt.description && (
                      <p className="text-xs text-[#A8B0BA] line-clamp-1 max-w-2xl font-normal pt-0.5">
                        {evt.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side: Quick Action Controls */}
                <div className="flex items-center justify-end gap-2 border-t md:border-t-0 border-[#1F2937] pt-3 md:pt-0 shrink-0">
                  {/* Featured Toggle */}
                  <button
                    onClick={() => handleToggleFeatured(evt)}
                    className={`p-2 rounded-xl border transition-colors ${
                      evt.isFeatured
                        ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                        : "bg-[#161F2C] border-[#1F2937] text-slate-400 hover:text-white"
                    }`}
                    title={evt.isFeatured ? "Featured event (Click to unfeature)" : "Mark as Featured"}
                  >
                    <Star className={`w-4 h-4 ${evt.isFeatured ? "fill-yellow-400" : ""}`} />
                  </button>

                  {/* Publish Toggle */}
                  <button
                    onClick={() => handleTogglePublish(evt)}
                    className={`p-2 rounded-xl border transition-colors ${
                      evt.isPublished
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        : "bg-[#161F2C] border-[#1F2937] text-slate-400 hover:text-white"
                    }`}
                    title={evt.isPublished ? "Published (Click to unpublish)" : "Hidden (Click to publish)"}
                  >
                    {evt.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* View Public Route */}
                  <a
                    href={`/events/${evt.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[#161F2C] hover:bg-[#1E293B] border border-[#1F2937] text-[#A8B0BA] hover:text-white rounded-xl transition-colors"
                    title="View live event page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(evt)}
                    className="p-2 bg-[#161F2C] hover:bg-[#1E293B] border border-[#1F2937] text-[#B8F000] rounded-xl transition-colors"
                    title="Edit event"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteTarget(evt)}
                    className="p-2 bg-[#161F2C] hover:bg-red-500/20 border border-[#1F2937] hover:border-red-500/40 text-red-400 rounded-xl transition-colors"
                    title="Delete event permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0F141C] border border-[#1F2937] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto my-auto shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#B8F000]" />
                  <span>{editingEvent ? "Edit Tournament / Event" : "Create New Tournament / Event"}</span>
                </h3>
                <p className="text-xs text-[#A8B0BA]">
                  Events are persisted to PostgreSQL and appear dynamically on the website.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#A8B0BA] hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-5 text-left text-xs">
              {/* Event Title */}
              <div className="space-y-1.5">
                <label className="font-bold text-white uppercase tracking-wider block">
                  Event Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SBA Kochi Junior Badminton Championship 2026"
                  value={form.title || ""}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-[#161F2C] border border-[#1F2937] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#B8F000] text-sm font-medium"
                />
              </div>

              {/* Slug & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-white uppercase tracking-wider block">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="kochi-junior-badminton-championship-2026"
                    value={form.slug || ""}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full bg-[#161F2C] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl font-mono text-xs focus:outline-none focus:border-[#B8F000]"
                  />
                  <span className="text-[10px] text-[#A8B0BA] block">
                    Public URL: /events/{form.slug || "slug"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white uppercase tracking-wider block">
                    Event Category
                  </label>
                  <select
                    value={form.eventType || "TOURNAMENT"}
                    onChange={(e) => setForm({ ...form, eventType: e.target.value as EventType })}
                    className="w-full bg-[#161F2C] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#B8F000]"
                  >
                    {ALL_EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {EVENT_TYPE_BADGES[t].icon} {EVENT_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Event Date */}
              <div className="space-y-1.5">
                <label className="font-bold text-white uppercase tracking-wider block">
                  Event Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={form.eventDate || ""}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  className="w-full bg-[#161F2C] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              {/* Venue & Associated Centre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-white uppercase tracking-wider block">
                    Venue Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SBA Badminton Academy, Kumbalanghi"
                    value={form.venue || ""}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full bg-[#161F2C] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-white uppercase tracking-wider block">
                    Associated Academy Centre
                  </label>
                  <select
                    value={form.centreSlug || ""}
                    onChange={(e) => setForm({ ...form, centreSlug: e.target.value || null })}
                    className="w-full bg-[#161F2C] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#B8F000]"
                  >
                    <option value="">None / External Venue</option>
                    {centres.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name} ({c.shortName || c.slug})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-[#A8B0BA] block">
                    Loaded live from PostgreSQL centres table.
                  </span>
                </div>
              </div>

              {/* Poster Image Upload Field */}
              <div className="space-y-1.5">
                <ImageUploadField
                  label="Tournament Poster / Banner Image"
                  value={form.image || ""}
                  onChange={(url) => setForm({ ...form, image: url })}
                  aspectRatio="16/9"
                  helpText="Upload a poster flyer, arena photo, or provide a URL."
                />
              </div>

              {/* Desk Contact / WhatsApp */}
              <div className="space-y-1.5">
                <label className="font-bold text-white uppercase tracking-wider block">
                  Desk Contact / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="+91 79076 55513 / events@sabadminton.com"
                  value={form.contact || ""}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="w-full bg-[#161F2C] border border-[#1F2937] text-white px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-[#B8F000]"
                />
                <span className="text-[10px] text-[#A8B0BA] block">
                  Direct phone / WhatsApp for participant registration queries and entries.
                </span>
              </div>

              {/* Description & Rules */}
              <div className="space-y-1.5">
                <label className="font-bold text-white uppercase tracking-wider block">
                  Event Description, Format &amp; Prizes
                </label>
                <textarea
                  rows={4}
                  placeholder="Outline age categories (U-13, U-17, Open), prize pool, schedule details, entry fees, and registration deadlines..."
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#161F2C] border border-[#1F2937] text-white p-3.5 rounded-xl text-xs focus:outline-none focus:border-[#B8F000] leading-relaxed"
                />
              </div>

              {/* Status & Options Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#1F2937]">
                <div className="space-y-1.5">
                  <label className="font-bold text-white uppercase tracking-wider block">
                    Status
                  </label>
                  <select
                    value={form.status || "UPCOMING"}
                    onChange={(e) => setForm({ ...form, status: e.target.value as EventStatus })}
                    className="w-full bg-[#161F2C] border border-[#1F2937] text-white px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#B8F000]"
                  >
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {EVENT_STATUS_LABELS[s].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-4 sm:pt-6">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={Boolean(form.isFeatured)}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#B8F000] bg-[#161F2C] border-[#1F2937] focus:ring-[#B8F000]"
                  />
                  <label htmlFor="isFeatured" className="text-white font-bold cursor-pointer">
                    ⭐ Feature on Homepage
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-4 sm:pt-6">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={form.isPublished !== false}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded text-[#B8F000] bg-[#161F2C] border-[#1F2937] focus:ring-[#B8F000]"
                  />
                  <label htmlFor="isPublished" className="text-white font-bold cursor-pointer">
                    👁️ Publicly Published
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-[#161F2C] hover:bg-[#1E293B] text-[#A8B0BA] hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{editingEvent ? "Save Changes" : "Create Event"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F141C] border border-[#1F2937] rounded-3xl max-w-md w-full p-6 space-y-5 text-left shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">
                  Delete Tournament / Event
                </h3>
                <p className="text-xs text-[#A8B0BA]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#A8B0BA] leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white">&quot;{deleteTarget.title}&quot;</strong>? It will immediately be
              removed from the database and public site.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-[#161F2C] hover:bg-[#1E293B] text-[#A8B0BA] hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
              >
                {isDeleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
