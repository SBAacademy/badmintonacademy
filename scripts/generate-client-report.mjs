import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PDF = path.join(__dirname, "../SAA_Badminton_Academy_Website_Admin_Progress_Report_30-09-2026.pdf");
const PREVIEWS_DIR = path.join(__dirname, "../output/pdf-previews");

if (!fs.existsSync(PREVIEWS_DIR)) {
  fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>S&A Badminton Academy — Latest Progress Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  @page {
    size: A4 portrait;
    margin: 0;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1E293B;
    background-color: #F8FAFC;
    line-height: 1.45;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    width: 210mm;
    height: 297mm;
    page-break-after: always;
    page-break-inside: avoid;
    position: relative;
    background: #FFFFFF;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 14mm 16mm 14mm 16mm;
  }

  /* -------------------------------------------------------------
     COVER PAGE STYLING
     ------------------------------------------------------------- */
  .page-cover {
    padding: 0;
    background: radial-gradient(circle at 100% 0%, #1E293B 0%, #0F172A 70%, #090D16 100%);
    color: #FFFFFF;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
  }

  .cover-decor-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #10B981, #059669, #38BDF8);
  }

  .cover-grid-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.7;
    pointer-events: none;
  }

  .cover-header {
    position: relative;
    z-index: 2;
    padding: 24mm 22mm 0 22mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .cover-brand-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);
    padding: 8px 16px;
    border-radius: 9999px;
  }

  .brand-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #10B981;
    box-shadow: 0 0 10px #10B981;
  }

  .brand-tag {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #E2E8F0;
  }

  .cover-doc-id {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    color: #94A3B8;
    letter-spacing: 0.08em;
  }

  .cover-body {
    position: relative;
    z-index: 2;
    padding: 0 22mm;
  }

  .cover-kicker {
    display: inline-block;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #38BDF8;
    margin-bottom: 12px;
  }

  .cover-title {
    font-size: 38px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: #FFFFFF;
    margin-bottom: 12px;
  }

  .cover-title span {
    color: #38BDF8;
  }

  .cover-subtitle {
    font-size: 15.5px;
    font-weight: 500;
    color: #94A3B8;
    line-height: 1.5;
    margin-bottom: 28px;
    max-width: 520px;
  }

  .cover-status-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-left: 5px solid #F59E0B;
    border-radius: 12px;
    padding: 16px 20px;
    backdrop-filter: blur(12px);
    margin-bottom: 26px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }

  .cover-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.3);
    padding: 5px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    color: #FBBF24;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }

  .cover-status-desc {
    font-size: 12.5px;
    color: #CBD5E1;
    line-height: 1.5;
  }

  .cover-footer {
    position: relative;
    z-index: 2;
    padding: 20mm 22mm 20mm 22mm;
    background: rgba(10, 15, 26, 0.6);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .cover-meta-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    gap: 20px;
  }

  .meta-item-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #64748B;
    margin-bottom: 4px;
  }

  .meta-item-value {
    font-size: 13px;
    font-weight: 600;
    color: #F1F5F9;
  }

  .meta-item-value a {
    color: #38BDF8;
    text-decoration: none;
  }

  /* -------------------------------------------------------------
     INNER PAGE STYLING
     ------------------------------------------------------------- */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
    margin-bottom: 12px;
    border-bottom: 1px solid #E2E8F0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-brand {
    font-size: 10.5px;
    font-weight: 800;
    color: #0F172A;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .header-sep {
    color: #CBD5E1;
  }

  .header-doc-name {
    font-size: 10px;
    font-weight: 500;
    color: #64748B;
  }

  .header-right {
    font-size: 10px;
    font-weight: 600;
    color: #0284C7;
  }

  .page-footer {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid #E2E8F0;
    font-size: 9.5px;
    color: #94A3B8;
  }

  .footer-left {
    font-weight: 500;
  }

  .footer-right {
    font-weight: 600;
    color: #64748B;
  }

  /* -------------------------------------------------------------
     CONTENT BLOCKS & TYPOGRAPHY
     ------------------------------------------------------------- */
  .section-title {
    font-size: 13.5px;
    font-weight: 800;
    color: #0F172A;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .section-number {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    color: #0284C7;
    background: #E0F2FE;
    padding: 1.5px 5.5px;
    border-radius: 4px;
  }

  .lead-box {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-left: 4px solid #0284C7;
    padding: 10px 13px;
    border-radius: 0 6px 6px 0;
    margin-bottom: 11px;
    font-size: 11px;
    color: #334155;
    line-height: 1.5;
  }

  .card-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
    margin-bottom: 10px;
  }

  .card-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;
  }

  .content-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 7px;
    padding: 10px 12px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }

  .card-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }

  .card-title {
    font-size: 12px;
    font-weight: 700;
    color: #0F172A;
  }

  .card-desc {
    font-size: 10.5px;
    color: #475569;
    line-height: 1.45;
  }

  .card-items-list {
    margin-top: 5px;
    padding-left: 14px;
    font-size: 10px;
    color: #475569;
    line-height: 1.45;
  }

  .card-items-list li {
    margin-bottom: 2px;
  }

  /* Status Badges */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 9.5px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 9999px;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .badge-completed {
    background-color: #ECFDF5;
    color: #065F46;
    border: 1px solid #A7F3D0;
  }

  .badge-testing {
    background-color: #FFFBEB;
    color: #92400E;
    border: 1px solid #FDE68A;
  }

  .badge-in-progress {
    background-color: #EFF6FF;
    color: #1E40AF;
    border: 1px solid #BFDBFE;
  }

  .badge-pending {
    background-color: #F8FAFC;
    color: #475569;
    border: 1px solid #CBD5E1;
  }

  .badge-verification {
    background-color: #F0FDFA;
    color: #0F766E;
    border: 1px solid #99F6E4;
  }

  /* Tables */
  .status-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5px;
    margin-bottom: 9px;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    overflow: hidden;
  }

  .status-table th {
    background: #0F172A;
    color: #FFFFFF;
    font-weight: 700;
    text-align: left;
    padding: 5px 10px;
    font-size: 9.5px;
    letter-spacing: 0.02em;
  }

  .status-table td {
    padding: 4px 10px;
    border-bottom: 1px solid #E2E8F0;
    color: #334155;
    font-weight: 500;
  }

  .status-table tr:last-child td {
    border-bottom: none;
  }

  .status-table tr:nth-child(even) td {
    background-color: #F8FAFC;
  }

  .checklist {
    list-style: none;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 9px;
    margin-bottom: 9px;
  }

  .checklist-item {
    font-size: 10px;
    color: #334155;
    display: flex;
    align-items: flex-start;
    gap: 6px;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 5px;
    padding: 5px 8px;
    line-height: 1.35;
  }

  .checklist-icon {
    font-size: 9px;
    color: #0284C7;
    margin-top: 1px;
  }

  .highlight-banner {
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
    border-radius: 7px;
    padding: 10px 14px;
    color: #FFFFFF;
    margin-bottom: 8px;
    border-left: 4px solid #F59E0B;
  }

  .highlight-title {
    font-size: 11px;
    font-weight: 700;
    color: #FBBF24;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 3px;
  }

  .highlight-text {
    font-size: 10px;
    color: #E2E8F0;
    line-height: 1.45;
  }

  .closing-note-box {
    background: #F8FAFC;
    border: 1px solid #CBD5E1;
    border-left: 4px solid #059669;
    padding: 9px 13px;
    border-radius: 0 7px 7px 0;
  }

  .closing-title {
    font-size: 11px;
    font-weight: 700;
    color: #0F172A;
    margin-bottom: 3px;
  }

  .closing-text {
    font-size: 10px;
    color: #475569;
    line-height: 1.45;
  }

  .centre-tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 5px;
  }

  .centre-tag {
    background: #EFF6FF;
    border: 1px solid #BFDBFE;
    color: #1D4ED8;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .meta-sign-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-top: 7px;
    padding-top: 6px;
    border-top: 1px dashed #CBD5E1;
    font-size: 9px;
    color: #64748B;
  }

  .meta-sign-label {
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #475569;
  }

</style>
</head>
<body>

<!-- =============================================================
     PAGE 1: COVER PAGE
     ============================================================= -->
<div class="page page-cover">
  <div class="cover-decor-top"></div>
  <div class="cover-grid-bg"></div>

  <!-- Header -->
  <div class="cover-header">
    <div class="cover-brand-pill">
      <div class="brand-dot"></div>
      <div class="brand-tag">S&A Badminton Academy</div>
    </div>
    <div class="cover-doc-id">DOC: SAA-DEV-2026-V1</div>
  </div>

  <!-- Body Title & Status -->
  <div class="cover-body">
    <div class="cover-kicker">Website Development & Admin Panel</div>
    <h1 class="cover-title">Latest Development &<br>Testing <span>Progress Report</span></h1>
    <p class="cover-subtitle">
      A comprehensive client-facing review of completed modules, verification workflows, administrative systems, and final quality assurance readiness.
    </p>

    <div class="cover-status-card">
      <div class="cover-status-badge">
        <span>🟡</span> CURRENT STATUS: FINAL TESTING & FINALISATION IN PROGRESS
      </div>
      <p class="cover-status-desc">
        Core website and Admin Panel development has been completed. The project is currently in the active final testing, verification, quality-assurance, and finalisation stage prior to formal handover.
      </p>
    </div>
  </div>

  <!-- Footer Metadata -->
  <div class="cover-footer">
    <div class="cover-meta-grid">
      <div>
        <div class="meta-item-label">Client / Organization</div>
        <div class="meta-item-value">S&A Badminton Academy</div>
      </div>
      <div>
        <div class="meta-item-label">Report Date</div>
        <div class="meta-item-value">30 September 2026</div>
      </div>
      <div>
        <div class="meta-item-label">Official Website</div>
        <div class="meta-item-value">
          <a href="https://www.soorajbadmintonacademy.in" target="_blank">www.soorajbadmintonacademy.in</a>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- =============================================================
     PAGE 2: EXECUTIVE SUMMARY & WEBSITE INFRASTRUCTURE
     ============================================================= -->
<div class="page">
  <div class="page-header">
    <div class="header-left">
      <span class="header-brand">S&A Badminton Academy</span>
      <span class="header-sep">/</span>
      <span class="header-doc-name">Executive Summary & Website Infrastructure</span>
    </div>
    <div class="header-right">30 September 2026</div>
  </div>

  <!-- 1. Executive Summary -->
  <div class="section-title">
    <span class="section-number">01</span>
    <span>Executive Project Summary</span>
  </div>

  <div class="lead-box">
    The website and Admin Panel development has progressed significantly, with the core website, administration system, centre management, coach management, content-management modules, enquiry functionality, authentication, and responsive phone optimisation substantially completed. The project is currently undergoing final testing and verification.
    <br><br>
    The remaining work primarily consists of administrator management, centre-wise verification, final WhatsApp/contact testing, mobile testing, final content confirmation, quality assurance, and final handover preparation. Any issues identified during the development and testing period are part of the normal development and quality-assurance process and are being addressed systematically before final handover.
  </div>

  <!-- 2. Website Development -->
  <div class="section-title">
    <span class="section-number">02</span>
    <span>Website Development</span>
  </div>

  <div class="content-card" style="margin-bottom: 10px;">
    <div class="card-header-row">
      <div class="card-title">Main Public Portal & Experience Layer</div>
      <span class="badge badge-completed">✅ Completed & Phone Optimized</span>
    </div>
    <p class="card-desc">
      The main public-facing website development has been fully implemented across all required pages and key functional components. The portal communicates the academy's coaching ethos, facility standards, program tiers, and regional presence with high-performance responsive engineering.
    </p>
    <ul class="card-items-list">
      <li><strong>Website Pages:</strong> Home, About Us, Training Programs, Centres/Branches, Coaches, Tournaments & Events, Photo Gallery, Blog Articles, and Contact.</li>
      <li><strong>Content Sections:</strong> Athletic highlights, training schedules, age-group pathways, student testimonials, and competitive track records.</li>
      <li><strong>Centre Information:</strong> Dynamic location profiles, training hours, amenities, court specifications, and interactive map directions.</li>
      <li><strong>Coach Sections:</strong> Hierarchical coaching staff profiles showcasing credentials, national achievements, and direct contact options.</li>
      <li><strong>Enquiry Workflows:</strong> Seamless trial session bookings, walk-in inquiries, and direct communication funnels.</li>
      <li><strong>Dynamic Content & APIs:</strong> Fast client-side transitions backed by optimized server-side rendering and PostgreSQL data layers.</li>
      <li><strong>Phone Optimisation:</strong> Complete mobile responsiveness implemented, with final cross-device testing currently continuing.</li>
    </ul>
  </div>

  <!-- 3. Domain & DNS and Centre-wise Pages -->
  <div class="card-grid-2">
    <div class="content-card">
      <div class="card-header-row">
        <div class="card-title">Domain & DNS Configuration</div>
        <span class="badge badge-completed">✅ Completed</span>
      </div>
      <p class="card-desc">
        The official academy domain has been connected and DNS records configured with global edge routing and active SSL encryption.
      </p>
      <ul class="card-items-list">
        <li>Official Domain: <strong>www.soorajbadmintonacademy.in</strong></li>
        <li>DNS configuration completed with full propagation.</li>
        <li>Website is globally accessible through the official domain.</li>
        <li>Strict HTTPS security and canonical redirection active.</li>
      </ul>
    </div>

    <div class="content-card">
      <div class="card-header-row">
        <div class="card-title">Centre-wise Dedicated Pages</div>
        <span class="badge badge-completed">✅ Completed</span>
      </div>
      <p class="card-desc">
        Individual, search-optimised pages for each training centre have been built and linked into the global academy navigation.
      </p>
      <ul class="card-items-list">
        <li>Individual centre pages implemented for all 5 regional hubs.</li>
        <li>Localized FAQs, maps, directions, court counts, and schedules.</li>
        <li>Currently included in the final verification process to guarantee complete content fidelity.</li>
      </ul>
    </div>
  </div>

  <div class="page-footer">
    <div class="footer-left">S&A Badminton Academy — Website Development & Admin Panel Progress Report</div>
    <div class="footer-right">Page 2 of 5</div>
  </div>
</div>

<!-- =============================================================
     PAGE 3: CENTRES, COACHES & ADMINISTRATIVE SYSTEM
     ============================================================= -->
<div class="page">
  <div class="page-header">
    <div class="header-left">
      <span class="header-brand">S&A Badminton Academy</span>
      <span class="header-sep">/</span>
      <span class="header-doc-name">Centres, Coaches & Administrative Operations</span>
    </div>
    <div class="header-right">30 September 2026</div>
  </div>

  <!-- Centre Management -->
  <div class="section-title">
    <span class="section-number">03</span>
    <span>Centre Management</span>
  </div>

  <div class="content-card" style="margin-bottom: 9px;">
    <div class="card-header-row">
      <div class="card-title">5 Regional Coaching Centres</div>
      <span class="badge badge-verification">✅ Completed — Final Verification Pending</span>
    </div>
    <p class="card-desc">
      The centre management implementation is complete across both the administrative backend and public interface. The remaining task is individual final verification across each centre to ensure complete consistency between the Admin Panel and the live website.
    </p>
    <div class="centre-tag-row">
      <span class="centre-tag">1. Kadavanthra (Headquarters)</span>
      <span class="centre-tag">2. Kumbalanghi Centre</span>
      <span class="centre-tag">3. Maradu Centre</span>
      <span class="centre-tag">4. Palluruthy Centre</span>
      <span class="centre-tag">5. Chullikal Centre</span>
    </div>
    <ul class="card-items-list" style="margin-top: 5px;">
      <li><strong>Final Verification Checklist:</strong> Centre names, direct web links, centre-wise pages, contact phone numbers, Google Maps location references, Admin Panel synchronization, and public website display consistency.</li>
    </ul>
  </div>

  <!-- Coach Management -->
  <div class="section-title">
    <span class="section-number">04</span>
    <span>Coach Management</span>
  </div>

  <div class="content-card" style="margin-bottom: 9px;">
    <div class="card-header-row">
      <div class="card-title">Coaching Faculty & Digital Profiles</div>
      <span class="badge badge-completed">✅ Completed</span>
    </div>
    <p class="card-desc">
      A comprehensive coaching management system has been implemented to showcase the academy's training team, certifications, national achievements, and contact channels.
    </p>
    <ul class="card-items-list">
      <li><strong>Coach Profiles & Photographs:</strong> High-resolution coach photographs and detailed biographical profiles are completed.</li>
      <li><strong>Hierarchy & Structure:</strong> Structured coaching hierarchy from Academy Director / Head Coach to senior trainers and assistant faculty.</li>
      <li><strong>Public Profiles:</strong> Dedicated public coach cards presenting specialized expertise, coaching philosophy, and tournament records.</li>
      <li><strong>Enquiry & Contact Workflows:</strong> Visitors can initiate direct coaching enquiries linked to specific training faculty.</li>
    </ul>
  </div>

  <!-- Admin Panel & Security Architecture -->
  <div class="section-title">
    <span class="section-number">05</span>
    <span>Admin Panel & Administrative Security</span>
  </div>

  <div class="card-grid-3">
    <div class="content-card">
      <div class="card-header-row">
        <div class="card-title">Admin Panel Core</div>
      </div>
      <span class="badge badge-completed" style="margin-bottom: 4px;">✅ Completed & Phone Opt.</span>
      <p class="card-desc" style="font-size: 10px;">
        Central administrative portal allowing staff to manage major website content and operational modules: Centres, Coaches, Gallery, Articles, Track Records, Reviews, Leads / Enquiries, and Contact settings. Optimised for mobile phone and desktop use.
      </p>
    </div>

    <div class="content-card">
      <div class="card-header-row">
        <div class="card-title">Admin Authentication</div>
      </div>
      <span class="badge badge-testing" style="margin-bottom: 4px;">✅ Completed & Testing</span>
      <p class="card-desc" style="font-size: 10px;">
        Authentication implemented to protect the Admin Panel from unauthorised access. Includes edge-level routing protection, secure login workflow, HttpOnly session cookies, scrypt password hashing, and active security verification.
      </p>
    </div>

    <div class="content-card">
      <div class="card-header-row">
        <div class="card-title">Administrator Mgmt.</div>
      </div>
      <span class="badge badge-in-progress" style="margin-bottom: 4px;">🔄 In Progress</span>
      <p class="card-desc" style="font-size: 10px;">
        Administrator management is currently being finalised. The objective is to allow authorised academy administrators to be managed through the Admin Panel with the required role-based permissions and access levels.
      </p>
    </div>
  </div>

  <div class="page-footer">
    <div class="footer-left">S&A Badminton Academy — Website Development & Admin Panel Progress Report</div>
    <div class="footer-right">Page 3 of 5</div>
  </div>
</div>

<!-- =============================================================
     PAGE 4: WORKFLOWS, CONTENT MODULES, TESTING & QA
     ============================================================= -->
<div class="page">
  <div class="page-header">
    <div class="header-left">
      <span class="header-brand">S&A Badminton Academy</span>
      <span class="header-sep">/</span>
      <span class="header-doc-name">Workflows, Content Modules & Quality Assurance</span>
    </div>
    <div class="header-right">30 September 2026</div>
  </div>

  <!-- WhatsApp & Enquiries -->
  <div class="card-grid-2">
    <div class="content-card">
      <div class="card-header-row">
        <div class="card-title">WhatsApp / Contact Configuration</div>
        <span class="badge badge-verification">✅ Completed — Final Testing</span>
      </div>
      <p class="card-desc">
        The previously identified redirection issue was treated as a configuration adjustment during testing. The configuration has been corrected and relevant workflows are now undergoing final verification:
      </p>
      <ul class="card-items-list">
        <li>WhatsApp action buttons across header, footer, and floaters.</li>
        <li>Admission enquiry actions and coach enquiry actions.</li>
        <li>Admin-managed contact details and fixed website contact references.</li>
        <li>Final testing ensures consistent redirection to the official academy number.</li>
      </ul>
    </div>

    <div class="content-card">
      <div class="card-header-row">
        <div class="card-title">Leads & Enquiries Management</div>
        <span class="badge badge-completed">✅ Completed</span>
      </div>
      <p class="card-desc">
        A complete enquiry management workflow has been developed and linked directly with the Admin Panel CRM interface:
      </p>
      <ul class="card-items-list">
        <li>Instant lead capture from website admission forms.</li>
        <li>Admin Panel visibility with status tracking (New, Contacted, Trial, Enrolled).</li>
        <li>One-click parent WhatsApp and Call actions from administrative dashboard.</li>
        <li>Final end-to-end workflow testing currently active.</li>
      </ul>
    </div>
  </div>

  <!-- Content Management Modules -->
  <div class="section-title">
    <span class="section-number">06</span>
    <span>Content Management Modules</span>
  </div>

  <div class="card-grid-2" style="margin-bottom: 9px;">
    <div class="content-card">
      <div class="card-header-row">
        <div class="card-title">Gallery Management</div>
        <span class="badge badge-completed">✅ Completed</span>
      </div>
      <p class="card-desc">
        Gallery management functionality has been implemented in the Admin Panel, enabling staff to upload, organize, and publish tournament photos, facility pictures, and academy highlights.
      </p>
    </div>

    <div class="content-card">
      <div class="card-header-row">
        <div class="card-title">Articles Management</div>
        <span class="badge badge-verification">✅ Completed — Final Confirm.</span>
      </div>
      <p class="card-desc">
        Articles management functionality is completed. The remaining item is final content confirmation before public release, allowing staff to publish badminton training articles and updates.
      </p>
    </div>

    <div class="content-card">
      <div class="card-header-row">
        <div class="card-title">Track Records Management</div>
        <span class="badge badge-completed">✅ Completed</span>
      </div>
      <p class="card-desc">
        Track Records management functionality has been completed in the Admin Panel to document and showcase student tournament trophies, championship medals, and district/state wins.
      </p>
    </div>

    <div class="content-card">
      <div class="card-header-row">
        <div class="card-title">Reviews & Feedback Management</div>
        <span class="badge badge-completed">✅ Completed</span>
      </div>
      <p class="card-desc">
        Reviews management functionality has been completed to allow administrators to review, moderate, and feature student and parent testimonials on the public portal.
      </p>
    </div>
  </div>

  <!-- Mobile & Desktop Optimization -->
  <div class="section-title">
    <span class="section-number">07</span>
    <span>Mobile & Desktop Optimisation</span>
  </div>

  <div class="content-card" style="margin-bottom: 9px;">
    <div style="display: flex; gap: 8px; margin-bottom: 5px; flex-wrap: wrap;">
      <span class="badge badge-completed">Website: ✅ Phone Optimized</span>
      <span class="badge badge-completed">Admin Panel: ✅ Phone Optimized</span>
      <span class="badge badge-in-progress">Mobile Testing: 🔄 In Progress</span>
      <span class="badge badge-completed">Desktop Testing: ✅ Completed</span>
    </div>
    <p class="card-desc">
      Phone optimisation has been implemented across the public website and Admin Panel. Final mobile testing is actively continuing across multiple screen sizes, verifying: Navigation, Layout, Buttons, Forms, Images, Admin controls, WhatsApp actions, Contact actions, and responsive content flow. Desktop testing has been completed.
    </p>
  </div>

  <!-- Final QA & Final Handover -->
  <div class="card-grid-2">
    <div class="content-card">
      <div class="card-header-row">
        <div class="card-title">Final Quality Assurance (QA)</div>
        <span class="badge badge-pending">⏳ Pending</span>
      </div>
      <p class="card-desc">
        Final QA will verify the complete system as one integrated product across website navigation, centre pages, coach profiles & photos, admin authentication & access, content modules, leads, WhatsApp redirection, contacts, mobile & desktop layouts, links, and data consistency. Any issue identified will be corrected before final handover.
      </p>
    </div>

    <div class="content-card">
      <div class="card-header-row">
        <div class="card-title">Final Handover Preparation</div>
        <span class="badge badge-pending">⏳ Pending</span>
      </div>
      <p class="card-desc">
        Final handover will take place after final testing, corrections, content verification, QA, final review, and confirmation that the website and Admin Panel are ready. The handover will include the completed website and Admin Panel administration system.
      </p>
    </div>
  </div>

  <div class="page-footer">
    <div class="footer-left">S&A Badminton Academy — Website Development & Admin Panel Progress Report</div>
    <div class="footer-right">Page 4 of 5</div>
  </div>
</div>


<!-- =============================================================
     PAGE 5: MASTER PROGRESS TABLE & FINALISATION ROADMAP
     ============================================================= -->
<div class="page">
  <div class="page-header">
    <div class="header-left">
      <span class="header-brand">S&amp;A Badminton Academy</span>
      <span class="header-sep">/</span>
      <span class="header-doc-name">Master Progress Table &amp; Final Roadmap</span>
    </div>
    <div class="header-right">30 September 2026</div>
  </div>

  <div class="section-title" style="margin-bottom:4px;">
    <span class="section-number">08</span>
    <span>Master Progress Table</span>
  </div>

  <table style="width:100%;border-collapse:collapse;font-size:9px;margin-bottom:6px;border:1px solid #E2E8F0;border-radius:6px;overflow:hidden;">
    <thead>
      <tr>
        <th style="width:52%;background:#0F172A;color:#FFF;font-weight:700;text-align:left;padding:4px 9px;font-size:9px;">Area / Functional Component</th>
        <th style="width:48%;background:#0F172A;color:#FFF;font-weight:700;text-align:left;padding:4px 9px;font-size:9px;">Current Status</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Website Development</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;"><span class="badge badge-completed">&#x2705; Completed &amp; Phone Optimized</span></td></tr>
      <tr style="background:#F8FAFC;"><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Domain &amp; DNS Configuration</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;"><span class="badge badge-completed">&#x2705; Completed</span></td></tr>
      <tr><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Centre Management</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;"><span class="badge badge-verification">&#x2705; Completed — Final Verification Pending</span></td></tr>
      <tr style="background:#F8FAFC;"><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Centre-wise Pages</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;"><span class="badge badge-completed">&#x2705; Completed</span></td></tr>
      <tr><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Coach Management</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;"><span class="badge badge-completed">&#x2705; Completed</span></td></tr>
      <tr style="background:#F8FAFC;"><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Coach Profiles</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;"><span class="badge badge-completed">&#x2705; Completed</span></td></tr>
      <tr><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Coach Photos</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;"><span class="badge badge-completed">&#x2705; Completed</span></td></tr>
      <tr style="background:#F8FAFC;"><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Admin Panel</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;"><span class="badge badge-completed">&#x2705; Completed &amp; Phone Optimized</span></td></tr>
      <tr><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Admin Authentication</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;"><span class="badge badge-testing">&#x2705; Completed &amp; Testing</span></td></tr>
      <tr style="background:#F8FAFC;"><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Administrator Management</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;"><span class="badge badge-in-progress">&#x1F504; In Progress</span></td></tr>
      <tr><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">WhatsApp / Contact Configuration</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;"><span class="badge badge-verification">&#x2705; Completed — Final Testing &amp; Correction</span></td></tr>
      <tr style="background:#F8FAFC;"><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Leads / Enquiries</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;"><span class="badge badge-completed">&#x2705; Completed</span></td></tr>
      <tr><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Gallery Management</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;"><span class="badge badge-completed">&#x2705; Completed</span></td></tr>
      <tr style="background:#F8FAFC;"><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Articles Management</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;"><span class="badge badge-verification">&#x2705; Completed — Final Confirmation Pending</span></td></tr>
      <tr><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Track Records</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;"><span class="badge badge-completed">&#x2705; Completed</span></td></tr>
      <tr style="background:#F8FAFC;"><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Reviews</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;"><span class="badge badge-completed">&#x2705; Completed</span></td></tr>
      <tr><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Mobile Testing</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;"><span class="badge badge-in-progress">&#x1F504; In Progress</span></td></tr>
      <tr style="background:#F8FAFC;"><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Desktop Testing</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;background:#F8FAFC;"><span class="badge badge-completed">&#x2705; Completed</span></td></tr>
      <tr><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;color:#334155;font-weight:500;">Final QA</td><td style="padding:2.5px 9px;border-bottom:1px solid #E2E8F0;"><span class="badge badge-pending">&#x23F3; Pending</span></td></tr>
      <tr style="background:#F8FAFC;"><td style="padding:2.5px 9px;color:#334155;font-weight:500;">Final Handover</td><td style="padding:2.5px 9px;background:#F8FAFC;"><span class="badge badge-pending">&#x23F3; Pending</span></td></tr>
    </tbody>
  </table>

  <div class="section-title" style="margin-bottom:4px;">
    <span class="section-number">09</span>
    <span>Remaining Finalisation Work</span>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 5px;margin-bottom:6px;">
    <div style="font-size:8.5px;color:#334155;display:flex;align-items:flex-start;gap:4px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:4px;padding:4px 6px;line-height:1.3;"><span style="color:#0284C7;">&#9670;</span> Complete centre-wise final verification across all 5 hubs.</div>
    <div style="font-size:8.5px;color:#334155;display:flex;align-items:flex-start;gap:4px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:4px;padding:4px 6px;line-height:1.3;"><span style="color:#0284C7;">&#9670;</span> Complete administrator management.</div>
    <div style="font-size:8.5px;color:#334155;display:flex;align-items:flex-start;gap:4px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:4px;padding:4px 6px;line-height:1.3;"><span style="color:#0284C7;">&#9670;</span> Complete WhatsApp / contact final testing.</div>
    <div style="font-size:8.5px;color:#334155;display:flex;align-items:flex-start;gap:4px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:4px;padding:4px 6px;line-height:1.3;"><span style="color:#0284C7;">&#9670;</span> Obtain final confirmation for Articles content.</div>
    <div style="font-size:8.5px;color:#334155;display:flex;align-items:flex-start;gap:4px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:4px;padding:4px 6px;line-height:1.3;"><span style="color:#0284C7;">&#9670;</span> Complete mobile testing across device screens.</div>
    <div style="font-size:8.5px;color:#334155;display:flex;align-items:flex-start;gap:4px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:4px;padding:4px 6px;line-height:1.3;"><span style="color:#0284C7;">&#9670;</span> Perform complete final integrated QA.</div>
    <div style="font-size:8.5px;color:#334155;display:flex;align-items:flex-start;gap:4px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:4px;padding:4px 6px;line-height:1.3;"><span style="color:#0284C7;">&#9670;</span> Correct any issues identified during final QA.</div>
    <div style="font-size:8.5px;color:#334155;display:flex;align-items:flex-start;gap:4px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:4px;padding:4px 6px;line-height:1.3;"><span style="color:#0284C7;">&#9670;</span> Perform final content and data verification.</div>
    <div style="font-size:8.5px;color:#334155;display:flex;align-items:flex-start;gap:4px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:4px;padding:4px 6px;line-height:1.3;"><span style="color:#0284C7;">&#9670;</span> Conduct final website and Admin Panel review.</div>
    <div style="font-size:8.5px;color:#334155;display:flex;align-items:flex-start;gap:4px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:4px;padding:4px 6px;line-height:1.3;"><span style="color:#0284C7;">&#9670;</span> Prepare the system for final handover.</div>
  </div>


  <!-- ── Conclusion ── -->
  <div style="background:linear-gradient(135deg,#0F172A 0%,#1A2744 100%);border-radius:8px;padding:11px 15px 13px;color:#FFF;margin-bottom:8px;border-left:4px solid #F59E0B;position:relative;overflow:hidden;">
    <div style="position:absolute;top:0;right:0;width:140px;height:100%;background:radial-gradient(ellipse at right center,rgba(245,158,11,0.08) 0%,transparent 70%);pointer-events:none;"></div>
    <div style="font-size:10px;font-weight:800;color:#FBBF24;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">&#x1F7E1;&nbsp; Final Testing &amp; Finalisation In Progress</div>
    <p style="font-size:9px;color:#E2E8F0;line-height:1.5;margin-bottom:5px;">The core website and Admin Panel development has been completed, and the project has now entered the final verification and quality-assurance stage. The remaining activities are focused on final centre verification, administrator management, contact and WhatsApp testing, mobile testing, final content confirmation and complete QA.</p>
    <p style="font-size:9px;color:#CBD5E1;line-height:1.5;">Once these final checks and corrections are completed, the website and Admin Panel will proceed to the final handover stage.</p>
  </div>

  <!-- ── Professional closing signature ── -->
  <div style="display:flex;flex-direction:column;align-items:center;margin-top:auto;padding:10px 0 12px;">
    <div style="width:100%;border-top:1px solid #E2E8F0;margin-bottom:12px;"></div>
    <div style="font-size:11px;font-weight:800;letter-spacing:0.16em;color:#0F172A;text-transform:uppercase;margin-bottom:2px;">S&amp;A Badminton Academy</div>
    <div style="font-size:9px;font-weight:500;color:#64748B;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:3px;">Website Development &amp; Admin Panel</div>
    <div style="font-size:9px;font-weight:600;color:#0891B2;letter-spacing:0.05em;text-transform:uppercase;">Final Testing &amp; Handover Preparation</div>
  </div>

  <div class="page-footer">
    <div class="footer-left">S&amp;A Badminton Academy — Website Development &amp; Admin Panel Progress Report</div>
    <div class="footer-right">Page 5 of 5</div>
  </div>
</div>

</body>
</html>
`;

async function generateReport() {
  console.log("Launching Puppeteer for PDF generation...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  
  // Set viewport to exact A4 aspect ratio at high DPI
  await page.setViewport({
    width: 1200,
    height: 1697,
    deviceScaleFactor: 2,
  });

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  console.log("Generating A4 PDF: " + OUTPUT_PDF);
  await page.pdf({
    path: OUTPUT_PDF,
    format: "A4",
    printBackground: true,
    margin: {
      top: "0mm",
      right: "0mm",
      bottom: "0mm",
      left: "0mm",
    },
  });

  console.log("PDF created successfully!");

  // Now capture screenshots of each page to verify visual layout
  console.log("Capturing page preview images...");
  const pages = await page.$$(".page");
  for (let i = 0; i < pages.length; i++) {
    const previewPath = path.join(PREVIEWS_DIR, `page_${i + 1}.png`);
    await pages[i].screenshot({ path: previewPath });
    console.log(`✓ Saved ${previewPath}`);
  }

  await browser.close();
  console.log("\nDone! PDF and preview images generated successfully.");
}

generateReport().catch((err) => {
  console.error("Error generating report:", err);
  process.exit(1);
});
