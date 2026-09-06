# S & A BADMINTON ACADEMY — DEFECT & BUG REGISTER
**Audit Date:** September 6, 2026  
**Auditor:** Senior Frontend Architect & Next.js Technical Lead  
**Scope:** Historical, Tested, and Current Defect Tracking  
**Current Status:** All Critical Navigation Defects Confirmed RESOLVED in Production Code

---

## 1. Defect Master Tracking Table

| Bug ID | Title | Severity | Affected Viewport | Current Status | Resolution Commit |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **BUG-001** | Desktop Dropdown Premature Closure on Cursor Transition | **HIGH** | Desktop (≥ 1024px) | **RESOLVED** | `571976a` |
| **BUG-002** | Mobile Drawer Programs & Centres Submenus Not Expanding on Tap | **CRITICAL** | Mobile (< 1024px) | **RESOLVED** | `4e7c4f0` |
| **BUG-003** | Console Warning: Missing `data-scroll-behavior="smooth"` on `<html>` | **LOW** | All Viewports | **RESOLVED** | Added `data-scroll-behavior="smooth"` to `app/layout.tsx` |
| **BUG-004** | GTM Container ID Missing from Root Layout | **LOW** | All Viewports | **ACTIVE** | Documented for Phase 2 |

---

## 2. Detailed Defect Reports

### BUG-001: Desktop Dropdown Premature Closure
* **Severity:** HIGH
* **Affected Environment:** Desktop Safari, Chrome, Edge (≥ 1024px).
* **Steps to Reproduce (Prior to Fix):**
  1. Hover over "Programs" or "Centres" in desktop navbar.
  2. Dropdown card appears.
  3. Move mouse cursor slowly downward from the word "Programs" toward "Kids Program".
* **Observed Defect:** Dropdown snapped shut before cursor reached the menu items.
* **Root Cause:** An 8px empty space existed between the button and dropdown due to `mt-2` margin. Crossing the empty space triggered `mouseleave` on the container.
* **Fix Verified in Code:** Removed `mt-2` and placed dropdown at `top-full pt-2` within the same hoverable positioning wrapper; added 180ms debounce buffer.
* **Status:** **RESOLVED** (Verified in commit `571976a`).

---

### BUG-002: Mobile Drawer Programs & Centres Accordions Inoperable
* **Severity:** CRITICAL
* **Affected Environment:** Mobile Safari (iOS), Mobile Chrome (Android) (< 1024px).
* **Steps to Reproduce (Prior to Fix):**
  1. Tap hamburger menu icon on mobile screen.
  2. Tap on the word "Programs" or "Centres".
* **Observed Defect:** The submenu did not expand. Instead, tapping the text triggered direct navigation to `/programs` or closed the menu, because only the tiny 16px chevron was an accordion toggle.
* **Root Cause:** Split-button layout where a `<Link>` took up 85% of the touch row and a separate `<button>` took up 15%. Desktop and mobile shared the same `openDropdown` state.
* **Fix Verified in Code:** Decoupled mobile state into `openMobileMenu`. Converted the entire row into a full-width 48px `<button type="button">`. Clicking expands the submenu smoothly in standard document flow.
* **Status:** **RESOLVED** (Verified in commit `4e7c4f0`).

---

### BUG-003: Next.js Scroll Behavior Warning
* **Severity:** LOW (Development Console Warning).
* **Status:** **RESOLVED**
* **Fix Applied:** Added `data-scroll-behavior="smooth"` to `<html lang="en" ...>` in `app/layout.tsx`. Suppressed hydration warnings and removed transition warnings.

---

### BUG-004: GTM Container Script Not Injected
* **Severity:** LOW (Non-blocking).
* **Observed Behavior:** `lib/analytics.ts` pushes events to `window.dataLayer`, but no Google Tag Manager container script is mounted in `app/layout.tsx`.
* **Recommended Fix:** Mount Next.js `<Script>` with client GTM ID once provided by client.
