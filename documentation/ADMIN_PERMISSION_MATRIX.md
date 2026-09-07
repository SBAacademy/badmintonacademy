# S&A Badminton Academy Management Platform
## Role-Based Access Control (RBAC) & Permission Matrix

**Document Version:** 1.0  
**Specification Date:** September 7, 2026  
**Status:** Approved Architecture  

---

## 1. System Roles Definition

The platform defines 5 distinct organizational roles:

1. **`SUPER_ADMIN`**: Academy Founder, Managing Director, or Technical Lead. Full unrestricted system access across all modules, configuration, staff accounts, and financial ledgers.
2. **`ADMIN`**: Centre Manager or Admissions Director. Manages day-to-day operations, lead pipelines, student enrollments, batches, and fee invoicing. Cannot delete audit logs or reconfigure core system keys.
3. **`COACH`**: Professional Training Staff (Head Coach, Senior Coach, Assistant Coach). Focused exclusively on assigned students, today's training sessions, attendance marking, and skill assessments. **Strictly forbidden from viewing or modifying financial ledgers and billing data.**
4. **`FRONT_DESK`**: Facility Receptionist / Admissions Coordinator. Handles walk-in enquiries, trial scheduling, attendance checks, and payment receipt logging. Cannot alter batch schedules or coach assignments.
5. **`CONTENT_MANAGER`**: Media & Marketing Coordinator. Restricted to managing public website content (Blog, Gallery, Testimonials, Achievements, Announcements). Cannot access student records or financial ledgers.

---

## 2. Granular Module Permission Matrix

| Module / Operation | SUPER_ADMIN | ADMIN | COACH | FRONT_DESK | CONTENT_MANAGER |
|---|:---:|:---:|:---:|:---:|:---:|
| **Operational Dashboard (Today)** | Full Access | Full Access | Assigned Only | Centre Only | No Access |
| **Leads & Enquiries: View** | All | All | No Access | Assigned Centre | No Access |
| **Leads: Create / Edit / Advance** | Yes | Yes | No Access | Yes | No Access |
| **Free Trials: Schedule / Evaluate** | Yes | Yes | Evaluate Only | Schedule Only | No Access |
| **Students: View Roster & Profile** | All | All | Assigned Batches | All | No Access |
| **Students: Enroll / Edit / Transfer** | Yes | Yes | No Access | Yes (Enroll) | No Access |
| **Parents & Guardians: Manage** | Yes | Yes | View Emergency | Yes | No Access |
| **Centres: Manage Facilities / Hours** | Yes | Yes | Read Only | Read Only | Read Only |
| **Programs & Curriculums: Manage** | Yes | Yes | Read Only | Read Only | Read Only |
| **Batches & Rosters: Manage** | Yes | Yes | Read Only | Read Only | No Access |
| **Sessions & Timetable: View** | All | All | Assigned | All | No Access |
| **Attendance: Mark Session** | Yes | Yes | Assigned Batches | Assigned Centre | No Access |
| **Attendance: Edit Historical** | Yes | Yes | No (24h limit) | No Access | No Access |
| **Athlete Performance: Evaluate** | Yes | Yes | Assigned Students | Read Only | No Access |
| **Invoices: Generate / Cancel** | Yes | Yes | ❌ **FORBIDDEN** | Read Only | ❌ **FORBIDDEN** |
| **Payments: Record / Allocate** | Yes | Yes | ❌ **FORBIDDEN** | Yes (Record) | ❌ **FORBIDDEN** |
| **Financial Reports & Revenue** | Yes | Yes | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** | ❌ **FORBIDDEN** |
| **Coaches: Manage Profiles** | Yes | Yes | Self-profile | Read Only | Read Only |
| **Website CMS: Blog, Gallery, etc.** | Yes | Yes | No Access | No Access | Full Access |
| **Announcements: Publish** | Yes | Yes | No Access | No Access | Yes |
| **Staff Accounts & Role Config** | Yes | Read Only | No Access | No Access | No Access |
| **Audit Logs: View** | Full Access | Centre Only | No Access | No Access | No Access |

---

## 3. Server-Side Enforcement Rules

> [!CRITICAL]
> **Client-side UI hiding is never considered a security boundary.** Every API endpoint in Next.js App Router enforces permissions using the `requireRole(request, allowedRoles)` helper:

```typescript
// Example: Financial Payment Recording Endpoint
// app/api/admin/payments/route.ts
export async function POST(request: Request) {
  // Enforces that only SUPER_ADMIN, ADMIN, or FRONT_DESK can post payments
  const auth = await requireAuth(request, ["SUPER_ADMIN", "ADMIN", "FRONT_DESK"]);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized: Insufficient Permissions" }, { status: 403 });
  }
  // Safe execution...
}
```

If a user with role `COACH` or `CONTENT_MANAGER` attempts to issue a request to `/api/admin/payments` or `/api/admin/invoices`, the backend immediately rejects the request with HTTP `403 Forbidden` and creates a high-priority entry in `audit_logs`.
