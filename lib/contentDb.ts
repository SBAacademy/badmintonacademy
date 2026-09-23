import { neon } from "@neondatabase/serverless";
import fs from "fs/promises";
import path from "path";

import { GALLERY_ITEMS, GalleryItem } from "@/data/gallery";
import { COACHES, Coach, CoachPhoto, normalizeWhatsAppNumber } from "@/data/coaches";
import { ACHIEVEMENTS, Achievement } from "@/data/achievements";
import { TESTIMONIALS, Testimonial } from "@/data/testimonials";
import { BLOG_POSTS, BlogPost } from "@/data/blog";
import { Centre, CentreOpeningHours } from "@/data/centres";
import { PROGRAMS, Program } from "@/data/programs";

export type ContentSectionKey = "gallery" | "coaches" | "achievements" | "testimonials" | "blog" | "centres" | "programs";

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
      centres: [],
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
      centres: [],
      programs: [],
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

    // Ensure centres table has modern schema
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS centres (
          slug VARCHAR(64) PRIMARY KEY,
          name VARCHAR(128) NOT NULL,
          short_name VARCHAR(64) NOT NULL,
          address TEXT NOT NULL,
          phone VARCHAR(32) NOT NULL,
          whatsapp VARCHAR(32) NOT NULL,
          email VARCHAR(128) NOT NULL,
          court_count INTEGER NOT NULL DEFAULT 3,
          surface_type VARCHAR(128) DEFAULT 'BWF Wooden Cushion & Synthetic Mat',
          google_maps_url TEXT,
          status VARCHAR(32) DEFAULT 'ACTIVE',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS area VARCHAR(128);`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS city VARCHAR(64) DEFAULT 'Kochi';`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS district VARCHAR(64) DEFAULT 'Ernakulam';`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS state VARCHAR(64) DEFAULT 'Kerala';`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS pincode VARCHAR(32);`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS postal_code VARCHAR(32);`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS phone_display VARCHAR(64);`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS whatsapp_display VARCHAR(64);`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS google_maps_embed_url TEXT;`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 6);`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 6);`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 1;`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS description TEXT;`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS image TEXT;`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS court_image TEXT;`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS seo_description TEXT;`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS is_placeholder BOOLEAN DEFAULT FALSE;`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;`;
      await sql`ALTER TABLE centres ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();`;

    } catch {
      // Ignored for concurrent workers
    }

    // Ensure coaches table has modern columns
    try {
      await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT '{}';`;
      await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;`;
      await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;`;
      await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(32);`;
      await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS slug VARCHAR(128);`;
      await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();`;
    } catch {
      // Ignored for concurrent workers
    }

    // 1. Create dedicated relational coach_photos table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS coach_photos (
          id VARCHAR(64) PRIMARY KEY,
          coach_id VARCHAR(64) NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 1,
          is_primary BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_coach_photos_coach_id ON coach_photos(coach_id);`;
      await sql`CREATE INDEX IF NOT EXISTS idx_coach_photos_sort_order ON coach_photos(coach_id, sort_order ASC);`;
    } catch {
      // Ignored if created by concurrent worker
    }

    // 2. Safe Data Migration: Migrate existing coach image_url into coach_photos
    try {
      await sql`
        INSERT INTO coach_photos (id, coach_id, image_url, sort_order, is_primary, created_at, updated_at)
        SELECT 
          'photo_' || c.id || '_primary',
          c.id,
          c.image_url,
          1,
          TRUE,
          NOW(),
          NOW()
        FROM coaches c
        WHERE c.image_url IS NOT NULL 
          AND TRIM(c.image_url) != ''
          AND NOT EXISTS (
            SELECT 1 FROM coach_photos cp WHERE cp.coach_id = c.id
          )
        ON CONFLICT (id) DO NOTHING;
      `;
    } catch {
      // Ignored
    }

    // 3. Ensure sequential default display_order for existing coaches
    try {
      await sql`
        WITH ordered_coaches AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY COALESCE(display_order, 999) ASC, created_at ASC) as new_order
          FROM coaches
          WHERE display_order IS NULL OR display_order = 0
        )
        UPDATE coaches c
        SET display_order = oc.new_order
        FROM ordered_coaches oc
        WHERE c.id = oc.id AND (c.display_order IS NULL OR c.display_order = 0);
      `;
    } catch {
      // Ignored
    }

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
  const b = branch.toLowerCase().trim();
  if (!b.includes(" ") && !b.includes("(")) return b;
  if (b.includes("edappally")) return "edappally";
  if (b.includes("kakkanad")) return "kakkanad";
  if (b.includes("kadavanthra")) return "kadavanthra";
  return b.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function mapCentreSlugToBranch(slug?: string | null): string {
  if (!slug) return "Kadavanthra (Headquarters)";
  const s = slug.toLowerCase();
  if (s.includes("edappally")) return "Edappally Branch";
  if (s.includes("kakkanad")) return "Kakkanad Branch";
  if (s.includes("kadavanthra")) return "Kadavanthra (Headquarters)";
  return slug;
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
          c.updated_at as "updatedAt",
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', cp.id,
                  'coachId', cp.coach_id,
                  'imageUrl', cp.image_url,
                  'sortOrder', cp.sort_order,
                  'isPrimary', cp.is_primary,
                  'createdAt', cp.created_at,
                  'updatedAt', cp.updated_at
                ) ORDER BY cp.sort_order ASC, cp.created_at ASC
              )
              FROM coach_photos cp
              WHERE cp.coach_id = c.id
            ),
            '[]'::json
          ) as photos
        FROM coaches c
        LEFT JOIN centres cen ON c.primary_centre = cen.slug
        ${includeUnpublished ? sql`WHERE c.status != 'INACTIVE'` : sql`WHERE c.status = 'ACTIVE' AND c.is_published = TRUE`}
        ORDER BY c.display_order ASC, c.experience_years DESC, c.created_at DESC;
      `) as unknown as Record<string, unknown>[];

      if (Array.isArray(rows)) {
        return rows.map((r) => {
          const rawPhotos = Array.isArray(r.photos) ? (r.photos as CoachPhoto[]) : [];
          const photos: CoachPhoto[] = rawPhotos.map((p, idx) => ({
            id: String(p.id),
            coachId: String(p.coachId || r.id),
            imageUrl: ensureCoachImage(p.imageUrl),
            sortOrder: Number(p.sortOrder) || idx + 1,
            isPrimary: Boolean(p.isPrimary),
            createdAt: p.createdAt ? String(p.createdAt) : undefined,
            updatedAt: p.updatedAt ? String(p.updatedAt) : undefined,
          }));

          // Fallback if no photos in coach_photos table yet but r.image exists
          if (photos.length === 0 && r.image) {
            photos.push({
              id: `photo_${r.id}_1`,
              coachId: String(r.id),
              imageUrl: ensureCoachImage(r.image as string),
              sortOrder: 1,
              isPrimary: true,
            });
          }

          // Identify primary photo
          const primary = photos.find((p) => p.isPrimary)?.imageUrl || photos[0]?.imageUrl || ensureCoachImage(r.image as string);
          const images = photos.map((p) => p.imageUrl);

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
            image: primary,
            images,
            photos,
            whatsappNumber: r.whatsappNumber ? String(r.whatsappNumber) : null,
            status: (r.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
            isPublished: r.isPublished !== false,
            displayOrder: Number(r.displayOrder) || 1,
            createdAt: r.createdAt ? String(r.createdAt) : undefined,
            updatedAt: r.updatedAt ? String(r.updatedAt) : undefined,
          };
        });
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
    const list = (fallback.coaches as Coach[]).map((c, idx) => {
      const photos: CoachPhoto[] = Array.isArray(c.photos) && c.photos.length > 0
        ? c.photos.map((p, pIdx) => ({
            id: p.id || `photo_${c.id}_${pIdx + 1}`,
            coachId: c.id,
            imageUrl: ensureCoachImage(p.imageUrl),
            sortOrder: p.sortOrder || pIdx + 1,
            isPrimary: Boolean(p.isPrimary),
          }))
        : Array.isArray(c.images) && c.images.length > 0
        ? c.images.map((img, iIdx) => ({
            id: `photo_${c.id}_${iIdx + 1}`,
            coachId: c.id,
            imageUrl: ensureCoachImage(img),
            sortOrder: iIdx + 1,
            isPrimary: iIdx === 0,
          }))
        : [
            {
              id: `photo_${c.id}_1`,
              coachId: c.id,
              imageUrl: ensureCoachImage(c.image),
              sortOrder: 1,
              isPrimary: true,
            },
          ];

      const primary = photos.find((p) => p.isPrimary)?.imageUrl || photos[0]?.imageUrl || ensureCoachImage(c.image);
      const images = photos.map((p) => p.imageUrl);

      return {
        ...c,
        slug: c.slug || c.id,
        image: primary,
        images,
        photos,
        displayOrder: Number(c.displayOrder) || (idx + 1),
        isPublished: c.isPublished !== false,
        status: c.status || "ACTIVE",
      };
    });

    list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

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
          c.updated_at as "updatedAt",
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', cp.id,
                  'coachId', cp.coach_id,
                  'imageUrl', cp.image_url,
                  'sortOrder', cp.sort_order,
                  'isPrimary', cp.is_primary,
                  'createdAt', cp.created_at,
                  'updatedAt', cp.updated_at
                ) ORDER BY cp.sort_order ASC, cp.created_at ASC
              )
              FROM coach_photos cp
              WHERE cp.coach_id = c.id
            ),
            '[]'::json
          ) as photos
        FROM coaches c
        LEFT JOIN centres cen ON c.primary_centre = cen.slug
        WHERE (c.slug = ${cleanSlug} OR c.id = ${cleanSlug})
          AND c.status = 'ACTIVE'
          AND c.is_published = TRUE
        LIMIT 1;
      `) as unknown as Record<string, unknown>[];

      if (Array.isArray(rows) && rows.length > 0) {
        const r = rows[0];
        const rawPhotos = Array.isArray(r.photos) ? (r.photos as CoachPhoto[]) : [];
        const photos: CoachPhoto[] = rawPhotos.map((p, idx) => ({
          id: String(p.id),
          coachId: String(p.coachId || r.id),
          imageUrl: ensureCoachImage(p.imageUrl),
          sortOrder: Number(p.sortOrder) || idx + 1,
          isPrimary: Boolean(p.isPrimary),
          createdAt: p.createdAt ? String(p.createdAt) : undefined,
          updatedAt: p.updatedAt ? String(p.updatedAt) : undefined,
        }));

        if (photos.length === 0 && r.image) {
          photos.push({
            id: `photo_${r.id}_1`,
            coachId: String(r.id),
            imageUrl: ensureCoachImage(r.image as string),
            sortOrder: 1,
            isPrimary: true,
          });
        }

        const primary = photos.find((p) => p.isPrimary)?.imageUrl || photos[0]?.imageUrl || ensureCoachImage(r.image as string);
        const images = photos.map((p) => p.imageUrl);

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
          image: primary,
          images,
          photos,
          whatsappNumber: r.whatsappNumber ? String(r.whatsappNumber) : null,
          status: (r.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
          isPublished: r.isPublished !== false,
          displayOrder: Number(r.displayOrder) || 1,
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
  const status = coachData.status || current?.status || "ACTIVE";
  const isPub = coachData.isPublished !== undefined ? coachData.isPublished : (current?.isPublished !== false);
  const order = Number(coachData.displayOrder ?? current?.displayOrder) || 1;
  const now = new Date().toISOString();

  // Normalize multi-photos
  let normalizedPhotos: CoachPhoto[] = [];
  if (Array.isArray(coachData.photos) && coachData.photos.length > 0) {
    normalizedPhotos = coachData.photos
      .filter((p) => Boolean(p && p.imageUrl && p.imageUrl.trim()))
      .map((p, idx) => ({
        id: p.id && !p.id.startsWith("temp_") ? String(p.id) : `photo_${cleanId}_${Date.now()}_${idx + 1}`,
        coachId: cleanId,
        imageUrl: ensureCoachImage(p.imageUrl),
        sortOrder: typeof p.sortOrder === "number" ? p.sortOrder : idx + 1,
        isPrimary: Boolean(p.isPrimary),
      }));
  } else if (Array.isArray(coachData.images) && coachData.images.length > 0) {
    normalizedPhotos = coachData.images
      .filter((img) => Boolean(img && img.trim()))
      .map((img, idx) => ({
        id: `photo_${cleanId}_${Date.now()}_${idx + 1}`,
        coachId: cleanId,
        imageUrl: ensureCoachImage(img),
        sortOrder: idx + 1,
        isPrimary: idx === 0,
      }));
  } else {
    const fallbackImg = coachData.image !== undefined ? coachData.image : current?.image;
    if (fallbackImg && fallbackImg.trim()) {
      normalizedPhotos = [
        {
          id: `photo_${cleanId}_1`,
          coachId: cleanId,
          imageUrl: ensureCoachImage(fallbackImg),
          sortOrder: 1,
          isPrimary: true,
        },
      ];
    }
  }

  // Exactly one primary photo rule
  if (normalizedPhotos.length > 0) {
    const hasPrimary = normalizedPhotos.some((p) => p.isPrimary);
    if (!hasPrimary) {
      normalizedPhotos[0].isPrimary = true;
    } else {
      let foundFirstPrimary = false;
      for (const p of normalizedPhotos) {
        if (p.isPrimary) {
          if (!foundFirstPrimary) {
            foundFirstPrimary = true;
          } else {
            p.isPrimary = false; // Only one primary photo allowed
          }
        }
      }
    }
  }

  // Primary photo is authoritative cover image
  const primaryPhoto = normalizedPhotos.find((p) => p.isPrimary) || normalizedPhotos[0];
  const primaryImgToSave = primaryPhoto ? primaryPhoto.imageUrl : (coachData.image?.trim() || null);

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
        ${centreSlug}, ${primaryImgToSave}, ${whatsappNumber}, ${status}, ${isPub}, ${order}, NOW(), NOW()
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

    // Synchronize coach_photos table for this coach
    if (normalizedPhotos.length > 0) {
      // Re-sync photos in exact sort_order and primary status
      await sql`DELETE FROM coach_photos WHERE coach_id = ${cleanId};`;
      for (let i = 0; i < normalizedPhotos.length; i++) {
        const p = normalizedPhotos[i];
        const photoId = p.id || `photo_${cleanId}_${i + 1}`;
        await sql`
          INSERT INTO coach_photos (
            id, coach_id, image_url, sort_order, is_primary, created_at, updated_at
          ) VALUES (
            ${photoId}, ${cleanId}, ${p.imageUrl}, ${p.sortOrder || i + 1}, ${p.isPrimary}, NOW(), NOW()
          );
        `;
      }
    }
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
    image: ensureCoachImage(primaryImgToSave),
    images: normalizedPhotos.map((p) => p.imageUrl),
    photos: normalizedPhotos,
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

/**
 * Reorders coaches by displayOrder in batch
 */
export async function reorderCoaches(
  orderMap: Array<{ id: string; displayOrder: number }>
): Promise<Coach[]> {
  const sql = getSql();
  if (sql && orderMap.length > 0) {
    try {
      await initContentDb();
      for (const item of orderMap) {
        const order = Number(item.displayOrder) || 1;
        await sql`
          UPDATE coaches 
          SET display_order = ${order}, updated_at = NOW() 
          WHERE id = ${item.id} OR slug = ${item.id};
        `;
      }
    } catch (err) {
      console.error("Failed to reorder coaches in Neon DB:", err);
    }
  }

  // Update fallback
  const fallback = await readFallbackContent();
  if (fallback.coaches && Array.isArray(fallback.coaches)) {
    const orderDict = new Map(orderMap.map((o) => [o.id, Number(o.displayOrder) || 1]));
    const coachList = (fallback.coaches as Coach[]).map((c) => {
      if (orderDict.has(c.id)) {
        return { ...c, displayOrder: orderDict.get(c.id) };
      }
      return c;
    });
    coachList.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    fallback.coaches = coachList;
    await writeFallbackContent(fallback);
  }

  return await getCoaches({ includeUnpublished: true });
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

export { resolveAutomaticNeighborhoods } from "./constants";

export interface ProgramItem {
  slug: string;
  name: string;
  description: string;
  displayOrder?: number;
  status?: string;
  createdAt?: string;
}

export async function getPrograms(): Promise<ProgramItem[]> {
  const sql = getSql();
  if (sql) {
    try {
      await initContentDb();
      const rows = (await sql`
        SELECT 
          slug,
          name,
          COALESCE(description, '') as description,
          display_order as "displayOrder",
          status,
          created_at as "createdAt"
        FROM programs
        WHERE status = 'ACTIVE' OR status IS NULL
        ORDER BY display_order ASC, created_at ASC;
      `) as unknown as ProgramItem[];

      if (rows && rows.length > 0) {
        return rows;
      }
    } catch (err) {
      console.error("Failed to query programs from PostgreSQL:", err);
    }
  }

  // Fallback to static programs
  return PROGRAMS.map((p, idx) => ({
    slug: p.slug,
    name: p.name,
    description: p.shortDescription || p.fullDescription || "",
    displayOrder: idx + 1,
    status: "ACTIVE",
  }));
}

export async function saveProgramRecord(data: Partial<ProgramItem>): Promise<ProgramItem> {
  const sql = getSql();
  const name = String(data.name || "").trim();
  const description = String(data.description || "").trim();

  if (!name) {
    throw new Error("Program name is required.");
  }

  const rawSlug = data.slug
    ? String(data.slug).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slug = rawSlug || `training-${Date.now()}`;
  const displayOrder = Number(data.displayOrder) || 1;
  const status = data.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";

  if (sql) {
    await initContentDb();
    await sql`
      INSERT INTO programs (
        slug, name, description, display_order, status, created_at
      ) VALUES (
        ${slug}, ${name}, ${description}, ${displayOrder}, ${status}, NOW()
      ) ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        display_order = COALESCE(EXCLUDED.display_order, programs.display_order),
        status = COALESCE(EXCLUDED.status, programs.status);
    `;

    return {
      slug,
      name,
      description,
      displayOrder,
      status,
    };
  }

  return {
    slug,
    name,
    description,
    displayOrder,
    status,
  };
}

export async function deleteProgramRecord(slug: string): Promise<{ success: boolean; message: string }> {
  const sql = getSql();
  if (!slug) {
    return { success: false, message: "Program slug is required." };
  }

  if (sql) {
    try {
      await initContentDb();
      await sql`UPDATE batches SET program_slug = NULL WHERE program_slug = ${slug};`.catch(() => {});
      await sql`UPDATE students SET primary_program = NULL WHERE primary_program = ${slug};`.catch(() => {});
      await sql`UPDATE free_trials SET program_slug = NULL WHERE program_slug = ${slug};`.catch(() => {});
      
      await sql`DELETE FROM programs WHERE slug = ${slug};`;
      return { success: true, message: "Training program deleted successfully." };
    } catch (err: any) {
      console.error(`Failed to delete program ${slug}:`, err);
      return { success: false, message: err?.message || "Failed to delete program." };
    }
  }

  return { success: true, message: "Program deleted." };
}

export async function getTestimonials(options: { includePending?: boolean } = {}): Promise<Testimonial[]> {
  const items = await getContentSection<Testimonial>("testimonials", TESTIMONIALS);
  if (options.includePending) {
    return items;
  }
  // Filter only approved reviews for public website
  return items.filter((t: any) => {
    if (t.status === "APPROVED" || t.isApproved === true) return true;
    if (t.status === "PENDING") return false;
    if (t.isApproved === false) return false;
    return true;
  });
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return getContentSection<BlogPost>("blog", BLOG_POSTS);
}

// ============================================================================
// AUTHORITATIVE CENTRES DATA LAYER (PostgreSQL centres is single source of truth)
// ============================================================================

export async function getCentres(options: { includeInactive?: boolean } = {}): Promise<Centre[]> {
  const { includeInactive = false } = options;
  const sql = getSql();

  if (sql) {
    try {
      await initContentDb();
      const rows = (await sql`
        SELECT 
          c.slug as id,
          c.slug,
          c.name,
          c.short_name as "shortName",
          c.area,
          c.city,
          c.district,
          c.state,
          c.pincode,
          c.postal_code as "postalCode",
          c.address,
          c.phone,
          c.phone_display as "phoneDisplay",
          c.whatsapp,
          c.whatsapp_display as "whatsappDisplay",
          c.email,
          c.court_count as "courtCount",
          c.surface_type as "surfaceType",
          c.google_maps_url as "googleMapsUrl",
          c.google_maps_embed_url as "googleMapsEmbedUrl",
          c.latitude,
          c.longitude,
          c.description,
          c.display_order as "displayOrder",
          c.status,
          c.is_active as "isActive",
          c.seo_title as "seoTitle",
          c.seo_description as "seoDescription",
          c.image,
          c.court_image as "courtImage",
          c.is_placeholder as "isPlaceholder",
          c.data,
          c.created_at as "createdAt",
          c.updated_at as "updatedAt"
        FROM centres c
        ${includeInactive ? sql`` : sql`WHERE (c.status = 'ACTIVE' OR c.status IS NULL) AND (c.is_active = TRUE OR c.is_active IS NULL)`}
        ORDER BY c.display_order ASC, c.created_at ASC;
      `) as unknown as Record<string, unknown>[];

      if (Array.isArray(rows)) {
        return rows.map((r) => {
          const rawData = (r.data && typeof r.data === "object" ? r.data : {}) as Record<string, unknown>;
          return {
            id: String(r.slug || r.id),
            slug: String(r.slug || r.id),
            name: String(r.name || ""),
            shortName: String(r.shortName || r.name || ""),
            area: r.area ? String(r.area) : undefined,
            city: String(r.city || "Kochi"),
            district: r.district ? String(r.district) : undefined,
            state: r.state ? String(r.state) : undefined,
            pincode: r.pincode ? String(r.pincode) : r.postalCode ? String(r.postalCode) : undefined,
            postalCode: r.postalCode ? String(r.postalCode) : r.pincode ? String(r.pincode) : undefined,
            address: String(r.address || ""),
            phone: String(r.phone || ""),
            phoneDisplay: r.phoneDisplay ? String(r.phoneDisplay) : String(r.phone || ""),
            whatsapp: String(r.whatsapp || ""),
            whatsappDisplay: r.whatsappDisplay ? String(r.whatsappDisplay) : String(r.whatsapp || ""),
            email: String(r.email || ""),
            courtCount: Number(r.courtCount) || 3,
            surfaceType: String(r.surfaceType || "BWF Grade-1 Certified Synthetic Surface"),
            googleMapsUrl: String(r.googleMapsUrl || ""),
            googleMapsEmbedUrl: r.googleMapsEmbedUrl ? String(r.googleMapsEmbedUrl) : undefined,
            latitude: r.latitude !== null && r.latitude !== undefined ? Number(r.latitude) : null,
            longitude: r.longitude !== null && r.longitude !== undefined ? Number(r.longitude) : null,
            description: String(r.description || ""),
            displayOrder: Number(r.displayOrder) || 1,
            status: (r.status === "INACTIVE" ? "INACTIVE" : "ACTIVE") as "ACTIVE" | "INACTIVE",
            isActive: r.isActive !== false && r.status !== "INACTIVE",
            seoTitle: r.seoTitle ? String(r.seoTitle) : undefined,
            seoDescription: r.seoDescription ? String(r.seoDescription) : undefined,
            image: r.image ? String(r.image) : "/images/badminton-arena.jpg",
            courtImage: r.courtImage ? String(r.courtImage) : undefined,
            isPlaceholder: Boolean(r.isPlaceholder),
            facilities: Array.isArray(rawData.facilities) ? (rawData.facilities as string[]) : undefined,
            openingHours: rawData.openingHours as CentreOpeningHours | undefined,
            intro: rawData.intro as any,
            courtInformation: rawData.courtInformation as any,
            programs: Array.isArray(rawData.programs) ? rawData.programs : undefined,
            coaches: Array.isArray(rawData.coaches) ? rawData.coaches : undefined,
            gallery: Array.isArray(rawData.gallery) ? rawData.gallery : undefined,
            testimonials: Array.isArray(rawData.testimonials) ? rawData.testimonials : undefined,
            achievements: Array.isArray(rawData.achievements) ? rawData.achievements : undefined,
            localFAQs: Array.isArray(rawData.localFAQs) ? rawData.localFAQs : undefined,
            seo: rawData.seo as any,
            createdAt: r.createdAt ? new Date(r.createdAt as string).toISOString() : undefined,
            updatedAt: r.updatedAt ? new Date(r.updatedAt as string).toISOString() : undefined,
          };
        });
      }
    } catch (err) {
      console.warn("Error querying centres table from Neon DB, reading fallback:", err);
    }
  }

  // Fallback to local JSON store
  const fallback = await readFallbackContent();
  const rawList = Array.isArray(fallback.centres) ? (fallback.centres as unknown as Centre[]) : [];
  const filtered = includeInactive
    ? rawList
    : rawList.filter((c) => (c.status === "ACTIVE" || !c.status) && c.isActive !== false);

  return [...filtered].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

export async function getCentreBySlug(slug: string): Promise<Centre | null> {
  if (!slug) return null;
  const centres = await getCentres({ includeInactive: true });
  const clean = slug.toLowerCase().trim();
  return centres.find((c) => c.slug.toLowerCase() === clean || c.id?.toLowerCase() === clean) || null;
}

export async function saveCentreRecord(centreData: Partial<Centre>): Promise<Centre> {
  const sql = getSql();
  const rawSlug = (centreData.slug || centreData.id || centreData.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slug = rawSlug || `centre-${Date.now()}`;

  const RESERVED_SLUGS = new Set([
    "admin", "api", "blog", "coaches", "programs", "contact", "about",
    "branches", "gallery", "achievements", "testimonials", "private", "auth", "login"
  ]);
  if (RESERVED_SLUGS.has(slug)) {
    throw new Error(`The slug "${slug}" is a reserved system route and cannot be used for a centre.`);
  }

  const cleanId = slug;

  // Check existing
  const current = await getCentreBySlug(slug);

  const name = (centreData.name || current?.name || "S & A Badminton Academy Centre").trim();
  const shortName = (centreData.shortName || current?.shortName || name).trim();
  const area = (centreData.area || current?.area || shortName.replace(/centre|branch/gi, "").trim() || "Kochi").trim();
  const city = (centreData.city || current?.city || "Kochi").trim();
  const district = (centreData.district || current?.district || "Ernakulam").trim();
  const state = (centreData.state || current?.state || "Kerala").trim();
  const pincode = (centreData.pincode || centreData.postalCode || current?.pincode || current?.postalCode || "682020").trim();
  const address = (centreData.address || current?.address || `${area}, ${city}`).trim();
  const phone = (centreData.phone || current?.phone || "+919400635548").trim();
  const phoneDisplay = (centreData.phoneDisplay || current?.phoneDisplay || phone).trim();
  const whatsapp = (centreData.whatsapp || current?.whatsapp || "919400635548").replace(/\D/g, "");
  const whatsappDisplay = (centreData.whatsappDisplay || current?.whatsappDisplay || phoneDisplay).trim();
  const email = (centreData.email || current?.email || `${slug}@sabadminton.com`).trim();
  const courtCount = Number(centreData.courtCount ?? current?.courtCount) || 3;
  const surfaceType = (centreData.surfaceType || current?.surfaceType || "BWF Grade-1 Certified Synthetic Cushion Mats").trim();
  const googleMapsUrl = (centreData.googleMapsUrl || current?.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(name)}`).trim();
  const googleMapsEmbedUrl = centreData.googleMapsEmbedUrl || current?.googleMapsEmbedUrl || "";
  const latitude = centreData.latitude !== undefined ? centreData.latitude : (current?.latitude ?? null);
  const longitude = centreData.longitude !== undefined ? centreData.longitude : (current?.longitude ?? null);
  const description = (centreData.description || current?.description || "").trim();
  const order = Number(centreData.displayOrder ?? current?.displayOrder) || 1;
  const status = (centreData.status || (centreData.isActive === false ? "INACTIVE" : current?.status) || "ACTIVE") as "ACTIVE" | "INACTIVE";
  const isActive = status === "ACTIVE";
  const seoTitle = (centreData.seoTitle || current?.seoTitle || `${name} | S&A Badminton Academy`).trim();
  const seoDescription = (centreData.seoDescription || current?.seoDescription || description || `${name} premier badminton training facility in Kochi.`).trim();
  const image = centreData.image || current?.image || "/images/badminton-arena.jpg";
  const courtImage = centreData.courtImage || current?.courtImage || image;
  const isPlaceholder = Boolean(centreData.isPlaceholder ?? current?.isPlaceholder);

  // Merge rich data sub-objects
  const richData = {
    ...(current?.intro ? { intro: current.intro } : {}),
    ...(current?.courtInformation ? { courtInformation: current.courtInformation } : {}),
    ...(current?.facilities ? { facilities: current.facilities } : {}),
    ...(current?.openingHours ? { openingHours: current.openingHours } : {}),
    ...(current?.programs ? { programs: current.programs } : {}),
    ...(current?.coaches ? { coaches: current.coaches } : {}),
    ...(current?.gallery ? { gallery: current.gallery } : {}),
    ...(current?.testimonials ? { testimonials: current.testimonials } : {}),
    ...(current?.achievements ? { achievements: current.achievements } : {}),
    ...(current?.localFAQs ? { localFAQs: current.localFAQs } : {}),
    ...(current?.seo ? { seo: current.seo } : {}),
    ...(centreData.facilities ? { facilities: centreData.facilities } : {}),
    ...(centreData.openingHours ? { openingHours: centreData.openingHours } : {}),
    ...(centreData.intro ? { intro: centreData.intro } : {}),
    ...(centreData.courtInformation ? { courtInformation: centreData.courtInformation } : {}),
  };

  const now = new Date().toISOString();

  const savedCentre: Centre = {
    id: cleanId,
    slug,
    name,
    shortName,
    area,
    city,
    district,
    state,
    pincode,
    postalCode: pincode,
    address,
    phone,
    phoneDisplay,
    whatsapp,
    whatsappDisplay,
    email,
    courtCount,
    surfaceType,
    googleMapsUrl,
    googleMapsEmbedUrl,
    latitude,
    longitude,
    description,
    displayOrder: order,
    status,
    isActive,
    seoTitle,
    seoDescription,
    image,
    courtImage,
    isPlaceholder,
    facilities: richData.facilities,
    openingHours: richData.openingHours,
    intro: richData.intro,
    courtInformation: richData.courtInformation,
    programs: current?.programs || [],
    coaches: current?.coaches || [],
    gallery: current?.gallery || [],
    testimonials: current?.testimonials || [],
    achievements: current?.achievements || [],
    localFAQs: current?.localFAQs || [],
    seo: {
      title: seoTitle,
      description: seoDescription,
      primaryKeyword: `badminton coaching ${area}`,
      secondaryKeywords: [`badminton academy ${area}`, `badminton courts ${city}`],
      relatedKeywords: [`training academy ${area}`, `badminton near me`],
    },
    createdAt: current?.createdAt || now,
    updatedAt: now,
  };

  if (sql) {
    try {
      await initContentDb();
      await sql`
        INSERT INTO centres (
          slug, name, short_name, area, city, district, state,
          pincode, postal_code, address, phone, phone_display,
          whatsapp, whatsapp_display, email, court_count, surface_type,
          google_maps_url, google_maps_embed_url, latitude, longitude,
          description, display_order, status, is_active,
          seo_title, seo_description, image, court_image, is_placeholder,
          data, created_at, updated_at
        ) VALUES (
          ${slug}, ${name}, ${shortName}, ${area}, ${city}, ${district}, ${state},
          ${pincode}, ${pincode}, ${address}, ${phone}, ${phoneDisplay},
          ${whatsapp}, ${whatsappDisplay}, ${email}, ${courtCount}, ${surfaceType},
          ${googleMapsUrl}, ${googleMapsEmbedUrl}, ${latitude}, ${longitude},
          ${description}, ${order}, ${status}, ${isActive},
          ${seoTitle}, ${seoDescription}, ${image}, ${courtImage}, ${isPlaceholder},
          ${JSON.stringify(richData)}, ${savedCentre.createdAt}, ${now}
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          short_name = EXCLUDED.short_name,
          area = EXCLUDED.area,
          city = EXCLUDED.city,
          district = EXCLUDED.district,
          state = EXCLUDED.state,
          pincode = EXCLUDED.pincode,
          postal_code = EXCLUDED.postal_code,
          address = EXCLUDED.address,
          phone = EXCLUDED.phone,
          phone_display = EXCLUDED.phone_display,
          whatsapp = EXCLUDED.whatsapp,
          whatsapp_display = EXCLUDED.whatsapp_display,
          email = EXCLUDED.email,
          court_count = EXCLUDED.court_count,
          surface_type = EXCLUDED.surface_type,
          google_maps_url = EXCLUDED.google_maps_url,
          google_maps_embed_url = EXCLUDED.google_maps_embed_url,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          description = EXCLUDED.description,
          display_order = EXCLUDED.display_order,
          status = EXCLUDED.status,
          is_active = EXCLUDED.is_active,
          seo_title = EXCLUDED.seo_title,
          seo_description = EXCLUDED.seo_description,
          image = EXCLUDED.image,
          court_image = EXCLUDED.court_image,
          is_placeholder = EXCLUDED.is_placeholder,
          data = EXCLUDED.data,
          updated_at = EXCLUDED.updated_at;
      `;
    } catch (sqlErr) {
      console.warn("SQL upsert centre warning:", sqlErr);
    }
  }

  // Update fallback file
  const fallback = await readFallbackContent();
  const currentCentres = Array.isArray(fallback.centres) ? (fallback.centres as unknown as Centre[]) : [];
  const existingIdx = currentCentres.findIndex((c) => c.slug === slug || c.id === slug);

  if (existingIdx !== -1) {
    currentCentres[existingIdx] = savedCentre;
  } else {
    currentCentres.push(savedCentre);
  }
  fallback.centres = currentCentres.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  await writeFallbackContent(fallback);

  return savedCentre;
}

export async function reorderCentres(
  orderMap: Array<{ id: string; displayOrder: number }>
): Promise<Centre[]> {
  const sql = getSql();
  if (sql && orderMap.length > 0) {
    try {
      await initContentDb();
      for (const item of orderMap) {
        const order = Number(item.displayOrder) || 1;
        await sql`
          UPDATE centres 
          SET display_order = ${order}, updated_at = NOW() 
          WHERE slug = ${item.id};
        `;
      }
    } catch (e) {
      console.warn("Failed updating centres display_order in Neon:", e);
    }
  }

  const fallback = await readFallbackContent();
  const currentCentres = Array.isArray(fallback.centres) ? (fallback.centres as unknown as Centre[]) : [];
  for (const item of orderMap) {
    const found = currentCentres.find((c) => c.slug === item.id || c.id === item.id);
    if (found) {
      found.displayOrder = Number(item.displayOrder) || 1;
    }
  }
  fallback.centres = currentCentres.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  await writeFallbackContent(fallback);

  return getCentres({ includeInactive: true });
}

export async function deleteCentreRecord(
  slug: string,
  options: { softDelete?: boolean } = {}
): Promise<{ success: boolean; softDeleted: boolean; message: string }> {
  const { softDelete = false } = options;
  const sql = getSql();

  try {
    await initContentDb();

    // 1. Soft-delete branch (only when explicitly requested via softDelete: true)
    if (softDelete) {
      if (sql) {
        try {
          await sql`
            UPDATE centres 
            SET status = 'INACTIVE', is_active = FALSE, updated_at = NOW() 
            WHERE slug = ${slug};
          `;
        } catch (e) {
          console.warn("Could not deactivate centre in Neon:", e);
        }
      }

      const fallback = await readFallbackContent();
      const currentCentres = Array.isArray(fallback.centres) ? (fallback.centres as unknown as Centre[]) : [];
      const target = currentCentres.find((c) => c.slug === slug || c.id === slug);
      if (target) {
        target.status = "INACTIVE";
        target.isActive = false;
        target.updatedAt = new Date().toISOString();
        await writeFallbackContent(fallback);
      }

      return {
        success: true,
        softDeleted: true,
        message: "Center deactivated successfully.",
      };
    }

    // 2. ACTUAL DELETION: Safely uncouple related records so foreign keys succeed without deleting production records
    if (sql) {
      try {
        // Safely unassign coaches pointing to this centre
        await sql`UPDATE coaches SET primary_centre = NULL WHERE primary_centre = ${slug};`;
      } catch (e) {
        console.warn("Could not unassign coaches for centre:", slug, e);
      }

      try {
        // Safely unassign students pointing to this centre
        await sql`UPDATE students SET primary_centre = NULL WHERE primary_centre = ${slug};`;
      } catch (e) {
        console.warn("Could not unassign students for centre:", slug, e);
      }

      try {
        // Safely unassign free trials pointing to this centre
        await sql`UPDATE free_trials SET centre_slug = NULL WHERE centre_slug = ${slug};`;
      } catch (e) {
        console.warn("Could not unassign free_trials for centre:", slug, e);
      }

      try {
        // Safely unassign sessions pointing to this centre
        await sql`UPDATE sessions SET centre_slug = NULL WHERE centre_slug = ${slug};`;
      } catch (e) {
        console.warn("Could not unassign sessions for centre:", slug, e);
      }

      try {
        // Safely unassign batches pointing to this centre
        await sql`UPDATE batches SET centre_slug = NULL WHERE centre_slug = ${slug};`;
      } catch (e) {
        console.warn("Could not unassign batches for centre:", slug, e);
      }

      try {
        // Preserve gallery items in database by re-tagging them to 'All Centres'
        const galleryRow = (await sql`SELECT data FROM site_content WHERE section = 'gallery';`) as unknown as Array<{ data: any }>;
        if (galleryRow.length > 0 && Array.isArray(galleryRow[0].data)) {
          let hasChanges = false;
          const updatedGallery = galleryRow[0].data.map((item: any) => {
            const b = (item.branch || "").trim().toLowerCase();
            if (b === slug.toLowerCase()) {
              hasChanges = true;
              return { ...item, branch: "All Centres" };
            }
            return item;
          });
          if (hasChanges) {
            await sql`UPDATE site_content SET data = ${JSON.stringify(updatedGallery)}, updated_at = NOW() WHERE section = 'gallery';`;
          }
        }
      } catch (e) {
        console.warn("Could not update gallery items for centre:", slug, e);
      }

      // Execute actual DELETE on the centre record from Neon DB
      await sql`DELETE FROM centres WHERE slug = ${slug};`;
    }

    // 3. Remove centre from fallback content store (data/site_content.json)
    try {
      const fallback = await readFallbackContent();
      const currentCentres = Array.isArray(fallback.centres) ? (fallback.centres as unknown as Centre[]) : [];
      fallback.centres = currentCentres.filter((c) => c.slug !== slug && c.id !== slug);

      // Unassign coaches in fallback store
      if (Array.isArray(fallback.coaches)) {
        fallback.coaches = (fallback.coaches as unknown as Coach[]).map((coach) => {
          if (coach.primaryCentre === slug) {
            return { ...coach, primaryCentre: undefined };
          }
          return coach;
        });
      }

      // Re-tag gallery items in fallback store
      if (Array.isArray(fallback.gallery)) {
        fallback.gallery = (fallback.gallery as unknown as GalleryItem[]).map((item) => {
          if ((item.branch || "").trim().toLowerCase() === slug.toLowerCase()) {
            return { ...item, branch: "All Centres" };
          }
          return item;
        });
      }

      await writeFallbackContent(fallback);
    } catch (err) {
      console.warn("Could not clean up fallback store on centre deletion:", err);
    }

    return {
      success: true,
      softDeleted: false,
      message: "Center deleted successfully.",
    };
  } catch (error: any) {
    console.error("deleteCentreRecord error:", error);
    return {
      success: false,
      softDeleted: false,
      message: error?.message || "Failed to delete center from database.",
    };
  }
}


