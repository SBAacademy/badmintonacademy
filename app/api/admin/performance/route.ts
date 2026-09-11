import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// 1. POST /api/admin/performance: Record athlete skill evaluation
export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "COACH"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const body = await request.json();
    const {
      studentId,
      coachId,
      footworkScore,
      techniqueScore,
      fitnessScore,
      tacticalScore,
      consistencyScore,
      notes,
    } = body;

    if (!studentId) {
      return NextResponse.json({ success: false, error: "studentId is required." }, { status: 400 });
    }

    const assessmentId = `PRF-${Date.now()}`;
    let resolvedCoachId = coachId;
    if (!resolvedCoachId) {
      const activeCoach = await sql`SELECT id FROM coaches WHERE status = 'ACTIVE' ORDER BY display_order ASC LIMIT 1;`;
      resolvedCoachId = activeCoach[0]?.id || "sooraj-m-s";
    }

    await sql`
      INSERT INTO performance_assessments (
        id, student_id, coach_id, assessment_date,
        footwork_score, technique_score, fitness_score,
        tactical_score, consistency_score, notes, created_at
      ) VALUES (
        ${assessmentId},
        ${studentId},
        ${resolvedCoachId},
        CURRENT_DATE,
        ${footworkScore || 7.0},
        ${techniqueScore || 7.0},
        ${fitnessScore || 7.0},
        ${tacticalScore || 7.0},
        ${consistencyScore || 7.0},
        ${notes || null},
        NOW()
      );
    `;

    // Audit log
    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: "PERFORMANCE_ASSESSMENT_LOGGED",
      entity: "performance_assessments",
      entityId: assessmentId,
      newData: { studentId, footworkScore, techniqueScore, fitnessScore },
    });

    return NextResponse.json({
      success: true,
      message: "Athlete skill assessment recorded.",
      data: { assessmentId },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/performance error:", error);
    return NextResponse.json({ success: false, error: "Failed to record assessment." }, { status: 500 });
  }
}

// 2. GET /api/admin/performance: Query student assessment history
export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ success: false, error: "studentId query parameter is required." }, { status: 400 });
    }

    const rows = await sql`
      SELECT pa.*, c.name as coach_name
      FROM performance_assessments pa
      LEFT JOIN coaches c ON pa.coach_id = c.id
      WHERE pa.student_id = ${studentId}
      ORDER BY pa.assessment_date DESC;
    `;

    return NextResponse.json({
      success: true,
      data: {
        studentId,
        assessments: rows,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/performance error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch assessments." }, { status: 500 });
  }
}
