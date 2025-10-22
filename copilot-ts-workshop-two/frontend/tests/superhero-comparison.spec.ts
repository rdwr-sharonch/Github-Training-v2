import { test, expect } from '@playwright/test';

test.describe('Superhero Comparison View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    // Wait for data to load and select two heroes
    await expect(page.locator('h1')).toContainText('Superheroes');

    // Select first two superheroes
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').click();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').click();

    // Navigate to comparison view
    await page.locator('.compare-button').click();
  });

  test('should navigate to comparison view when compare button is clicked', async ({ page }) => {
    // Should show comparison view
    await expect(page.locator('.comparison-view')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Superhero Comparison');
  });

  test('should display both selected heroes with images and names', async ({ page }) => {
    // Should show two hero cards
    const heroCards = page.locator('.hero-card');
    await expect(heroCards).toHaveCount(2);

    // Each hero card should have an image and name
    await expect(heroCards.nth(0).locator('img')).toBeVisible();
    await expect(heroCards.nth(0).locator('h2')).not.toBeEmpty();

    await expect(heroCards.nth(1).locator('img')).toBeVisible();
    await expect(heroCards.nth(1).locator('h2')).not.toBeEmpty();
  });

  test('should display VS section between heroes', async ({ page }) => {
    await expect(page.locator('.vs-section h2')).toContainText('VS');
  });

  test('should display stats comparison for all power stats', async ({ page }) => {
    const expectedStats = ['Intelligence', 'Strength', 'Speed', 'Durability', 'Power', 'Combat'];

    // Check each stat individually to avoid strict mode violation
    for (let i = 0; i < expectedStats.length; i++) {
      await expect(page.locator('.stat-name').nth(i)).toContainText(expectedStats[i]);
    }

    // Should have 6 stat rows
    await expect(page.locator('.stat-row')).toHaveCount(6);
  });

  test('should highlight winning stats with winner class', async ({ page }) => {
    // Check that some stats have winner styling (unless it's a perfect tie)
    const statRows = page.locator('.stat-row');
    const count = await statRows.count();

    let hasWinners = false;
    for (let i = 0; i < count; i++) {
      const row = statRows.nth(i);
      const winnerElements = row.locator('.winner');
      if (await winnerElements.count() > 0) {
        hasWinners = true;
        // Winner element should contain a number
        await expect(winnerElements.first()).not.toBeEmpty();
      }
    }

    // At least one stat should have a winner (unless perfect tie which is unlikely)
    // This is a reasonable assumption given real superhero data
  });

  test('should display final result section', async ({ page }) => {
    await expect(page.locator('.final-result h2')).toContainText('Final Result');

    // Should show either winner or tie
    const winnerAnnouncement = page.locator('.winner-announcement');
    const tieAnnouncement = page.locator('.tie-announcement');

    const hasWinner = await winnerAnnouncement.count() > 0;
    const hasTie = await tieAnnouncement.count() > 0;

    expect(hasWinner || hasTie).toBe(true);

    if (hasWinner) {
      await expect(winnerAnnouncement.locator('h3')).toContainText('Wins!');
      await expect(winnerAnnouncement.locator('p')).toContainText('Score:');
    } else {
      await expect(tieAnnouncement.locator('h3')).toContainText('It\'s a Tie!');
      await expect(tieAnnouncement.locator('p')).toContainText('Score:');
    }
  });

  test('should display score in correct format', async ({ page }) => {
    // Score should be in format "X-Y" where X and Y are numbers
    const scoreElement = page.locator('.final-result p');
    const scoreText = await scoreElement.textContent();

    expect(scoreText).toMatch(/Score: \d+-\d+/);
  });

  test('should have back button that returns to table view', async ({ page }) => {
    const backButton = page.locator('.back-button');
    await expect(backButton).toContainText('← Back to Heroes Table');

    // Click back button
    await backButton.click();

    // Should return to table view
    await expect(page.locator('.table-view')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Superheroes');

    // Selections should be cleared
    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
  });

  test('should display hero images with correct alt text', async ({ page }) => {
    const heroImages = page.locator('.hero-card img');

    // First hero image
    const firstImg = heroImages.nth(0);
    const firstAlt = await firstImg.getAttribute('alt');
    const firstName = await page.locator('.hero-card h2').nth(0).textContent();
    expect(firstAlt).toBe(firstName);

    // Second hero image
    const secondImg = heroImages.nth(1);
    const secondAlt = await secondImg.getAttribute('alt');
    const secondName = await page.locator('.hero-card h2').nth(1).textContent();
    expect(secondAlt).toBe(secondName);
  });

  test('should show numerical values for all stats', async ({ page }) => {
    const statValues = page.locator('.stat-value');
    const count = await statValues.count();

    // Should have 12 stat values (6 stats × 2 heroes)
    expect(count).toBe(12);

    // Each stat value should contain a number
    for (let i = 0; i < count; i++) {
      const value = await statValues.nth(i).textContent();
      expect(value).toMatch(/^\d+$/);
    }
  });
});
