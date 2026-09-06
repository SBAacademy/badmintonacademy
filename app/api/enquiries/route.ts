import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { LOCATIONS } from "@/data/locations";
import { PROGRAMS } from "@/data/programs";
import { buildEnquiryWhatsAppUrl } from "@/lib/whatsapp";

const LEADS_FILE_PATH = path.join(process.cwd(), "data", "leads.json");

export interface LeadItem {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  ageCategory: string;
  branch: string;
  program: string;
  slot: string;
  message?: string;
  status: "NEW" | "CONTACTED" | "TRIAL_SCHEDULED" | "ENROLLED" | "DROPPED";
  notes?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  submittedAt: string;
  updatedAt?: string;
}

async function readLeads(): Promise<LeadItem[]> {
  try {
    const fileData = await fs.readFile(LEADS_FILE_PATH, "utf-8");
    return JSON.parse(fileData);
  } catch {
    return [];
  }
}

async function saveLeads(leads: LeadItem[]): Promise<void> {
  await fs.writeFile(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), "utf-8");
}

// 1. POST: Register new lead and construct instant WhatsApp link
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

    const branchObj = Object.values(LOCATIONS).find((b) => b.slug === data.preferredBranch);
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

    // Save lead persistently to CRM store
    const existingLeads = await readLeads();
    const updatedLeads = [newLead, ...existingLeads];
    await saveLeads(updatedLeads);

    // Build WhatsApp URL with full filled details
    const whatsappUrl = buildEnquiryWhatsAppUrl({
      name: newLead.name,
      phone: newLead.phone,
      email: newLead.email || undefined,
      ageCategory: newLead.ageCategory,
      preferredBranchName: branchDisplayName,
      preferredProgramName: programDisplayName,
      preferredSlot: newLead.slot,
      message: newLead.message,
    });

    return NextResponse.json({
      success: true,
      message: "Lead recorded in CRM. Opening WhatsApp...",
      enquiryId: newLead.id,
      whatsappUrl,
      lead: newLead,
    });
  } catch (error) {
    console.error("Enquiry API POST error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

// 2. GET: Retrieve leads for CRM tool with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const branch = searchParams.get("branch");
    const search = searchParams.get("search")?.toLowerCase();

    let leads = await readLeads();

    if (status && status !== "ALL") {
      leads = leads.filter((l) => l.status === status);
    }

    if (branch && branch !== "ALL") {
      leads = leads.filter((l) => l.branch === branch);
    }

    if (search) {
      leads = leads.filter(
        (l) =>
          l.name.toLowerCase().includes(search) ||
          l.phone.includes(search) ||
          (l.email && l.email.toLowerCase().includes(search))
      );
    }

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

// 3. PATCH: Update lead status or internal notes from CRM
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Lead ID is required." },
        { status: 400 }
      );
    }

    const leads = await readLeads();
    const leadIndex = leads.findIndex((l) => l.id === id);

    if (leadIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Lead not found." },
        { status: 404 }
      );
    }

    if (status) {
      leads[leadIndex].status = status;
    }

    if (typeof notes === "string") {
      leads[leadIndex].notes = notes;
    }

    leads[leadIndex].updatedAt = new Date().toISOString();

    await saveLeads(leads);

    return NextResponse.json({
      success: true,
      lead: leads[leadIndex],
    });
  } catch (error) {
    console.error("Enquiry API PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update lead." },
      { status: 500 }
    );
  }
}

// 4. DELETE: Remove lead from CRM
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

    const leads = await readLeads();
    const filteredLeads = leads.filter((l) => l.id !== id);

    await saveLeads(filteredLeads);

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
