"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle, ChevronDown, ArrowRight, Phone } from "lucide-react";
import { ACADEMY_DATA } from "@/data/academy";
import { LOCATIONS } from "@/data/locations";
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
    name: "Centres", 
    href: "/branches",
    dropdown: Object.values(LOCATIONS).map(l => ({ 
      name: l.shortName, 
      href: `/${l.slug}`,
      desc: l.city 
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
  const [openMobileMenu, setOpenMobileMenu] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpenDropdown(name);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    setOpenMobileMenu(null);
  }, [pathname]);

  const handleWhatsAppClick = () => {
    trackEvent("whatsapp_click", { source: "navbar" });
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-40 w-full transition-all duration-200 h-16 lg:h-20 ${
          isScrolled
            ? "bg-[#07090D]/95 backdrop-blur-md shadow-lg shadow-black/80 border-b border-[#1F2937]"
            : "bg-[#07090D]/90 backdrop-blur-sm border-b border-[#1F2937]/80"
        }`}
      >
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          {/* Compact Horizontal Logo Lockup */}
          <Link href="/" className="flex items-center gap-3 group shrink-0 mr-3 lg:mr-8 xl:mr-10">
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
                const isOpen = openDropdown === link.name;
                return (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(link.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        setOpenDropdown(isOpen ? null : link.name);
                      }}
                      className={`px-3 py-2 text-[13px] xl:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isActive || isOpen
                          ? "text-[#B8F000] bg-[#121A23] border border-[#26313D] font-bold"
                          : "text-[#A7B0BC] hover:text-[#F8FAFC] hover:bg-[#121A23]/60"
                      }`}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                    >
                      <span>{link.name}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#B8F000]" : "text-[#6B7280]"
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu - No gap: pt-2 creates visual spacing within the continuous hover context */}
                    {isOpen && (
                      <div
                        className="absolute left-0 top-full pt-2 w-64 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                        onMouseEnter={() => handleMouseEnter(link.name)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="rounded-xl bg-[#11161D] border border-[#1F2937] shadow-2xl p-2 space-y-0.5 backdrop-blur-xl">
                          {link.dropdown?.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setOpenDropdown(null)}
                              className="block px-3.5 py-2.5 rounded-xl hover:bg-[#17212C] transition-colors group/item"
                            >
                              <div className="text-xs font-semibold text-[#F8FAFC] group-hover/item:text-[#B8F000] transition-colors">
                                {subItem.name}
                              </div>
                              {"desc" in subItem && subItem.desc && (
                                <div className="text-[11px] text-[#6B7280] mt-0.5 truncate">
                                  {subItem.desc}
                                </div>
                              )}
                            </Link>
                          ))}

                          {/* Overview Link for SEO & Direct Navigation */}
                          <div className="pt-1.5 mt-1.5 border-t border-[#1F2937]">
                            <Link
                              href={link.href}
                              onClick={() => setOpenDropdown(null)}
                              className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-bold text-[#B8F000] hover:bg-[#17212C] transition-colors group/all"
                            >
                              <span>Explore all {link.name.toLowerCase()}</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover/all:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
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

          {/* Mobile Actions: Trial Button + Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/contact"
              className="px-3 py-1.5 rounded-lg bg-[#B8F000] text-[#07100A] text-xs font-black uppercase tracking-wider shrink-0 shadow-sm"
            >
              Trial
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-[#121A23] border border-[#26313D] text-[#F8FAFC] hover:text-[#B8F000] active:scale-95 transition-all"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Immersive Mobile Navigation Drawer (100% Opaque Solid Dark Background) */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[100] flex flex-col overflow-hidden animate-in fade-in duration-200"
          style={{ backgroundColor: "#07090D" }}
        >
          {/* Mobile Drawer Header */}
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[#1F2937] shrink-0 bg-[#07090D]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#121A23] border border-[#26313D] flex items-center justify-center shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-[#B8F000]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="15" cy="8.5" r="5" strokeWidth="2" />
                  <line x1="11.5" y1="12" x2="4.5" y2="19" strokeWidth="2.5" />
                  <line x1="3.5" y1="18" x2="5.5" y2="20" strokeWidth="2.5" />
                  <line x1="15" y1="4" x2="15" y2="13" strokeWidth="1" strokeDasharray="1.2 1.5" />
                  <line x1="10.5" y1="8.5" x2="19.5" y2="8.5" strokeWidth="1" strokeDasharray="1.2 1.5" />
                  <circle cx="6" cy="6" r="1.4" fill="currentColor" stroke="none" />
                  <path d="M7 7l3.5 3.5" strokeWidth="1.4" />
                  <path d="M5.2 7.5l2 3.8" strokeWidth="1.2" />
                  <path d="M7.5 5.2l3.8 2" strokeWidth="1.2" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-black text-base tracking-tight text-[#F8FAFC] leading-none">
                  S & A
                </span>
                <span className="text-[10px] font-bold text-[#A7B0BC] uppercase tracking-wider mt-1">
                  Badminton Academy
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setOpenMobileMenu(null);
              }}
              className="w-10 h-10 rounded-xl bg-[#121A23] border border-[#26313D] text-[#F8FAFC] hover:text-[#B8F000] flex items-center justify-center active:scale-95 transition-all"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5 text-[#B8F000]" />
            </button>
          </div>

          {/* Scrollable Navigation Links */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1.5">
            <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-3 px-3">
              Academy Navigation
            </div>

            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const hasDropdown = !!link.dropdown;
              const menuKey = link.name.toLowerCase();
              const isExpanded = openMobileMenu === menuKey;

              if (hasDropdown) {
                return (
                  <div key={link.name} className="rounded-xl overflow-hidden">
                    {/* Entire Row is Interactive Button */}
                    <button
                      type="button"
                      onClick={() => setOpenMobileMenu(isExpanded ? null : menuKey)}
                      className={`w-full min-h-[48px] px-3.5 py-3 text-base font-bold rounded-xl flex items-center justify-between transition-colors text-left active:bg-[#121A23] ${
                        isActive || isExpanded
                          ? "text-[#B8F000] bg-[#121A23]"
                          : "text-[#F8FAFC] hover:text-[#B8F000]"
                      }`}
                      aria-expanded={isExpanded}
                      aria-controls={`mobile-submenu-${menuKey}`}
                    >
                      <span>{link.name}</span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-[#B8F000]" : "text-[#A7B0BC]"
                        }`}
                      />
                    </button>

                    {/* Smooth Accordion Submenu */}
                    {isExpanded && (
                      <div
                        id={`mobile-submenu-${menuKey}`}
                        className="pl-3 pr-2 py-2 space-y-1 bg-[#0B0F14] rounded-lg my-1 border-l-2 border-[#B8F000] animate-in fade-in slide-in-from-top-1 duration-200"
                      >
                        {link.dropdown?.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setOpenMobileMenu(null);
                            }}
                            className="block min-h-[44px] px-3.5 py-2.5 rounded-lg text-sm active:bg-[#17212C] text-[#F8FAFC] active:text-[#B8F000] transition-colors"
                          >
                            <div className="font-semibold text-sm">{sub.name}</div>
                            {"desc" in sub && sub.desc && (
                              <div className="text-xs text-[#6B7280] mt-0.5">{sub.desc}</div>
                            )}
                          </Link>
                        ))}

                        {/* Direct overview link */}
                        <Link
                          href={link.href}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setOpenMobileMenu(null);
                          }}
                          className="flex items-center justify-between min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold text-[#B8F000] border-t border-[#26313D]/50 mt-1 pt-2 active:bg-[#17212C]"
                        >
                          <span>View all {link.name.toLowerCase()}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={link.name} className="rounded-xl overflow-hidden">
                  <Link
                    href={link.href}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setOpenMobileMenu(null);
                    }}
                    className={`flex items-center min-h-[48px] px-3.5 py-3 text-base font-bold rounded-xl transition-colors ${
                      isActive
                        ? "text-[#B8F000] bg-[#121A23]"
                        : "text-[#F8FAFC] active:bg-[#121A23]/60"
                    }`}
                  >
                    {link.name}
                  </Link>
                </div>
              );
            })}

            {/* Testimonials link */}
            <div className="rounded-xl overflow-hidden pt-1">
              <Link
                href="/testimonials"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOpenMobileMenu(null);
                }}
                className={`flex items-center min-h-[48px] px-3.5 py-3 text-base font-bold rounded-xl transition-colors ${
                  pathname === "/testimonials"
                    ? "text-[#B8F000] bg-[#121A23]"
                    : "text-[#F8FAFC] active:bg-[#121A23]/60"
                }`}
              >
                Testimonials
              </Link>
            </div>
          </div>

          {/* Mobile Drawer Bottom Quick Action Bar with Safe-Area Clearance */}
          <div
            className="border-t border-[#1F2937] bg-[#0B0F14] p-4 sm:p-5 space-y-3 shrink-0"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 rounded-xl bg-[#B8F000] active:bg-[#c7fb1e] text-[#07100A] text-center font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
            >
              <span>BOOK A FREE TRIAL</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  handleWhatsAppClick();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#121A23] border border-[#26313D] text-[#F8FAFC] text-xs font-bold active:scale-[0.98] transition-transform"
              >
                <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                <span>WhatsApp</span>
              </a>
              <a
                href={`tel:${ACADEMY_DATA.phone}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#121A23] border border-[#26313D] text-[#A7B0BC] text-xs font-bold active:scale-[0.98] transition-transform"
              >
                <Phone className="w-4 h-4 text-[#B8F000]" />
                <span>Call Desk</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

