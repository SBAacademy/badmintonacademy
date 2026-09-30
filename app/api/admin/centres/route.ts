import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCentres, saveCentreRecord } from "@/lib/contentDb";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") !== "false";
    const centres = await getCentres({ includeInactive });

    return NextResponse.json(
      {
        success: true,
        total: centres.length,
        centres,
        data: {
          total: centres.length,
          centres,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/admin/centres error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch centres." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, message: "Centre name is required." },
        { status: 400 }
      );
    }

    const saved = await saveCentreRecord(body);
    const allCentres = await getCentres({ includeInactive: true });

    revalidatePath("/");
    revalidatePath("/branches");
    revalidatePath("/contact");
    revalidatePath("/coaches");
    revalidatePath("/sitemap.xml");
    if (saved.slug) {
      revalidatePath(`/${saved.slug}`);
      revalidatePath(`/branches/${saved.slug}`);
    }

    return NextResponse.json({
      success: true,
      message: "Centre created successfully.",
      centre: saved,
      centres: allCentres,
    });
  } catch (error) {
    console.error("POST /api/admin/centres error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create centre." },
      { status: 500 }
    );
  }
}
