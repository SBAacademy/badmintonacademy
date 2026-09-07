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

    const rows = await sql`
      SELECT 
        c.*,
        cen.name as centre_name,
        COUNT(DISTINCT b.id)::int as active_batches_count
      FROM coaches c
      LEFT JOIN centres cen ON c.primary_centre = cen.slug
      LEFT JOIN batches b ON c.id = b.assigned_coach_id AND b.status = 'ACTIVE'
      GROUP BY c.id, cen.name
      ORDER BY c.experience_years DESC;
    `;

    return NextResponse.json({
      success: true,
      data: {
        total: rows.length,
        coaches: rows,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/coaches error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch coaches." }, { status: 500 });
  }
}
