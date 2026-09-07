# S&A Badminton Academy Management Platform
## Test Plan & Verification Strategy

**Document Version:** 1.0  
**Specification Date:** September 7, 2026  
**Status:** Approved Architecture  

---

## 1. Automated Acceptance Gates

Each implementation gate enforces automated and deterministic acceptance criteria before progression:

```
[ Gate 1: DB ] ──> Verify pre-flight backups, test table creation, constraints, seed verification
      │
[ Gate 2: Auth ] ─> Test token issuance, 15m expiration, token rotation, role 403 rejection
      │
[ Gate 3: CRM ] ──> Test web enquiry creation, state machine transitions, note persistence
      │
[ Gate 4: Roster ]> Test parent-student link, atomic lead -> student conversion
      │
[ Gate 5: Session]> Test batch timetable, duplicate attendance rejection (uq_session_student)
      │
[ Gate 6: Finance]> Test invoice generation, partial payment allocation, balance calculation
      │
[ Gate 8: Flutter]> flutter analyze (0 errors), flutter test (all passing), desktop build
      │
[ Gate 9: Website]> npm run build (0 regressions), public enquiry round-trip test
```

---

## 2. Security & Negative Boundary Test Cases

1. **Unauthenticated Access Test:** Send `GET /api/admin/students` without `Authorization` header $\to$ Assert HTTP 401 Unauthorized.
2. **Role Elevation Test (Coach $\to$ Payments):** Authenticate with user role `COACH` and issue `POST /api/admin/payments` $\to$ Assert HTTP 403 Forbidden and verify audit log entry.
3. **Duplicate Attendance Test:** Issue two simultaneous `POST /api/admin/attendance` requests for the exact same `(session_id, student_id)` $\to$ Assert first succeeds (201 Created), second fails with HTTP 409 Conflict.
4. **Offline Queue Sync Test:** In Flutter client, disconnect network, mark 3 students PRESENT $\to$ assert queue contains 3 items $\to$ reconnect $\to$ assert server confirms and queue clears.
5. **Partial Payment Allocation Test:** Issue ₹2,000 payment for an invoice of ₹3,500 $\to$ Assert invoice status changes to `PARTIAL`, remaining balance equals ₹1,500.
