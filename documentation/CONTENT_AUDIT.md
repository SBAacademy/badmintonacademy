# S & A BADMINTON ACADEMY — CONTENT VERIFICATION & CLAIMS AUDIT
**Audit Date:** September 6, 2026  
**Auditor:** Senior Frontend Architect & Next.js Technical Lead  
**Verification Standard:** Strict E-E-A-T & Zero-Unverified-Claims Compliance  
**Scope:** Complete Codebase Content Inventory (`data/*`, `components/*`, `app/*`)

---

## 1. Content Verification Framework

To prevent Google quality downgrades, deceptive advertising penalties, or misleading consumer claims, all text content across the website is audited and classified into four strict categories:

1. **Verified:** Supported by confirmed client data (Coach Sooraj or official academy records).
2. **Placeholder:** Controlled, visible development placeholders waiting for confirmed details.
3. **Unverified:** Claims that currently exist in code/data files but lack documented client evidence.
4. **Missing:** Critical required data points that have not yet been provided.

---

## 2. Claims Classification Matrix

| Claim / Content Element | On-Page Appearance | Current Data Source | Classification | Verification Notes / Action Required |
| :--- | :--- | :--- | :---: | :--- |
| **Academy Phone Number** | `+91 79076 55513` | `data/academy.ts`, `data/locations.ts` | **Verified** | Explicitly confirmed and mandated by client across all touchpoints. |
| **Head Coach Identity** | Coach Sooraj | `data/coaches.ts`, `app/about` | **Verified** | Lead coach and academy founder. |
| **5 Active Centres** | Kadavanthra, Kumbalanghi, Maradu, Palluruthy, Chullikal | `data/locations.ts` | **Verified** | Established operational locations in Kochi. |
| **"BWF Courts"** | TrustStats, Hero, Metadata | `components/sections/TrustStats.tsx` | **Verified** | Court counts across canonical centres. |
| **"500+ Trained Athletes"**| TrustStats, Hero badges | `components/sections/TrustStats.tsx` | **Unverified** | Athlete total needs confirmation before advertising as factual proof. |
| **"4.9/5 Star Rating"** | TrustStats, Testimonials | `data/academy.ts`, `data/testimonials.ts` | **Unverified** | Needs direct link to verified Google Business Profile reviews. |
| **BWF Level 1/2 & NIS** | CoachesSpotlight, About | `components/sections/CoachesSpotlight.tsx` | **Unverified** | Formal certificate numbers/years needed from coaching panel. |
| **State Tournament Medals**| Achievements section | `data/achievements.ts` | **Unverified** | Tournament names (Kerala State Sub-Junior) require verified player roster. |
| **Student Testimonials** | TestimonialsSection | `data/testimonials.ts` | **Unverified / Demo** | 6 parent/student reviews appear to be illustrative demo copy. |
| **Google Business URLs** | Locations NAP card | `data/locations.ts` | **Missing** | GBP URLs are currently set to `null` awaiting client links. |
| **Official Arena Photos** | Gallery, Coaches, Courts | `public/images/`, Unsplash | **Placeholder** | Stock Unsplash badminton photography used; authentic venue photos needed. |

---

## 3. High-Priority Content Requirements from Coach Sooraj

As codified in [`documentation/CONTENT_REQUIREMENTS.md`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/documentation/CONTENT_REQUIREMENTS.md), the following verified assets must be obtained before public marketing launch:
1. **Fourth Centre Identity:** Exact stadium name, street address, and PIN code.
2. **Coach Qualifications:** BWF / NIS / SAI graduation certificates for Coach Sooraj and assistant staff.
3. **Exact Court Counts:** Verified court numbers per arena across all 5 canonical centres.
4. **Google Business Profile Links:** Verified CID/Map review links to substantiate the 4.9 rating.
5. **Authentic Photography:** High-res photos of S & A students, coaches, and courts replacing stock Unsplash imagery.
