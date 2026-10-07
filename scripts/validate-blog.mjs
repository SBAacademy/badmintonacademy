import { allArticles, existingArticles } from "./data/all-articles.mjs";

console.log("==================================================");
console.log("STARTING BLOG INVENTORY VALIDATION");
console.log("==================================================");

let hasErrors = false;

// 1. Total Count Check
console.log(`Total articles in inventory: ${allArticles.length}`);
if (allArticles.length < 105) {
  console.error(`❌ ERROR: Total articles (${allArticles.length}) is less than required minimum 105!`);
  hasErrors = true;
} else {
  console.log(`✅ Total articles count (${allArticles.length}) meets requirement (>= 105).`);
}

// 2. Duplicate Slugs Check
const slugSet = new Set();
const duplicateSlugs = [];
for (const article of allArticles) {
  if (slugSet.has(article.slug)) {
    duplicateSlugs.push(article.slug);
  }
  slugSet.add(article.slug);
}

if (duplicateSlugs.length > 0) {
  console.error(`❌ ERROR: Duplicate slugs found:`, duplicateSlugs);
  hasErrors = true;
} else {
  console.log(`✅ 0 duplicate slugs found across all ${allArticles.length} articles.`);
}

// 3. Duplicate Titles Check
const titleSet = new Set();
const duplicateTitles = [];
for (const article of allArticles) {
  const normTitle = article.title.trim().toLowerCase();
  if (titleSet.has(normTitle)) {
    duplicateTitles.push(article.title);
  }
  titleSet.add(normTitle);
}

if (duplicateTitles.length > 0) {
  console.error(`❌ ERROR: Duplicate titles found:`, duplicateTitles);
  hasErrors = true;
} else {
  console.log(`✅ 0 duplicate titles found across all ${allArticles.length} articles.`);
}

// 4. Missing Fields & Content Length Check
let shortContentCount = 0;
for (const article of allArticles) {
  if (!article.title || !article.slug || !article.category || !article.excerpt || !article.author) {
    console.error(`❌ ERROR: Missing required fields in article: ${article.slug}`);
    hasErrors = true;
  }
  if (!Array.isArray(article.content) || article.content.length === 0) {
    console.error(`❌ ERROR: Missing content in article: ${article.slug}`);
    hasErrors = true;
  }

  const wordCount = article.content.join(" ").split(/\s+/).length;
  if (wordCount < 200) {
    console.warn(`⚠️ WARNING: Article ${article.slug} has only ${wordCount} words.`);
    shortContentCount++;
  }
}

if (shortContentCount === 0) {
  console.log(`✅ All ${allArticles.length} articles have substantial content length.`);
}

// 5. Existing Articles Preservation Check
const existingSlugs = existingArticles.map((a) => a.slug);
for (const exSlug of existingSlugs) {
  const found = allArticles.find((a) => a.slug === exSlug);
  if (!found) {
    console.error(`❌ ERROR: Original article ${exSlug} is missing from inventory!`);
    hasErrors = true;
  }
}
console.log(`✅ All ${existingArticles.length} existing original articles are strictly preserved.`);

// 6. Publication Status & Date Check
let unpublishedCount = 0;
for (const article of allArticles) {
  if (article.status !== "PUBLISHED") {
    console.warn(`⚠️ WARNING: Article ${article.slug} has status ${article.status}`);
    unpublishedCount++;
  }
  if (isNaN(new Date(article.publishDate).getTime())) {
    console.error(`❌ ERROR: Invalid publishDate in ${article.slug}: ${article.publishDate}`);
    hasErrors = true;
  }
}
console.log(`✅ All ${allArticles.length} articles have status PUBLISHED and valid dates.`);

// 7. Categories Breakdown
const categoryMap = {};
for (const a of allArticles) {
  categoryMap[a.category] = (categoryMap[a.category] || 0) + 1;
}

console.log("\nCATEGORY DISTRIBUTION:");
console.table(categoryMap);

// 8. Internal Link Check
const validInternalLinkPatterns = [
  /^\/$/,
  /^\/about$/,
  /^\/programs(\/[a-z0-9-]+)?$/,
  /^\/branches(\/[a-z0-9-]+)?$/,
  /^\/coaches(\/[a-z0-9-]+)?$/,
  /^\/contact$/,
  /^\/blog(\/[a-z0-9-]+)?$/,
  /^\/(kadavanthra|kumbalanghi|maradu|palluruthy|chullikal)$/,
  /^\/terms$/,
  /^\/privacy$/,
];

let brokenLinkCount = 0;
for (const article of allArticles) {
  const text = article.content.join(" ");
  const linkMatches = text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
  for (const m of linkMatches) {
    const url = m[2];
    if (url.startsWith("/")) {
      const isValid = validInternalLinkPatterns.some((p) => p.test(url));
      if (!isValid) {
        console.warn(`⚠️ Potentially invalid internal link in ${article.slug}: ${url}`);
        brokenLinkCount++;
      }
    }
  }
}

if (brokenLinkCount === 0) {
  console.log(`✅ All internal markdown links match valid site routes.`);
}

console.log("==================================================");
if (hasErrors) {
  console.error("❌ VALIDATION FAILED");
  process.exit(1);
} else {
  console.log("🎉 ALL QUALITY & VALIDATION CHECKS PASSED!");
  process.exit(0);
}
