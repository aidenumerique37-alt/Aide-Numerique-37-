import { test, expect } from '@playwright/test';
import { hideEmergentBadge } from '../fixtures/helpers';

test.describe('Mentions Legales Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mentions-legales', { waitUntil: 'domcontentloaded' });
    await hideEmergentBadge(page);
  });

  test('should display page title', async ({ page }) => {
    await expect(page.getByTestId('mentions-title')).toBeVisible();
    await expect(page.getByTestId('mentions-title')).toHaveText('Mentions Legales');
  });

  test('should display breadcrumb navigation', async ({ page }) => {
    await expect(page.getByTestId('mentions-breadcrumb')).toBeVisible();
    await expect(page.getByTestId('mentions-breadcrumb')).toContainText('Accueil');
    await expect(page.getByTestId('mentions-breadcrumb')).toContainText('Mentions Legales');
  });

  test('should display all 7 required sections', async ({ page }) => {
    // Section 1: Editeur du site
    await expect(page.getByRole('heading', { name: /1\. Editeur du site/i })).toBeVisible();
    
    // Section 2: Hebergement
    await expect(page.getByRole('heading', { name: /2\. Hebergement/i })).toBeVisible();
    
    // Section 3: Propriete intellectuelle
    await expect(page.getByRole('heading', { name: /3\. Propriete intellectuelle/i })).toBeVisible();
    
    // Section 4: Protection des donnees personnelles
    await expect(page.getByRole('heading', { name: /4\. Protection des donnees personnelles/i })).toBeVisible();
    
    // Section 5: Cookies
    await expect(page.getByRole('heading', { name: /5\. Cookies/i })).toBeVisible();
    
    // Section 6: Credit d'impot - Service a la Personne
    await expect(page.getByRole('heading', { name: /6\. Credit d'impot/i })).toBeVisible();
    
    // Section 7: Responsabilite
    await expect(page.getByRole('heading', { name: /7\. Responsabilite/i })).toBeVisible();
  });

  test('should display contact information', async ({ page }) => {
    // Check within main content area
    const main = page.getByRole('main');
    
    // Phone number
    await expect(main.getByRole('link', { name: '07 61 50 35 85' })).toBeVisible();
    
    // Email - appears twice on page, use first one
    await expect(main.getByRole('link', { name: 'pierrick@aidenumerique37.fr' }).first()).toBeVisible();
    
    // Business name in content
    await expect(main.getByText('Aide Numerique 37').first()).toBeVisible();
    
    // Owner name
    await expect(main.getByText('Pierrick Le Penru')).toBeVisible();
  });

  test('should display hosting information', async ({ page }) => {
    await expect(page.getByText('Hostinger International Ltd')).toBeVisible();
    await expect(page.getByRole('link', { name: 'www.hostinger.fr' })).toBeVisible();
  });

  test('should have return to homepage link', async ({ page }) => {
    const returnLink = page.getByRole('link', { name: /Retour a l'accueil/i });
    await expect(returnLink).toBeVisible();
    
    // Click and verify navigation
    await returnLink.click();
    await expect(page).toHaveURL('/');
  });

  test('breadcrumb link should navigate to homepage', async ({ page }) => {
    const homeLink = page.getByTestId('mentions-breadcrumb').getByRole('link', { name: 'Accueil' });
    await expect(homeLink).toBeVisible();
    
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Footer Mentions Legales Link', () => {
  test('footer should contain link to Mentions Legales', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await hideEmergentBadge(page);
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Find the link in footer
    const footer = page.locator('footer');
    const mentionsLink = footer.getByRole('link', { name: /Mentions legales/i });
    await expect(mentionsLink).toBeVisible();
  });

  test('footer link navigates to Mentions Legales page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await hideEmergentBadge(page);
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Click the link
    const footer = page.locator('footer');
    await footer.getByRole('link', { name: /Mentions legales/i }).click();
    
    // Verify navigation
    await expect(page).toHaveURL('/mentions-legales');
    await expect(page.getByTestId('mentions-title')).toBeVisible();
  });
});
