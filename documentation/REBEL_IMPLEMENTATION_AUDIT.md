# S & A BADMINTON ACADEMY — REBEL PERFORMANCE IMPLEMENTATION AUDIT (PHASE 0)
**Audit Date:** September 6, 2026  
**Status:** Component & Asset Mapping for Visual & UX Overhaul  
**Target Creative Direction:** REBEL PERFORMANCE (Nike Training × Red Bull × Sports Editorial)

---

## 1. Component Transformation Strategy

| Existing Component | Current File Path | Action | Target Transformation Strategy |
| :--- | :--- | :---: | :--- |
| **HeroSection** | `components/hero/HeroSection.tsx` | **REBUILD** | Replace generic hero with full-screen asymmetrical composition, colossal editorial typography, full-bleed athlete photography, and dual conversion CTAs. |
| **ShuttlecockVisual** | `components/hero/ShuttlecockVisual.tsx` | **REVISE** | Restrain floating vector so it acts as subtle ambient depth rather than dominant graphic. |
| **AnnouncementBar** | `components/layout/AnnouncementBar.tsx` | **POLISH** | Minimalist athletic ticket banner in `#07090D` / `#B8F000`. |
| **Navbar** | `components/layout/Navbar.tsx` | **PRESERVE & POLISH** | Retain verified zero-gap desktop hover dropdown and 48px mobile tap accordion; style with athletic dark framing and subtle borders. |
| **Footer** | `components/layout/Footer.tsx` | **REVISE** | Transform into bold editorial sports ending with colossal brand mark and crawlable links. |
| **MobileConversionBar**| `components/layout/MobileConversionBar.tsx` | **PRESERVE** | Keep iOS safe-area insets, dial, WhatsApp, and Trial CTAs intact. |
| **WhySA** | `components/sections/WhySA.tsx` | **REBUILD** | Replace 4-card grid with the "Rebel Performance Manifesto" (`DISCIPLINE OVER MOTIVATION`, `TECHNIQUE OVER SHORTCUTS`, `CONSISTENCY OVER EXCUSES`). |
| **WhyChooseUs** | `components/sections/WhyChooseUs.tsx` | **DELETE** | Unused dead duplicate component. |
| **TrustStats** | `components/sections/TrustStats.tsx` | **REVISE** | Convert into typography-driven athletic metrics banner without unverified claims. |
| **ProgramsSection** | `components/sections/ProgramsSection.tsx` | **REBUILD** | Interactive two-column experience (Left: interactive track list; Right: dynamic photo & tactical details). Mobile: swipeable snap carousel. |
| **MethodologySection** | `components/sections/MethodologySection.tsx` | **REBUILD** | Cinematic 4-stage horizontal stepped sequence (`ASSESS → TRAIN → DEVELOP → COMPETE`). |
| **BranchesSection** | `components/sections/BranchesSection.tsx` | **REBUILD** | Interactive 4-centre arena selector powered by `data/locations.ts`, linking directly to dedicated local SEO pages. |
| **CoachesSpotlight** | `components/sections/CoachesSpotlight.tsx` | **REVISE** | Editorial portrait gallery with verified coach roles and credentials. |
| **AchievementsSection**| `components/sections/AchievementsSection.tsx` | **REVISE** | Asymmetrical "Trophy Wall" timeline with tournament laurels. |
| **TestimonialsSection**| `components/sections/TestimonialsSection.tsx` | **REVISE** | Single-focus colossal editorial quotes with verified attribution. |
| **FinalCTA** | `components/sections/FinalCTA.tsx` | **REBUILD** | High-voltage campaign finale: *"NO MORE WAITING. CLAIM YOUR SPOT ON THE COURT."* |
| **EnquiryForm** | `components/forms/EnquiryForm.tsx` | **PRESERVE** | Keep honeypot, validation, phone normalization, UTM attribution, and WhatsApp handoff. |

---

## 2. Preserved Technical & SEO Foundations
* App Router dynamic parameters `[location]` (`/kadavanthra`, `/kumbalanghi`, `/maradu`, `/palluruthy`, `/chullikal`).
* Single-hop HTTP 308 permanent redirects from `/branches/:slug` to `/:slug`.
* Self-referential canonical URLs and JSON-LD schemas (`SportsOrganization`, `SportsActivityLocation`, `LocalBusiness`, `BreadcrumbList`, `FAQPage`).
* Full accessibility and `@media (prefers-reduced-motion: reduce)` overrides.
