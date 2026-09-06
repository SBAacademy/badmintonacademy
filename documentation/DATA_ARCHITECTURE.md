# S & A BADMINTON ACADEMY — DATA ARCHITECTURE & SCHEMA REVIEW
**Audit Date:** September 6, 2026  
**Auditor:** Senior Frontend Architect & Next.js Technical Lead  
**Scope:** TypeScript Data Models, Schema Definitions, Database Redundancy, and Single Source of Truth Alignment  
**Status:** 100% Code-Verified

---

## 1. Master Data Layer Inventory (`data/`)

| File Name | Primary Purpose | Record Count | Data Interface / Schema | Modern vs Legacy Status |
| :--- | :--- | :---: | :--- | :---: |
| [`data/locations.ts`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/data/locations.ts) | Central Physical Centres Database | 4 Locations | `LocationData` | **Modern Single Source of Truth** |
| [`data/branches.ts`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/data/branches.ts) | Physical Branch Database (Old) | 3 Branches | `BranchData` | ⚠️ **Legacy Redundant Model** |
| [`data/programs.ts`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/data/programs.ts) | Coaching Programs & Tracks | 5 Tracks | `Program` | **Active Modern Model** |
| [`data/coaches.ts`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/data/coaches.ts) | Coaching Staff & Mentors | 4 Coaches | `Coach` | **Active Modern Model** |
| [`data/academy.ts`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/data/academy.ts) | Organization Identity & Global NAP | 1 Entity | `AcademyData` | **Active Modern Model** |
| [`data/achievements.ts`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/data/achievements.ts) | Tournament Records & Medals | 6 Records | `Achievement` | **Active Modern Model** |
| [`data/faqs.ts`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/data/faqs.ts) | Academy FAQs | 8 Questions | `FAQ` | **Active Modern Model** |
| [`data/gallery.ts`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/data/gallery.ts) | Media Asset Metadata | 8 Media Items | `GalleryItem` | **Active Modern Model** |
| [`data/testimonials.ts`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/data/testimonials.ts) | Athlete & Parent Reviews | 6 Reviews | `Testimonial` | **Active Modern Model** |
| [`data/blog.ts`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/data/blog.ts) | Educational Blog Articles | 3 Articles | `BlogPost` | **Active Modern Model** |

---

## 2. Redundancy Analysis: `branches.ts` vs `locations.ts`

### Direct Comparison
* **`data/locations.ts`:**
  - Contains all 4 centres: `kadavanthra`, `edappally`, `kakkanad`, `fourth-centre`.
  - Rich local SEO metadata fields (`primaryKeyword`, `secondaryKeywords`, `longTailKeywords`).
  - Full structured NAP, GeoCoordinates, opening hours, local neighbourhood lists, facilities, and local FAQs.
  - Actively consumed by: `app/[location]/page.tsx`, `components/sections/BranchesSection.tsx`, `components/layout/Navbar.tsx`, `components/layout/Footer.tsx`, `components/forms/EnquiryForm.tsx`.
* **`data/branches.ts`:**
  - Contains only 3 branches (lacks the fourth centre).
  - Uses an older schema without granular SEO keyword mapping.
  - Still imported by: `app/branches/[slug]/page.tsx` (which immediately delegates to permanent 308 redirect).
* **Architectural Risk:** Retaining two parallel location data models creates drift risk.
* **Phase 2 Action:** Deprecate `data/branches.ts` and consolidate any remaining references into `data/locations.ts`.

---

## 3. Data Integrity & Safety Audit

### Optional Fields & Safety
* In `data/locations.ts`, fields that await Coach Sooraj's verification are strictly typed as optional or nullable:
  ```ts
  googleBusinessProfileUrl: string | null;
  openingHours: string | null;
  courtInformation: {
    courtCount: number | null;
    surfaceType: string;
    lighting: string;
  } | null;
  ```
  This prevents runtime `TypeError: Cannot read properties of undefined` while maintaining honest, uninflated data representation.
