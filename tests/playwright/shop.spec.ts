import { test, expect } from '@playwright/test';

test('shop purchase helper', async ({ page }) => {
  // Ensure desktop viewport so shop button isn't hidden (hidden on small screens)
  await page.setViewportSize({ width: 1280, height: 800 });

  // Ensure debug overlays or forced HUD flags are disabled before page loads
  await page.addInitScript(() => {
    try {
      localStorage.setItem('showPersonas', 'false');
      localStorage.setItem('minimalHud', 'false');
    } catch (e) {
      // ignore
    }
  });

  await page.goto(process.env.PLAYTEST_URL ?? 'http://localhost:5000');

  // Ensure the main tutorial overlay is handled: click Start Game if present
  const startButton = page.getByRole('button', { name: /Start Game/i });
  try {
    if (await startButton.isVisible({ timeout: 3000 })) {
      await startButton.click();

      // If the first-level tutorial appears, click Skip (or click through to Start!)
      const skipBtn = page.getByRole('button', { name: /^Skip$/i });
      try {
        if (await skipBtn.isVisible({ timeout: 2000 })) {
          await skipBtn.click();
        }
      } catch {
        // If Skip isn't visible, try final Start button in tutorial
        const finalStart = page.getByRole('button', { name: /Start!?$/i });
        try { if (await finalStart.isVisible({ timeout: 2000 })) await finalStart.click(); } catch { }
      }
    }
  } catch {
    // If the start button isn't present, assume we're already past tutorial
  }

  // Wait for HUD and open shop button
  const open = page.getByTestId('open-shop');
  await open.waitFor({ timeout: 10000 });
  await open.click();

  // Wait for buy helper button
  const buy = page.getByTestId('buy-helper');
  await buy.waitFor({ timeout: 5000 });
  await buy.click();

  // Expect shop message to appear
  const msg = page.getByTestId('shop-message');
  await expect(msg).toBeVisible({ timeout: 5000 });
  const text = (await msg.textContent())?.trim();
  // Either NOT_ENOUGH_COINS or HELPER_PURCHASED
  expect(['NOT_ENOUGH_COINS', 'HELPER_PURCHASED']).toContain(text);
});
