import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

// Helper for Neon DB connection
function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

// Ensure table exists
let tableChecked = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureTable(sql: any) {
  if (tableChecked) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS uploaded_images (
        id VARCHAR(64) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        mime_type VARCHAR(64) NOT NULL,
        data TEXT NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    tableChecked = true;
  } catch (err) {
    console.warn("Table verification warning:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No image file provided." }, { status: 400 });
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

    const fileType = file.type.toLowerCase();
    if (!validMimes.includes(fileType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported format (${file.type}). Please upload a JPG, PNG, WebP, GIF, or SVG.`,
        },
        { status: 400 }
      );
    }

    // Max 10MB size limit for serverless upload
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 10MB limit. Please choose a smaller image." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");

    // Clean filename & generate unique ID
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
    const ext = path.extname(originalName) || `.${fileType.split("/")[1] || "jpg"}`;
    const baseName = path.basename(originalName, ext).slice(0, 30);
    const uniqueId = `${baseName}_${Date.now()}${ext}`;

    const sql = getDb();

    // 1. Primary: Save to Neon PostgreSQL (Works seamlessly on Vercel Serverless & Production)
    if (sql) {
      try {
        await ensureTable(sql);
        await sql`
          INSERT INTO uploaded_images (id, filename, mime_type, data, size)
          VALUES (${uniqueId}, ${originalName}, ${fileType}, ${base64Data}, ${file.size})
          ON CONFLICT (id) DO UPDATE SET
            data = ${base64Data},
            mime_type = ${fileType},
            size = ${file.size}
        `;

        return NextResponse.json({
          success: true,
          url: `/api/images/${uniqueId}`,
          filename: uniqueId,
          size: file.size,
        });
      } catch (dbErr) {
        console.error("Neon DB upload failed, attempting local fallback:", dbErr);
      }
    }

    // 2. Local Fallback: Try saving to public/uploads (local dev only)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, uniqueId);
      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueId}`,
        filename: uniqueId,
        size: file.size,
      });
    } catch (fsErr) {
      console.warn("Filesystem write skipped (read-only environment):", fsErr);
    }

    // 3. Ultimate Fallback: Data URI directly
    const dataUri = `data:${fileType};base64,${base64Data}`;
    return NextResponse.json({
      success: true,
      url: dataUri,
      filename: uniqueId,
      size: file.size,
    });
  } catch (error) {
    console.error("Image upload critical error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload image.",
      },
      { status: 500 }
    );
  }
}
