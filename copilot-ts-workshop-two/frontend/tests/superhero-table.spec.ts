import { test, expect } from '@playwright/test';

test.describe('Superhero Table View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    // Wait for data to load with better error handling
    await expect(page.locator('h1')).toContainText('Superheroes');
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
  });

  test('should display superhero table with correct headers', async ({ page }) => {
    // Check table headers with more specific selectors
    const headerTexts = await page.locator('th').allTextContents();
    expect(headerTexts).toEqual([
      'Select',
      'ID',
      'Name',
      'Image',
      'Intelligence',
      'Strength',
      'Speed',
      'Durability',
      'Power',
      'Combat'
    ]);

    // Verify table is properly structured
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('thead')).toBeVisible();
    await expect(page.locator('tbody')).toBeVisible();
  });

  test('should load and display superhero data with validation', async ({ page }) => {
    // Wait for table rows to load by waiting for at least one row to appear
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });

    // Check that at least one superhero is displayed
    const rowCount = await page.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
    expect(rowCount).toBeLessThan(100); // Reasonable upper bound

    // Check that first row has required data with proper validation
    const firstRow = page.locator('tbody tr').first();

    // ID should be a positive integer
    const idText = await firstRow.locator('td').nth(1).textContent();
    expect(idText).toMatch(/^\d+$/);
    expect(parseInt(idText || '0')).toBeGreaterThan(0);

    // Name should not be empty and should be reasonable length
    const nameText = await firstRow.locator('td').nth(2).textContent();
    expect(nameText?.trim()).toBeTruthy();
    expect(nameText?.trim().length).toBeGreaterThan(0);
    expect(nameText?.trim().length).toBeLessThan(50); // Reasonable name length

    // Image should be present with proper attributes
    const img = firstRow.locator('td').nth(3).locator('img');
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('src');
    await expect(img).toHaveAttribute('alt', nameText || '');

    // Validate all stat values are within expected range (0-100)
    for (let i = 4; i <= 9; i++) {
      const statText = await firstRow.locator('td').nth(i).textContent();
      expect(statText).toMatch(/^\d+$/);
      const statValue = parseInt(statText || '0');
      expect(statValue).toBeGreaterThanOrEqual(0);
      expect(statValue).toBeLessThanOrEqual(100);
    }
  });

  test('should show selection counter initially at 0/2', async ({ page }) => {
    const selectionInfo = page.locator('.selection-info p');
    await expect(selectionInfo).toBeVisible();
    await expect(selectionInfo).toContainText('Select 2 superheroes to compare (0/2 selected)');

    // Selected heroes section should not be visible initially
    await expect(page.locator('.selected-heroes')).not.toBeVisible();
  });

  test('should have compare button disabled initially with proper styling', async ({ page }) => {
    const compareButton = page.locator('.compare-button');
    await expect(compareButton).toBeVisible();
    await expect(compareButton).toBeDisabled();
    await expect(compareButton).toHaveText('Compare Heroes');

    // Verify button styling indicates disabled state
    await expect(compareButton).toHaveCSS('cursor', 'not-allowed');
  });

  test('should allow selecting a single superhero with proper feedback', async ({ page }) => {
    // Get hero name before selection for verification
    const heroName = await page.locator('tbody tr').first().locator('td').nth(2).textContent();

    // Select first superhero
    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
    await expect(firstCheckbox).toBeVisible();
    await firstCheckbox.click();

    // Verify checkbox is checked
    await expect(firstCheckbox).toBeChecked();

    // Check selection counter updates
    await expect(page.locator('.selection-info p')).toContainText('(1/2 selected)');

    // Check selected heroes display appears and shows correct hero
    const selectedHeroes = page.locator('.selected-heroes');
    await expect(selectedHeroes).toBeVisible();
    await expect(selectedHeroes).toContainText(heroName || '');

    // Compare button should still be disabled
    await expect(page.locator('.compare-button')).toBeDisabled();

    // Row should have selected styling
    const selectedRow = page.locator('tbody tr').first();
    await expect(selectedRow).toHaveClass(/selected-row/);

    // Verify only one checkbox is checked
    const checkedBoxes = page.locator('input[type="checkbox"]:checked');
    await expect(checkedBoxes).toHaveCount(1);
  });

  test('should allow selecting two superheroes and enable compare button', async ({ page }) => {
    // Get hero names for verification
    const hero1Name = await page.locator('tbody tr').nth(0).locator('td').nth(2).textContent();
    const hero2Name = await page.locator('tbody tr').nth(1).locator('td').nth(2).textContent();

    // Select first two superheroes
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').click();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();

    // Check selection counter
    await expect(page.locator('.selection-info p')).toContainText('(2/2 selected)');

    // Verify selected heroes display shows both names
    const selectedHeroes = page.locator('.selected-heroes');
    await expect(selectedHeroes).toBeVisible();
    await expect(selectedHeroes).toContainText(hero1Name || '');
    await expect(selectedHeroes).toContainText(hero2Name || '');

    // Compare button should be enabled
    const compareButton = page.locator('.compare-button');
    await expect(compareButton).toBeEnabled();
    await expect(compareButton).toHaveCSS('cursor', 'pointer');

    // Both rows should have selected class
    await expect(page.locator('tbody tr').nth(0)).toHaveClass(/selected-row/);
    await expect(page.locator('tbody tr').nth(1)).toHaveClass(/selected-row/);

    // Verify exactly 2 checkboxes are checked
    const checkedBoxes = page.locator('input[type="checkbox"]:checked');
    await expect(checkedBoxes).toHaveCount(2);
  });

  test('should allow deselecting a superhero with proper state cleanup', async ({ page }) => {
    // Select first superhero
    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
    await firstCheckbox.click();

    // Verify it's selected
    await expect(page.locator('.selection-info p')).toContainText('(1/2 selected)');
    await expect(page.locator('.selected-heroes')).toBeVisible();

    // Deselect it
    await firstCheckbox.click();

    // Verify it's deselected with proper cleanup
    await expect(firstCheckbox).not.toBeChecked();
    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
    await expect(page.locator('.selected-heroes')).not.toBeVisible();
    await expect(page.locator('tbody tr').first()).not.toHaveClass(/selected-row/);
    await expect(page.locator('.compare-button')).toBeDisabled();

    // Verify no checkboxes are checked
    const checkedBoxes = page.locator('input[type="checkbox"]:checked');
    await expect(checkedBoxes).toHaveCount(0);
  });

  test('should replace first selection when selecting third superhero (FIFO behavior)', async ({ page }) => {
    // Select first two superheroes
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').click();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();

    // Get names of selected heroes
    const secondHeroName = await page.locator('tbody tr').nth(1).locator('td').nth(2).textContent();
    const thirdHeroName = await page.locator('tbody tr').nth(2).locator('td').nth(2).textContent();

    // Verify initial selection state
    await expect(page.locator('tbody tr').nth(0)).toHaveClass(/selected-row/);
    await expect(page.locator('tbody tr').nth(1)).toHaveClass(/selected-row/);
    await expect(page.locator('.selection-info p')).toContainText('(2/2 selected)');

    // Select third superhero - should replace first selection (FIFO)
    await page.locator('tbody tr').nth(2).locator('input[type="checkbox"]').click();

    // First hero should be deselected, second and third should be selected
    await expect(page.locator('tbody tr').nth(0)).not.toHaveClass(/selected-row/);
    await expect(page.locator('tbody tr').nth(0).locator('input[type="checkbox"]')).not.toBeChecked();
    await expect(page.locator('tbody tr').nth(1)).toHaveClass(/selected-row/);
    await expect(page.locator('tbody tr').nth(1).locator('input[type="checkbox"]')).toBeChecked();
    await expect(page.locator('tbody tr').nth(2)).toHaveClass(/selected-row/);
    await expect(page.locator('tbody tr').nth(2).locator('input[type="checkbox"]')).toBeChecked();

    // Selection counter should still show 2/2
    await expect(page.locator('.selection-info p')).toContainText('(2/2 selected)');

    // Selected heroes display should show second and third heroes
    const selectedHeroes = page.locator('.selected-heroes');
    await expect(selectedHeroes).toContainText(secondHeroName || '');
    await expect(selectedHeroes).toContainText(thirdHeroName || '');

    // Compare button should remain enabled
    await expect(page.locator('.compare-button')).toBeEnabled();

    // Verify exactly 2 checkboxes are checked
    const checkedBoxes = page.locator('input[type="checkbox"]:checked');
    await expect(checkedBoxes).toHaveCount(2);
  });

  test('should display selected heroes names correctly', async ({ page }) => {
    // Select first two superheroes
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').click();
    const firstName = await page.locator('tbody tr').nth(0).locator('td').nth(2).textContent();

    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();
    const secondName = await page.locator('tbody tr').nth(1).locator('td').nth(2).textContent();

    // Check selected heroes display shows both names in expected format
    const selectedText = await page.locator('.selected-heroes').textContent();
    expect(selectedText).toContain(firstName || '');
    expect(selectedText).toContain(secondName || '');

    // Verify the format includes both names separated by comma
    expect(selectedText).toMatch(new RegExp(`${firstName}, ${secondName}`));
  });

  test('should handle checkbox interactions without visual glitches', async ({ page }) => {
    // Test rapid clicking doesn't cause visual issues
    const checkbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');

    // Rapid clicks
    for (let i = 0; i < 5; i++) {
      await checkbox.click();
      await page.waitForTimeout(50); // Small delay to allow state updates
    }

    // Final state should be consistent (checkbox should be checked after odd number of clicks)
    await expect(checkbox).toBeChecked();
    await expect(page.locator('.selection-info p')).toContainText('(1/2 selected)');
    await expect(page.locator('tbody tr').first()).toHaveClass(/selected-row/);
  });
});
