# S&A Badminton Academy — Native iOS / Mobile App UI Redesign
## REBEL ADMIN — 16-Screen Production Implementation Specification

### 1. Executive Summary
The S&A Badminton Academy administration mobile application (`s_a_admin/`) has undergone a complete UI redesign matching the master reference **"S&A ADMIN APP — iPhone App UI Design (Modern • Professional • Built for Real Operations)"**. 

The design direction is **REBEL ADMIN**: athletic, professional, dark obsidian (`#0A0C0F` / `#13161C`), minimal, ultra-fast, and accented with electric lime (`#CCFF00`). It adheres strictly to iPhone design ergonomics: dynamic island safe areas, 44pt touch targets, bottom action bars, haptic-ready interactions, and high-density operational telemetry without visual clutter.

---

### 2. Design System Tokens & Color Palette

#### Core Brand Surfaces & Accents
| Token | Hex Value | Purpose |
|---|---|---|
| `background` | `#0A0C0F` | Primary deep obsidian background |
| `backgroundSecondary` | `#0D0F12` | Raised background for contrast |
| `surface` | `#13161C` | Card background, drawer panel, container |
| `surfaceAlt` | `#181C24` | Secondary surface level |
| `surfaceElevated` | `#1D222C` | Elevated modals, bottom sheets, navigation bar |
| `border` | `#232732` | 1px subtle crisp separator |
| `borderSubtle` | `#1F242F` | Soft borders for input fields and inactive pills |
| `primary` | `#CCFF00` | Electric Lime / Rebel Volt (Key CTAs, metrics, active pills) |
| `textPrimary` | `#FFFFFF` | Primary headings, titles, key figures |
| `textSecondary` | `#94A3B8` | Subtitles, labels, descriptions |
| `textMuted` | `#64748B` | Timestamps, secondary hints, disabled copy |

#### Operational Status Tokens
| Status | Hex Value | Semantic Usage |
|---|---|---|
| `statusNew` | `#38BDF8` | Inbound / New Lead / Active notifications |
| `statusTrial` | `#A855F7` | Trial Scheduled |
| `statusFollowUp` | `#FBBF24` | Follow-up Due / Pending invoice |
| `statusPresent` | `#22C55E` | Present student / Paid invoice |
| `statusAbsent` | `#EF4444` | Absent student / Overdue invoice / System alert |
| `statusLate` | `#FB923C` | Late check-in / Partial payment |

---

### 3. Screen-by-Screen Implementation Breakdown

#### Screen 1: Splash Screen
- **Path**: `lib/features/splash/presentation/splash_screen.dart`
- **Visuals**: Centered geometric badminton shuttlecock emblem illuminated with soft radial electric lime ambient glow.
- **Branding**: "S&A BADMINTON ACADEMY" bold typography with academy tagline:
  > *DISCIPLINE BUILDS BRIGHTER FUTURES*
- **Transitions**: Smooth logo fade and scale animation that automatically checks session authentication and routes to `/dashboard` or `/login`.

#### Screen 2: Login Screen
- **Path**: `lib/features/auth/presentation/login_screen.dart`
- **Header**: "Welcome Back" (28px Bold), subtitle "Sign in to your admin account".
- **Fields**: Obsidian rounded inputs for Email and Password (with visibility toggle).
- **Controls**: "Remember me" checkbox, "Forgot password?" link.
- **Primary CTA**: Full-width electric lime `RebelButton` ("Login") with obsidian bold text.
- **Biometrics**: "OR LOGIN WITH" divider leading to "Face ID / Touch ID" biometric prompt via `local_auth`.
- **Footer**: S&A Badminton Academy Admin Portal badge. Discrete server switcher bottom sheet for testing.

#### Screen 3: Today Dashboard (Operations Cockpit)
- **Path**: `lib/features/dashboard/presentation/today_screen.dart`
- **Header**: "Good Morning, [Name]" with calendar date (`Mon, 10 Feb 2025`), notification bell with unread badge, and coach avatar.
- **Metrics Grid**: 2x3 high-density grid showing real live metrics:
  - *Today's Sessions* (Calendar icon)
  - *New Leads* (Trending icon)
  - *Trials Today* (Target icon)
  - *Follow-ups* (Clock icon)
  - *Payments Overdue* (Credit card alert icon)
  - *Pending Approval* (Checklist icon)
- **Upcoming Sessions**: Chronological list of today's court batches showing time, batch tier (e.g. `Kids (Beginner)`), centre, active student count, and direct electric lime inline action: `[ Mark Attendance ]`.

#### Screen 4: Side Menu Drawer
- **Path**: `lib/features/navigation/main_scaffold.dart`
- **Drawer Header**: Avatar initials/photo, Administrator Name, email, and pill badge for user role (e.g., `SUPER_ADMIN`, `COACH`).
- **Navigation Items**: Today, Leads, Students, Schedule, Attendance, Payments, Reports, CMS, Notifications (with electric lime unread counter badge), Settings.
- **Footer Action**: Red outline `Log Out` button tied to `AuthProvider.logout()`.

#### Screen 5: Leads CRM
- **Path**: `lib/features/leads/presentation/leads_screen.dart`
- **Search & Filters**: `RebelSearchField` ("Search leads...") with horizontal filter pills (`All`, `New`, `Follow-up`, `Trial`, `Enquiry`). Active pill highlighted in electric lime.
- **Lead List Cards**: Shows avatar, contact name, phone, relative timestamp, status badge (`NEW`, `FOLLOW_UP`, `TRIAL_SCHEDULED`), and chevron.
- **FAB**: Electric lime circular `+` button to create a new enquiry.

#### Screen 6: Lead Detail View
- **Path**: `lib/features/leads/presentation/leads_screen.dart`
- **Header**: Back button, large avatar badge, lead name, and current status pill.
- **Quick Actions**: Three operational buttons: `Call`, `WhatsApp`, and `Email` with real launcher integration via `url_launcher`.
- **Tabs**: `Details`, `Notes`, `Timeline`.
- **Detail Fields**: Phone, Email, Preferred Centre, Training Program, Assigned Coach, Follow-up Date, Notes.
- **Sticky Bottom Bar**: Secondary dark `Convert` button alongside primary electric lime `Schedule Trial` button.

#### Screen 7: Schedule View
- **Path**: `lib/features/schedule/presentation/schedule_screen.dart`
- **Segmented Control**: `Today`, `Day`, `Week` with smooth animated tab sliding.
- **Date Header**: Real-time date display with calendar icon.
- **Session Timeline**: Chronological court sessions with start time, program tier, training centre, student count, and inline `Mark Attendance` button.

#### Screen 8: Attendance Marking
- **Path**: `lib/features/attendance/presentation/mark_attendance_screen.dart`
- **Session Banner**: High-contrast card displaying Batch name, Centre location, Date & Time, and Total Enrolled Students.
- **Indexed Student Rows**: Numbered student list (1, 2, 3...) with interactive segmented status pills:
  - `Present` (Emerald Green)
  - `Absent` (Crimson Red)
  - `Late` (Orange)
- **Sticky Bottom Actions**: Full-width secondary `Mark All Present` button and primary electric lime `Save Attendance` button.
- **Offline Reliability**: Automatically detects network loss and writes to `OfflineAttendanceQueue` in local storage for background sync.

#### Screen 9: Students Roster
- **Path**: `lib/features/students/presentation/students_screen.dart`
- **Search & Filter**: Search bar with centre filter pills (`All`, `Kadavanthra`, `Edappally`, `Kakkanad`).
- **Student Cards**: Shows avatar, student name, enrolled program tier, batch schedule, and chevron.
- **FAB**: Electric lime circular `+` to open student enrollment form.

#### Screen 10: Student Profile Detail
- **Path**: `lib/features/students/presentation/students_screen.dart`
- **Profile Header**: Avatar, Full Name, Student badge.
- **Navigation Tabs**: `Profile`, `Attendance`, `Payments`, `Performance`.
- **Profile Breakdown**: Parent Name, Emergency Phone, Centre, Program, Batch Schedule, Enrollment Status.
- **Operational Action Tiles**: Deep links to `View Attendance`, `View Payments`, and `View Performance`.

#### Screen 11: Payments & Billing
- **Path**: `lib/features/finance/presentation/finance_screen.dart`
- **Segmented Toggle**: `Invoices` vs `Payments` receipts.
- **Search & Filter Pills**: `All`, `Overdue`, `Pending`, `Paid`.
- **Invoice Cards**: Invoice ID (`INV-2025-001`), Student Name, Billing Month, Amount (`₹5,000`), and Status Badge (`PAID`, `PENDING`, `OVERDUE`, `PARTIAL`).
- **Payments Receipts**: Displays completed transaction entries with receipt IDs and payment methods (UPI, Cash, Bank Transfer).

#### Screen 12: Invoice Detail & Payment Recording
- **Path**: `lib/features/finance/presentation/finance_screen.dart`
- **Header**: Invoice ID and Status Badge.
- **Student Information**: Student Name, Parent contact, and assigned centre.
- **Financial Breakdown**: Total Amount, Paid Amount, Balance Due (highlighted in prominent red/lime), Due Date, and Billing Period.
- **Actions**:
  - `Record Payment` (Electric lime CTA opening modal sheet for payment entry).
  - `Send WhatsApp Reminder` (Instant WhatsApp deep link with student balance reminder).

#### Screen 13: Operational Reports
- **Path**: `lib/features/reports/presentation/reports_screen.dart`
- **Categories**:
  - `Admissions` (New students and conversions)
  - `Lead Conversion` (Track lead-to-student conversion funnel)
  - `Attendance` (Session and attendance ratios)
  - `Revenue` (Income and financial reports)
  - `Receivables` (Outstanding payments and overdue collections)
  - `Centre Performance` (Compare centre metrics and capacity)
- **Card Design**: Distinct tinted category icon, title, operational description, and chevron.

#### Screen 14: Content Management System (CMS)
- **Path**: `lib/features/cms/presentation/cms_screen.dart`
- **Modules**:
  - `Blog` (Manage blog posts & training articles)
  - `Gallery` (Manage academy photos and tournaments)
  - `Testimonials` (Manage parent and athlete reviews)
  - `Achievements` (Manage state and national medals)
  - `Announcements` (Manage academy-wide alerts)
  - `Website Content` (Update live Next.js website copy)

#### Screen 15: Notifications Center
- **Path**: `lib/features/notifications/presentation/notifications_screen.dart`
- **Tabs**: `All`, `Unread`, `System`.
- **Notification Cards**: Category icon, Title, Summary, Timestamp, and electric lime unread indicator dot.
- **Supported Categories**: `New Lead`, `Trial Today`, `Payment Overdue`, `Follow-up Due`, `Announcement`.
- **Navigation**: Tapping a notification navigates directly to the relevant screen.

#### Screen 16: Settings & System Controls
- **Path**: `lib/features/settings/presentation/settings_screen.dart`
- **Profile Header**: Administrator avatar, Name, and Email address.
- **Settings Tiles**:
  - `Profile` (Edit personal admin profile)
  - `Security` (Change credentials, view login history)
  - `Biometric Login` (iOS Face ID toggle switch)
  - `Notifications` (Push notification preferences)
  - `Appearance` (System / Dark mode selector)
  - `Offline Sync` (Force synchronizes offline attendance records)
  - `Help & Support`
  - `About` (App version and academy legal info)
- **Footer**: High-contrast red outline `Log Out` button.
