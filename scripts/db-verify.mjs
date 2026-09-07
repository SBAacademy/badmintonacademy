import { neon } from "@neondatabase/serverless";

async function verify() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: DATABASE_URL not set.");
    process.exit(1);
  }

  const sql = neon(url);
  console.log("[Verification] Checking database tables and row counts...");

  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;

  console.log(`[Verification] Detected ${tables.length} tables:`, tables.map(t => t.table_name));

  // Verify counts
  const leadsCount = (await sql`SELECT COUNT(*)::int as count FROM leads`)[0].count;
  const siteContentCount = (await sql`SELECT COUNT(*)::int as count FROM site_content`)[0].count;
  const uploadedImagesCount = (await sql`SELECT COUNT(*)::int as count FROM uploaded_images`)[0].count;
  const centresCount = (await sql`SELECT COUNT(*)::int as count FROM centres`)[0].count;
  const programsCount = (await sql`SELECT COUNT(*)::int as count FROM programs`)[0].count;
  const coachesCount = (await sql`SELECT COUNT(*)::int as count FROM coaches`)[0].count;
  const usersCount = (await sql`SELECT COUNT(*)::int as count FROM users`)[0].count;
  const auditLogsCount = (await sql`SELECT COUNT(*)::int as count FROM audit_logs`)[0].count;

  console.log(`[Verification] Row counts:
  - leads: ${leadsCount} (Expected: 5, Preserved: ${leadsCount === 5})
  - site_content: ${siteContentCount} (Expected: 5)
  - uploaded_images: ${uploadedImagesCount} (Expected: 2)
  - centres: ${centresCount} (Expected: 3 canonical)
  - programs: ${programsCount} (Expected: 5 canonical)
  - coaches: ${coachesCount} (Expected: 4 verified)
  - users: ${usersCount} (Expected: 2 bootstrapped)
  - audit_logs: ${auditLogsCount} (Expected: >=1)
  `);

  if (leadsCount !== 5) {
    throw new Error(`Data loss in leads! Expected 5, got ${leadsCount}`);
  }
  if (centresCount !== 3) {
    throw new Error(`Centres count mismatch! Expected 3 canonical, got ${centresCount}`);
  }

  // Verify attendance unique constraint
  const constraints = await sql`
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'attendance'::regclass AND conname = 'uq_session_student';
  `;

  if (constraints.length === 0) {
    throw new Error("Missing required unique constraint 'uq_session_student' on attendance table!");
  }
  console.log("[Verification] Verified 'uq_session_student' constraint on attendance table!");

  console.log("[Verification] GATE 1 VERIFICATION PASSED SUCCESSFULLY! 🎯");
}

verify().catch(err => {
  console.error("[Verification] FAILED:", err);
  process.exit(1);
});
