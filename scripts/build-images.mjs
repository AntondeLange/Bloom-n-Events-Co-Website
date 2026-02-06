#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const publicRoot = path.join(repoRoot, "astro", "public");

const args = new Set(process.argv.slice(2));
const force = args.has("--force");

const scanDirs = [path.join(repoRoot, "astro", "src")];
const includeExts = new Set([
  ".astro",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".css",
  ".html",
  ".json",
]);
const excludeDirs = new Set([
  path.join(repoRoot, "astro", "dist"),
  path.join(repoRoot, "astro", "node_modules"),
  path.join(repoRoot, "node_modules"),
  path.join(repoRoot, ".git"),
]);

const SUPPORTED_EXTS = new Set([".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"]);
const WIDTHS = [480, 768, 1024, 1600];

const assetRegex = /\/assets\/images\/[^"'\n]+/gi;

const normalizeRef = (raw) => {
  let ref = raw.trim().replace(/^[('"`]+|[)'"`,;]+$/g, "");
  if (!ref.startsWith("/assets/images/")) return null;
  try {
    ref = decodeURIComponent(ref);
  } catch {
    // ignore decoding errors
  }
  if (/-\d{2,5}w\.[a-zA-Z]+$/.test(ref)) return null;
  return ref.startsWith("/") ? ref.slice(1) : ref;
};

const shouldScanDir = (dirpath) => {
  for (const excluded of excludeDirs) {
    if (dirpath === excluded || dirpath.startsWith(`${excluded}${path.sep}`)) {
      return false;
    }
  }
  return true;
};

const walkDir = async (dir, refs) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldScanDir(full)) {
        await walkDir(full, refs);
      }
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!includeExts.has(ext)) continue;
    try {
      const text = await fs.readFile(full, "utf8");
      const matches = text.match(assetRegex) ?? [];
      for (const match of matches) {
        const normalized = normalizeRef(match);
        if (normalized) refs.add(normalized);
      }
    } catch {
      // ignore unreadable files
    }
  }
};

const findReferencedImages = async () => {
  const refs = new Set();
  for (const dir of scanDirs) {
    if (await fileExists(dir)) {
      await walkDir(dir, refs);
    }
  }
  return Array.from(refs);
};

const splitExt = (filePath) => {
  const ext = path.extname(filePath);
  return { base: filePath.slice(0, -ext.length), ext };
};

const ensureDir = async (filePath) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
};

const generateVariants = async (inputPath) => {
  const { base, ext } = splitExt(inputPath);
  const input = sharp(inputPath, { failOnError: false }).rotate();
  const metadata = await input.metadata();

  for (const width of WIDTHS) {
    const resizeOpts = { width, withoutEnlargement: true };

    const outputBase = `${base}-${width}w`;
    const fallbackPath = `${outputBase}${ext}`;

    if (force || !(await fileExists(fallbackPath))) {
      await ensureDir(fallbackPath);
      let pipeline = sharp(inputPath, { failOnError: false }).rotate().resize(resizeOpts);
      if (ext.toLowerCase() === ".png") {
        pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
      } else {
        pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true, progressive: true });
      }
      await pipeline.toFile(fallbackPath);
    }

    const webpPath = `${outputBase}.webp`;
    if (force || !(await fileExists(webpPath))) {
      await ensureDir(webpPath);
      await sharp(inputPath, { failOnError: false })
        .rotate()
        .resize(resizeOpts)
        .webp({ quality: 75 })
        .toFile(webpPath);
    }

    const avifPath = `${outputBase}.avif`;
    if (force || !(await fileExists(avifPath))) {
      await ensureDir(avifPath);
      await sharp(inputPath, { failOnError: false })
        .rotate()
        .resize(resizeOpts)
        .avif({ quality: 50, effort: 4 })
        .toFile(avifPath);
    }
  }

  return { width: metadata.width, height: metadata.height };
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const main = async () => {
  const refs = await findReferencedImages();
  if (!refs.length) {
    console.log("No referenced images found.");
    return;
  }

  let processed = 0;
  for (const ref of refs) {
    const ext = path.extname(ref);
    if (!SUPPORTED_EXTS.has(ext)) continue;
    const inputPath = path.join(publicRoot, ref);
    if (!(await fileExists(inputPath))) {
      console.warn(`Missing image: ${ref}`);
      continue;
    }
    await generateVariants(inputPath);
    processed += 1;
  }

  console.log(`Processed ${processed} images.`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
