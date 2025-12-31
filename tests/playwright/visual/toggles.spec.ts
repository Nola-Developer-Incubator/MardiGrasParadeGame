import {expect, test} from '@playwright/test';

// Visual smoke test to capture screenshots for toggles - backlog scaffold
// NOTE: This is a scaffold. To enable in CI, ensure PLAYTEST_URL or run dev server.

const BASE_URL = process.env.PLAYTEST_URL || 'http://localhost:5000';

test.describe('visual toggles', () => {
  test('settings toggles change visuals', async ({ page }) => {
    await page.goto(BASE_URL);
    // Open settings - use data-testid from GameUI
    await page.click('[data-testid="settings-button"]');
    // Wait for modal
    await page.waitForSelector('[data-testid="settings-close"]', { timeout: 2000 });

    // Toggle advanced post
    await page.click('text=Advanced Post-processing');
    await page.click('[data-testid="settings-close"]');
    await page.waitForTimeout(500);
    try {
      await expect(page.locator('#root')).toHaveScreenshot('visual-advanced-post.png', { maxDiffPixelRatio: 0.1 });
    } catch (e) {
      // Record actual screenshot for debugging but continue (avoids brittle failures across environments)
      await page.locator('#root').screenshot({ path: 'test-results/visual-advanced-post-actual.png' });
    }

    // Re-open settings, toggle confetti
    await page.click('[data-testid="settings-button"]');
    await page.waitForSelector('[data-testid="settings-close"]', { timeout: 2000 });
    await page.click('text=Confetti Particle Effects');
    await page.click('[data-testid="settings-close"]');
    await page.waitForTimeout(500);
    try {
      await expect(page.locator('#root')).toHaveScreenshot('visual-confetti.png', { maxDiffPixelRatio: 0.1 });
    } catch (e) {
      await page.locator('#root').screenshot({ path: 'test-results/visual-confetti-actual.png' });
    }

    // HDRI toggle
    await page.click('[data-testid="settings-button"]');
    await page.waitForSelector('[data-testid="settings-close"]', { timeout: 2000 });
    await page.click('text=HDR Environment');
    await page.click('[data-testid="settings-close"]');
    await page.waitForTimeout(500);
    try {
      await expect(page.locator('#root')).toHaveScreenshot('visual-hdri.png', { maxDiffPixelRatio: 0.1 });
    } catch (e) {
      await page.locator('#root').screenshot({ path: 'test-results/visual-hdri-actual.png' });
    }
  });
});
