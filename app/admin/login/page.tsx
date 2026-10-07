"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  X,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const res = await fetch("/api/admin/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.user) {
            router.replace(returnUrl);
          }
        }
      } catch {
        // Not authenticated, stay on login page
      }
    }
    checkExistingAuth();
  }, [router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      // Successful login - redirect to admin dashboard
      router.replace(returnUrl);
      router.refresh();
    } catch (err) {
      console.error("Login submission error:", err);
      setErrorMessage("Unable to connect to the authentication service. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#07090D] flex flex-col justify-center items-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Athletic Background Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#B8F000]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card Container */}
      <div className="w-full max-w-md relative z-10">
        
        {/* Academy Branding Card Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0F141F] border border-slate-800 text-[#B8F000] shadow-xl mb-4 relative group">
            <div className="absolute inset-0 bg-[#B8F000]/10 rounded-2xl blur-sm" />
            <ShieldCheck className="w-7 h-7 relative z-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            S&amp;A Badminton Academy
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Administrative Management Portal
          </p>
        </div>

        {/* Form Box */}
        <div className="bg-[#0D111A] border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-[#B8F000] to-emerald-400" />

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-xs sm:text-sm animate-in fade-in duration-200"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-snug">
                <span className="font-semibold block">Authentication Failed</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2"
              >
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="admin@sabadminton.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#080B10] border border-slate-800 rounded-xl text-white text-base sm:text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-slate-400 hover:text-[#B8F000] transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-[#080B10] border border-slate-800 rounded-xl text-white text-base sm:text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#B8F000] focus:ring-1 focus:ring-[#B8F000] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              id="admin-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 mt-2 rounded-xl bg-[#B8F000] hover:bg-[#c6f722] active:scale-[0.99] text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#B8F000]/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Guarantee Notice */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Encrypted Session with HttpOnly Security</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-xs text-slate-500 font-medium">
            Kochi Centres: Kadavanthra &bull; Kumbalanghi &bull; Maradu &bull; Palluruthy &bull; Chullikal
          </p>
          <p className="text-[11px] text-slate-600">
            Authorized S&amp;A Badminton Academy staff only.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0D111A] border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              Administrator Password Reset
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
              To preserve database and student privacy integrity, administrator passwords cannot be reset via public unauthenticated email links.
            </p>

            <div className="p-3.5 rounded-xl bg-[#080B10] border border-slate-800 space-y-2 mb-5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#B8F000] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Server CLI:</strong> Run the administrator setup script on the academy host environment:
                </span>
              </div>
              <div className="p-2 rounded bg-black font-mono text-[11px] text-[#B8F000] overflow-x-auto">
                npm run setup:admin
              </div>
              <div className="flex items-start gap-2 pt-1">
                <CheckCircle2 className="w-4 h-4 text-[#B8F000] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Academy Director:</strong> Contact the head coach or systems engineer directly.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Understood, Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#07090D] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#B8F000] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </React.Suspense>
  );
}

