#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const publicRoot = path.join(repoRoot, "astro", "public");

const args = new Set(process.argv.slice(2));
const force = args.has("--force");

const INPUT_VIDEO = path.join(publicRoot, "assets", "images", "bloomn-hero.mp4");
const OUTPUT_DIR = path.join(publicRoot, "assets", "videos");

const OUTPUTS = [
  {
    file: "bloomn-hero-720p.webm",
    args: [
      "-i",
      INPUT_VIDEO,
      "-an",
      "-vf",
      "scale=-2:720:force_original_aspect_ratio=decrease",
      "-c:v",
      "libvpx-vp9",
      "-b:v",
      "0",
      "-crf",
      "33",
      "-row-mt",
      "1",
      "-deadline",
      "good",
      "-cpu-used",
      "2",
    ],
  },
  {
    file: "bloomn-hero-720p.mp4",
    args: [
      "-i",
      INPUT_VIDEO,
      "-an",
      "-vf",
      "scale=-2:720:force_original_aspect_ratio=decrease",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "24",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
    ],
  },
];

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const isOutputCurrent = async (inputPath, outputPath) => {
  try {
    const [inputStats, outputStats] = await Promise.all([
      fs.stat(inputPath),
      fs.stat(outputPath),
    ]);
    return outputStats.mtimeMs >= inputStats.mtimeMs;
  } catch {
    return false;
  }
};

const runFfmpeg = (argsList) =>
  new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, argsList, { stdio: "inherit" });
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }
      reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });

const main = async () => {
  if (!ffmpegPath) {
    console.warn("ffmpeg-static binary is unavailable; skipping video optimization.");
    return;
  }

  if (!(await fileExists(INPUT_VIDEO))) {
    console.warn(`Source video not found: ${path.relative(repoRoot, INPUT_VIDEO)}`);
    return;
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let generated = 0;
  for (const output of OUTPUTS) {
    const outputPath = path.join(OUTPUT_DIR, output.file);
    const shouldSkip =
      !force &&
      (await fileExists(outputPath)) &&
      (await isOutputCurrent(INPUT_VIDEO, outputPath));

    if (shouldSkip) {
      continue;
    }

    const ffmpegArgs = ["-y", "-hide_banner", "-loglevel", "warning", ...output.args, outputPath];
    await runFfmpeg(ffmpegArgs);
    generated += 1;
  }

  console.log(`Generated ${generated} optimized hero video variant(s).`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
