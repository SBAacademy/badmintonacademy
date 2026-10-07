import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, "../SBA_HANDOVER_ASSETS");
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

async function captureScreenshots() {
  console.log("📸 Starting comprehensive screenshot capture for Handover Documentation...");

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  const routes = [
    { url: "http://localhost:3000/", file: "01_homepage_hero.png", name: "Homepage" },
    { url: "http://localhost:3000/branches", file: "02_branches_directory.png", name: "Branches Directory" },
    { url: "http://localhost:3000/kadavanthra", file: "03_kadavanthra_landing.png", name: "Kadavanthra Local Centre" },
    { url: "http://localhost:3000/coaches", file: "04_coaches_panel.png", name: "Coaches Panel" },
    { url: "http://localhost:3000/programs", file: "05_programs_curriculum.png", name: "Programs Curriculum" },
    { url: "http://localhost:3000/events", file: "06_events_tournaments.png", name: "Events & Tournaments" },
    { url: "http://localhost:3000/gallery", file: "07_gallery_showcase.png", name: "Gallery Showcase" },
    { url: "http://localhost:3000/contact", file: "08_contact_lead_form.png", name: "Contact & Free Trial Form" },
    { url: "http://localhost:3000/admin/login", file: "09_admin_login.png", name: "Admin Login Portal" },
  ];

  for (const r of routes) {
    try {
      console.log(`Capturing ${r.name} (${r.url})...`);
      await page.goto(r.url, { waitUntil: "networkidle2", timeout: 20000 });
      await new Promise((resolve) => setTimeout(resolve, 800));
      await page.screenshot({ path: path.join(ASSETS_DIR, r.file) });
      console.log(`✓ Saved ${r.file}`);
    } catch (err) {
      console.warn(`Could not capture ${r.name}:`, err.message);
    }
  }

  // Mobile viewport capture
  try {
    console.log("Capturing Mobile Viewport (iPhone 14)...");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise((resolve) => setTimeout(resolve, 800));
    await page.screenshot({ path: path.join(ASSETS_DIR, "10_mobile_homepage.png") });
    console.log(`✓ Saved 10_mobile_homepage.png`);
  } catch (err) {
    console.warn("Could not capture mobile view:", err.message);
  }

  // Login into admin dashboard to capture dashboard screen
  try {
    console.log("Logging into Admin Dashboard...");
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle2", timeout: 20000 });
    await page.type("#admin-email", "admin@sabadminton.com");
    await page.type("#admin-password", "Admin@SA2026!");
    await page.click("#admin-login-submit");
    await page.waitForFunction(() => window.location.pathname === "/admin", { timeout: 10000 });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await page.screenshot({ path: path.join(ASSETS_DIR, "11_admin_dashboard_overview.png") });
    console.log(`✓ Saved 11_admin_dashboard_overview.png`);

    // Click Student Inquiries tab
    const leadsTab = await page.waitForSelector("button::-p-text(Student Inquiries)", { timeout: 5000 });
    if (leadsTab) {
      await leadsTab.click();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.screenshot({ path: path.join(ASSETS_DIR, "12_admin_leads_manager.png") });
      console.log(`✓ Saved 12_admin_leads_manager.png`);
    }

    // Click Centres tab
    const centresTab = await page.waitForSelector("button::-p-text(Centres & Hubs)", { timeout: 5000 });
    if (centresTab) {
      await centresTab.click();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await page.screenshot({ path: path.join(ASSETS_DIR, "13_admin_centres_manager.png") });
      console.log(`✓ Saved 13_admin_centres_manager.png`);
    }
  } catch (err) {
    console.warn("Could not capture authenticated admin dashboard:", err.message);
  }

  await browser.close();
  console.log("✨ All screenshot captures complete in SBA_HANDOVER_ASSETS!");
}

captureScreenshots().catch(console.error);
