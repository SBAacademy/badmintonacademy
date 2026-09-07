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

    // 1. Lead Pipeline Counts
    const leadCounts = await sql`
      SELECT 
        COUNT(*)::int as total_leads,
        COUNT(CASE WHEN status = 'NEW' THEN 1 END)::int as new_leads,
        COUNT(CASE WHEN status = 'CONTACTED' THEN 1 END)::int as contacted_leads,
        COUNT(CASE WHEN status = 'TRIAL_SCHEDULED' THEN 1 END)::int as trial_scheduled_leads,
        COUNT(CASE WHEN status = 'TRIAL_ATTENDED' THEN 1 END)::int as trial_attended_leads,
        COUNT(CASE WHEN status = 'ENROLLED' THEN 1 END)::int as enrolled_leads
      FROM leads;
    `;

    // 2. Active Students Count by Centre
    const studentDistribution = await sql`
      SELECT primary_centre, COUNT(*)::int as active_count
      FROM students
      WHERE status = 'ACTIVE'
      GROUP BY primary_centre;
    `;

    // 3. Financial Summary
    const financeSummary = await sql`
      SELECT 
        COALESCE(SUM(amount_due), 0)::numeric as total_billed,
        COALESCE((SELECT SUM(amount_paid) FROM payments), 0)::numeric as total_collected,
        COALESCE(SUM(CASE WHEN status IN ('UNPAID', 'PARTIAL', 'OVERDUE') THEN amount_due END), 0)::numeric -
        COALESCE((SELECT SUM(allocated_amount) FROM payment_allocations), 0)::numeric as total_receivables
      FROM fee_invoices;
    `;

    // 4. Attendance Rate over last 30 days
    const attendanceSummary = await sql`
      SELECT 
        COUNT(*)::int as total_marks,
        COUNT(CASE WHEN status = 'PRESENT' THEN 1 END)::int as present_marks,
        ROUND(
          (COUNT(CASE WHEN status = 'PRESENT' THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100, 
          1
        ) as attendance_percentage
      FROM attendance;
    `;

    return NextResponse.json({
      success: true,
      data: {
        funnel: leadCounts[0],
        studentsByCentre: studentDistribution,
        finance: financeSummary[0],
        attendance: attendanceSummary[0] || { attendance_percentage: 0 },
      },
    });
  } catch (error) {
    console.error("GET /api/admin/reports/summary error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate report summary." }, { status: 500 });
  }
}
