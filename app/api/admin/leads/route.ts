import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// 1. GET /api/admin/leads: List and search leads
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
    const search = searchParams.get("search");

    let query = `SELECT * FROM leads WHERE 1=1`;
    const params: (string | number)[] = [];

    if (status && status !== "ALL") {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (centre && centre !== "ALL") {
      params.push(centre);
      query += ` AND branch = $${params.length}`;
    }

    if (search && search.trim() !== "") {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(phone) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`;
    }

    query += ` ORDER BY submitted_at DESC LIMIT 100;`;

    // Execute query via sql
    // For parameterized dynamic query in Neon, we can execute:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (sql as any).query(query, params);

    return NextResponse.json({
      success: true,
      data: {
        total: rows.length,
        leads: rows,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/leads error:", error);
    return NextResponse.json({ success: false, error: "Failed to retrieve leads." }, { status: 500 });
  }
}

// 2. POST /api/admin/leads: Create manual walk-in or phone enquiry lead
export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "FRONT_DESK"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const body = await request.json();
    const { name, phone, email, ageCategory, branch, program, slot, message, notes, followUpDate } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: "Name and Phone are mandatory." }, { status: 400 });
    }

    const cleanPhone = String(phone).replace(/[^0-9+]/g, "");
    const leadId = `LEAD-${Date.now()}`;

    await sql`
      INSERT INTO leads (
        id, name, phone, email, age_category, branch, program, slot,
        message, status, notes, utm_source, utm_medium, utm_campaign,
        assigned_staff_id, follow_up_date, submitted_at, updated_at
      ) VALUES (
        ${leadId},
        ${String(name).trim()},
        ${cleanPhone},
        ${email ? String(email).trim() : null},
        ${ageCategory || "Junior (Ages 10-16)"},
        ${branch || "kadavanthra"},
        ${program || "junior-badminton-coaching"},
        ${slot || "Evening (04:30 PM - 07:30 PM)"},
        ${message || "Walk-in enquiry"},
        'NEW',
        ${notes || ""},
        'manual',
        'internal_admin',
        'staff_entry',
        ${auth.user.userId},
        ${followUpDate || null},
        NOW(),
        NOW()
      );
    `;

    // Audit log
    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: "LEAD_CREATED_MANUAL",
      entity: "leads",
      entityId: leadId,
      newData: { name, phone: cleanPhone, branch, program },
    });

    return NextResponse.json({
      success: true,
      message: "Lead recorded successfully.",
      data: { leadId },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/leads error:", error);
    return NextResponse.json({ success: false, error: "Failed to create lead." }, { status: 500 });
  }
}
