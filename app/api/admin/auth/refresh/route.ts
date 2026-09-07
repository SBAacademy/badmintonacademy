import { NextResponse } from "next/server";
import { rotateRefreshToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "Refresh token is required." },
        { status: 400 }
      );
    }

    const rotated = await rotateRefreshToken(refreshToken);

    if (!rotated) {
      return NextResponse.json(
        { success: false, error: "Invalid, expired, or reused refresh token. Please log in again." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Token rotated successfully.",
      data: {
        user: rotated.user,
        accessToken: rotated.newAccessToken,
        refreshToken: rotated.newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Refresh token API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during token refresh." },
      { status: 500 }
    );
  }
}
