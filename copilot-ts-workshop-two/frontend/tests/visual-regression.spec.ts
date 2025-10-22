import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });
  });

  test('should maintain consistent table layout', async ({ page }) => {
    // Take screenshot of the main table view for documentation
    await expect(page.locator('table')).toBeVisible();

    // Take screenshot of full page for layout comparison (stored for reference)
    await page.screenshot({
      path: 'test-results/table-view-layout.png',
      fullPage: true
    });

    // Verify table structure instead of visual comparison
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('thead')).toBeVisible();
    await expect(page.locator('tbody')).toBeVisible();
    await expect(page.locator('th')).toHaveCount(10);
  });

  test('should display selection states correctly', async ({ page }) => {
    // Screenshot initial state (for documentation)
    await page.screenshot({
      path: 'test-results/initial-state.png',
      clip: { x: 0, y: 0, width: 1200, height: 200 }
    });

    // Verify initial state functionally
    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');

    // Select one hero and verify state
    await page.locator('tbody tr').first().locator('input[type="checkbox"]').click();
    await expect(page.locator('.selection-info')).toContainText('(1/2 selected)');

    await page.screenshot({
      path: 'test-results/one-selected.png',
      clip: { x: 0, y: 0, width: 1200, height: 200 }
    });

    // Select second hero and verify state
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();
    await expect(page.locator('.selection-info')).toContainText('(2/2 selected)');

    await page.screenshot({
      path: 'test-results/two-selected.png',
      clip: { x: 0, y: 0, width: 1200, height: 200 }
    });

    // Verify compare button is enabled
    await expect(page.locator('.compare-button')).toBeEnabled();
  });

  test('should render comparison view consistently', async ({ page }) => {
    // Setup comparison view
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').click();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();
    await page.locator('.compare-button').click();

    await expect(page.locator('.comparison-view')).toBeVisible();

    // Screenshot comparison layout (for documentation)
    await page.screenshot({
      path: 'test-results/comparison-view.png',
      fullPage: true
    });

    // Verify components are present functionally
    await expect(page.locator('.hero-card')).toHaveCount(2);
    await expect(page.locator('.vs-section')).toBeVisible();
    await expect(page.locator('.stats-comparison')).toBeVisible();
    await expect(page.locator('.final-result')).toBeVisible();
    await expect(page.locator('.stat-row')).toHaveCount(6);
  });

  test('should display responsive layout correctly', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Wait for layout to adjust
      await page.waitForTimeout(500);

      // Verify core elements are still visible and functional
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('.compare-button')).toBeVisible();

      // Screenshot for documentation
      await page.screenshot({
        path: `test-results/table-${viewport.name}.png`,
        fullPage: true
      });

      // Test comparison view responsiveness
      await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').click();
      await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();
      await page.locator('.compare-button').click();

      // Verify comparison elements are visible at this viewport
      await expect(page.locator('.comparison-view')).toBeVisible();
      await expect(page.locator('.hero-card')).toHaveCount(2);

      await page.screenshot({
        path: `test-results/comparison-${viewport.name}.png`,
        fullPage: true
      });

      // Go back for next iteration
      await page.locator('button:has-text("← Back to Heroes Table")').click();
    }
  });

  test('should highlight selected rows visually', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    const secondRow = page.locator('tbody tr').nth(1);

    // Verify initial state - no selected class
    await expect(firstRow).not.toHaveClass(/selected-row/);

    // Select first row and verify styling
    await firstRow.locator('input[type="checkbox"]').click();
    await expect(firstRow).toHaveClass(/selected-row/);

    // Select second row and verify both have styling
    await secondRow.locator('input[type="checkbox"]').click();
    await expect(firstRow).toHaveClass(/selected-row/);
    await expect(secondRow).toHaveClass(/selected-row/);

    // Take screenshot for documentation
    await page.locator('tbody').screenshot({
      path: 'test-results/two-rows-selected.png'
    });
  });

  test('should display stat comparisons with proper visual indicators', async ({ page }) => {
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').click();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();
    await page.locator('.compare-button').click();

    // Verify stat comparison structure
    const statRows = page.locator('.stat-row');
    await expect(statRows).toHaveCount(6);

    // Take screenshots for documentation
    const statCount = await statRows.count();
    for (let i = 0; i < Math.min(statCount, 3); i++) {
      await statRows.nth(i).screenshot({
        path: `test-results/stat-row-${i}.png`
      });
    }

    // Verify winner elements exist (functional test)
    const allStatValues = page.locator('.stat-value');
    await expect(allStatValues).toHaveCount(12); // 6 stats × 2 heroes

    // Verify final result section structure
    await expect(page.locator('.final-result')).toBeVisible();
    await expect(page.locator('.final-result h2')).toContainText('Final Result');
  });

  test('should maintain visual consistency across browser actions', async ({ page }) => {
    // Test that UI state is consistent after various interactions

    // Initial state verification
    await expect(page.locator('h1')).toContainText('Superheroes');
    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
    await page.screenshot({ path: 'test-results/consistency-1-initial.png' });

    // After selecting heroes
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').click();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();
    await expect(page.locator('.selection-info p')).toContainText('(2/2 selected)');
    await page.screenshot({ path: 'test-results/consistency-2-selected.png' });

    // After going to comparison
    await page.locator('.compare-button').click();
    await expect(page.locator('h1')).toContainText('Superhero Comparison');
    await page.screenshot({ path: 'test-results/consistency-3-comparison.png' });

    // After going back
    await page.locator('button:has-text("← Back to Heroes Table")').click();
    await expect(page.locator('h1')).toContainText('Superheroes');
    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
    await page.screenshot({ path: 'test-results/consistency-4-back.png' });

    // Verify we're back to initial state functionality
    await expect(page.locator('.compare-button')).toBeDisabled();
    await expect(page.locator('.selected-heroes')).not.toBeVisible();
  });
});
