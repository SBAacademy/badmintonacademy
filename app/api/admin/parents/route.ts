import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// 1. GET /api/admin/parents: List parents with linked students
export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "FRONT_DESK"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = `
      SELECT 
        p.*,
        COUNT(s.id)::int as student_count,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'fullName', s.full_name,
              'centre', s.primary_centre,
              'program', s.primary_program,
              'status', s.status
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) as students
      FROM parents p
      LEFT JOIN students s ON p.id = s.parent_id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (search && search.trim() !== "") {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(p.full_name) LIKE $${params.length} OR LOWER(p.phone) LIKE $${params.length} OR LOWER(p.email) LIKE $${params.length})`;
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT 100;`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (sql as any)(query, params);

    return NextResponse.json({
      success: true,
      data: {
        total: rows.length,
        parents: rows,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/parents error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch parents." }, { status: 500 });
  }
}

// 2. POST /api/admin/parents: Create or update parent record
export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "FRONT_DESK"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const body = await request.json();
    const { fullName, phone, email, emergencyPhone, address, notes } = body;

    if (!fullName || !phone) {
      return NextResponse.json({ success: false, error: "Parent Name and Phone are required." }, { status: 400 });
    }

    const cleanPhone = String(phone).replace(/[^0-9+]/g, "");
    const parentId = `PAR-${Date.now()}`;

    // Upsert on phone conflict
    const result = await sql`
      INSERT INTO parents (id, full_name, phone, email, emergency_phone, address, notes, created_at, updated_at)
      VALUES (
        ${parentId},
        ${String(fullName).trim()},
        ${cleanPhone},
        ${email ? String(email).trim() : null},
        ${emergencyPhone ? String(emergencyPhone).trim() : null},
        ${address || null},
        ${notes || null},
        NOW(),
        NOW()
      )
      ON CONFLICT (phone) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = COALESCE(EXCLUDED.email, parents.email),
        emergency_phone = COALESCE(EXCLUDED.emergency_phone, parents.emergency_phone),
        updated_at = NOW()
      RETURNING *;
    `;

    const savedParent = result[0];

    // Audit log
    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: "PARENT_RECORDED",
      entity: "parents",
      entityId: savedParent.id,
      newData: { fullName: savedParent.full_name, phone: savedParent.phone },
    });

    return NextResponse.json({
      success: true,
      message: "Parent record saved successfully.",
      data: { parent: savedParent },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/parents error:", error);
    return NextResponse.json({ success: false, error: "Failed to record parent." }, { status: 500 });
  }
}
