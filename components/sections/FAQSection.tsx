"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { FAQS } from "@/data/faqs";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { getFAQSchema } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface FAQSectionProps {
  category?: string;
  limit?: number;
  showSchema?: boolean;
}

export function FAQSection({ category, limit, showSchema = true }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = category
    ? FAQS.filter((f) => f.category.toLowerCase() === category.toLowerCase())
    : FAQS;

  const displayFaqs = limit ? filteredFaqs.slice(0, limit) : filteredFaqs;

  return (
    <section className="py-24 lg:py-36 bg-[#07090D] relative border-b border-[#1F2937] select-none">
      {showSchema && (
        <SEOJsonLd
          schema={getFAQSchema(
            displayFaqs.map((f) => ({ question: f.question, answer: f.answer }))
          )}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left max-w-2xl mb-14 space-y-3">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase">
              10 // INTEL
            </span>
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#A8B0BA] uppercase">
              FREQUENTLY ASKED QUESTIONS
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.03em] uppercase leading-[0.95]">
            COMMON QUESTIONS <br />
            <span className="text-[#B8F000]">ANSWERED.</span>
          </h2>
          <p className="text-[#A8B0BA] text-sm sm:text-base">
            Everything you need to know about trial sessions, equipment, batch schedules, and coaching across our Kochi branches.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {displayFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id}
                className="bg-[#0B0F14] border border-[#1F2937] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#17212C] transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-[#F8FAFC] text-sm sm:text-base flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[#B8F000] shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#B8F000] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#A7B0BC] leading-relaxed border-t border-[#1F2937] bg-[#07090D]">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Clean WhatsApp Support Box */}
        <div className="mt-10 p-6 bg-[#0B0F14] border border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div>
            <h4 className="text-sm font-bold text-white">Have a question not listed here?</h4>
            <p className="text-xs text-[#A7B0BC] mt-0.5">
              Our admissions coaches are available on WhatsApp for direct batch guidance.
            </p>
          </div>

          <a
            href={buildWhatsAppUrl({ customMessage: "Hello SBA Academy! I have a question regarding batch timings and fees." })}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#11161D] hover:bg-[#17212C] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-[#1F2937] transition-colors shrink-0"
          >
            <MessageCircle className="w-4 h-4 text-[#22C55E]" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
}
