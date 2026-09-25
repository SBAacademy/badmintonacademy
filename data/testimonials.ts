export interface Testimonial {
  id: string;
  name: string;
  role: string;
  branch: string;
  rating: number;
  content: string;
  highlight: string;
  avatarText: string;
}

/**
 * Testimonials and parent reviews are 100% database-driven (Neon PostgreSQL `site_content` table).
 * Static hardcoded testimonial arrays are deprecated and removed.
 */
export const TESTIMONIALS: Testimonial[] = [];
