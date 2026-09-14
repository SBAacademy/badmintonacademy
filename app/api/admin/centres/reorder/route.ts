import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { reorderCentres } from "@/lib/contentDb";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const orders = Array.isArray(body.orders)
      ? body.orders
      : Array.isArray(body.orderMap)
      ? body.orderMap
      : [];

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json(
        { success: false, message: "Valid order list required." },
        { status: 400 }
      );
    }

    const updatedCentres = await reorderCentres(orders);

    revalidatePath("/");
    revalidatePath("/branches");
    revalidatePath("/contact");
    revalidatePath("/coaches");

    return NextResponse.json({
      success: true,
      message: "Centres display order updated successfully.",
      items: updatedCentres,
      centres: updatedCentres,
    });
  } catch (error) {
    console.error("PUT /api/admin/centres/reorder error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reorder centres." },
      { status: 500 }
    );
  }
}
