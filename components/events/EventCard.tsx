"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  ExternalLink,
  Star,
  Trophy,
} from "lucide-react";
import {
  EventItem,
  EVENT_TYPE_BADGES,
  EVENT_STATUS_LABELS,
  formatEventDate,
} from "@/data/events";

interface EventCardProps {
  event: EventItem;
  featuredLayout?: boolean;
}

export function EventCard({ event, featuredLayout = false }: EventCardProps) {
  const badge = EVENT_TYPE_BADGES[event.eventType] || EVENT_TYPE_BADGES.OTHER;
  const statusConfig = EVENT_STATUS_LABELS[event.status] || EVENT_STATUS_LABELS.UPCOMING;

  if (featuredLayout) {
    return (
      <div className="relative bg-[#0F141C] border border-[#B8F000]/40 rounded-3xl overflow-hidden group hover:border-[#B8F000] transition-all duration-300 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Visual Column */}
          <div className="lg:col-span-6 relative min-h-[260px] sm:min-h-[320px] lg:min-h-full overflow-hidden bg-[#161F2C]">
            <Image
              src={event.image || "/images/badminton-arena.jpg"}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F141C] via-[#0F141C]/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0F141C]" />

            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-mono font-black tracking-widest text-[#07090D] bg-[#B8F000] uppercase rounded-md shadow-md flex items-center gap-1.5">
                <Star className="w-3 h-3 fill-black" />
                FEATURED TOURNAMENT
              </span>

              <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-md border backdrop-blur-md ${badge.bg} ${badge.text}`}>
                {badge.icon} {badge.label}
              </span>
            </div>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-full border flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.text}`}>
                  <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                  {statusConfig.label}
                </span>

                {event.centreName && (
                  <span className="text-[11px] font-mono text-[#A8B0BA] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#B8F000]" />
                    {event.centreName}
                  </span>
                )}
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white group-hover:text-[#B8F000] transition-colors leading-[1.05] uppercase tracking-tight">
                {event.title}
              </h3>

              {event.description && (
                <p className="text-sm text-[#A8B0BA] leading-relaxed line-clamp-3 font-normal">
                  {event.description}
                </p>
              )}

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1F2937] text-xs">
                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-[#A8B0BA] uppercase">DATE &amp; TIME</div>
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span>{formatEventDate(event.eventDate)}</span>
                  </div>
                  {event.startTime && (
                    <div className="text-[11px] text-[#A8B0BA] font-mono pl-5">
                      {event.startTime} {event.endTime ? `– ${event.endTime}` : ""}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="font-mono text-[10px] text-[#A8B0BA] uppercase">LOCATION</div>
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#B8F000]" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#1F2937]">
              <Link
                href={`/events/${event.slug}`}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md group/btn"
              >
                <span>VIEW EVENT DETAILS</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>

              {event.registrationUrl && (
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-[#161F2C] hover:bg-[#1E293B] border border-[#1F2937] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#B8F000]" />
                  <span>REGISTER NOW</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Card Layout
  return (
    <div className="relative bg-[#0F141C] border border-[#1F2937] hover:border-[#B8F000]/60 rounded-3xl overflow-hidden group transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:-translate-y-1">
      {/* Visual Aspect */}
      <div>
        <div className="relative aspect-[16/10] overflow-hidden bg-[#161F2C]">
          <Image
            src={event.image || "/images/badminton-arena.jpg"}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F141C] via-transparent to-transparent opacity-80" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-md border backdrop-blur-md ${badge.bg} ${badge.text}`}>
              {badge.icon} {badge.label}
            </span>

            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-full border backdrop-blur-md flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
          </div>

          {event.isFeatured && (
            <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-yellow-500 text-black text-[9px] font-mono font-black uppercase rounded shadow flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-black" /> FEATURED
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-3.5 text-left">
          {event.centreName && (
            <div className="font-mono text-[10px] text-[#B8F000] uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{event.centreName}</span>
            </div>
          )}

          <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-[#B8F000] transition-colors leading-tight uppercase tracking-tight line-clamp-2">
            {event.title}
          </h3>

          <div className="space-y-1.5 text-xs text-[#A8B0BA] border-t border-[#1F2937] pt-3">
            <div className="flex items-center gap-2 text-white font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#B8F000] shrink-0" />
              <span>{formatEventDate(event.eventDate)}</span>
            </div>

            {event.startTime && (
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#A8B0BA]">
                <Clock className="w-3.5 h-3.5 text-[#A8B0BA] shrink-0" />
                <span>{event.startTime} {event.endTime ? `– ${event.endTime}` : ""}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-[#A8B0BA] truncate">
              <MapPin className="w-3.5 h-3.5 text-[#A8B0BA] shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>

          {event.description && (
            <p className="text-xs text-[#A8B0BA] line-clamp-2 leading-relaxed pt-1">
              {event.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-5 sm:p-6 pt-0">
        <div className="pt-3 border-t border-[#1F2937] flex items-center justify-between gap-3">
          <Link
            href={`/events/${event.slug}`}
            className="text-xs font-black text-[#B8F000] hover:text-white uppercase tracking-wider inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-all"
          >
            <span>VIEW EVENT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {event.registrationUrl && (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-[#A8B0BA] hover:text-white inline-flex items-center gap-1 uppercase"
            >
              <span>Register</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
