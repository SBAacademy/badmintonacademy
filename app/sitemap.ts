import { MetadataRoute } from "next";
import { PROGRAMS } from "@/data/programs";
import { BRANCHES } from "@/data/branches";
import { BLOG_POSTS } from "@/data/blog";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Program Detail Dynamic Pages
  const programRoutes = PROGRAMS.map((p) => ({
    url: `${SITE_URL}/programs/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Branch Detail Local SEO Dynamic Pages
  const branchRoutes = BRANCHES.map((b) => ({
    url: `${SITE_URL}/branches/${b.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.95,
  }));

  // Blog Posts Dynamic Pages
  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...branchRoutes, ...programRoutes, ...blogRoutes];
}
