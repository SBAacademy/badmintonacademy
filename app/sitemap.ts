import { MetadataRoute } from "next";
import { PROGRAMS } from "@/data/programs";
import { getCentres, getCoaches, getBlogPosts } from "@/lib/contentDb";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Core Public Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/programs`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/branches`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/coaches`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/achievements`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/gallery`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/testimonials`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
  ];

  // 2. Dynamic Active Public Centre Local SEO Pages
  // Single Source of Truth: Centres & Hubs Database (Neon PostgreSQL + fallback)
  const dynamicCentres = await getCentres({ includeInactive: false });
  const centreRoutes: MetadataRoute.Sitemap = dynamicCentres.map((centre) => ({
    url: `${SITE_URL}/${centre.slug}`,
    lastModified: centre.updatedAt ? new Date(centre.updatedAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.95,
  }));

  // 3. Dynamic Published Coach Profile Pages
  // Single Source of Truth: Coaches Database (Neon PostgreSQL + fallback)
  const dynamicCoaches = await getCoaches({ includeUnpublished: false });
  const coachRoutes: MetadataRoute.Sitemap = dynamicCoaches
    .filter((c) => Boolean(c.slug || c.id))
    .map((coach) => ({
      url: `${SITE_URL}/coaches/${coach.slug || coach.id}`,
      lastModified: coach.updatedAt ? new Date(coach.updatedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.85,
    }));

  // 4. Program Detail Dynamic Pages
  const programRoutes: MetadataRoute.Sitemap = PROGRAMS.map((p) => ({
    url: `${SITE_URL}/programs/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  // 5. Blog Posts Dynamic Pages (Retrieved dynamically from Content DB)
  const dynamicBlogPosts = await getBlogPosts();
  const blogRoutes: MetadataRoute.Sitemap = dynamicBlogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: (post as any).updatedAt
      ? new Date((post as any).updatedAt)
      : post.publishDate
      ? new Date(post.publishDate)
      : undefined,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [
    ...staticRoutes,
    ...centreRoutes,
    ...coachRoutes,
    ...programRoutes,
    ...blogRoutes,
  ];
}
