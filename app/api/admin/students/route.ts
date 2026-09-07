import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// 1. GET /api/admin/students: Master student roster
export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request); // All authenticated staff
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const centre = searchParams.get("centre");
    const program = searchParams.get("program");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = `
      SELECT 
        s.*,
        p.full_name as parent_name,
        p.phone as parent_phone,
        p.email as parent_email,
        cen.name as centre_name,
        prg.name as program_name,
        COALESCE(
          (SELECT json_agg(json_build_object('id', b.id, 'name', b.name, 'days', b.days_of_week))
           FROM batch_students bs
           JOIN batches b ON bs.batch_id = b.id
           WHERE bs.student_id = s.id AND bs.status = 'ACTIVE'),
          '[]'
        ) as batches
      FROM students s
      LEFT JOIN parents p ON s.parent_id = p.id
      LEFT JOIN centres cen ON s.primary_centre = cen.slug
      LEFT JOIN programs prg ON s.primary_program = prg.slug
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    // Coach scoping: If user is coach, only show their students
    if (auth.user.role === "COACH") {
      // Find coach id
      const coachIdRows = await sql`SELECT id FROM coaches WHERE primary_centre = ${auth.user.assignedCentre || 'kadavanthra'} LIMIT 1;`;
      if (coachIdRows.length > 0) {
        params.push(coachIdRows[0].id);
        query += ` AND s.id IN (
          SELECT bs.student_id FROM batch_students bs
          JOIN batches b ON bs.batch_id = b.id
          WHERE b.assigned_coach_id = $${params.length}
        )`;
      }
    }

    if (centre && centre !== "ALL") {
      params.push(centre);
      query += ` AND s.primary_centre = $${params.length}`;
    }

    if (program && program !== "ALL") {
      params.push(program);
      query += ` AND s.primary_program = $${params.length}`;
    }

    if (status && status !== "ALL") {
      params.push(status);
      query += ` AND s.status = $${params.length}`;
    }

    if (search && search.trim() !== "") {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(s.full_name) LIKE $${params.length} OR LOWER(p.phone) LIKE $${params.length} OR LOWER(s.id) LIKE $${params.length})`;
    }

    query += ` ORDER BY s.joined_at DESC, s.created_at DESC LIMIT 100;`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (sql as any)(query, params);

    return NextResponse.json({
      success: true,
      data: {
        total: rows.length,
        students: rows,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/students error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch student roster." }, { status: 500 });
  }
}

// 2. POST /api/admin/students: Enroll new student
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
      fullName,
      dateOfBirth,
      gender,
      bloodGroup,
      primaryCentre,
      primaryProgram,
      medicalNotes,
      emergencyContact,
      // Parent fields
      parentId,
      parentName,
      parentPhone,
      parentEmail,
      parentAddress,
      // Initial batch
      batchId,
    } = body;

    if (!fullName || !primaryCentre || !primaryProgram) {
      return NextResponse.json({ success: false, error: "Student name, centre, and program are required." }, { status: 400 });
    }

    let resolvedParentId = parentId;

    // If parentId not provided, create/link parent via phone
    if (!resolvedParentId && parentPhone) {
      const cleanPhone = String(parentPhone).replace(/[^0-9+]/g, "");
      const parResult = await sql`
        INSERT INTO parents (id, full_name, phone, email, address, created_at, updated_at)
        VALUES (
          ${'PAR-' + Date.now()},
          ${parentName ? String(parentName).trim() : `${fullName}'s Parent`},
          ${cleanPhone},
          ${parentEmail ? String(parentEmail).trim() : null},
          ${parentAddress || null},
          NOW(),
          NOW()
        )
        ON CONFLICT (phone) DO UPDATE SET updated_at = NOW()
        RETURNING id;
      `;
      resolvedParentId = parResult[0].id;
    }

    const studentId = `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    await sql`
      INSERT INTO students (
        id, parent_id, full_name, date_of_birth, gender, blood_group,
        primary_centre, primary_program, status, medical_notes,
        emergency_contact, joined_at, created_at, updated_at
      ) VALUES (
        ${studentId},
        ${resolvedParentId || null},
        ${String(fullName).trim()},
        ${dateOfBirth || null},
        ${gender || "MALE"},
        ${bloodGroup || null},
        ${primaryCentre},
        ${primaryProgram},
        'ACTIVE',
        ${medicalNotes || null},
        ${emergencyContact || parentPhone || null},
        CURRENT_DATE,
        NOW(),
        NOW()
      );
    `;

    // Assign to batch if provided
    if (batchId) {
      await sql`
        INSERT INTO batch_students (batch_id, student_id, enrolled_at, status)
        VALUES (${batchId}, ${studentId}, NOW(), 'ACTIVE')
        ON CONFLICT (batch_id, student_id) DO UPDATE SET status = 'ACTIVE';
      `;
    }

    // Generate first month's fee invoice automatically
    const prgRow = await sql`SELECT monthly_fee FROM programs WHERE slug = ${primaryProgram} LIMIT 1;`;
    const feeAmount = prgRow[0]?.monthly_fee || 3500.00;
    const currentPeriod = new Date().toISOString().substring(0, 7); // '2026-09'
    const invoiceId = `INV-${Date.now()}`;
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    await sql`
      INSERT INTO fee_invoices (id, student_id, billing_period, amount_due, due_date, status, created_at, updated_at)
      VALUES (${invoiceId}, ${studentId}, ${currentPeriod}, ${feeAmount}, ${dueDate}, 'UNPAID', NOW(), NOW());
    `;

    // Audit log
    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: "STUDENT_ENROLLED",
      entity: "students",
      entityId: studentId,
      newData: { fullName, primaryCentre, primaryProgram, parentId: resolvedParentId, initialInvoice: invoiceId },
    });

    return NextResponse.json({
      success: true,
      message: "Student enrolled successfully.",
      data: {
        studentId,
        parentId: resolvedParentId,
        invoiceId,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/students error:", error);
    return NextResponse.json({ success: false, error: "Failed to enroll student." }, { status: 500 });
  }
}
