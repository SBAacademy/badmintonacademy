import { NextResponse } from "next/server";
import { getEvents } from "@/lib/contentDb";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

function formatLastmod(event: {
  updatedAt?: string | null;
  createdAt?: string | null;
  eventDate?: string | null;
}): string | null {
  if (event.updatedAt) {
    const d = new Date(event.updatedAt);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  if (event.createdAt) {
    const d = new Date(event.createdAt);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  if (event.eventDate) {
    const clean = event.eventDate.split("T")[0];
    const d = new Date(clean);
    if (!isNaN(d.getTime())) return clean;
  }
  return null;
}

/**
 * GET /tournaments-sitemap.xml
 * Dedicated XML sitemap strictly containing public S&A Badminton Academy
 * tournament and event detail pages.
 * Reads dynamically from the PostgreSQL events database table.
 */
export async function GET() {
  try {
    // Single source of truth: PostgreSQL events table
    // Includes published upcoming and past event archives; excludes unpublished drafts
    const events = await getEvents({ includeUnpublished: false });

    // Filter valid canonical slugs and exclude cancelled events
    const validEvents = events.filter(
      (e) => Boolean(e.slug && e.slug.trim()) && e.status !== "CANCELLED"
    );

    const urlsXml = validEvents
      .map((event) => {
        const cleanSlug = event.slug.trim().replace(/^\/+/, "");
        const loc = `${SITE_URL}/events/${escapeXml(cleanSlug)}`;
        const lastmod = formatLastmod(event);

        if (lastmod) {
          return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
        }

        return `  <url>
    <loc>${loc}</loc>
  </url>`;
      })
      .join("\n\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urlsXml}

</urlset>
`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("GET /tournaments-sitemap.xml error:", error);
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

    return new NextResponse(fallbackXml, {
      status: 500,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  }
}
