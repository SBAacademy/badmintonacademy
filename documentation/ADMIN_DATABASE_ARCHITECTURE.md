# S&A Badminton Academy Management Platform
## Relational PostgreSQL Database Architecture & DDL Specification

**Document Version:** 1.0  
**Specification Date:** September 7, 2026  
**Target Engine:** Neon Serverless PostgreSQL (`@neondatabase/serverless`)  
**Status:** Approved Architecture  

---

## 1. Architecture & Entity-Relationship Model

```
                    ┌──────────────┐
                    │    USERS     │
                    └──────┬───────┘
                           │ 1:N
                           ▼
                    ┌──────────────┐
                    │ REFRESH_TOKENS
                    └──────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   PARENTS   │ 1:N   │  STUDENTS   │ N:M   │   BATCHES   │
│             ├──────►│             ├──────►│             │
└─────────────┘       └───┬─────────┘       └───┬─────────┘
                          │                     │ 1:N
                          │                     ▼
                          │             ┌─────────────┐
                          │             │  SESSIONS   │
                          │             └──────┬──────┘
                          │ 1:N                │ 1:N
                          ▼                    ▼
                    ┌───────────────────────────────┐
                    │          ATTENDANCE           │
                    │ UNIQUE(session_id, student_id)│
                    └───────────────────────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────────────┐
│FEE_INVOICES │ 1:N   │  PAYMENTS   │ 1:N   │ PAYMENT_ALLOCATIONS │
│             │◄──────┤             ├──────►│ (Reconciles Invoice │
└─────────────┘       └─────────────┘       │  with Payment)      │
                                            └─────────────────────┘
```

---

## 2. Complete PostgreSQL DDL Schema

### Core Authentication & Staff Accounts

```sql
-- 1. USERS & STAFF
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'COACH', 'FRONT_DESK', 'CONTENT_MANAGER')),
    phone VARCHAR(32),
    assigned_centre VARCHAR(64),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. REFRESH TOKENS (Rotating Session Security)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    replaced_by_token_id VARCHAR(64),
    ip_address VARCHAR(64),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
```

### Physical Infrastructure & Programs

```sql
-- 3. CANONICAL CENTRES (Strictly Kadavanthra, Kumbalanghi, Maradu, Palluruthy, Chullikal)
CREATE TABLE IF NOT EXISTS centres (
    slug VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    short_name VARCHAR(64) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(32) NOT NULL,
    whatsapp VARCHAR(32) NOT NULL,
    email VARCHAR(128) NOT NULL,
    court_count INTEGER NOT NULL DEFAULT 3,
    surface_type VARCHAR(64) DEFAULT 'BWF Wooden Cushion & Synthetic Mat',
    google_maps_url TEXT,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRAINING PROGRAMS
CREATE TABLE IF NOT EXISTS programs (
    slug VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    short_name VARCHAR(64) NOT NULL,
    target_age VARCHAR(64) NOT NULL,
    skill_level VARCHAR(64) NOT NULL,
    coach_ratio VARCHAR(32) NOT NULL DEFAULT '1:6',
    duration_mins INTEGER NOT NULL DEFAULT 60,
    monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 3500.00,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VERIFIED COACHES
CREATE TABLE IF NOT EXISTS coaches (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    role VARCHAR(128) NOT NULL,
    bio TEXT NOT NULL,
    certifications TEXT[] NOT NULL DEFAULT '{}',
    experience_years INTEGER NOT NULL DEFAULT 5,
    specialization VARCHAR(255) NOT NULL,
    primary_centre VARCHAR(64) REFERENCES centres(slug),
    image_url TEXT,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Student & Parent Registry

```sql
-- 6. PARENTS & GUARDIANS
CREATE TABLE IF NOT EXISTS parents (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(128) NOT NULL,
    phone VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255),
    emergency_phone VARCHAR(32),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_parents_phone ON parents(phone);

-- 7. STUDENTS
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(64) PRIMARY KEY,
    parent_id VARCHAR(64) REFERENCES parents(id) ON DELETE SET NULL,
    full_name VARCHAR(128) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(16) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    blood_group VARCHAR(8),
    primary_centre VARCHAR(64) NOT NULL REFERENCES centres(slug),
    primary_program VARCHAR(64) NOT NULL REFERENCES programs(slug),
    status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRANSFERRED', 'COMPLETED')),
    medical_notes TEXT,
    emergency_contact VARCHAR(64),
    joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_students_parent ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_centre ON students(primary_centre);
```

### CRM, Inbound Leads & Free Trials

```sql
-- 8. LEADS (Upgraded with relational references)
-- Modifies existing leads table non-destructively
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_staff_id VARCHAR(64) REFERENCES users(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_student_id VARCHAR(64) REFERENCES students(id);

-- 9. LEAD NOTES & TIMELINE
CREATE TABLE IF NOT EXISTS lead_notes (
    id VARCHAR(64) PRIMARY KEY,
    lead_id VARCHAR(64) NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    author_id VARCHAR(64) REFERENCES users(id),
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. FREE TRIALS
CREATE TABLE IF NOT EXISTS free_trials (
    id VARCHAR(64) PRIMARY KEY,
    lead_id VARCHAR(64) REFERENCES leads(id) ON DELETE SET NULL,
    student_name VARCHAR(128) NOT NULL,
    parent_phone VARCHAR(32) NOT NULL,
    parent_email VARCHAR(255),
    centre_slug VARCHAR(64) NOT NULL REFERENCES centres(slug),
    program_slug VARCHAR(64) NOT NULL REFERENCES programs(slug),
    assigned_coach_id VARCHAR(64) REFERENCES coaches(id),
    scheduled_date DATE NOT NULL,
    scheduled_slot VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'CONVERTED')),
    coach_evaluation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trials_date ON free_trials(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_trials_centre ON free_trials(centre_slug);
```

### Batches, Sessions & Attendance (With Duplicate Constraint)

```sql
-- 11. BATCHES
CREATE TABLE IF NOT EXISTS batches (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    centre_slug VARCHAR(64) NOT NULL REFERENCES centres(slug),
    program_slug VARCHAR(64) NOT NULL REFERENCES programs(slug),
    assigned_coach_id VARCHAR(64) REFERENCES coaches(id),
    days_of_week VARCHAR(16)[] NOT NULL, -- e.g. ARRAY['MON', 'WED', 'FRI']
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 12,
    status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. BATCH STUDENTS (Cohort Roster)
CREATE TABLE IF NOT EXISTS batch_students (
    batch_id VARCHAR(64) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(32) DEFAULT 'ACTIVE',
    PRIMARY KEY (batch_id, student_id)
);

-- 13. SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(64) PRIMARY KEY,
    batch_id VARCHAR(64) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    centre_slug VARCHAR(64) NOT NULL REFERENCES centres(slug),
    coach_id VARCHAR(64) REFERENCES coaches(id),
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(32) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_batch ON sessions(batch_id);

-- 14. ATTENDANCE (Strict Database-Level Unique Constraint)
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status VARCHAR(16) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
    marked_by_user_id VARCHAR(64) REFERENCES users(id),
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    coach_note TEXT,
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
```

### Three-Tier Financial Ledger Architecture

```sql
-- 15. FEE INVOICES (Obligations)
CREATE TABLE IF NOT EXISTS fee_invoices (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    billing_period VARCHAR(32) NOT NULL, -- e.g. '2026-09'
    amount_due NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(32) DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON fee_invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON fee_invoices(status);

-- 16. PAYMENTS (Transactions)
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(32) NOT NULL CHECK (payment_method IN ('UPI', 'BANK_TRANSFER', 'CASH', 'CARD')),
    reference_number VARCHAR(128),
    received_by_user_id VARCHAR(64) REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);

-- 17. PAYMENT ALLOCATIONS (Reconciliation)
CREATE TABLE IF NOT EXISTS payment_allocations (
    id VARCHAR(64) PRIMARY KEY,
    payment_id VARCHAR(64) NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    invoice_id VARCHAR(64) NOT NULL REFERENCES fee_invoices(id) ON DELETE CASCADE,
    allocated_amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_payment_invoice_alloc UNIQUE (payment_id, invoice_id)
);
```

### Athlete Development, CMS, Notifications & Auditing

```sql
-- 18. ATHLETE PERFORMANCE ASSESSMENTS
CREATE TABLE IF NOT EXISTS performance_assessments (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    coach_id VARCHAR(64) NOT NULL REFERENCES coaches(id),
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    footwork_score NUMERIC(3, 1) CHECK (footwork_score BETWEEN 1.0 AND 10.0),
    technique_score NUMERIC(3, 1) CHECK (technique_score BETWEEN 1.0 AND 10.0),
    fitness_score NUMERIC(3, 1) CHECK (fitness_score BETWEEN 1.0 AND 10.0),
    tactical_score NUMERIC(3, 1) CHECK (tactical_score BETWEEN 1.0 AND 10.0),
    consistency_score NUMERIC(3, 1) CHECK (consistency_score BETWEEN 1.0 AND 10.0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. WEBSITE ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    link_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. IN-APP NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL CHECK (type IN ('NEW_LEAD', 'TRIAL_BOOKED', 'PAYMENT_DUE', 'PAYMENT_OVERDUE', 'ATTENDANCE_ALERT', 'SYSTEM_ALERT')),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    deep_link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- 21. AUDIT LOGS (Immutable Compliance History)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_user_id VARCHAR(64),
    actor_name VARCHAR(128),
    action VARCHAR(64) NOT NULL, -- e.g. 'STUDENT_ENROLLED', 'PAYMENT_RECEIVED'
    entity VARCHAR(64) NOT NULL, -- e.g. 'students', 'payments'
    entity_id VARCHAR(64) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(created_at);
```
