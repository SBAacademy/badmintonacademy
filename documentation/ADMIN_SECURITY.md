# S&A Badminton Academy Management Platform
## Security Architecture & Audit Report

**Document Version:** 1.0  
**Specification Date:** September 7, 2026  
**Status:** Approved Architecture  

---

## 1. Security Baseline & Key Architectural Rules

1. **Zero Client Secrets:** The Flutter application (`s_a_admin/`) contains **zero** database connection strings, database passwords, or JWT signing keys. All access to the database occurs strictly through Next.js server route handlers.
2. **Platform-Grade Key Storage:** 
   - **macOS / iOS:** Stored in Apple Keychain via `flutter_secure_storage`.
   - **Android:** Stored using Android Keystore and `EncryptedSharedPreferences`.
3. **Dual Token Architecture:**
   - **Access Token:** Short-lived (15 minutes), signed with `JWT_SECRET`, containing `userId`, `email`, and `role`.
   - **Refresh Token:** Cryptographically secure high-entropy string (64 bytes hex), stored with SHA-256 hash in `refresh_tokens` table with automated token rotation upon renewal and instant revocation upon logout.
4. **Password Hashing:** Passwords hashed with `scrypt` (or standard `bcrypt` with work factor 12) including a unique cryptographic salt per user. Plaintext passwords are never logged or stored.
5. **Role-Based Authorization:** Every private API endpoint enforces permissions server-side (`requireRole`). UI hiding in Flutter is purely for user experience and never trusted as a security barrier.
6. **SQL Injection Immunity:** All database operations utilize parameterized queries (`sql\`...\`` via `@neondatabase/serverless`) to prevent SQL injection.
7. **Rate Limiting & Honeypots:** Public enquiry and authentication endpoints feature honeypot validation (`botAddress`) and IP-based rate limiting to prevent credential brute-forcing.
8. **Sensitive Payment Data Exclusion:** The system tracks fee records, bank reference numbers, and UPI transaction IDs; **credit card numbers, CVVs, and banking credentials are never requested or stored.**
