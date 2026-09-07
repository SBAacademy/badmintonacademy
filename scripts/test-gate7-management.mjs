import { neon } from "@neondatabase/serverless";

async function runGate7Tests() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: DATABASE_URL not set.");
    process.exit(1);
  }

  const sql = neon(url);
  console.log("[Test Gate 7] Starting Academy Management & CMS Suite...");

  // 1. Verify Coaches Directory
  const coaches = await sql`SELECT id, name, role, primary_centre FROM coaches ORDER BY name;`;
  if (coaches.length !== 4) {
    throw new Error(`Expected 4 verified coaches, found ${coaches.length}`);
  }
  console.log(`✓ Coaches directory verified (4 verified coaches present):`, coaches.map(c => c.name));

  // 2. Test Performance Assessment
  const testStuId = `TEST-STU-PERF-${Date.now()}`;
  await sql`
    INSERT INTO students (id, full_name, primary_centre, primary_program, status)
    VALUES (${testStuId}, 'Performance Athlete', 'kadavanthra', 'competitive-badminton-training', 'ACTIVE');
  `;

  const perfId = `TEST-PRF-${Date.now()}`;
  await sql`
    INSERT INTO performance_assessments (
      id, student_id, coach_id, assessment_date,
      footwork_score, technique_score, fitness_score, tactical_score, consistency_score, notes
    ) VALUES (
      ${perfId}, ${testStuId}, 'anand-varma', CURRENT_DATE,
      8.5, 9.0, 8.0, 7.5, 8.0, 'Excellent overhead slice and recovery.'
    );
  `;

  const perfQuery = await sql`
    SELECT * FROM performance_assessments WHERE id = ${perfId};
  `;
  if (perfQuery.length === 0 || Number(perfQuery[0].technique_score) !== 9.0) {
    throw new Error("Performance assessment recording failed!");
  }
  console.log(`✓ Performance assessment logged: Technique 9.0, Footwork 8.5.`);

  // 3. Test Reports Aggregation
  const leadsCount = await sql`SELECT COUNT(*)::int as count FROM leads;`;
  const studentsCount = await sql`SELECT COUNT(*)::int as count FROM students WHERE status = 'ACTIVE';`;
  console.log(`✓ Reports aggregation query verified (Live leads: ${leadsCount[0].count}, Active students: ${studentsCount[0].count}).`);

  // 4. Test CMS site_content
  const cmsSections = await sql`SELECT section, jsonb_array_length(data) as count FROM site_content;`;
  if (cmsSections.length < 5) {
    throw new Error(`Expected at least 5 CMS sections, found ${cmsSections.length}`);
  }
  console.log(`✓ CMS gateway verified across ${cmsSections.length} live sections.`);

  // Cleanup test data
  await sql`DELETE FROM performance_assessments WHERE id = ${perfId};`;
  await sql`DELETE FROM students WHERE id = ${testStuId};`;
  console.log("✓ Cleaned up performance test data.");

  console.log("\n[Test Gate 7] ALL GATE 7 TESTS PASSED! 🎯");
}

runGate7Tests().catch(err => {
  console.error("[Test Gate 7] FAILED:", err);
  process.exit(1);
});
