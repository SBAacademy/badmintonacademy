import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getEventById,
  saveEventRecord,
  deleteEventRecord,
  toggleEventPublish,
  toggleEventFeatured,
} from "@/lib/contentDb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/events/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await getEventById(id);

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, event },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/admin/events/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch event." },
      { status: 500 }
    );
  }
}

// PUT /api/admin/events/[id] - Update event
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await getEventById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 }
      );
    }

    const payload = {
      ...body,
      id,
    };

    const saved = await saveEventRecord(payload);

    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath(`/events/${saved.slug}`);
    if (existing.slug !== saved.slug) {
      revalidatePath(`/events/${existing.slug}`);
    }
    revalidatePath("/sitemap.xml");

    return NextResponse.json({
      success: true,
      message: "Event updated successfully.",
      event: saved,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/events/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update event." },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/events/[id] - Toggle publish, featured, or status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await getEventById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Event not found." },
        { status: 404 }
      );
    }

    let updated = existing;

    if (typeof body.isPublished === "boolean") {
      updated = await toggleEventPublish(id, body.isPublished);
    }

    if (typeof body.isFeatured === "boolean") {
      updated = await toggleEventFeatured(id, body.isFeatured);
    }

    if (body.status && body.status !== existing.status) {
      updated = await saveEventRecord({ ...existing, id, status: body.status });
    }

    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath(`/events/${updated.slug}`);
    revalidatePath("/sitemap.xml");

    return NextResponse.json({
      success: true,
      message: "Event updated successfully.",
      event: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/events/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update event." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/events/[id] - Permanently delete event
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await getEventById(id);

    const result = await deleteEventRecord(id);

    revalidatePath("/");
    revalidatePath("/events");
    if (existing?.slug) {
      revalidatePath(`/events/${existing.slug}`);
    }
    revalidatePath("/sitemap.xml");

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/events/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete event." },
      { status: 500 }
    );
  }
}
