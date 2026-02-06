#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const distRoot = path.join(repoRoot, "astro", "dist");

const pages = [
  { path: "/", file: "index.html" },
  { path: "/about/", file: path.join("about", "index.html") },
  { path: "/capabilities/", file: path.join("capabilities", "index.html") },
  { path: "/events/", file: path.join("events", "index.html") },
  { path: "/gallery/", file: path.join("gallery", "index.html") },
  { path: "/contact/", file: path.join("contact", "index.html") },
];

const stripQuery = (url) => url.split("?")[0].split("#")[0];

const extractUrls = (html) => {
  const urls = new Set();
  const external = new Set();

  const addUrl = (raw) => {
    if (!raw) return;
    const cleaned = stripQuery(raw.trim());
    if (!cleaned) return;
    if (cleaned.startsWith("http")) {
      external.add(cleaned);
      return;
    }
    if (cleaned.startsWith("//")) {
      external.add(`https:${cleaned}`);
      return;
    }
    if (cleaned.startsWith("/")) {
      urls.add(cleaned);
    }
  };

  const linkRe = /<link[^>]*rel=["']stylesheet["'][^>]*\shref=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(linkRe)) {
    addUrl(match[1]);
  }

  const preloadRe = /<link[^>]*rel=["']preload["'][^>]*\shref=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(preloadRe)) {
    addUrl(match[1]);
  }

  const scriptRe = /<script[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(scriptRe)) {
    addUrl(match[1]);
  }

  const imgRe = /<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(imgRe)) {
    addUrl(match[1]);
  }

  const posterRe = /<video[^>]*\sposter=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(posterRe)) {
    addUrl(match[1]);
  }

  const sourceRe = /<source[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(sourceRe)) {
    addUrl(match[1]);
  }

  return { urls: Array.from(urls), external: Array.from(external) };
};

const getSize = async (urlPath) => {
  let decoded = urlPath;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    // ignore decoding errors
  }
  const filePath = path.join(distRoot, decoded.replace(/^\//, ""));
  try {
    const stat = await fs.stat(filePath);
    return stat.size;
  } catch {
    return null;
  }
};

const categorize = (urlPath) => {
  const ext = path.extname(urlPath).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"].includes(ext)) return "image";
  if ([".js"].includes(ext)) return "js";
  if ([".css"].includes(ext)) return "css";
  if ([".mp4", ".webm"].includes(ext)) return "video";
  return "other";
};

const auditPage = async (page) => {
  const filePath = path.join(distRoot, page.file);
  const html = await fs.readFile(filePath, "utf8");
  const { urls, external } = extractUrls(html);

  const local = [];
  for (const url of urls) {
    const size = await getSize(url);
    local.push({ url, size });
  }

  const totals = {
    requests: 0,
    bytes: 0,
    imageBytes: 0,
    jsBytes: 0,
    cssBytes: 0,
    videoBytes: 0,
    otherBytes: 0,
  };

  for (const item of local) {
    if (item.size == null) continue;
    totals.requests += 1;
    totals.bytes += item.size;
    const bucket = categorize(item.url);
    if (bucket === "image") totals.imageBytes += item.size;
    else if (bucket === "js") totals.jsBytes += item.size;
    else if (bucket === "css") totals.cssBytes += item.size;
    else if (bucket === "video") totals.videoBytes += item.size;
    else totals.otherBytes += item.size;
  }

  return {
    path: page.path,
    local,
    external,
    totals,
  };
};

const listLargestAssets = async (dir, limit = 10) => {
  const files = [];
  const walk = async (d) => {
    const entries = await fs.readdir(d, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        const stat = await fs.stat(full);
        files.push({ file: full, size: stat.size });
      }
    }
  };
  await walk(dir);
  return files.sort((a, b) => b.size - a.size).slice(0, limit);
};

const formatBytes = (bytes) => {
  if (bytes == null) return "n/a";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

const main = async () => {
  const results = [];
  for (const page of pages) {
    results.push(await auditPage(page));
  }

  const largestImages = await listLargestAssets(path.join(distRoot, "assets", "images"), 15);
  const largestBundles = await listLargestAssets(path.join(distRoot, "_astro"), 10);

  const report = {
    generatedAt: new Date().toISOString(),
    pages: results,
    largestImages,
    largestBundles,
  };

  const outPath = path.join(repoRoot, "docs", "perf-audit-local.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(report, null, 2));

  const lines = [];
  lines.push("# Local Perf Asset Audit");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");
  lines.push("## Page Asset Totals (local, uncompressed)");
  lines.push("");
  lines.push("> Note: totals are based on HTML `src`/`href` references only. `srcset` variants and external resources are excluded, so real transfer sizes will differ.");
  lines.push("");
  lines.push("| Page | Requests | Total Bytes | Images | JS | CSS | Video | Other |");
  lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const page of results) {
    lines.push(
      `| ${page.path} | ${page.totals.requests} | ${formatBytes(page.totals.bytes)} | ${formatBytes(
        page.totals.imageBytes
      )} | ${formatBytes(page.totals.jsBytes)} | ${formatBytes(page.totals.cssBytes)} | ${formatBytes(
        page.totals.videoBytes
      )} | ${formatBytes(page.totals.otherBytes)} |`
    );
  }

  lines.push("");
  lines.push("## Largest Local Images");
  lines.push("");
  lines.push("| File | Size |");
  lines.push("| --- | ---: |");
  for (const item of largestImages) {
    const rel = path.relative(distRoot, item.file).replace(/\\/g, "/");
    lines.push(`| /${rel} | ${formatBytes(item.size)} |`);
  }

  lines.push("");
  lines.push("## Largest JS Bundles");
  lines.push("");
  lines.push("| File | Size |");
  lines.push("| --- | ---: |");
  for (const item of largestBundles) {
    const rel = path.relative(distRoot, item.file).replace(/\\/g, "/");
    lines.push(`| /${rel} | ${formatBytes(item.size)} |`);
  }

  const mdPath = path.join(repoRoot, "docs", "perf-audit-local.md");
  await fs.writeFile(mdPath, lines.join("\n"));

  console.log(`Wrote ${outPath}`);
  console.log(`Wrote ${mdPath}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
