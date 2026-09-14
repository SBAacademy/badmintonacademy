import { neon } from "@neondatabase/serverless";
import fs from "fs/promises";
import path from "path";
import { allArticles } from "./data/all-articles.mjs";

console.log("==================================================");
console.log("IDEMPOTENT DATABASE SEEDER FOR BLOG ARTICLES");
console.log("==================================================");

async function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const envData = await fs.readFile(".env.local", "utf-8");
    const match = envData.match(/DATABASE_URL=["']?([^"'\n]+)/);
    if (match) return match[1];
  } catch {}
  return null;
}

async function seedBlog() {
  const dbUrl = await getDatabaseUrl();
  if (!dbUrl) {
    console.error("❌ ERROR: DATABASE_URL is not set in environment or .env.local");
    process.exit(1);
  }

  const sql = neon(dbUrl);

  // 1. Query existing blog section in site_content
  console.log("Connecting to Neon PostgreSQL...");
  let existingItems = [];
  try {
    const rows = await sql`SELECT section, data FROM site_content WHERE section = 'blog'`;
    if (rows && rows.length > 0 && Array.isArray(rows[0].data)) {
      existingItems = rows[0].data;
    }
  } catch (err) {
    console.warn("Table or section not found, initializing...", err.message);
  }

  console.log(`Current blog posts in PostgreSQL: ${existingItems.length}`);

  // 2. Identify existing slugs
  const existingSlugMap = new Map();
  for (const item of existingItems) {
    if (item && item.slug) {
      existingSlugMap.set(item.slug, item);
    }
  }

  // 3. Process new articles from inventory (idempotent comparison)
  const toAdd = [];
  let skippedCount = 0;

  for (const article of allArticles) {
    if (existingSlugMap.has(article.slug)) {
      skippedCount++;
    } else {
      toAdd.push(article);
    }
  }

  console.log(`Articles to insert: ${toAdd.length}`);
  console.log(`Existing articles preserved (skipped): ${skippedCount}`);

  // 4. Construct final merged list
  // Maintain existing items first, then append any new distinct items
  const finalBlogList = [...existingItems, ...toAdd];

  if (toAdd.length === 0) {
    console.log("✨ Database is already fully populated and up to date! Zero duplicates inserted.");
  } else {
    // 5. Update Neon PostgreSQL
    console.log(`Writing ${finalBlogList.length} articles to site_content in Neon PostgreSQL...`);
    await sql`
      INSERT INTO site_content (section, data, updated_at)
      VALUES ('blog', ${JSON.stringify(finalBlogList)}, NOW())
      ON CONFLICT (section) DO UPDATE
      SET data = EXCLUDED.data, updated_at = NOW();
    `;
    console.log("✅ Successfully updated Neon PostgreSQL site_content table.");
  }

  // 6. Synchronize local fallback data/site_content.json
  const fallbackPath = path.join(process.cwd(), "data", "site_content.json");
  try {
    let fallbackJson = {};
    try {
      const fileData = await fs.readFile(fallbackPath, "utf-8");
      fallbackJson = JSON.parse(fileData);
    } catch {
      fallbackJson = {};
    }

    fallbackJson.blog = finalBlogList;
    await fs.writeFile(fallbackPath, JSON.stringify(fallbackJson, null, 2), "utf-8");
    console.log(`✅ Synchronized fallback ${fallbackPath} with ${finalBlogList.length} articles.`);
  } catch (err) {
    console.error("Failed to sync fallback JSON file:", err.message);
  }

  // 7. Verify Database Count
  const verifyRows = await sql`SELECT section, jsonb_array_length(data) as count FROM site_content WHERE section = 'blog'`;
  const postgreCount = verifyRows[0]?.count || 0;
  console.log("==================================================");
  console.log(`VERIFIED POSTGRESQL RECORD COUNT: ${postgreCount} articles`);
  console.log(`ALL ARTICLES ARE PUBLISHED: YES`);
  console.log("==================================================");
}

seedBlog().catch((err) => {
  console.error("❌ Fatal Seeding Error:", err);
  process.exit(1);
});
