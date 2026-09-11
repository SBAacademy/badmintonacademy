import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

// Secure password hashing with scrypt
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: DATABASE_URL not set.");
    process.exit(1);
  }

  const sql = neon(url);
  console.log(`[Migration] Connecting to Neon PostgreSQL...`);

  // 1. Core Users & Staff
  console.log(`[Migration] Creating 'users' & 'refresh_tokens' tables...`);
  await sql`
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
  `;

  await sql`
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
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);`;

  // 2. Canonical Centres
  console.log(`[Migration] Creating 'centres' table...`);
  await sql`
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
  `;

  // 3. Training Programs
  console.log(`[Migration] Creating 'programs' table...`);
  await sql`
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
  `;

  // 4. Coaches
  console.log(`[Migration] Creating 'coaches' table...`);
  await sql`
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
      achievements TEXT[] NOT NULL DEFAULT '{}',
      status VARCHAR(32) DEFAULT 'ACTIVE',
      is_published BOOLEAN DEFAULT TRUE,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // 5. Parents & Students
  console.log(`[Migration] Creating 'parents' & 'students' tables...`);
  await sql`
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
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_parents_phone ON parents(phone);`;

  await sql`
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
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_students_parent ON students(parent_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_students_centre ON students(primary_centre);`;

  // 6. Upgrading leads non-destructively
  console.log(`[Migration] Upgrading 'leads' table and creating 'lead_notes'...`);
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_staff_id VARCHAR(64) REFERENCES users(id);`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_date DATE;`;
  await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_student_id VARCHAR(64) REFERENCES students(id);`;

  await sql`
    CREATE TABLE IF NOT EXISTS lead_notes (
      id VARCHAR(64) PRIMARY KEY,
      lead_id VARCHAR(64) NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      author_id VARCHAR(64) REFERENCES users(id),
      note TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  // 7. Free Trials
  console.log(`[Migration] Creating 'free_trials' table...`);
  await sql`
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
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_trials_date ON free_trials(scheduled_date);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_trials_centre ON free_trials(centre_slug);`;

  // 8. Batches & Sessions
  console.log(`[Migration] Creating 'batches', 'batch_students', 'sessions' & 'attendance'...`);
  await sql`
    CREATE TABLE IF NOT EXISTS batches (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      centre_slug VARCHAR(64) NOT NULL REFERENCES centres(slug),
      program_slug VARCHAR(64) NOT NULL REFERENCES programs(slug),
      assigned_coach_id VARCHAR(64) REFERENCES coaches(id),
      days_of_week VARCHAR(16)[] NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 12,
      status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'ARCHIVED')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS batch_students (
      batch_id VARCHAR(64) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      enrolled_at TIMESTAMPTZ DEFAULT NOW(),
      status VARCHAR(32) DEFAULT 'ACTIVE',
      PRIMARY KEY (batch_id, student_id)
    );
  `;

  await sql`
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
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_batch ON sessions(batch_id);`;

  // 9. Attendance with UNIQUE(session_id, student_id)
  await sql`
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
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);`;

  // 10. Financial Engine: Invoices, Payments, Allocations
  console.log(`[Migration] Creating 'fee_invoices', 'payments', 'payment_allocations'...`);
  await sql`
    CREATE TABLE IF NOT EXISTS fee_invoices (
      id VARCHAR(64) PRIMARY KEY,
      student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      billing_period VARCHAR(32) NOT NULL,
      amount_due NUMERIC(10, 2) NOT NULL,
      due_date DATE NOT NULL,
      status VARCHAR(32) DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED')),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_invoices_student ON fee_invoices(student_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_invoices_status ON fee_invoices(status);`;

  await sql`
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
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);`;

  await sql`
    CREATE TABLE IF NOT EXISTS payment_allocations (
      id VARCHAR(64) PRIMARY KEY,
      payment_id VARCHAR(64) NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
      invoice_id VARCHAR(64) NOT NULL REFERENCES fee_invoices(id) ON DELETE CASCADE,
      allocated_amount NUMERIC(10, 2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT uq_payment_invoice_alloc UNIQUE (payment_id, invoice_id)
    );
  `;

  // 11. Performance, Announcements, Notifications, Audit Logs
  console.log(`[Migration] Creating 'performance_assessments', 'announcements', 'notifications', 'audit_logs'...`);
  await sql`
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
  `;

  await sql`
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
  `;

  await sql`
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
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);`;

  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(64) PRIMARY KEY,
      actor_user_id VARCHAR(64),
      actor_name VARCHAR(128),
      action VARCHAR(64) NOT NULL,
      entity VARCHAR(64) NOT NULL,
      entity_id VARCHAR(64) NOT NULL,
      old_data JSONB,
      new_data JSONB,
      ip_address VARCHAR(64),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity, entity_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(created_at);`;

  // 12. SEED CANONICAL DATA
  console.log(`[Migration] Seeding canonical centres (Kadavanthra, Edappally, Kakkanad)...`);
  await sql`
    INSERT INTO centres (slug, name, short_name, address, phone, whatsapp, email, court_count, status)
    VALUES 
      ('kadavanthra', 'S & A Badminton Academy – Kadavanthra', 'Kadavanthra Centre', 'S&A Sports Arena, Near Rajiv Gandhi Indoor Stadium, Kadavanthra, Kochi 682020', '+91 98460 12345', '+91 98460 12345', 'kadavanthra@sabadminton.com', 4, 'ACTIVE'),
      ('edappally', 'S & A Badminton Academy – Edappally', 'Edappally Centre', 'Metro Pillar 412, Near Toll Junction, Edappally, Kochi 682024', '+91 98460 12345', '+91 98460 12345', 'edappally@sabadminton.com', 3, 'ACTIVE'),
      ('kakkanad', 'S & A Badminton Academy – Kakkanad', 'Kakkanad Centre', 'Near Infopark Expressway, SmartCity Hub, Kakkanad, Kochi 682030', '+91 98460 12345', '+91 98460 12345', 'kakkanad@sabadminton.com', 3, 'ACTIVE')
    ON CONFLICT (slug) DO NOTHING;
  `;

  console.log(`[Migration] Seeding canonical programs...`);
  await sql`
    INSERT INTO programs (slug, name, short_name, target_age, skill_level, coach_ratio, duration_mins, monthly_fee, display_order)
    VALUES
      ('kids-badminton-coaching', 'Kids Foundation Badminton Program', 'Kids Program', '5 to 9 Years', 'Beginner', '1:6', 60, 3000.00, 1),
      ('junior-badminton-coaching', 'Junior Development Badminton Program', 'Junior Program', '10 to 16 Years', 'Intermediate', '1:8', 90, 3500.00, 2),
      ('adult-badminton-coaching', 'Adult Fitness & Skills Program', 'Adult Program', '16+ Years & Corporate', 'All Levels', '1:8', 75, 4000.00, 3),
      ('competitive-badminton-training', 'Competitive & Tournament Elite', 'Competitive Elite', 'Selected Athletes', 'Advanced', '1:4', 120, 5500.00, 4),
      ('summer-badminton-camp', 'Summer Badminton Camp', 'Summer Camp', '6 to 18 Years', 'All Levels', '1:8', 120, 4500.00, 5)
    ON CONFLICT (slug) DO NOTHING;
  `;

  console.log(`[Migration] Seeding canonical verified coaches...`);
  await sql`
    INSERT INTO coaches (id, name, role, bio, certifications, experience_years, specialization, primary_centre, image_url, display_order)
    VALUES
      ('sooraj-m-s', 'Sooraj M S', 'Senior Badminton Coach', 'Dedicated badminton trainer with extensive experience mentoring junior and adult athletes in Kochi.', ARRAY['BWF Level 1 Certified Coach', 'NIS CERTIFIED', 'Bachelors of physical education (BPed)'], 10, 'Singles Tactical Footwork & Match Conditioning', 'kadavanthra', '/images/training-coach.jpg', 10),
      ('saniya-george-maijo', 'Saniya George Maijo', 'Sports Nutritionist & Assistant Coach', 'Dedicated badminton trainer with extensive experience mentoring junior and adult athletes in Kochi.', ARRAY[]::TEXT[], 4, 'Singles Tactical Footwork & Match Conditioning', 'kadavanthra', '/images/training-coach.jpg', 11),
      ('fayis', 'Fayis', 'Assistant Coach', 'Dedicated badminton trainer with extensive experience mentoring junior and adult athletes in Kochi.', ARRAY['BWF Level 1 Certified Coach'], 5, 'Singles Tactical Footwork & Match Conditioning', 'kadavanthra', '/images/training-coach.jpg', 12),
      ('robin-biju', 'Robin Biju', 'Assistant Coach', 'Dedicated badminton trainer with extensive experience mentoring junior and adult athletes in Kochi.', ARRAY[]::TEXT[], 4, 'Singles Tactical Footwork & Match Conditioning', 'kadavanthra', '/images/training-coach.jpg', 13),
      ('adithyan-s', 'Adithyan S', 'Assistant Coach', 'Dedicated badminton trainer with extensive experience mentoring junior and adult athletes in Kochi.', ARRAY[]::TEXT[], 3, 'Singles Tactical Footwork & Match Conditioning', 'kadavanthra', '/images/training-coach.jpg', 14)
    ON CONFLICT (id) DO NOTHING;
  `;

  console.log(`[Migration] Bootstrapping Super Admin & Coach accounts...`);
  const adminPasswordHash = hashPassword("Admin@SA2026!");
  const coachPasswordHash = hashPassword("Coach@SA2026!");

  await sql`
    INSERT INTO users (id, email, password_hash, full_name, role, phone, assigned_centre)
    VALUES
      ('usr-admin-01', 'admin@sabadminton.com', ${adminPasswordHash}, 'Academy Director', 'SUPER_ADMIN', '+91 98460 12345', 'kadavanthra'),
      ('usr-coach-01', 'sooraj@sabadminton.com', ${coachPasswordHash}, 'Sooraj M S', 'COACH', '+91 98460 11111', 'kadavanthra')
    ON CONFLICT (email) DO UPDATE SET is_active = TRUE;
  `;

  // Log initial migration event in audit log
  await sql`
    INSERT INTO audit_logs (id, actor_user_id, actor_name, action, entity, entity_id, new_data)
    VALUES (
      ${'aud-' + Date.now()},
      'system-migration',
      'System Database Initializer',
      'MIGRATION_COMPLETED',
      'schema',
      'public',
      ${JSON.stringify({ version: '1.0', timestamp: new Date().toISOString() })}
    );
  `;

  console.log(`[Migration] SUCCESS! All tables created, canonical data seeded, admin bootstrapped.`);
}

migrate().catch((err) => {
  console.error("[Migration] CRITICAL ERROR:", err);
  process.exit(1);
});
