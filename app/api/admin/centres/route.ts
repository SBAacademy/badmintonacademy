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

    const centres = await sql`
      SELECT 
        c.*,
        COUNT(DISTINCT b.id)::int as active_batches_count,
        COUNT(DISTINCT bs.student_id)::int as enrolled_students_count
      FROM centres c
      LEFT JOIN batches b ON c.slug = b.centre_slug AND b.status = 'ACTIVE'
      LEFT JOIN batch_students bs ON b.id = bs.batch_id AND bs.status = 'ACTIVE'
      WHERE c.status = 'ACTIVE'
      GROUP BY c.slug
      ORDER BY c.name ASC;
    `;

    return NextResponse.json({
      success: true,
      data: {
        total: centres.length,
        centres,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/centres error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch centres." }, { status: 500 });
  }
}
