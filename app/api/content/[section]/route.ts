import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  ContentSectionKey,
  getContentSection,
  saveContentSection,
  getCoaches,
  saveCoachRecord,
  deleteCoachRecord,
  reorderCoaches,
  getCentres,
  saveCentreRecord,
  deleteCentreRecord,
  reorderCentres,
} from "@/lib/contentDb";
import { GALLERY_ITEMS } from "@/data/gallery";
import { COACHES, Coach } from "@/data/coaches";
import { ACHIEVEMENTS } from "@/data/achievements";
import { TESTIMONIALS } from "@/data/testimonials";
import { BLOG_POSTS } from "@/data/blog";

const VALID_SECTIONS: ContentSectionKey[] = [
  "gallery",
  "coaches",
  "achievements",
  "testimonials",
  "blog",
  "centres",
];

function getDefaultItems(section: ContentSectionKey): unknown[] {
  switch (section) {
    case "gallery":
      return GALLERY_ITEMS;
    case "coaches":
      return [];
    case "achievements":
      return ACHIEVEMENTS;
    case "testimonials":
      return TESTIMONIALS;
    case "blog":
      return BLOG_POSTS;
    default:
      return [];
  }
}

// 1. GET: Fetch items for the given content section
export async function GET(
  request: Request,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params;

    if (!VALID_SECTIONS.includes(section as ContentSectionKey)) {
      return NextResponse.json(
        { success: false, message: `Invalid section: ${section}` },
        { status: 400 }
      );
    }

    const sectionKey = section as ContentSectionKey;

    if (sectionKey === "coaches") {
      // Return authoritative coaches including draft/inactive for admin view
      const coaches = await getCoaches({ includeUnpublished: true });
      return NextResponse.json({
        success: true,
        section: sectionKey,
        total: coaches.length,
        items: coaches,
      });
    }

    if (sectionKey === "centres") {
      // Return authoritative centres including inactive for admin view
      const centres = await getCentres({ includeInactive: true });
      return NextResponse.json({
        success: true,
        section: sectionKey,
        total: centres.length,
        items: centres,
      });
    }

    const defaults = getDefaultItems(sectionKey);
    const items = await getContentSection(sectionKey, defaults);

    return NextResponse.json({
      success: true,
      section: sectionKey,
      total: items.length,
      items,
    });
  } catch (error) {
    console.error("Content API GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch content." },
      { status: 500 }
    );
  }
}

// 2. POST: Add a new item to the section
export async function POST(
  request: Request,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params;

    if (!VALID_SECTIONS.includes(section as ContentSectionKey)) {
      return NextResponse.json(
        { success: false, message: `Invalid section: ${section}` },
        { status: 400 }
      );
    }

    const sectionKey = section as ContentSectionKey;
    const body = await request.json();

    if (sectionKey === "coaches") {
      if (!body.name || !body.role) {
        return NextResponse.json(
          { success: false, message: "Name and role are required for coach." },
          { status: 400 }
        );
      }

      const savedCoach = await saveCoachRecord(body);
      const allCoaches = await getCoaches({ includeUnpublished: true });

      // Invalidate cache immediately
      revalidatePath("/");
      revalidatePath("/coaches");
      if (savedCoach.slug) revalidatePath(`/coaches/${savedCoach.slug}`);
      if (savedCoach.id) revalidatePath(`/coaches/${savedCoach.id}`);

      return NextResponse.json({
        success: true,
        message: "Coach created successfully.",
        item: savedCoach,
        items: allCoaches,
      });
    }

    if (sectionKey === "centres") {
      if (!body.name) {
        return NextResponse.json(
          { success: false, message: "Centre name is required." },
          { status: 400 }
        );
      }

      const savedCentre = await saveCentreRecord(body);
      const allCentres = await getCentres({ includeInactive: true });

      // Invalidate cache immediately
      revalidatePath("/");
      revalidatePath("/branches");
      revalidatePath("/contact");
      revalidatePath("/coaches");
      if (savedCentre.slug) {
        revalidatePath(`/${savedCentre.slug}`);
        revalidatePath(`/branches/${savedCentre.slug}`);
      }

      return NextResponse.json({
        success: true,
        message: "Centre created successfully.",
        item: savedCentre,
        items: allCentres,
      });
    }

    const defaults = getDefaultItems(sectionKey);
    const currentItems = await getContentSection<Record<string, unknown>>(sectionKey, defaults as Record<string, unknown>[]);

    // Ensure item has an ID or slug
    const newItem = {
      ...body,
      id: body.id || `${sectionKey.substring(0, 3)}-${Date.now()}`,
    };

    if (sectionKey === "blog" && !newItem.slug) {
      newItem.slug = String(newItem.title || "new-article")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const updatedItems = [newItem, ...currentItems];
    await saveContentSection(sectionKey, updatedItems);

    revalidatePath("/");
    revalidatePath(`/${sectionKey}`);

    return NextResponse.json({
      success: true,
      message: `${sectionKey} item created successfully.`,
      item: newItem,
      items: updatedItems,
    });
  } catch (error) {
    console.error("Content API POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create content item." },
      { status: 500 }
    );
  }
}

// 3. PUT: Update an existing item
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params;

    if (!VALID_SECTIONS.includes(section as ContentSectionKey)) {
      return NextResponse.json(
        { success: false, message: `Invalid section: ${section}` },
        { status: 400 }
      );
    }

    const sectionKey = section as ContentSectionKey;
    const body = await request.json();

    // Dedicated batch reordering for coaches
    if (sectionKey === "coaches" && (body.action === "reorder" || Array.isArray(body.orders))) {
      const orders = Array.isArray(body.orders)
        ? body.orders
        : Array.isArray(body.orderMap)
        ? body.orderMap
        : [];
      const updatedCoaches = await reorderCoaches(orders);
      revalidatePath("/");
      revalidatePath("/coaches");
      return NextResponse.json({
        success: true,
        message: "Coaches display order updated successfully.",
        items: updatedCoaches,
      });
    }

    if (sectionKey === "centres" && (body.action === "reorder" || Array.isArray(body.orders))) {
      const orders = Array.isArray(body.orders)
        ? body.orders
        : Array.isArray(body.orderMap)
        ? body.orderMap
        : [];
      const updatedCentres = await reorderCentres(orders);
      revalidatePath("/");
      revalidatePath("/branches");
      revalidatePath("/contact");
      return NextResponse.json({
        success: true,
        message: "Centres display order updated successfully.",
        items: updatedCentres,
      });
    }

    const itemData = (body && typeof body === "object" && body.item && typeof body.item === "object") ? body.item : body;
    const identifier = itemData.id || itemData.slug;

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: "Item ID or slug is required for update." },
        { status: 400 }
      );
    }

    if (sectionKey === "coaches") {
      const savedCoach = await saveCoachRecord(itemData);
      const allCoaches = await getCoaches({ includeUnpublished: true });

      revalidatePath("/");
      revalidatePath("/coaches");
      if (savedCoach.slug) revalidatePath(`/coaches/${savedCoach.slug}`);
      if (savedCoach.id) revalidatePath(`/coaches/${savedCoach.id}`);

      return NextResponse.json({
        success: true,
        message: "Coach updated successfully.",
        item: savedCoach,
        items: allCoaches,
      });
    }

    if (sectionKey === "centres") {
      const savedCentre = await saveCentreRecord(itemData);
      const allCentres = await getCentres({ includeInactive: true });

      revalidatePath("/");
      revalidatePath("/branches");
      revalidatePath("/contact");
      revalidatePath("/coaches");
      if (savedCentre.slug) {
        revalidatePath(`/${savedCentre.slug}`);
        revalidatePath(`/branches/${savedCentre.slug}`);
      }

      return NextResponse.json({
        success: true,
        message: "Centre updated successfully.",
        item: savedCentre,
        items: allCentres,
      });
    }

    const defaults = getDefaultItems(sectionKey);
    const currentItems = await getContentSection<Record<string, unknown>>(sectionKey, defaults as Record<string, unknown>[]);

    const itemIndex = currentItems.findIndex(
      (item) => item.id === identifier || item.slug === identifier
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Item not found." },
        { status: 404 }
      );
    }

    const updatedItem = {
      ...currentItems[itemIndex],
      ...body,
    };

    currentItems[itemIndex] = updatedItem;
    await saveContentSection(sectionKey, currentItems);

    revalidatePath("/");
    revalidatePath(`/${sectionKey}`);

    return NextResponse.json({
      success: true,
      message: `${sectionKey} item updated successfully.`,
      item: updatedItem,
      items: currentItems,
    });
  } catch (error) {
    console.error("Content API PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update content item." },
      { status: 500 }
    );
  }
}

// 4. DELETE: Remove an item by id or slug
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params;

    if (!VALID_SECTIONS.includes(section as ContentSectionKey)) {
      return NextResponse.json(
        { success: false, message: `Invalid section: ${section}` },
        { status: 400 }
      );
    }

    const sectionKey = section as ContentSectionKey;
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get("id") || searchParams.get("slug");

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: "Item ID or slug is required for deletion." },
        { status: 400 }
      );
    }

    if (sectionKey === "coaches") {
      const result = await deleteCoachRecord(identifier, false);
      const allCoaches = await getCoaches({ includeUnpublished: true });

      revalidatePath("/");
      revalidatePath("/coaches");

      return NextResponse.json({
        success: true,
        message: result.message,
        items: allCoaches,
      });
    }

    if (sectionKey === "centres") {
      const softDelete = searchParams.get("softDelete") === "true";
      const result = await deleteCentreRecord(identifier, { softDelete });
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
      revalidatePath(`/${identifier}`);
      revalidatePath(`/branches/${identifier}`);

      return NextResponse.json({
        success: true,
        message: result.message,
        softDeleted: result.softDeleted,
        items: allCentres,
      });
    }

    const defaults = getDefaultItems(sectionKey);
    const currentItems = await getContentSection<Record<string, unknown>>(sectionKey, defaults as Record<string, unknown>[]);

    const filteredItems = currentItems.filter(
      (item) => item.id !== identifier && item.slug !== identifier
    );

    await saveContentSection(sectionKey, filteredItems);

    revalidatePath("/");
    revalidatePath(`/${sectionKey}`);

    return NextResponse.json({
      success: true,
      message: `${sectionKey} item deleted successfully.`,
      items: filteredItems,
    });
  } catch (error) {
    console.error("Content API DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete content item." },
      { status: 500 }
    );
  }
}
