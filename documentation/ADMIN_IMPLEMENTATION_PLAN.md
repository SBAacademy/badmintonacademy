# S&A Badminton Academy Management Platform
## Master Implementation Roadmap & Gated Milestones

**Document Version:** 1.0  
**Specification Date:** September 7, 2026  
**Status:** In Execution  

---

## 1. Execution Sequence by Gate

### Gate 0: Architecture & System Documentation (COMPLETED)
- `ADMIN_PLATFORM_CURRENT_STATE.md` (Verified 22-section audit)
- `ADMIN_PLATFORM_REQUIREMENTS.md` (24 operational modules)
- `ADMIN_PERMISSION_MATRIX.md` (RBAC roles and server-side rules)
- `ADMIN_DATABASE_ARCHITECTURE.md` (Relational DDL, constraints, session attendance, ledger)
- `ADMIN_API_ARCHITECTURE.md` (Endpoints, request/response contracts)
- `WEBSITE_CMS_MIGRATION_PLAN.md` (Coexistence matrix)
- `ADMIN_SECURITY.md` (Platform Keychain storage, token rotation, audit)
- `ADMIN_TEST_PLAN.md` (Acceptance criteria)

### Gate 1: Database Backup, Non-Destructive Migrations & Canonical Seeding
- Pre-flight automated backup of existing `leads` (5 rows), `site_content`, `uploaded_images`.
- Non-destructive execution of PostgreSQL DDL on Neon Serverless.
- Canonical seeding of Centres (Kadavanthra, Kumbalanghi, Maradu, Palluruthy, Chullikal), Programs (Kids, Junior, Adult, Competitive, Camp), and Verified Coaches (Anand, Shalini, Rohan, Karthik).
- Bootstrap initial Super Admin account with secure password hash.
- Verification script asserting table counts and zero loss of existing records.

### Gate 2: Authentication, Token Rotation, RBAC & Audit Logging
- Implement `lib/auth.ts` with password hashing, JWT access token, and rotating refresh tokens.
- Implement `/api/admin/auth/login`, `/api/admin/auth/refresh`, `/api/admin/auth/logout`, `/api/admin/auth/me`.
- Implement `lib/audit.ts` structured audit logger.
- Test authentication and role rejection suite.

### Gate 3: Leads CRM & Free Trial Lifecycles
- Implement `/api/admin/leads` and `/api/admin/trials`.
- Update `/api/enquiries` to write directly to upgraded `leads` schema and notify staff.
- Test lead advancement and trial booking.

### Gate 4: Parents & Students Master Records
- Implement `/api/admin/parents` and `/api/admin/students`.
- Implement atomic conversion from lead to student with parent link.
- Test student roster queries and multi-sibling parent linking.

### Gate 5: Batches, Sessions & Attendance Engine
- Implement `/api/admin/batches`, `/api/admin/sessions/today`, `/api/admin/attendance`.
- Test session timetable generation and `UNIQUE(session_id, student_id)` duplicate attendance rejection.

### Gate 6: Financial Engine (Invoices, Payments & Allocations)
- Implement `/api/admin/invoices`, `/api/admin/payments`, `/api/admin/payments/reminders`.
- Test partial payment allocation and balance calculations.

### Gate 7: Coaches, Athlete Performance, Reports & CMS Gateway
- Implement `/api/admin/coaches`, `/api/admin/performance`, `/api/admin/reports/summary`.
- Implement `/api/admin/cms/[section]` connecting dynamic website content.

### Gate 8: Flutter Academy Operations Application (`s_a_admin/`)
- Initialize Flutter 3.44 app in `s_a_admin/`.
- Setup Riverpod, GoRouter, Dio, Flutter Secure Storage.
- Build "Rebel Admin" design system (Pitch Black `#07090D`, Acid Lime `#B8F000`, Dark Cards `#12161F`).
- Implement core daily operations:
  - **TODAY Dashboard** (Today's Sessions $\to$ 1-tap Attendance, Today's Trials, New Leads, Overdue Fees)
  - **Leads & Trial CRM**
  - **Student Master Roster**
  - **Session Attendance with Offline Sync Queue**
  - **Financial Invoicing & Payment Logging**
  - **Settings & Audit Log Viewer**
- Run `flutter analyze` and `flutter test`.

### Gate 9: Website Regression, End-to-End Verification & Final Report
- Run `npm run build` on Next.js website to verify zero regressions.
- Test round-trip web enquiry to Flutter app notification.
- Generate `documentation/ADMIN_IMPLEMENTATION_REPORT.md`.
