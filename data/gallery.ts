export interface GalleryItem {
  id: string;
  title: string;
  category: "Courts & Arena" | "Training Drills" | "Tournaments" | "Juniors & Camps" | "Coaching Sessions";
  image: string;
  caption: string;
  branch: string;
}

/**
 * Visual gallery assets are 100% database-driven (Neon PostgreSQL `site_content` table).
 * Static hardcoded gallery arrays are deprecated and removed.
 */
export const GALLERY_ITEMS: GalleryItem[] = [];
