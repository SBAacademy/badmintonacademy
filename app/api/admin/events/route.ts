import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getEvents, saveEventRecord } from "@/lib/contentDb";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/events - Admin view of all events
export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const events = await getEvents({ includeUnpublished: true });

    return NextResponse.json(
      {
        success: true,
        count: events.length,
        items: events,
        events,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/admin/events error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch events." },
      { status: 500 }
    );
  }
}

// POST /api/admin/events - Create new event
export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"]);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, message: "Event title is required." },
        { status: 400 }
      );
    }
    if (!body.eventDate || !body.eventDate.trim()) {
      return NextResponse.json(
        { success: false, message: "Event date is required." },
        { status: 400 }
      );
    }
    if (!body.venue || !body.venue.trim()) {
      return NextResponse.json(
        { success: false, message: "Event venue is required." },
        { status: 400 }
      );
    }

    const saved = await saveEventRecord(body);

    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath(`/events/${saved.slug}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/tournaments-sitemap.xml");

    return NextResponse.json({
      success: true,
      message: "Event created successfully.",
      event: saved,
    });
  } catch (error: any) {
    console.error("POST /api/admin/events error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create event." },
      { status: 500 }
    );
  }
}
