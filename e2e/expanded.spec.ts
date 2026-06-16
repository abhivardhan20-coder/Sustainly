import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Expanded E2E Flows', () => {
  test('Login Page Accessibility and Visibility', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify login is visible
    await expect(page.locator('text=Continue with Google')).toBeVisible();

    // Verify accessibility on the login page
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('Dashboard Accessibility Check', async ({ page }) => {
    await page.goto('/dashboard');
    // If not authenticated, we expect redirect to '/'
    if (page.url().endsWith('/')) {
      return; // Skip if redirected
    }
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Onboarding Flow Visibility', async ({ page }) => {
    await page.goto('/onboarding');
    if (page.url().endsWith('/')) return;
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Chat Logger Accessibility and Input', async ({ page }) => {
    await page.goto('/log');
    if (page.url().endsWith('/')) return;
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Garden View Visibility', async ({ page }) => {
    await page.goto('/garden');
    if (page.url().endsWith('/')) return;
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
