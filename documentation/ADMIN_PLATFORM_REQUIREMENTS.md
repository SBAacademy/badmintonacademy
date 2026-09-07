# S&A Badminton Academy Management Platform
## Complete Product & Operational Requirements Specification

**Document Version:** 1.0  
**Specification Date:** September 7, 2026  
**Status:** Approved for Implementation  
**Audience:** Core Engineering, Operations Staff, Head Coaches, Admissions Team  

---

## 1. Operational Dashboard ("TODAY")

The primary landing experience for academy staff must be an action-oriented operational cockpit, not an abstract analytics page. When staff open the application at 7:00 AM, it must answer:

- **What sessions are taking place today across Kadavanthra, Edappally, and Kakkanad?**
- **Which students are expected, and who hasn't been marked yet?**
- **Which prospective athletes have free trials scheduled today?**
- **Which newly submitted website leads require an immediate call?**
- **Which student fee payments are overdue?**

### Core Dashboard Components:
1. **Today's Training Schedule:** Chronological card list of sessions grouped by centre with a 1-tap "Mark Attendance" button.
2. **Action Alerts Banner:** High-priority counters for:
   - Inbound Leads (`status = NEW`)
   - Free Trials Today (`status = CONFIRMED`)
   - Overdue Payment Invoices
3. **Quick Action Hub:**
   - `+ New Lead / Walk-in`
   - `+ Schedule Free Trial`
   - `+ Enroll Student`
   - `+ Record Payment`
   - `+ Mark Session Attendance`

---

## 2. Lead & Enquiry CRM

A complete lifecycle tracking prospective athletes from initial website form submission or phone enquiry to verified enrollment.

### Lead Status State Machine:
```
[ NEW ] ──> [ CONTACTED ] ──> [ FOLLOW_UP ] ──> [ TRIAL_BOOKED ] ──> [ TRIAL_ATTENDED ] ──> [ CONVERTED ]
   │              │                 │                 │                    │
   └───> [ NOT_INTERESTED ] <───────┴─────────────────┴────────────────────┴───> [ LOST ]
```

### Lead Attributes:
- Lead ID (e.g., `LEAD-1725700000`)
- Student Name & Age Category (Kids 5–9, Junior 10–16, Adult 16+, Competitive)
- Parent/Guardian Name, Phone (10+ digits cleaned), Email
- Preferred Centre (`kadavanthra`, `edappally`, `kakkanad`)
- Preferred Program & Preferred Slot (Morning / Evening)
- Source (`website`, `walk-in`, `phone`, `referral`)
- UTM Parameters (`utm_source`, `utm_medium`, `utm_campaign`)
- Assigned Staff Member
- Follow-up Due Date & Priority
- Internal Activity & Notes Timeline

---

## 3. Free Trial Management

Structured trial booking and court evaluation workflow.

### Trial Attributes:
- Trial ID
- Lead ID / Student Name
- Assigned Centre & Preferred Court Time
- Assigned Evaluating Coach
- Status: `PENDING`, `CONFIRMED`, `RESCHEDULED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`, `CONVERTED`
- Coach Evaluation Notes (agility, grip, stamina, recommended batch)
- Automated Actions: 1-tap WhatsApp reminder to parent, 1-tap convert to enrolled student.

---

## 4. Student Management

The student record is the central operational entity of the academy.

### Student Profile Requirements:
- Student ID (e.g., `STU-2026-001`)
- Personal Info: Full Name, Date of Birth, Gender, Blood Group, Medical/Injury Notes
- Parent / Guardian Relationship link (Foreign Key to `parents`)
- Primary Centre & Primary Program
- Active Batch Affiliations (Foreign Key to `batches`)
- Status: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `TRANSFERRED`, `COMPLETED`
- Joining Date & Emergency Contact
- Full Activity Timeline:
  - Attendance History & %
  - Fee Invoices & Payment Ledger
  - Skill Assessments & Coach Notes
  - Trial & Conversion Origin

---

## 5. Parent & Family Management

Supports realistic family relationships where one parent manages multiple siblings enrolled in different programs.

```
Parent / Guardian Record (Phone, Email, Billing Address)
  ├── Student 1 (Junior Development — Kadavanthra)
  └── Student 2 (Kids Foundation — Kadavanthra)
```

- Prevents contact and billing data duplication.
- Centralizes invoices and communication across family members.

---

## 6. Centre Management

Strictly limited to the 3 verified canonical facilities:
1. **Kadavanthra Centre** (Headquarters, Rajiv Gandhi Stadium Area — 4 Courts)
2. **Edappally Centre** (Toll Junction Arena — 3 Courts)
3. **Kakkanad Centre** (Infopark Expressway Arena — 3 Courts)

*Note: The placeholder `"fourth-centre"` is strictly excluded from operational assignments.*

### Attributes:
- Centre Name, Slug, Short Name, Physical Address, Geolocation (Lat/Lng)
- Phone, WhatsApp, Support Email, Google Maps URL
- Operating Hours (Morning & Evening sessions)
- Court Surface Specifications (Wooden cushion + synthetic BWF mat)
- Active Facilities (Showers, Locker Room, Parent Viewing Gallery, Parking)
- Assigned Head Coach & Staff

---

## 7. Program Management

Supports the 5 verified training tracks:
1. **Kids Foundation Program** (Ages 5–9)
2. **Junior Development Program** (Ages 10–16)
3. **Adult Fitness & Skills Program** (Ages 16+)
4. **Competitive & Tournament Elite** (Selected athletes)
5. **Summer Badminton Camp** (Seasonal)

### Attributes:
- Slug, Name, Short Name, Target Age Range, Skill Level, Duration
- Coach-to-Student Ratio (e.g., 1:6, 1:8)
- Monthly Fee Baseline, Curriculum Highlights, Status (`ACTIVE` / `INACTIVE`)

---

## 8. Batch Management

Manages physical court capacity and scheduled training cohorts.

### Batch Attributes:
- Batch Name (e.g., "Kadavanthra Junior Evening A")
- Centre ID, Program ID, Assigned Coach ID
- Days of the Week (e.g., `["MON", "WED", "FRI"]`)
- Start Time & End Time (e.g., `16:30` – `18:00`)
- Court Capacity (e.g., 12 students max)
- Current Enrolled Count & Waitlist
- Status (`ACTIVE`, `PAUSED`, `ARCHIVED`)
- Enrolled Student Roster with add/remove/transfer actions.

---

## 9. Timetable & Schedule Engine

Visual operational schedule filterable by:
- **Day View:** All centres or specific centre.
- **Weekly Matrix:** Time slots vs days.
- **Coach View:** Showing individual coach training commitments.

---

## 10. Session-Based Attendance

Attendance must be tied directly to a concrete **Session** instance.

```
Batch ("Junior Evening A") ──> Session (Date: 2026-09-08, 16:30) ──> Attendance Records
                                                                    ├── Student 1: PRESENT
                                                                    ├── Student 2: LATE
                                                                    └── Student 3: ABSENT
```

### Constraints & Integrity:
- Database-enforced `UNIQUE(session_id, student_id)` constraint to eliminate duplicate attendance records.
- Statuses: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`.
- Stores `marked_by_user_id`, `timestamp`, and optional `coach_note`.
- Supports offline queue in mobile/desktop client with auto-sync on reconnect.

---

## 11. Coach Management

Manages verified academy trainers without fabricated credentials.

### Active Verified Coaching Staff:
1. **Coach Anand Varma:** Head Coach & Technical Director (BWF Level 2, NIS Diploma, Kadavanthra)
2. **Coach Shalini Menon:** Senior Coach — Junior & Girls (BWF Level 1, Edappally)
3. **Coach Rohan Mathew:** Lead Coach — Doubles & Adults (BWF Level 1, CSCS, Kakkanad)
4. **Coach Karthik Nair:** Assistant Coach & Video Analyst (BWF Level 1, Dartfish Specialist)

### Attributes:
- Full Name, Role, Photo URL, Certifications Array, Experience Years, Bio
- Primary Centre, Contact Phone, Assigned Batches, Active Status.

---

## 12. Athlete Performance Management

A structured player development evaluation system based on sports science.

### Assessment Metrics (Score 1–10 + Coach Notes):
1. **Footwork & Agility:** 6-point corner recovery, split-step timing.
2. **Stroke Technique:** Grip transitions, overhead clear, net play, smash angle.
3. **Tactical Awareness:** Court positioning, shot selection, rally patience.
4. **Physical Fitness:** Aerobic stamina, core strength, recovery rate.
5. **Mental Discipline:** Composure under pressure, coachability, match focus.
- Historical progress chart viewable per student.

---

## 13. Financial Engine & Invoicing

Adheres to a professional three-tier accounting model:

```
[ Fee Invoice / Obligation ]  <─── Due: ₹3,500 for September 2026
          │
          │ Allocated by
          ▼
    [ Payment ]               <─── Parent pays ₹3,500 via UPI (Ref: 429184)
          │
          ▼
[ Payment Allocation ]        <─── ₹3,500 allocated to Invoice #INV-2026-09
```

- **Supports:** Partial payments (e.g. ₹2,000 paid, ₹1,500 balance), multiple payments for a single term, fee waivers, advance deposits.
- **Invoice Statuses:** `UNPAID`, `PARTIAL`, `PAID`, `OVERDUE`, `WAIVED`.
- **Payment Attributes:** Student ID, Amount, Date, Method (`UPI`, `BANK_TRANSFER`, `CASH`, `CARD`), Transaction Reference, Received By.
- **Security:** Never stores credit/debit card numbers.

---

## 14. Payment Reminders

- Filter students by `OVERDUE` or `DUE_THIS_WEEK`.
- 1-tap pre-formatted WhatsApp payment reminder generation.
- Audit log of reminder dispatch timestamps.

---

## 15. Website CMS Gateway

Allows authorized staff to manage public website content stored in Neon PostgreSQL:
- **Homepage Announcement Banners**
- **Coaches Roster**
- **Tournament Achievements**
- **Verified Testimonials**
- **Photo Gallery**
- **Educational Blog Articles**

---

## 16. Blog Manager

- Create, Edit, Draft, Schedule, Publish, Archive.
- Fields: Title, Slug, Excerpt, Content (Markdown/HTML), Cover Image, Author, Category, Tags, SEO Title, SEO Meta Description.
- Next.js SSR/SSG cache revalidation on publish.

---

## 17. Photo Gallery Manager

- Upload image files (JPG, PNG, WebP) via `/api/upload`.
- Categories: Training, Arenas, Tournaments, Coaching.
- Caption, Centre association, Display Order, Published toggle.

---

## 18. Testimonials Manager

- Manage verified parent and student reviews.
- Fields: Name, Role, Centre, Rating (1–5), Content Quote, Highlight Snippet, Status (`PUBLISHED` / `PENDING`).

---

## 19. Tournament Achievements

- Fields: Tournament Title, Year, Category (State, District, National, Academy), Athletes/Team, Result Badge, Description, Image.

---

## 20. Announcements & Banners

- Urgent website alert banners (e.g., "Admissions Open for Summer Camp 2026").
- Target audience, Start date, Expiration date, Active flag.

---

## 21. In-App Notifications

- High-priority operational alerts for staff:
  - `NEW_LEAD`: New enquiry submitted online.
  - `TRIAL_BOOKED`: Trial scheduled for today/tomorrow.
  - `PAYMENT_OVERDUE`: Student account 7+ days past due.
  - `ATTENDANCE_MISSING`: Session completed without attendance record.
- Read/unread state, timestamp, deep-link to relevant screen.

---

## 22. Operational Reports

Real database aggregations without fabricated statistics:
1. **Admissions Funnel:** Leads $\to$ Contacted $\to$ Trials Scheduled $\to$ Trials Attended $\to$ Enrolled.
2. **Attendance Rates:** Average attendance % per centre, per program, per coach.
3. **Revenue Ledger:** Monthly billed fees vs collected cash vs outstanding receivables.
4. **Capacity Utilization:** Active students vs court capacity across batches.

---

## 23. Global Search

Instant search across:
- Students (name, phone, student ID)
- Parents (name, phone, email)
- Leads (name, phone, enquiry ID)
- Batches & Coaches

---

## 24. Audit Logging & Compliance

Every critical administrative action is recorded:
- Actor User ID & Name
- Action Type (`CREATE`, `UPDATE`, `DELETE`, `STATUS_CHANGE`, `PAYMENT_LOGGED`)
- Target Entity & Entity ID
- Old Value & New Value JSON diff
- IP Address & Timestamp
- Immutable log table.
