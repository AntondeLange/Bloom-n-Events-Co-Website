#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reportPath = path.resolve(__dirname, "..", "docs", "perf-audit-local.json");

const KB = 1024;
const MB = 1024 * 1024;

const budgets = {
  "/": { totalBytes: 2 * MB, imageBytes: 1.6 * MB, jsBytes: 300 * KB },
  "/about/": { totalBytes: 15 * MB, imageBytes: 14 * MB, jsBytes: 300 * KB },
  "/capabilities/": { totalBytes: 6 * MB, imageBytes: 5.5 * MB, jsBytes: 300 * KB },
  "/events/": { totalBytes: 6 * MB, imageBytes: 5.5 * MB, jsBytes: 300 * KB },
  "/gallery/": { totalBytes: 12 * MB, imageBytes: 11 * MB, jsBytes: 300 * KB },
  "/contact/": { totalBytes: 3 * MB, imageBytes: 2.5 * MB, jsBytes: 300 * KB },
};

const formatBytes = (bytes) => `${(bytes / MB).toFixed(2)} MB`;

const main = async () => {
  const raw = await fs.readFile(reportPath, "utf8");
  const report = JSON.parse(raw);
  const failures = [];

  for (const page of report.pages) {
    const budget = budgets[page.path];
    if (!budget) continue;
    if (page.totals.bytes > budget.totalBytes) {
      failures.push(
        `${page.path} total ${formatBytes(page.totals.bytes)} > ${formatBytes(budget.totalBytes)}`
      );
    }
    if (page.totals.imageBytes > budget.imageBytes) {
      failures.push(
        `${page.path} images ${formatBytes(page.totals.imageBytes)} > ${formatBytes(budget.imageBytes)}`
      );
    }
    if (budget.jsBytes && page.totals.jsBytes > budget.jsBytes) {
      failures.push(
        `${page.path} JS ${formatBytes(page.totals.jsBytes)} > ${formatBytes(budget.jsBytes)}`
      );
    }
  }

  if (failures.length) {
    console.log("Performance budget failures:");
    failures.forEach((line) => console.log(`- ${line}`));
    process.exitCode = 1;
  } else {
    console.log("Performance budgets OK.");
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
