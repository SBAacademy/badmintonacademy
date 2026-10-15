import { NextResponse } from "next/server";
import { getEvents } from "@/lib/contentDb";
import { EventStatus } from "@/data/events";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

// GET /api/events - Public published events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") || "all";
    const typeParam = searchParams.get("type") || searchParams.get("eventType") || undefined;
    const limitParam = searchParams.get("limit");
    const featuredParam = searchParams.get("featured");

    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const events = await getEvents({
      includeUnpublished: false,
      status: statusParam as EventStatus | "upcoming" | "all",
      eventType: typeParam,
      limit: limit,
    });

    const filtered = featuredParam === "true" 
      ? events.filter((e) => e.isFeatured)
      : events;

    return NextResponse.json(
      {
        success: true,
        count: filtered.length,
        items: filtered,
        events: filtered,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch events." },
      { status: 500 }
    );
  }
}
