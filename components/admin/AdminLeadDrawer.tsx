"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  Clock,
  User,
  Award,
  Trash2,
  Save,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { LeadItem } from "@/lib/db";

interface AdminLeadDrawerProps {
  lead: LeadItem | null;
  onClose: () => void;
  onStatusChange: (id: string, status: LeadItem["status"]) => Promise<void>;
  onSaveNotes: (id: string, notes: string) => Promise<boolean>;
  onDeleteLead: (id: string, name: string) => Promise<void>;
}

const STATUSES: { id: LeadItem["status"]; label: string; color: string; bg: string }[] = [
  { id: "NEW", label: "New Lead", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" },
  { id: "CONTACTED", label: "Contacted", color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/30" },
  { id: "TRIAL_SCHEDULED", label: "Trial Booked", color: "text-indigo-400", bg: "bg-indigo-400/10 border-indigo-400/30" },
  { id: "ENROLLED", label: "Enrolled", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
  { id: "DROPPED", label: "Archived", color: "text-slate-400", bg: "bg-slate-400/10 border-slate-400/30" },
];

export function AdminLeadDrawer({
  lead,
  onClose,
  onStatusChange,
  onSaveNotes,
  onDeleteLead,
}: AdminLeadDrawerProps) {
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || "");
      setNotesSaved(false);
    }
  }, [lead]);

  if (!lead) return null;

  // Clean phone number for WhatsApp & Call
  const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
    `Hello ${lead.name}, this is S&A Badminton Academy Kochi regarding your badminton coaching inquiry. We'd love to assist you and schedule your free trial session!`
  )}`;

  const handleSaveNotesClick = async () => {
    setSavingNotes(true);
    const success = await onSaveNotes(lead.id, notes);
    setSavingNotes(false);
    if (success) {
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2500);
    }
  };

  const currentStatusObj = STATUSES.find((s) => s.id === lead.status) || STATUSES[0];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-[#0D111A] border-l border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-800/80 bg-[#0A0D14] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentStatusObj.bg} ${currentStatusObj.color}`}>
                  {currentStatusObj.label}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(lead.submittedAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
                {lead.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Communication Bar */}
          <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 grid grid-cols-2 gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Parent</span>
            </a>

            <a
              href={`tel:${lead.phone}`}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-colors"
            >
              <Phone className="w-4 h-4 text-[#B8F000]" />
              <span>Call: {lead.phone}</span>
            </a>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Change Status Stepper */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Update Status / Pipeline Stage
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STATUSES.map((status) => {
                  const isCurrent = lead.status === status.id;
                  return (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => onStatusChange(lead.id, status.id)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? `${status.bg} ${status.color} ring-2 ring-offset-2 ring-offset-[#0D111A] ring-[#B8F000]`
                          : "border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      <span>{status.label}</span>
                      {isCurrent && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inquired Details Card */}
            <div className="p-4 rounded-2xl bg-[#090C12] border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Student &amp; Inquiry Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Centre / Branch</span>
                  <span className="font-semibold text-white capitalize flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#B8F000]" />
                    {lead.branch.replace("-", " ")}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Program Choice</span>
                  <span className="font-semibold text-white capitalize flex items-center gap-1.5 mt-0.5">
                    <Award className="w-3.5 h-3.5 text-[#B8F000]" />
                    {lead.program.replace(/-/g, " ")}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Age Category</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">
                    {lead.ageCategory || "Not specified"}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Preferred Timing</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">
                    {lead.slot || "Flexible"}
                  </span>
                </div>

                {lead.email && (
                  <div className="sm:col-span-2">
                    <span className="text-xs text-slate-500 block">Parent Email</span>
                    <a
                      href={`mailto:${lead.email}`}
                      className="font-medium text-sky-400 hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {lead.email}
                    </a>
                  </div>
                )}

                {lead.message && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-800/60">
                    <span className="text-xs text-slate-500 block">Parent Note / Message:</span>
                    <p className="text-slate-300 italic mt-1 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/50">
                      "{lead.message}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Staff Internal Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Staff Notes &amp; Follow-up Remarks
                </label>
                {notesSaved && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Called parent on Thursday. Interested in weekend morning batch for 11yr old. Booked free trial session for Saturday 7 AM."
                rows={4}
                className="w-full p-3 bg-[#090C12] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000]"
              />

              <button
                type="button"
                onClick={handleSaveNotesClick}
                disabled={savingNotes}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#B8F000]" />
                <span>{savingNotes ? "Saving Notes..." : "Save Note"}</span>
              </button>
            </div>

            {/* Danger Zone: Delete */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Spam or test submission?
              </span>
              <button
                type="button"
                onClick={() => onDeleteLead(lead.id, lead.name)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-900/30 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Inquiry</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
