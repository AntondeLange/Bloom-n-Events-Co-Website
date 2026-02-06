#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const args = new Set(process.argv.slice(2));
const shouldDelete = args.has("--delete");

const scanDirs = [
  path.join(repoRoot, "astro", "src"),
  path.join(repoRoot, "backend", "src"),
];

const scanFiles = [
  path.join(repoRoot, "manifest.json"),
  path.join(repoRoot, "robots.txt"),
  path.join(repoRoot, "sitemap.xml"),
];

const includeExts = new Set([
  ".astro",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".css",
  ".json",
  ".html",
]);

const excludeDirs = new Set([
  path.join(repoRoot, "node_modules"),
  path.join(repoRoot, "dist"),
  path.join(repoRoot, "astro", "dist"),
  path.join(repoRoot, "docs"),
  path.join(repoRoot, "tmp"),
  path.join(repoRoot, ".git"),
  path.join(repoRoot, "assets"),
  path.join(repoRoot, "astro", "public"),
]);

const publicRoot = path.join(repoRoot, "astro", "public");
const publicAssetsRoot = path.join(publicRoot, "assets");

const allowedExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".gif",
  ".webp",
  ".avif",
  ".mp4",
  ".webm",
  ".json",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
]);

// Allow spaces and parentheses inside asset paths; stop at quote or newline.
const assetRegex = /\/assets\/[^"'\n]+/gi;
const assetRegexNoSlash = /assets\/[^"'\n]+/gi;

const referenced = new Set();
const referencedCanonical = new Set();

const normalizeRef = (raw) => {
  let ref = raw.trim().replace(/^[("'`]+|[)"'`,;]+$/g, "");
  ref = ref.replace(/\\/g, "/");
  if (ref.startsWith("/")) {
    ref = ref.slice(1);
  }
  ref = ref.split("?")[0].split("#")[0];
  try {
    ref = decodeURIComponent(ref);
  } catch {
    // ignore decoding errors; keep raw path
  }
  if (!ref.startsWith("assets/")) {
    return null;
  }
  const ext = path.extname(ref).toLowerCase();
  if (!allowedExtensions.has(ext)) {
    return null;
  }
  return ref;
};

const canonicalPath = (ref) => {
  // Remove common responsive suffixes like -1200w, -768w, -2x
  const withoutSize = ref.replace(/-\d{2,5}w(?=\.)/gi, "").replace(/-\d+x(?=\.)/gi, "");
  // Collapse raster formats so .jpg/.webp/.avif variants share a base
  return withoutSize.replace(/\.(avif|webp|png|jpe?g)$/i, "");
};

const shouldScanDir = (dirpath) => {
  for (const excluded of excludeDirs) {
    if (dirpath === excluded || dirpath.startsWith(`${excluded}${path.sep}`)) {
      return false;
    }
  }
  return true;
};

const scanTextForAssets = (text) => {
  const matches = text.match(assetRegex) ?? [];
  const matchesNoSlash = text.match(assetRegexNoSlash) ?? [];
  for (const match of matches.concat(matchesNoSlash)) {
    const normalized = normalizeRef(match);
    if (normalized) {
      referenced.add(normalized);
      referencedCanonical.add(canonicalPath(normalized));
    }
  }
};

const scanFile = async (filePath) => {
  try {
    const text = await fs.readFile(filePath, "utf8");
    scanTextForAssets(text);
  } catch {
    // ignore unreadable files
  }
};

const walkDir = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldScanDir(fullPath)) {
        await walkDir(fullPath);
      }
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!includeExts.has(ext)) {
      continue;
    }
    await scanFile(fullPath);
  }
};

const listFiles = async (dir) => {
  const results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await listFiles(fullPath)));
    } else {
      results.push(fullPath);
    }
  }
  return results;
};

const removeEmptyDirs = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await removeEmptyDirs(path.join(dir, entry.name));
    }
  }
  const remaining = await fs.readdir(dir);
  if (remaining.length === 0) {
    await fs.rmdir(dir);
  }
};

const main = async () => {
  for (const dir of scanDirs) {
    try {
      await walkDir(dir);
    } catch {
      // ignore missing dirs
    }
  }
  for (const filePath of scanFiles) {
    await scanFile(filePath);
  }

  let publicAssets = [];
  try {
    publicAssets = (await listFiles(publicAssetsRoot)).map((file) =>
      path.relative(publicRoot, file).replace(/\\/g, "/")
    );
  } catch {
    console.error(`Missing public assets directory: ${publicAssetsRoot}`);
    process.exit(1);
  }

const unreferenced = publicAssets
  .filter((ref) => {
    if (referenced.has(ref)) return false;
    const canon = canonicalPath(ref);
    return !referencedCanonical.has(canon);
  })
  .sort();
  const missing = Array.from(referenced)
    .filter((ref) => !publicAssets.includes(ref))
    .sort();

  if (missing.length) {
    console.log(`Missing referenced assets (${missing.length}):`);
    console.log(missing.join("\n"));
  } else {
    console.log("Missing referenced assets: 0");
  }

  console.log(`Unreferenced assets (${unreferenced.length}):`);
  if (unreferenced.length) {
    console.log(unreferenced.join("\n"));
  }

  if (shouldDelete && unreferenced.length) {
    for (const rel of unreferenced) {
      const fullPath = path.join(publicRoot, rel);
      try {
        await fs.unlink(fullPath);
      } catch {
        // ignore deletion errors
      }
    }
    await removeEmptyDirs(publicAssetsRoot);
    console.log(`Deleted ${unreferenced.length} unreferenced assets.`);
  }
};

await main();
