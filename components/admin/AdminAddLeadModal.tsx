"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Phone, MapPin, Award, Clock } from "lucide-react";
import { LeadItem } from "@/lib/db";
import { Centre } from "@/data/centres";
import { PROGRAMS } from "@/data/programs";
import { AGE_CATEGORIES } from "@/lib/constants";

interface AdminAddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (leadData: {
    name: string;
    phone: string;
    email?: string;
    branch: string;
    program: string;
    ageCategory: string;
    slot?: string;
    notes?: string;
    message?: string;
    status: LeadItem["status"];
  }) => Promise<boolean>;
  centres?: Centre[];
}

export function AdminAddLeadModal({
  isOpen,
  onClose,
  onAddLead,
  centres: initialCentres,
}: AdminAddLeadModalProps) {
  const [centres, setCentres] = useState<Centre[]>(initialCentres || []);
  const [loadingCentres, setLoadingCentres] = useState(!initialCentres || initialCentres.length === 0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [program, setProgram] = useState("junior-badminton-coaching");
  const [ageCategory, setAgeCategory] = useState<string>(AGE_CATEGORIES[0]);
  const [slot, setSlot] = useState("Evening (04:30 PM - 07:30 PM)");
  const [status, setStatus] = useState<LeadItem["status"]>("NEW");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialCentres && initialCentres.length > 0) {
      setCentres(initialCentres);
      setLoadingCentres(false);
      if (!branch) setBranch(initialCentres[0].slug);
      return;
    }

    const fetchCentres = async () => {
      try {
        const res = await fetch("/api/centres");
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setCentres(data.items);
          if (data.items.length > 0 && !branch) {
            setBranch(data.items[0].slug);
          }
        }
      } catch (err) {
        console.error("Failed to load centres in AdminAddLeadModal:", err);
      } finally {
        setLoadingCentres(false);
      }
    };

    fetchCentres();
  }, [initialCentres]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setSubmitting(true);
    const ok = await onAddLead({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      branch,
      program,
      ageCategory,
      slot,
      status,
      notes: notes.trim() || undefined,
      message: "Direct Walk-in / Phone Inbound",
    });
    setSubmitting(false);

    if (ok) {
      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-[#0D111A] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden z-10">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B8F000]/10 border border-[#B8F000]/30 text-[#B8F000] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add New Student Inquiry</h2>
              <p className="text-xs text-slate-400">Record a parent walk-in or telephone inquiry</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Student / Parent Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Nair"
                className="w-full px-3 py-2 bg-[#090C12] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 bg-[#090C12] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Preferred Centre *
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={loadingCentres || centres.length === 0}
                className="w-full px-3 py-2 bg-[#090C12] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#B8F000] disabled:opacity-50"
              >
                {loadingCentres ? (
                  <option value="">Loading centres...</option>
                ) : centres.length === 0 ? (
                  <option value="">No active centres found</option>
                ) : (
                  centres.map((loc) => (
                    <option key={loc.slug} value={loc.slug}>
                      {loc.shortName || loc.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Training Program *
              </label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-3 py-2 bg-[#090C12] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#B8F000]"
              >
                {PROGRAMS.map((prog) => (
                  <option key={prog.slug} value={prog.slug}>
                    {prog.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Age Group
              </label>
              <select
                value={ageCategory}
                onChange={(e) => setAgeCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#090C12] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#B8F000]"
              >
                {AGE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadItem["status"])}
                className="w-full px-3 py-2 bg-[#090C12] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#B8F000]"
              >
                <option value="NEW">New Lead (Follow-up needed)</option>
                <option value="CONTACTED">Contacted (Spoke to parent)</option>
                <option value="TRIAL_SCHEDULED">Trial Booked</option>
                <option value="ENROLLED">Enrolled Directly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Preferred Timing / Batch
            </label>
            <input
              type="text"
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              placeholder="e.g. Evening (04:30 PM - 07:30 PM) or Weekend"
              className="w-full px-3 py-2 bg-[#090C12] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Staff Notes / Inquired Details
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="E.g. Parent visited Kadavanthra centre. Wants weekend batch."
              className="w-full px-3 py-2 bg-[#090C12] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#B8F000]"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#B8F000] hover:bg-[#cbf722] text-black font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              {submitting ? "Saving Inquiry..." : "Save Inquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
