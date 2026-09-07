import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// 1. GET /api/admin/students/[id]: Detailed student profile with timeline
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

    const studentRows = await sql`
      SELECT 
        s.*,
        p.full_name as parent_name,
        p.phone as parent_phone,
        p.email as parent_email,
        p.emergency_phone as parent_emergency_phone,
        p.address as parent_address,
        cen.name as centre_name,
        prg.name as program_name
      FROM students s
      LEFT JOIN parents p ON s.parent_id = p.id
      LEFT JOIN centres cen ON s.primary_centre = cen.slug
      LEFT JOIN programs prg ON s.primary_program = prg.slug
      WHERE s.id = ${id}
      LIMIT 1;
    `;

    if (studentRows.length === 0) {
      return NextResponse.json({ success: false, error: "Student not found." }, { status: 404 });
    }

    const student = studentRows[0];

    // Assigned batches
    const batches = await sql`
      SELECT b.*, c.name as coach_name
      FROM batch_students bs
      JOIN batches b ON bs.batch_id = b.id
      LEFT JOIN coaches c ON b.assigned_coach_id = c.id
      WHERE bs.student_id = ${id} AND bs.status = 'ACTIVE';
    `;

    // Attendance summary
    const attendanceStats = await sql`
      SELECT 
        COUNT(*)::int as total_sessions,
        COUNT(CASE WHEN status = 'PRESENT' THEN 1 END)::int as present_count,
        COUNT(CASE WHEN status = 'ABSENT' THEN 1 END)::int as absent_count,
        COUNT(CASE WHEN status = 'LATE' THEN 1 END)::int as late_count
      FROM attendance
      WHERE student_id = ${id};
    `;

    // Recent attendance records
    const recentAttendance = await sql`
      SELECT a.*, s.session_date, s.start_time, s.end_time, b.name as batch_name
      FROM attendance a
      JOIN sessions s ON a.session_id = s.id
      JOIN batches b ON s.batch_id = b.id
      WHERE a.student_id = ${id}
      ORDER BY s.session_date DESC, s.start_time DESC
      LIMIT 10;
    `;

    // Financial invoices
    const invoices = await sql`
      SELECT fi.*,
        COALESCE((SELECT SUM(allocated_amount) FROM payment_allocations WHERE invoice_id = fi.id), 0)::numeric as paid_amount
      FROM fee_invoices fi
      WHERE fi.student_id = ${id}
      ORDER BY fi.due_date DESC;
    `;

    // Skill assessments
    const assessments = await sql`
      SELECT pa.*, c.name as coach_name
      FROM performance_assessments pa
      LEFT JOIN coaches c ON pa.coach_id = c.id
      WHERE pa.student_id = ${id}
      ORDER BY pa.assessment_date DESC;
    `;

    return NextResponse.json({
      success: true,
      data: {
        student,
        batches,
        attendanceStats: attendanceStats[0] || { total_sessions: 0, present_count: 0 },
        recentAttendance,
        invoices,
        assessments,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/students/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch student profile." }, { status: 500 });
  }
}

// 2. PUT /api/admin/students/[id]: Update student details
export async function PUT(
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

    const existing = await sql`SELECT * FROM students WHERE id = ${id} LIMIT 1;`;
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Student not found." }, { status: 404 });
    }

    const current = existing[0];
    const body = await request.json();
    const {
      fullName,
      status,
      primaryCentre,
      primaryProgram,
      medicalNotes,
      emergencyContact,
      bloodGroup,
    } = body;

    const newName = fullName !== undefined ? String(fullName).trim() : current.full_name;
    const newStatus = status !== undefined ? status : current.status;
    const newCentre = primaryCentre !== undefined ? primaryCentre : current.primary_centre;
    const newProgram = primaryProgram !== undefined ? primaryProgram : current.primary_program;
    const newMed = medicalNotes !== undefined ? medicalNotes : current.medical_notes;
    const newEmerg = emergencyContact !== undefined ? emergencyContact : current.emergency_contact;
    const newBlood = bloodGroup !== undefined ? bloodGroup : current.blood_group;

    await sql`
      UPDATE students
      SET 
        full_name = ${newName},
        status = ${newStatus},
        primary_centre = ${newCentre},
        primary_program = ${newProgram},
        medical_notes = ${newMed},
        emergency_contact = ${newEmerg},
        blood_group = ${newBlood},
        updated_at = NOW()
      WHERE id = ${id};
    `;

    // Audit log
    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: "STUDENT_UPDATED",
      entity: "students",
      entityId: id,
      oldData: { status: current.status, primaryCentre: current.primary_centre },
      newData: { status: newStatus, primaryCentre: newCentre },
    });

    return NextResponse.json({
      success: true,
      message: "Student record updated successfully.",
    });
  } catch (error) {
    console.error("PUT /api/admin/students/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update student." }, { status: 500 });
  }
}
