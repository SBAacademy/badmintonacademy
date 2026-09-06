import React from "react";
import Link from "next/link";
import { ArrowRight, Home, Sparkles } from "lucide-react";
import { ShuttlecockVisual } from "@/components/hero/ShuttlecockVisual";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 court-grid">
      <div className="max-w-xl w-full text-center space-y-6">
        
        {/* Out of Court Animated Shuttlecock */}
        <div className="flex justify-center -mb-8">
          <div className="w-56 h-56">
            <ShuttlecockVisual />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
          <span>🏸 Out of Bounds (404 Error)</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Looks Like That Shuttle Landed Out!
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          The page or court session you were looking for doesn’t exist or has been relocated to another branch.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-[#090D16] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-opacity"
          >
            <Home className="w-4 h-4" />
            <span>Back to Academy Home</span>
          </Link>

          <Link
            href="/programs"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <span>View Training Programs</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>

      </div>
    </div>
  );
}
