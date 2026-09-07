import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const notifications = await sql`
      SELECT *
      FROM notifications
      ORDER BY created_at DESC
      LIMIT 50;
    `;

    const unreadCountResult = await sql`
      SELECT COUNT(*)::int as count
      FROM notifications
      WHERE is_read = false;
    `;

    return NextResponse.json({
      success: true,
      data: {
        unreadCount: unreadCountResult[0]?.count ?? 0,
        notifications,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/notifications error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch notifications." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const body = await request.json().catch(() => ({}));
    const { id, markAllAsRead } = body;

    if (markAllAsRead) {
      await sql`
        UPDATE notifications
        SET is_read = true
        WHERE is_read = false;
      `;
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (id) {
      await sql`
        UPDATE notifications
        SET is_read = true
        WHERE id = ${id};
      `;
      return NextResponse.json({ success: true, message: "Notification marked as read." });
    }

    return NextResponse.json({ success: false, error: "Notification ID or markAllAsRead flag required." }, { status: 400 });
  } catch (error) {
    console.error("PUT /api/admin/notifications error:", error);
    return NextResponse.json({ success: false, error: "Failed to update notification." }, { status: 500 });
  }
}
