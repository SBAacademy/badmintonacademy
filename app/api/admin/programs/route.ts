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

    const programs = await sql`
      SELECT 
        p.*,
        COUNT(DISTINCT b.id)::int as active_batches_count,
        COUNT(DISTINCT bs.student_id)::int as enrolled_students_count
      FROM programs p
      LEFT JOIN batches b ON p.slug = b.program_slug AND b.status = 'ACTIVE'
      LEFT JOIN batch_students bs ON b.id = bs.batch_id AND bs.status = 'ACTIVE'
      WHERE p.status = 'ACTIVE'
      GROUP BY p.slug
      ORDER BY p.name ASC;
    `;

    return NextResponse.json({
      success: true,
      data: {
        total: programs.length,
        programs,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/programs error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch programs." }, { status: 500 });
  }
}
