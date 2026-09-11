import { neon } from "@neondatabase/serverless";
import fs from "fs/promises";
import path from "path";

import { GALLERY_ITEMS, GalleryItem } from "@/data/gallery";
import { COACHES, Coach, normalizeWhatsAppNumber } from "@/data/coaches";
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
      coaches: [],
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

    // Ensure coaches table has modern columns
    await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT '{}';`;
    await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;`;
    await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;`;
    await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(32);`;
    await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS slug VARCHAR(128);`;
    await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();`;

    isInitialized = true;
  } catch (err) {
    console.error("Neon DB initContentDb error (falling back to local):", err);
  }
}

export const DEFAULT_COACH_IMAGE = "/images/training-coach.jpg";

export function ensureCoachImage(image?: string | null): string {
  if (!image || typeof image !== "string" || !image.trim()) {
    return DEFAULT_COACH_IMAGE;
  }
  const trimmed = image.trim();
  const apiIdx = trimmed.indexOf("/api/images/");
  if (apiIdx !== -1) {
    return trimmed.substring(apiIdx);
  }
  return trimmed;
}

export function mapBranchToCentreSlug(branch?: string | null): string {
  if (!branch) return "kadavanthra";
  const b = branch.toLowerCase();
  if (b.includes("edappally")) return "edappally";
  if (b.includes("kakkanad")) return "kakkanad";
  return "kadavanthra";
}

export function mapCentreSlugToBranch(slug?: string | null): string {
  if (!slug) return "Kadavanthra (Headquarters)";
  const s = slug.toLowerCase();
  if (s.includes("edappally")) return "Edappally Branch";
  if (s.includes("kakkanad")) return "Kakkanad Branch";
  return "Kadavanthra (Headquarters)";
}

function sanitizeItemImageUrls<T>(item: T): T {
  if (!item || typeof item !== "object") return item;
  const clone = { ...(item as Record<string, unknown>) };
  for (const key of ["image", "src", "url", "avatar", "photo"]) {
    if (typeof clone[key] === "string") {
      const val = clone[key] as string;
      const apiIdx = val.indexOf("/api/images/");
      if (apiIdx !== -1) {
        clone[key] = val.substring(apiIdx);
      }
    }
  }
  return clone as T;
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
        if (Array.isArray(parsed)) return (parsed as T[]).map(sanitizeItemImageUrls);
      }
    } catch (err) {
      console.error(`Error querying section ${section} from Neon DB:`, err);
    }
  }

  // Fallback to local JSON or hardcoded defaults
  const fallback = await readFallbackContent();
  if (fallback[section] && Array.isArray(fallback[section])) {
    return (fallback[section] as T[]).map(sanitizeItemImageUrls);
  }
  return defaultItems.map(sanitizeItemImageUrls);
}

export async function saveContentSection<T>(
  section: ContentSectionKey,
  items: T[]
): Promise<void> {
  const sql = getSql();
  const now = new Date().toISOString();
  const sanitizedItems = items.map(sanitizeItemImageUrls);

  if (sql) {
    try {
      await initContentDb();
      await sql`
        INSERT INTO site_content (section, data, updated_at)
        VALUES (${section}, ${JSON.stringify(sanitizedItems)}, ${now})
        ON CONFLICT (section) DO UPDATE
        SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;
      `;

      // If updating coaches via generic CMS, also sync each coach to the relational coaches table
      if (section === "coaches" && Array.isArray(sanitizedItems)) {
        for (const rawItem of sanitizedItems as unknown as Coach[]) {
          if (rawItem && rawItem.name && rawItem.role) {
            const cleanId = (rawItem.id || rawItem.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/(^-|-$)/g, "");
            const centreSlug = mapBranchToCentreSlug(rawItem.primaryBranch || rawItem.primaryCentre);
            const certs = Array.isArray(rawItem.certifications) ? rawItem.certifications : [];
            const achs = Array.isArray(rawItem.achievements) ? rawItem.achievements : [];
            const exp = Number(rawItem.experienceYears) || 5;
            const img = rawItem.image && rawItem.image.trim() ? rawItem.image.trim() : null;
            const status = rawItem.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
            const isPub = rawItem.isPublished !== false;

            const rawSlug = (rawItem.slug || rawItem.id || rawItem.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/(^-|-$)/g, "");
            const slug = rawSlug || cleanId;
            const whatsappNum = rawItem.whatsappNumber ? normalizeWhatsAppNumber(rawItem.whatsappNumber) : null;

            await sql`
              INSERT INTO coaches (
                id, slug, name, role, bio, certifications, achievements,
                experience_years, specialization, primary_centre,
                image_url, whatsapp_number, status, is_published, display_order, created_at, updated_at
              ) VALUES (
                ${cleanId}, ${slug}, ${rawItem.name.trim()}, ${rawItem.role.trim()},
                ${rawItem.bio || "Dedicated badminton coach at S&A Badminton Academy."},
                ${certs}, ${achs}, ${exp}, ${rawItem.specialization || "Badminton Coaching"},
                ${centreSlug}, ${img}, ${whatsappNum}, ${status}, ${isPub},
                ${Number(rawItem.displayOrder) || 0}, NOW(), NOW()
              ) ON CONFLICT (id) DO UPDATE SET
                slug = COALESCE(EXCLUDED.slug, coaches.slug),
                name = EXCLUDED.name,
                role = EXCLUDED.role,
                bio = EXCLUDED.bio,
                certifications = EXCLUDED.certifications,
                achievements = EXCLUDED.achievements,
                experience_years = EXCLUDED.experience_years,
                specialization = EXCLUDED.specialization,
                primary_centre = EXCLUDED.primary_centre,
                image_url = COALESCE(EXCLUDED.image_url, coaches.image_url),
                whatsapp_number = EXCLUDED.whatsapp_number,
                status = EXCLUDED.status,
                is_published = EXCLUDED.is_published,
                updated_at = NOW();
            `;
          }
        }
      }
    } catch (err) {
      console.error(`Failed to save section ${section} to Neon DB:`, err);
    }
  }

  // Sync to fallback file
  const fallback = await readFallbackContent();
  fallback[section] = sanitizedItems;
  await writeFallbackContent(fallback);
}

// ============================================================================
// AUTHORITATIVE COACHES DATA LAYER (PostgreSQL coaches is single source of truth)
// ============================================================================

export async function getCoaches(options: { includeUnpublished?: boolean } = {}): Promise<Coach[]> {
  const { includeUnpublished = false } = options;
  const sql = getSql();

  if (sql) {
    try {
      await initContentDb();
      const rows = (await sql`
        SELECT 
          c.id,
          c.slug,
          c.name,
          c.role,
          c.bio,
          c.certifications,
          c.achievements,
          c.experience_years as "experienceYears",
          c.specialization,
          c.primary_centre as "primaryCentre",
          cen.name as "centreName",
          c.image_url as "image",
          c.whatsapp_number as "whatsappNumber",
          c.status,
          c.is_published as "isPublished",
          c.display_order as "displayOrder",
          c.created_at as "createdAt",
          c.updated_at as "updatedAt"
        FROM coaches c
        LEFT JOIN centres cen ON c.primary_centre = cen.slug
        ${includeUnpublished ? sql`WHERE c.status != 'INACTIVE'` : sql`WHERE c.status = 'ACTIVE' AND c.is_published = TRUE`}
        ORDER BY c.display_order ASC, c.experience_years DESC, c.created_at DESC;
      `) as unknown as Record<string, unknown>[];

      if (Array.isArray(rows)) {
        return rows.map((r) => ({
          id: String(r.id),
          slug: r.slug ? String(r.slug) : String(r.id),
          name: String(r.name),
          role: String(r.role),
          bio: String(r.bio || ""),
          certifications: Array.isArray(r.certifications) ? (r.certifications as string[]) : [],
          achievements: Array.isArray(r.achievements) ? (r.achievements as string[]) : [],
          experienceYears: Number(r.experienceYears) || 5,
          specialization: String(r.specialization || "Badminton Coaching & Conditioning"),
          primaryCentre: r.primaryCentre ? String(r.primaryCentre) : undefined,
          primaryBranch: r.centreName ? String(r.centreName) : mapCentreSlugToBranch(r.primaryCentre as string),
          image: ensureCoachImage(r.image as string),
          whatsappNumber: r.whatsappNumber ? String(r.whatsappNumber) : null,
          status: (r.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
          isPublished: r.isPublished !== false,
          displayOrder: Number(r.displayOrder) || 0,
          createdAt: r.createdAt ? String(r.createdAt) : undefined,
          updatedAt: r.updatedAt ? String(r.updatedAt) : undefined,
        }));
      }
      return [];
    } catch (err) {
      console.error("Failed to query coaches table from Neon DB:", err);
      return [];
    }
  }

  // Fallback to local file ONLY if DATABASE_URL is not configured at all (local offline dev)
  const fallback = await readFallbackContent();
  if (fallback.coaches && Array.isArray(fallback.coaches)) {
    const list = (fallback.coaches as Coach[]).map((c) => ({
      ...c,
      slug: c.slug || c.id,
      image: ensureCoachImage(c.image),
      isPublished: c.isPublished !== false,
      status: c.status || "ACTIVE",
    }));
    return includeUnpublished
      ? list.filter((c) => c.status !== "INACTIVE")
      : list.filter((c) => c.status === "ACTIVE" && c.isPublished !== false);
  }
  return [];
}

export async function getCoachBySlug(slug: string): Promise<Coach | null> {
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
  const sql = getSql();

  if (sql) {
    try {
      await initContentDb();
      const rows = (await sql`
        SELECT 
          c.id,
          c.slug,
          c.name,
          c.role,
          c.bio,
          c.certifications,
          c.achievements,
          c.experience_years as "experienceYears",
          c.specialization,
          c.primary_centre as "primaryCentre",
          cen.name as "centreName",
          c.image_url as "image",
          c.whatsapp_number as "whatsappNumber",
          c.status,
          c.is_published as "isPublished",
          c.display_order as "displayOrder",
          c.created_at as "createdAt",
          c.updated_at as "updatedAt"
        FROM coaches c
        LEFT JOIN centres cen ON c.primary_centre = cen.slug
        WHERE (c.slug = ${cleanSlug} OR c.id = ${cleanSlug})
          AND c.status = 'ACTIVE'
          AND c.is_published = TRUE
        LIMIT 1;
      `) as unknown as Record<string, unknown>[];

      if (Array.isArray(rows) && rows.length > 0) {
        const r = rows[0];
        return {
          id: String(r.id),
          slug: r.slug ? String(r.slug) : String(r.id),
          name: String(r.name),
          role: String(r.role),
          bio: String(r.bio || ""),
          certifications: Array.isArray(r.certifications) ? (r.certifications as string[]) : [],
          achievements: Array.isArray(r.achievements) ? (r.achievements as string[]) : [],
          experienceYears: Number(r.experienceYears) || 5,
          specialization: String(r.specialization || "Badminton Coaching & Conditioning"),
          primaryCentre: r.primaryCentre ? String(r.primaryCentre) : undefined,
          primaryBranch: r.centreName ? String(r.centreName) : mapCentreSlugToBranch(r.primaryCentre as string),
          image: ensureCoachImage(r.image as string),
          whatsappNumber: r.whatsappNumber ? String(r.whatsappNumber) : null,
          status: (r.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
          isPublished: r.isPublished !== false,
          displayOrder: Number(r.displayOrder) || 0,
          createdAt: r.createdAt ? String(r.createdAt) : undefined,
          updatedAt: r.updatedAt ? String(r.updatedAt) : undefined,
        };
      }
    } catch (err) {
      console.error(`Failed to query coach by slug "${cleanSlug}":`, err);
    }
  }

  // Fallback to in-memory/CMS cache
  const all = await getCoaches();
  return all.find((c) => (c.slug || c.id) === cleanSlug) || null;
}

export async function saveCoachRecord(coachData: Partial<Coach>): Promise<Coach> {
  const sql = getSql();
  const cleanId = (
    coachData.id || (coachData.name ? coachData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "")
  ).replace(/(^-|-$)/g, "");

  if (!cleanId) {
    throw new Error("Coach ID or Name is required to save coach record.");
  }

  // If partial update, merge with existing record if available
  let current: Partial<Coach> | null = null;
  if (sql) {
    try {
      await initContentDb();
      const existing = (await sql`SELECT * FROM coaches WHERE id = ${cleanId} LIMIT 1;`) as unknown as Array<Record<string, unknown>>;
      if (existing.length > 0) {
        current = {
          slug: existing[0].slug ? String(existing[0].slug) : cleanId,
          name: String(existing[0].name),
          role: String(existing[0].role),
          bio: String(existing[0].bio || ""),
          experienceYears: Number(existing[0].experience_years) || 5,
          specialization: String(existing[0].specialization || ""),
          primaryCentre: String(existing[0].primary_centre || "kadavanthra"),
          image: existing[0].image_url ? String(existing[0].image_url) : undefined,
          whatsappNumber: existing[0].whatsapp_number ? String(existing[0].whatsapp_number) : null,
          certifications: Array.isArray(existing[0].certifications) ? (existing[0].certifications as string[]) : [],
          achievements: Array.isArray(existing[0].achievements) ? (existing[0].achievements as string[]) : [],
          status: (existing[0].status as "ACTIVE" | "INACTIVE") || "ACTIVE",
          isPublished: existing[0].is_published !== false,
          displayOrder: Number(existing[0].display_order) || 0,
        };
      }
    } catch (e) {
      console.warn("Could not fetch existing coach record for merge:", e);
    }
  }

  const name = (coachData.name || current?.name || "Coaching Faculty").trim();
  const role = (coachData.role || current?.role || "Badminton Coach").trim();
  const bio = coachData.bio !== undefined ? coachData.bio.trim() : (current?.bio || "Dedicated badminton coach at S&A Badminton Academy.");
  const centreSlug = mapBranchToCentreSlug(coachData.primaryBranch || coachData.primaryCentre || current?.primaryCentre);
  const certs = Array.isArray(coachData.certifications)
    ? coachData.certifications.filter(Boolean)
    : current?.certifications || [];
  const achs = Array.isArray(coachData.achievements)
    ? coachData.achievements.filter(Boolean)
    : current?.achievements || [];
  const exp = Number(coachData.experienceYears ?? current?.experienceYears) || 5;
  const rawImg = coachData.image !== undefined ? coachData.image : current?.image;
  const img = rawImg && rawImg.trim() ? rawImg.trim() : null;
  const status = coachData.status || current?.status || "ACTIVE";
  const isPub = coachData.isPublished !== undefined ? coachData.isPublished : (current?.isPublished !== false);
  const order = Number(coachData.displayOrder ?? current?.displayOrder) || 0;
  const now = new Date().toISOString();

  const rawSlug = (coachData.slug || current?.slug || cleanId).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slug = rawSlug || cleanId;
  const rawWhatsApp = coachData.whatsappNumber !== undefined ? coachData.whatsappNumber : current?.whatsappNumber;
  const whatsappNumber = rawWhatsApp ? normalizeWhatsAppNumber(rawWhatsApp) : null;

  if (sql) {
    await initContentDb();
    await sql`
      INSERT INTO coaches (
        id, slug, name, role, bio, certifications, achievements,
        experience_years, specialization, primary_centre,
        image_url, whatsapp_number, status, is_published, display_order, created_at, updated_at
      ) VALUES (
        ${cleanId}, ${slug}, ${name}, ${role},
        ${bio},
        ${certs}, ${achs}, ${exp}, ${coachData.specialization || current?.specialization || "Badminton Coaching"},
        ${centreSlug}, ${img}, ${whatsappNumber}, ${status}, ${isPub}, ${order}, NOW(), NOW()
      ) ON CONFLICT (id) DO UPDATE SET
        slug = COALESCE(EXCLUDED.slug, coaches.slug),
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        bio = EXCLUDED.bio,
        certifications = EXCLUDED.certifications,
        achievements = EXCLUDED.achievements,
        experience_years = EXCLUDED.experience_years,
        specialization = EXCLUDED.specialization,
        primary_centre = EXCLUDED.primary_centre,
        image_url = EXCLUDED.image_url,
        whatsapp_number = EXCLUDED.whatsapp_number,
        status = EXCLUDED.status,
        is_published = EXCLUDED.is_published,
        display_order = EXCLUDED.display_order,
        updated_at = NOW();
    `;
  }

  const savedCoach: Coach = {
    id: cleanId,
    slug,
    name,
    role,
    bio,
    certifications: certs,
    achievements: achs,
    experienceYears: exp,
    specialization: coachData.specialization || current?.specialization || "Badminton Coaching",
    primaryCentre: centreSlug,
    primaryBranch: coachData.primaryBranch || mapCentreSlugToBranch(centreSlug),
    image: ensureCoachImage(img),
    whatsappNumber,
    status,
    isPublished: isPub,
    displayOrder: order,
    updatedAt: now,
  };

  // Synchronize downstream to site_content compatibility layer
  try {
    const allCoaches = await getCoaches({ includeUnpublished: true });
    if (sql) {
      await sql`
        INSERT INTO site_content (section, data, updated_at)
        VALUES ('coaches', ${JSON.stringify(allCoaches)}, NOW())
        ON CONFLICT (section) DO UPDATE
        SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;
      `;
    }
    const fallback = await readFallbackContent();
    fallback.coaches = allCoaches;
    await writeFallbackContent(fallback);
  } catch (syncErr) {
    console.warn("Downstream site_content sync warning:", syncErr);
  }

  return savedCoach;
}

export async function deleteCoachRecord(
  id: string,
  softDelete = false
): Promise<{ success: boolean; softDeleted: boolean; message: string }> {
  const sql = getSql();

  if (!sql) {
    // Fallback: Remove from JSON fallback
    const fallback = await readFallbackContent();
    if (fallback.coaches) {
      fallback.coaches = (fallback.coaches as Array<{ id: string }>).filter((c) => c.id !== id);
      await writeFallbackContent(fallback);
    }
    return { success: true, softDeleted: false, message: "Coach removed from fallback store." };
  }

  await initContentDb();

  // Check if coach is referenced by batches, sessions, trials, or performance assessments
  let isReferenced = false;
  try {
    const batches = (await sql`SELECT id FROM batches WHERE assigned_coach_id = ${id} LIMIT 1;`) as unknown as Array<{ id: string }>;
    const trials = (await sql`SELECT id FROM free_trials WHERE assigned_coach_id = ${id} LIMIT 1;`) as unknown as Array<{ id: string }>;
    const sessions = (await sql`SELECT id FROM sessions WHERE coach_id = ${id} LIMIT 1;`) as unknown as Array<{ id: string }>;
    const assessments = (await sql`SELECT id FROM performance_assessments WHERE coach_id = ${id} LIMIT 1;`) as unknown as Array<{ id: string }>;
    if (batches.length > 0 || trials.length > 0 || sessions.length > 0 || assessments.length > 0) {
      isReferenced = true;
    }
  } catch (checkErr) {
    console.warn("Reference check warning:", checkErr);
  }

  if (softDelete || isReferenced) {
    await sql`
      UPDATE coaches
      SET status = 'INACTIVE', is_published = FALSE, updated_at = NOW()
      WHERE id = ${id};
    `;
  } else {
    await sql`DELETE FROM coaches WHERE id = ${id};`;
  }

  // Downstream sync to site_content
  try {
    const allCoaches = await getCoaches({ includeUnpublished: true });
    await sql`
      INSERT INTO site_content (section, data, updated_at)
      VALUES ('coaches', ${JSON.stringify(allCoaches)}, NOW())
      ON CONFLICT (section) DO UPDATE
      SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;
    `;
    const fallback = await readFallbackContent();
    fallback.coaches = allCoaches;
    await writeFallbackContent(fallback);
  } catch (syncErr) {
    console.warn("Downstream site_content sync warning:", syncErr);
  }

  return {
    success: true,
    softDeleted: softDelete || isReferenced,
    message: isReferenced
      ? "Coach is linked to existing academy records and has been deactivated."
      : softDelete
      ? "Coach archived successfully."
      : "Coach permanently deleted from database.",
  };
}

// Getters for specific website components
export async function getGalleryItems(): Promise<GalleryItem[]> {
  return getContentSection<GalleryItem>("gallery", GALLERY_ITEMS);
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

