import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { chromium } from 'playwright';

async function run() {
  const mdPath = path.resolve('docs/GAME_DESIGN.md');
  const pdfPath = path.resolve('docs/GAME_DESIGN.pdf');

  if (!fs.existsSync(mdPath)) {
    console.error('Markdown file not found:', mdPath);
    process.exit(1);
  }

  const md = fs.readFileSync(mdPath, 'utf8');

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Game Design Document</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #111; padding: 24px; }
  h1, h2, h3 { color: #2b2b2b; }
  h1 { font-size: 28px; margin-bottom: 8px; }
  h2 { font-size: 20px; margin-top: 20px; }
  p { line-height: 1.5; }
  pre { background: #f6f8fa; padding: 12px; border-radius: 6px; }
  code { background:#f6f8fa; padding:2px 4px; border-radius:4px; }
  img { max-width: 100%; height: auto; }
  blockquote { color: #555; border-left: 4px solid #eee; padding-left: 12px; margin-left:0; }
</style>
</head>
<body>
${marked(md)}
</body>
</html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  await browser.close();
  console.log('Wrote PDF to', pdfPath);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

