import { test, expect } from '@playwright/test';

// This test assumes the dev server is running on http://localhost:5000
// Run with: npx playwright test tests/playwright/audio-bots.spec.ts --headed

test('audio unlock and bot presence', async ({ page }) => {
  await page.goto('http://localhost:5000');

  // Wait for tutorial overlay and click Enable Audio
  const enable = page.getByRole('button', { name: /Enable Audio/i });
  await expect(enable).toBeVisible({ timeout: 10000 });
  await enable.click();

  // Ensure audio unlock flag is set on window
  await page.waitForFunction(() => (window as any).__audioUnlocked === true, null, { timeout: 5000 });
  const unlocked = await page.evaluate(() => (window as any).__audioUnlocked === true);
  expect(unlocked).toBeTruthy();

  // Start game
  const start = page.getByRole('button', { name: /Start Game/i });
  await start.click();

  // Wait for playing phase HUD to appear
  await page.waitForSelector('text=COMPETITOR CATCHES', { timeout: 10000 });

  // Check for at least one configured bot name in HUD
  const botNames = ['King Rex', 'Queen Zulu', 'Saint Mardi', 'Jester Jo', 'Voodoo Vee', 'Mambo Mike'];
  let found = false;
  for (const name of botNames) {
    const has = await page.locator(`text=${name}`).count();
    if (has > 0) { found = true; break; }
  }
  expect(found).toBeTruthy();
});

