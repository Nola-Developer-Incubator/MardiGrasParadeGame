import {expect, test} from '@playwright/test';

const PUBLIC_URL = process.env.PREVIEW_URL || 'https://Nola-Developer-Incubator.github.io/MardiGrasParadeGame/';
const LOCAL_URL = process.env.LOCAL_URL || 'http://127.0.0.1:5000';

async function checkPage(page, url: string) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  const resp = await page.goto(url, { waitUntil: 'networkidle' });
  // collect failing responses
  const failedResponses: string[] = [];
  page.on('response', (r) => {
    if (!r.ok()) {
      failedResponses.push(`${r.status()} ${r.url()}`);
    }
  });
  // give the app a couple seconds to initialize
  await page.waitForTimeout(2000);
  return { errors, failedResponses, status: resp?.status() };
}

// Run smoke checks for local URL and (optionally) public URL when PREVIEW_URL is explicitly provided.
test(`smoke: ${LOCAL_URL}`, async ({ page }) => {
  const { errors, failedResponses, status } = await checkPage(page, LOCAL_URL);
  expect(status).toBeLessThan(400);
  expect(errors.length).toBe(0);
  expect(failedResponses.length).toBe(0);
});

if (process.env.PREVIEW_URL) {
  test(`smoke: ${PUBLIC_URL}`, async ({ page }) => {
    const { errors, failedResponses, status } = await checkPage(page, PUBLIC_URL);
    expect(status).toBeLessThan(400);
    expect(errors.length).toBe(0);
    expect(failedResponses.length).toBe(0);
  });
}
