# SOORAJ BADMINTON ACADEMY

## PROJECT HANDOVER & TECHNICAL DOCUMENTATION

**Website • CRM • Admin Dashboard • Local SEO**

---

### Document Information & Metadata

| Specification | Project Details |
| :--- | :--- |
| **Project Name** | Sooraj Badminton Academy — Website, CRM & Local SEO |
| **Official Website URL** | [https://soorajbadmintonacademy.in/](https://soorajbadmintonacademy.in/) |
| **Project Type** | Professional Website · Dynamic CMS · Admin Dashboard / CRM · Local SEO & GBP Setup |
| **Project Reference** | `SAA-WEB-SEO-2026-001` |
| **Project Commencement Date** | 06 September 2026 |
| **Official Handover Date** | 07 October 2026 |
| **Handover Status** | Project handed over for client testing and review |
| **7-Day Testing & Review Period** | 07 October 2026 to 13 October 2026 |
| **Final Date for Reporting Included Corrections** | 13 October 2026 |
| **Commercial Project Value** | ₹25,000 INR (*Itemized: Website Development ₹15,000 + 30-Day Local SEO ₹10,000*) |
| **Author & Delivery Lead** | **Mohammed Nibrasul Haqq** |
| **Professional Role** | Freelance Full-Stack Developer · UI/UX Designer · Kreovate Marketing Agency |
| **Client Entity** | Sooraj Badminton Academy (SBA) / S & A Badminton Academy |
| **Client Leadership** | Head Coach Sooraj M S & Academy Directorate |
| **Document Classification** | Official Client Handover & Technical Specification Package |

---

## TABLE OF CONTENTS

1. [Executive Summary & Project Overview](#1-executive-summary--project-overview)
2. [Agreed Scope of Work & Delivery Matrix](#2-agreed-scope-of-work--delivery-matrix)
3. [Technology Stack Specification](#3-technology-stack-specification)
4. [Application Architecture & System Data Flow](#4-application-architecture--system-data-flow)
5. [Public Website Module Documentation](#5-public-website-module-documentation)
6. [Active Training Centres & Branch Directory](#6-active-training-centres--branch-directory)
7. [Admin Dashboard & Operations Platform](#7-admin-dashboard--operations-platform)
8. [Authentication, Authorization & Security Architecture](#8-authentication-authorization--security-architecture)
9. [Database Architecture & Schema Documentation](#9-database-architecture--schema-documentation)
10. [Lead Lifecycle & Admissions CRM Workflow](#10-lead-lifecycle--admissions-crm-workflow)
11. [Multi-Channel WhatsApp Communication Integration](#11-multi-channel-whatsapp-communication-integration)
12. [Search Engine Optimization (SEO) Implementation](#12-search-engine-optimization-seo-implementation)
13. [Google Business Profile (GBP) Implementation & Verification Audit](#13-google-business-profile-gbp-implementation--verification-audit)
14. [XML Sitemaps, Robots & Crawlability Configuration](#14-xml-sitemaps-robots--crawlability-configuration)
15. [Events & Tournament Management Engine](#15-events--tournament-management-engine)
16. [Production Deployment & Infrastructure Specification](#16-production-deployment--infrastructure-specification)
17. [Environment Variables Reference](#17-environment-variables-reference)
18. [Quality Assurance & Verification Matrix](#18-quality-assurance--verification-matrix)
19. [Mobile Responsiveness & Viewport Optimization](#19-mobile-responsiveness--viewport-optimization)
20. [Client Handover Deliverables Checklist](#20-client-handover-deliverables-checklist)
21. [Step-by-Step Administrator User Guide](#21-step-by-step-administrator-user-guide)
22. [Content Management & Brand Guidelines](#22-content-management--brand-guidelines)
23. [System Backup & Maintenance Schedule](#23-system-backup--maintenance-schedule)
24. [Known Limitations & Pending Client Actions](#24-known-limitations--pending-client-actions)
25. [Strategic Future Roadmap](#25-strategic-future-roadmap)
26. [Final Project Component Status](#26-final-project-component-status)
27. [7-Day Testing, Review & Correction Period](#27-7-day-testing-review--correction-period)
28. [Final Handover & Delivery Declaration](#28-final-handover--delivery-declaration)
29. [Appendix A: Production & Preview URLs](#appendix-a-production--preview-urls)
30. [Appendix B: Administrative Routes](#appendix-b-administrative-routes)
31. [Appendix C: SEO & Sitemap Endpoints](#appendix-c-seo--sitemap-endpoints)
32. [Appendix D: Backend API Endpoints Catalog](#appendix-d-backend-api-endpoints-catalog)
33. [Appendix E: Database Models Catalog](#appendix-e-database-models-catalog)
34. [Appendix F: Repository Directory Tree](#appendix-f-repository-directory-tree)
35. [Appendix G: Production Build & Deployment Reference](#appendix-g-production-build--deployment-reference)

---

## 1. EXECUTIVE SUMMARY & PROJECT OVERVIEW

### 1.1 Project Purpose & Business Context
**Sooraj Badminton Academy (SBA)** (operating also as *S & A Badminton Academy*) is a premier athletic badminton training institution based in Kochi, Kerala. The academy operates five physical training centres providing world-class BWF-standard synthetic and sprung wooden cushion courts, age-specific coaching pathways, certified coach mentorship, and competitive tournament player preparation.

Prior to this engagement, the academy relied primarily on distributed social media channels and unverified word-of-mouth enquiries. The primary objective of project `SAA-WEB-SEO-2026-001` was to engineer an end-to-end digital infrastructure that:
1. Establishes a branded, high-performance web presence at [https://soorajbadmintonacademy.in/](https://soorajbadmintonacademy.in/).
2. Captures local neighborhood commercial search intent across Kochi and five targeted micro-markets.
3. Provides an integrated Administrative Dashboard & CRM to manage student admissions, leads, coaches, centres, track records, gallery items, and blog articles.
4. Sets up and claims authoritative Google Business Profiles (GBP) for all five training venues.
5. Implements friction-free admissions communication via automated WhatsApp handovers.

### 1.2 Core Pillars Delivered

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         SOORAJ BADMINTON ACADEMY PLATFORM PILLARS                     │
├─────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│    PUBLIC DIGITAL HUB   │    ADMIN CRM & CMS       │       LOCAL SEO & GBP             │
├─────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ • 35+ Responsive Pages  │ • Role-Based Admin Panel │ • Multi-Location Local SEO        │
│ • 5 Centre SEO Hubs     │ • Live Lead Management   │ • 5 Google Business Profiles      │
│ • Dynamic Course Guides │ • Centre/Hub Management  │ • Schema.org Multi-Entity JSON-LD │
│ • Tournament Engine     │ • Coaches Management     │ • Dual Dynamic XML Sitemaps       │
│ • Interactive Gallery   │ • Track Record CMS       │ • WhatsApp Admissions Integration │
│ • Verified Review Wall  │ • Dual-Layer DB & Fallback│ • Strict Anti-Cannibalization     │
└─────────────────────────┴──────────────────────────┴───────────────────────────────────┘
```

---

## 2. AGREED SCOPE OF WORK & DELIVERY MATRIX

The contractually agreed scope under reference `SAA-WEB-SEO-2026-001` comprised two integrated commercial pillars totaling ₹25,000 INR. Every item has been inspected and audited against live production code.

### 2.1 Scope Item Delivery Matrix

| Scope Item | Category | Delivery Status | Verification Notes |
| :--- | :--- | :---: | :--- |
| **Responsive Web Platform** | Website | **Completed** | Next.js 16 App Router with mobile-first CSS architecture |
| **Homepage & Brand Showcase** | Website | **Completed** | Hero section, trust pillars, dynamic stats, testimonials, CTAs |
| **Academy About & Leadership** | Website | **Completed** | Founding history, certified coaches, philosophies, facilities |
| **5 Physical Centre Pages** | Website / SEO | **Completed** | Kadavanthra, Kumbalanghi, Maradu, Palluruthy, Chullikal |
| **Programs & Curriculum Pages** | Website | **Completed** | 5 developmental tracks with court ratios, timings, fee tiers |
| **Coaching Panel Directory** | Website / CMS | **Completed** | Head Coach Sooraj & staff profiles with certifications |
| **Achievements & Trophy Wall** | Website / CMS | **Completed** | Verifiable laurels, district/state tournament medals |
| **Photo & Video Gallery** | Website / CMS | **Completed** | Categorized court photography and training drills |
| **Articles & Blog Engine** | Website / SEO | **Completed** | In-depth training guides, equipment advice, footwork tips |
| **Reviews & Testimonial Wall** | Website / CMS | **Completed** | Verified parent and player ratings with moderation controls |
| **Tournament & Events Engine** | Website / CMS | **Completed** | Sanctioned fixtures, summer camps, registration triggers |
| **Contact & Free Trial Form** | Website / Lead | **Completed** | Anti-spam honeypot, phone validation, direct database storage |
| **Multi-Tier WhatsApp Handoff**| Lead / Comms | **Completed** | Automatic URL encoding for prospective student trials |
| **Admin Authentication Portal** | Admin CRM | **Completed** | scrypt password hashing, HMAC-SHA256 JWT, refresh tokens |
| **Lead Management CRM** | Admin CRM | **Completed** | Search, status filtering, notes drawer, click-to-dial/chat |
| **Centres Management** | Admin CMS | **Completed** | Full CRUD for physical training venues and court counts |
| **Coaches Management** | Admin CMS | **Completed** | Headshot uploads, bio editing, publish/unpublish toggling |
| **Track Records Management** | Admin CMS | **Completed** | Medal tracking, tournament records, player laurel updates |
| **Photo Gallery Management** | Admin CMS | **Completed** | Binary image upload to database storage with cache headers |
| **Articles CMS** | Admin CMS | **Completed** | Article drafting, slug generation, tags, reading time |
| **Reviews Moderation** | Admin CMS | **Completed** | Customer testimonial editing, star ratings, approval toggle |
| **Administrator Accounts** | Admin CRM | **Completed** | Role-based accounts (`SUPER_ADMIN`, `ADMIN`, etc.) in DB |
| **On-Page Local SEO** | SEO | **Completed** | Unique titles, descriptions, single H1, canonical tags |
| **Schema.org Structured Data**| SEO | **Completed** | Multi-entity `SportsOrganization`, `LocalBusiness`, `FAQPage` |
| **Dual Dynamic XML Sitemaps** | SEO | **Completed** | `/sitemap.xml` and `/tournaments-sitemap.xml` active |
| **Robots Directives** | SEO | **Completed** | Disallows admin/api paths, declares both XML sitemaps |
| **5 Google Business Profiles** | Local SEO | **Configured** | Profiles created on Google; awaiting live video verification |
| **GBP Live Video Verification** | Local SEO | **Pending Client Action** | Requires on-site video walk-through by academy management |
| **High-Res Venue Photography** | Creative | **Pending Client Action** | Real venue photos to replace temporary polished stock assets |
| **Online Payment Gateway** | eCommerce | **Recommended Future** | Razorpay integration for monthly fee auto-collection |
| **Student / Parent Portal** | CRM | **Recommended Future** | Portal for attendance tracking, fee receipts, and rubrics |
| **Native App Store Release** | Mobile | **Recommended Future** | App Store distribution for companion Flutter/iOS admin app |
| **Paid Ads Management** | Marketing | **Not Included in Scope** | Meta / Google Ads ad spend and ad creation out of scope |

---

## 3. TECHNOLOGY STACK SPECIFICATION

The project was constructed using modern, production-grade technologies inspected directly from `package.json` and system configuration:

| Layer | Technology | Exact Version | Architectural Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router, Turbopack) | `^16.3.4` | Server-Side Rendering (SSR), Static Generation (SSG), Edge API routes |
| **UI Library** | React & React DOM | `^19.2.8` | Component lifecycle, state management, and server component rendering |
| **Language** | TypeScript | `^7.0.2` (Compiler) | Static type safety, interface definitions, and compile-time validation |
| **Styling Engine** | Tailwind CSS & PostCSS | `^4.3.3` / `^8.5.28` | High-performance CSS-first athletic design system |
| **Utility Libraries** | clsx & tailwind-merge | `^2.1.1` / `^3.6.0` | Conditional class composition and style merging |
| **Iconography** | Lucide React | `^1.41.0` | Accessible SVG iconography |
| **Animations & FX** | CSS Keyframes & Canvas Confetti | `^1.9.4` | Smooth transitions and admissions form celebratory effects |
| **Motion Library** | Framer Motion | `^13.2.0` | Micro-interactions and animated state transitions |
| **Primary Database** | Neon Serverless PostgreSQL | `@neondatabase/serverless ^1.1.0` | Cloud relational database for leads, centres, coaches, events, auth & audit |
| **Data Fallback** | File-backed JSON Storage | Node.js `fs/promises` | High-availability resilience layer guaranteeing zero user-facing downtime |
| **Authentication** | Node.js Crypto (`scrypt` + HMAC-SHA256) | Native Runtime | Timing-safe password verification, JWT access tokens, and DB refresh tokens |
| **PDF Generation** | Puppeteer & PDF-Lib | `^23.6.0` / `^1.17.1` | Headless rendering of client reports, agreements, and handover documents |
| **Multi-Platform** | Flutter & Native iOS SwiftUI | Flutter 3.x / iOS 17+ | Cross-platform admin projects developed in repository (`s_a_admin/`, `s_a_admin_ios/`) |
| **Production Host** | Vercel Serverless Edge Platform | Vercel Edge Runtime | High-speed global CDN, automatic SSL certificates, and zero-maintenance deployments |

---

## 4. APPLICATION ARCHITECTURE & SYSTEM DATA FLOW

### 4.1 High-Level Architecture Diagram

```
                                  [ USER BROWSER / CLIENT ]
                                              │
                        ┌─────────────────────┴─────────────────────┐
                        ▼                                           ▼
              [ Public Website ]                           [ Admin Dashboard ]
        (Next.js App Router / SSG + SSR)                  (Protected Session / RBAC)
                        │                                           │
                        ├─────────────────────┬─────────────────────┤
                        │                     │                     │
                        ▼                     ▼                     ▼
                [ API Route Layer ]    [ Auth Guard ]       [ Upload Engine ]
                  • /api/enquiries       • /api/admin/auth    • /api/upload
                  • /api/centres         • requireAuth()      • /api/images/[id]
                  • /api/events          • JWT Access Token
                        │                     │
                        └─────────────────────┴─────────────────────┐
                                                                    ▼
                                                        [ Relational Storage ]
                                                         Neon PostgreSQL Cloud
                                                                    │
                                                        (Dual Fallback Layer)
                                                                    ▼
                                                          [ Local JSON Stores ]
                                                          • data/leads.json
                                                          • data/site_content.json
```

### 4.2 Core Application Workflows

1. **Public Visitor Flow:** Visitors discover SBA via Google Search, Google Maps, or social referrals. They land on either the city-level homepage or a hyper-local centre page (`/[location]`). All pages pre-render instantly via Next.js SSR/SSG.
2. **Admissions & Lead Flow:** When a visitor submits the Free Trial Form, `/api/enquiries` validates the telephone number, filters honeypot bot submissions, stores the lead in PostgreSQL (with JSON fallback), sends an in-app admin alert, and constructs a pre-filled WhatsApp admissions URL. The visitor is redirected directly into WhatsApp with their booking parameters intact.
3. **Admin Operations Flow:** Academy staff visit `/admin/login`, enter credentials, and obtain a short-lived JWT access cookie along with an encrypted refresh cookie. Inside `/admin`, staff can inspect inquiries, advance lead statuses, update centre facilities, publish coaches, and create tournament fixtures.
4. **Dual-Layer Database Resilience:** If the cloud database experiences intermittent connectivity or network latency, the data layer automatically switches to file-backed JSON stores (`data/site_content.json`, `data/leads.json`) and recovers synchronously once the database reconnects.

---

## 5. WEBSITE MODULE DOCUMENTATION

Every public module has been developed, styled with our custom Athletic Dark-Mode theme (`#080B10` Court Black, `#0E141B` Card Surface, `#B8F000` Athletic Lime, and `#FFFFFF` High-Contrast White), and verified in production:

| Route | Module Name | Type | Data Source | Administrative Control | User Interaction |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `/` | **Homepage** | SSR / Dynamic | Content DB (`lib/contentDb.ts`) | Fully dynamic: Hero, Centres, Coaches, Reviews, Events | View programs, explore centres, book trials |
| `/about` | **About & Philosophy** | Static / Hybrid | Academy Config (`data/academy.ts`) | Academy founding story, leadership, and trust pillars | Explore coaching methodology and ethos |
| `/branches` | **Centres Directory** | Dynamic | Neon DB `centres` table | Displays active training centres across Kochi | Filter locations, check court specs |
| `/[location]` | **Local Centre Landing Pages** | SSG / Dynamic | Neon DB `centres` table | Individual micro-market pages (`/kadavanthra`, etc.) | Neighborhood maps, hours, court photos, trials |
| `/programs` | **Programs Matrix** | Hybrid | `data/programs.ts` & Neon DB | Age/skill developmental pathways & batch details | Compare curricula, student-to-coach ratios |
| `/programs/[slug]` | **Program Detail Page** | Dynamic | `data/programs.ts` & Content DB | Curriculum breakdown, court ratios, and fees | Direct trial booking for specific track |
| `/coaches` | **Coaching Staff** | Dynamic | Neon DB `coaches` table | Coach biographies, certifications, and assignments | Inspect coach background, BWF credentials |
| `/achievements` | **Track Record & Medals** | Dynamic | Content DB `achievements` | Verifiable tournament laurels, medals, and rankings | Trophy wall with championship details |
| `/gallery` | **Photo & Video Gallery** | Dynamic | Content DB `gallery` | Filterable training court, action, and event photos | View court photos, drills, match highlights |
| `/blog` | **Articles & Guides** | Dynamic | Content DB `blog` | Educational coaching articles and badminton tips | Read coaching guides, share articles |
| `/blog/[slug]` | **Article Detail View** | Dynamic | Content DB `blog` | In-depth reader with reading time and author metadata | Full article reading, related articles |
| `/testimonials` | **Reviews & Ratings** | Dynamic | Content DB `testimonials` | Student and parent ratings and verified feedback | Read parent and athlete reviews |
| `/events` | **Fixtures & Tournaments** | Dynamic | Neon DB `events` table | Upcoming championships, camps, and workshops | Filter fixtures, check dates and venues |
| `/events/[slug]` | **Event Detail View** | Dynamic | Neon DB `events` table | Venue, timing, registration URL, and WhatsApp trigger | Instant registration via WhatsApp or web link |
| `/contact` | **Contact & Admissions** | Dynamic | Form API `/api/enquiries` | Multi-field trial enquiry form with direct WhatsApp | Submit free trial request, click-to-call |
| `/privacy`, `/terms`| **Legal Policies** | Static | Component templates | Data privacy policy and service terms | Read legal disclosures |

---

## 6. ACTIVE TRAINING CENTRES & BRANCH DIRECTORY

### 6.1 Strict Verification of Active Branches
An exhaustive codebase search confirmed that **zero active references to legacy or planned centres such as Edappally or Kakkanad exist in active branch documentation**.

The official, production-active SBA network comprises strictly the following **five (5) training centres**:

```
                                  [ SBA REGIONAL NETWORK ]
                                             │
      ┌───────────────────┬──────────────────┼──────────────────┬───────────────────┐
      ▼                   ▼                  ▼                  ▼                   ▼
 [ Kadavanthra ]   [ Kumbalanghi ]       [ Maradu ]       [ Palluruthy ]       [ Chullikal ]
   Central HQ        West Kochi         South Kochi         West Kochi         Coastal Kochi
    4 Courts           3 Courts           4 Courts           4 Courts            4 Courts
```

### 6.2 Detailed Branch Specifications

#### 1. Kadavanthra Branch (Central Kochi Headquarters)
- **URL:** [https://soorajbadmintonacademy.in/kadavanthra](https://soorajbadmintonacademy.in/kadavanthra)
- **Physical Address:** S&A Sports Arena, Near Rajiv Gandhi Indoor Stadium, Kadavanthra, Kochi, Kerala 682020
- **Phone:** `+91 79076 55513` | **WhatsApp:** `+91 90746 80420`
- **Court Infrastructure:** 4 Active BWF-Standard Courts (Sprung Wooden Cushion & Synthetic Mat)
- **Neighborhoods Served:** Panampilly Nagar, Girinagar, Elamkulam, Vyttila, Thevara, MG Road, Ernakulam South
- **Operating Hours:** Monday – Sunday: 05:00 AM – 10:30 PM

#### 2. Kumbalanghi Branch (West Kochi Training Facility)
- **URL:** [https://soorajbadmintonacademy.in/kumbalanghi](https://soorajbadmintonacademy.in/kumbalanghi)
- **Physical Address:** All Star Badminton Indoor Court, Kumbalanghi, Kochi, Kerala 682007
- **Phone:** `+91 79076 55513` | **WhatsApp:** `+91 90746 80420`
- **Court Infrastructure:** 3 Active Courts (BWF Wooden Cushion & Synthetic Mat)
- **Neighborhoods Served:** Perumpadappu, Palluruthy, Aroor, Edakochi, Chellanam, Thoppumpady
- **Operating Hours:** Monday – Sunday: 05:30 AM – 10:00 PM

#### 3. Maradu Branch (South Kochi Training Centre)
- **URL:** [https://soorajbadmintonacademy.in/maradu](https://soorajbadmintonacademy.in/maradu)
- **Physical Address:** Society Road, near Vadakke Cheruvaram, Shastri Nagar, Maradu, Ernakulam 682304 *(Hosted at ProSmash Badminton Academy)*
- **Phone:** `+91 79076 55513` | **WhatsApp:** `+91 90746 80420`
- **Court Infrastructure:** 4 Active Courts (BWF Grade-1 Certified Synthetic Cushion Surface)
- **Neighborhoods Served:** Kundannoor, Nettoor, Thykoodam, Petta, Tripunithura, Vyttila, Madavana
- **Operating Hours:** Monday – Sunday: 05:30 AM – 10:00 PM

#### 4. Palluruthy Branch (West Kochi Training Hub)
- **URL:** [https://soorajbadmintonacademy.in/palluruthy](https://soorajbadmintonacademy.in/palluruthy)
- **Physical Address:** All Star Badminton Indoor Court, Kumbalanghi / Palluruthy Corridor, Kochi, Kerala 682007
- **Phone:** `+91 79076 55513` | **WhatsApp:** `+91 90746 80420`
- **Court Infrastructure:** 4 Active Courts (BWF Grade-1 Certified Synthetic Cushion Surface)
- **Neighborhoods Served:** Thoppumpady, Edakochi, Kumbalangi, Perumpadappu, Fort Kochi, Mattancherry
- **Operating Hours:** Monday – Sunday: 05:30 AM – 10:00 PM

#### 5. Chullikal Branch (Coastal / Fort Kochi Training Centre)
- **URL:** [https://soorajbadmintonacademy.in/chullikal](https://soorajbadmintonacademy.in/chullikal)
- **Physical Address:** Chullikal, West Kochi, Kerala 682005
- **Phone:** `+91 79076 55513` | **WhatsApp:** `+91 90746 80420`
- **Court Infrastructure:** 4 Active Courts (BWF-Grade Multi-Layer Synthetic Cushion Surface)
- **Neighborhoods Served:** Fort Kochi, Mattancherry, Thoppumpady, Rameswaram, Mundamveli, Willingdon Island
- **Operating Hours:** Monday – Sunday: 05:30 AM – 10:00 PM

---

## 7. ADMIN DASHBOARD & OPERATIONS PLATFORM

The administrative platform at `/admin` empowers academy directors and coaches to manage the entire institution without requiring code modifications:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                      ADMIN DASHBOARD NAVIGATION STRUCTURE                        │
├───────────────────────────────┬──────────────────────────────────────────────────┤
│ Category: Daily Operations    │ • Overview Dashboard (Metrics, Conversion Funnel) │
│                               │ • Student Inquiries (CRM Table, Statuses, Drawer) │
│                               │ • Centres & Hubs (CRUD, Courts, Hours, Active)   │
│                               │ • Training Programs (Curriculum, Ratios, Fees)   │
│                               │ • Events & Tournaments (Fixtures, Registration)  │
├───────────────────────────────┼──────────────────────────────────────────────────┤
│ Category: Website Content     │ • Photo Gallery (Upload, Categorization, Reorder)│
│                               │ • Coaches & Staff (Bios, Certifications, Photos) │
│                               │ • Track Record & Awards (Medals, Tournaments)    │
│                               │ • Blog Articles (SEO Guides, Excerpts, Tags)     │
│                               │ • Reviews & Feedback (Moderation & Approvals)    │
├───────────────────────────────┼──────────────────────────────────────────────────┤
│ Category: Security & Staff    │ • Administrator & Staff Management (RBAC Users)  │
│                               │ • Change Password Modal (scrypt Hashing)         │
│                               │ • WhatsApp Templates & Message Configuration     │
│                               │ • Secure Sign Out (Cookie Invalidation)          │
└───────────────────────────────┴──────────────────────────────────────────────────┘
```

### 7.1 Detailed Admin Module Capabilities

1. **Dashboard Overview:** Displays live key performance indicators (Total Inquiries, New Uncontacted Leads, Active Centres, Published Coaches, and Conversion Rate).
2. **Student Inquiries (CRM):** Real-time table supporting instant search, filtering by Status (`NEW`, `CONTACTED`, `TRIAL_SCHEDULED`, `ENROLLED`, `DROPPED`), Centre, and Age Category. The slide-over Lead Drawer enables adding internal notes, changing lead status, initiating direct calls, or triggering pre-filled WhatsApp messages.
3. **Centres Management:** Enables adding new facilities, editing addresses, adjusting court counts, updating operating hours, toggling active status, and reordering display sequence.
4. **Coaches Management:** Allows uploading coach headshots, modifying titles, adding verified certifications (BWF/NIS/BPed), updating years of experience, and publishing/unpublishing profiles.
5. **Track Records (Achievements):** Enables logging tournament championships, silver medals, age categories, and player honorees.
6. **Photo Gallery:** Features direct image uploading with database storage, captioning, category assignment, and deletion.
7. **Blog / Articles:** Rich article publishing engine supporting title, slug, summary, markdown content, tags, author, and reading time.
8. **Reviews / Testimonials:** Allows moderating customer reviews, editing testimonials, and setting star ratings.
9. **Events / Tournaments:** Create and update sanctioned championships, holiday coaching camps, entry fees, start dates, and external registration links.
10. **Administrator & Staff Management:** Control administrative accounts stored in PostgreSQL `users` table with strict role assignment (`SUPER_ADMIN`, `ADMIN`, `COACH`, `FRONT_DESK`, `CONTENT_MANAGER`).
11. **WhatsApp Templates Configuration:** Standardized messaging templates for admissions confirmation, free trial scheduling, and coaching fee reminders.

---

## 8. AUTHENTICATION, AUTHORIZATION & SECURITY ARCHITECTURE

### 8.1 Password Hashing & Encryption
Passwords are hashed using Node.js's native `scrypt` cryptographic key derivation algorithm with a cryptographically secure 16-byte random salt. Password verification uses `crypto.timingSafeEqual` to eliminate timing attack vulnerabilities:
```
Stored Format: {16-byte-hex-salt}:{64-byte-scrypt-derived-key-hex}
```

### 8.2 Session Management: JWT & Refresh Token Rotation
- **Access Tokens:** Signed with HMAC-SHA256 (`alg: HS256`). Contain `userId`, `email`, `fullName`, `role`, and `assignedCentre`. Life-cycle is strictly bounded to **15 minutes**.
- **Refresh Tokens:** Random 40-byte cryptographic strings stored in the database `refresh_tokens` table with SHA-256 token hashing. Valid for **30 days**.
- **Automatic Token Rotation:** When a refresh token is exchanged, a new access token and a new refresh token are issued while invalidating the previous one.
- **Reuse Attack Detection:** If an already-rotated or revoked refresh token is presented, the system immediately revokes the user's entire token family, forcing re-authentication.
- **Cookie Security:** Cookies (`sa_admin_token`, `sa_admin_refresh`) are marked `HttpOnly: true`, `SameSite: Lax`, and `Secure: true` in production environments.

### 8.3 Role-Based Access Control (RBAC) Matrix

| User Role | Inquiries / Leads | Centres & CMS | Coaches & Events | Staff & Users | Audit Logs |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **SUPER_ADMIN** | Full Access | Full Access | Full Access | Full Access | Full Access |
| **ADMIN** | Full Access | Full Access | Full Access | View Only | Full Access |
| **COACH** | Assigned Leads | View Only | View / Edit Own | No Access | No Access |
| **FRONT_DESK** | Manage Inquiries | View Only | View Only | No Access | No Access |
| **CONTENT_MANAGER**| No Access | Full CMS | Full Events/Blogs| No Access | No Access |

---

## 9. DATABASE ARCHITECTURE & SCHEMA DOCUMENTATION

The database is built on **Neon Serverless PostgreSQL** with 24 dedicated relational tables, 1 JSONB CMS store, and a dual-layer local JSON fallback system.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        RELATIONAL DATABASE ENTITY RELATIONSHIPS                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   [users] ───────────────< [refresh_tokens]                                            │
│      │                                                                                 │
│      ├───────────────────< [audit_logs]                                                │
│      │                                                                                 │
│      └───────────────────< [notifications]                                             │
│                                                                                        │
│   [centres] ─────────────< [batches] ──────────────< [sessions] ───< [attendance]      │
│      │                        │                                           │            │
│      │                        └───────< [batch_students] >────────────────┤            │
│      │                                        │                           │            │
│      ├───────────────────< [students] ────────┴───────────────────────────┘            │
│      │                        ▲                                                        │
│      │                        │                                                        │
│      ├──────────< [leads] ────┴──────< [lead_notes]                                    │
│      │               │                                                                 │
│      │               └───────────────< [free_trials]                                   │
│      │                                                                                 │
│      ├───────────────────< [coaches] ────────< [coach_photos]                          │
│      │                                                                                 │
│      └───────────────────< [events]                                                    │
│                                                                                        │
│   [students] ────────────< [fee_invoices] ───< [payment_allocations] >─── [payments]   │
│                                                                                        │
│   [site_content] (JSONB CMS for gallery, blog, achievements, testimonials, programs)  │
│   [uploaded_images] (Relational image storage: id, mime_type, base64_data, size)       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 9.1 Summary of Core Database Tables

1. `users`: System administrators and coaching staff credentials, roles, and status.
2. `refresh_tokens`: Active cryptographic refresh tokens with rotation and revocation flags.
3. `centres`: Authoritative record for all physical training venues, coordinates, and courts.
4. `programs`: Coaching tracks, age brackets, coach-to-student ratios, and fees.
5. `coaches`: Verified coaching panel biographies, certifications, and specializations.
6. `coach_photos`: High-resolution gallery portraits linked to individual coach profiles.
7. `parents`: Guardian contact details, emergency phone numbers, and addresses.
8. `students`: Enrolled student athletes linked to parents, primary centre, and program track.
9. `leads`: Inbound admissions enquiries captured from website forms and campaigns.
10. `lead_notes`: Internal CRM follow-up commentary stamped by staff author and date.
11. `free_trials`: Scheduled assessment sessions with coach evaluations and attendance status.
12. `batches`: Recurring training groups configured with weekday schedules, start/end times, and capacity.
13. `batch_students`: Many-to-many enrolment table linking students to assigned batches.
14. `sessions`: Daily court sessions generated per batch with date and assigned coach.
15. `attendance`: Individual athlete presence/absence records with unique constraint `(session_id, student_id)`.
16. `fee_invoices`: Monthly and term tuition invoices with payment status (`UNPAID`, `PARTIAL`, `PAID`, `OVERDUE`).
17. `payments`: Verified tuition receipts across UPI, Bank Transfer, Card, and Cash.
18. `payment_allocations`: Relational ledger mapping payments to specific fee invoices.
19. `performance_assessments`: Athlete skill rubrics scoring footwork, technique, fitness, tactics, and consistency (1.0–10.0 scale).
20. `announcements`: Global website and student notices with expiration timestamps.
21. `notifications`: In-app staff alert notifications for new leads, trials, and invoices.
22. `audit_logs`: Immutable compliance audit trail recording who modified which entity.
23. `events`: Academy tournaments, camps, workshops, dates, venues, and registration links.
24. `uploaded_images`: Base64 binary image store with MIME typing and immutable caching.
25. `site_content`: Section-keyed JSONB store providing instant dynamic CMS capability.

---

## 10. LEAD LIFECYCLE & ADMISSIONS CRM WORKFLOW

The admissions pipeline is engineered for zero lead leakage:

```
[ Visitor Lands on Site ]
          │
          ▼
[ Fills Free Trial Form ]
  • Name & Phone (Required)
  • Age Category (5-10, 11-15, 15-25, 26+)
  • Preferred Centre (1 of 5)
  • Preferred Training Program
  • Anti-Spam Honeypot Check
          │
          ▼
[ POST /api/enquiries ] ──> Stores Lead in PostgreSQL & JSON Fallback
          │
          ├─────────────────────────────────────────────┐
          ▼                                             ▼
[ Instant WhatsApp Handover ]            [ Real-Time In-App Alert ]
  • Visitor redirected to WhatsApp        • Staff receives instant alert
  • Pre-filled inquiry parameters         • Appears in /admin CRM table
  • Direct chat with Admissions Lead                    │
                                                        ▼
                                         [ Staff Follow-Up in /admin ]
                                          • Inspect Lead in Slide Drawer
                                          • Click-to-Call prospect
                                          • Click-to-WhatsApp prospect
                                          • Update Status:
                                            NEW ──> CONTACTED ──> TRIAL ──> ENROLLED
```

---

## 11. MULTI-CHANNEL WHATSAPP COMMUNICATION INTEGRATION

The platform integrates WhatsApp across three distinct communication tiers:

### 11.1 Tier 1: Dynamic Lead Contact (CRM Lead Drawer)
When an administrator views a lead inside the Admin Dashboard (`/admin`), the system cleans the prospect's telephone number and builds a direct WhatsApp chat URL:
```
https://wa.me/91{prospect_phone}?text=Hello%20{Name}%2C%20this%20is%20S%26A%20Badminton%20Academy%20Kochi%20regarding%20your%20badminton%20coaching%20inquiry...
```

### 11.2 Tier 2: Fixed Academy Admissions Channel
For general website queries, floating action buttons, and header triggers, traffic routes to the academy's official WhatsApp admissions lines:
- **Primary Admissions Phone:** `+91 79076 55513` (`917907655513`)
- **Secondary / Head Coach Line:** `+91 90746 80420` (`919074680420`)

### 11.3 Tier 3: Pre-Formatted Trial Booking Handoff
When an enquiry form is submitted, the system compiles a structured message with parameters:
```
🏸 *S&A BADMINTON ACADEMY — FREE TRIAL BOOKING*
--------------------------------------------------
👤 *Name:* [Visitor Name]
📞 *Phone:* [Visitor Phone]
✉️ *Email:* [Visitor Email]
🎯 *Age Group:* [Age Bracket]
📍 *Preferred Centre:* [Centre Name]
🏆 *Training Track:* [Program Name]
⏰ *Preferred Slot:* [Slot Time]
💬 *Goal/Level:* [Visitor Message]
--------------------------------------------------
👟 *Requirement:* Shoes & racket required for free trial.
--------------------------------------------------
_Please confirm available trial slots for this week._
```

---

## 12. SEARCH ENGINE OPTIMIZATION (SEO) IMPLEMENTATION

### 12.1 Local Keyword Targeting Matrix
The SEO architecture prevents keyword cannibalization by allocating exact geographic clusters to dedicated landing pages:

| Target Query Cluster | Canonical Landing Page | Target Search Intent |
| :--- | :--- | :--- |
| `badminton academy in Kochi`<br>`badminton coaching in Kochi`<br>`badminton classes in Kochi` | `/` (Homepage) | Regional authority for Kochi / Ernakulam |
| `badminton academy in Kadavanthra`<br>`badminton coaching Kadavanthra` | `/kadavanthra` | Central Kochi & Panampilly Nagar |
| `badminton academy in Kumbalanghi`<br>`badminton coaching Kumbalanghi` | `/kumbalanghi` | West Kochi, All Star Court & Perumpadappu |
| `badminton academy in Maradu`<br>`badminton coaching Maradu` | `/maradu` | South Kochi, Kundannoor & ProSmash Court |
| `badminton academy in Palluruthy`<br>`badminton coaching Palluruthy` | `/palluruthy` | West Kochi, Thoppumpady & Mattancherry |
| `badminton academy in Chullikal`<br>`badminton coaching Chullikal` | `/chullikal` | Coastal Kochi & Fort Kochi corridor |
| `kids badminton coaching Kochi` | `/programs/kids-badminton-coaching` | Parents seeking beginner coaching (5–9 yrs) |
| `badminton tournaments in Kochi` | `/events` | Athletes seeking sanctioned competitions |

### 12.2 Multi-Entity Structured Data (JSON-LD)
Structured schemas are rendered dynamically across all production templates:
1. **`SportsOrganization` / `EducationalOrganization`:** Root organization entity declared on `/` linked to `@id: https://soorajbadmintonacademy.in/#organization`.
2. **`SportsActivityLocation` / `LocalBusiness`:** Declared on each centre page (`/[location]`) with physical address, phone number, coordinates, and opening hours.
3. **`BreadcrumbList`:** Implemented across all nested pages ensuring clear breadcrumb trails in Google Search snippets.
4. **`FAQPage`:** Embedded on location pages answering hyper-local questions (timings, court access, beginner suitability).
5. **`Event`:** Injected on `/events/[slug]` providing Google with event status, venue, dates, and ticket/registration URLs.

---

## 13. GOOGLE BUSINESS PROFILE (GBP) IMPLEMENTATION & VERIFICATION AUDIT

### 13.1 Current Status Across All 5 Branches
Setup and configuration for all five Google Business Profiles have been completed. In compliance with strict reporting standards:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        GOOGLE BUSINESS PROFILE (GBP) AUDIT STATUS                      │
├───────────────────┬──────────────────────────┬──────────────────────┬──────────────────┤
│ Branch Listing    │ Account Configuration    │ Google Verification  │ Public Search    │
├───────────────────┼──────────────────────────┼──────────────────────┼──────────────────┤
│ 1. Kadavanthra    │ COMPLETED ✅             │ PENDING ⏳           │ PENDING VERIF ⏳ │
│ 2. Kumbalanghi    │ COMPLETED ✅             │ PENDING ⏳           │ PENDING VERIF ⏳ │
│ 3. Maradu         │ COMPLETED ✅             │ PENDING ⏳           │ PENDING VERIF ⏳ │
│ 4. Palluruthy     │ COMPLETED ✅             │ PENDING ⏳           │ PENDING VERIF ⏳ │
│ 5. Chullikal      │ COMPLETED ✅             │ PENDING ⏳           │ PENDING VERIF ⏳ │
└───────────────────┴──────────────────────────┴──────────────────────┴──────────────────┘
```

> **Client Notice Regarding Public Visibility:**  
> Google Business Profiles awaiting verification are in an administrative pending state inside Google's dashboard. **They do not appear publicly on Google Maps or in Google Search results until verification is approved.** This is standard Google policy in India to prevent unverified physical business listings.

### 13.2 Live Video Verification Requirement
Google has designated **Live Video Recording Verification** as mandatory for sports training academies. Academy representatives must record an uninterrupted video walking from the street into each court facility displaying:
1. **Street & Signage:** Street name signs and academy entrance signage.
2. **Courts & Equipment:** BWF synthetic mats, nets, shuttlecocks, and training areas.
3. **Proof of Access:** Staff unlocking court gates or entering the administrative desk.

---

## 14. XML SITEMAPS, ROBOTS & CRAWLABILITY CONFIGURATION

### 14.1 Dynamic Sitemap Architecture
The application dynamically builds two independent XML sitemaps:
1. **`/sitemap.xml`:** Enumerates all core pages, 5 local branch landing pages, program tracks, coach profile pages, and blog articles.
2. **`/tournaments-sitemap.xml`:** Dedicated dynamic sitemap powered directly by the `events` table in PostgreSQL. Excludes draft and cancelled events.

### 14.2 Robots Directives (`/robots.txt`)
- `Allow: /`: Permits standard search crawlers across all public content.
- `Disallow: /api/`, `Disallow: /admin/`, `Disallow: /private/`: Shields administrative routes from search indexing.
- Declares both sitemaps:
  - `Sitemap: https://soorajbadmintonacademy.in/sitemap.xml`
  - `Sitemap: https://soorajbadmintonacademy.in/tournaments-sitemap.xml`

---

## 15. EVENTS & TOURNAMENT MANAGEMENT ENGINE

The events engine handles academy fixtures, ranking tournaments, and holiday training camps:

### 15.1 Available Features
- **Filterable Event Directory (`/events`):** Tabbed interface filtering All, Upcoming, Tournaments, Camps, and Past fixtures.
- **Dynamic Event Detail View (`/events/[slug]`):** Renders high-resolution hero photo, event category badge, date, start/end time, venue, and fee.
- **Direct Registration & WhatsApp:** Registration button deep-links to external form or triggers an automated WhatsApp enquiry with event parameters.
- **Structured Schema (`schema.org/Event`):** Automatically maps event dates, location coordinates, organizer, and availability.

### 15.2 Field Availability Matrix

| Field | Implemented & Active | In Progress / Future |
| :--- | :---: | :---: |
| Event Title, Slug, Description | ✅ | — |
| Event Date & Start/End Time | ✅ | — |
| Venue Name & Centre Association | ✅ | — |
| Event Category (Tournament, Camp, Workshop) | ✅ | — |
| Status (Upcoming, Registration Open, Completed) | ✅ | — |
| High-Resolution Event Poster Image | ✅ | — |
| WhatsApp Instant Registration Link | ✅ | — |
| External Registration URL | ✅ | — |
| Built-in Online Payment Gateway | — | ⏳ Recommended Enhancement |
| Live Tournament Draw / Bracket Viewer | — | ⏳ Recommended Enhancement |

---

## 16. PRODUCTION DEPLOYMENT & INFRASTRUCTURE SPECIFICATION

| Infrastructure Element | Configuration Details |
| :--- | :--- |
| **Production URL** | [https://soorajbadmintonacademy.in/](https://soorajbadmintonacademy.in/) |
| **Hosting Platform** | Vercel Serverless Edge Platform |
| **Deployment Mechanism** | Automatic Git-triggered continuous integration via `main` branch |
| **Build Command** | `npm run build` (`next build`) |
| **Start Command** | `npm run start` (`next start`) |
| **SSL / HTTPS** | Automated Let's Encrypt SSL with TLS 1.3 encryption |
| **Edge CDN** | Vercel Global Edge Network with static asset caching |
| **Database Server** | Neon PostgreSQL Serverless Instance (AWS us-east-2 region) |

---

## 17. ENVIRONMENT VARIABLES REFERENCE

All sensitive secrets are isolated strictly within production environment configurations. **No private secret values are printed in this document.**

| Variable Name | Purpose | Required in Production | Secret / Security Classification |
| :--- | :--- | :---: | :--- |
| `DATABASE_URL` | Neon PostgreSQL pooled connection string | **YES** | **Secret / High Risk** |
| `JWT_SECRET` | Secret key used for signing JWT access tokens | **YES** | **Secret / High Risk** |
| `NEXT_PUBLIC_SITE_URL` | Authoritative base URL for canonicals & sitemaps | **YES** | Public Configuration |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console verification token | Optional | Public Configuration |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager telemetry container ID | Optional | Public Configuration |
| `ADMIN_EMAIL` | Default Super Admin bootstrap email | Optional (CLI only) | Internal Configuration |
| `ADMIN_PASSWORD` | Default Super Admin bootstrap password | Optional (CLI only) | **Secret / High Risk** |
| `ADMIN_NAME` | Default Super Admin display name | Optional (CLI only) | Internal Configuration |
| `NODE_ENV` | Runtime environment mode (`production` / `development`) | **YES** | Standard Environment |

---

## 18. QUALITY ASSURANCE & VERIFICATION MATRIX

| Area Tested | Status | Verification Observations & Findings |
| :--- | :---: | :--- |
| **Homepage & Branding** | **PASS** | Hero photography, trust stats, animated tickers, and CTAs render without layout shift. |
| **Navigation & Mobile Drawer** | **PASS** | Gapless hover on desktop; mobile drawer locks body scroll and handles touch smoothly. |
| **5 Centre Landing Pages** | **PASS** | Kadavanthra, Kumbalanghi, Maradu, Palluruthy, Chullikal all pre-render with unique metadata. |
| **Legacy 308 Redirections** | **PASS** | `/branches/:slug` redirects permanently to `/:slug` in a single HTTP hop. |
| **Lead Submission Form** | **PASS** | Anti-spam honeypot functional; phone validation enforces 10 digits; WhatsApp handover triggers. |
| **Admin Authentication** | **PASS** | scrypt password verification verified; 401 on missing token; 403 on role mismatch. |
| **Admin Lead Drawer** | **PASS** | Updating status, saving notes, and deleting leads confirmed in Neon DB and local fallback. |
| **CMS CRUD Operations** | **PASS** | Coaches, Centres, Events, Gallery, Articles, and Testimonials persist correctly. |
| **Image Upload System** | **PASS** | Images store as binary Base64 in PostgreSQL `uploaded_images` and serve via `/api/images/[id]`. |
| **SEO Canonical URLs** | **PASS** | Strict self-referential canonical tags validated across all pages. |
| **Structured Data (JSON-LD)** | **PASS** | Validated using Google Rich Results standards for Organization, Location, Breadcrumb, and Event. |
| **XML Sitemaps** | **PASS** | Both `/sitemap.xml` and `/tournaments-sitemap.xml` render valid XML without syntax errors. |
| **Robots Directives** | **PASS** | Crawler rules verified protecting `/api/`, `/admin/`, and `/private/`. |
| **Mobile Responsiveness** | **PASS** | Inspected on iPhone 14/15, Android Viewports (390px, 412px), and Tablets (768px, 1024px). |
| **Google Business Profiles** | **PARTIAL** | All 5 profiles created and configured; pending client on-site live video verification. |
| **Authentic Photos** | **PENDING** | High-resolution venue photos pending final photography delivery from client. |
| **Coach Certifications** | **PARTIAL** | Verified qualifications for Head Coach Sooraj displayed; assistant certificates pending. |

---

## 19. MOBILE RESPONSIVENESS & VIEWPORT OPTIMIZATION

The platform is designed mobile-first to accommodate parents browsing on smartphones:
- **Touch-Friendly Buttons:** All interactive controls maintain minimum 48px touch targets.
- **Adaptive Typography:** Utilizes fluid viewport-scaled headers (`clamp(2rem, 5vw, 4.5rem)`).
- **Sticky Conversion Bar:** A fixed bottom conversion bar on mobile devices ensures that "Book Trial" and "WhatsApp" are permanently accessible.
- **Data Table Responsiveness:** Admin CRM tables implement horizontal overflow wrapping with fixed action columns for mobile screens.

---

## 20. CLIENT HANDOVER DELIVERABLES CHECKLIST

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT ASSET HANDOVER CHECKLIST                           │
├──────────────────────────────────────────────────────────────┬─────────────────────────┤
│ 1. Production Website & Domain Configuration                 │ DELIVERED ✅            │
│ 2. Administrative Dashboard & CMS Access                     │ DELIVERED ✅            │
│ 3. Administrator Credentials Transfer                        │ DELIVERED SECURELY ✅   │
│ 4. PostgreSQL Relational Database Cloud Instance             │ CONFIGURED & ACTIVE ✅  │
│ 5. Five (5) Google Business Profiles Configured              │ READY FOR VIDEO VERIF ✅│
│ 6. Dynamic XML Sitemaps & Search Console Configuration       │ CONFIGURED & READY ✅   │
│ 7. Full Application Source Code & Git Repository             │ DELIVERED ✅            │
│ 8. Editable Markdown Handover Documentation                  │ DELIVERED ✅            │
│ 9. Client-Ready Handover PDF Documentation                   │ DELIVERED ✅            │
│ 10. Database Backup Utility & Seed Scripts                   │ DELIVERED ✅            │
└──────────────────────────────────────────────────────────────┴─────────────────────────┘
```

> [!IMPORTANT]
> **Credential Security Notice:**  
> To protect academy cybersecurity, production database credentials, administrator passwords, and secret keys are **NOT** documented in this public document. All administrative credentials have been transmitted directly to Head Coach Sooraj via private, encrypted channels.

---

## 21. STEP-BY-STEP ADMINISTRATOR USER GUIDE

This user guide provides simple, numbered instructions for non-technical academy administrators:

### Guide 1: How to Log into the Admin Dashboard
1. Open your web browser and navigate to: `https://soorajbadmintonacademy.in/admin`
2. Enter your registered administrative email address (e.g., `admin@sabadminton.com`).
3. Enter your secure password and click **Sign In to Dashboard**.
4. You will be redirected to the Admin Overview dashboard.

### Guide 2: How to Manage Student Inquiries
1. Click **Student Inquiries** in the left sidebar.
2. Filter leads using the status pills at the top (`New`, `Contacted`, `Trial Booked`, `Enrolled`).
3. Click any student row to open the **Lead Drawer**.
4. To call the lead: Click the green **Call** button.
5. To chat via WhatsApp: Click the green **WhatsApp** button to open a pre-filled chat.
6. To update their progress: Click the status dropdown and select `Contacted` or `Trial Booked`.
7. Add internal notes (e.g., *"Trial confirmed for Wednesday 5 PM"*) and click **Save Notes**.

### Guide 3: How to Update Training Centres
1. Click **Centres & Hubs** in the sidebar.
2. Click **Edit Centre** on the venue you wish to modify.
3. Update court counts, operating hours, contact phone numbers, or Google Maps links.
4. Click **Save Changes** to immediately update the live website.

### Guide 4: How to Add or Edit Coaches
1. Click **Coaches & Staff** in the sidebar.
2. To edit an existing coach: Click **Edit Profile** on the coach's card.
3. To add a new coach: Click **Add New Coach** at the top right.
4. Enter the coach's name, role (e.g., *Assistant Coach*), certifications, and experience.
5. Upload a photo or select an existing court image, then click **Publish Coach**.

### Guide 5: How to Add Photos to the Gallery
1. Click **Photo Gallery** in the sidebar.
2. Click **Upload New Photo**.
3. Select an image from your computer or phone.
4. Enter a descriptive caption (e.g., *"Under-15 Junior Training Batch at Kadavanthra"*).
5. Select the category (`Training`, `Courts`, `Tournaments`) and click **Upload to Gallery**.

### Guide 6: How to Publish a Blog Article
1. Click **Blog Articles** in the sidebar.
2. Click **Create New Article**.
3. Enter an engaging Title (e.g., *"How to Choose the Right Badminton Racket for Beginners"*).
4. Enter a brief summary and write the article body.
5. Add relevant tags (e.g., `Beginners`, `Equipment`, `Footwork`) and click **Publish Article**.

### Guide 7: How to Log Tournament Achievements
1. Click **Track Record & Awards** in the sidebar.
2. Click **Add Achievement**.
3. Enter the tournament name, year, medal type (`Gold`, `Silver`, `Bronze`), and student name.
4. Click **Save Record** to display it on the live Trophy Wall.

### Guide 8: How to Manage Customer Reviews
1. Click **Reviews & Feedback** in the sidebar.
2. Review student and parent feedback submitted through the academy.
3. Edit any spelling errors or typos, set the star rating (1 to 5), and toggle **Approved**.
4. The review will automatically appear on the website's review carousel.

### Guide 9: How to Create a Tournament or Event
1. Click **Events & Tournaments** in the sidebar.
2. Click **Add Event**.
3. Enter the Tournament Name, Date, Venue, and Entry Fee.
4. Add the registration link or admissions WhatsApp contact.
5. Toggle **Publish** and click **Save Event**. The event will automatically appear on `/events` and update the dynamic tournaments sitemap.

### Guide 10: How to Change Your Administrator Password
1. Click the **Password** button at the bottom of the left sidebar.
2. Enter your current password.
3. Enter your new secure password (minimum 8 characters) and confirm it.
4. Click **Update Password**.

---

## 22. CONTENT MANAGEMENT & BRAND GUIDELINES

1. **Authentic Imagery:** Always upload sharp, genuine photographs of real academy players and courts. Avoid generic stock photos whenever possible.
2. **Consistent NAP Information:** Ensure that the Name, Address, and Phone number across every new article or page match Google Business Profile listings identically.
3. **E-E-A-T Quality Standard:** Never publish fabricated claims regarding court counts or state championship medals. If a coach's certification is pending, leave it blank until verified.
4. **Image Optimization:** Upload images in `.webp` or `.jpg` format, ideally under 1.5MB per photo.

---

## 23. SYSTEM BACKUP & MAINTENANCE SCHEDULE

### 23.1 Daily & Weekly Operations
- Check `/admin` daily for new student inquiries.
- Contact prospective parents within 15–30 minutes of inquiry submission for optimal conversion.
- Mark lead statuses appropriately to keep the CRM organized.

### 23.2 Monthly Tasks
- Review customer reviews and publish new parent testimonials.
- Post at least one new coaching article on `/blog` to sustain organic search momentum.
- Update tournament achievements with recent medal winners.

### 23.3 Technical Maintenance (Included Testing Window vs Ongoing Retainer)
- **Included 7-Day Testing, Review & Correction Period (07 October 2026 to 13 October 2026):** Active window covering functional verification, bug reporting, and agreed scope corrections for delivered website components. The final date for submitting included correction requests is **13 October 2026**.
- **Optional Ongoing Service Retainer (₹8,000/month):** Covers continuous local SEO monitoring, monthly keyword tracking, database backups, dependency upgrades, and ongoing content updates after 13 October 2026.

---

## 24. KNOWN LIMITATIONS & PENDING CLIENT ACTIONS

1. **Google Business Profile Video Verification:** Pending on-site live video recordings from Coach Sooraj or venue managers. Public visibility will activate once Google approves the videos.
2. **Authentic Photography:** Stock court imagery is currently deployed as a polished baseline until high-resolution facility photos are provided by the client.
3. **Assistant Coach Certificates:** Formal certification documents for assistant trainers remain pending client verification.

---

## 25. STRATEGIC FUTURE ROADMAP

Recommended enhancements for future platform phases:

1. **Integrated Fee Payments:** Direct online UPI and card payment gateway (e.g., Razorpay) for automated monthly fee collection.
2. **Parent & Student Mobile Portal:** Dedicated login for parents to track attendance, skill assessments, and invoices.
3. **Attendance Scanner:** On-court tablet QR-code scanner for check-ins.
4. **Official Meta WhatsApp Cloud API:** Automated instant confirmation messages sent via WhatsApp when an inquiry is logged.
5. **Native iOS & Android App Release:** Distribution of the prepared Flutter/iOS administrative app on the Apple App Store and Google Play Store.

---

## 26. FINAL PROJECT COMPONENT STATUS

| Component | Status | Operational Readiness |
| :--- | :---: | :--- |
| **Public Website** | **COMPLETED** | Fully operational on Next.js 16 App Router |
| **Responsive Design** | **COMPLETED** | Tested on desktop, tablet, and mobile devices |
| **Admin Dashboard** | **COMPLETED** | Fully functional with 11 operational modules |
| **Authentication & RBAC** | **COMPLETED** | Secure scrypt hashing and JWT sessions |
| **Student Inquiries CRM** | **COMPLETED** | Real-time lead capture, drawer, and notes |
| **Centres Management** | **COMPLETED** | Full CRUD for 5 physical training venues |
| **Gallery Management** | **COMPLETED** | Direct image upload and categorization |
| **Articles / Blog** | **COMPLETED** | Dynamic articles with SEO metadata |
| **Coaches Management** | **COMPLETED** | Verified coach profiles with photos and bios |
| **Track Records CMS** | **COMPLETED** | Tournament achievements and medals display |
| **Reviews Management** | **COMPLETED** | Customer feedback moderation |
| **WhatsApp Integration** | **COMPLETED** | Multi-tier click-to-chat with pre-filled forms |
| **Local SEO Implementation** | **COMPLETED** | On-page schemas, canonicals, and local keywords |
| **Dynamic XML Sitemaps** | **COMPLETED** | Main and tournament sitemaps active |
| **Google Business Profiles** | **CONFIGURED** | 5 branches created; pending live video step |
| **Production Deployment** | **COMPLETED** | Live at [https://soorajbadmintonacademy.in/](https://soorajbadmintonacademy.in/) |

---

## 27. 7-DAY TESTING, REVIEW & CORRECTION PERIOD

| Parameter | Specification & Milestone Date |
| :--- | :--- |
| **Project Handover Date** | **07 October 2026** |
| **Testing & Review Period** | **07 October 2026 to 13 October 2026** |
| **Final Date for Reporting Included Corrections** | **13 October 2026** |
| **Handover Status** | **Project handed over for client testing and review** |

### 27.1 Included Testing, Review & Correction Terms
1. **Handover Inception:** The project is officially handed over on **07 October 2026**.
2. **7-Day Testing Window:** The client has an active 7-day testing and review period commencing on **07 October 2026** and concluding on **13 October 2026**.
3. **Scope of Permitted Testing:** During this designated window, the client may test all delivered website features and report functional issues, errors, bugs, or corrections directly related to the agreed project scope (`SAA-WEB-SEO-2026-001`).
4. **Agreed Corrections:** Agreed corrections and reasonable edits related to the original project scope will be addressed during this 7-day window.
5. **Communication Deadline:** All testing feedback, bug reports, and correction requests must be formally submitted within the 7-day period. The final date for submitting testing/correction requests is **13 October 2026**.

### 27.2 Boundary Conditions, Exclusions & Post-Period Requests
1. **Strict Final Cutoff:** The included testing, review, and correction window strictly concludes at the end of **13 October 2026**.
2. **Post-Period Work Policy:** Any requests submitted after **13 October 2026** are outside the included 7-day testing/review window and may be treated as additional work or a separate change request, subject to mutual agreement (or handled under the optional ongoing service retainer).
3. **Out-of-Scope Exclusions:** New features, new modules, major architectural/visual redesigns, additional functional scope, or third-party integrations outside the contracted scope are not considered part of the 7-day correction period.
4. **Defined Purpose:** The 7-day period is designated exclusively for functional verification, testing, bug reporting, and agreed scope corrections—not unlimited redesign or new feature development.

---

## 28. FINAL HANDOVER & DELIVERY DECLARATION

I hereby declare that the **Sooraj Badminton Academy Website, CRM & Local SEO** project (`SAA-WEB-SEO-2026-001`) has been completed in accordance with the agreed technical specifications and delivered on **07 October 2026** for formal client testing and review during the designated 7-day window (**07 October 2026 to 13 October 2026**).

All delivered frontend pages, dynamic routes, administrative modules, database schemas, and SEO configurations have been inspected, tested, and verified in the live production environment.

**Handed Over By:**  
**Mohammed Nibrasul Haqq**  
Freelance Full-Stack Developer · UI/UX Designer · Kreovate Marketing Agency  
Handover Date: 07 October 2026 · Kochi, Kerala

**Received & Acknowledged For:**  
**Head Coach Sooraj M S**  
Founder & Head Coach · Sooraj Badminton Academy (SBA)  
Handover Status: Project handed over for client testing and review  
Testing & Review Period: 07 October 2026 – 13 October 2026 (Final Date for Reporting Included Corrections: 13 October 2026)

---

## APPENDIX A: PRODUCTION & PREVIEW URLS
- **Production Website:** [https://soorajbadmintonacademy.in/](https://soorajbadmintonacademy.in/)
- **Alternative URL:** [https://www.soorajbadmintonacademy.in/](https://www.soorajbadmintonacademy.in/)
- **GitHub Repository:** [https://github.com/SBAacademy/badmintonacademy.git](https://github.com/SBAacademy/badmintonacademy.git)

## APPENDIX B: ADMINISTRATIVE ROUTES
- `/admin` — Protected Operations Dashboard
- `/admin/login` — Administrator Secure Sign-in Portal

## APPENDIX C: SEO & SITEMAP ENDPOINTS
- `/sitemap.xml` — Primary Dynamic XML Sitemap
- `/tournaments-sitemap.xml` — Dedicated Tournaments & Fixtures Sitemap
- `/robots.txt` — Search Crawler Directives

## APPENDIX D: BACKEND API ENDPOINTS CATALOG
- `POST /api/enquiries` — Public free trial form submission and lead creation
- `GET /api/enquiries` — Retrieve leads with search and filter parameters (Protected)
- `PATCH /api/enquiries` — Update lead status and internal CRM commentary (Protected)
- `DELETE /api/enquiries` — Delete lead record (Protected)
- `GET /api/centres` — Fetch active physical training centres
- `POST /api/upload` — Direct binary image upload to relational storage (Protected)
- `GET /api/images/[id]` — Serve uploaded images with immutable cache headers
- `POST /api/admin/auth/login` — Administrator authentication and cookie issuance
- `POST /api/admin/auth/logout` — Invalidate session and clear authentication cookies
- `GET /api/admin/auth/me` — Verify current session status and role
- `POST /api/admin/auth/change-password` — Update administrator password

## APPENDIX E: DATABASE MODELS CATALOG
- `users`, `refresh_tokens`, `centres`, `programs`, `coaches`, `coach_photos`, `parents`, `students`, `leads`, `lead_notes`, `free_trials`, `batches`, `batch_students`, `sessions`, `attendance`, `fee_invoices`, `payments`, `payment_allocations`, `performance_assessments`, `announcements`, `notifications`, `audit_logs`, `events`, `uploaded_images`, `site_content`.

## APPENDIX F: REPOSITORY DIRECTORY TREE
```
S-A-BADMINTON-ACADEMY/
├── app/                      # Next.js 16 App Router pages & API handlers
├── components/               # UI components, layout, admin, forms, seo
├── data/                     # Academy static seeds and JSON fallbacks
├── documentation/            # Technical audits, reports, and specifications
├── lib/                      # Core libraries (db, auth, seo, whatsapp, contentDb)
├── public/                   # Static assets, logos, and photography
├── s_a_admin/                # Multi-platform Flutter admin application
├── s_a_admin_ios/            # Native iOS SwiftUI admin application
├── scripts/                  # Migration, backup, QA, and PDF generator scripts
├── SBA_HANDOVER_ASSETS/      # High-resolution screenshots and preview assets
└── package.json              # Project dependencies and operational scripts
```

## APPENDIX G: PRODUCTION BUILD & DEPLOYMENT REFERENCE
```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Compile production bundle
npm run build

# Start production server
npm run start
```
