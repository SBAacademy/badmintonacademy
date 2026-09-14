import { MetadataRoute } from "next";
import { PROGRAMS } from "@/data/programs";
import { LOCATIONS } from "@/data/locations";
import { getCentres } from "@/lib/contentDb";
import { BLOG_POSTS } from "@/data/blog";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Core Static Pages
  const staticRoutes = [
    "",
    "/about",
    "/programs",
    "/branches",
    "/coaches",
    "/achievements",
    "/gallery",
    "/testimonials",
    "/contact",
    "/blog",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic Active Centre Local SEO Pages
  const dynamicCentres = await getCentres({ includeInactive: false });
  const centresList = dynamicCentres.length > 0 ? dynamicCentres : Object.values(LOCATIONS);
  const locationRoutes = centresList.map((loc) => ({
    url: `${SITE_URL}/${loc.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.95,
  }));

  // Program Detail Dynamic Pages
  const programRoutes = PROGRAMS.map((p) => ({
    url: `${SITE_URL}/programs/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Blog Posts Dynamic Pages
  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...locationRoutes, ...programRoutes, ...blogRoutes];
}
