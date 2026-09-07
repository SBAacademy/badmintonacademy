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

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, data: { results: [] } });
    }

    const term = `%${q}%`;
    const results: Array<{
      type: "LEAD" | "STUDENT" | "PARENT" | "COACH" | "BATCH";
      id: string;
      title: string;
      subtitle: string;
      route: string;
    }> = [];

    // Search Students
    const students = await sql`
      SELECT id, full_name, phone, student_code, branch
      FROM students
      WHERE full_name ILIKE ${term} OR phone ILIKE ${term} OR student_code ILIKE ${term}
      LIMIT 10;
    `;
    for (const s of students) {
      results.push({
        type: "STUDENT",
        id: s.id,
        title: s.full_name,
        subtitle: `${s.student_code || s.branch || "Student"} • ${s.phone || ""}`,
        route: `/students?id=${s.id}`,
      });
    }

    // Search Leads (if staff has CRM permission)
    if (auth.user.role !== "COACH") {
      const leads = await sql`
        SELECT id, name, phone, branch, status
        FROM leads
        WHERE name ILIKE ${term} OR phone ILIKE ${term}
        LIMIT 10;
      `;
      for (const l of leads) {
        results.push({
          type: "LEAD",
          id: l.id,
          title: l.name,
          subtitle: `Lead • ${l.status} • ${l.branch || ""}`,
          route: `/leads?id=${l.id}`,
        });
      }

      // Search Parents
      const parents = await sql`
        SELECT id, full_name, phone, email
        FROM parents
        WHERE full_name ILIKE ${term} OR phone ILIKE ${term} OR email ILIKE ${term}
        LIMIT 10;
      `;
      for (const p of parents) {
        results.push({
          type: "PARENT",
          id: p.id,
          title: p.full_name,
          subtitle: `Parent • ${p.phone || p.email || ""}`,
          route: `/students?parentId=${p.id}`,
        });
      }
    }

    // Search Coaches
    const coaches = await sql`
      SELECT id, name, role, phone, primary_centre
      FROM coaches
      WHERE name ILIKE ${term} OR phone ILIKE ${term}
      LIMIT 5;
    `;
    for (const c of coaches) {
      results.push({
        type: "COACH",
        id: c.id,
        title: c.name,
        subtitle: `Coach • ${c.role || "Coach"} • ${c.primary_centre || ""}`,
        route: `/coaches`,
      });
    }

    // Search Batches
    const batches = await sql`
      SELECT id, name, centre_slug, start_time
      FROM batches
      WHERE name ILIKE ${term}
      LIMIT 5;
    `;
    for (const b of batches) {
      results.push({
        type: "BATCH",
        id: b.id,
        title: b.name,
        subtitle: `Batch • ${b.centre_slug} • ${b.start_time || ""}`,
        route: `/schedule`,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        query: q,
        total: results.length,
        results,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/search error:", error);
    return NextResponse.json({ success: false, error: "Search failed." }, { status: 500 });
  }
}
