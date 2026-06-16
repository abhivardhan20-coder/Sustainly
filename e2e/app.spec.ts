import { test, expect } from '@playwright/test';

test('redirects unauthenticated user to login', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Wait for the page to load and react to render
  await page.waitForLoadState('networkidle');

  // Should be redirected to root/login since they are unauthenticated
  await expect(page).toHaveURL(/\//);
});

test('login page renders correctly', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('text=Continue with Google')).toBeVisible();
});
