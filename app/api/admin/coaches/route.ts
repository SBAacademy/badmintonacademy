import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";
import { saveCoachRecord, ensureCoachImage } from "@/lib/contentDb";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

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
      GROUP BY c.id, cen.name
      ORDER BY c.display_order ASC, c.experience_years DESC, c.created_at DESC;
    `;

    const mappedCoaches = rows.map((r) => ({
      ...r,
      image_url: ensureCoachImage(r.image_url as string),
    }));

    return NextResponse.json({
      success: true,
      data: {
        total: mappedCoaches.length,
        coaches: mappedCoaches,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/coaches error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch coaches." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ success: false, error: "Coach name is required." }, { status: 400 });
    }
    if (!body.role || typeof body.role !== "string" || !body.role.trim()) {
      return NextResponse.json({ success: false, error: "Coach role is required." }, { status: 400 });
    }

    const savedCoach = await saveCoachRecord({
      name: body.name.trim(),
      role: body.role.trim(),
      experienceYears: Number(body.experienceYears ?? body.experience_years) || 5,
      primaryBranch: body.primaryBranch,
      primaryCentre: body.primaryCentre ?? body.primary_centre,
      specialization: body.specialization || "Badminton Coaching & Conditioning",
      certifications: Array.isArray(body.certifications) ? body.certifications : [],
      achievements: Array.isArray(body.achievements) ? body.achievements : [],
      bio: body.bio || "Dedicated badminton coach at S&A Badminton Academy.",
      image: body.image ?? body.image_url,
      status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      isPublished: body.isPublished !== false && body.is_published !== false,
      displayOrder: Number(body.displayOrder ?? body.display_order) || 0,
    });

    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: "COACH_CREATED",
      entity: "coaches",
      entityId: savedCoach.id,
      newData: savedCoach as unknown as Record<string, unknown>,
    });

    // Invalidate public caches immediately
    revalidatePath("/");
    revalidatePath("/coaches");

    return NextResponse.json({
      success: true,
      message: "Coach created successfully.",
      data: {
        coach: savedCoach,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/coaches error:", error);
    return NextResponse.json({ success: false, error: "Failed to create coach." }, { status: 500 });
  }
}
