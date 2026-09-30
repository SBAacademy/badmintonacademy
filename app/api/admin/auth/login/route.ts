import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { verifyPassword, createAccessToken, createRefreshToken, setAuthCookies } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    // Generic error constant to prevent account enumeration
    const GENERIC_ERROR = "Invalid email or password.";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: GENERIC_ERROR },
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
        { success: false, error: GENERIC_ERROR },
        { status: 401 }
      );
    }

    const user = rows[0];

    if (!user.is_active) {
      return NextResponse.json(
        { success: false, error: GENERIC_ERROR },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: GENERIC_ERROR },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${user.id};`;

    const userSession = {
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      assignedCentre: user.assigned_centre,
    };

    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const userAgent = request.headers.get("user-agent") || undefined;

    const access = createAccessToken(userSession);
    const refresh = await createRefreshToken(user.id, ipAddress, userAgent);

    // Audit log
    await logAuditEvent({
      actorUserId: user.id,
      actorName: user.full_name,
      action: "USER_LOGIN_SUCCESS",
      entity: "users",
      entityId: user.id,
    });

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      data: {
        user: userSession,
        accessToken: access.token,
        accessTokenExpiresAt: access.expiresAt,
        refreshToken: refresh.rawToken,
      },
    });

    // Set secure HttpOnly cookies for session
    setAuthCookies(response, access.token, refresh.rawToken);

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during authentication." },
      { status: 500 }
    );
  }
}
