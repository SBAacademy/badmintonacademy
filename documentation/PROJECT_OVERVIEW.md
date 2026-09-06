# S & A BADMINTON ACADEMY — PROJECT ARCHITECTURE & REPOSITORY OVERVIEW
**Audit Date:** September 6, 2026  
**Auditor:** Senior Frontend Architect & Next.js Technical Lead  
**Audit Scope:** Repository Architecture, Dependency Graph, Tooling, Build System, and Runtime Configuration  
**Status:** Verified via Direct Source Inspection

---

## 1. Executive Technology Stack Summary

Through direct inspection of [`package.json`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/package.json), [`tsconfig.json`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/tsconfig.json), [`next.config.mjs`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/next.config.mjs), and [`app/globals.css`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/app/globals.css), the actual production stack is:

| Layer | Declared / Detected Technology | Exact Version | Configuration Details |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router, Turbopack) | `16.3.4` | `next.config.mjs` (ReactStrictMode: true, remote image patterns, 308 redirects) |
| **Runtime / Library** | React & React DOM | `19.2.8` | React 19 Canary/Release candidate aligned with Next.js 16 |
| **Language** | TypeScript | `7.0.2` (TypeScript compiler) | `target: "ES2022"`, `moduleResolution: "bundler"`, `strict: true`, `@/*` alias |
| **Styling Engine** | Tailwind CSS | `^4.3.3` | Tailwind v4 via `@tailwindcss/postcss`, CSS-first config in `globals.css` |
| **CSS Preprocessor** | PostCSS | `^8.5.28` | `@tailwindcss/postcss` plugin |
| **Icons Library** | Lucide React | `^1.41.0` | SVG icons used across navigation, CTA, and cards |
| **Animation Engine** | CSS Keyframes & Framer Motion | `framer-motion: ^13.2.0` | Native CSS transforms preferred; Framer Motion in dependency list |
| **Typography** | Next.js Font Optimization | `Plus_Jakarta_Sans` | `next/font/google` variable `--font-jakarta` loaded in `app/layout.tsx` |
| **Build Bundler** | Next.js Turbopack | Integrated | Fast incremental builds (~270ms compilation) |
| **Package Manager** | npm | Detected via `package-lock.json` | Lockfile v3 |

---

## 2. Dependency Audit & Legacy Bloat Analysis

Inspection of [`package.json`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/package.json) reveals several anomalies from the codebase's past history:

### Production Dependencies (`dependencies`)
1. `next: ^16.3.4` — **Core**: App router runtime and server rendering.
2. `react: ^19.2.8` & `react-dom: ^19.2.8` — **Core**: UI component framework.
3. `lucide-react: ^1.41.0` — **Active**: UI iconography across entire application.
4. `clsx: ^2.1.1` & `tailwind-merge: ^3.6.0` — **Active**: Dynamic class utilities in `lib/utils.ts`.
5. `canvas-confetti: ^1.9.4` — **Minor Active**: Used for form submission celebratory effects.
6. `framer-motion: ^13.2.0` — **Present in Dependencies**: Mostly bypassed in favour of lighter Tailwind/CSS transitions to maximize Core Web Vitals.
7. `pdf-lib: ^1.17.1` — ⚠️ **LEGACY ARTIFACT**: Residual from previous quotation generator tool (`generate-pdf.mjs`). Not utilized in the web academy runtime.
8. `puppeteer: ^23.6.0` — ⚠️ **HIGH-RISK ARTIFACT**: Heavy headless browser dependency (~300MB download) used exclusively by legacy `generate-pdf.mjs`. Must be excluded from production deployments.

### Development Dependencies (`devDependencies`)
1. `@tailwindcss/postcss: ^4.3.3` & `tailwindcss: ^4.3.3` — **Tailwind v4 Engine**.
2. `@types/node: ^26.4.1`, `@types/react: ^19.2.18`, `@types/react-dom: ^19.2.7`, `@types/canvas-confetti: ^1.9.0` — TypeScript definitions.
3. `typescript: ^7.0.2` — Compiler.
4. `autoprefixer: ^10.5.5` & `postcss: ^8.5.28` — CSS processing.

---

## 3. Directory Architecture & File Classification

```
S-A-BADMINTON-ACADEMY/
├── app/                              # Next.js 16 App Router Directory
│   ├── [location]/                   # Top-level dynamic route for 4 local centres
│   │   └── page.tsx                  # SSG generated landing pages (/kadavanthra, etc.)
│   ├── about/page.tsx                # Academy story, mission, philosophy
│   ├── achievements/page.tsx         # Tournament records, medals, laurels
│   ├── api/enquiries/route.ts        # POST endpoint for trial & contact admissions
│   ├── blog/                         # Academy educational & SEO articles
│   │   ├── [slug]/page.tsx           # Dynamic article renderer
│   │   └── page.tsx                  # Blog listing index
│   ├── branches/                     # Physical arena directory
│   │   ├── [slug]/page.tsx           # Legacy redirect handler (308 fallback)
│   │   └── page.tsx                  # All-centres directory index
│   ├── coaches/page.tsx              # Coach profiles, credentials, Head Coach Sooraj
│   ├── contact/page.tsx              # Conversion page, admissions form, phone/map
│   ├── gallery/page.tsx              # Interactive image/video media showcase
│   ├── privacy/page.tsx              # Data privacy policy
│   ├── programs/                     # Academy coaching tracks
│   │   ├── [slug]/page.tsx           # Dynamic program landing page
│   │   └── page.tsx                  # Programs matrix & curriculum overview
│   ├── terms/page.tsx                # Terms of service
│   ├── testimonials/page.tsx         # Student & parent reviews
│   ├── globals.css                   # Tailwind v4 theme, athletic color tokens, keyframes
│   ├── layout.tsx                    # Root HTML layout, font setup, JSON-LD, header/footer
│   ├── not-found.tsx                 # Custom 404 handler with quick navigation
│   ├── page.tsx                      # Primary city-level homepage ("Badminton Academy in Kochi")
│   ├── robots.ts                     # Dynamic robots.txt generation
│   └── sitemap.ts                    # Dynamic sitemap.xml generation (33 routes)
│
├── components/                       # Reusable React Component Library
│   ├── forms/                        # EnquiryForm.tsx (Trial modal & admissions)
│   ├── gallery/                      # GalleryInteractive.tsx (Filterable media grid & lightbox)
│   ├── hero/                         # HeroSection.tsx, ShuttlecockVisual.tsx
│   ├── layout/                       # AnnouncementBar, Navbar, Footer, MobileConversionBar
│   ├── sections/                     # 12 Modular Homepage and Content Sections
│   │   ├── AchievementsSection.tsx   # Tournament cards & medal highlights
│   │   ├── BranchesSection.tsx       # 4 Centre showcase cards linking to /[location]
│   │   ├── CoachesSpotlight.tsx      # Coach panel previews
│   │   ├── FAQSection.tsx            # Expandable accordion FAQs
│   │   ├── FinalCTA.tsx              # High-conversion closing banner
│   │   ├── GalleryPreview.tsx        # Homepage media teaser
│   │   ├── MethodologySection.tsx    # 4-stage coaching curriculum
│   │   ├── ProgramsSection.tsx       # Interactive program cards
│   │   ├── TestimonialsSection.tsx   # Verified athlete/parent quotes
│   │   ├── TrustStats.tsx            # Statistics counters
│   │   ├── WhyChooseUs.tsx           # ⚠️ Alternate/duplicate of WhySA
│   │   └── WhySA.tsx                 # Brand differentiators & core pillars
│   └── seo/                          # Breadcrumbs.tsx, SEOJsonLd.tsx
│
├── data/                             # Centralized Academy Database & Single Source of Truth
│   ├── academy.ts                    # Organization details, contact info, social links
│   ├── achievements.ts               # Tournament honours, year, category, medals
│   ├── blog.ts                       # Educational articles, authors, reading times
│   ├── branches.ts                   # ⚠️ Legacy 3-branch dataset (Needs deprecation check)
│   ├── coaches.ts                    # Coaches credentials, specialties, headshots
│   ├── faqs.ts                       # General academy questions and answers
│   ├── gallery.ts                    # Media items, tags, captions
│   ├── locations.ts                  # Modern 4-centre database (Kadavanthra, Edappally, Kakkanad, Fourth)
│   ├── programs.ts                   # 5 Coaching tracks (Kids, Junior, Adult, Competitive, Camp)
│   └── testimonials.ts               # Verified reviews with ratings and categories
│
├── documentation/                    # Master Technical & SEO Documentation Suite
│   ├── CONTENT_REQUIREMENTS.md       # Client checklist for Coach Sooraj verification
│   ├── SEO_IMPLEMENTATION.md         # Technical SEO specification & schema architecture
│   └── SEO_KEYWORD_MAP.md            # Master keyword ownership & cannibalization controls
│
├── lib/                              # Utility Functions & Helper Libraries
│   ├── analytics.ts                  # Structured event tracking (GA4/GTM custom events)
│   ├── seo.ts                        # Metadata creators & JSON-LD schema generators
│   ├── utils.ts                      # Class variance & tailwind-merge helper (cn)
│   └── whatsapp.ts                   # Context-aware pre-filled WhatsApp link generator
│
├── public/                           # Static Assets & Media
│   └── images/                       # High-res photography (hero-athlete.jpg, training-coach.jpg)
│
├── generate-pdf.mjs                  # ⚠️ Legacy quotation script (non-runtime)
├── index.html                        # ⚠️ Legacy 63KB quotation static HTML (non-runtime)
├── next.config.mjs                   # Next.js configuration & 308 permanent redirect matrix
└── tsconfig.json                     # TypeScript strict compiler configuration
```

---

## 4. Server vs Client Component Boundaries

The project maintains a disciplined Server/Client component boundary:
* **Server Components (Default):**
  * `app/layout.tsx` (Root metadata, font injection, base markup)
  * `app/page.tsx` (Homepage section assembler)
  * `app/[location]/page.tsx` (Static pre-rendering via `generateStaticParams`, SEO metadata, JSON-LD schemas)
  * `app/programs/[slug]/page.tsx`, `app/blog/[slug]/page.tsx`
  * Static presentation sections (`TrustStats.tsx`, `AchievementsSection.tsx`, `MethodologySection.tsx`, `Footer.tsx`)
* **Client Components (`"use client"`):**
  * `components/layout/Navbar.tsx` (Dropdown hover buffer, mobile accordion state, scroll detection)
  * `components/layout/MobileConversionBar.tsx` (Scroll detection & direct conversion actions)
  * `components/forms/EnquiryForm.tsx` (Interactive form validation, state, API submission)
  * `components/gallery/GalleryInteractive.tsx` (Filter tabs, modal lightbox)
  * `components/sections/FAQSection.tsx` (Accordion collapse/expand state)

---

## 5. Build, Environment & Deployment Configuration

1. **Environment Variables:**
   - Referenced in `app/layout.tsx` and `lib/seo.ts`:
     - `process.env.NEXT_PUBLIC_SITE_URL` (Defaults to `https://sabadmintonacademy.com` if unset).
   - Referenced in `components/forms/EnquiryForm.tsx` and `app/api/enquiries/route.ts`:
     - Optional external webhook or email service URLs.
2. **Build Tooling:**
   - `npm run dev`: Runs Turbopack local dev server on port 3000.
   - `npm run build`: Executes `next build` with full static pre-rendering across 33 routes.
   - `npx tsc --noEmit`: Strict type checking (0 compilation errors).
3. **Deployment Platform:**
   - Deployed to Vercel (evidenced by live production domain `soorajbadmintonacademy.vercel.app`).
   - Node.js runtime target ES2022.
