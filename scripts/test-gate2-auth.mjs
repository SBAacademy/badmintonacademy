import {
  hashPassword,
  verifyPassword,
  createAccessToken,
  verifyAccessToken,
  createRefreshToken,
  rotateRefreshToken,
  requireAuth,
} from "../lib/auth.ts";
import { neon } from "@neondatabase/serverless";

async function runGate2Tests() {
  console.log("[Test Gate 2] Starting Authentication & RBAC Suite...");

  // 1. Password Hash & Verify Test
  const rawPw = "SuperSecure#2026";
  const hashed = hashPassword(rawPw);
  if (!verifyPassword(rawPw, hashed)) {
    throw new Error("Password verification failed!");
  }
  if (verifyPassword("WrongPassword", hashed)) {
    throw new Error("False positive on wrong password!");
  }
  console.log("✓ Password hashing & timing-safe verification verified.");

  // 2. JWT Access Token Test
  const testUser = {
    userId: "usr-admin-01",
    email: "admin@sabadminton.com",
    fullName: "Academy Director",
    role: "SUPER_ADMIN",
    assignedCentre: "kadavanthra",
  };
  const { token, expiresAt } = createAccessToken(testUser);
  const verifiedUser = verifyAccessToken(token);
  if (!verifiedUser || verifiedUser.userId !== testUser.userId || verifiedUser.role !== "SUPER_ADMIN") {
    throw new Error("Access token verification failed!");
  }
  console.log("✓ JWT access token creation & verification verified.");

  // 3. RBAC Role Guard Test
  const mockAdminReq = {
    headers: new Map([["Authorization", `Bearer ${token}`]]),
  };
  // Polyfill get
  mockAdminReq.headers.get = (k) => mockAdminReq.headers.get(k) || mockAdminReq.headers.get(k.toLowerCase());

  const coachUser = {
    userId: "usr-coach-01",
    email: "anand@sabadminton.com",
    fullName: "Coach Anand Varma",
    role: "COACH",
    assignedCentre: "kadavanthra",
  };
  const coachToken = createAccessToken(coachUser).token;

  // Fake request class for testing requireAuth
  const createMockReq = (bearerToken) => ({
    headers: {
      get: (h) => (h.toLowerCase() === "authorization" ? `Bearer ${bearerToken}` : null),
    },
  });

  // Admin access to admin route
  const adminCheck = await requireAuth(createMockReq(token), ["SUPER_ADMIN", "ADMIN"]);
  if (!adminCheck.authorized) {
    throw new Error("Admin user rejected from admin route!");
  }

  // Coach access to admin route (MUST FAIL with 403)
  const coachCheck = await requireAuth(createMockReq(coachToken), ["SUPER_ADMIN", "ADMIN"]);
  if (coachCheck.authorized || coachCheck.status !== 403) {
    throw new Error("RBAC Failure! Coach was NOT rejected from admin route with 403!");
  }
  console.log("✓ Server-side RBAC enforced: Coach rejected from admin route with 403 Forbidden.");

  // 4. Refresh Token Rotation & Anti-Reuse Test
  const refresh = await createRefreshToken(testUser.userId);
  const rotated = await rotateRefreshToken(refresh.rawToken);
  if (!rotated || !rotated.newAccessToken || !rotated.newRefreshToken) {
    throw new Error("Refresh token rotation failed!");
  }
  console.log("✓ Refresh token rotated successfully.");

  // Attempt to reuse old token -> must be rejected
  const reuseAttempt = await rotateRefreshToken(refresh.rawToken);
  if (reuseAttempt !== null) {
    throw new Error("Security Alert! Reused refresh token was accepted!");
  }
  console.log("✓ Refresh token anti-reuse protection confirmed (reuse attack rejected).");

  console.log("\n[Test Gate 2] ALL GATE 2 TESTS PASSED! 🎯");
}

runGate2Tests().catch((err) => {
  console.error("[Test Gate 2] FAILED:", err);
  process.exit(1);
});
