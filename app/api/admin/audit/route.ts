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
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "100", 10), 200);
    const entity = searchParams.get("entity");

    let query = `
      SELECT id, actor_user_id, actor_name, action, entity, entity_id, old_data, new_data, ip_address, created_at
      FROM audit_logs
    `;
    const params: (string | number)[] = [];

    if (entity) {
      params.push(entity.toUpperCase());
      query += ` WHERE entity = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logs = await (sql as any)(query, params);

    return NextResponse.json({
      success: true,
      data: {
        total: logs.length,
        logs,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/audit error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch audit logs." }, { status: 500 });
  }
}
