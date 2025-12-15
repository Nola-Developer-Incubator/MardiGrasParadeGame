#!/usr/bin/env node
// Usage: node scripts/import-logo-path.mjs "C:\path\to\your\logo.png"
// This script copies an external PNG into docs/images/logo-thumbnail.png
// If 'sharp' is installed, it will also generate resized PNGs (192x192 and 128x128).
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/import-logo-path.mjs "C:\\path\\to\\your\\logo.png"');
  process.exit(2);
}

const src = args[0];
const outDir = path.resolve('./docs/images');
if (!fs.existsSync(src)) {
  console.error(`Source file not found: ${src}`);
  process.exit(3);
}

fs.mkdirSync(outDir, { recursive: true });
const dest = path.join(outDir, 'logo-thumbnail.png');
fs.copyFileSync(src, dest);
console.log(`Copied ${src} -> ${dest}`);

// Try to generate resized versions if sharp is available
async function tryResize() {
  try {
    const sharpModule = await import('sharp');
    const sharp = sharpModule.default || sharpModule;
    const sizes = [192, 128];
    for (const s of sizes) {
      const out = path.join(outDir, `logo-${s}.png`);
      await sharp(dest).resize(s, s, { fit: 'inside' }).toFile(out);
      console.log(`Wrote resized ${out}`);
    }
    // also write a web-friendly small thumbnail
    const webOut = path.join(outDir, `logo-thumb-64.png`);
    await sharp(dest).resize(64, 64, { fit: 'cover' }).toFile(webOut);
    console.log(`Wrote resized ${webOut}`);
  } catch (err) {
    console.warn('Could not generate resized images. Install sharp to enable automatic resizing: npm install --save-dev sharp');
  }
}

tryResize().catch((e) => {
  console.warn('Resize step failed:', e?.message || e);
});

