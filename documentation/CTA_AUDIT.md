# S & A BADMINTON ACADEMY — CONVERSION FUNNEL & CTA AUDIT
**Audit Date:** September 6, 2026  
**Auditor:** Senior Frontend Architect & Next.js Technical Lead  
**Scope:** Trial Bookings, WhatsApp Integration, Direct Dialing, API Submission, Lead Attribution, and Analytics Event Dispatches  
**Status:** 100% Code-Verified

---

## 1. Master Conversion Points & Funnel Architecture

The website incorporates 5 primary conversion pathways designed for maximum conversion rate on mobile and desktop:

```
                  VISITOR ENTRY POINT
                           │
      ┌────────────────────┼────────────────────┐
      ▼                    ▼                    ▼
[BOOK FREE TRIAL]    [WHATSAPP US]       [CALL DESK]
      │                    │                    │
Opens Modal/Form    Opens Contextual    Initiates tel:
(EnquiryForm.tsx)   WhatsApp URL        +919400635548
      │             (lib/whatsapp.ts)           │
      ▼                    │                    ▼
POST /api/enquiries        ▼             Coach Sooraj Desk
      │             Chat Direct with
      ▼             Admissions Coach
Success State +
Instant WhatsApp Handover
```

---

## 2. Deep Component Audit

### 1. WhatsApp Integration Engine ([`lib/whatsapp.ts`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/lib/whatsapp.ts))
* **Phone Number:** `+91 94006 35548` (Normalized clean standard `919400635548`).
* **Contextual Pre-filled Copy:**
  - *General:* `"Hello S & A Badminton Academy, I would like to enquire about coaching batches in Kochi."`
  - *Location-Specific:* `"Hello S & A Badminton Academy, I am interested in coaching at your Kadavanthra centre."`
  - *Program-Specific:* `"Hello S & A Badminton Academy, I would like to enquire about the Kids Foundation Coaching program."`
* **Verification:** Zero broken link syntax; uses standard `encodeURIComponent`.

### 2. Admissions API Route ([`app/api/enquiries/route.ts`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/app/api/enquiries/route.ts))
* **Spam Prevention:** Implements honeypot validation (`data.botAddress`). If filled by automated spambots, returns HTTP 200 quietly without persisting spam.
* **Validation:** Enforces mandatory `name` and minimum 10-digit clean phone string. Returns HTTP 400 with actionable error messaging if invalid.
* **Attribution:** Captures `preferredBranch`, `preferredProgram`, `preferredSlot`, `utm_source`, `utm_medium`, and `submittedAt`.
* **Lead ID:** Generates structured enquiry tokens: `ENQ-[timestamp]`.

### 3. Interactive Lead Form ([`components/forms/EnquiryForm.tsx`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/components/forms/EnquiryForm.tsx))
* **State & Handling:** Fully controlled React form with client validation and loading spinners.
* **Post-Submission State:** Displays immediate confirmation card with an instant *"Connect on WhatsApp Now"* button pre-filled with the student's name and preferred branch.

---

## 3. Analytics & Event Dispatch Audit ([`lib/analytics.ts`](file:///Users/mohammednibrasulhaqq/Documents/Web/S-A-BADMINTON-ACADEMY/lib/analytics.ts))

### Verified Event Definitions
```ts
export type AnalyticsEvent = 
  | "whatsapp_click"
  | "phone_click"
  | "generate_lead"
  | "trial_booked"
  | "branch_view"
  | "program_enquiry"
  | "gallery_view"
  | "map_directions_click";
```

### Dispatch Mechanism
* Verified in lines 12–29:
  - Dispatches to Google Analytics 4 (`gtag("event", eventName, params)`) if initialized.
  - Pushes to Google Tag Manager dataLayer (`window.dataLayer.push`).
  - Logs formatted debug events in development mode (`process.env.NODE_ENV === "development"`).
* **Gap Identified:** Currently, Google Tag Manager script tag is not yet mounted in `app/layout.tsx`. GTM ID needs to be injected in Phase 2 once provided by the client.
