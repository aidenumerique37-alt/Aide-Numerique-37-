import { test, expect } from '@playwright/test';

test.describe('City Pages - Lot 3', () => {
  
  test.beforeEach(async ({ page }) => {
    // Dismiss any toasts that might appear
    await page.addLocatorHandler(
      page.locator('[data-sonner-toast], .Toastify__toast'),
      async () => {
        const close = page.locator('[data-sonner-toast] button[aria-label="Close"], .Toastify__close-button');
        await close.first().click({ timeout: 2000 }).catch(() => {});
      },
      { times: 5, noWaitAfter: true }
    );
  });

  test('Joue-les-Tours city page renders with all required elements', async ({ page }) => {
    await page.goto('/intervention/joue-les-tours', { waitUntil: 'domcontentloaded' });
    
    // Verify page title
    const title = page.getByTestId('city-page-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('Joue-les-Tours');
    
    // Verify breadcrumb
    const breadcrumb = page.getByTestId('city-breadcrumb');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('Accueil');
    
    // Verify phone CTA button
    const phoneCta = page.getByTestId('city-cta-phone');
    await expect(phoneCta).toBeVisible();
    await expect(phoneCta).toContainText('07 61 50 35 85');
    
    // Verify problems list
    const problemsList = page.getByTestId('city-problems-list');
    await expect(problemsList).toBeVisible();
    const problemItems = problemsList.locator('li');
    await expect(problemItems).toHaveCount(8);
    
    // Verify services grid
    const servicesGrid = page.getByTestId('city-services-grid');
    await expect(servicesGrid).toBeVisible();
    const serviceCards = servicesGrid.locator('a');
    expect(await serviceCards.count()).toBeGreaterThanOrEqual(1);
    
    // Verify quartiers section
    const quartiers = page.getByTestId('city-quartiers');
    await expect(quartiers).toBeVisible();
    await expect(quartiers).toContainText('Centre-ville');
    
    // Verify map iframe
    const map = page.getByTestId('city-map');
    await expect(map).toBeVisible();
  });

  test('Chambray-les-Tours city page renders correctly', async ({ page }) => {
    await page.goto('/intervention/chambray-les-tours', { waitUntil: 'domcontentloaded' });
    
    // Verify title shows Chambray-les-Tours
    const title = page.getByTestId('city-page-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('Chambray-les-Tours');
    
    // Verify postal code is displayed (37170)
    await expect(page.getByText('37170')).toBeVisible();
    
    // Verify problems list exists
    const problemsList = page.getByTestId('city-problems-list');
    await expect(problemsList).toBeVisible();
    
    // Verify quartiers section
    const quartiers = page.getByTestId('city-quartiers');
    await expect(quartiers).toBeVisible();
    await expect(quartiers).toContainText('Centre-bourg');
  });

  test('Tours city page renders correctly', async ({ page }) => {
    await page.goto('/intervention/tours', { waitUntil: 'domcontentloaded' });
    
    // Verify title shows Tours
    const title = page.getByTestId('city-page-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('Tours');
    
    // Verify postal codes are displayed (37000 / 37100 / 37200)
    await expect(page.getByText(/37000/)).toBeVisible();
    
    // Verify problems list exists
    const problemsList = page.getByTestId('city-problems-list');
    await expect(problemsList).toBeVisible();
    
    // Verify quartiers section
    const quartiers = page.getByTestId('city-quartiers');
    await expect(quartiers).toBeVisible();
  });

  test('City page has Schema.org LocalBusiness JSON-LD', async ({ page }) => {
    await page.goto('/intervention/joue-les-tours', { waitUntil: 'domcontentloaded' });
    
    // Wait for page to fully render
    await page.waitForLoadState('networkidle');
    
    // Check for JSON-LD script tag with LocalBusiness schema
    const jsonLdScript = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const content = script.textContent || script.innerHTML || '';
          if (content.includes('LocalBusiness')) {
            const data = JSON.parse(content);
            if (data['@type'] === 'LocalBusiness') {
              return data;
            }
          }
        } catch (e) {
          console.log('Parse error:', e);
        }
      }
      return null;
    });
    
    expect(jsonLdScript).not.toBeNull();
    expect(jsonLdScript['@context']).toBe('https://schema.org');
    expect(jsonLdScript['@type']).toBe('LocalBusiness');
    expect(jsonLdScript['name']).toBe('Aide Numerique 37');
    expect(jsonLdScript['telephone']).toContain('761503585');
    expect(jsonLdScript['address']['addressLocality']).toBe('Joue-les-Tours');
  });

  test('Invalid city slug shows error page', async ({ page }) => {
    await page.goto('/intervention/invalid-city-slug', { waitUntil: 'domcontentloaded' });
    
    // Should show "Page non trouvee" message
    await expect(page.getByText('Page non trouvee')).toBeVisible();
    
    // Should have link back to homepage
    await expect(page.getByText("Retour a l'accueil")).toBeVisible();
  });

  test('City page service links navigate to service detail pages', async ({ page }) => {
    await page.goto('/intervention/joue-les-tours', { waitUntil: 'domcontentloaded' });
    
    // Get the services grid
    const servicesGrid = page.getByTestId('city-services-grid');
    await expect(servicesGrid).toBeVisible();
    
    // Click first service link
    const firstServiceLink = servicesGrid.locator('a').first();
    const serviceHref = await firstServiceLink.getAttribute('href');
    expect(serviceHref).toContain('/services/');
    
    await firstServiceLink.click();
    
    // Should navigate to service page
    await expect(page).toHaveURL(/\/services\//);
  });

  test('Breadcrumb navigation works on city page', async ({ page }) => {
    await page.goto('/intervention/joue-les-tours', { waitUntil: 'domcontentloaded' });
    
    // Click on Accueil link in breadcrumb
    const breadcrumb = page.getByTestId('city-breadcrumb');
    const homeLink = breadcrumb.getByRole('link', { name: 'Accueil' });
    await expect(homeLink).toBeVisible();
    
    await homeLink.click();
    
    // Should navigate to homepage
    await expect(page).toHaveURL('/');
  });
});

test.describe('Zone d\'Intervention City Links', () => {
  test('Homepage zone d\'intervention has links to city pages', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Scroll to services section where zone intervention is
    await page.locator('#services').scrollIntoViewIfNeeded();
    
    // Find city page links container
    const cityLinksContainer = page.getByTestId('city-page-links');
    await expect(cityLinksContainer).toBeVisible();
    
    // Verify all 3 city links are present using exact match
    await expect(cityLinksContainer.getByRole('link', { name: 'Joue-les-Tours', exact: true })).toBeVisible();
    await expect(cityLinksContainer.getByRole('link', { name: 'Chambray-les-Tours', exact: true })).toBeVisible();
    await expect(cityLinksContainer.getByRole('link', { name: 'Tours', exact: true })).toBeVisible();
  });

  test('City page link navigates correctly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Scroll to services section
    await page.locator('#services').scrollIntoViewIfNeeded();
    
    // Click on Joue-les-Tours link
    const cityLinksContainer = page.getByTestId('city-page-links');
    await cityLinksContainer.getByRole('link', { name: 'Joue-les-Tours' }).click();
    
    // Should navigate to city page
    await expect(page).toHaveURL('/intervention/joue-les-tours');
    await expect(page.getByTestId('city-page-title')).toContainText('Joue-les-Tours');
  });
});

test.describe('URSSAF FAQ Schema.org - Lot 4', () => {
  test('URSSAF section has FAQPage Schema.org JSON-LD', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Scroll to URSSAF section
    await page.locator('#urssaf').scrollIntoViewIfNeeded();
    
    // Check for JSON-LD script tag with FAQPage schema
    const jsonLdScript = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent || '');
          if (data['@type'] === 'FAQPage') {
            return data;
          }
        } catch (e) {}
      }
      return null;
    });
    
    expect(jsonLdScript).not.toBeNull();
    expect(jsonLdScript['@context']).toBe('https://schema.org');
    expect(jsonLdScript['@type']).toBe('FAQPage');
    expect(jsonLdScript['mainEntity']).toBeDefined();
    expect(Array.isArray(jsonLdScript['mainEntity'])).toBe(true);
    expect(jsonLdScript['mainEntity'].length).toBeGreaterThanOrEqual(5);
    
    // Verify FAQ item structure
    const firstFaq = jsonLdScript['mainEntity'][0];
    expect(firstFaq['@type']).toBe('Question');
    expect(firstFaq['name']).toBeDefined();
    expect(firstFaq['acceptedAnswer']['@type']).toBe('Answer');
    expect(firstFaq['acceptedAnswer']['text']).toBeDefined();
  });

  test('URSSAF section displays FAQ accordion', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Scroll to URSSAF section
    const urssafSection = page.locator('#urssaf');
    await urssafSection.scrollIntoViewIfNeeded();
    
    // Verify section title
    await expect(urssafSection.getByText('Payez Seulement 50% du Prix')).toBeVisible();
    
    // Verify FAQ accordion is present with heading
    await expect(urssafSection.getByRole('heading', { name: 'Questions' })).toBeVisible();
    
    // Verify first FAQ question button is visible
    await expect(urssafSection.getByRole('button', { name: /Service à la Personne/ }).first()).toBeVisible();
  });
});
