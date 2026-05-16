import { test, expect } from '@playwright/test';

const BASE_URL = 'https://french-it-services.preview.emergentagent.com';

// Viewport widths to test (header now uses universal hamburger on ALL sizes)
const MOBILE_WIDTH = 375;
const TABLET_WIDTH = 900;
const DESKTOP_WIDTH = 1920;

// Phone visibility breakpoint (sm = 640px)
const PHONE_BREAKPOINT = 640;

// Pages to test header consistency
const PAGES = ['/', '/a-propos', '/articles', '/mentions-legales'];

test.describe('P1 Header - Universal Hamburger Menu on All Screen Sizes', () => {

  test.beforeEach(async ({ page }) => {
    // Hide emergent badge that may block interactions
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        const badge = document.querySelector('[class*="emergent"], [id*="emergent-badge"], a[href*="emergentagent"]');
        if (badge) (badge as HTMLElement).style.display = 'none';
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  });

  test.describe('Mobile viewport (375px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: MOBILE_WIDTH, height: 720 });
    });

    test('should show hamburger menu and theme toggle, phone hidden', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Header controls should be visible
      await expect(page.getByTestId('header-controls')).toBeVisible();
      await expect(page.getByTestId('hamburger-menu-button')).toBeVisible();
      await expect(page.getByTestId('theme-toggle')).toBeVisible();
      
      // Phone should be hidden on mobile (< 640px)
      await expect(page.getByTestId('header-phone-link')).not.toBeVisible();
      
      // Nav menu should be closed initially
      await expect(page.getByTestId('nav-menu')).not.toBeVisible();
    });

    test('hamburger menu opens and shows all navigation links', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Menu should be closed initially
      await expect(page.getByTestId('nav-menu')).not.toBeVisible();
      
      // Click hamburger to open menu
      await page.getByTestId('hamburger-menu-button').click();
      
      // Menu should be visible
      await expect(page.getByTestId('nav-menu')).toBeVisible();
      
      // Check all navigation links are present
      const navMenu = page.getByTestId('nav-menu');
      await expect(navMenu.getByText('Services')).toBeVisible();
      await expect(navMenu.getByText('Avantages Fiscaux')).toBeVisible();
      await expect(navMenu.getByText('Avis Clients')).toBeVisible();
      await expect(navMenu.getByText('Contact')).toBeVisible();
      await expect(navMenu.getByText('A propos')).toBeVisible();
      await expect(navMenu.getByText('Articles')).toBeVisible();
      
      // Phone number should be in menu (for mobile users)
      await expect(navMenu.getByText('07 61 50 35 85')).toBeVisible();
    });
  });

  test.describe('Tablet viewport (900px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: TABLET_WIDTH, height: 600 });
    });

    test('should show hamburger menu, theme toggle, and phone number', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Header controls should be visible
      await expect(page.getByTestId('header-controls')).toBeVisible();
      await expect(page.getByTestId('hamburger-menu-button')).toBeVisible();
      await expect(page.getByTestId('theme-toggle')).toBeVisible();
      
      // Phone should be visible (>= 640px)
      await expect(page.getByTestId('header-phone-link')).toBeVisible();
      
      // Nav menu should be closed initially
      await expect(page.getByTestId('nav-menu')).not.toBeVisible();
    });

    test('hamburger menu opens at 900px width', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Click hamburger to open menu
      await page.getByTestId('hamburger-menu-button').click();
      
      // Menu should be visible
      await expect(page.getByTestId('nav-menu')).toBeVisible();
      
      // Check navigation links are present
      const navMenu = page.getByTestId('nav-menu');
      await expect(navMenu.getByText('Services')).toBeVisible();
      await expect(navMenu.getByText('A propos')).toBeVisible();
      await expect(navMenu.getByText('Articles')).toBeVisible();
    });
  });

  test.describe('Desktop viewport (1920px)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: DESKTOP_WIDTH, height: 720 });
    });

    test('should show hamburger menu, theme toggle, and phone number on desktop', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Header controls should be visible (hamburger is now universal!)
      await expect(page.getByTestId('header-controls')).toBeVisible();
      await expect(page.getByTestId('hamburger-menu-button')).toBeVisible();
      await expect(page.getByTestId('theme-toggle')).toBeVisible();
      
      // Phone should be visible on desktop
      await expect(page.getByTestId('header-phone-link')).toBeVisible();
      
      // Nav menu should be closed initially
      await expect(page.getByTestId('nav-menu')).not.toBeVisible();
    });

    test('hamburger menu opens on desktop (universal menu)', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Click hamburger to open menu
      await page.getByTestId('hamburger-menu-button').click();
      
      // Menu should be visible
      await expect(page.getByTestId('nav-menu')).toBeVisible();
      
      // Check all navigation links
      const navMenu = page.getByTestId('nav-menu');
      await expect(navMenu.getByText('Services')).toBeVisible();
      await expect(navMenu.getByText('Avantages Fiscaux')).toBeVisible();
      await expect(navMenu.getByText('Avis Clients')).toBeVisible();
      await expect(navMenu.getByText('Contact')).toBeVisible();
      await expect(navMenu.getByText('A propos')).toBeVisible();
      await expect(navMenu.getByText('Articles')).toBeVisible();
    });
  });
});

test.describe('Theme Toggle Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        const badge = document.querySelector('[class*="emergent"], [id*="emergent-badge"], a[href*="emergentagent"]');
        if (badge) (badge as HTMLElement).style.display = 'none';
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  });

  test('theme toggle switches between light and dark mode', async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_WIDTH, height: 720 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Get initial body class state
    const initialIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    
    // Click theme toggle
    await page.getByTestId('theme-toggle').click();
    
    // Wait for theme transition
    await page.waitForFunction(
      (wasDark) => document.documentElement.classList.contains('dark') !== wasDark,
      initialIsDark
    );
    
    // Verify theme changed
    const afterToggleIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(afterToggleIsDark).not.toBe(initialIsDark);
    
    // Toggle back
    await page.getByTestId('theme-toggle').click();
    
    await page.waitForFunction(
      (wasDark) => document.documentElement.classList.contains('dark') === wasDark,
      initialIsDark
    );
    
    // Verify returned to original
    const afterSecondToggle = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(afterSecondToggle).toBe(initialIsDark);
  });

  test('theme toggle is visible at all viewport sizes (single toggle)', async ({ page }) => {
    const viewports = [
      { width: MOBILE_WIDTH, height: 720 },
      { width: TABLET_WIDTH, height: 600 },
      { width: DESKTOP_WIDTH, height: 720 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      // Single theme toggle should be visible at all viewports
      const toggle = page.getByTestId('theme-toggle');
      await expect(toggle).toBeVisible();
      
      // Verify it has the correct aria-label
      const ariaLabel = await toggle.getAttribute('aria-label');
      expect(ariaLabel).toMatch(/Mode (clair|sombre)/);
    }
  });
});

test.describe('Header Consistency Across Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        const badge = document.querySelector('[class*="emergent"], [id*="emergent-badge"], a[href*="emergentagent"]');
        if (badge) (badge as HTMLElement).style.display = 'none';
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  });

  for (const pagePath of PAGES) {
    test(`header shows hamburger menu on ${pagePath} at all sizes`, async ({ page }) => {
      // Test at multiple viewports - hamburger should always be visible
      const viewports = [
        { width: MOBILE_WIDTH, height: 720 },
        { width: TABLET_WIDTH, height: 600 },
        { width: DESKTOP_WIDTH, height: 720 },
      ];

      for (const vp of viewports) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
        
        // Hamburger should be visible at all sizes (universal)
        await expect(page.getByTestId('hamburger-menu-button')).toBeVisible();
        await expect(page.getByTestId('theme-toggle')).toBeVisible();
        await expect(page.getByTestId('header-controls')).toBeVisible();
      }
    });
  }
});

test.describe('Phone Number Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        const badge = document.querySelector('[class*="emergent"], [id*="emergent-badge"], a[href*="emergentagent"]');
        if (badge) (badge as HTMLElement).style.display = 'none';
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  });

  test('phone number hidden below 640px, visible at 640px+', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Below 640px - phone should be hidden
    await page.setViewportSize({ width: 375, height: 720 });
    await expect(page.getByTestId('header-phone-link')).not.toBeVisible();
    
    // At 640px (sm breakpoint) - phone should be visible
    await page.setViewportSize({ width: 640, height: 720 });
    await expect(page.getByTestId('header-phone-link')).toBeVisible();
    
    // At larger sizes - phone should still be visible
    await page.setViewportSize({ width: 900, height: 720 });
    await expect(page.getByTestId('header-phone-link')).toBeVisible();
  });
});

test.describe('Hamburger Menu Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_WIDTH, height: 720 });
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        const badge = document.querySelector('[class*="emergent"], [id*="emergent-badge"], a[href*="emergentagent"]');
        if (badge) (badge as HTMLElement).style.display = 'none';
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  });

  test('hamburger menu toggles open and closed', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Initially closed
    await expect(page.getByTestId('nav-menu')).not.toBeVisible();
    
    // Open menu
    await page.getByTestId('hamburger-menu-button').click();
    await expect(page.getByTestId('nav-menu')).toBeVisible();
    
    // Close menu
    await page.getByTestId('hamburger-menu-button').click();
    await expect(page.getByTestId('nav-menu')).not.toBeVisible();
  });

  test('nav menu contains all expected navigation links', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    await page.getByTestId('hamburger-menu-button').click();
    await expect(page.getByTestId('nav-menu')).toBeVisible();
    
    const menu = page.getByTestId('nav-menu');
    
    // Verify all navigation links
    const expectedLinks = [
      'Services',
      'Avantages Fiscaux',
      'Avis Clients',
      'Contact',
      'A propos',
      'Articles'
    ];
    
    for (const linkText of expectedLinks) {
      await expect(menu.getByText(linkText)).toBeVisible();
    }
    
    // Verify phone number in menu
    await expect(menu.getByText('07 61 50 35 85')).toBeVisible();
  });

  test('clicking page link in nav menu closes the menu', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    await page.getByTestId('hamburger-menu-button').click();
    await expect(page.getByTestId('nav-menu')).toBeVisible();
    
    // Click A propos link
    await page.getByTestId('nav-menu').getByText('A propos').click();
    
    // Wait for navigation
    await page.waitForURL('**/a-propos');
    
    // Menu should be closed after navigation
    await expect(page.getByTestId('nav-menu')).not.toBeVisible();
  });

  test('logo click navigates to homepage and closes menu', async ({ page }) => {
    // Start on a different page
    await page.goto('/a-propos', { waitUntil: 'domcontentloaded' });
    
    // Open menu
    await page.getByTestId('hamburger-menu-button').click();
    await expect(page.getByTestId('nav-menu')).toBeVisible();
    
    // Click logo
    await page.getByTestId('header-logo-link').click();
    
    // Should navigate to homepage
    await page.waitForURL('**/');
    
    // Menu should be closed
    await expect(page.getByTestId('nav-menu')).not.toBeVisible();
  });
});
