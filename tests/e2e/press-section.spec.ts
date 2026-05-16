import { test, expect } from '@playwright/test';
import { hideEmergentBadge } from '../fixtures/helpers';

test.describe('Press Section - On Parle de Moi', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await hideEmergentBadge(page);
  });

  test('should display press section on homepage', async ({ page }) => {
    // Scroll to press section
    await page.getByTestId('press-section').scrollIntoViewIfNeeded();
    
    await expect(page.getByTestId('press-section')).toBeVisible();
  });

  test('should display "On Parle de Moi" title', async ({ page }) => {
    await page.getByTestId('press-section').scrollIntoViewIfNeeded();
    
    // Check for section title
    await expect(page.getByRole('heading', { name: 'On Parle de Moi' })).toBeVisible();
    await expect(page.getByText('Aide Numerique 37 dans la presse locale')).toBeVisible();
  });

  test('should display press article link', async ({ page }) => {
    await page.getByTestId('press-section').scrollIntoViewIfNeeded();
    
    await expect(page.getByTestId('press-article-link')).toBeVisible();
  });

  test('press article link should point to La Nouvelle Republique', async ({ page }) => {
    await page.getByTestId('press-section').scrollIntoViewIfNeeded();
    
    const articleLink = page.getByTestId('press-article-link');
    await expect(articleLink).toHaveAttribute('href', /lanouvellerepublique\.fr/);
    await expect(articleLink).toHaveAttribute('target', '_blank');
    await expect(articleLink).toHaveAttribute('rel', /noopener/);
  });

  test('should display article image', async ({ page }) => {
    await page.getByTestId('press-section').scrollIntoViewIfNeeded();
    
    await expect(page.getByTestId('press-article-image')).toBeVisible();
    
    // Check image has proper alt text
    await expect(page.getByTestId('press-article-image')).toHaveAttribute('alt', /Pierrick Le Penru|Aide Numerique/i);
  });

  test('should display La Nouvelle Republique badge', async ({ page }) => {
    await page.getByTestId('press-section').scrollIntoViewIfNeeded();
    
    await expect(page.getByText('La Nouvelle Republique')).toBeVisible();
  });

  test('should display article title', async ({ page }) => {
    await page.getByTestId('press-section').scrollIntoViewIfNeeded();
    
    // Article title
    await expect(page.getByText(/Joue-les-Tours.*Pierrick Le Penru.*Aide numerique 37/i)).toBeVisible();
  });

  test('should display article excerpt', async ({ page }) => {
    await page.getByTestId('press-section').scrollIntoViewIfNeeded();
    
    // Article excerpt/description
    await expect(page.getByText(/29 ans.*franchir le pas/i)).toBeVisible();
  });

  test('should display "Lire l\'article complet" link text', async ({ page }) => {
    await page.getByTestId('press-section').scrollIntoViewIfNeeded();
    
    await expect(page.getByText("Lire l'article complet")).toBeVisible();
  });

  test('should display press locale badge', async ({ page }) => {
    await page.getByTestId('press-section').scrollIntoViewIfNeeded();
    
    await expect(page.getByText('Presse locale - Indre-et-Loire')).toBeVisible();
  });
});

test.describe('Press Section Dark Mode Support', () => {
  test('press section should be visible in dark mode', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await hideEmergentBadge(page);
    
    // Toggle dark mode via the theme button
    const themeToggle = page.getByRole('banner').locator('button').filter({ has: page.locator('svg') }).first();
    
    // Click on theme toggle if visible
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Scroll to press section
    await page.getByTestId('press-section').scrollIntoViewIfNeeded();
    
    // Press section should still be visible
    await expect(page.getByTestId('press-section')).toBeVisible();
    await expect(page.getByTestId('press-article-link')).toBeVisible();
  });
});
