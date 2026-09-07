import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/auth";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const sql = getSql();
    if (!sql) return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const centre = searchParams.get("centre");
    const todayStr = new Date().toISOString().split("T")[0];
    const todayDay = DAY_NAMES[new Date().getDay()]; // e.g. "MON"

    // 1. Ensure today's sessions exist for all active batches running today
    const activeBatches = await sql`
      SELECT id, centre_slug, assigned_coach_id, start_time, end_time
      FROM batches
      WHERE status = 'ACTIVE' AND ${todayDay} = ANY(days_of_week);
    `;

    for (const b of activeBatches) {
      const sessionId = `SES-${todayStr}-${b.id}`;
      await sql`
        INSERT INTO sessions (id, batch_id, centre_slug, coach_id, session_date, start_time, end_time, status, created_at)
        VALUES (${sessionId}, ${b.id}, ${b.centre_slug}, ${b.assigned_coach_id}, ${todayStr}, ${b.start_time}, ${b.end_time}, 'SCHEDULED', NOW())
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // 2. Query today's sessions
    let query = `
      SELECT 
        s.*,
        b.name as batch_name,
        c.name as coach_name,
        cen.name as centre_name,
        p.name as program_name,
        COUNT(DISTINCT bs.student_id)::int as total_students,
        COUNT(DISTINCT a.student_id)::int as marked_students,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'studentId', st.id,
              'fullName', st.full_name,
              'attendanceStatus', att.status,
              'attendanceId', att.id
            )
          )
          FROM batch_students bs2
          JOIN students st ON bs2.student_id = st.id
          LEFT JOIN attendance att ON att.session_id = s.id AND att.student_id = st.id
          WHERE bs2.batch_id = s.batch_id AND bs2.status = 'ACTIVE'),
          '[]'
        ) as roster
      FROM sessions s
      JOIN batches b ON s.batch_id = b.id
      LEFT JOIN coaches c ON s.coach_id = c.id
      LEFT JOIN centres cen ON s.centre_slug = cen.slug
      LEFT JOIN programs p ON b.program_slug = p.slug
      LEFT JOIN batch_students bs ON b.id = bs.batch_id AND bs.status = 'ACTIVE'
      LEFT JOIN attendance a ON s.id = a.session_id
      WHERE s.session_date = $1::date
    `;
    const params: (string | number)[] = [todayStr];

    if (centre && centre !== "ALL") {
      params.push(centre);
      query += ` AND s.centre_slug = $${params.length}`;
    }

    if (auth.user.role === "COACH" && auth.user.assignedCentre) {
      params.push(auth.user.assignedCentre);
      query += ` AND s.centre_slug = $${params.length}`;
    }

    query += ` GROUP BY s.id, b.name, c.name, cen.name, p.name ORDER BY s.start_time ASC;`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessions = await (sql as any).query(query, params);

    return NextResponse.json({
      success: true,
      data: {
        date: todayStr,
        dayOfWeek: todayDay,
        totalSessions: sessions.length,
        sessions,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/sessions/today error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch today's sessions." }, { status: 500 });
  }
}
