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

    const rows = await sql`
      SELECT 
        fi.id as invoice_id,
        fi.billing_period,
        fi.amount_due,
        fi.due_date,
        fi.status,
        s.id as student_id,
        s.full_name as student_name,
        cen.name as centre_name,
        prg.name as program_name,
        p.full_name as parent_name,
        p.phone as parent_phone,
        COALESCE(SUM(pa.allocated_amount), 0)::numeric as paid_amount,
        (fi.amount_due - COALESCE(SUM(pa.allocated_amount), 0))::numeric as balance_due
      FROM fee_invoices fi
      JOIN students s ON fi.student_id = s.id
      JOIN parents p ON s.parent_id = p.id
      LEFT JOIN centres cen ON s.primary_centre = cen.slug
      LEFT JOIN programs prg ON s.primary_program = prg.slug
      LEFT JOIN payment_allocations pa ON fi.id = pa.invoice_id
      WHERE fi.status IN ('UNPAID', 'PARTIAL', 'OVERDUE')
      GROUP BY fi.id, s.id, s.full_name, cen.name, prg.name, p.full_name, p.phone
      HAVING (fi.amount_due - COALESCE(SUM(pa.allocated_amount), 0)) > 0
      ORDER BY fi.due_date ASC;
    `;

    const reminders = rows.map((r) => {
      const cleanPhone = String(r.parent_phone).replace(/[^0-9]/g, "");
      const message = `Hello ${r.parent_name}, this is a gentle reminder from SBA Badminton Academy regarding ${r.student_name}'s coaching fee of ₹${r.balance_due} for ${r.billing_period} (Due: ${r.due_date}). Please clear the dues via UPI or cash at the academy reception. Thank you!`;
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

      return {
        ...r,
        whatsappUrl,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        total: reminders.length,
        reminders,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/payments/reminders error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch reminders." }, { status: 500 });
  }
}
