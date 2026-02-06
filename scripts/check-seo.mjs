#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distRoot = path.resolve(__dirname, "..", "astro", "dist");
const baseUrl = "https://www.bloomneventsco.com.au";

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

const expectedCanonical = (filePath) => {
  const rel = path.relative(distRoot, filePath).replace(/\\/g, "/");
  if (rel === "index.html") return `${baseUrl}/`;
  if (rel.endsWith("/index.html")) {
    const dir = rel.replace(/\/index\.html$/, "");
    return `${baseUrl}/${dir}`;
  }
  const withoutExt = rel.replace(/\.html$/, "");
  return `${baseUrl}/${withoutExt}`;
};

const checkSeo = async () => {
  const files = await listHtmlFiles(distRoot);
  const issues = [];
  const htmlLinkRe = /href=["']([^"']+\.html)["']/gi;
  const canonicalRe = /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i;

  for (const file of files) {
    const html = await fs.readFile(file, "utf8");
    const expected = expectedCanonical(file);
    const canonicalMatch = html.match(canonicalRe);
    if (!canonicalMatch) {
      issues.push({ file, issue: "Missing canonical" });
    } else if (canonicalMatch[1] !== expected) {
      issues.push({ file, issue: `Canonical mismatch: ${canonicalMatch[1]} (expected ${expected})` });
    }

    let m;
    while ((m = htmlLinkRe.exec(html))) {
      const url = m[1];
      if (url.startsWith("http")) continue;
      issues.push({ file, issue: `Found .html link: ${url}` });
    }
  }

  if (issues.length) {
    console.log(`SEO issues (${issues.length}):`);
    for (const issue of issues) {
      console.log(`- ${path.relative(distRoot, issue.file)}: ${issue.issue}`);
    }
    process.exitCode = 1;
  } else {
    console.log("Canonical tags and internal links look good.");
  }
};

checkSeo().catch((err) => {
  console.error(err);
  process.exit(1);
});
