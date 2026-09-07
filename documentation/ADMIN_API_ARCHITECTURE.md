# S&A Badminton Academy Management Platform
## Backend API Architecture & Endpoint Specification

**Document Version:** 1.0  
**Specification Date:** September 7, 2026  
**Status:** Approved Architecture  

---

## 1. Global API Conventions

- **Base URL:** `/api/admin`
- **Request Format:** `application/json` (except `/api/upload` which uses `multipart/form-data`)
- **Response Structure:**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Operation completed successfully"
  }
  ```
- **Error Structure:**
  ```json
  {
    "success": false,
    "error": {
      "code": "INSUFFICIENT_PERMISSIONS",
      "message": "You do not have access to this resource."
    }
  }
  ```
- **Authentication Header:** `Authorization: Bearer <ACCESS_TOKEN>`
- **HTTP Status Codes:**
  - `200 OK`: Successful retrieval / update
  - `201 Created`: Successful entity creation
  - `400 Bad Request`: Validation failure
  - `401 Unauthorized`: Missing or expired access token
  - `403 Forbidden`: Authenticated user lacks required role
  - `404 Not Found`: Entity does not exist
  - `409 Conflict`: Unique constraint violation (e.g. duplicate attendance)
  - `500 Internal Server Error`: Unhandled database or server exception

---

## 2. API Endpoint Directory

### Authentication & Sessions (`/api/admin/auth`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `POST` | `/api/admin/auth/login` | Public | Validates email & password, returns JWT access token + refresh token |
| `POST` | `/api/admin/auth/refresh` | Public | Rotates refresh token and issues fresh access token |
| `POST` | `/api/admin/auth/logout` | Authenticated | Revokes refresh token in database |
| `GET` | `/api/admin/auth/me` | Authenticated | Returns current user profile and permission list |

### Operational Dashboard (`/api/admin/dashboard`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard/today` | All Staff | Returns Today's sessions, expected students, pending trials, and overdue counts |

### Leads & Inbound CRM (`/api/admin/leads`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/admin/leads` | SUPER_ADMIN, ADMIN, FRONT_DESK | Lists leads with filter by status, centre, search, pagination |
| `POST` | `/api/admin/leads` | SUPER_ADMIN, ADMIN, FRONT_DESK | Records manual walk-in or phone enquiry lead |
| `GET` | `/api/admin/leads/[id]` | SUPER_ADMIN, ADMIN, FRONT_DESK | Retrieves lead profile, notes timeline, and trial history |
| `PUT` | `/api/admin/leads/[id]` | SUPER_ADMIN, ADMIN, FRONT_DESK | Advances lead status (e.g. CONTACTED -> TRIAL_BOOKED) |
| `POST` | `/api/admin/leads/[id]/notes`| SUPER_ADMIN, ADMIN, FRONT_DESK | Appends internal staff note to lead timeline |

### Free Trials (`/api/admin/trials`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/admin/trials` | SUPER_ADMIN, ADMIN, COACH, FRONT_DESK | Lists trials filtered by date, centre, status |
| `POST` | `/api/admin/trials` | SUPER_ADMIN, ADMIN, FRONT_DESK | Schedules court evaluation trial |
| `PUT` | `/api/admin/trials/[id]` | SUPER_ADMIN, ADMIN, COACH, FRONT_DESK | Updates status (CONFIRMED, ATTENDED, CONVERTED) |

### Students & Parents (`/api/admin/students`, `/api/admin/parents`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/admin/students` | All Staff | Master roster with filters by centre, program, status |
| `POST` | `/api/admin/students` | SUPER_ADMIN, ADMIN, FRONT_DESK | Enrolls new student and links/creates parent |
| `GET` | `/api/admin/students/[id]` | All Staff | Full profile: attendance %, invoices, assessments |
| `PUT` | `/api/admin/students/[id]` | SUPER_ADMIN, ADMIN | Updates student profile or batch assignments |
| `POST` | `/api/admin/students/convert-lead`| SUPER_ADMIN, ADMIN, FRONT_DESK | Atomic lead -> student enrollment |
| `GET` | `/api/admin/parents` | SUPER_ADMIN, ADMIN, FRONT_DESK | Lists parents with linked student counts |

### Batches, Sessions & Attendance (`/api/admin/batches`, `/api/admin/attendance`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/admin/batches` | All Staff | Lists active cohorts, coaches, capacities |
| `POST` | `/api/admin/batches` | SUPER_ADMIN, ADMIN | Creates new training batch |
| `GET` | `/api/admin/sessions/today` | All Staff | Lists today's physical training sessions |
| `POST` | `/api/admin/attendance` | SUPER_ADMIN, ADMIN, COACH, FRONT_DESK | Bulk records attendance with `UNIQUE(session_id, student_id)` constraint |
| `GET` | `/api/admin/attendance/session/[id]` | All Staff | Fetches attendance status of all students in session |

### Finance & Invoicing (`/api/admin/invoices`, `/api/admin/payments`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/admin/invoices` | SUPER_ADMIN, ADMIN | Lists fee invoices (due, paid, overdue) |
| `POST` | `/api/admin/invoices` | SUPER_ADMIN, ADMIN | Generates monthly/quarterly fee obligations |
| `GET` | `/api/admin/payments` | SUPER_ADMIN, ADMIN | Lists verified payment transactions |
| `POST` | `/api/admin/payments` | SUPER_ADMIN, ADMIN, FRONT_DESK | Records payment and allocates against open invoices |
| `GET` | `/api/admin/payments/reminders` | SUPER_ADMIN, ADMIN | Fetches overdue fee list with WhatsApp links |

### Coaches & Performance (`/api/admin/coaches`, `/api/admin/performance`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/admin/coaches` | All Staff | Lists verified coach directory |
| `POST` | `/api/admin/performance` | SUPER_ADMIN, ADMIN, COACH | Logs skill evaluation (footwork, technique, fitness) |
| `GET` | `/api/admin/performance/student/[id]` | SUPER_ADMIN, ADMIN, COACH | Historical evaluation progression |

### Reports, Auditing & CMS (`/api/admin/reports`, `/api/admin/audit`, `/api/admin/cms`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/admin/reports/summary` | SUPER_ADMIN, ADMIN | Returns aggregated funnel and financial metrics |
| `GET` | `/api/admin/audit` | SUPER_ADMIN | Immutable log of administrative actions |
| `GET` | `/api/admin/cms/[section]` | SUPER_ADMIN, ADMIN, CONTENT_MANAGER | Fetches blog, gallery, testimonials, achievements |
| `PUT` | `/api/admin/cms/[section]` | SUPER_ADMIN, ADMIN, CONTENT_MANAGER | Updates CMS content with cache invalidation |
