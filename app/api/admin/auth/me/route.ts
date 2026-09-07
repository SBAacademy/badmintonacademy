import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error || "Unauthorized" },
        { status: auth.status }
      );
    }

    const sql = getSql();
    if (!sql) {
      return NextResponse.json(
        { success: false, error: "Database unavailable." },
        { status: 500 }
      );
    }

    const rows = await sql`
      SELECT id, email, full_name, role, phone, assigned_centre, created_at, last_login_at
      FROM users
      WHERE id = ${auth.user.userId}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User record not found." },
        { status: 404 }
      );
    }

    const user = rows[0];

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          phone: user.phone,
          assignedCentre: user.assigned_centre,
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at,
        },
      },
    });
  } catch (error) {
    console.error("Auth Me API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
