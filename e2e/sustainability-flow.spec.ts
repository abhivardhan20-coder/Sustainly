import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Sustainability Flow', () => {
  test('complete user journey: login → onboarding → log activity → view garden', async ({ page }) => {
    // Set E2E auth mock flag before page load
    await page.addInitScript(() => {
      (window as unknown as { __E2E_AUTH_MOCK__?: boolean }).__E2E_AUTH_MOCK__ = true;
    });

    // 1. Login
    await page.goto('/');
    await page.click('button:has-text("Continue with Google")');
    await expect(page).toHaveURL(/.*\/onboarding/, { timeout: 15000 });

    // 2. Onboarding
    await page.fill('input#name', 'Test User');
    await page.click('label[for="diet-vegan"]');
    await page.click('label[for="commute-bike"]');
    await page.click('button:has-text("grow your garden")');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // 3. Log an activity
    await page.goto('/log');
    await page.fill('textarea#chat-input', 'I rode my bike 5 miles today and ate a vegan lunch.');
    await page.click('button[aria-label="Send message to Sustainly"]');
    
    // Wait for activities to be added (mock returns 2 activities)
    await expect(page.locator('div[role="status"] >> text=pts')).toHaveCount(2, { timeout: 15000 });

    // 4. Check garden updated
    await page.goto('/garden');
    await expect(page.locator('text=Your Impact Garden')).toBeVisible();
    await expect(page.locator('div[role="img"][aria-label="Garden"]')).toBeVisible();

    // 5. Run accessibility check
    const accessibilityScan = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScan.violations).toEqual([]);
  });
});
