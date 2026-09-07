import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// 1. GET /api/admin/leads/[id]: Fetch lead details with timeline & notes
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "FRONT_DESK"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const leads = await sql`SELECT * FROM leads WHERE id = ${id} LIMIT 1;`;
    if (leads.length === 0) {
      return NextResponse.json({ success: false, error: "Lead not found." }, { status: 404 });
    }

    const lead = leads[0];
    const notes = await sql`
      SELECT ln.*, u.full_name as author_name
      FROM lead_notes ln
      LEFT JOIN users u ON ln.author_id = u.id
      WHERE ln.lead_id = ${id}
      ORDER BY ln.created_at DESC;
    `;

    const trials = await sql`
      SELECT ft.*, c.name as coach_name
      FROM free_trials ft
      LEFT JOIN coaches c ON ft.assigned_coach_id = c.id
      WHERE ft.lead_id = ${id}
      ORDER BY ft.scheduled_date DESC;
    `;

    return NextResponse.json({
      success: true,
      data: {
        lead,
        notes,
        trials,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/leads/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch lead." }, { status: 500 });
  }
}

// 2. PUT /api/admin/leads/[id]: Update status, notes, follow-up date
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "FRONT_DESK"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const existing = await sql`SELECT * FROM leads WHERE id = ${id} LIMIT 1;`;
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Lead not found." }, { status: 404 });
    }

    const current = existing[0];
    const body = await request.json();
    const { status, notes, followUpDate, assignedStaffId, newNote } = body;

    const newStatus = status || current.status;
    const newNotes = notes !== undefined ? notes : current.notes;
    const newFollowUp = followUpDate !== undefined ? followUpDate : current.follow_up_date;
    const newStaff = assignedStaffId !== undefined ? assignedStaffId : current.assigned_staff_id;

    await sql`
      UPDATE leads
      SET 
        status = ${newStatus},
        notes = ${newNotes},
        follow_up_date = ${newFollowUp},
        assigned_staff_id = ${newStaff},
        updated_at = NOW()
      WHERE id = ${id};
    `;

    // Append to lead_notes if newNote provided
    if (newNote && String(newNote).trim() !== "") {
      const noteId = `ln_${Date.now()}`;
      await sql`
        INSERT INTO lead_notes (id, lead_id, author_id, note, created_at)
        VALUES (${noteId}, ${id}, ${auth.user.userId}, ${String(newNote).trim()}, NOW());
      `;
    }

    // Audit log
    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: "LEAD_UPDATED",
      entity: "leads",
      entityId: id,
      oldData: { status: current.status, notes: current.notes },
      newData: { status: newStatus, notes: newNotes },
    });

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully.",
    });
  } catch (error) {
    console.error("PUT /api/admin/leads/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update lead." }, { status: 500 });
  }
}
