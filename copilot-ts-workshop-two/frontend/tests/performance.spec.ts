import { test, expect } from '@playwright/test';

test.describe('Performance and Load Tests', () => {
  test('should load superhero data within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:3001');

    // Wait for first data row to appear and measure load time
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

    const loadTime = Date.now() - startTime;

    // Expect page to load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Verify data is actually loaded
    const rowCount = await page.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should handle large number of interactions smoothly', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await expect(page.locator('tbody tr').first()).toBeVisible();

    const startTime = Date.now();

    // Perform rapid selections and deselections
    for (let i = 0; i < 10; i++) {
      const checkbox1 = page.locator('tbody tr').nth(0).locator('input[type="checkbox"]');
      const checkbox2 = page.locator('tbody tr').nth(1).locator('input[type="checkbox"]');

      await checkbox1.click();
      await checkbox2.click();
      await checkbox1.click(); // Deselect
      await checkbox2.click(); // Deselect
    }

    const interactionTime = Date.now() - startTime;

    // Should handle 40 clicks within 3 seconds
    expect(interactionTime).toBeLessThan(3000);

    // Verify final state is consistent
    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
  });

  test('should efficiently render comparison view', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Select heroes
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').click();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();

    const startTime = Date.now();

    // Navigate to comparison
    await page.locator('.compare-button').click();

    // Wait for comparison view to fully render
    await expect(page.locator('.comparison-view')).toBeVisible();
    await expect(page.locator('.stat-row')).toHaveCount(6);
    await expect(page.locator('.final-result')).toBeVisible();

    const renderTime = Date.now() - startTime;

    // Comparison view should render within 1 second
    expect(renderTime).toBeLessThan(1000);
  });

  test('should maintain performance with repeated navigation', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const navigationTimes: number[] = [];

    for (let i = 0; i < 5; i++) {
      // Select heroes
      await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').click();
      await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();

      const startTime = Date.now();

      // Go to comparison
      await page.locator('.compare-button').click();
      await expect(page.locator('.comparison-view')).toBeVisible();

      // Go back
      await page.locator('button:has-text("← Back to Heroes Table")').click();
      await expect(page.locator('.table-view')).toBeVisible();

      const navigationTime = Date.now() - startTime;
      navigationTimes.push(navigationTime);
    }

    // Average navigation time should be reasonable
    const avgTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length;
    expect(avgTime).toBeLessThan(1500);

    // No navigation should be extremely slow
    navigationTimes.forEach(time => {
      expect(time).toBeLessThan(3000);
    });
  });

  test('should handle memory efficiently with multiple comparisons', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Perform multiple different comparisons
    const comparisons = [
      [0, 1], [1, 2], [0, 2], [2, 0], [1, 0]
    ];

    for (const [first, second] of comparisons) {
      // Select heroes
      await page.locator('tbody tr').nth(first).locator('input[type="checkbox"]').click();
      await page.locator('tbody tr').nth(second).locator('input[type="checkbox"]').click();

      // Compare
      await page.locator('.compare-button').click();
      await expect(page.locator('.comparison-view')).toBeVisible();

      // Verify comparison is working
      await expect(page.locator('.hero-card')).toHaveCount(2);
      await expect(page.locator('.stat-row')).toHaveCount(6);

      // Go back
      await page.locator('button:has-text("← Back to Heroes Table")').click();
      await expect(page.locator('.table-view')).toBeVisible();

      // Verify selections are cleared
      await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
    }
  });
});
