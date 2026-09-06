import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, ArrowRight, User } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { createMetadata } from "@/lib/seo";
import { BLOG_POSTS } from "@/data/blog";
import { FinalCTA } from "@/components/sections/FinalCTA";

export const metadata: Metadata = createMetadata({
  title: "Badminton Coaching Tips & Articles | S & A Badminton Academy Kochi",
  description: "Read expert badminton guides, junior training drills, footwork tips, and court gear recommendations from certified coaches at S & A Badminton Academy.",
  path: "/blog",
  keywords: [
    "badminton training tips",
    "badminton coaching blog Kochi",
    "junior badminton footwork drills",
    "badminton court shoes guide",
  ],
});

export default function BlogPage() {
  return (
    <div className="py-8 sm:py-12 bg-[#090D16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ name: "Blog & Training Insights", url: "/blog" }]} />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Academy Insights
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Badminton Technique, Footwork & Training Guides
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            In-depth guides written by our certified coaches on footwork biomechanics, youth athletic conditioning, and tournament mindset.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="rounded-3xl bg-[#111827] border border-slate-800 hover:border-emerald-500/40 overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80" />

                  <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-[#090D16]/85 backdrop-blur-md border border-slate-700 text-emerald-400 text-[11px] font-bold">
                    {post.category}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{post.publishDate}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-800/80 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">{post.author}</span>
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>

      <FinalCTA />
    </div>
  );
}
