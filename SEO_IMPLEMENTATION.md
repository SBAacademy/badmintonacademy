# S & A BADMINTON ACADEMY — TECHNICAL SEO IMPLEMENTATION SPECIFICATION
**Architecture:** Next.js App Router (SSG / Static Pre-Rendering)  
**Protocol / Host:** `https://sabadmintonacademy.com`  
**Target Geographic Entity:** Kochi / Ernakulam, Kerala  
**Centres:** Kadavanthra, Kumbalanghi, Maradu, Palluruthy, Chullikal

---

## 1. URL Architecture & Dynamic Routing

### Primary Production Routes
* **Main Website / City Level:** `/`
* **All-Centre Directory:** `/branches`
* **Local SEO Landing Pages:**
  * `/kadavanthra`
  * `/kumbalanghi`
  * `/maradu`
  * `/palluruthy`
  * `/chullikal`
* **Program Landing Pages:**
  * `/programs/kids-badminton-coaching`
  * `/programs/junior-badminton-coaching`
  * `/programs/adult-badminton-coaching`
  * `/programs/competitive-training`
  * `/programs/badminton-camp`
* **Core Pages:** `/about`, `/coaches`, `/achievements`, `/gallery`, `/testimonials`, `/contact`, `/blog`

### Dynamic Route Implementation
* File: `app/[location]/page.tsx`
* Uses `generateStaticParams()` returning only the approved locations:
  * `kadavanthra`, `kumbalanghi`, `maradu`, `palluruthy`, `chullikal`.
* Unknown or invalid paths trigger `notFound()` immediately, returning HTTP 404.
* Does NOT collide with static routes (`/about`, `/branches`, `/programs`, etc.) because static file system routes have precedence in Next.js App Router.

---

## 2. Legacy URL Redirections (HTTP 308)

To preserve link equity and support seamless migration from older URL structures:
* Legacy paths:
  * `/branches/kadavanthra` → `/kadavanthra`
  * `/branches/:slug` → `/:slug`
* Configured in `next.config.mjs` using `permanent: true`.
* In Next.js, `permanent: true` emits an **HTTP 308 Permanent Redirect**.
* Verification via curl:
  ```bash
  curl -I http://localhost:3000/branches/kadavanthra
  # Returns: HTTP/1.1 308 Permanent Redirect
  # Location: /kadavanthra
  ```
* No redirect chains exist: legacy URLs jump directly to the root slug in 1 hop.

---

## 3. Metadata & Self-Referential Canonicals

Every location page generates unique metadata via `generateMetadata()` in `app/[location]/page.tsx`:
* **Title Template:** `S & A Badminton Academy | Badminton Coaching in [Location]`
* **Open Graph:** Includes location-specific image, title, description, and canonical URL.
* **Canonical URL:** Strictly self-canonicalizing:
  * `/kadavanthra` → `https://sabadmintonacademy.com/kadavanthra`
  * `/kumbalanghi` → `https://sabadmintonacademy.com/kumbalanghi`
  * `/maradu` → `https://sabadmintonacademy.com/maradu`
  * `/palluruthy` → `https://sabadmintonacademy.com/palluruthy`
  * `/chullikal` → `https://sabadmintonacademy.com/chullikal`

---

## 4. Multi-Location Structured Data (JSON-LD)

Each physical location is established as a distinct entity linked to the parent organization:

### Academy Parent Entity
* Concept: `SportsOrganization` / `BadmintonAcademy`
* `@id`: `https://sabadmintonacademy.com/#academy`

### Location-Specific Structured Data
On each location landing page:
1. **`SportsActivityLocation` / `LocalBusiness`:**
   * `@id`: `https://sabadmintonacademy.com/[slug]#location`
   * `name`: S & A Badminton Academy - [Centre Name]
   * `parentOrganization`: `{ "@id": "https://sabadmintonacademy.com/#academy" }`
   * `address`: `PostalAddress` with Street, City (Kochi), State (Kerala), Country (IN), PostalCode.
   * `geo`: `GeoCoordinates` with verified latitude and longitude.
   * `telephone`: `+917907655513`
   * `openingHoursSpecification`: Verified day/time arrays.
2. **`BreadcrumbList`:**
   * Step 1: Home (`https://sabadmintonacademy.com`)
   * Step 2: Centres (`https://sabadmintonacademy.com/branches`)
   * Step 3: [Location Name] (`https://sabadmintonacademy.com/[slug]`)
3. **`FAQPage`:**
   * Contains only visible, genuine on-page questions directly addressing search intent for that location.

---

## 5. Local NAP Consistency

The Name, Address, and Phone number are enforced consistently across the codebase via `data/locations.ts`:
* **Name:** S & A Badminton Academy ([Location])
* **Phone:** `+91 79076 55513` (Click-to-call: `tel:+917907655513`)
* **WhatsApp:** `+91 79076 55513` (Pre-filled URL with contextual location query)
* **NAP Verification Points:**
  1. Header & Navigation dropdown
  2. Location hero contact badges
  3. Location NAP card with Google Maps embed & directions link
  4. Footer crawlable directory
  5. Mobile bottom conversion bar
  6. Structured JSON-LD schema
  7. Google Business Profile link (when verified by client)

---

## 6. XML Sitemap & Robots Configuration

### Sitemap (`app/sitemap.ts`)
* Automatically enumerates:
  * City-level pages (`/`, `/about`, `/coaches`, `/contact`, `/branches`, etc.)
  * 5 Location landing pages (`/kadavanthra`, `/kumbalanghi`, `/maradu`, `/palluruthy`, `/chullikal`) with `priority: 0.95` and `changeFrequency: 'weekly'`
  * All 5 program landing pages with `priority: 0.9`
  * All blog posts with `priority: 0.7`
* Dynamic generation at `https://sabadmintonacademy.com/sitemap.xml`.

### Robots (`app/robots.ts`)
* Allows all legitimate search engine crawlers: `Allow: /`
* Protects private/API endpoints:
  * `Disallow: /api/`
  * `Disallow: /admin/`
  * `Disallow: /private/`
* Points directly to the sitemap: `Sitemap: https://sabadmintonacademy.com/sitemap.xml`

---

## 7. Performance & Core Web Vitals Optimization

The design system maintains premium athletic aesthetics without compromising Core Web Vitals:
1. **LCP (Largest Contentful Paint):**
   * Uses Next.js `<Image priority>` on hero photography.
   * Modern WebP format with explicitly declared aspect ratios to eliminate layout shifts.
   * CSS grid backgrounds and hardware-accelerated animations (`transform`, `opacity`).
2. **CLS (Cumulative Layout Shift):**
   * Pre-allocated dimensions on all image containers, badges, and card wrappers.
   * Static system font fallbacks with modern Google Fonts (`Outfit`, `Plus Jakarta Sans`).
3. **INP (Interaction to Next Paint):**
   * Lightweight interactive components; no heavy client-side animation runtime blocks user clicks.
   * Mobile navigation drawer uses CSS transitions with native pointer event handling.

---

## 8. Conversion Tracking & Custom Event Analytics

All conversion actions trigger structured custom events (ready for Google Tag Manager / GA4):
* `location_view`: Triggered when a visitor lands on a centre page:
  ```json
  { "event": "location_view", "location": "kadavanthra" }
  ```
* `whatsapp_click`: Contextual click with centre attribution:
  ```json
  { "event": "whatsapp_click", "location": "kadavanthra", "source_page": "/kadavanthra" }
  ```
* `phone_click`: Direct dial click:
  ```json
  { "event": "phone_click", "location": "kadavanthra", "source_page": "/kadavanthra" }
  ```
* `directions_click`: Triggered when visitor clicks "Get Directions" / Google Maps:
  ```json
  { "event": "directions_click", "location": "kadavanthra" }
  ```
* `trial_click`: Click on Free Trial / Assessment button.
* `enquiry_start`: Visitor interacts with form input.
* `enquiry_submit`: Form successfully submitted with preferred branch and program.

---

## 9. Google Search Console & Local SEO Maintenance Checklist

1. **Property Setup:**
   * Create Domain Property in Google Search Console for `sabadmintonacademy.com`.
   * Submit `https://sabadmintonacademy.com/sitemap.xml`.
2. **URL Inspection:**
   * Inspect `/kadavanthra`, `/kumbalanghi`, `/maradu`, `/palluruthy`, `/chullikal`, and ensure "URL is on Google" with valid `SportsActivityLocation` and `BreadcrumbList` rich results detected.
3. **Google Business Profile Synchronization:**
   * For each physical branch, create/claim the official Google Business Profile.
   * Link the GBP primary website button directly to that branch's landing page (`/kadavanthra`, `/kumbalanghi`, etc.), NOT to the general homepage.
   * Ensure Business Name matches: `S & A Badminton Academy - Kadavanthra`.
