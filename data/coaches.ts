export interface CoachPhoto {
  id: string;
  coachId: string;
  imageUrl: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Coach {
  id: string;
  slug?: string;
  name: string;
  role: string;
  certifications: string[];
  experienceYears: number;
  specialization: string;
  bio: string;
  primaryBranch: string;
  primaryCentre?: string;
  achievements: string[];
  image: string; // Primary cover photo (preserved for 100% backward compatibility)
  images?: string[]; // Array of photo URLs in sort order
  photos?: CoachPhoto[]; // Full photo entities with metadata
  whatsappNumber?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  isPublished?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_COACH_IMAGE = "/images/training-coach.jpg";

/**
 * Returns the primary photo URL for a coach, falling back to photos[0], image, or default avatar.
 */
export function getCoachPrimaryPhoto(coach?: Partial<Coach> | null): string {
  if (!coach) return DEFAULT_COACH_IMAGE;
  if (coach.photos && coach.photos.length > 0) {
    const primary = coach.photos.find((p) => p.isPrimary);
    if (primary && primary.imageUrl && primary.imageUrl.trim()) {
      return primary.imageUrl.trim();
    }
    const first = coach.photos.find((p) => p.imageUrl && p.imageUrl.trim());
    if (first) return first.imageUrl.trim();
  }
  if (coach.images && coach.images.length > 0) {
    const firstImg = coach.images.find((img) => img && img.trim());
    if (firstImg) return firstImg.trim();
  }
  if (coach.image && coach.image.trim()) {
    return coach.image.trim();
  }
  return DEFAULT_COACH_IMAGE;
}

/**
 * Returns all photo URLs for a coach in sortOrder.
 */
export function getCoachPhotosList(coach?: Partial<Coach> | null): string[] {
  if (!coach) return [DEFAULT_COACH_IMAGE];
  if (coach.photos && coach.photos.length > 0) {
    const sorted = [...coach.photos].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
    const urls = sorted.map((p) => p.imageUrl).filter((url) => Boolean(url && url.trim()));
    if (urls.length > 0) return urls;
  }
  if (coach.images && coach.images.length > 0) {
    const filtered = coach.images.filter((img) => Boolean(img && img.trim()));
    if (filtered.length > 0) return filtered;
  }
  if (coach.image && coach.image.trim()) {
    return [coach.image.trim()];
  }
  return [DEFAULT_COACH_IMAGE];
}

/**
 * Normalizes phone/WhatsApp numbers to standard international format without +, spaces, or dashes.
 * e.g., "+91 98460 12345" -> "919846012345"
 * e.g., "9846012345" (10 digits) -> "919846012345"
 */
export function normalizeWhatsAppNumber(input?: string | null): string {
  if (!input || typeof input !== "string") return "";
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Formats a normalized international number for human-friendly display.
 * e.g., "919846012345" -> "+91 98460 12345"
 */
export function formatWhatsAppDisplay(number?: string | null): string {
  if (!number || typeof number !== "string") return "";
  const cleaned = number.replace(/\D/g, "");
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return number;
}

/**
 * Authoritative coaches data is 100% database-driven (Neon PostgreSQL `coaches` and `coach_photos` tables).
 * Static hardcoded coach arrays are deprecated and removed.
 */
export const COACHES: Coach[] = [];
