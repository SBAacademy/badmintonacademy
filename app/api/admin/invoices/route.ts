import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// 1. GET /api/admin/invoices: List fee invoices with balance calculation
export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "FRONT_DESK"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const centre = searchParams.get("centre");
    const period = searchParams.get("period"); // e.g. '2026-09'

    let query = `
      SELECT 
        fi.*,
        s.full_name as student_name,
        s.primary_centre as centre_slug,
        cen.name as centre_name,
        prg.name as program_name,
        p.full_name as parent_name,
        p.phone as parent_phone,
        COALESCE(SUM(pa.allocated_amount), 0)::numeric as paid_amount,
        (fi.amount_due - COALESCE(SUM(pa.allocated_amount), 0))::numeric as balance_due
      FROM fee_invoices fi
      JOIN students s ON fi.student_id = s.id
      LEFT JOIN parents p ON s.parent_id = p.id
      LEFT JOIN centres cen ON s.primary_centre = cen.slug
      LEFT JOIN programs prg ON s.primary_program = prg.slug
      LEFT JOIN payment_allocations pa ON fi.id = pa.invoice_id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (status && status !== "ALL") {
      params.push(status);
      query += ` AND fi.status = $${params.length}`;
    }

    if (centre && centre !== "ALL") {
      params.push(centre);
      query += ` AND s.primary_centre = $${params.length}`;
    }

    if (period && period !== "ALL") {
      params.push(period);
      query += ` AND fi.billing_period = $${params.length}`;
    }

    query += `
      GROUP BY fi.id, s.full_name, s.primary_centre, cen.name, prg.name, p.full_name, p.phone
      ORDER BY fi.due_date DESC, fi.created_at DESC LIMIT 100;
    `;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (sql as any).query(query, params);

    return NextResponse.json({
      success: true,
      data: {
        total: rows.length,
        invoices: rows,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/invoices error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch invoices." }, { status: 500 });
  }
}

// 2. POST /api/admin/invoices: Generate fee invoice for a student or batch
export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const body = await request.json();
    const { studentId, billingPeriod, amountDue, dueDate, notes } = body;

    if (!studentId || !billingPeriod || !amountDue || !dueDate) {
      return NextResponse.json(
        { success: false, error: "studentId, billingPeriod, amountDue, and dueDate are required." },
        { status: 400 }
      );
    }

    const invoiceId = `INV-${Date.now()}`;

    await sql`
      INSERT INTO fee_invoices (
        id, student_id, billing_period, amount_due, due_date, status, notes, created_at, updated_at
      ) VALUES (
        ${invoiceId},
        ${studentId},
        ${billingPeriod},
        ${amountDue},
        ${dueDate},
        'UNPAID',
        ${notes || null},
        NOW(),
        NOW()
      );
    `;

    // Audit log
    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: "INVOICE_GENERATED",
      entity: "fee_invoices",
      entityId: invoiceId,
      newData: { studentId, billingPeriod, amountDue, dueDate },
    });

    return NextResponse.json({
      success: true,
      message: "Fee invoice generated successfully.",
      data: { invoiceId },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/invoices error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate invoice." }, { status: 500 });
  }
}
