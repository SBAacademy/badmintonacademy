# S&A Badminton Academy — Current System State Audit & Reconciliation

**Document Version:** 1.0  
**Audit Date:** September 7, 2026  
**Status:** Verified via Direct Codebase & Neon Database Introspection  
**Author:** Antigravity Engineering Team  

---

## Executive Summary

This document establishes the verified baseline of the S&A Badminton Academy digital ecosystem. It reconciles the public Next.js web application, Neon Serverless PostgreSQL database, data models, API endpoints, and existing prototype admin tools.

Every finding is classified under one of six strict operational states:
- **`IMPLEMENTED`**: Fully functional, tested, and actively running.
- **`PARTIALLY IMPLEMENTED`**: Functional prototype or basic scaffold; missing enterprise robustness.
- **`MISSING`**: Required by academy operations but does not yet exist.
- **`BROKEN`**: Code exists but fails, produces runtime errors, or causes regressions.
- **`UNVERIFIED`**: Present in documentation or comments but unverified against live operations.
- **`PLANNED`**: Roadmapped for development in upcoming milestones.

---

## 1. Current Architecture

**Status:** `IMPLEMENTED`

- **Architecture Model:** Hybrid Server-Rendered / Statically Generated Jamstack with Serverless Edge Functions.
- **Frontend / Fullstack:** Next.js 16.3.4 (App Router) running on React 19.2.8 and TypeScript 7.0.2.
- **Backend / API:** Next.js Route Handlers (`app/api/*`) executing in Node.js serverless runtimes.
- **Data Persistence:** Neon Serverless PostgreSQL with WebSocket/HTTP pooled connection (`@neondatabase/serverless` v1.1.0). Local JSON files act as offline/build-time fallbacks.
- **Design System:** Tailwind CSS v4 (`@tailwindcss/postcss` 4.3.3) adhering to the "Rebel Performance" athletic dark theme (Pitch Black `#07090D`, Acid Lime `#B8F000`, Slate `#1F2937`).

---

## 2. Current Frontend

**Status:** `IMPLEMENTED`

- **Public Routes:** 35 active routes including:
  - City Homepage: `/`
  - Location Hub & Canonical Centres: `/branches`, `/kadavanthra`, `/kumbalanghi`, `/maradu`, `/palluruthy`, `/chullikal`
  - Program Landing Pages: `/programs`, `/programs/kids-badminton-coaching`, `/programs/junior-badminton-coaching`, `/programs/adult-badminton-coaching`, `/programs/competitive-badminton-training`, `/programs/summer-badminton-camp`
  - Story & Credibility: `/about`, `/coaches`, `/achievements`, `/testimonials`, `/gallery`, `/blog`
  - Admissions & Legal: `/contact`, `/privacy`, `/terms`
- **Component System:** Fully modular architecture in `components/` containing `hero/`, `layout/`, `forms/`, `sections/`, `gallery/`, and `seo/`.
- **Admin UI:** A single client-rendered Next.js page at `app/admin/page.tsx` (105KB) providing an admissions Kanban board, data table, and tabbed CMS editors.

---

## 3. Current Backend

**Status:** `PARTIALLY IMPLEMENTED`

- Implemented as Next.js App Router Route Handlers in `app/api/`.
- Handles lead creation, content CRUD, and binary image uploads.
- **Gaps:** No centralized authentication middleware, no role-based permission enforcement, no session handling, and no rate limiting.

---

## 4. Current Database

**Status:** `PARTIALLY IMPLEMENTED`

- **Database Provider:** Neon Serverless PostgreSQL (`ep-fragrant-sound-a5hugm18-pooler.us-east-2.aws.neon.tech/neondb`).
- **Live Inspected Tables (Verified Sept 7, 2026):**
  1. `leads` (5 live rows): Contains `id`, `name`, `phone`, `email`, `age_category`, `branch`, `program`, `slot`, `message`, `status`, `notes`, `utm_source`, `utm_medium`, `utm_campaign`, `submitted_at`, `updated_at`.
  2. `site_content` (5 sections): Key-value table storing JSONB arrays for `coaches` (4), `achievements` (5), `testimonials` (5), `blog` (3), and `gallery` (9).
  3. `uploaded_images` (2 images): Stores `id`, `filename`, `mime_type`, `data` (base64), `size`, `created_at`.
- **Missing Operational Schema:** No tables for `users`, `roles`, `students`, `parents`, `batches`, `sessions`, `attendance`, `invoices`, `payments`, `allocations`, `performance`, or `audit_logs`.

---

## 5. Current API Routes

**Status:** `PARTIALLY IMPLEMENTED`

| Route | Methods | Status | Description |
|---|---|---|---|
| `/api/enquiries` | POST, GET, PUT, DELETE | `PARTIALLY IMPLEMENTED` | Captures leads, generates WhatsApp URL, updates status/notes. Lacks authentication. |
| `/api/content/[section]` | GET, POST, PUT, DELETE | `PARTIALLY IMPLEMENTED` | CRUD for `gallery`, `coaches`, `achievements`, `testimonials`, `blog`. No RBAC. |
| `/api/upload` | POST | `IMPLEMENTED` | Handles multipart image upload up to 10MB into Neon DB base64 table. |
| `/api/images/[id]` | GET | `IMPLEMENTED` | Serves binary image with edge caching headers (`Cache-Control: public, max-age=31536000`). |

---

## 6. Current Data Models

**Status:** `PARTIALLY IMPLEMENTED`

- Stored in TypeScript interfaces in `data/*.ts`:
  - `LocationData` in `data/locations.ts`
  - `Program` in `data/programs.ts`
  - `Coach` in `data/coaches.ts`
  - `Achievement` in `data/achievements.ts`
  - `Testimonial` in `data/testimonials.ts`
  - `BlogPost` in `data/blog.ts`
  - `GalleryItem` in `data/gallery.ts`
  - `LeadItem` in `lib/db.ts`
- **Limitation:** Data models are largely decoupled from relational database constraints; relational foreign keys do not exist in the database.

---

## 7. Current Location Architecture

**Status:** `IMPLEMENTED` (with placeholder risk)

- 5 canonical verified centres:
  1. `kadavanthra`: Headquarters near Rajiv Gandhi Indoor Stadium.
  2. `kumbalanghi`: Kumbalanghi facility.
  3. `maradu`: Maradu arena.
  4. `palluruthy`: Palluruthy centre.
  5. `chullikal`: Chullikal facility.
- **Operational Rule:** The internal management platform operates exclusively on these 5 canonical centres.

---

## 8. Current Program Architecture

**Status:** `IMPLEMENTED`

- 5 canonical training curriculums:
  1. `kids-badminton-coaching`: Ages 5–9, 1:6 ratio, foundational motor agility.
  2. `junior-badminton-coaching`: Ages 10–16, 1:8 ratio, technical & footwork progression.
  3. `adult-badminton-coaching`: 16+ & IT professionals, fitness, cardiovascular drills.
  4. `competitive-badminton-training`: State/National athletes, high-intensity match biomechanics.
  5. `summer-badminton-camp`: Seasonal intensive training camps.

---

## 9. Current Enquiry Flow

**Status:** `IMPLEMENTED`

```
Visitor Submits Form ──> POST /api/enquiries ──> INSERT into Neon leads table
                                             └──> Construct WhatsApp URL
                                             └──> Redirect Client to WhatsApp
```

- Honeypot anti-spam protection is present (`botAddress`).
- Phone validation cleans numbers to 10+ digits.
- Inbound leads default to status `NEW`.

---

## 10. Current Lead Tracking

**Status:** `PARTIALLY IMPLEMENTED`

- Managed inside `app/admin/page.tsx` via Kanban board and table.
- Statuses: `NEW`, `CONTACTED`, `TRIAL_SCHEDULED`, `ENROLLED`, `DROPPED`.
- Inline notes updating via `PUT /api/enquiries`.
- **Gaps:** No audit trail of who changed status, no assignment to specific staff, no automated follow-up reminders.

---

## 11. Current Analytics

**Status:** `PARTIALLY IMPLEMENTED`

- Event dispatch wrapper in `lib/analytics.ts` pushing to `window.dataLayer`.
- Tracks: `form_submission`, `whatsapp_click`, `phone_click`, `location_view`.
- **Gap:** Google Tag Manager container script is missing from `app/layout.tsx` (documented as `BUG-004`).

---

## 12. Current Forms

**Status:** `IMPLEMENTED`

- `components/forms/EnquiryForm.tsx`: Modal and inline admissions form with field-level validation, reactive branch/program selectors, and loading states.
- Client-side validation prevents empty submissions.

---

## 13. Current SEO System

**Status:** `IMPLEMENTED`

- Dynamic `robots.ts` and `sitemap.ts` covering 33+ canonical routes.
- Schema.org JSON-LD generation in `components/seo/SEOJsonLd.tsx` for `SportsActivityLocation`, `Course`, `BreadcrumbList`, and `FAQPage`.
- Canonical link configuration in `app/layout.tsx`.

---

## 14. Current Authentication

**Status:** `BROKEN` / `UNACCEPTABLE FOR PRODUCTION`

- The current Next.js `/admin` route is secured solely via a client-side PIN check (`pinInput === "2026"`).
- Anyone inspecting the bundle or calling `/api/content` or `/api/enquiries` directly bypasses authentication entirely.
- **Action Required:** Full migration to server-enforced JWT access/refresh token system with bcrypt passwords and platform keychain storage.

---

## 15. Current Deployment

**Status:** `IMPLEMENTED`

- Deployed on Vercel Serverless Edge connected to GitHub (`main` branch).
- Production domain: `https://soorajbadmintonacademy.vercel.app`.

---

## 16. Current Environment Variables

**Status:** `IMPLEMENTED`

- Configured in `.env`:
  - `DATABASE_URL`: Direct pooled connection to Neon PostgreSQL.
- **Missing Variables Required for Platform:**
  - `JWT_SECRET`: For signing and verifying access tokens.
  - `REFRESH_TOKEN_SECRET`: For rotating refresh tokens.
  - `APP_URL`: Canonical backend URL for Flutter network client.

---

## 17. Existing Reusable Code

**Status:** `IMPLEMENTED`

- `lib/db.ts`: Neon DB SQL executor.
- `lib/contentDb.ts`: Content section manager.
- `lib/whatsapp.ts`: Structured WhatsApp dispatch URL builder.
- `lib/utils.ts`: Tailwind class mergers (`clsx`, `tailwind-merge`).
- `data/*.ts`: Source of truth for initial academy seeding.

---

## 18. Existing Technical Debt

**Status:** `IDENTIFIED`

1. Heavy legacy dependencies: `puppeteer` (~300MB) and `pdf-lib` residual from quotation generator tool.
2. Monolithic client page: `app/admin/page.tsx` is 2,300 lines of code combining CRM, 5 CMS managers, and table filters into a single bundle.
3. Unprotected API endpoints: All `/api/*` endpoints currently execute without token verification.

---

## 19. Existing Bugs

**Status:** `TRACKED`

- `BUG-001` (Desktop dropdown snap): `RESOLVED` in commit `571976a`.
- `BUG-002` (Mobile drawer accordion inoperable): `RESOLVED` in commit `4e7c4f0`.
- `BUG-003` (Scroll smooth warning): `RESOLVED`.
- `BUG-004` (GTM container script missing): `ACTIVE` (non-blocking).

---

## 20. Existing Missing Functionality

**Status:** `MISSING`

- Internal student roster, enrollment records, medical notes.
- Parent profiles and multi-child family links.
- Free trial scheduling, coach assignment, and conversion tracking.
- Batches, court schedules, and session-based attendance.
- Financial invoicing, partial payment logging, and balance tracking.
- Coach schedules and athlete performance evaluations.
- Role-based permissions and comprehensive audit logs.
- Native mobile/desktop operational client for academy staff.

---

## 21. Existing Risks

**Status:** `IDENTIFIED`

1. **Security Risk:** Open API endpoints could allow unauthorized modification of site content or lead extraction.
2. **Data Loss Risk:** Running destructive database migrations could wipe live customer leads or CMS content.
3. **Operational Risk:** Lack of attendance and financial records forces academy staff onto manual paper/Excel logs.

---

## 22. Existing Content & Data Limitations

**Status:** `IDENTIFIED`

- Content stored in `site_content` JSONB arrays does not support relational integrity (e.g. deleting a coach does not cascade or validate batch assignments).
- No historical versioning of CMS edits exists.
