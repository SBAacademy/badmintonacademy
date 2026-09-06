# S & A BADMINTON ACADEMY — SEO TECHNICAL IMPLEMENTATION GUIDE

This document summarizes the technical SEO architecture, structured data schemas, canonicalization rules, and local search infrastructure implemented for **S & A BADMINTON ACADEMY**.

---

## 1. Technical SEO Architecture Overview

* **Framework**: Next.js 15 App Router with full Server Component optimization for instant initial HTML rendering and fast crawling.
* **Canonical URL Policy**: Every page explicitly generates an absolute canonical URL using `lib/seo.ts` preventing duplicate parameters or trailing slash penalties.
* **OpenGraph & Social Meta**: Complete OpenGraph and Twitter card image previews dynamically mapped to individual programs and branches.
* **Semantic HTML Hierarchy**: Strict rule of exactly one `<h1>` per page, followed by logical `<h2>` and `<h3>` heading hierarchies.
* **Crawler Directives**: Dynamic `app/robots.ts` permitting all public search engines while blocking private admin and `/api/` paths.
* **Dynamic XML Sitemap**: `app/sitemap.ts` auto-compiles static pages, all program routes, all localized branch routes, and blog articles with update timestamps and priority weights.

---

## 2. Structured Data (JSON-LD) Implementations

The website injects rich, schema.org-compliant JSON-LD markup to achieve rich snippets in Google Search:

### A. Organization & SportsOrganization
* **Target**: Global Root (`app/layout.tsx`)
* **Types**: `["SportsOrganization", "EducationalOrganization"]`
* **Properties**: Legal name, URL, official logo, telephone, headquarters address, geo coordinates, and social profiles.

### B. LocalBusiness & SportsActivityLocation
* **Target**: Dedicated Branch Landing Pages (`/branches/kadavanthra`, `/branches/edappally`, `/branches/kakkanad`)
* **Types**: `["SportsActivityLocation", "LocalBusiness"]`
* **Properties**: Specific physical address, exact latitude & longitude coordinates, direct phone line, operational opening hours (05:30 to 22:00), and parent organization link.

### C. Course Schema
* **Target**: Program Detail Pages (`/programs/[slug]`)
* **Type**: `Course`
* **Properties**: Program title, curriculum overview, provider organization, and session duration.

### D. FAQPage Schema
* **Target**: Homepage, Program Pages, and Branch Pages
* **Type**: `FAQPage`
* **Properties**: Main entity array of `Question` and `Answer` matching only genuinely visible accordion text on the page.

### E. BreadcrumbList Schema
* **Target**: All inner navigation paths (`components/seo/Breadcrumbs.tsx`)
* **Type**: `BreadcrumbList`
* **Properties**: Explicit indexed `itemListElement` trail linking to Home and sub-categories.

---

## 3. Local SEO & Google Business Profile Synergy

To maximize rank for *"badminton academy near me"* and *"badminton coaching in Kochi"*, the website adheres to strict Local SEO principles:

1. **NAP Consistency**: Centralized Name, Address, and Phone numbers in `data/academy.ts` and `data/branches.ts` ensure exact matching with Google Business Profile listings.
2. **Dedicated Branch URLs**: Separate crawlable URLs for Kadavanthra, Edappally, and Kakkanad rather than a single compressed page.
3. **Embedded Google Maps**: Responsive responsive iframes on each branch page allowing one-tap Google Maps directions.
4. **Local Suburb Mention**: Content naturally mentions adjacent Kochi micro-neighborhoods (Panampilly Nagar, Girinagar, Palarivattom, Kalamassery, Infopark, SmartCity, Thrikkakara).

---

## 4. Google Search Console & Analytics Integration

The site is pre-configured with the standard conversion tracking dispatcher in `lib/analytics.ts`:

* `generate_lead`: Triggered when an athlete or parent submits a free trial request.
* `whatsapp_click`: Contextually tracks which branch or program triggered the chat.
* `phone_click`: Tracks direct calls to admissions desks.
* `map_directions_click`: Tracks when a user clicks to navigate to a branch court.
