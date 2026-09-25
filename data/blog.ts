export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  readTime: string;
  publishDate: string;
  author: string;
  authorRole: string;
  tags: string[];
  image: string;
}

/**
 * Blog articles and guides are 100% database-driven (Neon PostgreSQL `site_content` table).
 * Static hardcoded blog arrays are deprecated and removed.
 */
export const BLOG_POSTS: BlogPost[] = [];
