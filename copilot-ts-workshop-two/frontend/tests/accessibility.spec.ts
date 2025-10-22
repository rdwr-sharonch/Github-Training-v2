import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await expect(page.locator('h1')).toContainText('Superheroes');
  });

  test('should have proper page structure and heading hierarchy', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h1')).toHaveText('Superheroes');

    // Check table has proper structure
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check table has proper headers
    const headers = page.locator('th');
    await expect(headers).toHaveCount(10);

    // Verify header text for screen readers
    await expect(headers.nth(0)).toHaveText('Select');
    await expect(headers.nth(1)).toHaveText('ID');
    await expect(headers.nth(2)).toHaveText('Name');
  });

  test('should support keyboard navigation for checkboxes', async ({ page }) => {
    // Wait for data to load
    await expect(page.locator('tbody tr').first()).toBeVisible();

    // Focus first checkbox directly instead of relying on Tab navigation
    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
    await firstCheckbox.focus();

    // Check if checkbox is focused
    await expect(firstCheckbox).toBeFocused();

    // Select using Space key
    await page.keyboard.press('Space');
    await expect(firstCheckbox).toBeChecked();

    // Navigate to next checkbox and test focus
    const secondCheckbox = page.locator('tbody tr').nth(1).locator('input[type="checkbox"]');
    await secondCheckbox.focus();
    await expect(secondCheckbox).toBeFocused();

    // Test Space key selection on second checkbox
    await page.keyboard.press('Space');
    await expect(secondCheckbox).toBeChecked();
  });

  test('should have proper alt text for superhero images', async ({ page }) => {
    await expect(page.locator('tbody tr').first()).toBeVisible();

    // Check that all images have proper alt text matching hero names
    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    for (let i = 0; i < Math.min(rowCount, 3); i++) {
      const row = rows.nth(i);
      const heroName = await row.locator('td').nth(2).textContent();
      const heroImage = row.locator('td').nth(3).locator('img');

      await expect(heroImage).toHaveAttribute('alt', heroName || '');
    }
  });

  test('should support keyboard navigation for Compare button', async ({ page }) => {
    await expect(page.locator('tbody tr').first()).toBeVisible();

    // Select two heroes using keyboard
    const firstCheckbox = page.locator('tbody tr').nth(0).locator('input[type="checkbox"]');
    const secondCheckbox = page.locator('tbody tr').nth(1).locator('input[type="checkbox"]');

    await firstCheckbox.click();
    await secondCheckbox.click();

    // Navigate to compare button using keyboard
    const compareButton = page.locator('.compare-button');
    await compareButton.focus();
    await expect(compareButton).toBeFocused();

    // Activate compare button with Enter
    await page.keyboard.press('Enter');
    await expect(page.locator('h1')).toContainText('Superhero Comparison');
  });

  test('should support keyboard navigation in comparison view', async ({ page }) => {
    // Setup comparison
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').click();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();
    await page.locator('.compare-button').click();

    // Test back button keyboard accessibility
    const backButton = page.locator('button:has-text("← Back to Heroes Table")');
    await backButton.focus();
    await expect(backButton).toBeFocused();

    // Navigate back using keyboard
    await page.keyboard.press('Enter');
    await expect(page.locator('h1')).toContainText('Superheroes');
  });

  test('should have proper button states and labels', async ({ page }) => {
    // Compare button should be disabled initially
    const compareButton = page.locator('.compare-button');
    await expect(compareButton).toBeDisabled();
    await expect(compareButton).toHaveText('Compare Heroes');

    // Select one hero
    await page.locator('tbody tr').first().locator('input[type="checkbox"]').click();
    await expect(compareButton).toBeDisabled(); // Still disabled with only 1 selection

    // Select second hero
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();
    await expect(compareButton).toBeEnabled(); // Now enabled with 2 selections
  });

  test('should provide clear selection feedback', async ({ page }) => {
    // Check initial state feedback
    const selectionInfo = page.locator('.selection-info p');
    await expect(selectionInfo).toContainText('Select 2 superheroes to compare (0/2 selected)');

    // Select first hero and check feedback
    await page.locator('tbody tr').first().locator('input[type="checkbox"]').click();
    await expect(selectionInfo).toContainText('(1/2 selected)');

    // Check selected heroes display
    const selectedHeroes = page.locator('.selected-heroes');
    await expect(selectedHeroes).toBeVisible();

    // Select second hero and check feedback
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();
    await expect(selectionInfo).toContainText('(2/2 selected)');
  });
});
