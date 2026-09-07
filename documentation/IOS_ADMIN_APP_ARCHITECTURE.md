# S&A Badminton Academy — Native iOS Administration Application Architecture

## 1. System Overview

The **S&A Badminton Academy Native iOS Application** (`s_a_admin_ios/`) provides a high-performance, native iOS 17+ operations experience for academy directors, administrators, front desk personnel, coaches, and content managers.

The architecture enforces a strict **3-Tier Separation of Concerns**:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  ┌─────────────────────────────┐   ┌─────────────────────┐  │
│  │   Flutter Admin App         │   │   Native iOS App    │  │
│  │   (s_a_admin/)              │   │   (s_a_admin_ios/)  │  │
│  └──────────────┬──────────────┘   └──────────┬──────────┘  │
└─────────────────┼─────────────────────────────┼─────────────┘
                  │                             │
                  ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Authoritative Backend Gateway                  │
│               Next.js REST API Gateway                      │
│     Authentication (JWT) • RBAC • Audit Logging             │
│        Business Calculations • Lifecycle Validation         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                            │
│                 Neon Serverless PostgreSQL                  │
└─────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> The native iOS application **NEVER connects directly to Neon PostgreSQL**. All database mutations, financial aggregations, and business logic are enforced centrally by the Next.js API Gateway (`/api/admin/*`).

---

## 2. Directory Structure & Modular Clean Architecture

```
s_a_admin_ios/
├── project.yml                       # XcodeGen declarative project configuration
├── SAAAdmin.xcodeproj                # Generated Xcode project
├── SAAAdmin/
│   ├── Info.plist                    # Bundle metadata, URL schemes, privacy usage descriptions
│   ├── App/
│   │   └── SAAAdminApp.swift         # SwiftUI app lifecycle, SwiftData container, deep links
│   ├── Assets.xcassets/              # AppIcon, AccentColor (Acid Lime)
│   ├── Core/
│   │   ├── Authentication/
│   │   │   ├── AuthManager.swift     # Observable authentication state machine
│   │   │   ├── BiometricAuthManager.swift # LocalAuthentication (Face ID / Touch ID)
│   │   │   └── KeychainManager.swift # Hardware-backed token storage & test fallback
│   │   ├── Logging/
│   │   │   └── AppLogger.swift       # Apple OSLog structured logging categories
│   │   ├── Networking/
│   │   │   ├── APIClient.swift       # Async/await URLSession, 401 refresh rotation
│   │   │   ├── APIEndpoint.swift     # 24 strongly typed endpoints & query generators
│   │   │   └── NetworkMonitor.swift  # NWPathMonitor connectivity observer
│   │   └── Storage/
│   │       └── OfflineAttendanceModel.swift # SwiftData @Model and OfflineAttendanceStore
│   ├── DesignSystem/
│   │   ├── Colors/
│   │   │   └── RebelColors.swift     # Rebel Admin color tokens (Pitch Black, Acid Lime, etc.)
│   │   ├── Navigation/
│   │   │   └── MainTabView.swift     # Adaptive iPhone TabView / iPad NavigationSplitView
│   │   └── Typography/
│   │       └── RebelTypography.swift # Design system typography, RebelBadge, RebelCard
│   ├── Features/
│   │   ├── Attendance/
│   │   │   └── MarkAttendanceView.swift   # Fast roster attendance marking & offline queue
│   │   ├── AuditLogs/
│   │   │   └── AuditLogsView.swift        # Server-side immutable audit log viewer
│   │   ├── Authentication/
│   │   │   └── LoginView.swift            # Branded Rebel login with Face ID
│   │   ├── CMS/
│   │   │   └── CMSView.swift              # Testimonials, achievements, announcements, blog
│   │   ├── Centres/
│   │   │   └── CentresListView.swift      # 3 verified canonical centres directory
│   │   ├── Coaches/
│   │   │   └── CoachesListView.swift      # Coaching staff roster & direct contact
│   │   ├── Dashboard/
│   │   │   └── TodayDashboardView.swift   # Real-time court sessions, quick actions, alerts
│   │   ├── Finance/
│   │   │   └── FinanceView.swift          # Invoices, payments, WhatsApp billing reminders
│   │   ├── Leads/
│   │   │   ├── AddLeadView.swift          # Inbound CRM lead entry
│   │   │   ├── ConvertLeadView.swift      # Lead to enrolled student conversion
│   │   │   ├── LeadDetailView.swift       # Lifecycle timeline, call, WhatsApp actions
│   │   │   └── LeadsListView.swift        # Filterable lead pipeline
│   │   ├── Notifications/
│   │   │   └── NotificationsView.swift    # In-app operational alerts
│   │   ├── Performance/
│   │   │   └── PerformanceView.swift      # 5-rubric athlete assessment (Footwork, Technique...)
│   │   ├── Programs/
│   │   │   └── ProgramsListView.swift     # Curricula, coach:student ratios
│   │   ├── Reports/
│   │   │   └── ReportsView.swift          # Admissions funnel, attendance %, receivables
│   │   ├── Schedule/
│   │   │   └── ScheduleView.swift         # Court timetable & batch cohorts
│   │   ├── Search/
│   │   │   └── GlobalSearchView.swift     # Debounced multi-entity search
│   │   ├── Settings/
│   │   │   └── SettingsView.swift         # Profile, security, biometric toggle, offline sync
│   │   ├── Students/
│   │   │   └── StudentsListView.swift     # Student roster, detail & enrolment
│   │   └── Trials/
│   │       └── ScheduleTrialSheet.swift   # Free trial scheduling sheet
│   └── Shared/
│       ├── Models/
│       │   └── DataModels.swift           # Decodable models with flexible decimal decoders
│       └── Utilities/
│           └── ExternalLauncher.swift     # WhatsApp (wa.me), Phone (tel://), Mail (mailto://)
├── SAAAdminTests/
│   ├── AuthenticationTests.swift          # Keychain storage, logout clearing, profile saving
│   ├── ModelDecodingTests.swift           # Flexible decimal decoding, API schemas
│   ├── OfflineQueueTests.swift            # SwiftData enqueueing, deduplication, fetching
│   └── RBACPermissionTests.swift          # Role permissions & canonical centre check
└── SAAAdminUITests/
    └── SAAAdminUITests.swift              # Simulator UI launch & login elements verification
```

---

## 3. Core Technical Decisions

### 3.1 Security & Apple Keychain
- **Tokens**: Access and Refresh tokens are stored exclusively in the Apple Keychain using `kSecClassGenericPassword` with `kSecAttrAccessibleAfterFirstUnlock`.
- **Zero Secrets**: No JWT secrets, passwords, or database credentials exist inside the iOS bundle.
- **Refresh Token Rotation**: When an API request returns HTTP 401, `APIClient` intercepts the failure, calls `/api/admin/auth/refresh`, securely updates the Keychain with the newly rotated refresh token, and replays the original request seamlessly.

### 3.2 Biometric Authentication (LocalAuthentication)
- Supports Face ID, Touch ID, and Optic ID.
- Biometrics serve as a convenience re-entry lock guarding existing Keychain session tokens.
- Normal username/password authentication remains available at all times.

### 3.3 Offline Attendance Queue (SwiftData)
- Uses an `@Model` named `OfflineAttendanceRecord` backed by SwiftData.
- If network connectivity is lost (monitored via `NWPathMonitor`), coaches can mark attendance with zero disruption.
- Each mutation generates a unique `UUID` operation ID, session ID, student ID, attendance status, and timestamp.
- Re-entry of status for the same student updates the existing pending record to prevent duplicate operations.
- When network connectivity returns, `OfflineAttendanceStore.syncPendingRecords()` posts batches to `/api/admin/attendance` and removes synchronized items from the local SQLite store.

### 3.4 Adaptive iPad & iPhone UX
- **iPhone**: Modern 5-tab `TabView` (`Today`, `Leads`, `Students`, `Schedule`, `More`).
- **iPad**: Two-column `NavigationSplitView` with a comprehensive sidebar categorizing operations into Operations, Finance & Intelligence, Academy & Marketing, and Utilities.
