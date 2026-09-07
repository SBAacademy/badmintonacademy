import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// PUT /api/admin/trials/[id]: Update trial status (e.g. ATTENDED, NO_SHOW, CANCELLED) and coach notes
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "COACH", "FRONT_DESK"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const existing = await sql`SELECT * FROM free_trials WHERE id = ${id} LIMIT 1;`;
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Trial record not found." }, { status: 404 });
    }

    const current = existing[0];
    const body = await request.json();
    const { status, coachEvaluation, assignedCoachId, scheduledDate, scheduledSlot } = body;

    const newStatus = status || current.status;
    const newEval = coachEvaluation !== undefined ? coachEvaluation : current.coach_evaluation;
    const newCoach = assignedCoachId !== undefined ? assignedCoachId : current.assigned_coach_id;
    const newDate = scheduledDate || current.scheduled_date;
    const newSlot = scheduledSlot || current.scheduled_slot;

    await sql`
      UPDATE free_trials
      SET 
        status = ${newStatus},
        coach_evaluation = ${newEval},
        assigned_coach_id = ${newCoach},
        scheduled_date = ${newDate},
        scheduled_slot = ${newSlot},
        updated_at = NOW()
      WHERE id = ${id};
    `;

    // If trial is marked ATTENDED and linked to lead, update lead status
    if (newStatus === "COMPLETED" || newStatus === "ATTENDED") {
      if (current.lead_id) {
        await sql`
          UPDATE leads
          SET status = 'TRIAL_ATTENDED', updated_at = NOW()
          WHERE id = ${current.lead_id};
        `;
      }
    }

    // Audit log
    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: "TRIAL_STATUS_UPDATED",
      entity: "free_trials",
      entityId: id,
      oldData: { status: current.status },
      newData: { status: newStatus, coachEvaluation: newEval },
    });

    return NextResponse.json({
      success: true,
      message: "Trial status updated successfully.",
    });
  } catch (error) {
    console.error("PUT /api/admin/trials/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update trial." }, { status: 500 });
  }
}
