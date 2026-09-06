import { neon } from "@neondatabase/serverless";
import fs from "fs/promises";
import path from "path";

import { GALLERY_ITEMS, GalleryItem } from "@/data/gallery";
import { COACHES, Coach } from "@/data/coaches";
import { ACHIEVEMENTS, Achievement } from "@/data/achievements";
import { TESTIMONIALS, Testimonial } from "@/data/testimonials";
import { BLOG_POSTS, BlogPost } from "@/data/blog";

export type ContentSectionKey = "gallery" | "coaches" | "achievements" | "testimonials" | "blog";

const CONTENT_FILE_PATH = path.join(process.cwd(), "data", "site_content.json");

function getSql(): ReturnType<typeof neon> | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// Local JSON fallback store
async function readFallbackContent(): Promise<Record<string, unknown[]>> {
  try {
    const fileData = await fs.readFile(CONTENT_FILE_PATH, "utf-8");
    return JSON.parse(fileData);
  } catch {
    return {
      gallery: GALLERY_ITEMS,
      coaches: COACHES,
      achievements: ACHIEVEMENTS,
      testimonials: TESTIMONIALS,
      blog: BLOG_POSTS,
    };
  }
}

async function writeFallbackContent(content: Record<string, unknown[]>): Promise<void> {
  try {
    await fs.writeFile(CONTENT_FILE_PATH, JSON.stringify(content, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to fallback content file:", err);
  }
}

let isInitialized = false;

export async function initContentDb(): Promise<void> {
  const sql = getSql();
  if (!sql || isInitialized) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS site_content (
        section VARCHAR(64) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Check if initial sections exist, if not seed them
    const existing = (await sql`SELECT section FROM site_content;`) as unknown as Array<{ section: string }>;
    const existingSections = new Set(existing.map((r) => r.section));

    const defaults: Record<ContentSectionKey, unknown[]> = {
      gallery: GALLERY_ITEMS,
      coaches: COACHES,
      achievements: ACHIEVEMENTS,
      testimonials: TESTIMONIALS,
      blog: BLOG_POSTS,
    };

    for (const [sectionKey, defaultItems] of Object.entries(defaults)) {
      if (!existingSections.has(sectionKey)) {
        await sql`
          INSERT INTO site_content (section, data, updated_at)
          VALUES (${sectionKey}, ${JSON.stringify(defaultItems)}, NOW())
          ON CONFLICT (section) DO NOTHING;
        `;
      }
    }

    isInitialized = true;
  } catch (err) {
    console.error("Neon DB initContentDb error (falling back to local):", err);
  }
}

export async function getContentSection<T>(
  section: ContentSectionKey,
  defaultItems: T[]
): Promise<T[]> {
  const sql = getSql();

  if (sql) {
    try {
      await initContentDb();
      const rows = (await sql`
        SELECT data FROM site_content WHERE section = ${section} LIMIT 1;
      `) as unknown as Array<{ data: unknown }>;

      if (rows.length > 0 && rows[0].data) {
        const raw = rows[0].data;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) return parsed as T[];
      }
    } catch (err) {
      console.error(`Error querying section ${section} from Neon DB:`, err);
    }
  }

  // Fallback to local JSON or hardcoded defaults
  const fallback = await readFallbackContent();
  if (fallback[section] && Array.isArray(fallback[section])) {
    return fallback[section] as T[];
  }
  return defaultItems;
}

export async function saveContentSection<T>(
  section: ContentSectionKey,
  items: T[]
): Promise<void> {
  const sql = getSql();
  const now = new Date().toISOString();

  if (sql) {
    try {
      await initContentDb();
      await sql`
        INSERT INTO site_content (section, data, updated_at)
        VALUES (${section}, ${JSON.stringify(items)}, ${now})
        ON CONFLICT (section) DO UPDATE
        SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;
      `;
    } catch (err) {
      console.error(`Failed to save section ${section} to Neon DB:`, err);
    }
  }

  // Sync to fallback file
  const fallback = await readFallbackContent();
  fallback[section] = items;
  await writeFallbackContent(fallback);
}

// Getters for specific website components
export async function getGalleryItems(): Promise<GalleryItem[]> {
  return getContentSection<GalleryItem>("gallery", GALLERY_ITEMS);
}

export async function getCoaches(): Promise<Coach[]> {
  return getContentSection<Coach>("coaches", COACHES);
}

export async function getAchievements(): Promise<Achievement[]> {
  return getContentSection<Achievement>("achievements", ACHIEVEMENTS);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return getContentSection<Testimonial>("testimonials", TESTIMONIALS);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return getContentSection<BlogPost>("blog", BLOG_POSTS);
}
