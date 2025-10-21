import { test, expect } from '@playwright/test';

// Basic sanity test for Playwright setup
test('homepage has superhero content', async ({ page }) => {
  await page.goto('http://localhost:3001');
  await expect(page).toHaveTitle(/React/i);
  await expect(page.locator('body')).toContainText(/superheroes/i);
});
