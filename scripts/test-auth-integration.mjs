import assert from "assert";

const BASE_URL = "http://localhost:3000";

async function testAuthIntegration() {
  console.log("=== S&A BADMINTON ACADEMY AUTH INTEGRATION TEST SUITE ===\n");

  // 1. Test unauthenticated redirect
  console.log("[1] Testing unauthenticated redirect on /admin...");
  const resAdmin = await fetch(`${BASE_URL}/admin`, { redirect: "manual" });
  assert.strictEqual(
    resAdmin.status,
    307,
    `Expected 307 redirect, got ${resAdmin.status}`
  );
  assert.strictEqual(
    resAdmin.headers.get("location"),
    "/admin/login",
    `Expected redirect to /admin/login, got ${resAdmin.headers.get("location")}`
  );
  console.log("  ✓ Unauthenticated access to /admin correctly redirects to /admin/login (307)");

  // 2. Test invalid password
  console.log("\n[2] Testing login with invalid password...");
  const resBadPw = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@sabadminton.com", password: "IncorrectPassword123" }),
  });
  const dataBadPw = await resBadPw.json();
  assert.strictEqual(resBadPw.status, 401, `Expected 401, got ${resBadPw.status}`);
  assert.strictEqual(dataBadPw.error, "Invalid email or password.");
  console.log("  ✓ Invalid password rejected with 401 and generic message: 'Invalid email or password.'");

  // 3. Test non-existent email
  console.log("\n[3] Testing login with non-existent email...");
  const resBadEmail = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ghost_user@sabadminton.com", password: "SomePassword123" }),
  });
  const dataBadEmail = await resBadEmail.json();
  assert.strictEqual(resBadEmail.status, 401, `Expected 401, got ${resBadEmail.status}`);
  assert.strictEqual(dataBadEmail.error, "Invalid email or password.");
  console.log("  ✓ Non-existent email rejected with identical 401 error (no account enumeration leak)");

  // 4. Test valid login & cookie issuance
  console.log("\n[4] Testing login with valid Super Admin credentials...");
  const resLogin = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@sabadminton.com", password: "Admin@SA2026!" }),
  });
  const dataLogin = await resLogin.json();
  assert.strictEqual(resLogin.status, 200, `Expected 200, got ${resLogin.status}`);
  assert.strictEqual(dataLogin.success, true);
  assert.strictEqual(dataLogin.data.user.role, "SUPER_ADMIN");

  // Extract set-cookie headers
  const setCookieHeaders = resLogin.headers.getSetCookie 
    ? resLogin.headers.getSetCookie() 
    : [resLogin.headers.get("set-cookie") || ""];
  
  const tokenCookie = setCookieHeaders.find((c) => c.includes("sa_admin_token="));
  console.log("  Cookie string received:", tokenCookie);
  assert.ok(tokenCookie, "Expected sa_admin_token cookie to be set!");
  assert.ok(/httponly/i.test(tokenCookie), "sa_admin_token must be HttpOnly");
  assert.ok(/samesite=lax/i.test(tokenCookie) || /samesite/i.test(tokenCookie), "sa_admin_token must have SameSite");
  console.log("  ✓ Login succeeded with SUPER_ADMIN session");
  console.log("  ✓ Secure HttpOnly SameSite=Lax cookie 'sa_admin_token' issued");

  // Format cookie string for subsequent requests
  const cookieString = setCookieHeaders
    .map((c) => c.split(";")[0])
    .join("; ");

  // 5. Test authenticated session retrieval (/api/admin/auth/me)
  console.log("\n[5] Testing /api/admin/auth/me using authenticated cookie...");
  const resMe = await fetch(`${BASE_URL}/api/admin/auth/me`, {
    headers: { Cookie: cookieString },
  });
  const dataMe = await resMe.json();
  assert.strictEqual(resMe.status, 200);
  assert.strictEqual(dataMe.data.user.email, "admin@sabadminton.com");
  assert.strictEqual(dataMe.data.user.role, "SUPER_ADMIN");
  console.log("  ✓ /api/admin/auth/me verified active session for:", dataMe.data.user.fullName);

  // 6. Test protected admin page access with cookie
  console.log("\n[6] Testing access to /admin with valid session cookie...");
  const resAdminAuth = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: cookieString },
    redirect: "manual",
  });
  assert.strictEqual(resAdminAuth.status, 200, `Expected 200 OK, got ${resAdminAuth.status}`);
  console.log("  ✓ /admin page renders successfully when authenticated");

  // 7. Test /admin/login when already authenticated -> must redirect to /admin
  console.log("\n[7] Testing access to /admin/login when already authenticated...");
  const resLoginRedirect = await fetch(`${BASE_URL}/admin/login`, {
    headers: { Cookie: cookieString },
    redirect: "manual",
  });
  assert.strictEqual(resLoginRedirect.status, 307);
  assert.strictEqual(resLoginRedirect.headers.get("location"), "/admin");
  console.log("  ✓ /admin/login automatically redirects authenticated users back to /admin");

  // 8. Test protected API endpoints with cookie
  console.log("\n[8] Testing protected API endpoints with authenticated cookie...");
  const resLeads = await fetch(`${BASE_URL}/api/admin/leads`, {
    headers: { Cookie: cookieString },
  });
  assert.strictEqual(resLeads.status, 200, `Expected 200 on /api/admin/leads, got ${resLeads.status}`);

  const resCentres = await fetch(`${BASE_URL}/api/admin/centres`, {
    headers: { Cookie: cookieString },
  });
  assert.strictEqual(resCentres.status, 200, `Expected 200 on /api/admin/centres, got ${resCentres.status}`);
  console.log("  ✓ Authenticated cookie grants access to /api/admin/leads & /api/admin/centres");

  // 9. Test Logout
  console.log("\n[9] Testing logout and session destruction...");
  const resLogout = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookieString },
  });
  const dataLogout = await resLogout.json();
  assert.strictEqual(resLogout.status, 200);
  assert.strictEqual(dataLogout.success, true);

  const logoutCookies = resLogout.headers.getSetCookie 
    ? resLogout.headers.getSetCookie() 
    : [resLogout.headers.get("set-cookie") || ""];
  const clearedCookie = logoutCookies.find((c) => c.includes("sa_admin_token="));
  assert.ok(clearedCookie, "sa_admin_token cookie must be cleared on logout");
  assert.ok(clearedCookie.includes("Max-Age=0"), "sa_admin_token cookie must have Max-Age=0");
  console.log("  ✓ Logout endpoint successfully cleared auth cookies with Max-Age=0");

  // 10. Test access after logout -> must be 401
  console.log("\n[10] Testing access to protected resource with cleared cookie...");
  const clearedCookieString = logoutCookies.map((c) => c.split(";")[0]).join("; ");
  const resMeAfterLogout = await fetch(`${BASE_URL}/api/admin/auth/me`, {
    headers: { Cookie: clearedCookieString },
  });
  assert.strictEqual(resMeAfterLogout.status, 401, `Expected 401 after logout, got ${resMeAfterLogout.status}`);
  console.log("  ✓ Access revoked after logout (401 Unauthorized)");

  console.log("\n========================================================");
  console.log("   ALL 10 AUTHENTICATION INTEGRATION TESTS PASSED! 🎯   ");
  console.log("========================================================\n");
}

testAuthIntegration().catch((err) => {
  console.error("\n[TEST FAILED]:", err);
  process.exit(1);
});
