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
    <section className="py-20 lg:py-28 bg-[#080B10] relative border-b border-[#26313D]">
      {showSchema && (
        <SEOJsonLd
          schema={getFAQSchema(
            displayFaqs.map((f) => ({ question: f.question, answer: f.answer }))
          )}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="w-5 h-0.5 bg-[#B8F000]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#B8F000]">
              FREQUENTLY ASKED QUESTIONS
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#F8FAFC] tracking-tight uppercase leading-tight">
            Common Questions Answered
          </h2>
          <p className="text-[#A7B0BC] text-sm sm:text-base">
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
                className="rounded-2xl bg-[#121A23] border border-[#26313D] overflow-hidden transition-colors"
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
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#A7B0BC] leading-relaxed border-t border-[#26313D]/60 bg-[#0E141B]/60">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Clean WhatsApp Support Box */}
        <div className="mt-10 p-6 rounded-2xl bg-[#121A23] border border-[#26313D] flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
          <div>
            <h4 className="text-sm font-bold text-[#F8FAFC]">Have a question not listed here?</h4>
            <p className="text-xs text-[#A7B0BC] mt-0.5">
              Our admissions coaches are available on WhatsApp for direct batch guidance.
            </p>
          </div>

          <a
            href={buildWhatsAppUrl({ customMessage: "Hello S&A Academy! I have a question regarding batch timings and fees." })}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#080B10] hover:bg-[#17212C] text-[#F8FAFC] text-xs font-bold flex items-center gap-2 border border-[#26313D] transition-colors shrink-0"
          >
            <MessageCircle className="w-4 h-4 text-[#22C55E]" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
}
