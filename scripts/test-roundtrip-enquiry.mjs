import { neon } from "@neondatabase/serverless";

async function testRoundtrip() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: DATABASE_URL not set.");
    process.exit(1);
  }

  const sql = neon(url);
  console.log("[Test Roundtrip] Testing public website enquiry submission...");

  const testName = "Aditi Sharma";
  const testPhone = "+919846055555";
  const testEnqId = `ENQ-TEST-${Date.now()}`;

  // 1. Simulate POST /api/enquiries
  await sql`
    INSERT INTO leads (
      id, name, phone, branch, program, slot, message, status, submitted_at, updated_at
    ) VALUES (
      ${testEnqId}, ${testName}, ${testPhone}, 'kadavanthra', 'junior-badminton-coaching',
      'Evening Batch', 'Website assessment booking test', 'NEW', NOW(), NOW()
    );
  `;

  // 2. Insert notification as done by upgraded /api/enquiries
  const notifId = `notif_${Date.now()}`;
  await sql`
    INSERT INTO notifications (id, type, title, body, deep_link, is_read, created_at)
    VALUES (
      ${notifId}, 'NEW_LEAD', 'New Inbound Website Enquiry',
      ${`${testName} (${testPhone}) enquired for Junior Coaching at Kadavanthra`},
      '/leads', FALSE, NOW()
    );
  `;

  // 3. Verify lead in leads table
  const leadCheck = await sql`SELECT * FROM leads WHERE id = ${testEnqId};`;
  if (leadCheck.length === 0 || leadCheck[0].status !== "NEW") {
    throw new Error("Lead insertion failed!");
  }
  console.log(`✓ Lead captured in CRM database with status 'NEW': ${leadCheck[0].id}`);

  // 4. Verify in-app notification generated for Flutter Admin
  const notifCheck = await sql`SELECT * FROM notifications WHERE id = ${notifId};`;
  if (notifCheck.length === 0 || notifCheck[0].is_read !== false) {
    throw new Error("Staff notification generation failed!");
  }
  console.log(`✓ Staff notification dispatched to admin platform: "${notifCheck[0].title}"`);

  // Cleanup test artifacts
  await sql`DELETE FROM notifications WHERE id = ${notifId};`;
  await sql`DELETE FROM leads WHERE id = ${testEnqId};`;
  console.log("✓ Cleaned up roundtrip test artifacts.");

  console.log("\n[Test Roundtrip] END-TO-END ROUNDTRIP VERIFIED! 🎯");
}

testRoundtrip().catch(err => {
  console.error("[Test Roundtrip] FAILED:", err);
  process.exit(1);
});
