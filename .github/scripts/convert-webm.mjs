import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const videoDirs = [path.join(root, 'images')];
const validExt = new Set(['.mp4', '.mov']);

async function* walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(p);
    } else {
      yield p;
    }
  }
}

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const p = spawn('ffmpeg', args, { stdio: 'inherit' });
    p.on('exit', code => (code === 0 ? resolve() : reject(new Error('ffmpeg exit ' + code))));
  });
}

async function convert(file) {
  const ext = path.extname(file).toLowerCase();
  if (!validExt.has(ext)) return;
  const out = file.replace(ext, '.webm');
  try {
    const src = await fs.promises.stat(file);
    try {
      const dst = await fs.promises.stat(out);
      if (dst.mtimeMs >= src.mtimeMs) return; // up-to-date
    } catch {}
    // VP9 + Opus, CRF 30 (balance size/quality), good quality, two-pass not needed for short clips
    const args = ['-y', '-i', file, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '30', '-pix_fmt', 'yuv420p', '-c:a', 'libopus', out];
    await runFFmpeg(args);
    console.log('webm:', path.relative(root, out));
  } catch (e) {
    console.warn('webm failed:', file, e?.message);
  }
}

async function main() {
  for (const dir of videoDirs) {
    if (!fs.existsSync(dir)) continue;
    for await (const f of walk(dir)) {
      await convert(f);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


