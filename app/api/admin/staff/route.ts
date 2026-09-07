import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth, hashPassword } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const staff = await sql`
      SELECT id, email, full_name, role, assigned_centre, is_active, created_at, last_login_at
      FROM users
      ORDER BY created_at ASC;
    `;

    return NextResponse.json({
      success: true,
      data: {
        total: staff.length,
        staff,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/staff error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch staff accounts." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const body = await request.json().catch(() => ({}));
    const { email, password, fullName, role, assignedCentre } = body;

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ success: false, error: "Email, password, full name, and role are required." }, { status: 400 });
    }

    const validRoles = ["SUPER_ADMIN", "ADMIN", "COACH", "FRONT_DESK", "CONTENT_MANAGER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ success: false, error: `Invalid role. Allowed: ${validRoles.join(", ")}` }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const userId = `USR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    await sql`
      INSERT INTO users (id, email, password_hash, full_name, role, assigned_centre, is_active, created_at, updated_at)
      VALUES (${userId}, ${email.trim().toLowerCase()}, ${passwordHash}, ${fullName.trim()}, ${role}, ${assignedCentre || null}, true, NOW(), NOW());
    `;

    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName || auth.user.email,
      action: "CREATED",
      entity: "USER",
      entityId: userId,
      newData: { email, fullName, role, assignedCentre },
    });

    return NextResponse.json({
      success: true,
      message: "Staff member created successfully.",
      data: {
        id: userId,
        email,
        fullName,
        role,
        assignedCentre,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/staff error:", error);
    return NextResponse.json({ success: false, error: "Failed to create staff account." }, { status: 500 });
  }
}
