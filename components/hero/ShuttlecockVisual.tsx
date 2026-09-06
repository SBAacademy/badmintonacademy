"use client";

import React from "react";

export function ShuttlecockVisual() {
  return (
    <div className="relative w-full max-w-lg aspect-square flex items-center justify-center select-none pointer-events-none">
      {/* Radial Glow Halos */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute w-72 h-72 rounded-full border border-emerald-500/20 animate-court-pulse" />
      <div className="absolute w-96 h-96 rounded-full border border-cyan-500/10" />

      {/* Trajectory Motion Speed Lines */}
      <svg
        className="absolute inset-0 w-full h-full text-emerald-400/40"
        viewBox="0 0 400 400"
        fill="none"
      >
        <path
          d="M 50 350 C 150 320, 240 220, 320 80"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        <path
          d="M 80 370 C 170 340, 250 250, 340 100"
          stroke="rgba(6, 182, 212, 0.3)"
          strokeWidth="1.5"
          strokeDasharray="4 8"
        />
      </svg>

      {/* Floating Center Shuttlecock SVG */}
      <div className="relative z-10 animate-shuttle-float">
        <svg
          width="240"
          height="240"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_20px_40px_rgba(16,185,129,0.35)]"
        >
          {/* Feather Crown Spines */}
          <path d="M50 32 L30 10" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M50 32 L40 6" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M50 32 L50 4" stroke="#6EE7B7" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M50 32 L60 6" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M50 32 L70 10" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

          {/* Feather Overlap Weave Ribbons */}
          <path
            d="M 28 12 Q 50 18 72 12"
            stroke="#A7F3D0"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M 34 22 Q 50 26 66 22"
            stroke="#10B981"
            strokeWidth="2"
            fill="none"
          />

          {/* Feather Skirt Body */}
          <polygon
            points="32,14 68,14 58,48 42,48"
            fill="url(#featherGlow)"
            opacity="0.3"
          />

          {/* Feather Shaft Ribs */}
          <line x1="42" y1="48" x2="33" y2="15" stroke="#ECFDF5" strokeWidth="1.2" />
          <line x1="46" y1="48" x2="42" y2="7" stroke="#ECFDF5" strokeWidth="1.2" />
          <line x1="50" y1="48" x2="50" y2="5" stroke="#FFFFFF" strokeWidth="1.6" />
          <line x1="54" y1="48" x2="58" y2="7" stroke="#ECFDF5" strokeWidth="1.2" />
          <line x1="58" y1="48" x2="67" y2="15" stroke="#ECFDF5" strokeWidth="1.2" />

          {/* Cork Ribbon Collar */}
          <rect x="41" y="47" width="18" height="5" rx="1.5" fill="#047857" stroke="#10B981" strokeWidth="0.8" />
          <line x1="41" y1="49.5" x2="59" y2="49.5" stroke="#F8FAFC" strokeWidth="0.8" />

          {/* Cork Dome Base */}
          <path
            d="M 42 52 C 42 66, 58 66, 58 52 Z"
            fill="url(#corkGrad)"
            stroke="#10B981"
            strokeWidth="1.5"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="featherGlow" x1="50" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10B981" />
              <stop offset="1" stopColor="#064E3B" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="corkGrad" x1="42" y1="52" x2="58" y2="66" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F8FAFC" />
              <stop offset="0.7" stopColor="#E2E8F0" />
              <stop offset="1" stopColor="#94A3B8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Speed Smashing Blur Badge */}
        <div className="absolute -bottom-2 -right-4 bg-[#111827]/90 backdrop-blur-md border border-emerald-500/40 rounded-xl px-3 py-1.5 shadow-xl flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-mono text-emerald-300 font-bold tracking-tight">
            350+ KM/H SMASH
          </span>
        </div>
      </div>
    </div>
  );
}
