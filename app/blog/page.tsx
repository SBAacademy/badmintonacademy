import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, ArrowRight, User } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = createMetadata({
  title: "Badminton Coaching Tips & Articles | SBA Badminton Academy Kochi",
  description: "Read expert badminton guides, junior training drills, footwork tips, and court gear recommendations from certified coaches at SBA Badminton Academy.",
  path: "/blog",
  keywords: [
    "badminton training tips",
    "badminton coaching blog Kochi",
    "junior badminton footwork drills",
    "badminton court shoes guide",
  ],
});

import { getBlogPosts } from "@/lib/contentDb";
import { BlogListClient, BlogCardItem } from "@/components/blog/BlogListClient";

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

  // Extract lightweight summary cards to prevent massive client-side payload
  const lightweightPosts: BlogCardItem[] = blogPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    publishDate: post.publishDate,
    readTime: post.readTime,
    author: post.author,
    image: post.image,
    tags: post.tags || [],
  }));

  return (
    <div className="py-8 sm:py-12 bg-[#090D16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ name: "Blog & Training Insights", url: "/blog" }]} />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Academy Knowledge Hub
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Badminton Training, Technique & Coaching Guides
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Over 100 comprehensive guides written by certified coaches on footwork biomechanics, youth athletic conditioning, equipment selection, and tournament preparation.
          </p>
        </div>

        {/* Interactive Blog Directory (Search, Filter, Pagination) */}
        <div className="mb-20">
          <BlogListClient posts={lightweightPosts} />
        </div>

      </div>

      <FinalCTA />
    </div>
  );
}
