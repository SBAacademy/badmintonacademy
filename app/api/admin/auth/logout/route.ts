import { NextResponse } from "next/server";
import { revokeRefreshToken, clearAuthCookies, extractRefreshTokenFromRequest } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const refreshToken = body.refreshToken || extractRefreshTokenFromRequest(request);

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    const response = NextResponse.json({
      success: true,
      message: "Session terminated successfully.",
    });

    // Clear HttpOnly auth cookies
    clearAuthCookies(response);

    return response;
  } catch (error) {
    console.error("Logout API error:", error);
    const response = NextResponse.json(
      { success: false, error: "Internal server error during logout." },
      { status: 500 }
    );
    clearAuthCookies(response);
    return response;
  }
}

