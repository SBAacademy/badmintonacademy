import { neon } from "@neondatabase/serverless";
import fs from "fs/promises";
import path from "path";

async function backup() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: DATABASE_URL not set.");
    process.exit(1);
  }

  const sql = neon(url);
  const backupDir = path.join(process.cwd(), "data", "backups");
  await fs.mkdir(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(backupDir, `neon_backup_${timestamp}.json`);

  console.log(`[Backup] Starting pre-flight database backup at ${new Date().toISOString()}...`);

  // Query existing tables
  const leads = await sql`SELECT * FROM leads ORDER BY submitted_at DESC;`;
  const siteContent = await sql`SELECT * FROM site_content ORDER BY section ASC;`;
  const uploadedImages = await sql`SELECT id, filename, mime_type, size, created_at FROM uploaded_images ORDER BY created_at DESC;`;

  const backupData = {
    timestamp: new Date().toISOString(),
    databaseUrlMasked: url.replace(/:[^:@]+@/, ":***@"),
    tables: {
      leads: {
        count: leads.length,
        rows: leads,
      },
      site_content: {
        count: siteContent.length,
        rows: siteContent,
      },
      uploaded_images: {
        count: uploadedImages.length,
        rows: uploadedImages,
      },
    },
  };

  await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2), "utf-8");
  console.log(`[Backup] SUCCESS! Dumped ${leads.length} leads, ${siteContent.length} content sections, ${uploadedImages.length} image references.`);
  console.log(`[Backup] Saved to: ${backupFile}`);
}

backup().catch((err) => {
  console.error("[Backup] FAILED:", err);
  process.exit(1);
});
