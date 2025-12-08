import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const outScreenshot = 'playwright-playtest.png';
  const outLog = 'playwright-console.log';
  const logs = [];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', (msg) => {
    try {
      logs.push({ type: msg.type(), text: msg.text() });
    } catch (e) {
      logs.push({ type: 'console', text: String(msg) });
    }
  });

  page.on('pageerror', (err) => {
    logs.push({ type: 'pageerror', message: err.message, stack: err.stack });
  });

  page.on('requestfailed', (req) => {
    logs.push({ type: 'requestfailed', url: req.url(), failure: req.failure() ? req.failure().errorText : null });
  });

  page.on('response', (res) => {
    logs.push({ type: 'response', url: res.url(), status: res.status() });
  });

  try {
    console.log('Navigating to http://127.0.0.1:5000');
    await page.goto('http://127.0.0.1:5000', { waitUntil: 'load', timeout: 20000 });

    // Wait for Start Game button or the canvas
    try {
      await page.waitForSelector('text=Start Game', { timeout: 7000 });
      console.log('Start Game button found, clicking');
      await page.click('text=Start Game');
    } catch (e) {
      console.log('Start Game button not found: ' + String(e));
    }

    // Wait for 5 seconds to let the scene run
    await page.waitForTimeout(5000);

    // Take screenshot of the viewport
    await page.screenshot({ path: outScreenshot, fullPage: false });
    console.log('Screenshot saved to', outScreenshot);
  } catch (err) {
    console.error('Headless test error:', err);
    logs.push({ type: 'scriptError', message: String(err), stack: err.stack });
  } finally {
    try {
      await fs.promises.writeFile(outLog, logs.map(l => JSON.stringify(l)).join('\n'));
      console.log('Console log saved to', outLog);
    } catch (e) {
      console.error('Failed to write logs:', e);
    }
    await browser.close();
  }
})();

