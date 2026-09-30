import { neon } from "@neondatabase/serverless";
import crypto from "crypto";
import readline from "readline";

// Scrypt password hashing with cryptographically random 16-byte salt
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function setupSuperAdmin() {
  console.log("\n========================================================");
  console.log("   S&A BADMINTON ACADEMY — SUPER ADMIN SETUP UTILITY     ");
  console.log("========================================================\n");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL environment variable is not defined.");
    console.error("Please run with: node --env-file=.env scripts/setup-super-admin.mjs\n");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  // 1. Gather inputs from environment or interactive prompt
  let email = process.env.ADMIN_EMAIL;
  let password = process.env.ADMIN_PASSWORD;
  let fullName = process.env.ADMIN_NAME || "Academy Director";

  if (!email) {
    if (process.stdin.isTTY) {
      email = await prompt("Enter Super Admin Email [default: admin@sabadminton.com]: ");
      if (!email) email = "admin@sabadminton.com";
    } else {
      email = "admin@sabadminton.com";
    }
  }

  email = email.toLowerCase().trim();

  if (!password) {
    if (process.stdin.isTTY) {
      password = await prompt("Enter Super Admin Password (min 8 characters): ");
    }
  }

  if (!password || password.length < 8) {
    console.error("\n[Error] Administrator password must be at least 8 characters long.");
    console.error("Usage with environment variables:");
    console.error('ADMIN_EMAIL="admin@sabadminton.com" ADMIN_PASSWORD="YourStrongPassword!" node --env-file=.env scripts/setup-super-admin.mjs\n');
    process.exit(1);
  }

  console.log(`\n[1/3] Securing credentials for: ${email}`);
  const passwordHash = hashPassword(password);
  const userId = `usr-admin-${Date.now().toString(36)}`;

  console.log("[2/3] Provisioning Super Admin in PostgreSQL database...");

  // Upsert user into database
  await sql`
    INSERT INTO users (
      id, email, password_hash, full_name, role, phone, assigned_centre, is_active, updated_at
    )
    VALUES (
      ${userId},
      ${email},
      ${passwordHash},
      ${fullName},
      'SUPER_ADMIN',
      '+91 98460 12345',
      'kadavanthra',
      TRUE,
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      role = 'SUPER_ADMIN',
      full_name = EXCLUDED.full_name,
      is_active = TRUE,
      updated_at = NOW();
  `;

  // Revoke previous refresh tokens for this email to enforce fresh login
  await sql`
    UPDATE refresh_tokens 
    SET revoked = TRUE 
    WHERE user_id IN (SELECT id FROM users WHERE email = ${email});
  `;

  // Write audit trail
  const auditId = `aud-setup-${Date.now()}`;
  await sql`
    INSERT INTO audit_logs (
      id, actor_user_id, actor_name, action, entity, entity_id, new_data
    )
    VALUES (
      ${auditId},
      'cli-setup-script',
      'Super Admin CLI Utility',
      'SUPER_ADMIN_PROVISIONED',
      'users',
      ${email},
      ${JSON.stringify({ email, role: 'SUPER_ADMIN', timestamp: new Date().toISOString() })}
    );
  `;

  console.log("[3/3] Super Admin account active and verified in database.");
  console.log("\n========================================================");
  console.log("   SUPER ADMIN SETUP SUCCESSFUL!                       ");
  console.log(`   Account:   ${email}`);
  console.log("   Role:      SUPER_ADMIN");
  console.log("   Status:    ACTIVE");
  console.log("========================================================\n");
}

setupSuperAdmin().catch((err) => {
  console.error("\n[CRITICAL ERROR] Failed to setup Super Admin:", err);
  process.exit(1);
});
