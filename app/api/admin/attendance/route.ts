import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// 1. POST /api/admin/attendance: Bulk mark session attendance
export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "COACH", "FRONT_DESK"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const body = await request.json();
    const { sessionId, records } = body;

    if (!sessionId || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { success: false, error: "Session ID and records array are required." },
        { status: 400 }
      );
    }

    let markedCount = 0;

    for (const rec of records) {
      const { studentId, status, coachNote } = rec;
      if (!studentId || !status) continue;

      const attId = `ATT-${sessionId}-${studentId}`;

      await sql`
        INSERT INTO attendance (
          id, session_id, student_id, status, marked_by_user_id, marked_at, coach_note
        ) VALUES (
          ${attId},
          ${sessionId},
          ${studentId},
          ${status},
          ${auth.user.userId},
          NOW(),
          ${coachNote || null}
        )
        ON CONFLICT (session_id, student_id) DO UPDATE SET
          status = EXCLUDED.status,
          marked_by_user_id = EXCLUDED.marked_by_user_id,
          marked_at = NOW(),
          coach_note = COALESCE(EXCLUDED.coach_note, attendance.coach_note);
      `;
      markedCount++;
    }

    // Update session status to COMPLETED
    await sql`UPDATE sessions SET status = 'COMPLETED' WHERE id = ${sessionId};`;

    // Audit log
    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: "ATTENDANCE_MARKED",
      entity: "sessions",
      entityId: sessionId,
      newData: { recordsCount: markedCount },
    });

    return NextResponse.json({
      success: true,
      message: `Attendance recorded for ${markedCount} athletes.`,
      data: { markedCount, sessionId },
    });
  } catch (error) {
    console.error("POST /api/admin/attendance error:", error);
    return NextResponse.json({ success: false, error: "Failed to record attendance." }, { status: 500 });
  }
}

// 2. GET /api/admin/attendance: Get attendance history for a session or student
export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const studentId = searchParams.get("studentId");

    if (sessionId) {
      const rows = await sql`
        SELECT a.*, s.full_name as student_name, u.full_name as marked_by_name
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        LEFT JOIN users u ON a.marked_by_user_id = u.id
        WHERE a.session_id = ${sessionId}
        ORDER BY s.full_name ASC;
      `;
      return NextResponse.json({ success: true, data: { sessionId, attendance: rows } });
    }

    if (studentId) {
      const rows = await sql`
        SELECT a.*, s.session_date, s.start_time, s.end_time, b.name as batch_name
        FROM attendance a
        JOIN sessions s ON a.session_id = s.id
        JOIN batches b ON s.batch_id = b.id
        WHERE a.student_id = ${studentId}
        ORDER BY s.session_date DESC
        LIMIT 50;
      `;
      return NextResponse.json({ success: true, data: { studentId, attendance: rows } });
    }

    return NextResponse.json({ success: false, error: "sessionId or studentId required." }, { status: 400 });
  } catch (error) {
    console.error("GET /api/admin/attendance error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch attendance." }, { status: 500 });
  }
}
