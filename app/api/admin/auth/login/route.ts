import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyPassword, createAccessToken, createRefreshToken } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const sql = getSql();
    if (!sql) {
      return NextResponse.json(
        { success: false, error: "Database connection unavailable." },
        { status: 500 }
      );
    }

    const rows = await sql`
      SELECT id, email, password_hash, full_name, role, assigned_centre, is_active
      FROM users
      WHERE email = ${email.trim().toLowerCase()}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const user = rows[0];

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: "Account has been deactivated. Please contact Super Admin." },
        { status: 403 }
      );
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Update last login
    await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${user.id};`;

    const userSession = {
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      assignedCentre: user.assigned_centre,
    };

    const access = createAccessToken(userSession);
    const refresh = await createRefreshToken(user.id);

    // Audit log
    await logAuditEvent({
      actorUserId: user.id,
      actorName: user.full_name,
      action: "USER_LOGIN_SUCCESS",
      entity: "users",
      entityId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Authentication successful.",
      data: {
        user: userSession,
        accessToken: access.token,
        accessTokenExpiresAt: access.expiresAt,
        refreshToken: refresh.rawToken,
      },
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during authentication." },
      { status: 500 }
    );
  }
}
