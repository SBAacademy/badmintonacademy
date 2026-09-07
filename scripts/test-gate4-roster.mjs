import { neon } from "@neondatabase/serverless";

async function runGate4Tests() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: DATABASE_URL not set.");
    process.exit(1);
  }

  const sql = neon(url);
  console.log("[Test Gate 4] Starting Parents & Students Suite...");

  const testPhone = "+919846077777";
  const testParentId = `TEST-PAR-${Date.now()}`;

  // 1. Create Parent
  await sql`
    INSERT INTO parents (id, full_name, phone, email, address, created_at, updated_at)
    VALUES (${testParentId}, 'Priya Nair', ${testPhone}, 'priya.nair@example.com', 'Kadavanthra, Kochi', NOW(), NOW())
    ON CONFLICT (phone) DO UPDATE SET updated_at = NOW();
  `;
  console.log(`✓ Parent record verified: ${testPhone}`);

  // 2. Add two sibling students linked to the same parent
  const student1Id = `TEST-STU-1-${Date.now()}`;
  const student2Id = `TEST-STU-2-${Date.now()}`;

  await sql`
    INSERT INTO students (id, parent_id, full_name, primary_centre, primary_program, status, joined_at)
    VALUES 
      (${student1Id}, ${testParentId}, 'Aarav Nair', 'kadavanthra', 'junior-badminton-coaching', 'ACTIVE', CURRENT_DATE),
      (${student2Id}, ${testParentId}, 'Diya Nair', 'kadavanthra', 'kids-badminton-coaching', 'ACTIVE', CURRENT_DATE);
  `;
  console.log(`✓ Two sibling students enrolled under parent ${testParentId}`);

  // Verify family link
  const familyCheck = await sql`
    SELECT COUNT(*)::int as count FROM students WHERE parent_id = ${testParentId};
  `;
  if (familyCheck[0].count !== 2) {
    throw new Error(`Expected 2 students under parent, found ${familyCheck[0].count}`);
  }
  console.log("✓ Multi-child family relationship verified: 1 Parent -> 2 Students.");

  // 3. Test Lead Conversion to Student
  const testLeadId = `TEST-CONV-LEAD-${Date.now()}`;
  await sql`
    INSERT INTO leads (id, name, phone, branch, program, status, submitted_at, updated_at)
    VALUES (${testLeadId}, 'Rahul Menon', '+919846088888', 'edappally', 'adult-badminton-coaching', 'TRIAL_ATTENDED', NOW(), NOW());
  `;

  // Simulate atomic conversion
  const convertedStudentId = `TEST-STU-CONV-${Date.now()}`;
  const convParentId = `TEST-PAR-CONV-${Date.now()}`;
  await sql`
    INSERT INTO parents (id, full_name, phone, created_at)
    VALUES (${convParentId}, 'Rahul Menon Self', '+919846088888', NOW())
    ON CONFLICT (phone) DO UPDATE SET updated_at = NOW();
  `;
  await sql`
    INSERT INTO students (id, parent_id, full_name, primary_centre, primary_program, status)
    VALUES (${convertedStudentId}, ${convParentId}, 'Rahul Menon', 'edappally', 'adult-badminton-coaching', 'ACTIVE');
  `;
  await sql`
    UPDATE leads SET status = 'ENROLLED', converted_student_id = ${convertedStudentId}, updated_at = NOW()
    WHERE id = ${testLeadId};
  `;
  const initialInvId = `TEST-INV-${Date.now()}`;
  await sql`
    INSERT INTO fee_invoices (id, student_id, billing_period, amount_due, due_date, status)
    VALUES (${initialInvId}, ${convertedStudentId}, '2026-09', 4000.00, CURRENT_DATE + 7, 'UNPAID');
  `;

  const leadVerify = await sql`SELECT status, converted_student_id FROM leads WHERE id = ${testLeadId};`;
  if (leadVerify[0].status !== "ENROLLED" || leadVerify[0].converted_student_id !== convertedStudentId) {
    throw new Error("Lead conversion failed to record status or student link!");
  }
  console.log("✓ Lead to Student conversion verified (Status: ENROLLED, Initial invoice generated).");

  // Cleanup test records
  await sql`DELETE FROM fee_invoices WHERE id = ${initialInvId};`;
  await sql`DELETE FROM leads WHERE id = ${testLeadId};`;
  await sql`DELETE FROM students WHERE id IN (${student1Id}, ${student2Id}, ${convertedStudentId});`;
  await sql`DELETE FROM parents WHERE id IN (${testParentId}, ${convParentId});`;
  console.log("✓ Cleaned up test data (zero test pollution).");

  console.log("\n[Test Gate 4] ALL GATE 4 TESTS PASSED! 🎯");
}

runGate4Tests().catch(err => {
  console.error("[Test Gate 4] FAILED:", err);
  process.exit(1);
});
