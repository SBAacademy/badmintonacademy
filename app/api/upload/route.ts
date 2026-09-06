import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    const validMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
    ];

    if (!validMimes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type (${file.type}). Allowed formats: JPG, PNG, WebP, GIF, SVG, AVIF.`,
        },
        { status: 400 }
      );
    }

    // Max 15MB size limit
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 15MB limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Target upload directory inside public
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Clean filename
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
    const ext = path.extname(originalName) || `.${file.type.split("/")[1] || "jpg"}`;
    const baseName = path.basename(originalName, ext).slice(0, 40);
    const uniqueFilename = `${baseName}_${Date.now()}${ext}`;

    const filePath = path.join(uploadDir, uniqueFilename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      size: file.size,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload image.",
      },
      { status: 500 }
    );
  }
}
