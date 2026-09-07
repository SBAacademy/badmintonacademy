import { neon } from "@neondatabase/serverless";

async function runGate5Tests() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: DATABASE_URL not set.");
    process.exit(1);
  }

  const sql = neon(url);
  console.log("[Test Gate 5] Starting Batches, Sessions & Attendance Suite...");

  const testBatchId = `TEST-BAT-${Date.now()}`;
  const testSessionId = `TEST-SES-${Date.now()}`;
  const testStu1 = `TEST-STU-A-${Date.now()}`;
  const testStu2 = `TEST-STU-B-${Date.now()}`;

  // 1. Create Test Batch
  await sql`
    INSERT INTO batches (id, name, centre_slug, program_slug, days_of_week, start_time, end_time, capacity, status)
    VALUES (${testBatchId}, 'Test Batch Kadavanthra', 'kadavanthra', 'junior-badminton-coaching', ARRAY['MON', 'WED', 'FRI'], '16:30', '18:00', 12, 'ACTIVE');
  `;
  console.log(`✓ Batch created: ${testBatchId}`);

  // 2. Create Test Students & Enroll
  await sql`
    INSERT INTO students (id, full_name, primary_centre, primary_program, status)
    VALUES 
      (${testStu1}, 'Athlete Alpha', 'kadavanthra', 'junior-badminton-coaching', 'ACTIVE'),
      (${testStu2}, 'Athlete Beta', 'kadavanthra', 'junior-badminton-coaching', 'ACTIVE');
  `;
  await sql`
    INSERT INTO batch_students (batch_id, student_id, status)
    VALUES 
      (${testBatchId}, ${testStu1}, 'ACTIVE'),
      (${testBatchId}, ${testStu2}, 'ACTIVE');
  `;
  console.log(`✓ Two athletes enrolled in batch.`);

  // 3. Create Session
  const today = new Date().toISOString().split("T")[0];
  await sql`
    INSERT INTO sessions (id, batch_id, centre_slug, session_date, start_time, end_time, status)
    VALUES (${testSessionId}, ${testBatchId}, 'kadavanthra', ${today}, '16:30', '18:00', 'SCHEDULED');
  `;
  console.log(`✓ Session scheduled: ${testSessionId} on ${today}`);

  // 4. Mark Attendance
  const att1 = `ATT-${testSessionId}-${testStu1}`;
  const att2 = `ATT-${testSessionId}-${testStu2}`;

  await sql`
    INSERT INTO attendance (id, session_id, student_id, status, marked_at)
    VALUES 
      (${att1}, ${testSessionId}, ${testStu1}, 'PRESENT', NOW()),
      (${att2}, ${testSessionId}, ${testStu2}, 'LATE', NOW());
  `;
  console.log(`✓ Attendance marked for both athletes.`);

  // 5. Test Duplicate Prevention Constraint uq_session_student
  let caughtDuplicate = false;
  try {
    // Attempting raw INSERT without ON CONFLICT to test that the DB constraint fires
    await sql`
      INSERT INTO attendance (id, session_id, student_id, status, marked_at)
      VALUES ('ATT-DUP-FAIL', ${testSessionId}, ${testStu1}, 'ABSENT', NOW());
    `;
  } catch (err) {
    if (err.message && (err.message.includes("uq_session_student") || err.message.includes("duplicate key"))) {
      caughtDuplicate = true;
    }
  }

  if (!caughtDuplicate) {
    throw new Error("CRITICAL FAILURE: Database-level unique constraint 'uq_session_student' failed to fire!");
  }
  console.log("✓ Database constraint 'uq_session_student' correctly rejected duplicate attendance row.");

  // 6. Test Upsert Logic (simulating teacher updating an existing attendance record)
  await sql`
    INSERT INTO attendance (id, session_id, student_id, status, coach_note, marked_at)
    VALUES ('ATT-RETRY', ${testSessionId}, ${testStu1}, 'EXCUSED', 'Medical excuse provided', NOW())
    ON CONFLICT (session_id, student_id) DO UPDATE SET
      status = EXCLUDED.status,
      coach_note = EXCLUDED.coach_note;
  `;

  const updatedRec = await sql`
    SELECT status, coach_note FROM attendance WHERE session_id = ${testSessionId} AND student_id = ${testStu1};
  `;
  if (updatedRec[0].status !== "EXCUSED" || updatedRec[0].coach_note !== "Medical excuse provided") {
    throw new Error("Attendance upsert failed!");
  }
  console.log("✓ Attendance status update & coach notes upsert verified.");

  // Verify total attendance count in session is exactly 2 (no duplicates created)
  const totalAtt = await sql`
    SELECT COUNT(*)::int as count FROM attendance WHERE session_id = ${testSessionId};
  `;
  if (totalAtt[0].count !== 2) {
    throw new Error(`Expected exactly 2 attendance records, got ${totalAtt[0].count}`);
  }
  console.log("✓ Verified exactly 2 attendance records in session (zero duplicate pollution).");

  // Cleanup test artifacts
  await sql`DELETE FROM attendance WHERE session_id = ${testSessionId};`;
  await sql`DELETE FROM sessions WHERE id = ${testSessionId};`;
  await sql`DELETE FROM batch_students WHERE batch_id = ${testBatchId};`;
  await sql`DELETE FROM batches WHERE id = ${testBatchId};`;
  await sql`DELETE FROM students WHERE id IN (${testStu1}, ${testStu2});`;
  console.log("✓ Cleaned up test data.");

  console.log("\n[Test Gate 5] ALL GATE 5 TESTS PASSED! 🎯");
}

runGate5Tests().catch(err => {
  console.error("[Test Gate 5] FAILED:", err);
  process.exit(1);
});
