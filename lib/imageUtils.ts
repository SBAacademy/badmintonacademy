/**
 * Utility functions for robust image URL handling across SBA Badminton Academy web components.
 */

export function normalizeImageSrc(src?: string | null): string {
  if (!src || typeof src !== "string") {
    return "/images/placeholder.jpg";
  }

  const clean = src.trim();

  // If URL contains an internal API image path (e.g. from app upload), strip any origin/host
  const apiImagesIdx = clean.indexOf("/api/images/");
  if (apiImagesIdx !== -1) {
    return clean.substring(apiImagesIdx);
  }

  // Also handle /uploads/ if present
  const uploadsIdx = clean.indexOf("/uploads/");
  if (uploadsIdx !== -1) {
    return clean.substring(uploadsIdx);
  }

  return clean;
}

export function isInternalImage(src?: string | null): boolean {
  if (!src) return false;
  const normalized = normalizeImageSrc(src);
  return (
    normalized.startsWith("/api/") ||
    normalized.startsWith("/uploads/") ||
    normalized.startsWith("data:")
  );
}
