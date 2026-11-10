import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env scripts/migrate-db.mjs");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runMigration() {
  console.log("Running one-time safe database schema verification and migration...");
  const t0 = performance.now();

  // 0. Leads table
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

  // 1. Site content key-value store
  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      section VARCHAR(64) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  const existing = (await sql`SELECT section FROM site_content;`);
  const existingSections = new Set(existing.map((r) => r.section));

  const defaults = {
    gallery: [],
    coaches: [],
    achievements: [],
    testimonials: [],
    blog: [],
    centres: [],
    programs: [],
    footer: {
      headquartersAddress: "SBA Sports Arena, Near Rajiv Gandhi Indoor Stadium, Kadavanthra, Kochi, Kerala 682020",
      phone: "+917907655513",
      phoneDisplay: "+91 79076 55513",
      email: "admissions@sabadminton.com",
      operatingHoursDays: "Monday – Sunday (7 Days Open)",
      operatingHoursMorning: "05:30 AM – 10:30 AM",
      operatingHoursEvening: "04:00 PM – 10:00 PM",
      whatsappNumber: "917907655513",
      whatsappButtonText: "WHATSAPP DESK",
      trialNote: "Shoes & racket required for free trial.",
      instagramUrl: "https://instagram.com/sabadmintonacademy",
      facebookUrl: "https://facebook.com/sabadmintonacademy",
      youtubeUrl: "https://youtube.com/@sabadmintonacademy",
      twitterUrl: "",
      linkedinUrl: "",
      description: "SBA Badminton Academy is a premier athletic badminton training institution in Kochi, offering dedicated synthetic court infrastructure, certified coaching faculty, video stroke analysis, and age-specific developmental pathways.",
      badge1: "BWF & NIS CERTIFIED FACULTY",
      badge2: "SPRUNG WOODEN SUBFLOORS",
      brandTagline: "REBEL PERFORMANCE // ATHLETIC TRAINING",
      academyName: "SBA BADMINTON ACADEMY"
    },
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

  // 2. Centres table
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

  // 3. Coaches columns
  await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT '{}';`;
  await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;`;
  await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;`;
  await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(32);`;
  await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS slug VARCHAR(128);`;
  await sql`ALTER TABLE coaches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();`;

  // 4. Coach photos table
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

  // 5. Events table
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      event_type VARCHAR(64) NOT NULL DEFAULT 'TOURNAMENT',
      event_date VARCHAR(64) NOT NULL,
      start_time VARCHAR(32),
      end_time VARCHAR(32),
      venue VARCHAR(255) NOT NULL,
      centre_slug VARCHAR(64) REFERENCES centres(slug) ON DELETE SET NULL,
      image TEXT,
      registration_url TEXT,
      contact VARCHAR(128),
      status VARCHAR(32) NOT NULL DEFAULT 'UPCOMING',
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      is_published BOOLEAN NOT NULL DEFAULT TRUE,
      display_order INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date ASC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_events_centre ON events(centre_slug);`;

  const t1 = performance.now();
  console.log(`Migration and schema check completed successfully in ${(t1 - t0).toFixed(2)} ms.`);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
