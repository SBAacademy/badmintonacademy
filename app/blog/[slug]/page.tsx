import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, Calendar, User, ArrowLeft, ArrowRight, Tag } from "lucide-react";
import { BLOG_POSTS } from "@/data/blog";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SEOJsonLd } from "@/components/seo/SEOJsonLd";
import { createMetadata, SITE_URL } from "@/lib/seo";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { ACADEMY_DATA } from "@/data/academy";

import { getBlogPosts } from "@/lib/contentDb";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getBlogPosts();
  const post = posts.find((b) => b.slug === slug);

  if (!post) {
    return { title: "Article Not Found" };
  }

  return createMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    keywords: post.tags,
    ogImage: post.image,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const posts = await getBlogPosts();
  const post = posts.find((b) => b.slug === slug);

  if (!post) {
    notFound();
  }

  const publishedDateIso = post.publishDate
    ? new Date(post.publishDate).toISOString()
    : "2024-10-14T08:00:00+05:30";

  const modifiedDateIso = (post as any).updatedAt
    ? new Date((post as any).updatedAt).toISOString()
    : publishedDateIso;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: publishedDateIso,
    dateModified: modifiedDateIso,
    author: {
      "@type": "Person",
      name: post.author,
      jobTitle: post.authorRole,
    },
    publisher: {
      "@type": "Organization",
      name: ACADEMY_DATA.name,
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  // Find related posts matching same category first, or recent posts
  const sameCategory = posts.filter(
    (p) => p.slug !== post.slug && p.category === post.category
  );
  const otherCategory = posts.filter(
    (p) => p.slug !== post.slug && p.category !== post.category
  );
  const otherPosts = [...sameCategory, ...otherCategory].slice(0, 2);

  // Helper to parse inline markdown links [Label](/url) and bold text
  const renderInlineText = (text: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const [, label, href] = match;
      parts.push(
        <Link
          key={match.index}
          href={href}
          className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 font-semibold transition-colors"
        >
          {label}
        </Link>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="py-8 sm:py-12 bg-[#090D16]">
      <SEOJsonLd schema={articleSchema} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: "Blog", url: "/blog" },
            { name: post.title, url: `/blog/${post.slug}` },
          ]}
        />

        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Articles</span>
        </Link>

        {/* Article Header */}
        <header className="space-y-4 mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            {post.category}
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-b border-slate-800 pb-6">
            <span className="flex items-center gap-1 text-slate-200">
              <User className="w-4 h-4 text-emerald-400" />
              <span>{post.author} ({post.authorRole})</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{post.publishDate}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{post.readTime}</span>
            </span>
          </div>
        </header>

        {/* Hero Featured Image */}
        <div className="relative rounded-3xl overflow-hidden aspect-[16/9] mb-10 border border-slate-700 shadow-2xl">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 850px"
          />
        </div>

        {/* Article Body Content */}
        <div className="prose prose-invert max-w-none space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed mb-16">
          {post.content.map((paragraph, idx) => {
            if (paragraph.startsWith("### ")) {
              return (
                <h2
                  key={idx}
                  className="text-xl sm:text-2xl font-bold text-white pt-6 pb-2 border-b border-slate-800 tracking-tight"
                >
                  {paragraph.replace("### ", "")}
                </h2>
              );
            }
            if (paragraph.startsWith("- ") || paragraph.startsWith("* ")) {
              return (
                <div key={idx} className="flex items-start gap-3 pl-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span className="text-slate-300">
                    {renderInlineText(paragraph.replace(/^[-*]\s+/, ""))}
                  </span>
                </div>
              );
            }
            if (/^\d+\.\s+/.test(paragraph)) {
              return (
                <div key={idx} className="flex items-start gap-3 pl-2 py-0.5">
                  <span className="text-emerald-400 font-bold font-mono text-sm flex-shrink-0">
                    {paragraph.match(/^\d+\./)?.[0]}
                  </span>
                  <span className="text-slate-300">
                    {renderInlineText(paragraph.replace(/^\d+\.\s+/, ""))}
                  </span>
                </div>
              );
            }
            return (
              <p key={idx} className="leading-relaxed">
                {renderInlineText(paragraph)}
              </p>
            );
          })}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 flex flex-wrap items-center gap-2 mb-16">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-2">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Article Tags:</span>
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Related Articles */}
        {otherPosts.length > 0 && (
          <div className="pt-12 border-t border-slate-800 mb-16">
            <h3 className="text-xl font-bold text-white mb-6">Related Training Guides</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {otherPosts.map((other) => (
                <Link
                  key={other.slug}
                  href={`/blog/${other.slug}`}
                  className="group p-5 rounded-2xl bg-[#111827] border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      {other.category}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">
                      {other.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                      {other.excerpt}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      <FinalCTA />
    </div>
  );
}
