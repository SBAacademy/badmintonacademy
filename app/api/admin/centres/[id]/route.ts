import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCentreBySlug, saveCentreRecord, deleteCentreRecord, getCentres } from "@/lib/contentDb";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const centre = await getCentreBySlug(id);

    if (!centre) {
      return NextResponse.json(
        { success: false, message: "Centre not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        centre,
        data: centre,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/admin/centres/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch centre." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const payload = {
      ...body,
      slug: id,
    };

    const saved = await saveCentreRecord(payload);
    const allCentres = await getCentres({ includeInactive: true });

    revalidatePath("/");
    revalidatePath("/branches");
    revalidatePath("/contact");
    revalidatePath("/coaches");
    revalidatePath("/sitemap.xml");
    revalidatePath(`/${id}`);
    revalidatePath(`/branches/${id}`);

    return NextResponse.json({
      success: true,
      message: "Centre updated successfully.",
      centre: saved,
      centres: allCentres,
    });
  } catch (error) {
    console.error("PUT /api/admin/centres/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update centre." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const centre = await getCentreBySlug(id);
    if (!centre) {
      return NextResponse.json(
        { success: false, message: "Centre not found." },
        { status: 404 }
      );
    }

    const newStatus = body.status || (body.isActive ? "ACTIVE" : "INACTIVE");
    const isActive = newStatus === "ACTIVE";

    const updated = await saveCentreRecord({
      ...centre,
      status: newStatus,
      isActive,
    });

    const allCentres = await getCentres({ includeInactive: true });

    revalidatePath("/");
    revalidatePath("/branches");
    revalidatePath("/contact");
    revalidatePath("/coaches");
    revalidatePath("/sitemap.xml");
    revalidatePath(`/${id}`);
    revalidatePath(`/branches/${id}`);

    return NextResponse.json({
      success: true,
      message: `Centre status set to ${newStatus}.`,
      centre: updated,
      centres: allCentres,
    });
  } catch (error) {
    console.error("PATCH /api/admin/centres/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update centre status." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const softDelete = searchParams.get("softDelete") === "true";

    const result = await deleteCentreRecord(id, { softDelete });
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    const allCentres = await getCentres({ includeInactive: true });

    revalidatePath("/");
    revalidatePath("/branches");
    revalidatePath("/contact");
    revalidatePath("/coaches");
    revalidatePath("/gallery");
    revalidatePath("/sitemap.xml");
    revalidatePath(`/${id}`);
    revalidatePath(`/branches/${id}`);

    return NextResponse.json({
      success: true,
      message: result.message,
      softDeleted: result.softDeleted,
      centres: allCentres,
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/centres/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete centre." },
      { status: 500 }
    );
  }
}
