import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { saveCoachRecord, deleteCoachRecord, ensureCoachImage } from "@/lib/contentDb";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// 1. GET /api/admin/coaches/[id]: Get specific coach details
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

    const rows = await sql`
      SELECT 
        c.*,
        cen.name as centre_name,
        COUNT(DISTINCT b.id)::int as active_batches_count
      FROM coaches c
      LEFT JOIN centres cen ON c.primary_centre = cen.slug
      LEFT JOIN batches b ON c.id = b.assigned_coach_id AND b.status = 'ACTIVE'
      WHERE c.id = ${id}
      GROUP BY c.id, cen.name
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "Coach not found." }, { status: 404 });
    }

    const coach = {
      ...rows[0],
      image_url: ensureCoachImage(rows[0].image_url as string),
    };

    return NextResponse.json({
      success: true,
      data: {
        coach,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/coaches/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch coach." }, { status: 500 });
  }
}

// 2. PATCH / PUT /api/admin/coaches/[id]: Update specific coach details
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, params);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, params);
}

async function handleUpdate(
  request: Request,
  params: Promise<{ id: string }>
) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const existingRows = await sql`SELECT * FROM coaches WHERE id = ${id} LIMIT 1;`;
    if (existingRows.length === 0) {
      return NextResponse.json({ success: false, error: "Coach not found." }, { status: 404 });
    }
    const current = existingRows[0];

    const body = await request.json();

    const savedCoach = await saveCoachRecord({
      id,
      name: (body.name || current.name).trim(),
      role: (body.role || current.role).trim(),
      experienceYears: Number(body.experienceYears ?? body.experience_years ?? current.experience_years),
      primaryBranch: body.primaryBranch,
      primaryCentre: body.primaryCentre ?? body.primary_centre ?? current.primary_centre,
      specialization: body.specialization || current.specialization,
      certifications: Array.isArray(body.certifications) ? body.certifications : current.certifications,
      achievements: Array.isArray(body.achievements) ? body.achievements : current.achievements,
      bio: body.bio || current.bio,
      image: body.image ?? body.image_url ?? current.image_url,
      status: body.status !== undefined ? body.status : current.status,
      isPublished: body.isPublished !== undefined ? body.isPublished : body.is_published !== undefined ? body.is_published : current.is_published,
      displayOrder: Number(body.displayOrder ?? body.display_order ?? current.display_order),
    });

    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: "COACH_UPDATED",
      entity: "coaches",
      entityId: id,
      oldData: current as unknown as Record<string, unknown>,
      newData: savedCoach as unknown as Record<string, unknown>,
    });

    // Invalidate public caches immediately
    revalidatePath("/");
    revalidatePath("/coaches");

    return NextResponse.json({
      success: true,
      message: "Coach updated successfully.",
      data: {
        coach: savedCoach,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/coaches/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update coach." }, { status: 500 });
  }
}

// 3. DELETE /api/admin/coaches/[id]: Delete or archive coach
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const forceHardDelete = searchParams.get("force") === "true";

    const result = await deleteCoachRecord(id, !forceHardDelete);

    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: result.softDeleted ? "COACH_ARCHIVED" : "COACH_DELETED",
      entity: "coaches",
      entityId: id,
    });

    // Invalidate public caches immediately
    revalidatePath("/");
    revalidatePath("/coaches");

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        id,
        softDeleted: result.softDeleted,
      },
    });
  } catch (error) {
    console.error("DELETE /api/admin/coaches/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete coach." }, { status: 500 });
  }
}
