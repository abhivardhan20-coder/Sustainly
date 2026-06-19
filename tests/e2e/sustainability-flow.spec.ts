import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Sustainability Flow', () => {
  test('complete user journey: login → onboarding → log activity → view garden', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/onboarding');

    // 2. Onboarding
    await page.selectOption('select#diet', 'vegan');
    await page.selectOption('select#commute', 'bike');
    await page.click('button:has-text("Complete")');
    await expect(page).toHaveURL('/dashboard');

    // 3. Log an activity
    await page.goto('/chat');
    await page.fill('textarea', 'I rode my bike 5 miles today and ate a vegan lunch.');
    await page.click('button:has-text("Send")');
    await expect(page.locator('.activity-card')).toHaveCount(2);

    // 4. Check garden updated
    await page.goto('/garden');
    await expect(page.locator('.garden-tree')).toBeVisible();

    // 5. Run accessibility check
    const accessibilityScan = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScan.violations).toEqual([]);
  });
});
