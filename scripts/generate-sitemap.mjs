#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const pagesDir = path.join(repoRoot, "astro", "src", "pages");
const baseUrl = "https://www.bloomneventsco.com.au";

const outputFiles = [
  path.join(repoRoot, "astro", "public", "sitemap.xml"),
  path.join(repoRoot, "sitemap.xml"),
];

const routeOrder = [
  "/",
  "/events",
  "/workshops",
  "/displays",
  "/capabilities",
  "/about",
  "/team",
  "/gallery",
  "/blog",
  "/contact",
  "/case-study-centuria-connect140",
  "/case-study-hawaiian-forrestfield",
  "/case-study-hawaiian-neighbourhood-nibbles",
  "/case-study-centuria-50th-birthday",
  "/case-study-centuria-breast-cancer",
  "/tandcs",
  "/policies",
];

const excludedRoutes = new Set(["/contact-success"]);
const orderLookup = new Map(routeOrder.map((route, index) => [route, index]));

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toRoute = (filePath) => {
  const relPath = path.relative(pagesDir, filePath).replace(/\\/g, "/");
  const withoutExt = relPath.replace(/\.astro$/, "");

  if (withoutExt === "index") return "/";
  if (withoutExt.endsWith("/index")) {
    return `/${withoutExt.slice(0, -"/index".length)}`;
  }

  return `/${withoutExt}`;
};

const getMetadata = (route) => {
  if (route === "/") {
    return { changefreq: "weekly", priority: "1.0" };
  }

  if (["/events", "/workshops", "/displays", "/capabilities"].includes(route)) {
    return { changefreq: "monthly", priority: "0.9" };
  }

  if (["/about", "/team"].includes(route)) {
    return { changefreq: "yearly", priority: "0.8" };
  }

  if (["/gallery", "/blog", "/contact"].includes(route)) {
    return { changefreq: "monthly", priority: "0.8" };
  }

  if (route.startsWith("/case-study-")) {
    return { changefreq: "yearly", priority: "0.7" };
  }

  if (["/tandcs", "/policies"].includes(route)) {
    return { changefreq: "yearly", priority: "0.5" };
  }

  return { changefreq: "monthly", priority: "0.6" };
};

const compareRoutes = (a, b) => {
  const aOrder = orderLookup.get(a.route);
  const bOrder = orderLookup.get(b.route);

  if (aOrder != null && bOrder != null) return aOrder - bOrder;
  if (aOrder != null) return -1;
  if (bOrder != null) return 1;

  return a.route.localeCompare(b.route);
};

const collectPageFiles = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "api") continue;
      files.push(...(await collectPageFiles(fullPath)));
      continue;
    }

    if (!entry.name.endsWith(".astro")) continue;
    files.push(fullPath);
  }

  return files;
};

const buildSitemapXml = (items) => {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];

  for (const item of items) {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(item.loc)}</loc>`);
    lines.push(`    <lastmod>${item.lastmod}</lastmod>`);
    lines.push(`    <changefreq>${item.changefreq}</changefreq>`);
    lines.push(`    <priority>${item.priority}</priority>`);
    lines.push("  </url>");
  }

  lines.push("</urlset>");
  return `${lines.join("\n")}\n`;
};

const main = async () => {
  const pageFiles = await collectPageFiles(pagesDir);
  const items = [];

  for (const filePath of pageFiles) {
    const route = toRoute(filePath);
    if (excludedRoutes.has(route)) continue;

    const stat = await fs.stat(filePath);
    const lastmod = stat.mtime.toISOString().slice(0, 10);
    const metadata = getMetadata(route);

    items.push({
      route,
      loc: `${baseUrl}${route === "/" ? "/" : route}`,
      lastmod,
      changefreq: metadata.changefreq,
      priority: metadata.priority,
    });
  }

  items.sort(compareRoutes);

  const xml = buildSitemapXml(items);
  await Promise.all(outputFiles.map((outputPath) => fs.writeFile(outputPath, xml, "utf8")));

  console.log(`Generated sitemap with ${items.length} URLs.`);
  for (const outputPath of outputFiles) {
    console.log(`Wrote ${outputPath}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
