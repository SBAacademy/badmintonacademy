import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// 1. GET /api/admin/payments: List payment transactions
export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const rows = await sql`
      SELECT 
        p.*,
        s.full_name as student_name,
        s.primary_centre as centre_slug,
        u.full_name as received_by_name,
        COALESCE(
          json_agg(
            json_build_object(
              'invoiceId', pa.invoice_id,
              'allocatedAmount', pa.allocated_amount
            )
          ) FILTER (WHERE pa.id IS NOT NULL),
          '[]'
        ) as allocations
      FROM payments p
      JOIN students s ON p.student_id = s.id
      LEFT JOIN users u ON p.received_by_user_id = u.id
      LEFT JOIN payment_allocations pa ON p.id = pa.payment_id
      GROUP BY p.id, s.full_name, s.primary_centre, u.full_name
      ORDER BY p.payment_date DESC, p.created_at DESC
      LIMIT 100;
    `;

    return NextResponse.json({
      success: true,
      data: {
        total: rows.length,
        payments: rows,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/payments error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch payments." }, { status: 500 });
  }
}

// 2. POST /api/admin/payments: Record payment and allocate across invoices
export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "FRONT_DESK"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const body = await request.json();
    const {
      studentId,
      amountPaid,
      paymentMethod,
      referenceNumber,
      invoiceId, // Optional specific invoice; if omitted, auto-allocates oldest unpaid
      notes,
    } = body;

    if (!studentId || !amountPaid || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "studentId, amountPaid, and paymentMethod are required." },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amountPaid);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid payment amount." }, { status: 400 });
    }

    const paymentId = `PAY-${Date.now()}`;

    // 1. Insert Payment record
    await sql`
      INSERT INTO payments (
        id, student_id, amount_paid, payment_date, payment_method,
        reference_number, received_by_user_id, notes, created_at
      ) VALUES (
        ${paymentId},
        ${studentId},
        ${numAmount},
        CURRENT_DATE,
        ${paymentMethod},
        ${referenceNumber || null},
        ${auth.user.userId},
        ${notes || null},
        NOW()
      );
    `;

    // 2. Allocate payment
    let remainingToAllocate = numAmount;

    // Fetch open invoices for student
    let openInvoices;
    if (invoiceId) {
      openInvoices = await sql`
        SELECT fi.*, COALESCE(SUM(pa.allocated_amount), 0)::numeric as paid_so_far
        FROM fee_invoices fi
        LEFT JOIN payment_allocations pa ON fi.id = pa.invoice_id
        WHERE fi.id = ${invoiceId}
        GROUP BY fi.id;
      `;
    } else {
      openInvoices = await sql`
        SELECT fi.*, COALESCE(SUM(pa.allocated_amount), 0)::numeric as paid_so_far
        FROM fee_invoices fi
        LEFT JOIN payment_allocations pa ON fi.id = pa.invoice_id
        WHERE fi.student_id = ${studentId} AND fi.status IN ('UNPAID', 'PARTIAL', 'OVERDUE')
        GROUP BY fi.id
        ORDER BY fi.due_date ASC;
      `;
    }

    const allocationsRecorded = [];

    for (const inv of openInvoices) {
      if (remainingToAllocate <= 0) break;

      const outstanding = Number(inv.amount_due) - Number(inv.paid_so_far);
      if (outstanding <= 0) continue;

      const allocAmount = Math.min(remainingToAllocate, outstanding);
      const allocId = `ALC-${Date.now()}-${inv.id.substring(4, 10)}`;

      await sql`
        INSERT INTO payment_allocations (id, payment_id, invoice_id, allocated_amount, created_at)
        VALUES (${allocId}, ${paymentId}, ${inv.id}, ${allocAmount}, NOW());
      `;

      allocationsRecorded.push({ invoiceId: inv.id, amount: allocAmount });
      remainingToAllocate -= allocAmount;

      // Update invoice status
      const totalPaidNow = Number(inv.paid_so_far) + allocAmount;
      const newStatus = totalPaidNow >= Number(inv.amount_due) ? 'PAID' : 'PARTIAL';

      await sql`
        UPDATE fee_invoices
        SET status = ${newStatus}, updated_at = NOW()
        WHERE id = ${inv.id};
      `;
    }

    // Audit log
    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: "PAYMENT_RECORDED",
      entity: "payments",
      entityId: paymentId,
      newData: { studentId, amountPaid: numAmount, method: paymentMethod, allocations: allocationsRecorded },
    });

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${numAmount} logged and allocated successfully.`,
      data: {
        paymentId,
        amountPaid: numAmount,
        allocations: allocationsRecorded,
        unallocatedRemainder: remainingToAllocate,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/payments error:", error);
    return NextResponse.json({ success: false, error: "Failed to record payment." }, { status: 500 });
  }
}
