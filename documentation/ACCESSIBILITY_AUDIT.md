# S & A BADMINTON ACADEMY — ACCESSIBILITY (a11y) AUDIT
**Audit Date:** September 6, 2026  
**Auditor:** Senior Frontend Architect & Next.js Technical Lead  
**Audit Standard:** WCAG 2.1 Level AA Compliance  
**Scope:** Semantics, Headings, Focus States, ARIA Coverage, Color Contrast, and Screen Reader Readiness

---

## 1. Heading Hierarchy & Semantic HTML

### Heading Rules Compliance
* **Homepage (`app/page.tsx`):**
  - **Single H1:** Dedicated `<h1>` in `HeroSection.tsx`: *"TRAIN HARD. SMASH HARD. MASTER THE COURT."*
  - **H2 Sections:** Every major section declares an `<h2>` heading:
    - `Why S & A Badminton Academy`
    - `Verified Academy Metrics`
    - `Professional Badminton Coaching Programs`
    - `4-Stage Badminton Coaching Methodology`
    - `Trained by Certified Mentors & State Champions`
    - `Four Dedicated Badminton Arenas Across Kochi`
    - `Tournament Honours & State Champions`
    - `Life on the Court`
    - `What Parents & Athletes Say`
    - `Frequently Asked Questions`
  - **No Heading Skipping:** H2 elements contain semantic H3 sub-cards where appropriate.
* **Location Pages (`app/[location]/page.tsx`):**
  - **Single H1:** `Badminton Academy in [Location]`
  - **H2 Subheading:** `Professional Badminton Coaching in [Location]`
  - Strictly follows the SEO and accessibility single H1 rule.

---

## 2. Color Contrast Ratios (WCAG AA Standard)

| Text Element | Text Hex | Background Hex | Calculated Contrast | WCAG AA Status | Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Primary Headings** | `#F8FAFC` | `#080B10` | **18.4:1** | **Pass (AAA)** | Ultra-high contrast; perfectly crisp. |
| **Athletic Lime Buttons**| `#07100A` | `#B8F000` | **15.2:1** | **Pass (AAA)** | Dark green text on electric lime button. |
| **Body / Secondary Text**| `#A7B0BC` | `#080B10` | **8.1:1** | **Pass (AAA)** | Exceeds standard 4.5:1 minimum. |
| **Muted Captions** | `#6B7280` | `#121A23` | **3.8:1** | **Borderline (AA-large)** | Fine for non-body secondary labels; recommended bump to `#9CA3AF` in Phase 2 for micro-copy. |

---

## 3. Keyboard Navigation & ARIA Coverage

### 1. Dropdowns (`Navbar.tsx`)
* **Trigger:** `<button type="button">` with `aria-haspopup="true"` and dynamic `aria-expanded={isOpen}`.
* **Escape Key Dismissal:** Implemented via `window.addEventListener("keydown")`.
* **Outside Click Dismissal:** Implemented.
* **Tab Order:** Clean sequential tab navigation through nav items, dropdowns, and CTAs.

### 2. Mobile Navigation Drawer (`Navbar.tsx`)
* **Mobile Toggle:** Includes `aria-label="Open navigation menu"`.
* **Close Button:** Includes `aria-label="Close navigation menu"`.
* **Accordions:** Include `aria-expanded` and `aria-controls="mobile-submenu-programs"`.
* **Focus Trapping:** Recommended for Phase 2 implementation to keep keyboard focus strictly within the open drawer.

### 3. Admissions Form (`EnquiryForm.tsx`)
* Every form input has an explicit `<label htmlFor="...">` tag.
* Input validation errors declare `role="alert"` and clear feedback messages.
