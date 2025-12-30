import playwright from 'playwright';

(async () => {
  const url = 'https://Nola-Developer-Incubator.github.io/MardiGrasParadeGame/';
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const failedResponses = [];
  page.on('console', (m) => {
    if (m.type() === 'error') {
      errors.push(m.text());
      console.error('[console.error]', m.text());
    } else {
      console.log('[console]', m.type(), m.text());
    }
  });
  page.on('response', (r) => {
    if (!r.ok()) {
      failedResponses.push(`${r.status()} ${r.url()}`);
      console.error('[response.fail]', r.status(), r.url());
    }
  });

  const resp = await page.goto(url, { waitUntil: 'networkidle' });
  console.log('status', resp.status());
  await page.waitForTimeout(2000);
  console.log('collected errors', errors.length);
  console.log('collected failedResponses', failedResponses.length);
  await browser.close();
})();

