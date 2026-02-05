import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4322";
const outDir = path.resolve("artifacts/visual-check");

const pages = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "capabilities", path: "/capabilities" },
  { name: "events", path: "/events" },
  { name: "workshops", path: "/workshops" },
  { name: "displays", path: "/displays" },
  { name: "team", path: "/team" },
  { name: "gallery", path: "/gallery" },
  { name: "contact", path: "/contact" },
  { name: "case-connect140", path: "/case-study-centuria-connect140" },
  { name: "case-50th", path: "/case-study-centuria-50th-birthday" },
  { name: "case-breast-cancer", path: "/case-study-centuria-breast-cancer" },
  { name: "case-forrestfield", path: "/case-study-hawaiian-forrestfield" },
  { name: "case-nibbles", path: "/case-study-hawaiian-neighbourhood-nibbles" },
  { name: "policies", path: "/policies" },
  { name: "tandcs", path: "/tandcs" },
];

const breakpoints = [
  { name: "360x740", width: 360, height: 740 },
  { name: "390x844", width: 390, height: 844 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
];

const disableMotionCss = `
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
`;

function ensureDir(target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
}

function safeFileName(value) {
  return value.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").toLowerCase();
}

function resolveChromiumPath() {
  const cacheDir = path.join(os.homedir(), "Library", "Caches", "ms-playwright");
  const candidates = [
    path.join(cacheDir, "chromium_headless_shell-1208", "chrome-headless-shell-mac-arm64", "chrome-headless-shell"),
    path.join(cacheDir, "chromium_headless_shell-1208", "chrome-headless-shell-mac-x64", "chrome-headless-shell"),
    path.join(cacheDir, "chromium-1208", "chrome-mac-arm64", "Chromium.app", "Contents", "MacOS", "Chromium"),
    path.join(cacheDir, "chromium-1208", "chrome-mac-x64", "Chromium.app", "Contents", "MacOS", "Chromium"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

async function capture() {
  ensureDir(outDir);
  const executablePath = resolveChromiumPath();
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });

  try {
    for (const viewport of breakpoints) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
      });

      for (const pageDef of pages) {
        const page = await context.newPage();
        const url = `${baseUrl}${pageDef.path}`;
        const fileName = `${safeFileName(pageDef.name)}__${viewport.name}.png`;
        const filePath = path.join(outDir, fileName);

        try {
          await page.goto(url, { waitUntil: "networkidle" });
          await page.addStyleTag({ content: disableMotionCss });
          await page.evaluate(() => document.fonts?.ready);
          await page.waitForTimeout(300);
          await page.screenshot({ path: filePath, fullPage: true });
          process.stdout.write(`Captured ${url} @ ${viewport.name}\n`);
        } catch (error) {
          process.stderr.write(`Failed ${url} @ ${viewport.name}: ${error}\n`);
        } finally {
          await page.close();
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }
}

capture().catch((error) => {
  process.stderr.write(`Visual check failed: ${error}\n`);
  process.exit(1);
});
