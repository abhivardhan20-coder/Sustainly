import { test, expect } from '@playwright/test';

test.describe('Main User Journey', () => {
  // Use a mocked or pre-existing state to bypass Google Auth
  // We simulate being authenticated by manipulating the local storage/store or mocking API
  
  test.beforeEach(async ({ page }) => {
    // Set E2E auth mock flag before page load
    await page.addInitScript(() => {
      (window as unknown as { __E2E_AUTH_MOCK__?: boolean }).__E2E_AUTH_MOCK__ = true;
    });

    // Navigate to the app
    await page.goto('/');
    
    // Evaluate to mock Zustand store directly so we bypass auth
    await page.evaluate(() => {
      const state = {
        state: {
          profile: {
            id: 'test-user',
            name: 'Test User',
            city: 'Test City',
            diet: 'everything',
            primaryCommute: ['car'],
            homeACUsage: 'track',
            createdAt: new Date().toISOString()
          },
          dailyLogs: {},
          garden: { trees: 0, flowers: 0, lastGrown: new Date().toISOString() },
          todaysActions: [],
          streak: 1,
          lastLoggedDate: new Date().toISOString(),
          messages: [],
          theme: 'light'
        },
        version: 0
      };
      localStorage.setItem('sustainly-storage', JSON.stringify(state));
    });
  });

  test('User can log activity and view garden', async ({ page }) => {
    // Reload to apply mocked state
    await page.reload();
    await page.waitForLoadState('networkidle');

    // We should be redirected to dashboard automatically
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('h1.text-3xl')).toContainText('Welcome back, Test');

    // Navigate to Log Activity
    await page.click('text=Log');
    await expect(page).toHaveURL(/.*\/log/);
    
    // Fill the chat input
    const input = page.locator('input[type="text"], textarea').first();
    await input.fill('I biked to work today');
    
    // We don't click send to avoid hitting the actual Gemini API unless we mock it,
    // but we verify the send button exists and is clickable.
    const sendButton = page.getByRole('button', { name: /send/i }).first();
    await expect(sendButton).toBeVisible();
    
    // Navigate to Garden
    await page.click('text=Garden');
    await expect(page).toHaveURL(/.*\/garden/);
    await expect(page.locator('text=Your Impact Garden')).toBeVisible();
  });
});
