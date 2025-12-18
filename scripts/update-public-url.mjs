import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const repoRoot = process.cwd();
const lastFile = path.join(repoRoot, 'docs', 'last-public-url.txt');
const launchFile = path.join(repoRoot, 'docs', 'launch.html');
const qrScript = path.join(repoRoot, 'scripts', 'generate-qr.mjs');
const qrOut = path.join(repoRoot, 'docs', 'browser-qr.svg');

function readUrlFromLastFile() {
  if (!fs.existsSync(lastFile)) return null;
  const lines = fs.readFileSync(lastFile, 'utf8').split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  // find first line that looks like a URL
  for (const l of lines) {
    if (l.startsWith('#')) continue;
    if (l.startsWith('http')) return l;
  }
  return null;
}

function writeLaunchHtml(url) {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="refresh" content="1;url=${url}" />
  <title>Mardi Gras Parade - Launch</title>
  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;padding:2rem;background:#0b0b0b;color:#fff;text-align:center}</style>
</head>
<body>
  <h1>Opening public playtest...</h1>
  <p>If your browser doesn't redirect automatically, <a href="${url}">click here</a>.</p>
  <p><small>${url}</small></p>
</body>
</html>`;
  fs.writeFileSync(launchFile, html, 'utf8');
  console.log(`Wrote launch page: ${launchFile}`);
}

function generateQr(url) {
  if (!fs.existsSync(qrScript)) {
    console.warn('QR script not found, skipping QR generation');
    return;
  }
  console.log('Generating QR with URL:', url);
  const env = { ...process.env, URL: url };
  const res = spawnSync(process.execPath, [qrScript], { env, stdio: 'inherit' });
  if (res.error) {
    console.error('Failed to run QR generator:', res.error);
  }
}

function ensureDocsDir() {
  const d = path.join(repoRoot, 'docs');
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function main() {
  ensureDocsDir();
  const url = readUrlFromLastFile();
  if (!url) {
    console.error('No URL found in', lastFile);
    process.exit(1);
  }
  writeLaunchHtml(url);
  generateQr(url);
  console.log('Update complete. Launch page and QR updated.');
}

main();

