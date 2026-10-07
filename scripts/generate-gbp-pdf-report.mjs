import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PDF = path.join(__dirname, "../SBA_Google_Business_Profile_Setup_and_Verification_Report.pdf");
const DOCS_PDF = path.join(__dirname, "../documentation/SBA_Google_Business_Profile_Setup_and_Verification_Report.pdf");
const PREVIEWS_DIR = path.join(__dirname, "../output/pdf-previews/gbp_report");

if (!fs.existsSync(PREVIEWS_DIR)) {
  fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Sooraj Badminton Academy (SBA) — Google Business Profile & Local SEO Progress Report</title>
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
    color: #0F172A;
    background-color: #F8FAFC;
    line-height: 1.4;
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
    padding: 13mm 15mm 13mm 15mm;
  }

  /* -------------------------------------------------------------
     COVER PAGE STYLING
     ------------------------------------------------------------- */
  .page-cover {
    padding: 0;
    background: radial-gradient(circle at 100% 0%, #1E293B 0%, #0F172A 65%, #07090D 100%);
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
    height: 7px;
    background: linear-gradient(90deg, #10B981, #059669, #38BDF8, #84CC16);
  }

  .cover-grid-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
    background-size: 22px 22px;
    opacity: 0.8;
    pointer-events: none;
  }

  .cover-header {
    position: relative;
    z-index: 2;
    padding: 22mm 20mm 0 20mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 7px 16px;
    border-radius: 9999px;
    backdrop-filter: blur(8px);
  }

  .brand-shuttle {
    width: 22px;
    height: 22px;
    background: #10B981;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 11px;
    color: #0F172A;
  }

  .brand-name {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #F8FAFC;
  }

  .report-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #38BDF8;
    background: rgba(56, 189, 248, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.25);
    padding: 5px 12px;
    border-radius: 6px;
    font-weight: 600;
  }

  .cover-body {
    position: relative;
    z-index: 2;
    padding: 0 20mm;
    margin-top: -10mm;
  }

  .cover-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: #10B981;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-bottom: 12px;
  }

  .cover-kicker::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #10B981;
    border-radius: 50%;
    box-shadow: 0 0 10px #10B981;
  }

  .cover-title {
    font-size: 34px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: #FFFFFF;
    margin-bottom: 14px;
  }

  .cover-title span {
    background: linear-gradient(135deg, #38BDF8 0%, #10B981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .cover-subtitle {
    font-size: 13.5px;
    line-height: 1.55;
    color: #94A3B8;
    max-width: 580px;
    margin-bottom: 24px;
  }

  .cover-status-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    background: rgba(15, 23, 42, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 16px 18px;
    margin-bottom: 24px;
  }

  .cover-status-card {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .cover-status-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #94A3B8;
  }

  .cover-status-value {
    font-size: 13px;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .status-completed {
    color: #34D399;
  }

  .status-pending {
    color: #FBBF24;
  }

  .cover-footer {
    position: relative;
    z-index: 2;
    padding: 0 20mm 20mm 20mm;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-top: 16px;
  }

  .meta-col {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .meta-label {
    font-size: 9.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #64748B;
  }

  .meta-val {
    font-size: 11.5px;
    font-weight: 700;
    color: #E2E8F0;
  }

  /* -------------------------------------------------------------
     INSIDE PAGES COMMON STYLES
     ------------------------------------------------------------- */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-bottom: 8px;
    border-bottom: 1.5px solid #CBD5E1;
    margin-bottom: 12px;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .header-kicker {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5px;
    font-weight: 700;
    color: #059669;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .header-title {
    font-size: 15px;
    font-weight: 800;
    color: #0F172A;
    letter-spacing: -0.02em;
  }

  .header-right {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5px;
    font-weight: 600;
    color: #64748B;
    text-align: right;
  }

  .page-footer {
    margin-top: auto;
    padding-top: 8px;
    border-top: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8.5px;
    color: #64748B;
  }

  .footer-left {
    font-weight: 600;
  }

  .footer-right {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
  }

  /* Headings & Texts */
  h2.section-heading {
    font-size: 13.5px;
    font-weight: 800;
    color: #0F172A;
    letter-spacing: -0.01em;
    margin-top: 8px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  h2.section-heading .pill-num {
    background: #0F172A;
    color: #FFFFFF;
    font-size: 9px;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
  }

  p.section-desc {
    font-size: 10px;
    color: #475569;
    line-height: 1.45;
    margin-bottom: 8px;
  }

  /* Status Badges */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 8.5px;
    font-weight: 700;
    padding: 2.5px 7px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    white-space: nowrap;
  }

  .badge-completed {
    background: #DCFCE7;
    color: #166534;
    border: 1px solid #86EFAC;
  }

  .badge-pending {
    background: #FEF3C7;
    color: #92400E;
    border: 1px solid #FCD34D;
  }

  .badge-info {
    background: #E0F2FE;
    color: #0369A1;
    border: 1px solid #BAE6FD;
  }

  /* Callout Boxes */
  .callout-box {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-left: 4px solid #0284C7;
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 10px;
  }

  .callout-box.warning {
    background: #FFFBEB;
    border-color: #FDE68A;
    border-left-color: #F59E0B;
  }

  .callout-box.success {
    background: #F0FDF4;
    border-color: #BBF7D0;
    border-left-color: #10B981;
  }

  .callout-title {
    font-size: 10px;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .callout-text {
    font-size: 9.2px;
    color: #334155;
    line-height: 1.42;
  }

  /* Tables */
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5px;
    margin-bottom: 10px;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    overflow: hidden;
  }

  table.data-table th {
    background: #0F172A;
    color: #FFFFFF;
    font-weight: 700;
    text-align: left;
    padding: 6px 9px;
    font-size: 9px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  table.data-table td {
    padding: 6px 9px;
    border-bottom: 1px solid #F1F5F9;
    color: #1E293B;
    vertical-align: middle;
  }

  table.data-table tr:last-child td {
    border-bottom: none;
  }

  table.data-table tr:nth-child(even) td {
    background: #F8FAFC;
  }

  /* Branch Detail Cards */
  .branch-cards-grid {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-bottom: 8px;
  }

  .branch-card {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    padding: 8px 11px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .branch-card-main {
    flex: 1;
  }

  .branch-card-title {
    font-size: 11px;
    font-weight: 800;
    color: #0F172A;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .branch-card-meta {
    font-size: 9px;
    color: #475569;
    line-height: 1.38;
  }

  .branch-card-meta strong {
    color: #1E293B;
  }

  .branch-card-badges {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3.5px;
    min-width: 140px;
  }

  /* Keyword Chips Grid */
  .keyword-group {
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    padding: 8px 11px;
    margin-bottom: 8px;
  }

  .keyword-group-title {
    font-size: 10px;
    font-weight: 800;
    color: #0F172A;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .keyword-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .keyword-chip {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5px;
    font-weight: 600;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    color: #0F172A;
    padding: 2.5px 7px;
    border-radius: 4px;
  }

  .keyword-chip.exact {
    background: #F0FDF4;
    border-color: #86EFAC;
    color: #166534;
  }

  .keyword-chip.target {
    background: #EFF6FF;
    border-color: #93C5FD;
    color: #1E40AF;
  }

  /* Steps List */
  .steps-list {
    display: flex;
    flex-direction: column;
    gap: 5.5px;
    margin-bottom: 8px;
  }

  .step-item {
    display: flex;
    gap: 9px;
    align-items: flex-start;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 6px;
    padding: 6px 10px;
  }

  .step-num {
    background: #0284C7;
    color: #FFFFFF;
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5px;
    font-weight: 800;
    min-width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .step-content {
    flex: 1;
  }

  .step-title {
    font-size: 9.5px;
    font-weight: 700;
    color: #0F172A;
    margin-bottom: 1.5px;
  }

  .step-desc {
    font-size: 8.8px;
    color: #475569;
    line-height: 1.35;
  }

  /* Signoff Block */
  .signoff-box {
    margin-top: 6px;
    background: #0F172A;
    color: #FFFFFF;
    border-radius: 6px;
    padding: 10px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .signoff-title {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.05em;
    color: #FFFFFF;
    margin-bottom: 2px;
  }

  .signoff-sub {
    font-size: 8.5px;
    color: #94A3B8;
  }

  .signoff-badge {
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid #10B981;
    color: #34D399;
    font-weight: 800;
    font-size: 9.5px;
    padding: 5px 12px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
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

  <div class="cover-header">
    <div class="brand-badge">
      <div class="brand-shuttle">S</div>
      <div class="brand-name">Sooraj Badminton Academy</div>
    </div>
    <div class="report-tag">DOC REF: SBA-GBP-REP-2026-V1</div>
  </div>

  <div class="cover-body">
    <div class="cover-kicker">Local Presence &amp; Google Maps Verification</div>
    <div class="cover-title">
      GOOGLE BUSINESS PROFILE (GBP)<br>
      <span>SETUP &amp; VERIFICATION REPORT</span>
    </div>
    <div class="cover-subtitle">
      Comprehensive documentation covering the complete creation of all 5 SBA branch Google Business Profiles, Google live video verification status, local SEO keyword integration, and post-verification search visibility strategy.
    </div>

    <div class="cover-status-grid">
      <div class="cover-status-card">
        <div class="cover-status-label">1. GBP Profile Creation</div>
        <div class="cover-status-value status-completed">COMPLETED ✅ (5/5 Branches)</div>
      </div>
      <div class="cover-status-card">
        <div class="cover-status-label">2. Google Verification</div>
        <div class="cover-status-value status-pending">PENDING ⏳ (Awaiting Review)</div>
      </div>
      <div class="cover-status-card">
        <div class="cover-status-label">3. Live Video Verification</div>
        <div class="cover-status-value status-pending">PENDING ⏳ (On-Site Step)</div>
      </div>
      <div class="cover-status-card">
        <div class="cover-status-label">4. Public Search Visibility</div>
        <div class="cover-status-value status-pending">PENDING VERIFICATION ⏳</div>
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <div class="meta-col">
      <div class="meta-label">Client Entity</div>
      <div class="meta-val">Sooraj Badminton Academy (SBA)</div>
      <div style="font-size:9.5px;color:#94A3B8;margin-top:2px;">Kochi / Ernakulam, Kerala</div>
    </div>
    <div class="meta-col">
      <div class="meta-label">Audited Locations</div>
      <div class="meta-val">5 Canonical Hubs Across Kochi</div>
      <div style="font-size:9.5px;color:#94A3B8;margin-top:2px;">Kadavanthra • Kumbalanghi • Maradu • Palluruthy • Chullikal</div>
    </div>
    <div class="meta-col" style="text-align:right;">
      <div class="meta-label">Report Date</div>
      <div class="meta-val">October 5, 2026</div>
      <div style="font-size:9.5px;color:#38BDF8;margin-top:2px;">Production Documentation</div>
    </div>
  </div>
</div>

<!-- =============================================================
     PAGE 2: EXECUTIVE SUMMARY & MASTER STATUS TABLE
     ============================================================= -->
<div class="page">
  <div class="page-header">
    <div class="header-left">
      <div class="header-kicker">Section 1 &amp; 2 // Status Overview</div>
      <div class="header-title">Executive Summary &amp; 5-Branch Master Table</div>
    </div>
    <div class="header-right">SBA-GBP-REP-2026<br>Page 2 of 5</div>
  </div>

  <h2 class="section-heading"><span class="pill-num">01</span> Project Overview &amp; Executive Summary</h2>
  <p class="section-desc">
    Sooraj Badminton Academy (SBA) operates five premier training facilities across Greater Kochi. To establish local Google Maps presence and capture high-intent searches (e.g. <em>"badminton coaching near me"</em> or <em>"badminton classes in Kadavanthra"</em>), dedicated Google Business Profiles were created for each physical arena. All listings feature verified contact hotlines, standardized business naming, official operating hours, and direct links to hyper-local website landing pages.
  </p>

  <div class="callout-box warning">
    <div class="callout-title">
      <span>⚠️</span> CURRENT SITUATION &amp; PUBLIC VISIBILITY CLARIFICATION
    </div>
    <div class="callout-text">
      <strong>All five SBA branch Google Business Profiles have been successfully created. The remaining step is Google's verification process, which requires live video verification for the applicable profiles. Until verification is completed and approved, some profiles may not appear publicly on Google Search or Google Maps. Public visibility should be checked again after verification approval.</strong><br>
      <em>Note: The profiles are active in the Google Business dashboard awaiting verification; they are NOT permanently unavailable, rejected, suspended, or deleted.</em>
    </div>
  </div>

  <h2 class="section-heading"><span class="pill-num">02</span> 5-Branch Verification &amp; Visibility Master Table</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 22%;">Branch Location</th>
        <th style="width: 18%;">GBP Created</th>
        <th style="width: 18%;">Verification</th>
        <th style="width: 18%;">Live Video</th>
        <th style="width: 24%;">Public Visibility</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Kadavanthra</strong><br><span style="font-size:8px;color:#64748B;">Central HQ • Rajiv Gandhi Stadium</span></td>
        <td><span class="badge badge-completed">✅ Completed</span></td>
        <td><span class="badge badge-pending">⏳ Pending</span></td>
        <td><span class="badge badge-pending">⏳ Pending</span></td>
        <td><span class="badge badge-pending">Pending verification</span></td>
      </tr>
      <tr>
        <td><strong>Kumbalanghi</strong><br><span style="font-size:8px;color:#64748B;">West Kochi • All Star Indoor Court</span></td>
        <td><span class="badge badge-completed">✅ Completed</span></td>
        <td><span class="badge badge-pending">⏳ Pending</span></td>
        <td><span class="badge badge-pending">⏳ Pending</span></td>
        <td><span class="badge badge-pending">Pending verification</span></td>
      </tr>
      <tr>
        <td><strong>Maradu</strong><br><span style="font-size:8px;color:#64748B;">South Kochi • ProSmash Academy</span></td>
        <td><span class="badge badge-completed">✅ Completed</span></td>
        <td><span class="badge badge-pending">⏳ Pending</span></td>
        <td><span class="badge badge-pending">⏳ Pending</span></td>
        <td><span class="badge badge-pending">Pending verification</span></td>
      </tr>
      <tr>
        <td><strong>Palluruthy</strong><br><span style="font-size:8px;color:#64748B;">West Kochi Training Facility</span></td>
        <td><span class="badge badge-completed">✅ Completed</span></td>
        <td><span class="badge badge-pending">⏳ Pending</span></td>
        <td><span class="badge badge-pending">⏳ Pending</span></td>
        <td><span class="badge badge-pending">Pending verification</span></td>
      </tr>
      <tr>
        <td><strong>Chullikal</strong><br><span style="font-size:8px;color:#64748B;">Fort Kochi / Coastal Training Centre</span></td>
        <td><span class="badge badge-completed">✅ Completed</span></td>
        <td><span class="badge badge-pending">⏳ Pending</span></td>
        <td><span class="badge badge-pending">⏳ Pending</span></td>
        <td><span class="badge badge-pending">Pending verification</span></td>
      </tr>
    </tbody>
  </table>

  <h2 class="section-heading"><span class="pill-num">03</span> Standardized Profile Parameters Applied</h2>
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-bottom:6px;">
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:7px 10px;">
      <div style="font-size:9.5px;font-weight:700;color:#0F172A;margin-bottom:2px;">Business Name Standard</div>
      <div style="font-size:8.8px;color:#475569;">Unified <code>S &amp; A Badminton Academy – [Branch]</code> &amp; <code>Sooraj Badminton Academy</code> for cross-network brand authority.</div>
    </div>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:7px 10px;">
      <div style="font-size:9.5px;font-weight:700;color:#0F172A;margin-bottom:2px;">Primary Categories</div>
      <div style="font-size:8.8px;color:#475569;">Configured under <strong>Badminton Court</strong>, <strong>Badminton Academy</strong>, and <strong>Sports School</strong>.</div>
    </div>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:7px 10px;">
      <div style="font-size:9.5px;font-weight:700;color:#0F172A;margin-bottom:2px;">Direct Contact Routing</div>
      <div style="font-size:8.8px;color:#475569;">Official phone: <code>+91 79076 55513</code>; WhatsApp click-to-chat admissions desk: <code>+91 90746 80420</code>.</div>
    </div>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:7px 10px;">
      <div style="font-size:9.5px;font-weight:700;color:#0F172A;margin-bottom:2px;">Operating Schedule</div>
      <div style="font-size:8.8px;color:#475569;">Daily operating hours: 05:00 AM – 10:30 PM (covering morning fitness, junior squads, and corporate night slots).</div>
    </div>
  </div>

  <div class="page-footer">
    <div class="footer-left">Sooraj Badminton Academy (SBA) — Google Business Profile Progress Report</div>
    <div class="footer-right">Page 2 of 5</div>
  </div>
</div>

<!-- =============================================================
     PAGE 3: BRANCH-BY-BRANCH DETAILED PROFILES
     ============================================================= -->
<div class="page">
  <div class="page-header">
    <div class="header-left">
      <div class="header-kicker">Section 3 // Technical Data</div>
      <div class="header-title">Branch-by-Branch Detailed Configuration</div>
    </div>
    <div class="header-right">SBA-GBP-REP-2026<br>Page 3 of 5</div>
  </div>

  <p class="section-desc" style="margin-bottom:8px;">
    The table below records the verified database and profile parameters for each of the five SBA locations. Each profile is bound directly to an on-site local SEO landing page to consolidate organic crawl equity and map rank.
  </p>

  <div class="branch-cards-grid">
    <!-- Kadavanthra -->
    <div class="branch-card">
      <div class="branch-card-main">
        <div class="branch-card-title">1. Kadavanthra (Central Kochi HQ)</div>
        <div class="branch-card-meta">
          <strong>Address:</strong> S&amp;A Sports Arena, Near Rajiv Gandhi Indoor Stadium, Kadavanthra, Kochi 682020<br>
          <strong>Courts:</strong> 4 BWF Wooden Cushion &amp; Synthetic Mat Courts • <strong>Phone:</strong> +91 79076 55513<br>
          <strong>Destination URL:</strong> <code>https://sabadmintonacademy.com/kadavanthra</code>
        </div>
      </div>
      <div class="branch-card-badges">
        <span class="badge badge-completed">GBP Created: ✅</span>
        <span class="badge badge-pending">Verification: ⏳</span>
        <span class="badge badge-pending">Live Video: ⏳</span>
        <span class="badge badge-pending">Visibility: ⏳</span>
      </div>
    </div>

    <!-- Kumbalanghi -->
    <div class="branch-card">
      <div class="branch-card-main">
        <div class="branch-card-title">2. Kumbalanghi (West Kochi Hub)</div>
        <div class="branch-card-meta">
          <strong>Address:</strong> All Star Badminton Indoor Court, Kumbalanghi, Kochi, Kerala 682007<br>
          <strong>Courts:</strong> 3 BWF Wooden Cushion &amp; Synthetic Mat Courts • <strong>Phone:</strong> +91 79076 55513<br>
          <strong>Destination URL:</strong> <code>https://sabadmintonacademy.com/kumbalanghi</code>
        </div>
      </div>
      <div class="branch-card-badges">
        <span class="badge badge-completed">GBP Created: ✅</span>
        <span class="badge badge-pending">Verification: ⏳</span>
        <span class="badge badge-pending">Live Video: ⏳</span>
        <span class="badge badge-pending">Visibility: ⏳</span>
      </div>
    </div>

    <!-- Maradu -->
    <div class="branch-card">
      <div class="branch-card-main">
        <div class="branch-card-title">3. Maradu (South Kochi Hub)</div>
        <div class="branch-card-meta">
          <strong>Address:</strong> Society Road, near Vadakke Cheruvaram, Shastri Nagar, Maradu, Kochi 682304 (ProSmash Arena)<br>
          <strong>Courts:</strong> 4 BWF Grade-1 Synthetic Cushion Courts • <strong>Phone:</strong> +91 79076 55513<br>
          <strong>Destination URL:</strong> <code>https://sabadmintonacademy.com/maradu</code>
        </div>
      </div>
      <div class="branch-card-badges">
        <span class="badge badge-completed">GBP Created: ✅</span>
        <span class="badge badge-pending">Verification: ⏳</span>
        <span class="badge badge-pending">Live Video: ⏳</span>
        <span class="badge badge-pending">Visibility: ⏳</span>
      </div>
    </div>

    <!-- Palluruthy -->
    <div class="branch-card">
      <div class="branch-card-main">
        <div class="branch-card-title">4. Palluruthy (West Kochi Training Facility)</div>
        <div class="branch-card-meta">
          <strong>Address:</strong> All Star Badminton Indoor Court located in Kumbalanghi / Palluruthy, Kochi 682007<br>
          <strong>Courts:</strong> 4 BWF Grade-1 Certified Synthetic Cushion Mats • <strong>Phone:</strong> +91 79076 55513<br>
          <strong>Destination URL:</strong> <code>https://sabadmintonacademy.com/palluruthy</code>
        </div>
      </div>
      <div class="branch-card-badges">
        <span class="badge badge-completed">GBP Created: ✅</span>
        <span class="badge badge-pending">Verification: ⏳</span>
        <span class="badge badge-pending">Live Video: ⏳</span>
        <span class="badge badge-pending">Visibility: ⏳</span>
      </div>
    </div>

    <!-- Chullikal -->
    <div class="branch-card">
      <div class="branch-card-main">
        <div class="branch-card-title">5. Chullikal (Fort Kochi / Coastal Centre)</div>
        <div class="branch-card-meta">
          <strong>Address:</strong> Chullikal, West Kochi, Kerala 682005<br>
          <strong>Courts:</strong> 4 BWF-Grade Multi-Layer Synthetic Cushion Courts • <strong>Phone:</strong> +91 79076 55513<br>
          <strong>Destination URL:</strong> <code>https://sabadmintonacademy.com/chullikal</code>
        </div>
      </div>
      <div class="branch-card-badges">
        <span class="badge badge-completed">GBP Created: ✅</span>
        <span class="badge badge-pending">Verification: ⏳</span>
        <span class="badge badge-pending">Live Video: ⏳</span>
        <span class="badge badge-pending">Visibility: ⏳</span>
      </div>
    </div>
  </div>

  <div class="callout-box success" style="margin-top:6px;">
    <div class="callout-title">
      <span>✓</span> SINGLE SOURCE OF TRUTH VERIFICATION
    </div>
    <div class="callout-text">
      All 5 branch entities have been synchronized across the PostgreSQL <code>centres</code> database, Schema.org <code>SportsActivityLocation</code> JSON-LD definitions, and XML sitemaps. Legacy references to deprecated locations have been completely eradicated, ensuring zero data conflicts when Google cross-checks business listings against the web domain.
    </div>
  </div>

  <div class="page-footer">
    <div class="footer-left">Sooraj Badminton Academy (SBA) — Google Business Profile Progress Report</div>
    <div class="footer-right">Page 3 of 5</div>
  </div>
</div>

<!-- =============================================================
     PAGE 4: GBP SEO & KEYWORDS ADDED
     ============================================================= -->
<div class="page">
  <div class="page-header">
    <div class="header-left">
      <div class="header-kicker">Section 4 // Local SEO Architecture</div>
      <div class="header-title">Google Business Profile SEO — Keywords Added</div>
    </div>
    <div class="header-right">SBA-GBP-REP-2026<br>Page 4 of 5</div>
  </div>

  <p class="section-desc">
    To ensure SBA dominates the <strong>Google Local 3-Pack</strong> and proximity-based searches, a rigorous keyword mapping strategy has been implemented. This section documents the <strong>exact keywords configured</strong> in the project files and the strategic keyword targets planned for ongoing discovery.
  </p>

  <!-- Exact Keywords Added -->
  <div class="keyword-group">
    <div class="keyword-group-title">
      <span>1. Exact Keywords Added (Configured in Project Engine)</span>
      <span class="badge badge-completed" style="font-size:7.5px;">100% Configured</span>
    </div>
    <div class="keyword-chips">
      <span class="keyword-chip exact">badminton academy in Kochi</span>
      <span class="keyword-chip exact">badminton coaching in Kochi</span>
      <span class="keyword-chip exact">badminton classes in Kochi</span>
      <span class="keyword-chip exact">badminton training in Kochi</span>
      <span class="keyword-chip exact">badminton academy in Ernakulam</span>
      <span class="keyword-chip exact">kids badminton coaching Kochi</span>
      <span class="keyword-chip exact">junior badminton training</span>
      <span class="keyword-chip exact">adult badminton classes Kochi</span>
      <span class="keyword-chip exact">competitive badminton training Kerala</span>
      <span class="keyword-chip exact">badminton camp Kochi</span>
      <span class="keyword-chip exact">badminton coaching Kadavanthra</span>
      <span class="keyword-chip exact">badminton academy in Kadavanthra</span>
      <span class="keyword-chip exact">badminton coaching Kumbalanghi</span>
      <span class="keyword-chip exact">badminton academy in Kumbalanghi</span>
      <span class="keyword-chip exact">badminton coaching Maradu</span>
      <span class="keyword-chip exact">badminton academy in Maradu</span>
      <span class="keyword-chip exact">badminton coaching Palluruthy</span>
      <span class="keyword-chip exact">badminton academy in Palluruthy</span>
      <span class="keyword-chip exact">badminton coaching Chullikal</span>
      <span class="keyword-chip exact">badminton academy in Chullikal</span>
    </div>
  </div>

  <!-- Strategic SEO Keyword Targets -->
  <div class="keyword-group">
    <div class="keyword-group-title">
      <span>2. Strategic SEO Keyword Targets &amp; Search Phrases</span>
      <span class="badge badge-info" style="font-size:7.5px;">Local Search Clusters</span>
    </div>
    <div class="keyword-chips">
      <span class="keyword-chip target">Sooraj Badminton Academy</span>
      <span class="keyword-chip target">S &amp; A Badminton Academy</span>
      <span class="keyword-chip target">Coach Sooraj Badminton Academy</span>
      <span class="keyword-chip target">badminton academy near Kadavanthra</span>
      <span class="keyword-chip target">badminton academy near Kumbalanghi</span>
      <span class="keyword-chip target">badminton academy near Maradu</span>
      <span class="keyword-chip target">badminton academy near Palluruthy</span>
      <span class="keyword-chip target">badminton academy near Chullikal</span>
      <span class="keyword-chip target">badminton coaching near me</span>
      <span class="keyword-chip target">badminton courts near me</span>
      <span class="keyword-chip target">children's badminton coaching Kochi</span>
      <span class="keyword-chip target">youth badminton training Kochi</span>
      <span class="keyword-chip target">professional badminton coaching Kochi</span>
      <span class="keyword-chip target">badminton training academy</span>
      <span class="keyword-chip target">BWF certified badminton coaching</span>
      <span class="keyword-chip target">competitive badminton squad Kochi</span>
    </div>
  </div>

  <!-- How GBP SEO Supports Discovery -->
  <h2 class="section-heading" style="margin-top:6px;"><span class="pill-num">04</span> How GBP SEO Powers Post-Verification Discovery</h2>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:6px;">
    <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:6px;padding:7px 9px;">
      <div style="font-size:9.5px;font-weight:700;color:#0F172A;margin-bottom:2px;">1. Strict NAP Alignment</div>
      <div style="font-size:8.5px;color:#475569;line-height:1.35;">100% data consistency between Google Business Profile, Schema JSON-LD, and website footer builds high local trust.</div>
    </div>
    <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:6px;padding:7px 9px;">
      <div style="font-size:9.5px;font-weight:700;color:#0F172A;margin-bottom:2px;">2. Micro-Market Landing</div>
      <div style="font-size:8.5px;color:#475569;line-height:1.35;">Directing GBP traffic to dedicated <code>/[location]</code> URLs prevents keyword cannibalization across Kochi centers.</div>
    </div>
    <div style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:6px;padding:7px 9px;">
      <div style="font-size:9.5px;font-weight:700;color:#0F172A;margin-bottom:2px;">3. Schema Entity Sync</div>
      <div style="font-size:8.5px;color:#475569;line-height:1.35;">Parent <code>SportsOrganization</code> links child <code>SportsActivityLocation</code> entities, multiplying domain authority.</div>
    </div>
  </div>

  <div class="page-footer">
    <div class="footer-left">Sooraj Badminton Academy (SBA) — Google Business Profile Progress Report</div>
    <div class="footer-right">Page 4 of 5</div>
  </div>
</div>

<!-- =============================================================
     PAGE 5: VERIFICATION PROCESS, NEXT STEPS & CONCLUSION
     ============================================================= -->
<div class="page">
  <div class="page-header">
    <div class="header-left">
      <div class="header-kicker">Section 5 // Action Plan &amp; Sign-Off</div>
      <div class="header-title">Live Video Verification, Next Steps &amp; Conclusion</div>
    </div>
    <div class="header-right">SBA-GBP-REP-2026<br>Page 5 of 5</div>
  </div>

  <h2 class="section-heading"><span class="pill-num">05</span> Live Video Verification Protocol</h2>
  <p class="section-desc">
    Google enforces live video recording verification for athletic academies to validate physical authenticity. When recording on-site at each facility, ensure the video is captured in <strong>one continuous, unedited take</strong> covering:
  </p>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:10px;">
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:7px 9px;">
      <div style="font-size:9px;font-weight:800;color:#0F172A;margin-bottom:2px;">A. Street &amp; Exterior</div>
      <div style="font-size:8.5px;color:#475569;line-height:1.35;">Capture street name signs, nearby landmarks, and academy building entrance with outdoor signage.</div>
    </div>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:7px 9px;">
      <div style="font-size:9px;font-weight:800;color:#0F172A;margin-bottom:2px;">B. Courts &amp; Equipment</div>
      <div style="font-size:8.5px;color:#475569;line-height:1.35;">Walk onto the active courts, showing BWF synthetic mats, lighting fixtures, nets, and coaching gear.</div>
    </div>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:7px 9px;">
      <div style="font-size:9px;font-weight:800;color:#0F172A;margin-bottom:2px;">C. Management Proof</div>
      <div style="font-size:8.5px;color:#475569;line-height:1.35;">Film staff unlocking doors, accessing the reception counter, storage lockers, or branded materials.</div>
    </div>
  </div>

  <h2 class="section-heading"><span class="pill-num">06</span> Actionable Next Steps (9-Point Execution Plan)</h2>
  <div class="steps-list">
    <div class="step-item">
      <div class="step-num">1</div>
      <div class="step-content">
        <div class="step-title">Complete Live Video Verification</div>
        <div class="step-desc">Coordinate with facility staff at Kadavanthra, Kumbalanghi, Maradu, Palluruthy, and Chullikal to record and submit the required video.</div>
      </div>
    </div>
    <div class="step-item">
      <div class="step-num">2</div>
      <div class="step-content">
        <div class="step-title">Submit Verification in Google Business Profile Dashboard</div>
        <div class="step-desc">Confirm that each recording uploads completely without timeout and verify the submission status badge.</div>
      </div>
    </div>
    <div class="step-item">
      <div class="step-num">3</div>
      <div class="step-content">
        <div class="step-title">Monitor Google's Review Window</div>
        <div class="step-desc">Allow 24 to 72 hours for Google's automated systems and manual reviewers to validate the video uploads.</div>
      </div>
    </div>
    <div class="step-item">
      <div class="step-num">4</div>
      <div class="step-content">
        <div class="step-title">Confirm Public Visibility on Search &amp; Maps</div>
        <div class="step-desc">Conduct external test queries to verify that all 5 location pins appear publicly on Google Maps and desktop search results.</div>
      </div>
    </div>
    <div class="step-item">
      <div class="step-num">5</div>
      <div class="step-content">
        <div class="step-title">Verify Published Listing Information Accuracy</div>
        <div class="step-desc">Audit published phone numbers (+91 79076 55513), landing page URLs, operating hours, and business categories.</div>
      </div>
    </div>
    <div class="step-item">
      <div class="step-num">6</div>
      <div class="step-content">
        <div class="step-title">Audit Local SEO &amp; Keyword Performance</div>
        <div class="step-desc">Confirm that primary keywords (e.g. <em>"badminton academy in Kadavanthra"</em>) trigger Local 3-Pack appearances.</div>
      </div>
    </div>
    <div class="step-item">
      <div class="step-num">7</div>
      <div class="step-content">
        <div class="step-title">Upload High-Resolution Facility Photos &amp; Announcements</div>
        <div class="step-desc">Publish authentic arena interior shots, coach action photos, and admissions announcement posts on each profile.</div>
      </div>
    </div>
    <div class="step-item">
      <div class="step-num">8</div>
      <div class="step-content">
        <div class="step-title">Generate Google Review Short-Links &amp; Reception QR Codes</div>
        <div class="step-desc">Create direct review links (<code>https://g.page/r/.../review</code>) and print display QR codes for parent reviews at court reception desks.</div>
      </div>
    </div>
    <div class="step-item">
      <div class="step-num">9</div>
      <div class="step-content">
        <div class="step-title">Perform Final Multi-Device Local Visibility Audit</div>
        <div class="step-desc">Conduct cross-device verification from multiple mobile and desktop IPs across Kochi to benchmark initial rank.</div>
      </div>
    </div>
  </div>

  <div class="signoff-box">
    <div>
      <div class="signoff-title">FINAL CONCLUSION &amp; AUDIT SUMMARY</div>
      <div class="signoff-sub">GBP Profile Creation: <strong>COMPLETED ✅ (5/5 Branches)</strong> • Google Verification &amp; Public Visibility: <strong>PENDING ⏳</strong></div>
    </div>
    <div class="signoff-badge">VERIFIED PROGRESS</div>
  </div>

  <div class="page-footer">
    <div class="footer-left">Sooraj Badminton Academy (SBA) — Google Business Profile Progress Report</div>
    <div class="footer-right">Page 5 of 5</div>
  </div>
</div>

</body>
</html>
`;

async function generateReport() {
  console.log("Launching Puppeteer for SBA GBP PDF generation...");
  const chromePath = fs.existsSync("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
    ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    : undefined;

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: chromePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  
  // Set viewport to exact A4 aspect ratio at high DPI (2x)
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

  // Also copy to documentation/ directory
  fs.copyFileSync(OUTPUT_PDF, DOCS_PDF);
  console.log("✓ Synchronized PDF to: " + DOCS_PDF);

  console.log("Capturing page preview images...");
  const pages = await page.$$(".page");
  for (let i = 0; i < pages.length; i++) {
    const previewPath = path.join(PREVIEWS_DIR, `page_${i + 1}.png`);
    await pages[i].screenshot({ path: previewPath });
    console.log(`✓ Saved page preview: ${previewPath}`);
  }

  await browser.close();
  console.log("\nDone! SBA GBP PDF and high-res preview images generated successfully.");
}

generateReport().catch((err) => {
  console.error("Error generating report:", err);
  process.exit(1);
});
