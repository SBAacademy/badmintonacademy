# S & A BADMINTON ACADEMY — COMPLETE COMPONENT INVENTORY
**Audit Date:** September 6, 2026  
**Auditor:** Senior Frontend Architect & Next.js Technical Lead  
**Scope:** 100% Comprehensive Inventory of all React Components in `components/`  
**Total Identified Components:** 20 Components across 6 Directories

---

## 1. Component Master Catalog Table

| Component Name | File Path | Type | Render Scope | Direct Dependencies | Props Interface | Status |
| :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| **HeroSection** | `components/hero/HeroSection.tsx` | Server | Homepage (`/`) | `next/image`, `next/link`, `lib/whatsapp.ts`, `ShuttlecockVisual` | None | **Active** |
| **ShuttlecockVisual** | `components/hero/ShuttlecockVisual.tsx` | Server | Hero background | Native SVG geometry, CSS keyframe `animate-subtle-float` | None | **Active** |
| **AnnouncementBar** | `components/layout/AnnouncementBar.tsx` | Client | Root Layout (`layout.tsx`) | `next/link`, `lucide-react` (X, Sparkles) | None | **Active** |
| **Navbar** | `components/layout/Navbar.tsx` | Client | Root Layout (`layout.tsx`) | `next/link`, `next/navigation`, `lucide-react`, `data/locations`, `data/programs` | None | **Active** |
| **Footer** | `components/layout/Footer.tsx` | Server | Root Layout (`layout.tsx`) | `next/link`, `lucide-react`, `data/locations`, `data/programs`, `data/academy` | None | **Active** |
| **MobileConversionBar** | `components/layout/MobileConversionBar.tsx` | Client | Root Layout (`layout.tsx`) | `next/link`, `lucide-react`, `lib/whatsapp.ts`, `lib/analytics.ts` | None | **Active** |
| **WhySA** | `components/sections/WhySA.tsx` | Server | Homepage (`/`) | `next/link`, `lucide-react` (Shield, Award, Target, Zap) | None | **Active** |
| **WhyChooseUs** | `components/sections/WhyChooseUs.tsx` | Server | None (Unused) | `lucide-react` | None | ⚠️ **Unused Duplicate** |
| **TrustStats** | `components/sections/TrustStats.tsx` | Server | Homepage (`/`) | `lucide-react` (Building2, Trophy, Users, Star) | None | **Active** |
| **ProgramsSection** | `components/sections/ProgramsSection.tsx` | Server | Homepage (`/`) | `next/link`, `data/programs`, `lucide-react` | None | **Active** |
| **MethodologySection** | `components/sections/MethodologySection.tsx` | Server | Homepage (`/`) | `lucide-react` (Activity, Zap, Compass, Flame) | None | **Active** |
| **CoachesSpotlight** | `components/sections/CoachesSpotlight.tsx` | Server | Homepage (`/`) | `next/link`, `next/image`, `data/coaches`, `lucide-react` | None | **Active** |
| **BranchesSection** | `components/sections/BranchesSection.tsx` | Server | Homepage (`/`) | `next/link`, `data/locations`, `lucide-react` | None | **Active** |
| **AchievementsSection** | `components/sections/AchievementsSection.tsx` | Server | Homepage (`/`) | `next/link`, `data/achievements`, `lucide-react` | None | **Active** |
| **GalleryPreview** | `components/sections/GalleryPreview.tsx` | Server | Homepage (`/`) | `next/link`, `next/image`, `data/gallery`, `lucide-react` | None | **Active** |
| **TestimonialsSection** | `components/sections/TestimonialsSection.tsx` | Server | Homepage (`/`) | `data/testimonials`, `lucide-react` (Star, Quote) | None | **Active** |
| **FAQSection** | `components/sections/FAQSection.tsx` | Client | Homepage (`/`) | `data/faqs`, `lucide-react` (ChevronDown, HelpCircle) | `{ limit?: number }` | **Active** |
| **FinalCTA** | `components/sections/FinalCTA.tsx` | Server | Homepage (`/`) | `next/link`, `lib/whatsapp.ts`, `lucide-react` | None | **Active** |
| **EnquiryForm** | `components/forms/EnquiryForm.tsx` | Client | Modal / Contact Page | `data/locations`, `data/programs`, `lib/analytics.ts`, `lib/whatsapp.ts` | `{ initialLocationSlug?: string; initialProgramSlug?: string; onSuccess?: () => void }` | **Active** |
| **GalleryInteractive** | `components/gallery/GalleryInteractive.tsx` | Client | `/gallery` | `data/gallery`, `next/image`, `lucide-react` (Filter, Maximize2, X) | None | **Active** |
| **Breadcrumbs** | `components/seo/Breadcrumbs.tsx` | Server | Multiple sub-pages | `next/link`, `lucide-react`, `SEOJsonLd`, `lib/seo` | `{ items: Array<{ name: string; url: string }> }` | **Active** |
| **SEOJsonLd** | `components/seo/SEOJsonLd.tsx` | Server | Layout & Pages | None (Script tag injector) | `{ schema: Record<string, any> }` | **Active** |

---

## 2. Duplicate & Dead Code Analysis

### Findings
1. **`WhyChooseUs.tsx` vs `WhySA.tsx`**:
   - `WhySA.tsx` is actively imported in `app/page.tsx` (line 4) and rendered as Section 2.
   - `WhyChooseUs.tsx` is completely unreferenced anywhere in `app/` or `components/`. It represents a duplicate prototype implementation.
   - *Recommendation:* Keep intact during Phase 1 audit; deprecate/remove during Phase 2 clean-up.
2. **`data/branches.ts` vs `data/locations.ts`**:
   - `data/locations.ts` is the comprehensive modern 4-centre database.
   - `data/branches.ts` contains the older 3-branch structure. While most modern components have transitioned to `data/locations.ts`, legacy references in `app/branches/[slug]/page.tsx` still exist.

---

## 3. Server vs Client Component Ratios
* **Total Components:** 22
* **Server Components:** 16 (73%) — Excellent performance footprint; zero unnecessary client hydration.
* **Client Components:** 6 (27%) — Restricted strictly to components requiring interactivity (`Navbar`, `MobileConversionBar`, `AnnouncementBar`, `FAQSection`, `EnquiryForm`, `GalleryInteractive`).
