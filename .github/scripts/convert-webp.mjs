import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import sharp from 'sharp';

const root = process.cwd();
const imagesDir = path.join(root, 'images');
const validExt = new Set(['.jpg', '.jpeg', '.png']);

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

async function convertFile(file) {
  const originalExt = path.extname(file);
  const extLower = originalExt.toLowerCase();
  if (!validExt.has(extLower)) return;
  // Build output path by slicing off the original extension to avoid case-sensitivity pitfalls
  const out = file.slice(0, -originalExt.length) + '.webp';
  try {
    const srcStat = await fs.promises.stat(file);
    try {
      const outStat = await fs.promises.stat(out);
      if (outStat.mtimeMs >= srcStat.mtimeMs) return; // up-to-date
    } catch {}
    await sharp(file)
      .rotate()
      .webp({ quality: 82, effort: 4 })
      .toFile(out);
    console.log('webp:', path.relative(root, out));
  } catch (e) {
    console.warn('webp failed:', file, e?.message);
  }
}

async function main() {
  if (!fs.existsSync(imagesDir)) return;
  for await (const f of walk(imagesDir)) {
    await convertFile(f);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


