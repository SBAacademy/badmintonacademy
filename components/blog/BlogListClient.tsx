"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, Clock, User, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";

export interface BlogCardItem {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishDate: string;
  readTime: string;
  author: string;
  image: string;
  tags?: string[];
}

interface BlogListClientProps {
  posts: BlogCardItem[];
}

const ITEMS_PER_PAGE = 12;

export function BlogListClient({ posts }: BlogListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Extract all distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [posts]);

  // Filter posts based on search query and selected category
  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;
      const titleMatch = post.title.toLowerCase().includes(q);
      const excerptMatch = post.excerpt.toLowerCase().includes(q);
      const tagMatch = post.tags?.some((t) => t.toLowerCase().includes(q));
      const authorMatch = post.author.toLowerCase().includes(q);

      return titleMatch || excerptMatch || tagMatch || authorMatch;
    });
  }, [posts, searchQuery, selectedCategory]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE) || 1;
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-10">
      {/* Search & Filter Controls */}
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search articles by technique, footwork, drills, or keyword..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#111827] border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-400 text-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? "bg-emerald-500 text-[#07090D] shadow-lg shadow-emerald-500/20 font-bold"
                    : "bg-[#111827] text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results Counter & Active Filter Display */}
        <div className="flex items-center justify-between text-xs text-slate-400 max-w-6xl mx-auto pt-2 border-b border-slate-800 pb-4">
          <div>
            Showing{" "}
            <span className="text-white font-bold">
              {filteredPosts.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="text-white font-bold">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredPosts.length)}
            </span>{" "}
            of <span className="text-emerald-400 font-bold">{filteredPosts.length}</span> articles
            {selectedCategory !== "All" && (
              <span>
                {" "}
                in <span className="text-white font-medium">"{selectedCategory}"</span>
              </span>
            )}
            {searchQuery && (
              <span>
                {" "}
                matching <span className="text-white font-medium">"{searchQuery}"</span>
              </span>
            )}
          </div>

          {(selectedCategory !== "All" || searchQuery) && (
            <button
              onClick={resetFilters}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      {paginatedPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedPosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-3xl bg-[#111827] border border-slate-800 hover:border-emerald-500/40 overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-xl hover:-translate-y-1"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={post.image || "/images/badminton-arena.jpg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80" />

                  <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-[#090D16]/90 backdrop-blur-md border border-slate-700 text-emerald-400 text-[11px] font-bold tracking-wide">
                    {post.category}
                  </div>
                </div>

                {/* Body Content */}
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

                  <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    <Link href={`/blog/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-0 border-t border-slate-800/80 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate max-w-[150px]">{post.author}</span>
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors group/btn"
                >
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        /* Empty Search / Filter State */
        <div className="text-center py-20 bg-[#111827] rounded-3xl border border-slate-800 space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No articles found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            We couldn't find any guides matching "{searchQuery}". Try adjusting your keywords or clearing the category filter.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#07090D] font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#111827] border border-slate-800 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1 px-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first, last, and current +/- 1
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && page - prev > 1;

                return (
                  <React.Fragment key={page}>
                    {showEllipsis && (
                      <span className="text-slate-600 px-1 text-xs">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        currentPage === page
                          ? "bg-emerald-500 text-[#07090D]"
                          : "bg-[#111827] text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#111827] border border-slate-800 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
