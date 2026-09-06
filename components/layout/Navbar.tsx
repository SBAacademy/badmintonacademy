"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle, ChevronDown, ArrowRight, Phone } from "lucide-react";
import { ACADEMY_DATA } from "@/data/academy";
import { BRANCHES } from "@/data/branches";
import { PROGRAMS } from "@/data/programs";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { 
    name: "Programs", 
    href: "/programs",
    dropdown: PROGRAMS.map(p => ({ 
      name: p.shortName, 
      href: `/programs/${p.slug}`,
      desc: p.skillLevel 
    }))
  },
  { 
    name: "Branches", 
    href: "/branches",
    dropdown: BRANCHES.map(b => ({ 
      name: b.shortName, 
      href: `/branches/${b.slug}`,
      desc: b.cityArea 
    }))
  },
  { name: "Coaches", href: "/coaches" },
  { name: "Achievements", href: "/achievements" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const handleWhatsAppClick = () => {
    trackEvent("whatsapp_click", { source: "navbar" });
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 h-16 lg:h-20 ${
        isScrolled
          ? "bg-[#080B10]/95 backdrop-blur-md shadow-lg shadow-black/60 border-b border-[#26313D]"
          : "bg-[#080B10]/90 backdrop-blur-sm border-b border-[#26313D]/70"
      }`}
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Compact Horizontal Logo Lockup */}
        <Link href="/" className="flex items-center gap-3.5 group shrink-0 mr-4 lg:mr-8 xl:mr-10">
          <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-[#121A23] border border-[#26313D] group-hover:border-[#B8F000]/60 flex items-center justify-center transition-colors shadow-sm">
            {/* Authentic Badminton Racket & Shuttlecock Vector */}
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 lg:w-6 lg:h-6 text-[#B8F000]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Badminton Racket Head */}
              <circle cx="15" cy="8.5" r="5" strokeWidth="2" />
              {/* Racket Shaft & Grip Handle */}
              <line x1="11.5" y1="12" x2="4.5" y2="19" strokeWidth="2.5" />
              <line x1="3.5" y1="18" x2="5.5" y2="20" strokeWidth="2.5" />
              {/* Strings */}
              <line x1="15" y1="4" x2="15" y2="13" strokeWidth="1" strokeDasharray="1.2 1.5" />
              <line x1="10.5" y1="8.5" x2="19.5" y2="8.5" strokeWidth="1" strokeDasharray="1.2 1.5" />
              {/* Dynamic Flying Shuttlecock */}
              <circle cx="6" cy="6" r="1.4" fill="currentColor" stroke="none" />
              <path d="M7 7l3.5 3.5" strokeWidth="1.4" />
              <path d="M5.2 7.5l2 3.8" strokeWidth="1.2" />
              <path d="M7.5 5.2l3.8 2" strokeWidth="1.2" />
            </svg>
          </div>

          <div className="flex flex-col text-left">
            <span className="font-black text-base lg:text-lg tracking-tight text-[#F8FAFC] leading-none group-hover:text-white transition-colors">
              S & A
            </span>
            <span className="text-[10px] lg:text-[11px] font-bold text-[#A7B0BC] uppercase tracking-wider mt-1">
              Badminton Academy
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links with Generous Spacing */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 2xl:gap-2.5" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            const hasDropdown = !!link.dropdown;

            if (hasDropdown) {
              return (
                <div
                  key={link.name}
                  className="relative group"
                  onMouseEnter={() => setOpenDropdown(link.name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={`px-3 py-2 text-[13px] xl:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                      isActive
                        ? "text-[#B8F000] bg-[#121A23] border border-[#26313D] font-bold"
                        : "text-[#A7B0BC] hover:text-[#F8FAFC] hover:bg-[#121A23]/60"
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#6B7280] group-hover:text-[#B8F000] group-hover:rotate-180 transition-transform duration-200" />
                  </Link>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute left-0 top-full mt-2 w-56 rounded-2xl bg-[#121A23] border border-[#26313D] shadow-2xl p-2 transition-all duration-150 origin-top-left z-50 ${
                      openDropdown === link.name
                        ? "opacity-100 scale-100 visible pointer-events-auto"
                        : "opacity-0 scale-95 invisible pointer-events-none"
                    }`}
                  >
                    {link.dropdown?.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className="block px-3.5 py-2.5 rounded-xl hover:bg-[#17212C] transition-colors group/item"
                      >
                        <div className="text-xs font-semibold text-[#F8FAFC] group-hover/item:text-[#B8F000] transition-colors">
                          {subItem.name}
                        </div>
                        {"desc" in subItem && (
                          <div className="text-[11px] text-[#6B7280] mt-0.5 truncate">
                            {subItem.desc}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 text-[13px] xl:text-sm font-semibold rounded-xl transition-colors ${
                  isActive
                    ? "text-[#B8F000] bg-[#121A23] border border-[#26313D] font-bold"
                    : "text-[#A7B0BC] hover:text-[#F8FAFC] hover:bg-[#121A23]/60"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Clean Standardized Action CTAs (WhatsApp + Primary Book Free Trial) */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-3.5 shrink-0 ml-4 xl:ml-6">
          {/* WhatsApp Direct */}
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="inline-flex items-center gap-2 px-3.5 xl:px-4 py-2.5 rounded-xl bg-[#121A23] hover:bg-[#17212C] text-[#F8FAFC] text-xs xl:text-[13px] font-semibold border border-[#26313D] hover:border-[#374758] transition-colors whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-4 h-4 text-[#22C55E]" />
            <span>WhatsApp</span>
          </a>

          {/* Primary CTA — Never Wraps */}
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-4.5 xl:px-5 py-2.5 rounded-xl bg-[#B8F000] hover:bg-[#c7fb1e] text-[#07100A] text-xs xl:text-[13px] font-extrabold uppercase tracking-wide shadow-sm transition-all duration-200 whitespace-nowrap shrink-0 group leading-none"
          >
            <span>BOOK A FREE TRIAL</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex lg:hidden items-center gap-2.5">
          <Link
            href="/contact"
            className="px-3.5 py-1.5 rounded-lg bg-[#B8F000] text-[#07100A] text-xs font-black uppercase tracking-wider shrink-0"
          >
            Trial
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-[#121A23] border border-[#26313D] text-[#F8FAFC] hover:bg-[#17212C] transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#B8F000]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-[#080B10]/98 backdrop-blur-xl border-b border-[#26313D] overflow-y-auto px-6 py-6 flex flex-col justify-between shadow-2xl z-50 animate-in fade-in duration-150">
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-3">
              Academy Navigation
            </div>

            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const hasDropdown = !!link.dropdown;

              return (
                <div key={link.name} className="border-b border-[#26313D]/60 pb-2.5">
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.href}
                      className={`text-base font-bold py-1 transition-colors ${
                        isActive ? "text-[#B8F000]" : "text-[#F8FAFC]"
                      }`}
                    >
                      {link.name}
                    </Link>

                    {hasDropdown && (
                      <button
                        onClick={() => setOpenDropdown(openDropdown === link.name ? null : link.name)}
                        className="p-1.5 text-[#6B7280] hover:text-[#B8F000]"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-150 ${
                            openDropdown === link.name ? "rotate-180 text-[#B8F000]" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {hasDropdown && openDropdown === link.name && (
                    <div className="pl-3 mt-2 space-y-1.5 py-1 border-l-2 border-[#B8F000]/40">
                      {link.dropdown?.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="block text-sm text-[#A7B0BC] hover:text-[#B8F000] py-1"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Testimonials link in drawer */}
            <div className="border-b border-[#26313D]/60 pb-2.5">
              <Link
                href="/testimonials"
                className={`text-base font-bold py-1 block transition-colors ${
                  pathname === "/testimonials" ? "text-[#B8F000]" : "text-[#F8FAFC]"
                }`}
              >
                Testimonials
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#26313D] space-y-3">
            <Link
              href="/contact"
              className="w-full py-3.5 rounded-xl bg-[#B8F000] text-[#07100A] text-center font-black text-sm uppercase tracking-wider block shadow-sm"
            >
              BOOK A FREE TRIAL →
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#121A23] border border-[#26313D] text-[#F8FAFC] text-xs font-semibold"
              >
                <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                WhatsApp
              </a>
              <a
                href={`tel:${ACADEMY_DATA.phone}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#121A23] border border-[#26313D] text-[#A7B0BC] text-xs font-semibold"
              >
                <Phone className="w-4 h-4 text-[#B8F000]" />
                Call Desk
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

