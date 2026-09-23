"use client";

import React, { useState, useEffect } from "react";
import { MessageSquarePlus, X, CheckCircle, Loader2 } from "lucide-react";
import { Centre } from "@/data/centres";

export function PublicReviewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [name, setName] = useState("");
  const [centre, setCentre] = useState("");
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("/api/centres", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items)) {
          setCentres(data.items);
          if (data.items.length > 0 && !centre) {
            setCentre(data.items[0].name);
          }
        }
      })
      .catch(() => {});
  }, [centre]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !review.trim()) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      const selectedCentre = centre || (centres[0]?.name || "Kadavanthra (Headquarters)");
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          centre: selectedCentre,
          review: review.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.message || "Unable to submit review. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setReview("");
      setErrorMessage("");
    }, 300);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#B8F000]/15 cursor-pointer"
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span>Write a Review</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-[#0D111A] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
            <button
              type="button"
              onClick={resetAndClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Thank You for Your Review!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  Your feedback has been submitted for approval. Once reviewed by our academy team, it will appear publicly on the website.
                </p>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="text-[10px] font-mono text-[#B8F000] font-bold uppercase tracking-widest mb-1">
                    COMMUNITY FEEDBACK
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    Share Your Experience
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Help other players and parents discover quality badminton coaching in Kochi.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5 font-mono">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Menon / Deepa Nair"
                    className="w-full px-3.5 h-10 bg-[#07090D] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5 font-mono">
                    Academy Centre / Branch *
                  </label>
                  <select
                    value={centre}
                    onChange={(e) => setCentre(e.target.value)}
                    className="w-full px-3.5 h-10 bg-[#07090D] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-[#B8F000] transition-colors font-mono cursor-pointer"
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

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1.5 font-mono">
                    Your Review / Feedback *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Describe coaching quality, coach attention, fitness improvement, court atmosphere, or overall experience..."
                    className="w-full p-3 bg-[#07090D] border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#B8F000] transition-colors font-mono resize-y"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Submit Review</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
