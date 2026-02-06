#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distRoot = path.resolve(__dirname, "..", "astro", "dist");

const isIgnored = (href) => {
  return (
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#") ||
    href.startsWith("javascript:") ||
    href.startsWith("data:")
  );
};

const stripQuery = (url) => url.split("?")[0].split("#")[0];
const decodeUrl = (url) => {
  let cleaned = url.replace(/&amp;/g, "&");
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch {
    // ignore decoding errors
  }
  return cleaned;
};

const listHtmlFiles = async (dir) => {
  const results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await listHtmlFiles(full)));
    } else if (entry.name.endsWith(".html")) {
      results.push(full);
    }
  }
  return results;
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const resolveRoute = async (urlPath) => {
  const cleaned = stripQuery(urlPath);
  const rel = cleaned.replace(/^\//, "");
  if (!rel) return await fileExists(path.join(distRoot, "index.html"));
  const asFile = path.join(distRoot, rel);
  if (await fileExists(asFile)) return true;
  const asHtml = path.join(distRoot, `${rel}.html`);
  if (await fileExists(asHtml)) return true;
  const asIndex = path.join(distRoot, rel, "index.html");
  return await fileExists(asIndex);
};

const checkLinks = async () => {
  const htmlFiles = await listHtmlFiles(distRoot);
  const missing = [];

  for (const file of htmlFiles) {
    const html = await fs.readFile(file, "utf8");
    const attrRe = /(href|src)=["']([^"']+)["']/gi;
    let match;
    while ((match = attrRe.exec(html))) {
      const url = match[2];
      if (!url || isIgnored(url)) continue;
      if (!url.startsWith("/")) continue;

      const cleaned = decodeUrl(stripQuery(url));
      const isAsset = cleaned.startsWith("/_astro/") || cleaned.startsWith("/assets/") || cleaned.startsWith("/scripts/");
      if (isAsset) {
        const assetPath = path.join(distRoot, cleaned.replace(/^\//, ""));
        if (!(await fileExists(assetPath))) {
          missing.push({ file, url });
        }
      } else {
        if (!(await resolveRoute(cleaned))) {
          missing.push({ file, url });
        }
      }
    }
  }

  if (missing.length) {
    console.log(`Broken links (${missing.length}):`);
    for (const item of missing) {
      console.log(`- ${path.relative(distRoot, item.file)} -> ${item.url}`);
    }
    process.exitCode = 1;
  } else {
    console.log("No broken local links found.");
  }
};

checkLinks().catch((err) => {
  console.error(err);
  process.exit(1);
});
