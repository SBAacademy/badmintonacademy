import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

// Helper to get Neon SQL client
function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return new NextResponse("Image ID required", { status: 400 });
    }

    // 1. Try Neon Database
    const sql = getDb();
    if (sql) {
      try {
        const rows = await sql`
          SELECT mime_type, data, size FROM uploaded_images 
          WHERE id = ${id} OR filename = ${id}
          LIMIT 1
        `;

        if (rows && rows.length > 0) {
          const row = rows[0];
          const buffer = Buffer.from(row.data, "base64");

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": row.mime_type || "image/jpeg",
              "Content-Length": buffer.length.toString(),
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      } catch (dbErr) {
        console.warn("Neon DB image retrieval warning:", dbErr);
      }
    }

    // 2. Fallback to local public/uploads directory if running in local Node environment
    try {
      const localFilePath = path.join(process.cwd(), "public", "uploads", id);
      if (fs.existsSync(localFilePath)) {
        const fileBuffer = fs.readFileSync(localFilePath);
        const ext = path.extname(id).toLowerCase();
        const mimeTypes: Record<string, string> = {
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".webp": "image/webp",
          ".gif": "image/gif",
          ".svg": "image/svg+xml",
          ".avif": "image/avif",
        };
        const mimeType = mimeTypes[ext] || "image/jpeg";

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Content-Length": fileBuffer.length.toString(),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch {
      // Ignore filesystem errors in serverless
    }

    return new NextResponse("Image not found", { status: 404 });
  } catch (err) {
    console.error("Error serving image:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
