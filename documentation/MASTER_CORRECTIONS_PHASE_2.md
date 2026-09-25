# S & A BADMINTON ACADEMY — MASTER CORRECTIONS & PHASE 2 IMPLEMENTATION PLAN
**Document Version:** 1.0 (Consolidated Master Specification)  
**Creation Date:** September 6, 2026  
**Auditor / Architect:** Senior Frontend Architect, Next.js Technical Lead & SEO Engineer  
**Source Evidence:** Reconciled from all 19 Phase 1 Audit Documents in [`documentation/`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation)  
**Status:** Approved Master Implementation Blueprint (Zero Production Code Modified)

---

## 1. Executive Summary

Based on the verified audit findings across all 19 Phase 1 technical evaluations, the current state of **S & A Badminton Academy** is quantified as follows:

| Assessment Vector | Audit Score / Status | Audit Source Evidence |
| :--- | :---: | :--- |
| **Overall Project Completion** | **91.5%** | [`FEATURE_MATRIX.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/FEATURE_MATRIX.md) |
| **Functional Architecture** | **100%** | All 33 static pages pre-render cleanly with zero TypeScript errors (`npx tsc --noEmit: 0`). |
| **Content Completeness** | **86.5%** | Core structure complete; final 13.5% gap represents unverified client metrics from Coach Sooraj. |
| **Desktop Navigation** | **100% Verified** | [`NAVIGATION_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/NAVIGATION_AUDIT.md): Zero-gap `pt-2` bridge, 180ms close buffer, Escape key, outside-click close. |
| **Mobile Navigation** | **100% Verified** | [`NAVIGATION_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/NAVIGATION_AUDIT.md): Dedicated `openMobileMenu` state, full-width 48px touch targets, smooth accordions. |
| **Local SEO Architecture** | **100% Ready** | [`ROUTE_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/ROUTE_AUDIT.md): Dynamic `/[location]` with SSG for all 4 centres; 308 legacy redirects active. |
| **Technical SEO & Schemas** | **95% Ready** | [`SEO_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/SEO_AUDIT.md): Valid schemas (`SportsOrganization`, `SportsActivityLocation`, `LocalBusiness`, `Breadcrumbs`, `FAQs`). |
| **Mobile Responsiveness** | **100% Verified** | [`MOBILE_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/MOBILE_AUDIT.md): 320px–1440px clean, zero overflow, iOS `env(safe-area-inset-bottom)` supported. |
| **Performance (Build & Runtime)** | **Optimal** | [`PERFORMANCE_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/PERFORMANCE_AUDIT.md): 429ms compilation, 73% React Server Components, CSS GPU keyframe animations. |
| **Accessibility (a11y)** | **WCAG 2.1 AA** | [`ACCESSIBILITY_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/ACCESSIBILITY_AUDIT.md): 18.4:1 heading contrast, 15.2:1 CTA contrast, reduced-motion compliant. |
| **Lead Conversion Funnel** | **95% Ready** | [`CTA_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/CTA_AUDIT.md): Honeypot anti-spam, phone normalization, UTM tags, contextual WhatsApp deep links. |
| **Critical Active Bugs** | **0 Active** | [`BUG_REGISTER.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/BUG_REGISTER.md): Historical bugs BUG-001 & BUG-002 confirmed RESOLVED; 2 low-severity warnings noted. |
| **Technical Debt Items** | **7 Documented** | [`TECHNICAL_DEBT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/TECHNICAL_DEBT.md): Prioritized TD-001 through TD-007 mapped to Phase 2 actionable fixes. |

---

## 2. What Is Already Correct (KEEP / VERIFIED)

To ensure Phase 2 development proceeds with surgical precision and does not rewrite working code, the following systems are formally certified as **KEEP / VERIFIED — DO NOT REWRITE**:

1. **Desktop Dropdown Navigation (`components/layout/Navbar.tsx`):**
   - *Status:* **KEEP / VERIFIED**.
   - *Architecture:* Continuous hover context (`pt-2`), 180ms mouse-leave debounce (`timeoutRef`), Escape key listener, outside-click handler, and direct overview links.
2. **Mobile Drawer Navigation (`components/layout/Navbar.tsx`):**
   - *Status:* **KEEP / VERIFIED**.
   - *Architecture:* Fully decoupled `openMobileMenu` state, full-width 48px tap targets, mutual exclusivity (opening Centres collapses Programs), 100% opaque `#080B10` drawer with body scroll lock.
3. **Top-Level 4-Centre Dynamic Routing (`app/[location]/page.tsx`):**
   - *Status:* **KEEP / VERIFIED**.
   - *Architecture:* Short URLs (`/kadavanthra`, `/edappally`, `/kakkanad`, `/fourth-centre`) statically generated via `generateStaticParams()`. Invalid routes trigger `notFound()` (HTTP 404).
4. **Single-Hop HTTP 308 Legacy Redirects (`next.config.mjs`):**
   - *Status:* **KEEP / VERIFIED**.
   - *Architecture:* Maps `/branches/:slug` to `/:slug` via HTTP 308 permanent redirects without redirect chains.
5. **Self-Referential Canonical URLs (`lib/seo.ts`):**
   - *Status:* **KEEP / VERIFIED**.
   - *Architecture:* Every page enforces its own self-canonical URL dynamically based on `metadataBase`.
6. **Multi-Location JSON-LD Structured Data:**
   - *Status:* **KEEP / VERIFIED**.
   - *Architecture:* Injects linked `SportsOrganization` (root) and `SportsActivityLocation` / `LocalBusiness` schemas with unique `@id` anchors.
7. **XML Sitemap & Robots Configuration (`app/sitemap.ts`, `app/robots.ts`):**
   - *Status:* **KEEP / VERIFIED**.
   - *Architecture:* Automatically enumerates all 33 production pages with accurate priority weightings (0.95 for centres).
8. **Fixed Mobile Conversion Bar (`components/layout/MobileConversionBar.tsx`):**
   - *Status:* **KEEP / VERIFIED**.
   - *Architecture:* Fixed 3-button touch drawer with iOS `env(safe-area-inset-bottom)` clearance and `pb-32` footer buffer.
9. **Lead Capture API & Anti-Spam (`app/api/enquiries/route.ts`):**
   - *Status:* **KEEP / VERIFIED**.
   - *Architecture:* Honeypot bot protection, 10-digit telephone sanitization, UTM attribution, and lead token generation (`ENQ-*`).
10. **Context-Aware WhatsApp Engine (`lib/whatsapp.ts`):**
    - *Status:* **KEEP / VERIFIED**.
    - *Architecture:* Automatically formats pre-filled query text attributing the user's active branch and program. Verified telephone: `+91 79076 55513`.
11. **Athletic Design Tokens & Motion Safety (`app/globals.css`):**
    - *Status:* **KEEP / VERIFIED**.
    - *Architecture:* Curated Court Black (`#080B10`), Deep Slate (`#0E141B`), and Athletic Lime (`#B8F000`) color tokens with strict `@media (prefers-reduced-motion: reduce)` accessibility overrides.

---

## 3. Master Issue Register

All actionable findings from the 19 audit reports are consolidated into the following master register:

| Fix ID | Category | Priority | Summary Issue Description | Affected Files | Source Debt / Bug |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **FIX-001** | Content & Local SEO | **P0** | Obtain client confirmation for Fourth Centre details (Arena Name, Address, PIN, Coordinates) | `data/locations.ts`, `app/[location]/page.tsx` | Content Gap |
| **FIX-002** | Content & Trust | **P0** | Obtain client verification for coach credentials, court counts, and athlete metrics | `data/coaches.ts`, `data/achievements.ts`, `TrustStats.tsx` | Content Gap |
| **FIX-003** | Dependencies | **P1** | Strip legacy puppeteer (~300MB) and pdf-lib dependencies from `package.json` | `package.json`, `package-lock.json`, `generate-pdf.mjs` | TD-001 |
| **FIX-004** | Performance & Media | **P1** | Modernize local hero & training JPEGs (~1.5MB) to WebP format | `public/images/*`, `HeroSection.tsx` | TD-005 |
| **FIX-005** | Data Architecture | **P1** | Consolidate data layer: deprecate `data/branches.ts` in favor of `data/locations.ts` | `data/branches.ts`, `app/branches/[slug]/page.tsx` | TD-002 |
| **FIX-006** | Architecture | **P2** | Decompose 751-line `app/[location]/page.tsx` into modular subcomponents | `app/[location]/page.tsx`, `components/location/*` | TD-004 |
| **FIX-007** | Analytics | **P2** | Mount Google Tag Manager container script in `app/layout.tsx` | `app/layout.tsx`, `lib/analytics.ts` | TD-006 / BUG-004 |
| **FIX-008** | Media & Authenticity | **P2** | Replace remote Unsplash stock photos with authentic academy photography | `data/gallery.ts`, `data/coaches.ts`, `data/programs.ts` | Content Gap |
| **FIX-009** | Code Quality | **P3** | Remove unreferenced duplicate component `WhyChooseUs.tsx` | `components/sections/WhyChooseUs.tsx` | TD-003 |
| **FIX-010** | Framework Warning | **P3** | Add `data-scroll-behavior="smooth"` attribute to `<html>` | `app/layout.tsx` | BUG-003 |
| **FIX-011** | Accessibility | **P3** | Add keyboard focus trap to mobile navigation drawer | `components/layout/Navbar.tsx` | TD-007 |
| **FIX-012** | Accessibility | **P3** | Elevate micro-copy contrast from `#6B7280` to `#9CA3AF` for WCAG AA compliance | `app/globals.css`, multiple card components | a11y Gap |

---

## 4. Issues Separated by Category

### A. Critical Blockers (P0 — Must Verify with Client Before Public Launch)
* **FIX-001:** Client Onboarding of Fourth Physical Centre Data.
* **FIX-002:** Client Verification of Coaching Qualifications, Court Counts, and Laurel Records.

### B. High-Priority Architectural & Performance Fixes (P1)
* **FIX-003:** Removal of 300MB Puppeteer / PDF-Lib Legacy Bloat.
* **FIX-004:** WebP Image Conversion for `hero-athlete.jpg` and `training-coach.jpg`.
* **FIX-005:** Deprecation of Legacy `data/branches.ts` Data Model.

### C. Structure & Integration Improvements (P2)
* **FIX-006:** Modular Subcomponent Refactoring of `app/[location]/page.tsx`.
* **FIX-007:** Google Tag Manager Script Mounting in `app/layout.tsx`.
* **FIX-008:** Authentic Academy Photography Integration.

### D. Code Quality, Framework & Accessibility Polish (P3)
* **FIX-009:** Deletion of Dead Duplicate Component `WhyChooseUs.tsx`.
* **FIX-010:** Addition of `data-scroll-behavior="smooth"` Attribute in `app/layout.tsx`.
* **FIX-011:** Mobile Drawer Keyboard Focus Trapping.
* **FIX-012:** Micro-Copy Color Contrast Enhancement to `#9CA3AF`.

---

## 5. Detailed Correction Specifications (FIX-001 through FIX-012)

### FIX-001 — Fourth Centre Client Data Onboarding
* **Category:** Content & Local SEO
* **Severity:** **CRITICAL (P0)**
* **Current Problem:** The fourth centre currently uses development placeholders (`[FACILITY_NAME]`, `[AREA]`, slug `/fourth-centre`).
* **Evidence:** [`data/locations.ts`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/data/locations.ts) lines 320–380.
* **Affected Files:** `data/locations.ts`, `app/[location]/page.tsx`, `app/sitemap.ts`, `next.config.mjs`.
* **Expected Behaviour:** Once Coach Sooraj confirms the fourth location (e.g. Aluva, Tripunithura, Palarivattom), the database, URL slug, schema, and sitemap are updated to the verified area.
* **Required Correction:** Replace placeholder strings in `data/locations.ts` with confirmed name, address, PIN, coordinates, and phone. Update `generateStaticParams()` slug.
* **Do Not Change:** Keep the 16-section template layout and structured JSON-LD schema intact.
* **Acceptance Criteria:**
  - [ ] Valid physical address and PIN code displayed on page.
  - [ ] Exact latitude and longitude populated in `GeoCoordinates` schema.
  - [ ] Google Maps embed points to the exact physical venue.
* **Dependencies:** Client data submission.
* **Estimated Complexity:** Low (Data configuration update).

---

### FIX-002 — Core Academy Claims & Credentials Verification
* **Category:** Content & Trust (E-E-A-T)
* **Severity:** **CRITICAL (P0)**
* **Current Problem:** Statistics such as *"15+ courts across Kochi"*, *"500+ athletes"*, and specific BWF/NIS certifications exist on the website but lack formal client sign-off.
* **Evidence:** [`CONTENT_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/CONTENT_AUDIT.md) Section 2.
* **Affected Files:** `data/coaches.ts`, `data/achievements.ts`, `components/sections/TrustStats.tsx`, `components/sections/CoachesSpotlight.tsx`.
* **Required Correction:** Review each metric with Coach Sooraj:
  - If verified: Retain and document verification.
  - If different: Update counter values (e.g., if 12 courts, display `12+`).
  - If unverified: Set to descriptive copy (e.g., *"Multiple International-Standard Courts Across Kochi"*).
* **Acceptance Criteria:**
  - [ ] Zero unverified claims on live pages.
  - [ ] Coaching certifications reflect actual verified qualifications.
* **Dependencies:** Client sign-off.
* **Estimated Complexity:** Low.

---

### FIX-003 — Deprecate Legacy Puppeteer & PDF-Lib Dependencies
* **Category:** Dependencies & Build Optimization
* **Severity:** **HIGH (P1)**
* **Current Problem:** `puppeteer` (~300MB download) and `pdf-lib` remain in `package.json` from the original quotation PDF generator tool, inflating install times and container sizes.
* **Evidence:** [`PROJECT_OVERVIEW.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/PROJECT_OVERVIEW.md) Section 2; [`package.json`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/package.json) lines 19–20.
* **Affected Files:** `package.json`, `package-lock.json`.
* **Required Correction:** Run `npm uninstall puppeteer pdf-lib`. Remove `generate:pdf` script from `package.json`. Move `generate-pdf.mjs` and `index.html` to an archive folder or delete them.
* **Testing Requirements:** Run `npm run build` to confirm production build succeeds without puppeteer.
* **Acceptance Criteria:**
  - [ ] `puppeteer` and `pdf-lib` absent from `package.json`.
  - [ ] `npm install` runs in seconds without downloading Chromium binaries.
* **Dependencies:** None.
* **Estimated Complexity:** Low (10 minutes).

---

### FIX-004 — Local Image Optimization (WebP Modernization)
* **Category:** Performance & Core Web Vitals
* **Severity:** **HIGH (P1)**
* **Current Problem:** [`public/images/hero-athlete.jpg`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/public/images/hero-athlete.jpg) is 699KB and `training-coach.jpg` is 802KB. Totaling ~1.5MB of raw JPEG data, these assets risk mobile LCP delays on slow 3G/4G connections.
* **Evidence:** [`IMAGE_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/IMAGE_AUDIT.md) Section 1; [`PERFORMANCE_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/PERFORMANCE_AUDIT.md) Section 2.
* **Affected Files:** `public/images/hero-athlete.webp`, `public/images/training-coach.webp`, `components/hero/HeroSection.tsx`.
* **Required Correction:** Convert JPEGs to modern WebP format with 82% quality compression (reducing `hero-athlete` from ~700KB to ~95KB). Update `<Image src>` references.
* **Do Not Change:** Maintain explicit `priority={true}` and responsive `sizes` attribute on the Hero image.
* **Acceptance Criteria:**
  - [ ] Hero image file size ≤ 120KB.
  - [ ] Visual clarity remains crisp on retina displays.
* **Dependencies:** None.
* **Estimated Complexity:** Low (20 minutes).

---

### FIX-005 — Consolidate Data Layer & Deprecate `data/branches.ts`
* **Category:** Data Architecture
* **Severity:** **HIGH (P1)**
* **Current Problem:** Two parallel data files exist: the legacy 3-branch file `data/branches.ts` and the comprehensive 4-centre database `data/locations.ts`.
* **Evidence:** [`DATA_ARCHITECTURE.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/DATA_ARCHITECTURE.md) Section 2.
* **Affected Files:** `data/branches.ts`, `app/branches/[slug]/page.tsx`.
* **Required Correction:** Redirect any imports in `app/branches/[slug]/page.tsx` to consume `LOCATIONS` from `data/locations.ts`. Delete `data/branches.ts`.
* **Acceptance Criteria:**
  - [ ] `data/locations.ts` is the single source of truth.
  - [ ] `data/branches.ts` removed cleanly without build errors.
* **Dependencies:** None.
* **Estimated Complexity:** Low (20 minutes).

---

### FIX-006 — Decompose Monolithic `app/[location]/page.tsx`
* **Category:** Architecture & Maintainability
* **Severity:** **MEDIUM (P2)**
* **Current Problem:** `app/[location]/page.tsx` contains 751 lines of code encompassing all 16 local SEO sections and structured schemas.
* **Evidence:** [`CODE_QUALITY.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/CODE_QUALITY.md) Section 2.
* **Affected Files:** `app/[location]/page.tsx`, `components/location/*`.
* **Required Correction:** Extract reusable sections into modular components:
  - `components/location/LocationHero.tsx`
  - `components/location/LocationNeighbourhoods.tsx`
  - `components/location/LocationFacilities.tsx`
  - `components/location/LocationSchedule.tsx`
  - `components/location/LocationMap.tsx`
* **Do Not Change:** Preserve the exact HTML semantics, heading hierarchy (single H1, logical H2s), and JSON-LD schemas.
* **Acceptance Criteria:**
  - [ ] `app/[location]/page.tsx` reduced to < 200 lines acting as an assembler.
  - [ ] Zero visual or layout regression on location pages.
* **Dependencies:** None.
* **Estimated Complexity:** Medium (1.5 hours).

---

### FIX-007 — Mount Google Tag Manager Container Script
* **Category:** Analytics & Conversion
* **Severity:** **MEDIUM (P2)**
* **Current Problem:** `lib/analytics.ts` dispatches custom events (`whatsapp_click`, `trial_booked`, `generate_lead`) to `window.dataLayer`, but the GTM container script is not yet mounted in `app/layout.tsx`.
* **Evidence:** [`CTA_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/CTA_AUDIT.md) Section 3.
* **Affected Files:** `app/layout.tsx`.
* **Required Correction:** Add Next.js `<Script>` in `app/layout.tsx` with environment variable `process.env.NEXT_PUBLIC_GTM_ID`.
* **Acceptance Criteria:**
  - [ ] GTM script loads asynchronously without blocking LCP.
  - [ ] Events dispatched via `trackEvent()` appear in GTM preview mode.
* **Dependencies:** Client GTM Container ID.
* **Estimated Complexity:** Low (15 minutes).

---

### FIX-008 — Authentic Academy Media Integration
* **Category:** Media & Authenticity
* **Severity:** **MEDIUM (P2)**
* **Current Problem:** Stock Unsplash photography is used across coaches, programs, and gallery.
* **Evidence:** [`CONTENT_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/CONTENT_AUDIT.md) Section 2; [`IMAGE_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/IMAGE_AUDIT.md).
* **Affected Files:** `data/gallery.ts`, `data/coaches.ts`, `data/programs.ts`.
* **Required Correction:** Ingest authentic high-res photographs of Coach Sooraj, actual student training batches, and physical court interiors.
* **Acceptance Criteria:**
  - [ ] Real images populated with accurate alt text.
* **Dependencies:** Client media delivery.
* **Estimated Complexity:** Medium.

---

### FIX-009 — Delete Unused Duplicate Component `WhyChooseUs.tsx`
* **Category:** Code Quality & Dead Code
* **Severity:** **LOW (P3)**
* **Current Problem:** `components/sections/WhyChooseUs.tsx` is completely unused; `WhySA.tsx` is the active component rendered on the homepage.
* **Evidence:** [`COMPONENT_INVENTORY.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/COMPONENT_INVENTORY.md) Section 2.
* **Affected Files:** `components/sections/WhyChooseUs.tsx`.
* **Required Correction:** Delete `components/sections/WhyChooseUs.tsx`.
* **Acceptance Criteria:**
  - [ ] File deleted; `npm run build` succeeds cleanly.
* **Dependencies:** None.
* **Estimated Complexity:** Low (2 minutes).

---

### FIX-010 — Add `data-scroll-behavior="smooth"` to `<html>`
* **Category:** Framework & Console Hygiene
* **Severity:** **LOW (P3)**
* **Current Problem:** Development console outputs a Next.js warning regarding CSS smooth scrolling during route transitions.
* **Evidence:** [`BUG_REGISTER.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/BUG_REGISTER.md) BUG-003.
* **Affected Files:** `app/layout.tsx`.
* **Required Correction:** Add `data-scroll-behavior="smooth"` to `<html lang="en" className={jakarta.variable}>` in `app/layout.tsx`.
* **Acceptance Criteria:**
  - [ ] Console warning disappears during route navigation.
* **Dependencies:** None.
* **Estimated Complexity:** Low (2 minutes).

---

### FIX-011 — Mobile Drawer Keyboard Focus Trap
* **Category:** Accessibility (a11y)
* **Severity:** **LOW (P3)**
* **Current Problem:** When the mobile drawer is open, keyboard `Tab` navigation can tab past the close button into the underlying page content.
* **Evidence:** [`ACCESSIBILITY_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/ACCESSIBILITY_AUDIT.md) Section 3.
* **Affected Files:** `components/layout/Navbar.tsx`.
* **Required Correction:** Add a lightweight focus trap hook or keydown listener in `Navbar.tsx` that cycles focus strictly between the close button, navigation links, and bottom CTAs when `mobileMenuOpen` is true.
* **Acceptance Criteria:**
  - [ ] Tabbing wraps within the mobile drawer while open.
* **Dependencies:** None.
* **Estimated Complexity:** Low (30 minutes).

---

### FIX-012 — Micro-Copy Color Contrast Enhancement
* **Category:** Accessibility (a11y)
* **Severity:** **LOW (P3)**
* **Current Problem:** Muted micro-copy using `#6B7280` on `#121A23` achieves a 3.8:1 contrast ratio, slightly below the 4.5:1 WCAG AA threshold for text under 18pt.
* **Evidence:** [`ACCESSIBILITY_AUDIT.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/ACCESSIBILITY_AUDIT.md) Section 2.
* **Affected Files:** `app/globals.css`, card components.
* **Required Correction:** Update `--text-muted` in `app/globals.css` from `#6B7280` to `#9CA3AF` (yielding a 5.1:1 ratio).
* **Acceptance Criteria:**
  - [ ] All secondary micro-copy passes WCAG AA contrast validation.
* **Dependencies:** None.
* **Estimated Complexity:** Low (5 minutes).

---

## 6. Navigation Reconciliation & Status

* **Desktop Dropdown Hover & Click:** Confirmed **RESOLVED & VERIFIED** in commit `571976a`.
* **Mobile Programs & Centres Tap Accordion:** Confirmed **RESOLVED & VERIFIED** in commit `4e7c4f0`.
* *Action Required:* **ZERO ACTION REQUIRED ON CORE NAVIGATION LOGIC.** Preserve existing event handlers and state models.

---

## 7. Four-Centre Local SEO Master Matrix

| Centre URL | Location Name | Target Micro-Market | Primary Keyword | H1 Heading | Schema `@id` Anchor | Content Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `/kadavanthra` | Kadavanthra Central HQ | Central Kochi, Panampilly Nagar, Girinagar | `badminton academy in Kadavanthra` | Badminton Academy in Kadavanthra | `https://sabadmintonacademy.com/kadavanthra#location` | **Verified Active** |
| `/edappally` | Edappally North Hub | North Kochi, Palarivattom, Kalamassery, Metro | `badminton academy in Edappally` | Badminton Academy in Edappally | `https://sabadmintonacademy.com/edappally#location` | **Verified Active** |
| `/kakkanad` | Kakkanad IT Arena | Infopark, SmartCity, Thrikkakara, Vazhakkala | `badminton academy in Kakkanad` | Badminton Academy in Kakkanad | `https://sabadmintonacademy.com/kakkanad#location` | **Verified Active** |
| `/fourth-centre` | [FACILITY_NAME] | [AREA] (Client to confirm) | `badminton academy in [Area]` | Badminton Academy in [Upcoming Centre] | `https://sabadmintonacademy.com/fourth-centre#location` | **Awaiting Client (FIX-001)** |

---

## 8. Keyword Cannibalization Guardrails

To prevent internal competition across pages:
1. **Homepage (`/`)** strictly owns: `"badminton academy in Kochi"`, `"badminton coaching in Kochi"`, `"badminton training in Kochi"`. It must NOT target micro-markets.
2. **Location Landing Pages (`/kadavanthra`, etc.)** strictly own their locality terms (`"badminton coaching Kadavanthra"`). They must NOT compete for the general city term.
3. **Program Pages (`/programs/kids-badminton-coaching`, etc.)** strictly own curriculum and age terms (`"kids badminton coaching Kochi"`).
4. **General Policy:** Do NOT repeatedly optimize pages for `"best badminton academy in Kochi"` without verified factual substantiation.

---

## 9. Phase 2 Implementation Order & Dependency Flow

The recommended execution sequence is organized to eliminate technical blockers before onboarding final client content:

```
[STAGE 1: CLEANUP & DEPENDENCIES]
  ├── FIX-003 (Uninstall puppeteer & pdf-lib)
  ├── FIX-009 (Delete WhyChooseUs.tsx)
  └── FIX-005 (Consolidate data layer & delete branches.ts)
           ↓
[STAGE 2: ASSET & RUNTIME POLISH]
  ├── FIX-004 (Convert JPEGs to WebP)
  ├── FIX-010 (Add data-scroll-behavior attribute)
  └── FIX-012 (Elevate muted contrast to #9CA3AF)
           ↓
[STAGE 3: CODE MODULARIZATION]
  └── FIX-006 (Decompose app/[location]/page.tsx)
           ↓
[STAGE 4: ACCESSIBILITY & ANALYTICS]
  ├── FIX-011 (Mobile drawer keyboard focus trap)
  └── FIX-007 (Mount GTM container script)
           ↓
[STAGE 5: CLIENT CONTENT ONBOARDING (External Dependency)]
  ├── FIX-001 (Fourth Centre address & details)
  ├── FIX-002 (Coach credentials & court counts verification)
  └── FIX-008 (Authentic photo integration)
           ↓
[STAGE 6: FINAL QA & PRODUCTION LAUNCH]
  ├── Full cross-browser & mobile viewport validation
  └── Search Console sitemap submission
```

---

## 10. Phase 2 Acceptance Checklist

### Code & Dependencies
- [ ] `puppeteer` and `pdf-lib` removed from `package.json`.
- [ ] `WhyChooseUs.tsx` removed.
- [ ] `data/branches.ts` removed; `data/locations.ts` sole authority.
- [ ] `npm run build` compiles with 0 errors.
- [ ] `npx tsc --noEmit` exits with code 0.

### Performance & Assets
- [ ] `hero-athlete.webp` ≤ 120KB.
- [ ] `training-coach.webp` ≤ 150KB.
- [ ] No layout shift (CLS ≤ 0.05).
- [ ] Responsive images render cleanly across 320px–1440px.

### Navigation & Accessibility
- [ ] Desktop dropdown opens on hover/click and stays open across gap.
- [ ] Mobile drawer accordions expand on full-row tap.
- [ ] Keyboard focus trap active in mobile drawer.
- [ ] Text contrast meets WCAG AA standards.

### SEO & Local Landing Pages
- [ ] All 4 centre URLs load with HTTP 200.
- [ ] Single H1 per page.
- [ ] Unique meta titles and descriptions per centre.
- [ ] Valid JSON-LD schemas detected in Rich Results Test.
- [ ] 308 redirects from `/branches/:slug` to `/:slug` verified.
- [ ] XML sitemap reflects all 33 production URLs.

---

## 11. Final Master Priority Table

| Priority | Fix ID | Area | Short Description | Dependencies | Phase 2 Stage |
| :---: | :---: | :--- | :--- | :---: | :---: |
| **P0** | **FIX-001** | Content | Fourth Centre verified venue data onboarding | Client Data | Stage 5 |
| **P0** | **FIX-002** | Content | Core academy claims verification (courts/certs) | Client Data | Stage 5 |
| **P1** | **FIX-003** | Tooling | Remove puppeteer & pdf-lib legacy bloat | None | Stage 1 |
| **P1** | **FIX-004** | Performance | WebP image format conversion (~1.2MB reduction) | None | Stage 2 |
| **P1** | **FIX-005** | Data | Deprecate `data/branches.ts` in favor of `data/locations.ts` | None | Stage 1 |
| **P2** | **FIX-006** | Architecture | Modularize 751-line `app/[location]/page.tsx` | None | Stage 3 |
| **P2** | **FIX-007** | Analytics | Mount GTM script container in `layout.tsx` | Client GTM ID | Stage 4 |
| **P2** | **FIX-008** | Media | Authentic photography integration | Client Photos | Stage 5 |
| **P3** | **FIX-009** | Code Quality | Delete unused duplicate `WhyChooseUs.tsx` | None | Stage 1 |
| **P3** | **FIX-010** | Framework | Add `data-scroll-behavior="smooth"` attribute | None | Stage 2 |
| **P3** | **FIX-011** | a11y | Implement mobile drawer focus trap | None | Stage 4 |
| **P3** | **FIX-012** | a11y | Elevate muted text contrast to `#9CA3AF` | None | Stage 2 |
