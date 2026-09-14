import { NextResponse } from "next/server";
import { LOCATIONS } from "@/data/locations";
import { getCentreBySlug } from "@/lib/contentDb";
import { PROGRAMS } from "@/data/programs";
import { buildEnquiryWhatsAppUrl } from "@/lib/whatsapp";
import {
  LeadItem,
  getLeads,
  createLead,
  updateLead,
  deleteLead,
} from "@/lib/db";

export type { LeadItem };

// 1. POST: Register new lead into Neon PostgreSQL CRM and construct instant WhatsApp link
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Honeypot check for anti-spam
    if (data.botAddress && data.botAddress.trim() !== "") {
      return NextResponse.json({ success: true, message: "Enquiry received" });
    }

    // Validate mandatory fields
    if (!data.name || !data.phone) {
      return NextResponse.json(
        { success: false, message: "Name and Phone Number are required." },
        { status: 400 }
      );
    }

    const cleanPhone = String(data.phone).replace(/[^0-9+]/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid 10-digit telephone number." },
        { status: 400 }
      );
    }

    const dynamicCentre = await getCentreBySlug(data.preferredBranch);
    const branchObj = dynamicCentre || Object.values(LOCATIONS).find((b) => b.slug === data.preferredBranch);
    const programObj = PROGRAMS.find((p) => p.slug === data.preferredProgram);

    const branchDisplayName = branchObj?.name || data.preferredBranch || "Kochi Centre";
    const programDisplayName = programObj?.name || data.preferredProgram || "General Badminton Coaching";

    // Construct structured lead record
    const newLead: LeadItem = {
      id: `ENQ-${Date.now()}`,
      name: String(data.name).trim(),
      phone: cleanPhone,
      email: data.email ? String(data.email).trim() : null,
      ageCategory: data.ageCategory || "Junior (Ages 10-16)",
      branch: data.preferredBranch || "kadavanthra",
      program: data.preferredProgram || "junior-badminton-coaching",
      slot: data.preferredSlot || "Evening (04:30 PM - 07:30 PM)",
      message: data.message ? String(data.message).trim() : "",
      status: "NEW",
      notes: "",
      utmSource: data.utm_source || "direct",
      utmMedium: data.utm_medium || "website",
      utmCampaign: data.utm_campaign || "organic",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save lead persistently to Neon PostgreSQL DB (with local fallback)
    const savedLead = await createLead(newLead);

    // Create staff in-app notification asynchronously
    try {
      if (process.env.DATABASE_URL) {
        const { neon } = await import("@neondatabase/serverless");
        const sql = neon(process.env.DATABASE_URL);
        await sql`
          INSERT INTO notifications (id, user_id, type, title, body, deep_link, created_at)
          VALUES (
            ${'notif_' + Date.now()},
            NULL,
            'NEW_LEAD',
            'New Inbound Website Enquiry',
            ${`${savedLead.name} (${savedLead.phone}) enquired for ${savedLead.program} at ${savedLead.branch}`},
            '/leads',
            NOW()
          );
        `;
      }
    } catch {
      // Non-blocking notification
    }

    // Build WhatsApp URL with full filled details
    const whatsappUrl = buildEnquiryWhatsAppUrl({
      name: savedLead.name,
      phone: savedLead.phone,
      email: savedLead.email || undefined,
      ageCategory: savedLead.ageCategory,
      preferredBranchName: branchDisplayName,
      preferredProgramName: programDisplayName,
      preferredSlot: savedLead.slot,
      message: savedLead.message,
    });

    return NextResponse.json({
      success: true,
      message: "Lead recorded in CRM. Opening WhatsApp...",
      enquiryId: savedLead.id,
      whatsappUrl,
      lead: savedLead,
    });
  } catch (error) {
    console.error("Enquiry API POST error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

// 2. GET: Retrieve leads from Neon DB for CRM tool with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const branch = searchParams.get("branch");
    const search = searchParams.get("search");

    const leads = await getLeads({ status, branch, search });

    return NextResponse.json({
      success: true,
      total: leads.length,
      leads,
    });
  } catch (error) {
    console.error("Enquiry API GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch leads." },
      { status: 500 }
    );
  }
}

// 3. PATCH: Update lead status or internal notes in Neon DB from CRM
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Lead ID is required." },
        { status: 400 }
      );
    }

    const updatedLead = await updateLead(id, updates);

    if (!updatedLead) {
      return NextResponse.json(
        { success: false, message: "Lead not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Enquiry API PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update lead." },
      { status: 500 }
    );
  }
}

// 4. DELETE: Remove lead from Neon DB
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Lead ID is required." },
        { status: 400 }
      );
    }

    await deleteLead(id);

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully.",
    });
  } catch (error) {
    console.error("Enquiry API DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete lead." },
      { status: 500 }
    );
  }
}
