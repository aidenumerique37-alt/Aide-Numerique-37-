import { test, expect } from '@playwright/test';
import { hideEmergentBadge } from '../fixtures/helpers';

test.describe('Service Detail Pages', () => {
  test.beforeEach(async ({ page }) => {
    await hideEmergentBadge(page);
  });

  test('should display service detail page for assistance-informatique', async ({ page }) => {
    await page.goto('/services/assistance-informatique', { waitUntil: 'domcontentloaded' });
    
    // Check title
    await expect(page.getByTestId('service-detail-title')).toBeVisible();
    await expect(page.getByTestId('service-detail-title')).toHaveText('Assistance Informatique');
    
    // Check breadcrumb
    await expect(page.getByTestId('service-breadcrumb')).toBeVisible();
    await expect(page.getByTestId('service-breadcrumb')).toContainText('Accueil');
    await expect(page.getByTestId('service-breadcrumb')).toContainText('Assistance Informatique');
    
    // Check detailed description section
    await expect(page.getByTestId('service-detail-description')).toBeVisible();
    
    // Check features list
    await expect(page.getByTestId('service-features-list')).toBeVisible();
    const features = page.getByTestId('service-features-list').locator('li');
    await expect(features).toHaveCount(6); // 6 features for this service
    
    // Check CTA button
    await expect(page.getByTestId('service-cta-contact')).toBeVisible();
    await expect(page.getByTestId('service-cta-contact')).toContainText('Me Contacter');
  });

  test('should display sidebar with other services', async ({ page }) => {
    await page.goto('/services/assistance-informatique', { waitUntil: 'domcontentloaded' });
    
    // Check other services list in sidebar
    await expect(page.getByTestId('other-services-list')).toBeVisible();
    
    // Should show 4 other services (not the current one)
    const otherServices = page.getByTestId('other-services-list').locator('li');
    await expect(otherServices).toHaveCount(4);
  });

  test('should navigate between service pages via sidebar', async ({ page }) => {
    await page.goto('/services/assistance-informatique', { waitUntil: 'domcontentloaded' });
    
    // Click on "Formation Numerique" in sidebar
    await page.getByTestId('other-services-list').getByRole('link', { name: /Formation/i }).click();
    
    // Should navigate to formation page
    await expect(page).toHaveURL(/\/services\/formation-numerique/);
    await expect(page.getByTestId('service-detail-title')).toContainText('Formation');
  });

  test('should display formation-numerique service page', async ({ page }) => {
    await page.goto('/services/formation-numerique', { waitUntil: 'domcontentloaded' });
    
    await expect(page.getByTestId('service-detail-title')).toBeVisible();
    await expect(page.getByTestId('service-features-list')).toBeVisible();
    await expect(page.getByTestId('service-cta-contact')).toBeVisible();
  });

  test('should display depannage-domicile service page', async ({ page }) => {
    await page.goto('/services/depannage-domicile', { waitUntil: 'domcontentloaded' });
    
    await expect(page.getByTestId('service-detail-title')).toBeVisible();
    await expect(page.getByTestId('service-features-list')).toBeVisible();
  });

  test('should display creation-site-web-ia with Nouveau badge', async ({ page }) => {
    await page.goto('/services/creation-site-web-ia', { waitUntil: 'domcontentloaded' });
    
    await expect(page.getByTestId('service-detail-title')).toBeVisible();
    await expect(page.getByTestId('service-detail-title')).toContainText('Site Web');
    
    // This service should have "Nouveau" badge
    await expect(page.getByText('Nouveau')).toBeVisible();
  });

  test('should show credit impot information in sidebar', async ({ page }) => {
    await page.goto('/services/assistance-informatique', { waitUntil: 'domcontentloaded' });
    
    // Check for credit d'impot information
    await expect(page.getByText("-50%")).toBeVisible();
    await expect(page.getByRole('heading', { name: "Credit d'impot" })).toBeVisible();
  });

  test('should handle invalid service slug gracefully', async ({ page }) => {
    await page.goto('/services/invalid-service-slug', { waitUntil: 'domcontentloaded' });
    
    // Should show error message or redirect
    await expect(page.getByText(/Service non trouve|non trouvé/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Retour/i })).toBeVisible();
  });
});

test.describe('Homepage Service Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await hideEmergentBadge(page);
  });

  test('service cards should have En savoir plus links', async ({ page }) => {
    // Scroll to services section
    await page.locator('#services').scrollIntoViewIfNeeded();
    
    // Check that service links exist - using the test IDs from Services.jsx
    await expect(page.getByTestId('service-link-1')).toBeVisible();
    await expect(page.getByTestId('service-link-1')).toContainText('En savoir plus');
  });

  test('clicking En savoir plus navigates to service detail', async ({ page }) => {
    // Scroll to services section
    await page.locator('#services').scrollIntoViewIfNeeded();
    
    // Click on first service's "En savoir plus" link
    await page.getByTestId('service-link-1').click();
    
    // Should navigate to service detail page
    await expect(page).toHaveURL(/\/services\//);
    await expect(page.getByTestId('service-detail-title')).toBeVisible();
  });

  test('all service cards should have En savoir plus links', async ({ page }) => {
    // Scroll to services section
    await page.locator('#services').scrollIntoViewIfNeeded();
    
    // Check all 5 service links
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByTestId(`service-link-${i}`)).toBeVisible();
    }
  });
});
