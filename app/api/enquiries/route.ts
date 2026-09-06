import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. Honeypot check for anti-spam
    if (data.botAddress && data.botAddress.trim() !== "") {
      // Deceive bot with a 200 OK
      return NextResponse.json({ success: true, message: "Enquiry received" });
    }

    // 2. Validate mandatory fields
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

    // 3. Construct structured lead record
    const enquiryRecord = {
      id: `ENQ-${Date.now()}`,
      name: String(data.name).trim(),
      phone: cleanPhone,
      email: data.email ? String(data.email).trim() : null,
      ageCategory: data.ageCategory || "Not Specified",
      branch: data.preferredBranch || "Kadavanthra",
      program: data.preferredProgram || "General Coaching",
      slot: data.preferredSlot || "Evening",
      message: data.message ? String(data.message).trim() : "",
      utmSource: data.utm_source || "direct",
      utmMedium: data.utm_medium || "website",
      utmCampaign: data.utm_campaign || "organic",
      submittedAt: new Date().toISOString(),
    };

    // Log structured lead record on the server
    console.log("=== [NEW BADMINTON ENQUIRY RECEIVED] ===");
    console.log(JSON.stringify(enquiryRecord, null, 2));

    return NextResponse.json({
      success: true,
      message: "Trial booking received. Our coach will contact you shortly.",
      enquiryId: enquiryRecord.id,
    });
  } catch (error) {
    console.error("Enquiry API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try WhatsApp directly." },
      { status: 500 }
    );
  }
}
