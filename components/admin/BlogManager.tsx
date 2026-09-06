"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  X,
  RefreshCw,
  BookOpen,
  Calendar,
  Clock,
  User,
  Tag,
} from "lucide-react";
import { BlogPost, BLOG_POSTS } from "@/data/blog";

const CATEGORIES = [
  "Beginner's Guide",
  "Training & Technique",
  "Youth Development",
  "Fitness & Conditioning",
  "Tournament Strategy",
];

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "Training & Technique",
    readTime: "5 min read",
    publishDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    author: "Coach Anand Varma",
    authorRole: "Head Coach, S&A Badminton Academy",
    tags: "Badminton Coaching, Kochi, Training Drills",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop",
    excerpt: "",
    content: "",
  });

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/blog");
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setPosts(data.items);
      } else {
        setPosts(BLOG_POSTS);
      }
    } catch {
      setPosts(BLOG_POSTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, []);

  const openAddModal = () => {
    setEditingPost(null);
    setForm({
      title: "",
      slug: "",
      category: "Training & Technique",
      readTime: "5 min read",
      publishDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      author: "Coach Anand Varma",
      authorRole: "Head Coach, S&A Badminton Academy",
      tags: "Badminton Coaching, Kochi, Footwork",
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop",
      excerpt: "",
      content: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      category: post.category,
      readTime: post.readTime,
      publishDate: post.publishDate,
      author: post.author,
      authorRole: post.authorRole,
      tags: post.tags.join(", "),
      image: post.image,
      excerpt: post.excerpt,
      content: Array.isArray(post.content) ? post.content.join("\n\n") : String(post.content || ""),
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setForm((prev) => ({
      ...prev,
      title: val,
      slug: editingPost ? prev.slug : generatedSlug,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug) return;
    setSaving(true);

    const payload = {
      title: form.title,
      slug: form.slug,
      category: form.category,
      readTime: form.readTime,
      publishDate: form.publishDate,
      author: form.author,
      authorRole: form.authorRole,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      image: form.image,
      excerpt: form.excerpt,
      content: form.content.split("\n\n").filter(Boolean),
    };

    try {
      if (editingPost) {
        // Update
        const res = await fetch("/api/content/blog", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, slug: editingPost.slug }),
        });
        const data = await res.json();
        if (data.success && data.item) {
          setPosts((prev) =>
            prev.map((p) => (p.slug === editingPost.slug ? data.item : p))
          );
          setIsModalOpen(false);
        }
      } else {
        // Create
        const res = await fetch("/api/content/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.item) {
          setPosts((prev) => [data.item, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error("Failed to save blog post:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    if (!window.confirm(`Permanently delete article "${title}" from website blog?`)) {
      return;
    }
    setPosts((prev) => prev.filter((p) => p.slug !== slug));
    try {
      await fetch(`/api/content/blog?slug=${slug}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete blog post:", err);
      fetchBlog();
    }
  };

  const filteredPosts = posts.filter((post) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.author.toLowerCase().includes(q) ||
      post.tags.some((t) => t.toLowerCase().includes(q));
    const matchesCategory = categoryFilter === "All" || post.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#0B0F14] border border-[#1F2937]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#B8F000] font-bold uppercase tracking-widest">
              WEBSITE CMS // ARTICLES
            </span>
            <span className="px-2 py-0.5 bg-[#B8F000]/10 border border-[#B8F000]/30 font-mono text-[10px] text-[#B8F000]">
              {posts.length} Articles Live
            </span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight mt-1">
            Badminton Coaching Blog Manager
          </h2>
          <p className="text-xs text-[#A8B0BA] font-mono">
            Publish guides, footwork drills, and equipment articles displayed on <a href="/blog" target="_blank" className="text-[#B8F000] hover:underline">/blog</a>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchBlog}
            disabled={loading}
            className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reload from Neon DB"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#B8F000]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-white font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#B8F000]" />
            <span className="hidden sm:inline">View Public Blog</span>
          </a>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-[#0B0F14] border border-[#1F2937] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A8B0BA] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, excerpt, tag, author..."
            className="w-full pl-9 pr-4 py-2 bg-[#07090D] border border-[#1F2937] text-white text-xs font-mono focus:outline-none focus:border-[#B8F000]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setCategoryFilter("All")}
            className={`px-3 py-1.5 font-mono text-xs uppercase font-bold border transition-colors whitespace-nowrap ${
              categoryFilter === "All"
                ? "bg-[#B8F000] text-[#07090D] border-[#B8F000]"
                : "bg-[#07090D] text-[#A8B0BA] border-[#1F2937] hover:text-white"
            }`}
          >
            All ({posts.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 font-mono text-xs uppercase font-bold border transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-[#B8F000] text-[#07090D] border-[#B8F000]"
                  : "bg-[#07090D] text-[#A8B0BA] border-[#1F2937] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards Grid */}
      {filteredPosts.length === 0 ? (
        <div className="py-20 text-center bg-[#0B0F14] border border-[#1F2937] text-[#A8B0BA] font-mono text-xs">
          No articles match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-[#0B0F14] border border-[#1F2937] hover:border-[#B8F000]/60 overflow-hidden flex flex-col justify-between group transition-all"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] w-full bg-[#07090D] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 bg-[#07090D]/90 backdrop-blur-sm border border-[#1F2937] font-mono text-[9px] text-[#B8F000] uppercase font-bold">
                      {post.category}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <span className="px-2 py-0.5 bg-[#07090D]/90 backdrop-blur-sm border border-[#1F2937] font-mono text-[9px] text-[#A8B0BA]">
                      {post.readTime}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="text-[10px] font-mono text-[#6B7280]">
                    {post.publishDate} &bull; By {post.author}
                  </div>

                  <h3 className="font-bold text-white text-sm leading-snug group-hover:text-[#B8F000] transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs font-mono text-[#A8B0BA] line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 bg-[#11161D] border border-[#1F2937] text-[9px] font-mono text-[#6B7280]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 border-t border-[#1F2937] bg-[#07090D] flex items-center justify-between font-mono text-xs">
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#B8F000] hover:underline flex items-center gap-1 text-[10px] font-bold"
                >
                  <span>Read Article</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(post)}
                    className="p-1.5 bg-[#11161D] hover:bg-[#17212C] border border-[#1F2937] text-[#A8B0BA] hover:text-[#B8F000] transition-colors"
                    title="Edit Article"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(post.slug, post.title)}
                    className="p-1.5 bg-[#11161D] hover:bg-rose-950/40 border border-[#1F2937] hover:border-rose-500/40 text-[#6B7280] hover:text-rose-400 transition-colors"
                    title="Delete Article"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add / Edit Article Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="max-w-2xl w-full bg-[#0B0F14] border border-[#1F2937] p-6 space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#B8F000]" />
                <span>{editingPost ? "Edit Blog Article" : "Create New Blog Article"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#A8B0BA] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 font-mono text-xs">
              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={handleTitleChange}
                  placeholder="e.g. Mastering Corner Shadow Footwork in 30 Days"
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">URL Slug (e.g. /blog/your-slug) *</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Author Name</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>

                <div>
                  <label className="block text-[#A8B0BA] uppercase mb-1">Read Time</label>
                  <input
                    type="text"
                    value={form.readTime}
                    onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                    placeholder="e.g. 6 min read"
                    className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Featured Image URL *</label>
                <input
                  type="url"
                  required
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="Badminton Footwork, Junior Coaching, Speed Drills"
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">Short Excerpt / Meta Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Short description for Google SEO and article preview cards..."
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000]"
                />
              </div>

              <div>
                <label className="block text-[#A8B0BA] uppercase mb-1">
                  Full Article Content (Separate paragraphs with double newlines, use ### for subheadings) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write the article content here. Separate each paragraph by pressing Enter twice..."
                  className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white focus:outline-none focus:border-[#B8F000] font-sans leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#11161D] text-[#A8B0BA] hover:text-white uppercase font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#B8F000] hover:bg-[#cbf722] text-[#07090D] font-black uppercase text-xs transition-colors cursor-pointer"
                >
                  {saving ? "Publishing to Neon DB..." : editingPost ? "Update Article" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
