import { NextResponse } from "next/server";
import { getCentres } from "@/lib/contentDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/centres - Public active centres in displayOrder ASC
export async function GET() {
  try {
    const centres = await getCentres({ includeInactive: false });
    return NextResponse.json({
      success: true,
      total: centres.length,
      centres,
      items: centres,
      data: centres, // for compatibility
    });
  } catch (error) {
    console.error("GET /api/centres error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch active centres." },
      { status: 500 }
    );
  }
}
