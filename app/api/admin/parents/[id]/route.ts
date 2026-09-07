import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "FRONT_DESK"]);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const parentRows = await sql`SELECT * FROM parents WHERE id = ${id} LIMIT 1;`;
    if (parentRows.length === 0) {
      return NextResponse.json({ success: false, error: "Parent not found." }, { status: 404 });
    }

    const parent = parentRows[0];
    const students = await sql`
      SELECT s.*, cen.name as centre_name, p.name as program_name
      FROM students s
      LEFT JOIN centres cen ON s.primary_centre = cen.slug
      LEFT JOIN programs p ON s.primary_program = p.slug
      WHERE s.parent_id = ${id}
      ORDER BY s.joined_at DESC;
    `;

    return NextResponse.json({
      success: true,
      data: {
        parent,
        students,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/parents/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch parent." }, { status: 500 });
  }
}
