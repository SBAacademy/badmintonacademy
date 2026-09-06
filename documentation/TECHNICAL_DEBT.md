# S & A BADMINTON ACADEMY — TECHNICAL DEBT REGISTER
**Audit Date:** September 6, 2026  
**Auditor:** Senior Frontend Architect & Next.js Technical Lead  
**Classification:** Prioritized Architectural, Code, Asset, and Dependency Debt

---

## 1. Technical Debt Master Registry

| Debt ID | Category | Severity | Summary Description | Affected Files / Components | Impact | Estimated Effort |
| :---: | :--- | :---: | :--- | :--- | :--- | :---: |
| **TD-001** | Dependencies | **HIGH** | Legacy puppeteer & pdf-lib bloating `node_modules` | `package.json`, `package-lock.json` | Inflates installation time and server deployment image size by ~300MB. | 15 mins |
| **TD-002** | Data Architecture | **MEDIUM** | Parallel legacy branch database (`data/branches.ts`) | `data/branches.ts`, `app/branches/[slug]/page.tsx` | Data drift risk if someone updates `branches.ts` instead of `locations.ts`. | 30 mins |
| **TD-003** | Dead Code | **LOW** | Unused duplicate component `WhyChooseUs.tsx` | `components/sections/WhyChooseUs.tsx` | Minor codebase clutter. | 5 mins |
| **TD-004** | Code Architecture | **MEDIUM** | Monolithic local SEO page component (751 lines) | `app/[location]/page.tsx` | Slower developer iteration across local SEO sections. | 2 hours |
| **TD-005** | Media Assets | **MEDIUM** | Large uncompressed JPEG assets in `public/` | `public/images/hero-athlete.jpg`, `training-coach.jpg` | ~1.5MB total bandwidth; potential LCP delay on 3G mobile networks. | 30 mins |
| **TD-006** | Analytics | **MEDIUM** | GTM container tag not mounted in layout | `app/layout.tsx`, `lib/analytics.ts` | Dispatches events to `window.dataLayer`, but GTM script is not loaded. | 30 mins |
| **TD-007** | Accessibility | **LOW** | Missing focus trap in mobile navigation drawer | `components/layout/Navbar.tsx` | Keyboard tab navigation can leave the mobile drawer when opened. | 45 mins |

---

## 2. Detailed Technical Debt Specifications

### TD-001: Legacy Puppeteer & PDF-Lib Dependencies
* **Root Cause:** The repository originally originated as a commercial quotation PDF generation tool (`badminton-academy-quotation`).
* **Recommended Resolution:** Remove `puppeteer` and `pdf-lib` from `package.json` and move `generate-pdf.mjs` and `index.html` into an isolated archive or remove them.
* **Dependencies:** None.

### TD-002: Parallel Location Data Files (`branches.ts` vs `locations.ts`)
* **Root Cause:** Rapid evolution from 3 initial branches to 4 dedicated local SEO landing pages.
* **Recommended Resolution:** Delete `data/branches.ts` and ensure all legacy redirect routes reference `data/locations.ts`.

### TD-004: Monolithic `app/[location]/page.tsx` Refactoring
* **Root Cause:** All 16 local SEO sections were consolidated into one file to guarantee rapid, cohesive initial implementation.
* **Recommended Resolution:** Extract individual sections into dedicated subcomponents under `components/location/` (`LocationHero.tsx`, `LocationFacilities.tsx`, `LocationNeighbourhoods.tsx`, `LocationMap.tsx`).
