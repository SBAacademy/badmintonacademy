import { NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/contentDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/events/[slug] - Single public published event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event = await getEventBySlug(slug, { includeUnpublished: false });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        event,
        data: event,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/events/[slug] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch event." },
      { status: 500 }
    );
  }
}
