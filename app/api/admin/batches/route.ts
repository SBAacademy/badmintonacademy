import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// 1. GET /api/admin/batches: List batches with capacity and enrolled count
export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const centre = searchParams.get("centre");
    const program = searchParams.get("program");
    const status = searchParams.get("status") || "ACTIVE";

    let query = `
      SELECT 
        b.*,
        c.name as coach_name,
        cen.name as centre_name,
        p.name as program_name,
        COUNT(bs.student_id)::int as enrolled_count
      FROM batches b
      LEFT JOIN coaches c ON b.assigned_coach_id = c.id
      LEFT JOIN centres cen ON b.centre_slug = cen.slug
      LEFT JOIN programs p ON b.program_slug = p.slug
      LEFT JOIN batch_students bs ON b.id = bs.batch_id AND bs.status = 'ACTIVE'
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (centre && centre !== "ALL") {
      params.push(centre);
      query += ` AND b.centre_slug = $${params.length}`;
    }

    if (program && program !== "ALL") {
      params.push(program);
      query += ` AND b.program_slug = $${params.length}`;
    }

    if (status && status !== "ALL") {
      params.push(status);
      query += ` AND b.status = $${params.length}`;
    }

    query += ` GROUP BY b.id, c.name, cen.name, p.name ORDER BY b.centre_slug, b.start_time;`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (sql as any)(query, params);

    return NextResponse.json({
      success: true,
      data: {
        total: rows.length,
        batches: rows,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/batches error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch batches." }, { status: 500 });
  }
}

// 2. POST /api/admin/batches: Create new training batch
export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const body = await request.json();
    const { name, centreSlug, programSlug, assignedCoachId, daysOfWeek, startTime, endTime, capacity } = body;

    if (!name || !centreSlug || !programSlug || !daysOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "Name, centre, program, days, start time, and end time are required." },
        { status: 400 }
      );
    }

    const batchId = `BAT-${Date.now()}`;

    await sql`
      INSERT INTO batches (
        id, name, centre_slug, program_slug, assigned_coach_id,
        days_of_week, start_time, end_time, capacity, status, created_at
      ) VALUES (
        ${batchId},
        ${String(name).trim()},
        ${centreSlug},
        ${programSlug},
        ${assignedCoachId || null},
        ${daysOfWeek},
        ${startTime},
        ${endTime},
        ${capacity || 12},
        'ACTIVE',
        NOW()
      );
    `;

    // Audit log
    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: "BATCH_CREATED",
      entity: "batches",
      entityId: batchId,
      newData: { name, centreSlug, programSlug, daysOfWeek, startTime, endTime },
    });

    return NextResponse.json({
      success: true,
      message: "Batch created successfully.",
      data: { batchId },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/batches error:", error);
    return NextResponse.json({ success: false, error: "Failed to create batch." }, { status: 500 });
  }
}
