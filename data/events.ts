export type EventType =
  | "TOURNAMENT"
  | "COMPETITION"
  | "CHAMPIONSHIP"
  | "TRAINING_CAMP"
  | "WORKSHOP"
  | "ACADEMY_EVENT"
  | "SPECIAL_SESSION"
  | "OTHER";

export type EventStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  eventType: EventType;
  eventDate: string; // ISO date string "YYYY-MM-DD"
  startTime?: string | null;
  endTime?: string | null;
  venue: string;
  centreSlug?: string | null;
  centreName?: string | null;
  image?: string | null;
  registrationUrl?: string | null;
  contact?: string | null;
  status: EventStatus;
  isFeatured: boolean;
  isPublished: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  TOURNAMENT: "Tournament",
  COMPETITION: "Competition",
  CHAMPIONSHIP: "Championship",
  TRAINING_CAMP: "Training Camp",
  WORKSHOP: "Workshop",
  ACADEMY_EVENT: "Academy Event",
  SPECIAL_SESSION: "Special Session",
  OTHER: "Event",
};

export const EVENT_TYPE_BADGES: Record<EventType, { label: string; icon: string; bg: string; text: string }> = {
  TOURNAMENT: {
    label: "TOURNAMENT",
    icon: "🏸",
    bg: "bg-[#B8F000]/15 border-[#B8F000]/30",
    text: "text-[#B8F000]",
  },
  COMPETITION: {
    label: "COMPETITION",
    icon: "⚡",
    bg: "bg-amber-500/15 border-amber-500/30",
    text: "text-amber-400",
  },
  CHAMPIONSHIP: {
    label: "CHAMPIONSHIP",
    icon: "🏆",
    bg: "bg-purple-500/15 border-purple-500/30",
    text: "text-purple-300",
  },
  TRAINING_CAMP: {
    label: "TRAINING CAMP",
    icon: "🔥",
    bg: "bg-emerald-500/15 border-emerald-500/30",
    text: "text-emerald-400",
  },
  WORKSHOP: {
    label: "WORKSHOP",
    icon: "🎓",
    bg: "bg-cyan-500/15 border-cyan-500/30",
    text: "text-cyan-300",
  },
  ACADEMY_EVENT: {
    label: "ACADEMY EVENT",
    icon: "✨",
    bg: "bg-blue-500/15 border-blue-500/30",
    text: "text-blue-300",
  },
  SPECIAL_SESSION: {
    label: "SPECIAL SESSION",
    icon: "🎯",
    bg: "bg-rose-500/15 border-rose-500/30",
    text: "text-rose-300",
  },
  OTHER: {
    label: "EVENT",
    icon: "📅",
    bg: "bg-slate-500/15 border-slate-500/30",
    text: "text-slate-300",
  },
};

export const EVENT_STATUS_LABELS: Record<EventStatus, { label: string; bg: string; text: string; dot: string }> = {
  UPCOMING: {
    label: "UPCOMING",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  ONGOING: {
    label: "ONGOING",
    bg: "bg-[#B8F000]/15 border-[#B8F000]/40",
    text: "text-[#B8F000]",
    dot: "bg-[#B8F000] animate-pulse",
  },
  COMPLETED: {
    label: "COMPLETED",
    bg: "bg-slate-700/30 border-slate-700",
    text: "text-slate-400",
    dot: "bg-slate-500",
  },
  CANCELLED: {
    label: "CANCELLED",
    bg: "bg-rose-500/10 border-rose-500/30",
    text: "text-rose-400",
    dot: "bg-rose-400",
  },
};

/**
 * Automatically resolves the dynamic display status based on date/time
 * while strictly preserving manually set "CANCELLED" state.
 */
export function resolveEventDisplayStatus(
  status: EventStatus,
  eventDate: string
): EventStatus {
  if (status === "CANCELLED") {
    return "CANCELLED";
  }

  // Parse event date (YYYY-MM-DD)
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  if (!eventDate) return status;

  const cleanDate = eventDate.split("T")[0];

  if (cleanDate > todayStr) {
    return "UPCOMING";
  } else if (cleanDate < todayStr) {
    return "COMPLETED";
  } else {
    // Today
    return "ONGOING";
  }
}

/**
 * Format date nicely for sports editorial presentation:
 * e.g. "October 12, 2026"
 */
export function formatEventDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
