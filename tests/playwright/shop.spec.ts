import { test, expect } from '@playwright/test';

test('shop purchase helper', async ({ page }) => {
  // desktop viewport
  await page.setViewportSize({ width: 1280, height: 800 });

  // disable debug overlays and minimal HUD flags early
  await page.addInitScript(() => {
    try {
      localStorage.setItem('showPersonas', 'false');
      localStorage.setItem('minimalHud', 'false');
    } catch {}
  });

  await page.goto(process.env.PLAYTEST_URL ?? 'http://localhost:5000', { waitUntil: 'load' });

  // Try clicking 'Start Game' via DOM regardless of Playwright locators
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')) as HTMLElement[];
    const start = buttons.find(b => b.textContent && b.textContent.trim() === 'Start Game');
    if (start) start.click();
  });

  // Aggressively click through tutorial buttons for up to 8s
  await page.evaluate(() => {
    const texts = ['Skip', 'Start!', 'Next'];
    const end = Date.now() + 8000;
    while (Date.now() < end) {
      const buttons = Array.from(document.querySelectorAll('button')) as HTMLElement[];
      let clicked = false;
      for (const t of texts) {
        const b = buttons.find(el => el.textContent && el.textContent.trim() === t);
        if (b) { try { b.click(); clicked = true; } catch {} }
      }
      if (!clicked) break;
    }
  });

  // Remove 'Show Personas' overlays defensively
  await page.evaluate(() => {
    try {
      const els = Array.from(document.querySelectorAll('*')).filter(e => e.textContent && e.textContent.includes('Show Personas'));
      for (const el of els) {
        try { if (el.parentNode) el.parentNode.removeChild(el); } catch { try { (el as HTMLElement).style.pointerEvents = 'none'; (el as HTMLElement).style.opacity = '0'; } catch {} }
      }
    } catch {}
  });

  // Wait up to 30s for HUD/shop to render
  await page.waitForSelector('[data-testid="open-shop"]', { timeout: 30000 });

  // Click open-shop via DOM
  await page.evaluate(() => { const b = document.querySelector('[data-testid="open-shop"]') as HTMLElement | null; if (b) b.click(); });

  // Click buy-helper
  await page.waitForSelector('[data-testid="buy-helper"]', { timeout: 5000 });
  await page.evaluate(() => { const b = document.querySelector('[data-testid="buy-helper"]') as HTMLElement | null; if (b) b.click(); });

  // Assert shop message
  const msg = page.getByTestId('shop-message');
  await expect(msg).toBeVisible({ timeout: 5000 });
  const text = (await msg.textContent())?.trim();
  expect(['NOT_ENOUGH_COINS', 'HELPER_PURCHASED']).toContain(text);
});
