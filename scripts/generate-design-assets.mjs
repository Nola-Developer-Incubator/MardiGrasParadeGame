import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { chromium } from 'playwright';

function summarizeMarkdown(md) {
  // Simple summary: collect top-level headings and first paragraph under them
  const lines = md.split(/\r?\n/);
  const summaries = [];
  let currentHeading = null;
  let buffer = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const m = line.match(/^(#{1,3})\s+(.*)/);
    if (m) {
      if (currentHeading) {
        // flush buffer
        const para = buffer.find(l => l.length > 0) || '';
        summaries.push({ heading: currentHeading, excerpt: para });
      }
      currentHeading = m[2];
      buffer = [];
    } else {
      buffer.push(line);
    }
  }
  if (currentHeading) {
    const para = buffer.find(l => l.length > 0) || '';
    summaries.push({ heading: currentHeading, excerpt: para });
  }
  return summaries;
}

async function run() {
  const mdPath = path.resolve('docs/GAME_DESIGN.md');
  const outDir = path.resolve('docs');
  if (!fs.existsSync(mdPath)) throw new Error('GDD not found: ' + mdPath);
  const md = fs.readFileSync(mdPath, 'utf8');

  // 1) Create summary text file
  const summaryItems = summarizeMarkdown(md);
  const summaryLines = ['Game Design Document - Summary', '', `Source: ${mdPath}`, '', ...summaryItems.map(s => `## ${s.heading}\n${s.excerpt}\n`)];
  const summaryPath = path.join(outDir, 'GAME_DESIGN_summary.txt');
  fs.writeFileSync(summaryPath, summaryLines.join('\n\n'));
  console.log('Wrote summary to', summaryPath);

  // Prepare HTML from markdown
  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Game Design Document</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #111; padding: 24px; max-width: 794px; margin: 0 auto; }
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

  // 2) Use Playwright to render HTML and create thumbnails per A4 page height
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 794, height: 1122 } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  // compute scrollHeight
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const pageHeight = 1122; // pixels (approx A4 @96dpi)
  const pageCount = Math.max(1, Math.ceil(scrollHeight / pageHeight));
  console.log('Document height', scrollHeight, 'pages', pageCount);

  const thumbs = [];
  for (let i = 0; i < pageCount; i++) {
    const scrollY = i * pageHeight;
    await page.evaluate(y => window.scrollTo(0, y), scrollY);
    // small wait for layout
    await page.waitForTimeout(200);
    const screenshotPath = path.join(outDir, `GAME_DESIGN_thumb_${i + 1}.png`);
    await page.screenshot({ path: screenshotPath, clip: { x: 0, y: 0, width: 794, height: 1122 } });
    console.log('Wrote thumbnail', screenshotPath);
    thumbs.push(screenshotPath);
  }

  // 3) Create a simple Asset Checklist HTML and export PNG & PDF
  const checklistHtml = `<!doctype html>
<html><head><meta charset="utf-8"><title>Asset Checklist</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; padding: 24px; }
h1 { color:#2b2b2b }
ul { list-style: none; padding:0; }
li { margin: 10px 0; display:flex; align-items:center }
.checkbox { width:20px; height:20px; border:2px solid #333; margin-right:12px; display:inline-block }
.small { font-size: 13px; color:#555 }
.container { max-width: 700px }
</style>
</head><body>
<div class="container">
<h1>Asset Submission Checklist</h1>
<p class="small">Use this checklist when submitting a visual or audio asset for the Mardi Gras Parade Simulator.</p>
<ul>
<li><span class="checkbox"></span><strong>Model (glTF/GLB)</strong> — Pivot at origin, Y-up, scale 1 unit = 1 meter</li>
<li><span class="checkbox"></span><strong>Triangles</strong> — Under budget (characters &lt; 2k, floats &lt; 10k)</li>
<li><span class="checkbox"></span><strong>Textures</strong> — Albedo, Normal, Roughness present; formats WebP/PNG; max 2048×2048</li>
<li><span class="checkbox"></span><strong>Materials</strong> — No non-PBR hacks, metallic/roughness usage correct</li>
<li><span class="checkbox"></span><strong>LODs</strong> — Provided if asset is high-poly</li>
<li><span class="checkbox"></span><strong>Animations</strong> — Exported as clips inside GLB (if applicable)</li>
<li><span class="checkbox"></span><strong>Sound</strong> — SFX 44.1kHz, normalized, short (0.1–1s)</li>
<li><span class="checkbox"></span><strong>Naming</strong> — Files named kebab-case, include version number</li>
<li><span class="checkbox"></span><strong>Notes</strong> — Provide short README describing pivot, anchor, and any special setup</li>
</ul>
<p class="small">Designer: _____________________  Date: __________</p>
</div>
</body></html>`;
  const checklistPathHtml = path.join(outDir, 'ASSET_CHECKLIST.html');
  fs.writeFileSync(checklistPathHtml, checklistHtml);
  // render and save PNG + PDF
  const checklistPage = await browser.newPage({ viewport: { width: 794, height: 1122 } });
  await checklistPage.setContent(checklistHtml, { waitUntil: 'networkidle' });
  const checklistPng = path.join(outDir, 'ASSET_CHECKLIST.png');
  await checklistPage.screenshot({ path: checklistPng, fullPage: false });
  const checklistPdf = path.join(outDir, 'ASSET_CHECKLIST.pdf');
  await checklistPage.pdf({ path: checklistPdf, format: 'A4', printBackground: true });
  console.log('Wrote checklist PNG and PDF to', checklistPng, checklistPdf);

  await browser.close();
  console.log('Generated all assets.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

