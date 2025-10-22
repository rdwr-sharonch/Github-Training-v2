import { test, expect } from '@playwright/test';

test.describe('Superhero App Integration Tests', () => {
  test('should complete full user workflow from table to comparison and back', async ({ page }) => {
    // Start at homepage
    await page.goto('http://localhost:3001');

    // Verify initial state
    await expect(page.locator('h1')).toContainText('Superheroes');
    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
    await expect(page.locator('.compare-button')).toBeDisabled();

    // Select first superhero
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').click();
    await expect(page.locator('.selection-info p')).toContainText('(1/2 selected)');
    await expect(page.locator('.compare-button')).toBeDisabled();

    // Get first hero name for later verification
    const firstHeroName = await page.locator('tbody tr').nth(0).locator('td').nth(2).textContent();

    // Select second superhero
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();
    await expect(page.locator('.selection-info p')).toContainText('(2/2 selected)');
    await expect(page.locator('.compare-button')).toBeEnabled();

    // Get second hero name for later verification
    const secondHeroName = await page.locator('tbody tr').nth(1).locator('td').nth(2).textContent();

    // Navigate to comparison
    await page.locator('.compare-button').click();

    // Verify comparison view
    await expect(page.locator('.comparison-view')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Superhero Comparison');

    // Verify selected heroes are displayed
    await expect(page.locator('.hero-card h2').nth(0)).toContainText(firstHeroName);
    await expect(page.locator('.hero-card h2').nth(1)).toContainText(secondHeroName);

    // Verify stats comparison is shown
    await expect(page.locator('.stat-row')).toHaveCount(6);
    await expect(page.locator('.final-result')).toBeVisible();

    // Go back to table
    await page.locator('.back-button').click();

    // Verify back at table with cleared selections
    await expect(page.locator('.table-view')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Superheroes');
    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
    await expect(page.locator('.compare-button')).toBeDisabled();
  });

  test('should handle API data loading correctly', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Wait for data to load by waiting for first row to appear
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

    // Check that at least one superhero is displayed
    const rowCount = await page.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);

    // Verify data structure
    const firstRow = page.locator('tbody tr').first();

    // ID should be a number
    const idText = await firstRow.locator('td').nth(1).textContent();
    expect(idText).toMatch(/^\d+$/);

    // Name should not be empty
    const nameText = await firstRow.locator('td').nth(2).textContent();
    expect(nameText?.trim()).toBeTruthy();

    // Image should be present and have src
    const img = firstRow.locator('td').nth(3).locator('img');
    await expect(img).toBeVisible();
    const imgSrc = await img.getAttribute('src');
    expect(imgSrc).toBeTruthy();

    // All power stats should be numbers
    for (let i = 4; i <= 9; i++) {
      const statText = await firstRow.locator('td').nth(i).textContent();
      expect(statText).toMatch(/^\d+$/);
    }
  });

  test('should handle edge cases gracefully', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Wait for data to load by waiting for first row to appear
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

    // Check that we have data
    const rowCount = await page.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);

    // Test rapid selection/deselection
    const firstCheckbox = page.locator('tbody tr').nth(0).locator('input[type="checkbox"]');

    // Rapid clicks
    await firstCheckbox.click();
    await firstCheckbox.click();
    await firstCheckbox.click();

    // Should end up selected
    await expect(firstCheckbox).toBeChecked();
    await expect(page.locator('.selection-info p')).toContainText('(1/2 selected)');
  });

  test('should maintain selection state during view switches', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Select two heroes
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').click();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();

    const firstHeroName = await page.locator('tbody tr').nth(0).locator('td').nth(2).textContent();
    const secondHeroName = await page.locator('tbody tr').nth(1).locator('td').nth(2).textContent();

    // Go to comparison
    await page.locator('.compare-button').click();

    // Verify heroes are correctly displayed in comparison
    const heroNames = await page.locator('.hero-card h2').allTextContents();
    expect(heroNames).toContain(firstHeroName);
    expect(heroNames).toContain(secondHeroName);

    // Go back - selections should be cleared as per app behavior
    await page.locator('.back-button').click();

    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
  });

  test('should display correct page title', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await expect(page).toHaveTitle(/React App/);
  });
});
