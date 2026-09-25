export interface Achievement {
  id: string;
  year: string;
  title: string;
  category: "State Championship" | "District Title" | "National Qualification" | "Academy Milestone";
  athleteOrTeam: string;
  description: string;
  badge: string;
  image?: string;
}

/**
 * Tournament achievements and titles are 100% database-driven (Neon PostgreSQL `site_content` table).
 * Static hardcoded achievement arrays are deprecated and removed.
 */
export const ACHIEVEMENTS: Achievement[] = [];
