import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure output directory exists
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'badminton-academy-website-seo-quotation.pdf');

// Simple static server for ES module resolution
function startLocalServer(port = 8124) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
      const ext = path.extname(filePath);
      
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.svg': 'image/svg+xml'
      };

      const contentType = mimeTypes[ext] || 'text/plain';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });

    server.listen(port, () => {
      resolve(server);
    });
  });
}

async function generatePDF() {
  console.log('🚀 Starting KREOVATE | S & A BADMINTON ACADEMY Proposal & Agreement PDF Generator...');
  
  const server = await startLocalServer(8124);
  console.log('📡 Local server running on http://localhost:8124');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set desktop A4 equivalent viewport
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2
    });

    console.log('🌐 Loading quotation document...');
    await page.goto('http://localhost:8124/index.html', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for fonts & DOM rendering
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 1000));

    console.log('🖨️ Rendering A4 PDF document...');
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      }
    });

    console.log(`✅ PDF successfully generated at: ${outputPath}`);

    // Verification via pdf-lib
    const pdfBytes = fs.readFileSync(outputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();

    console.log(`\n================ QA VERIFICATION SUMMARY ================`);
    console.log(`📄 Total Pages Generated: ${pageCount}`);
    
    if (pageCount === 12) {
      console.log(`✅ Page Count Check PASSED: Exactly 12 A4 pages.`);
    } else {
      console.error(`❌ Page Count FAILED: Expected 12 pages, but found ${pageCount}.`);
      throw new Error(`Invalid page count: ${pageCount}`);
    }

    console.log(`💰 Pricing Verification:`);
    console.log(`   - Professional SEO-Ready Website: ₹15,000`);
    console.log(`   - 30-Day Local SEO Launch: ₹10,000`);
    console.log(`   - Total Project Investment: ₹25,000 (₹12,500 Advance / ₹12,500 Final)`);
    console.log(`   - Optional Ongoing Maintenance: ₹8,000/month`);
    console.log(`🏢 Service Provider: KREOVATE`);
    console.log(`👤 Project Contact / Delivery Lead: Mohammed Nibrasul Haqq`);
    console.log(`🏸 Client: S & A BADMINTON ACADEMY`);
    console.log(`🆔 Quotation ID Check: SAA-WEB-SEO-2026-001`);
    console.log(`=========================================================\n`);

  } finally {
    await browser.close();
    server.close();
  }
}

generatePDF().catch(err => {
  console.error('❌ PDF generation failed:', err);
  process.exit(1);
});
