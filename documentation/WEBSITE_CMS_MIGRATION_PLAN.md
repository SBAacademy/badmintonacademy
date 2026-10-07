# S&A Badminton Academy Management Platform
## Website CMS Migration & Coexistence Plan

**Document Version:** 1.0  
**Specification Date:** September 7, 2026  
**Status:** Approved Architecture  

---

## 1. Migration Philosophy & Source of Truth

The public website (`https://soorajbadmintonacademy.vercel.app`) has high-performing SEO assets, static generation (SSG) caches, and Schema.org structured data. 

> [!CAUTION]
> Under no circumstances must an admin CMS update destroy SEO rankings, erase static fallbacks, or produce blank pages if the database connection temporarily fluctuates.

The platform establishes the following content resolution order:
```
Neon PostgreSQL (`site_content` / Relational Tables) ──> Local Static TS Files (`data/*.ts`)
```

If the database query succeeds, live content is rendered. If a network fault occurs or during local static builds, the system falls back seamlessly to the hardcoded `data/*.ts` files.

---

## 2. Content Migration Matrix

| Section | Current Source | Target Source | Migration Method | SEO Risk | Fallback Strategy |
|---|---|---|---|:---:|---|
| **Centres & Locations** | `data/locations.ts` | Relational `centres` table | Canonical seed from Kadavanthra, Kumbalanghi, Maradu, Palluruthy, Chullikal | **HIGH** | Static `LOCATIONS` object in `data/locations.ts` preserved verbatim |
| **Coaches Roster** | `data/coaches.ts` & `site_content` | Relational `coaches` table | Seed from verified 4 coaches | **MEDIUM** | `COACHES` in `data/coaches.ts` |
| **Programs** | `data/programs.ts` | Relational `programs` table | Seed from 5 canonical curriculums | **HIGH** | `PROGRAMS` in `data/programs.ts` |
| **Gallery** | `site_content` JSONB & `data/gallery.ts` | `site_content` + `/api/upload` | Direct Neon DB storage | **LOW** | `GALLERY_ITEMS` in `data/gallery.ts` |
| **Blog Articles** | `site_content` JSONB & `data/blog.ts` | `site_content` | Server-rendered Markdown/HTML | **HIGH** | `BLOG_POSTS` in `data/blog.ts` |
| **Testimonials** | `site_content` JSONB & `data/testimonials.ts` | `site_content` | Verified review approvals | **LOW** | `TESTIMONIALS` in `data/testimonials.ts` |
| **Achievements** | `site_content` JSONB & `data/achievements.ts` | `site_content` | Verified tournament records | **MEDIUM** | `ACHIEVEMENTS` in `data/achievements.ts` |
| **Announcements** | Static React state | Relational `announcements` | Dynamic banner sync | **NONE** | Hardcoded banner default |
