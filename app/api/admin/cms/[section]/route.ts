import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  ContentSectionKey,
  getContentSection,
  saveContentSection,
  getCoaches,
  getFooterSettings,
  saveFooterSettings,
} from "@/lib/contentDb";
import { logAuditEvent } from "@/lib/audit";

const VALID_SECTIONS: ContentSectionKey[] = [
  "gallery",
  "coaches",
  "achievements",
  "testimonials",
  "blog",
  "footer",
];

function getDefaultItems(_section: ContentSectionKey): unknown[] {
  return [];
}

// 1. GET /api/admin/cms/[section]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { section } = await params;
    if (!VALID_SECTIONS.includes(section as ContentSectionKey)) {
      return NextResponse.json({ success: false, error: `Invalid section: ${section}` }, { status: 400 });
    }

    const sectionKey = section as ContentSectionKey;

    if (sectionKey === "footer") {
      const settings = await getFooterSettings();
      return NextResponse.json({
        success: true,
        section: sectionKey,
        settings,
        data: settings,
      });
    }

    if (sectionKey === "coaches") {
      const coaches = await getCoaches({ includeUnpublished: true });
      return NextResponse.json({
        success: true,
        section: sectionKey,
        total: coaches.length,
        items: coaches,
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
    console.error("GET /api/admin/cms error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch CMS content." }, { status: 500 });
  }
}

// 2. PUT /api/admin/cms/[section]: Replace or update items list
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { section } = await params;
    if (!VALID_SECTIONS.includes(section as ContentSectionKey)) {
      return NextResponse.json({ success: false, error: `Invalid section: ${section}` }, { status: 400 });
    }

    const sectionKey = section as ContentSectionKey;
    const body = await request.json();

    if (sectionKey === "footer") {
      const updateData =
        body && typeof body === "object" && body.settings && typeof body.settings === "object"
          ? body.settings
          : body;
      const saved = await saveFooterSettings(updateData);

      await logAuditEvent({
        actorUserId: auth.user.userId,
        actorName: auth.user.fullName,
        action: "CMS_UPDATED_FOOTER",
        entity: "site_content",
        entityId: "footer",
        newData: saved as unknown as Record<string, unknown>,
      });

      return NextResponse.json({
        success: true,
        message: "Footer & admissions settings updated successfully.",
        settings: saved,
      });
    }

    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Items array is required." }, { status: 400 });
    }

    await saveContentSection(sectionKey, items);

    // Audit log
    await logAuditEvent({
      actorUserId: auth.user.userId,
      actorName: auth.user.fullName,
      action: `CMS_UPDATED_${sectionKey.toUpperCase()}`,
      entity: "site_content",
      entityId: sectionKey,
      newData: { count: items.length },
    });

    return NextResponse.json({
      success: true,
      message: `${sectionKey} content updated successfully.`,
      items,
    });
  } catch (error) {
    console.error("PUT /api/admin/cms error:", error);
    return NextResponse.json({ success: false, error: "Failed to update CMS content." }, { status: 500 });
  }
}
