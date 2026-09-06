import { neon } from "@neondatabase/serverless";

import fs from "fs/promises";
import path from "path";

export interface LeadItem {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  ageCategory: string;
  branch: string;
  program: string;
  slot: string;
  message?: string;
  status: "NEW" | "CONTACTED" | "TRIAL_SCHEDULED" | "ENROLLED" | "DROPPED";
  notes?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  submittedAt: string;
  updatedAt?: string;
}

const LEADS_FALLBACK_PATH = path.join(process.cwd(), "data", "leads.json");

function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

function getSql(): ReturnType<typeof neon> | null {
  const url = getDatabaseUrl();
  if (!url) return null;
  return neon(url);
}

// Fallback to local JSON file if DB unavailable
async function readFallbackLeads(): Promise<LeadItem[]> {
  try {
    const fileData = await fs.readFile(LEADS_FALLBACK_PATH, "utf-8");
    return JSON.parse(fileData);
  } catch {
    return [];
  }
}

async function saveFallbackLeads(leads: LeadItem[]): Promise<void> {
  try {
    await fs.writeFile(LEADS_FALLBACK_PATH, JSON.stringify(leads, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to fallback leads JSON:", err);
  }
}

let isInitialized = false;

export async function initDb(): Promise<void> {
  const sql = getSql();
  if (!sql || isInitialized) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(64) NOT NULL,
        email VARCHAR(255),
        age_category VARCHAR(64),
        branch VARCHAR(64) NOT NULL,
        program VARCHAR(128) NOT NULL,
        slot VARCHAR(128),
        message TEXT,
        status VARCHAR(32) DEFAULT 'NEW',
        notes TEXT,
        utm_source VARCHAR(64),
        utm_medium VARCHAR(64),
        utm_campaign VARCHAR(64),
        submitted_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Check if table is empty, if so, seed from JSON
    const countResult = (await sql`SELECT COUNT(*)::int as count FROM leads;`) as unknown as Array<{ count: number }>;
    const count = countResult[0]?.count ?? 0;

    if (count === 0) {
      const fallbackLeads = await readFallbackLeads();
      for (const lead of fallbackLeads) {
        await sql`
          INSERT INTO leads (
            id, name, phone, email, age_category, branch, program, slot,
            message, status, notes, utm_source, utm_medium, utm_campaign,
            submitted_at, updated_at
          ) VALUES (
            ${lead.id}, ${lead.name}, ${lead.phone}, ${lead.email || null},
            ${lead.ageCategory || null}, ${lead.branch}, ${lead.program},
            ${lead.slot || null}, ${lead.message || ""}, ${lead.status || "NEW"},
            ${lead.notes || ""}, ${lead.utmSource || null}, ${lead.utmMedium || null},
            ${lead.utmCampaign || null},
            ${lead.submittedAt ? new Date(lead.submittedAt).toISOString() : new Date().toISOString()},
            ${lead.updatedAt ? new Date(lead.updatedAt).toISOString() : new Date().toISOString()}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    isInitialized = true;
  } catch (err) {
    console.error("Neon DB init error (falling back to JSON store):", err);
  }
}

function mapRowToLead(row: Record<string, unknown>): LeadItem {
  return {
    id: String(row.id),
    name: String(row.name),
    phone: String(row.phone),
    email: row.email ? String(row.email) : null,
    ageCategory: String(row.age_category || "Junior (Ages 10-16)"),
    branch: String(row.branch),
    program: String(row.program),
    slot: String(row.slot || ""),
    message: row.message ? String(row.message) : "",
    status: (row.status as LeadItem["status"]) || "NEW",
    notes: row.notes ? String(row.notes) : "",
    utmSource: row.utm_source ? String(row.utm_source) : undefined,
    utmMedium: row.utm_medium ? String(row.utm_medium) : undefined,
    utmCampaign: row.utm_campaign ? String(row.utm_campaign) : undefined,
    submittedAt: row.submitted_at instanceof Date 
      ? row.submitted_at.toISOString() 
      : String(row.submitted_at || new Date().toISOString()),
    updatedAt: row.updated_at instanceof Date 
      ? row.updated_at.toISOString() 
      : String(row.updated_at || new Date().toISOString()),
  };
}

export async function getLeads(filters?: {
  status?: string | null;
  branch?: string | null;
  search?: string | null;
}): Promise<LeadItem[]> {
  const sql = getSql();

  if (sql) {
    try {
      await initDb();
      const rows = (await sql`
        SELECT * FROM leads 
        ORDER BY submitted_at DESC;
      `) as unknown as Record<string, unknown>[];

      let leads: LeadItem[] = rows.map(mapRowToLead);

      if (filters?.status && filters.status !== "ALL") {
        leads = leads.filter((l) => l.status === filters.status);
      }
      if (filters?.branch && filters.branch !== "ALL") {
        leads = leads.filter((l) => l.branch === filters.branch);
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        leads = leads.filter(
          (l) =>
            l.name.toLowerCase().includes(query) ||
            l.phone.includes(query) ||
            (l.email && l.email.toLowerCase().includes(query))
        );
      }

      return leads;
    } catch (err) {
      console.error("Neon DB query error, using fallback JSON:", err);
    }
  }

  // Fallback
  let leads = await readFallbackLeads();
  if (filters?.status && filters.status !== "ALL") {
    leads = leads.filter((l) => l.status === filters.status);
  }
  if (filters?.branch && filters.branch !== "ALL") {
    leads = leads.filter((l) => l.branch === filters.branch);
  }
  if (filters?.search) {
    const query = filters.search.toLowerCase();
    leads = leads.filter(
      (l) =>
        l.name.toLowerCase().includes(query) ||
        l.phone.includes(query) ||
        (l.email && l.email.toLowerCase().includes(query))
    );
  }
  return leads;
}

export async function createLead(lead: LeadItem): Promise<LeadItem> {
  const sql = getSql();

  if (sql) {
    try {
      await initDb();
      await sql`
        INSERT INTO leads (
          id, name, phone, email, age_category, branch, program, slot,
          message, status, notes, utm_source, utm_medium, utm_campaign,
          submitted_at, updated_at
        ) VALUES (
          ${lead.id}, ${lead.name}, ${lead.phone}, ${lead.email || null},
          ${lead.ageCategory}, ${lead.branch}, ${lead.program}, ${lead.slot},
          ${lead.message || ""}, ${lead.status}, ${lead.notes || ""},
          ${lead.utmSource || null}, ${lead.utmMedium || null}, ${lead.utmCampaign || null},
          ${lead.submittedAt}, ${lead.updatedAt || lead.submittedAt}
        );
      `;
    } catch (err) {
      console.error("Failed to insert lead into Neon DB, updating fallback JSON:", err);
    }
  }

  // Also maintain local fallback JSON for reliability
  const fallbackLeads = await readFallbackLeads();
  await saveFallbackLeads([lead, ...fallbackLeads]);

  return lead;
}

export async function updateLead(
  id: string,
  updates: { status?: LeadItem["status"]; notes?: string }
): Promise<LeadItem | null> {
  const now = new Date().toISOString();
  const sql = getSql();

  if (sql) {
    try {
      await initDb();
      if (updates.status && typeof updates.notes === "string") {
        await sql`
          UPDATE leads
          SET status = ${updates.status}, notes = ${updates.notes}, updated_at = ${now}
          WHERE id = ${id};
        `;
      } else if (updates.status) {
        await sql`
          UPDATE leads
          SET status = ${updates.status}, updated_at = ${now}
          WHERE id = ${id};
        `;
      } else if (typeof updates.notes === "string") {
        await sql`
          UPDATE leads
          SET notes = ${updates.notes}, updated_at = ${now}
          WHERE id = ${id};
        `;
      }

      const rows = (await sql`SELECT * FROM leads WHERE id = ${id} LIMIT 1;`) as unknown as Record<string, unknown>[];
      if (rows.length > 0) {
        const updated = mapRowToLead(rows[0]);
        // Sync fallback JSON
        const fallbackLeads = await readFallbackLeads();
        const idx = fallbackLeads.findIndex((l) => l.id === id);
        if (idx !== -1) {
          fallbackLeads[idx] = updated;
          await saveFallbackLeads(fallbackLeads);
        }
        return updated;
      }
    } catch (err) {
      console.error("Failed to update lead in Neon DB:", err);
    }
  }

  // Fallback update
  const fallbackLeads = await readFallbackLeads();
  const idx = fallbackLeads.findIndex((l) => l.id === id);
  if (idx === -1) return null;

  if (updates.status) fallbackLeads[idx].status = updates.status;
  if (typeof updates.notes === "string") fallbackLeads[idx].notes = updates.notes;
  fallbackLeads[idx].updatedAt = now;

  await saveFallbackLeads(fallbackLeads);
  return fallbackLeads[idx];
}

export async function deleteLead(id: string): Promise<boolean> {
  const sql = getSql();

  if (sql) {
    try {
      await initDb();
      await sql`DELETE FROM leads WHERE id = ${id};`;
    } catch (err) {
      console.error("Failed to delete lead from Neon DB:", err);
    }
  }

  // Fallback
  const fallbackLeads = await readFallbackLeads();
  const filtered = fallbackLeads.filter((l) => l.id !== id);
  await saveFallbackLeads(filtered);
  return true;
}
