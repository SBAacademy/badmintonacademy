import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "output", "auth-verification");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runBrowserVerification() {
  console.log("Starting Puppeteer browser verification...");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  
  // Desktop viewport
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Unauthenticated direct access to /admin -> should redirect to /admin/login
  console.log("[1/6] Navigating to http://localhost:3000/admin (unauthenticated)...");
  await page.goto("http://localhost:3000/admin", { waitUntil: "networkidle2" });
  const currentUrl = page.url();
  console.log("Current URL after redirection:", currentUrl);
  if (!currentUrl.includes("/admin/login")) {
    throw new Error(`Expected redirect to /admin/login, got: ${currentUrl}`);
  }
  await page.screenshot({ path: path.join(OUTPUT_DIR, "01_login_page_desktop.png") });
  console.log("✓ Captured 01_login_page_desktop.png");

  // 2. Mobile (iPhone 14) viewport check
  console.log("[2/6] Checking iPhone mobile viewport...");
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.screenshot({ path: path.join(OUTPUT_DIR, "02_login_page_iphone.png") });
  console.log("✓ Captured 02_login_page_iphone.png");

  // Switch back to desktop for interactive flow
  await page.setViewport({ width: 1440, height: 900 });

  // 3. Test Invalid Credentials
  console.log("[3/6] Testing invalid credentials submission...");
  await page.type("#admin-email", "admin@sabadminton.com");
  await page.type("#admin-password", "WrongPassword123");
  await page.click("#admin-login-submit");
  await page.waitForSelector('[role="alert"]', { timeout: 5000 });
  const errorText = await page.$eval('[role="alert"]', (el) => el.textContent);
  console.log("Error message displayed:", errorText);
  await page.screenshot({ path: path.join(OUTPUT_DIR, "03_invalid_login_error.png") });
  console.log("✓ Captured 03_invalid_login_error.png");

  // 4. Test Forgot Password Modal
  console.log("[4/6] Testing forgot password modal...");
  const forgotBtn = await page.waitForSelector("button::-p-text(Forgot password?)");
  await forgotBtn.click();
  await page.waitForSelector("h3::-p-text(Administrator Password Reset)", { timeout: 3000 });
  await page.screenshot({ path: path.join(OUTPUT_DIR, "04_forgot_password_modal.png") });
  console.log("✓ Captured 04_forgot_password_modal.png");
  
  // Close modal
  const closeModalBtn = await page.waitForSelector("button::-p-text(Understood, Back to Login)");
  await closeModalBtn.click();
  await page.waitForFunction(() => !document.body.innerText.includes("Administrator Password Reset"));

  // 5. Test Valid Login
  console.log("[5/6] Testing valid credentials submission...");
  // Clear password
  await page.click("#admin-password", { clickCount: 3 });
  await page.keyboard.press("Backspace");
  await page.type("#admin-password", "Admin@SA2026!");
  await page.click("#admin-login-submit");

  // Wait for navigation to /admin and full dashboard render
  await page.waitForFunction(() => window.location.pathname === "/admin", { timeout: 10000 });
  const logoutBtn = await page.waitForSelector("button::-p-text(Sign Out / Logout)", { timeout: 10000 });
  // Wait a short moment for lead metrics/overview cards to populate
  await new Promise((r) => setTimeout(r, 1000));
  console.log("Successfully logged in and reached /admin dashboard!");
  await page.screenshot({ path: path.join(OUTPUT_DIR, "05_admin_dashboard_authenticated.png") });
  console.log("✓ Captured 05_admin_dashboard_authenticated.png");

  // 6. Test Logout
  console.log("[6/6] Testing logout button...");
  await logoutBtn.click();

  // Wait for redirect back to /admin/login
  await page.waitForFunction(() => window.location.pathname === "/admin/login", { timeout: 10000 });
  console.log("Successfully logged out and redirected to /admin/login!");
  await page.screenshot({ path: path.join(OUTPUT_DIR, "06_post_logout_login_page.png") });
  console.log("✓ Captured 06_post_logout_login_page.png");

  await browser.close();
  console.log("\nAll browser verification screenshots captured successfully in output/auth-verification/!");
}

runBrowserVerification().catch((err) => {
  console.error("Browser verification failed:", err);
  process.exit(1);
});
