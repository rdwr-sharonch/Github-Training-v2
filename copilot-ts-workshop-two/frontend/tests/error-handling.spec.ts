import { test, expect } from '@playwright/test';

test.describe('Error Handling and Data Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('should validate superhero data integrity', async ({ page }) => {
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10000 });

    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();

    // Test at least first 5 rows for data integrity
    const testRows = Math.min(rowCount, 5);

    for (let i = 0; i < testRows; i++) {
      const row = rows.nth(i);

      // ID should be a positive number
      const idText = await row.locator('td').nth(1).textContent();
      const id = parseInt(idText || '0');
      expect(id).toBeGreaterThan(0);
      expect(idText).toMatch(/^\d+$/);

      // Name should not be empty or just whitespace
      const name = await row.locator('td').nth(2).textContent();
      expect(name?.trim()).toBeTruthy();
      expect(name?.trim().length).toBeGreaterThan(0);

      // Image should have valid src attribute
      const img = row.locator('td').nth(3).locator('img');
      await expect(img).toBeVisible();
      const imgSrc = await img.getAttribute('src');
      expect(imgSrc).toBeTruthy();
      expect(imgSrc).not.toBe('');

      // All stats should be valid numbers between 0-100
      for (let statIndex = 4; statIndex <= 9; statIndex++) {
        const statText = await row.locator('td').nth(statIndex).textContent();
        const statValue = parseInt(statText || '-1');
        expect(statValue).toBeGreaterThanOrEqual(0);
        expect(statValue).toBeLessThanOrEqual(100);
        expect(statText).toMatch(/^\d+$/);
      }
    }
  });

  test('should handle missing or broken images gracefully', async ({ page }) => {
    await expect(page.locator('tbody tr').first()).toBeVisible();

    // Check if any images fail to load
    const images = page.locator('tbody tr img');
    const imageCount = await images.count();

    for (let i = 0; i < Math.min(imageCount, 3); i++) {
      const img = images.nth(i);

      // Image should be visible (even if broken, it should still appear)
      await expect(img).toBeVisible();

      // Image should have alt text
      const altText = await img.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText?.trim()).not.toBe('');
    }
  });

  test('should handle empty selection state properly', async ({ page }) => {
    // Verify initial empty state
    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
    await expect(page.locator('.compare-button')).toBeDisabled();

    // Try to click disabled compare button (should do nothing)
    const compareButton = page.locator('.compare-button');
    await compareButton.click({ force: true }); // Force click disabled button

    // Should still be on table view
    await expect(page.locator('h1')).toContainText('Superheroes');
    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
  });

  test('should handle rapid selection changes without breaking state', async ({ page }) => {
    await expect(page.locator('tbody tr').first()).toBeVisible();

    const checkbox1 = page.locator('tbody tr').nth(0).locator('input[type="checkbox"]');
    const checkbox2 = page.locator('tbody tr').nth(1).locator('input[type="checkbox"]');
    const checkbox3 = page.locator('tbody tr').nth(2).locator('input[type="checkbox"]');

    // Rapid fire selections
    await checkbox1.click();
    await checkbox2.click();
    await checkbox3.click(); // Should replace first selection
    await checkbox1.click(); // Should replace second selection
    await checkbox2.click(); // Should replace third selection

    // Final state should be consistent
    await expect(page.locator('.selection-info p')).toContainText('(2/2 selected)');
    await expect(page.locator('.compare-button')).toBeEnabled();

    // Should have exactly 2 checked checkboxes
    const checkedBoxes = page.locator('input[type="checkbox"]:checked');
    await expect(checkedBoxes).toHaveCount(2);
  });

  test('should validate comparison calculations are correct', async ({ page }) => {
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').click();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();

    // Get hero names and stats from table
    const hero1Name = await page.locator('tbody tr').nth(0).locator('td').nth(2).textContent();
    const hero2Name = await page.locator('tbody tr').nth(1).locator('td').nth(2).textContent();

    // Get stats for both heroes
    const hero1Stats = [];
    const hero2Stats = [];

    for (let i = 4; i <= 9; i++) {
      const stat1 = await page.locator('tbody tr').nth(0).locator('td').nth(i).textContent();
      const stat2 = await page.locator('tbody tr').nth(1).locator('td').nth(i).textContent();
      hero1Stats.push(parseInt(stat1 || '0'));
      hero2Stats.push(parseInt(stat2 || '0'));
    }

    // Navigate to comparison
    await page.locator('.compare-button').click();

    // Verify hero names are correct
    await expect(page.locator('.hero-card h2').nth(0)).toHaveText(hero1Name || '');
    await expect(page.locator('.hero-card h2').nth(1)).toHaveText(hero2Name || '');

    // Calculate expected score manually
    let hero1Score = 0;
    let hero2Score = 0;

    for (let i = 0; i < 6; i++) {
      if (hero1Stats[i] > hero2Stats[i]) hero1Score++;
      else if (hero2Stats[i] > hero1Stats[i]) hero2Score++;
    }

    // Verify displayed score matches calculation
    const scoreText = await page.locator('.final-result p').textContent();
    const expectedScore = `Score: ${hero1Score}-${hero2Score}`;
    expect(scoreText).toContain(expectedScore);

    // Verify winner announcement matches score
    if (hero1Score > hero2Score) {
      await expect(page.locator('h3')).toContainText(`${hero1Name} Wins!`);
    } else if (hero2Score > hero1Score) {
      await expect(page.locator('h3')).toContainText(`${hero2Name} Wins!`);
    } else {
      await expect(page.locator('h3')).toContainText("It's a Tie!");
    }
  });

  test('should handle app navigation correctly', async ({ page }) => {
    // Start at table view
    await expect(page.locator('h1')).toContainText('Superheroes');

    // Select heroes and go to comparison
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').click();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();
    await page.locator('.compare-button').click();

    // Verify we're in comparison view
    await expect(page.locator('h1')).toContainText('Superhero Comparison');

    // Use app's back button to navigate back
    await page.locator('button:has-text("← Back to Heroes Table")').click();

    // Should be back at table view with selections cleared
    await expect(page.locator('h1')).toContainText('Superheroes');
    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');

    // Verify app state is properly reset
    await expect(page.locator('.compare-button')).toBeDisabled();
    await expect(page.locator('.selected-heroes')).not.toBeVisible();
  });

  test('should maintain consistent state across page interactions', async ({ page }) => {
    // Test multiple complete workflows in sequence
    for (let iteration = 0; iteration < 3; iteration++) {
      // Select different heroes each time
      const first = iteration % 3;
      const second = (iteration + 1) % 3;

      await page.locator(`tbody tr`).nth(first).locator('input[type="checkbox"]').click();
      await page.locator(`tbody tr`).nth(second).locator('input[type="checkbox"]').click();

      // Verify selection state
      await expect(page.locator('.selection-info p')).toContainText('(2/2 selected)');
      await expect(page.locator('.compare-button')).toBeEnabled();

      // Go to comparison
      await page.locator('.compare-button').click();
      await expect(page.locator('.comparison-view')).toBeVisible();

      // Go back
      await page.locator('button:has-text("← Back to Heroes Table")').click();
      await expect(page.locator('.table-view')).toBeVisible();
      await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
    }
  });
});
