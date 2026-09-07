import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// 1. GET /api/admin/trials: List and filter free trials
export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "COACH", "FRONT_DESK"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // e.g. 'today' or '2026-09-08'
    const centre = searchParams.get("centre");
    const status = searchParams.get("status");

    let query = `
      SELECT ft.*, c.name as coach_name, cen.name as centre_name, p.name as program_name
      FROM free_trials ft
      LEFT JOIN coaches c ON ft.assigned_coach_id = c.id
      LEFT JOIN centres cen ON ft.centre_slug = cen.slug
      LEFT JOIN programs p ON ft.program_slug = p.slug
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (date === "today") {
      query += ` AND ft.scheduled_date = CURRENT_DATE`;
    } else if (date) {
      params.push(date);
      query += ` AND ft.scheduled_date = $${params.length}`;
    }

    if (centre && centre !== "ALL") {
      params.push(centre);
      query += ` AND ft.centre_slug = $${params.length}`;
    }

    if (status && status !== "ALL") {
      params.push(status);
      query += ` AND ft.status = $${params.length}`;
    }

    query += ` ORDER BY ft.scheduled_date ASC, ft.created_at DESC LIMIT 100;`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (sql as any).query(query, params);

    return NextResponse.json({
      success: true,
      data: {
        total: rows.length,
        trials: rows,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/trials error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch trials." }, { status: 500 });
  }
}

// 2. POST /api/admin/trials: Schedule a free trial
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
      leadId,
      studentName,
      parentPhone,
      parentEmail,
      centreSlug,
      programSlug,
      assignedCoachId,
      scheduledDate,
      scheduledSlot,
    } = body;

    if (!studentName || !parentPhone || !centreSlug || !scheduledDate || !scheduledSlot) {
      return NextResponse.json(
        { success: false, error: "Student name, parent phone, centre, date, and slot are required." },
        { status: 400 }
      );
    }

    const trialId = `TRL-${Date.now()}`;
    const cleanPhone = String(parentPhone).replace(/[^0-9+]/g, "");

    await sql`
      INSERT INTO free_trials (
        id, lead_id, student_name, parent_phone, parent_email,
        centre_slug, program_slug, assigned_coach_id,
        scheduled_date, scheduled_slot, status, created_at, updated_at
      ) VALUES (
        ${trialId},
        ${leadId || null},
        ${String(studentName).trim()},
        ${cleanPhone},
        ${parentEmail ? String(parentEmail).trim() : null},
        ${centreSlug},
        ${programSlug || "junior-badminton-coaching"},
        ${assignedCoachId || null},
        ${scheduledDate},
        ${scheduledSlot},
        'CONFIRMED',
        NOW(),
        NOW()
      );
    `;

    // If linked to lead, advance lead status to TRIAL_BOOKED
    if (leadId) {
      await sql`
        UPDATE leads 
        SET status = 'TRIAL_SCHEDULED', updated_at = NOW() 
        WHERE id = ${leadId};
      `;

      await sql`
        INSERT INTO lead_notes (id, lead_id, author_id, note, created_at)
        VALUES (
          ${'ln_' + Date.now()},
          ${leadId},
          ${auth.user.userId},
          ${`Free trial scheduled for ${scheduledDate} (${scheduledSlot}) at ${centreSlug}.`},
          NOW()
        );
      `;
    }

    // Create In-App Notification
    await sql`
      INSERT INTO notifications (id, user_id, type, title, body, deep_link, created_at)
      VALUES (
        ${'notif_' + Date.now()},
        ${auth.user.userId},
        'TRIAL_BOOKED',
        'New Free Trial Booked',
        ${`${studentName} scheduled for trial on ${scheduledDate} at ${centreSlug}`},
        '/trials',
        NOW()
      );
    `;

    // Audit log
    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: "TRIAL_SCHEDULED",
      entity: "free_trials",
      entityId: trialId,
      newData: { studentName, parentPhone: cleanPhone, centreSlug, scheduledDate, scheduledSlot },
    });

    return NextResponse.json({
      success: true,
      message: "Trial session confirmed successfully.",
      data: { trialId },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/trials error:", error);
    return NextResponse.json({ success: false, error: "Failed to schedule trial." }, { status: 500 });
  }
}
