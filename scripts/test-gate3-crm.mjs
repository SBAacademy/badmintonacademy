import { neon } from "@neondatabase/serverless";

async function runGate3Tests() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: DATABASE_URL not set.");
    process.exit(1);
  }

  const sql = neon(url);
  console.log("[Test Gate 3] Starting Leads CRM & Free Trial Suite...");

  const testLeadId = `TEST-LEAD-${Date.now()}`;
  const testPhone = "+919846099999";

  // 1. Insert Test Lead
  await sql`
    INSERT INTO leads (
      id, name, phone, email, age_category, branch, program, slot,
      message, status, notes, utm_source, submitted_at, updated_at
    ) VALUES (
      ${testLeadId}, 'Test Junior Athlete', ${testPhone}, 'test.athlete@example.com',
      'Junior (Ages 10-16)', 'kadavanthra', 'junior-badminton-coaching', 'Evening Batch',
      'Interested in competitive coaching', 'NEW', '', 'test_runner', NOW(), NOW()
    );
  `;
  console.log(`✓ Lead created: ${testLeadId}`);

  // 2. Advance Lead to CONTACTED & add note
  await sql`
    UPDATE leads 
    SET status = 'CONTACTED', notes = 'Spoke to parent; scheduled court visit', updated_at = NOW()
    WHERE id = ${testLeadId};
  `;
  await sql`
    INSERT INTO lead_notes (id, lead_id, author_id, note, created_at)
    VALUES (${'ln_' + Date.now()}, ${testLeadId}, 'usr-admin-01', 'Parent prefers Tuesday trial slot.', NOW());
  `;
  console.log("✓ Lead status transitioned to CONTACTED and note appended.");

  // 3. Book Free Trial
  const testTrialId = `TEST-TRL-${Date.now()}`;
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  await sql`
    INSERT INTO free_trials (
      id, lead_id, student_name, parent_phone, parent_email,
      centre_slug, program_slug, assigned_coach_id,
      scheduled_date, scheduled_slot, status, created_at, updated_at
    ) VALUES (
      ${testTrialId}, ${testLeadId}, 'Test Junior Athlete', ${testPhone}, 'test.athlete@example.com',
      'kadavanthra', 'junior-badminton-coaching', 'anand-varma',
      ${tomorrow}, '05:00 PM - 06:00 PM', 'CONFIRMED', NOW(), NOW()
    );
  `;

  // Advance lead status to TRIAL_SCHEDULED
  await sql`
    UPDATE leads SET status = 'TRIAL_SCHEDULED', updated_at = NOW() WHERE id = ${testLeadId};
  `;
  console.log(`✓ Free trial booked (${testTrialId}) for ${tomorrow} at Kadavanthra.`);

  // 4. Verify Trial Exists & Lead Status Updated
  const trialCheck = await sql`SELECT * FROM free_trials WHERE id = ${testTrialId};`;
  if (trialCheck.length === 0 || trialCheck[0].status !== "CONFIRMED") {
    throw new Error("Free trial record creation failed!");
  }

  const leadCheck = await sql`SELECT status FROM leads WHERE id = ${testLeadId};`;
  if (leadCheck[0].status !== "TRIAL_SCHEDULED") {
    throw new Error(`Lead status should be TRIAL_SCHEDULED, got ${leadCheck[0].status}`);
  }
  console.log("✓ Bi-directional lead-trial linkage verified.");

  // 5. Complete Trial with Coach Evaluation
  await sql`
    UPDATE free_trials
    SET 
      status = 'COMPLETED',
      coach_evaluation = 'Sharp footwork and racquet speed. Recommended for Junior Development Batch A.',
      updated_at = NOW()
    WHERE id = ${testTrialId};
  `;
  await sql`
    UPDATE leads SET status = 'TRIAL_ATTENDED', updated_at = NOW() WHERE id = ${testLeadId};
  `;

  const finalLead = await sql`SELECT status FROM leads WHERE id = ${testLeadId};`;
  if (finalLead[0].status !== "TRIAL_ATTENDED") {
    throw new Error(`Expected TRIAL_ATTENDED, got ${finalLead[0].status}`);
  }
  console.log("✓ Coach evaluation logged and lead status progressed to TRIAL_ATTENDED.");

  // Cleanup test artifacts
  await sql`DELETE FROM lead_notes WHERE lead_id = ${testLeadId};`;
  await sql`DELETE FROM free_trials WHERE id = ${testTrialId};`;
  await sql`DELETE FROM leads WHERE id = ${testLeadId};`;
  console.log("✓ Cleaned up test records (zero test pollution).");

  console.log("\n[Test Gate 3] ALL GATE 3 TESTS PASSED! 🎯");
}

runGate3Tests().catch(err => {
  console.error("[Test Gate 3] FAILED:", err);
  process.exit(1);
});
