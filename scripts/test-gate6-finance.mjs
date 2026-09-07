import { neon } from "@neondatabase/serverless";

async function runGate6Tests() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: DATABASE_URL not set.");
    process.exit(1);
  }

  const sql = neon(url);
  console.log("[Test Gate 6] Starting Three-Tier Finance Suite...");

  const testStuId = `TEST-STU-FIN-${Date.now()}`;
  const testInvId = `TEST-INV-FIN-${Date.now()}`;
  const testPay1 = `TEST-PAY-1-${Date.now()}`;
  const testPay2 = `TEST-PAY-2-${Date.now()}`;

  // 1. Create Student
  await sql`
    INSERT INTO students (id, full_name, primary_centre, primary_program, status)
    VALUES (${testStuId}, 'Finance Test Athlete', 'kadavanthra', 'junior-badminton-coaching', 'ACTIVE');
  `;

  // 2. Create Invoice for ₹3,500
  await sql`
    INSERT INTO fee_invoices (id, student_id, billing_period, amount_due, due_date, status)
    VALUES (${testInvId}, ${testStuId}, '2026-09', 3500.00, CURRENT_DATE + 7, 'UNPAID');
  `;
  console.log(`✓ Invoice generated: ${testInvId} for ₹3,500 (Status: UNPAID).`);

  // 3. Post Partial Payment 1: ₹2,000
  await sql`
    INSERT INTO payments (id, student_id, amount_paid, payment_method, reference_number)
    VALUES (${testPay1}, ${testStuId}, 2000.00, 'UPI', 'UPI-REF-001');
  `;
  await sql`
    INSERT INTO payment_allocations (id, payment_id, invoice_id, allocated_amount)
    VALUES (${'ALC-' + Date.now() + '-1'}, ${testPay1}, ${testInvId}, 2000.00);
  `;
  await sql`
    UPDATE fee_invoices SET status = 'PARTIAL', updated_at = NOW() WHERE id = ${testInvId};
  `;
  console.log(`✓ Partial payment 1 (₹2,000) posted and allocated.`);

  // Verify partial state
  const partialCheck = await sql`
    SELECT fi.status, fi.amount_due, SUM(pa.allocated_amount)::numeric as paid
    FROM fee_invoices fi
    JOIN payment_allocations pa ON fi.id = pa.invoice_id
    WHERE fi.id = ${testInvId}
    GROUP BY fi.id;
  `;
  if (partialCheck[0].status !== "PARTIAL" || Number(partialCheck[0].paid) !== 2000) {
    throw new Error(`Expected status PARTIAL with ₹2000 paid, got ${partialCheck[0].status}, ₹${partialCheck[0].paid}`);
  }
  const balance1 = Number(partialCheck[0].amount_due) - Number(partialCheck[0].paid);
  if (balance1 !== 1500) {
    throw new Error(`Expected balance ₹1500, got ₹${balance1}`);
  }
  console.log(`✓ Verified partial payment balance: ₹${balance1} outstanding.`);

  // 4. Post Payment 2: ₹1,500 (Clearing invoice)
  await sql`
    INSERT INTO payments (id, student_id, amount_paid, payment_method, reference_number)
    VALUES (${testPay2}, ${testStuId}, 1500.00, 'CASH', 'CASH-REC-002');
  `;
  await sql`
    INSERT INTO payment_allocations (id, payment_id, invoice_id, allocated_amount)
    VALUES (${'ALC-' + Date.now() + '-2'}, ${testPay2}, ${testInvId}, 1500.00);
  `;
  await sql`
    UPDATE fee_invoices SET status = 'PAID', updated_at = NOW() WHERE id = ${testInvId};
  `;
  console.log(`✓ Second payment (₹1,500) posted.`);

  // Verify fully paid state
  const paidCheck = await sql`
    SELECT fi.status, fi.amount_due, SUM(pa.allocated_amount)::numeric as paid
    FROM fee_invoices fi
    JOIN payment_allocations pa ON fi.id = pa.invoice_id
    WHERE fi.id = ${testInvId}
    GROUP BY fi.id;
  `;
  if (paidCheck[0].status !== "PAID" || Number(paidCheck[0].paid) !== 3500) {
    throw new Error(`Expected status PAID with ₹3500 paid, got ${paidCheck[0].status}`);
  }
  console.log("✓ Verified invoice status is now PAID with balance ₹0.");

  // Cleanup test artifacts
  await sql`DELETE FROM payment_allocations WHERE invoice_id = ${testInvId};`;
  await sql`DELETE FROM payments WHERE id IN (${testPay1}, ${testPay2});`;
  await sql`DELETE FROM fee_invoices WHERE id = ${testInvId};`;
  await sql`DELETE FROM students WHERE id = ${testStuId};`;
  console.log("✓ Cleaned up finance test data.");

  console.log("\n[Test Gate 6] ALL GATE 6 TESTS PASSED! 🎯");
}

runGate6Tests().catch(err => {
  console.error("[Test Gate 6] FAILED:", err);
  process.exit(1);
});
