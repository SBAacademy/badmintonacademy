import { NextResponse } from "next/server";
import { getContentSection, saveContentSection } from "@/lib/contentDb";
import { Testimonial } from "@/data/testimonials";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const branch = String(body.centre || body.branch || "").trim();
    const content = String(body.review || body.content || "").trim();

    if (!name || !branch || !content) {
      return NextResponse.json(
        { success: false, message: "Name, centre, and review content are required." },
        { status: 400 }
      );
    }

    const current = await getContentSection<Testimonial>("testimonials", []);

    const parts = name.split(" ");
    let initials = "SA";
    if (parts.length >= 2) {
      initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length >= 2) {
      initials = parts[0].substring(0, 2).toUpperCase();
    }

    const newReview: Testimonial & { status: string; isApproved: boolean; createdAt: string } = {
      id: `rev-${Date.now()}`,
      name,
      role: "Verified Athlete / Parent",
      branch,
      rating: 5,
      highlight: content.length > 50 ? `${content.substring(0, 47)}...` : content,
      content,
      avatarText: initials,
      status: "PENDING",
      isApproved: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [newReview, ...current];
    await saveContentSection("testimonials", updated);

    return NextResponse.json({
      success: true,
      message: "Thank you! Your review has been submitted and will appear after administrative approval.",
      item: newReview,
    });
  } catch (error) {
    console.error("Public review submission error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit review. Please try again." },
      { status: 500 }
    );
  }
}
