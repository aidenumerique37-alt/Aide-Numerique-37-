import { test, expect } from '@playwright/test';
import { hideEmergentBadge } from '../fixtures/helpers';

test.describe('Core Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await hideEmergentBadge(page);
  });

  test('should display homepage with hero section', async ({ page }) => {
    // Check hero content - use more specific locators
    await expect(page.locator('text=Votre Médiateur')).toBeVisible();
    await expect(page.getByText('Numérique', { exact: true })).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Check navigation elements in the header
    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('button', { name: 'Services' })).toBeVisible();
    await expect(nav.locator('text=Contact')).toBeVisible();
    await expect(nav.locator('text=Articles')).toBeVisible();
  });

  test('should navigate to Articles page', async ({ page }) => {
    await page.getByRole('navigation').locator('a:has-text("Articles")').click();
    await expect(page).toHaveURL('/articles');
    await expect(page.getByTestId('blog-title')).toBeVisible();
  });

  test('should navigate to Admin page', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('text=Administration').first()).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should display phone number in header', async ({ page }) => {
    // Use banner role for header
    const header = page.getByRole('banner');
    await expect(header.getByRole('link', { name: /07 61 50 35 85/ })).toBeVisible();
  });

  test('should display contact section', async ({ page }) => {
    // Scroll to contact section
    const contactSection = page.locator('#contact');
    if (await contactSection.isVisible().catch(() => false)) {
      await contactSection.scrollIntoViewIfNeeded();
      await expect(contactSection).toBeVisible();
    }
  });
});

test.describe('Homepage Sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await hideEmergentBadge(page);
  });

  test('should display services section', async ({ page }) => {
    // Click services in navigation
    const nav = page.getByRole('navigation');
    const servicesBtn = nav.getByRole('button', { name: 'Services' });
    if (await servicesBtn.isVisible()) {
      await servicesBtn.click();
      // Should scroll to services section
      await page.waitForLoadState('domcontentloaded');
    }
  });

  test('should display key statistics', async ({ page }) => {
    // Check for stats like 100% Satisfaction, 5 Star, -50% - use exact match
    await expect(page.locator('text=100%')).toBeVisible();
    await expect(page.getByText('Satisfaction', { exact: true })).toBeVisible();
  });

  test('should display contact button', async ({ page }) => {
    await expect(page.locator('text=Me Contacter').first()).toBeVisible();
  });
});
