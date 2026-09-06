# S & A BADMINTON ACADEMY — COMPLETE ROUTE & URL AUDIT
**Audit Date:** September 6, 2026  
**Auditor:** Senior Frontend Architect & Next.js Technical Lead  
**Audit Methodology:** Full Source Code Tree Scan & Production SSG Build Verification  
**Total Exposing Routes:** 33 Pre-rendered Static Pages + 1 Dynamic API Route

---

## 1. Master Route Inventory & Status Table

All routes were verified against the actual Next.js 16 App Router build output (`npm run build`).

| Route URL | Source File Path | Rendering Type | HTTP Status | Metadata Defined | Canonical Target | Primary SEO Target Intent | Current Status |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: |
| `/` | `app/page.tsx` | Static (SSG) | 200 | Yes (`createMetadata`) | `https://sabadmintonacademy.com` | "badminton academy in Kochi", "badminton coaching Kochi" | **Verified Active** |
| `/about` | `app/about/page.tsx` | Static (SSG) | 200 | Yes | `https://sabadmintonacademy.com/about` | Brand history, Head Coach Sooraj philosophy | **Verified Active** |
| `/branches` | `app/branches/page.tsx` | Static (SSG) | 200 | Yes | `https://sabadmintonacademy.com/branches` | All-centres directory across Kochi | **Verified Active** |
| `/kadavanthra` | `app/[location]/page.tsx` | Dynamic SSG | 200 | Yes (Unique) | `https://sabadmintonacademy.com/kadavanthra` | "badminton academy in Kadavanthra", "badminton coaching Kadavanthra" | **Verified Active** |
| `/edappally` | `app/[location]/page.tsx` | Dynamic SSG | 200 | Yes (Unique) | `https://sabadmintonacademy.com/edappally` | "badminton academy in Edappally", "badminton coaching Edappally" | **Verified Active** |
| `/kakkanad` | `app/[location]/page.tsx` | Dynamic SSG | 200 | Yes (Unique) | `https://sabadmintonacademy.com/kakkanad` | "badminton academy in Kakkanad", Infopark IT batches | **Verified Active** |
| `/fourth-centre` | `app/[location]/page.tsx` | Dynamic SSG | 200 | Yes (Unique) | `https://sabadmintonacademy.com/fourth-centre` | Expansion arena in Kochi (Dev placeholder) | **Verified Active (Placeholder Data)** |
| `/branches/kadavanthra` | `app/branches/[slug]/page.tsx` | Dynamic SSG / Redirect | 308 | N/A (Redirect) | `→ /kadavanthra` | Legacy URL consolidation to short URL | **Verified Redirect (308)** |
| `/branches/edappally` | `app/branches/[slug]/page.tsx` | Dynamic SSG / Redirect | 308 | N/A (Redirect) | `→ /edappally` | Legacy URL consolidation to short URL | **Verified Redirect (308)** |
| `/branches/kakkanad` | `app/branches/[slug]/page.tsx` | Dynamic SSG / Redirect | 308 | N/A (Redirect) | `→ /kakkanad` | Legacy URL consolidation to short URL | **Verified Redirect (308)** |
| `/branches/fourth-centre`| `app/branches/[slug]/page.tsx` | Dynamic SSG / Redirect | 308 | N/A (Redirect) | `→ /fourth-centre` | Legacy URL consolidation to short URL | **Verified Redirect (308)** |
| `/programs` | `app/programs/page.tsx` | Static (SSG) | 200 | Yes | `https://sabadmintonacademy.com/programs` | "badminton classes in Kochi", program matrix | **Verified Active** |
| `/programs/kids-badminton-coaching` | `app/programs/[slug]/page.tsx` | Dynamic SSG | 200 | Yes (Unique) | `.../programs/kids-badminton-coaching` | "kids badminton coaching Kochi" (Ages 5–9) | **Verified Active** |
| `/programs/junior-badminton-coaching` | `app/programs/[slug]/page.tsx` | Dynamic SSG | 200 | Yes (Unique) | `.../programs/junior-badminton-coaching` | "junior badminton coaching Kochi" (Ages 10–16) | **Verified Active** |
| `/programs/adult-badminton-coaching` | `app/programs/[slug]/page.tsx` | Dynamic SSG | 200 | Yes (Unique) | `.../programs/adult-badminton-coaching` | "adult badminton classes Kochi" (Fitness/corporate) | **Verified Active** |
| `/programs/competitive-training` | `app/programs/[slug]/page.tsx` | Dynamic SSG | 200 | Yes (Unique) | `.../programs/competitive-training` | "competitive badminton training Kochi" (State squad) | **Verified Active** |
| `/programs/badminton-camp` | `app/programs/[slug]/page.tsx` | Dynamic SSG | 200 | Yes (Unique) | `.../programs/badminton-camp` | "badminton summer camp Kochi" (Vacation intensive) | **Verified Active** |
| `/coaches` | `app/coaches/page.tsx` | Static (SSG) | 200 | Yes | `https://sabadmintonacademy.com/coaches` | "badminton coaches Kochi", BWF/NIS credentials | **Verified Active** |
| `/achievements` | `app/achievements/page.tsx` | Static (SSG) | 200 | Yes | `https://sabadmintonacademy.com/achievements` | "badminton tournament results Kochi" | **Verified Active** |
| `/gallery` | `app/gallery/page.tsx` | Static (SSG) | 200 | Yes | `https://sabadmintonacademy.com/gallery` | Arena photos, student drills, BWF courts | **Verified Active** |
| `/testimonials` | `app/testimonials/page.tsx` | Static (SSG) | 200 | Yes | `https://sabadmintonacademy.com/testimonials` | Social proof, student/parent reviews | **Verified Active** |
| `/contact` | `app/contact/page.tsx` | Static (SSG) | 200 | Yes | `https://sabadmintonacademy.com/contact` | Free trial bookings, contact phone/desk | **Verified Active** |
| `/blog` | `app/blog/page.tsx` | Static (SSG) | 200 | Yes | `https://sabadmintonacademy.com/blog` | Academy news & educational knowledge base | **Verified Active** |
| `/blog/badminton-coaching-in-kochi-beginners-guide` | `app/blog/[slug]/page.tsx` | Dynamic SSG | 200 | Yes | `.../blog/badminton-coaching-in-kochi...` | Informational SEO: beginner gear, courts, grips | **Verified Active** |
| `/blog/essential-badminton-footwork-drills-for-juniors` | `app/blog/[slug]/page.tsx` | Dynamic SSG | 200 | Yes | `.../blog/essential-badminton-footwork...` | Informational SEO: 6-corner court footwork | **Verified Active** |
| `/blog/why-badminton-is-the-best-sport-for-kids-fitness`| `app/blog/[slug]/page.tsx` | Dynamic SSG | 200 | Yes | `.../blog/why-badminton-is-the-best...` | Informational SEO: agility, fitness for children | **Verified Active** |
| `/privacy` | `app/privacy/page.tsx` | Static (SSG) | 200 | Yes | `https://sabadmintonacademy.com/privacy` | Legal compliance & data handling | **Verified Active** |
| `/terms` | `app/terms/page.tsx` | Static (SSG) | 200 | Yes | `https://sabadmintonacademy.com/terms` | Terms of service & coaching policies | **Verified Active** |
| `/_not-found` | `app/not-found.tsx` | Static (SSG) | 404 | Default | N/A | Custom 404 page with navigation fallbacks | **Verified Active** |
| `/robots.txt` | `app/robots.ts` | Static (TXT) | 200 | N/A | N/A | Search engine crawler rules & sitemap reference | **Verified Active** |
| `/sitemap.xml` | `app/sitemap.ts` | Static (XML) | 200 | N/A | N/A | Dynamic XML sitemap indexing all valid pages | **Verified Active** |
| `/api/enquiries` | `app/api/enquiries/route.ts` | Dynamic Server Route | 200/400 | N/A | N/A | JSON POST handler for admission submissions | **Verified Active** |

---

## 2. Dynamic Route Collision & Fallback Verification

### The Top-Level `/[location]` Dynamic Route
Because `app/[location]/page.tsx` sits at the root segment of `app/`, it was verified against potential route collisions:
1. **Precedence**: Next.js App Router prioritizes explicit file system folders over dynamic brackets. Routes such as `/about`, `/programs`, `/branches`, `/coaches`, `/contact`, `/gallery`, `/blog`, `/privacy`, and `/terms` resolve immediately without entering `[location]`.
2. **Param Whitelist**: `generateStaticParams()` returns strictly:
   ```ts
   return [
     { location: "kadavanthra" },
     { location: "edappally" },
     { location: "kakkanad" },
     { location: "fourth-centre" },
   ];
   ```
3. **Invalid Parameter Test**: Tested `curl -I http://localhost:3000/not-a-real-centre`. Result: **`HTTP/1.1 404 Not Found`** returned via `notFound()`.

---

## 3. Legacy Redirect Verification (HTTP 308)

Next.js `next.config.mjs` configures 308 redirects from `/branches/:slug` to `/:slug`.
Tested via live curl:
```bash
curl -I http://localhost:3000/branches/kadavanthra
# Result:
HTTP/1.1 308 Permanent Redirect
location: /kadavanthra
```
Confirmed: Single-hop redirect, no redirect chains or query param mutations.
