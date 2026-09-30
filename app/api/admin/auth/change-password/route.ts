import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import {
  requireAuth,
  verifyPassword,
  hashPassword,
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
} from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { success: false, error: auth.error || "Authentication required." },
        { status: auth.status }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const sql = getSql();
    if (!sql) {
      return NextResponse.json(
        { success: false, error: "Database unavailable." },
        { status: 500 }
      );
    }

    // Fetch user record to verify current password
    const rows = await sql`
      SELECT id, password_hash, full_name, role, email, assigned_centre, is_active
      FROM users
      WHERE id = ${auth.user.userId}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 404 }
      );
    }

    const user = rows[0];

    // Verify current password
    const isValid = verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // Hash new password with scrypt + cryptographically random salt
    const newPasswordHash = hashPassword(newPassword);

    // Update password in database
    await sql`
      UPDATE users
      SET password_hash = ${newPasswordHash}, updated_at = NOW()
      WHERE id = ${user.id};
    `;

    // Revoke old refresh tokens for this user as a security measure
    await sql`
      UPDATE refresh_tokens
      SET revoked = TRUE
      WHERE user_id = ${user.id};
    `;

    // Issue fresh tokens
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
      action: "USER_PASSWORD_CHANGE",
      entity: "users",
      entityId: user.id,
    });

    const response = NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });

    setAuthCookies(response, access.token, refresh.rawToken);

    return response;
  } catch (error) {
    console.error("Change password API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error while changing password." },
      { status: 500 }
    );
  }
}
