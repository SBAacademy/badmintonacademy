import { NextResponse } from "next/server";
import { revokeRefreshToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { refreshToken } = body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    return NextResponse.json({
      success: true,
      message: "Session terminated successfully.",
    });
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during logout." },
      { status: 500 }
    );
  }
}
