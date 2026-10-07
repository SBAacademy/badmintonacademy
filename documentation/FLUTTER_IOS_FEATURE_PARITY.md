# Flutter ↔ Native iOS Feature Parity Matrix

This document provides a comprehensive feature comparison between the reference Flutter application (`s_a_admin/`) and the Native iOS application (`s_a_admin_ios/`).

| Operational Module | Flutter Admin (`s_a_admin/`) | Native iOS (`s_a_admin_ios/`) | Backend API Route | Parity Status | Notes |
| :--- | :---: | :---: | :--- | :---: | :--- |
| **Authentication** | ✓ | ✓ | `/api/admin/auth/login` | **Complete (100%)** | Email + Password, Show/Hide password, Keychain storage, automatic 401 refresh token rotation. |
| **Biometric Login** | ✓ | ✓ | N/A (Local Security) | **Complete (100%)** | Face ID / Touch ID re-entry with standard password fallback. |
| **Today Dashboard** | ✓ | ✓ | `/api/admin/sessions/today`<br>`/api/admin/reports/summary` | **Complete (100%)** | Court sessions, pending attendance, quick action buttons, live financial metrics. |
| **Leads CRM** | ✓ | ✓ | `/api/admin/leads` | **Complete (100%)** | Full lifecycle: NEW, CONTACTED, TRIAL_SCHEDULED, TRIAL_ATTENDED, CONVERTED, LOST. |
| **Lead Actions** | ✓ | ✓ | `/api/admin/leads/[id]` | **Complete (100%)** | Native `tel://` call and `https://wa.me/` WhatsApp deep links. |
| **Free Trials** | ✓ | ✓ | `/api/admin/trials` | **Complete (100%)** | Date/Time picker scheduling, coach assignment, attendance recording. |
| **Student Roster** | ✓ | ✓ | `/api/admin/students` | **Complete (100%)** | Search, filter by centre/status, parent contacts, payment & attendance histories. |
| **Student Conversion**| ✓ | ✓ | `/api/admin/students/convert-lead` | **Complete (100%)** | Atomic server-side conversion transaction (Lead $\to$ Parent $\to$ Student $\to$ Invoice). |
| **Schedule & Timetable**| ✓ | ✓ | `/api/admin/sessions`<br>`/api/admin/batches` | **Complete (100%)** | Daily court sessions, batch cohorts, capacity indicators (e.g. 14 / 16). |
| **Attendance Marking**| ✓ | ✓ | `/api/admin/attendance` | **Complete (100%)** | Fast one-tap PRESENT / ABSENT / LATE / EXCUSED, "Mark All Present", haptics. |
| **Offline Attendance**| ✓ (Hive/SQLite) | ✓ (SwiftData) | `/api/admin/attendance` | **Complete (100%)** | Local persistence, operation IDs, auto-sync when network returns, retry count. |
| **Invoices & Finance**| ✓ | ✓ | `/api/admin/invoices`<br>`/api/admin/payments` | **Complete (100%)** | Server-authoritative balances, record partial/full payments, WhatsApp reminders. |
| **Coaches Directory** | ✓ | ✓ | `/api/admin/coaches` | **Complete (100%)** | Verified coaching staff list, experience, certifications, direct call/email. |
| **Centres Directory** | ✓ | ✓ | `/api/admin/centres` | **Complete (100%)** | Verified 5 canonical centres: Kadavanthra, Kumbalanghi, Maradu, Palluruthy, Chullikal. |
| **Training Programs** | ✓ | ✓ | `/api/admin/programs` | **Complete (100%)** | Age ranges, coach-student ratios, skill levels, descriptions. |
| **Athlete Performance**| ✓ | ✓ | `/api/admin/performance` | **Complete (100%)** | 5-rubric evaluation (Footwork, Technique, Fitness, Tactical, Consistency). |
| **Reports & Analytics**| ✓ | ✓ | `/api/admin/reports/summary` | **Complete (100%)** | Admissions funnel, conversion rates, attendance discipline %, revenue totals. |
| **CMS Management** | ✓ | ✓ | `/api/admin/cms/[section]` | **Complete (100%)** | Testimonials, achievements, announcements, blog posts synced with website. |
| **Push Notifications** | ✓ | ✓ | `/api/admin/notifications` | **Complete (100%)** | In-app alerts, unread indicators, Apple UserNotifications framework. |
| **Global Search** | ✓ | ✓ | `/api/admin/search` | **Complete (100%)** | Debounced cross-entity search across Leads, Students, Parents, Batches, Invoices. |
| **Audit Logs** | ✓ | ✓ | `/api/admin/audit` | **Complete (100%)** | Immutable server-side mutation history viewable by authorized administrators. |
| **Role-Based UI** | ✓ | ✓ | Server RBAC Matrix | **Complete (100%)** | Dynamic module visibility based on `SUPER_ADMIN`, `ADMIN`, `COACH`, `FRONT_DESK`, `CONTENT_MANAGER`. |
| **Adaptive Layout** | ✓ | ✓ | iOS Size Classes | **Complete (100%)** | iPhone 5-tab bar (`Today`, `Leads`, `Students`, `Schedule`, `More`) + iPad `NavigationSplitView`. |

---

## Technical Differences & iOS Optimizations

1. **Framework Native**: The iOS application utilizes 100% native Apple frameworks (`SwiftUI`, `SwiftData`, `Security`, `LocalAuthentication`, `UserNotifications`, `Network`, `OSLog`) with **zero external CocoaPods or third-party dependencies**.
2. **Offline Store**: Flutter uses Hive/SQLite; Native iOS uses **SwiftData** with `@Model` schemas and automatic migration management.
3. **Keychain**: Flutter uses `flutter_secure_storage`; Native iOS uses Apple's native **C Security API** (`SecItemAdd`, `SecItemCopyMatching`, `SecItemDelete`) with hardware encryption.
4. **Haptics**: Native iOS integrates `UIImpactFeedbackGenerator` directly into attendance marking workflows for instantaneous tactile feedback.
