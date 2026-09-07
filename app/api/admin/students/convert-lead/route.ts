import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// POST /api/admin/students/convert-lead: Converts lead & trial into enrolled student
export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "FRONT_DESK"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const body = await request.json();
    const { leadId, studentName, parentName, phone, email, centreSlug, programSlug, batchId } = body;

    if (!leadId && (!studentName || !phone)) {
      return NextResponse.json(
        { success: false, error: "Lead ID or Student Name and Phone are required." },
        { status: 400 }
      );
    }

    let finalName = studentName;
    let finalPhone = phone;
    let finalEmail = email;
    let finalCentre = centreSlug || "kadavanthra";
    let finalProgram = programSlug || "junior-badminton-coaching";

    // If leadId provided, read lead data
    if (leadId) {
      const leadRows = await sql`SELECT * FROM leads WHERE id = ${leadId} LIMIT 1;`;
      if (leadRows.length > 0) {
        const lead = leadRows[0];
        finalName = finalName || lead.name;
        finalPhone = finalPhone || lead.phone;
        finalEmail = finalEmail || lead.email;
        finalCentre = centreSlug || lead.branch;
        finalProgram = programSlug || lead.program;
      }
    }

    const cleanPhone = String(finalPhone).replace(/[^0-9+]/g, "");

    // 1. Create / find parent
    const parRows = await sql`
      INSERT INTO parents (id, full_name, phone, email, created_at, updated_at)
      VALUES (
        ${'PAR-' + Date.now()},
        ${parentName ? String(parentName).trim() : `${finalName}'s Parent`},
        ${cleanPhone},
        ${finalEmail ? String(finalEmail).trim() : null},
        NOW(),
        NOW()
      )
      ON CONFLICT (phone) DO UPDATE SET updated_at = NOW()
      RETURNING id;
    `;
    const parentId = parRows[0].id;

    // 2. Create Student
    const studentId = `STU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await sql`
      INSERT INTO students (
        id, parent_id, full_name, primary_centre, primary_program, status, joined_at, created_at, updated_at
      ) VALUES (
        ${studentId},
        ${parentId},
        ${String(finalName).trim()},
        ${finalCentre},
        ${finalProgram},
        'ACTIVE',
        CURRENT_DATE,
        NOW(),
        NOW()
      );
    `;

    // 3. If batchId provided, enroll
    if (batchId) {
      await sql`
        INSERT INTO batch_students (batch_id, student_id, enrolled_at, status)
        VALUES (${batchId}, ${studentId}, NOW(), 'ACTIVE')
        ON CONFLICT (batch_id, student_id) DO UPDATE SET status = 'ACTIVE';
      `;
    }

    // 4. Update Lead to CONVERTED
    if (leadId) {
      await sql`
        UPDATE leads
        SET 
          status = 'ENROLLED',
          converted_student_id = ${studentId},
          updated_at = NOW()
        WHERE id = ${leadId};
      `;

      await sql`
        INSERT INTO lead_notes (id, lead_id, author_id, note, created_at)
        VALUES (
          ${'ln_' + Date.now()},
          ${leadId},
          ${auth.user.userId},
          ${`Candidate converted to enrolled student (${studentId}). Parent ID: ${parentId}.`},
          NOW()
        );
      `;
    }

    // 5. Generate initial fee invoice
    const prgRow = await sql`SELECT monthly_fee FROM programs WHERE slug = ${finalProgram} LIMIT 1;`;
    const feeAmount = prgRow[0]?.monthly_fee || 3500.00;
    const currentPeriod = new Date().toISOString().substring(0, 7);
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
      action: "LEAD_CONVERTED_TO_STUDENT",
      entity: "students",
      entityId: studentId,
      newData: { leadId, parentId, studentId, invoiceId },
    });

    return NextResponse.json({
      success: true,
      message: "Lead successfully converted to enrolled student.",
      data: {
        studentId,
        parentId,
        invoiceId,
      },
    });
  } catch (error) {
    console.error("Convert lead error:", error);
    return NextResponse.json({ success: false, error: "Failed to convert lead to student." }, { status: 500 });
  }
}
