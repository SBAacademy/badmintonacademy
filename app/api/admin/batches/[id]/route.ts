import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// 1. GET /api/admin/batches/[id]: Fetch batch with student roster
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const batchRows = await sql`
      SELECT b.*, c.name as coach_name, cen.name as centre_name, p.name as program_name
      FROM batches b
      LEFT JOIN coaches c ON b.assigned_coach_id = c.id
      LEFT JOIN centres cen ON b.centre_slug = cen.slug
      LEFT JOIN programs p ON b.program_slug = p.slug
      WHERE b.id = ${id}
      LIMIT 1;
    `;

    if (batchRows.length === 0) {
      return NextResponse.json({ success: false, error: "Batch not found." }, { status: 404 });
    }

    const batch = batchRows[0];

    // Roster of students
    const students = await sql`
      SELECT 
        s.*,
        bs.enrolled_at as batch_enrolled_at,
        p.full_name as parent_name,
        p.phone as parent_phone
      FROM batch_students bs
      JOIN students s ON bs.student_id = s.id
      LEFT JOIN parents p ON s.parent_id = p.id
      WHERE bs.batch_id = ${id} AND bs.status = 'ACTIVE'
      ORDER BY s.full_name ASC;
    `;

    return NextResponse.json({
      success: true,
      data: {
        batch,
        students,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/batches/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch batch." }, { status: 500 });
  }
}

// 2. POST /api/admin/batches/[id]: Add student to batch
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json({ success: false, error: "studentId is required." }, { status: 400 });
    }

    // Check capacity
    const capacityRow = await sql`
      SELECT b.capacity, COUNT(bs.student_id)::int as enrolled_count
      FROM batches b
      LEFT JOIN batch_students bs ON b.id = bs.batch_id AND bs.status = 'ACTIVE'
      WHERE b.id = ${id}
      GROUP BY b.capacity;
    `;

    if (capacityRow.length > 0) {
      const { capacity, enrolled_count } = capacityRow[0];
      if (enrolled_count >= capacity) {
        return NextResponse.json(
          { success: false, error: `Batch has reached maximum capacity (${capacity} students).` },
          { status: 400 }
        );
      }
    }

    await sql`
      INSERT INTO batch_students (batch_id, student_id, enrolled_at, status)
      VALUES (${id}, ${studentId}, NOW(), 'ACTIVE')
      ON CONFLICT (batch_id, student_id) DO UPDATE SET status = 'ACTIVE';
    `;

    // Audit log
    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: "BATCH_STUDENT_ADDED",
      entity: "batch_students",
      entityId: `${id}_${studentId}`,
      newData: { batchId: id, studentId },
    });

    return NextResponse.json({
      success: true,
      message: "Student assigned to batch successfully.",
    });
  } catch (error) {
    console.error("POST /api/admin/batches/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to assign student to batch." }, { status: 500 });
  }
}
