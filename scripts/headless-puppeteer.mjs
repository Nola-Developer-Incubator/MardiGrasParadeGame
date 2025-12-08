import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const outScreenshot = 'puppeteer-playtest.png';
  const outLog = 'puppeteer-console.log';
  const logs = [];

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

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
    logs.push({ type: 'requestfailed', url: req.url(), failure: req.failure()?.errorText || null });
  });

  try {
    console.log('Navigating to http://127.0.0.1:5000');
    await page.goto('http://127.0.0.1:5000', { waitUntil: 'load', timeout: 20000 });

    // Try to click the Start Game button
    try {
      const startBtn = await page.$x("//button[contains(., 'Start Game') or text()='Start Game']");
      if (startBtn && startBtn.length > 0) {
        console.log('Start Game button found, clicking');
        await startBtn[0].click();
      } else {
        console.log('Start Game button not found via xpath');
      }
    } catch (e) {
      console.log('Start Game click attempt failed: ' + String(e));
    }

    // Wait a few seconds to allow the scene to initialize
    await page.waitForTimeout(5000);

    // Screenshot
    await page.screenshot({ path: outScreenshot, fullPage: false });
    console.log('Screenshot saved to', outScreenshot);
  } catch (err) {
    console.error('Headless puppeteer test error:', err);
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
