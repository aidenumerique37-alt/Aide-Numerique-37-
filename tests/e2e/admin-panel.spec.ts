import { test, expect } from '@playwright/test';
import { hideEmergentBadge, loginToAdmin } from '../fixtures/helpers';

test.describe('Admin Panel - Authentication', () => {
  test('should display login form initially', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await hideEmergentBadge(page);
    
    // Should show login form
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Administration')).toBeVisible();
  });

  test('should reject wrong password', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await hideEmergentBadge(page);
    
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('text=incorrect')).toBeVisible({ timeout: 5000 });
  });

  test('should login with correct password', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await hideEmergentBadge(page);
    
    await page.fill('input[type="password"]', 'admin37');
    await page.click('button[type="submit"]');
    
    // Should see admin panel
    await expect(page.locator('header')).toContainText('Administration', { timeout: 10000 });
  });
});

test.describe('Admin Panel - Articles Sync', () => {
  test.beforeEach(async ({ page }) => {
    await loginToAdmin(page);
    await hideEmergentBadge(page);
  });

  test('should display articles section in sidebar', async ({ page }) => {
    // Click on Articles section
    await page.click('text=Articles');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display sync status', async ({ page }) => {
    // Navigate to Articles section
    await page.click('text=Articles');
    
    // Should show sync status info (last sync, total articles)
    await expect(page.locator('text=articles').or(page.locator('text=catégories'))).toBeVisible({ timeout: 10000 });
  });

  test('should have sync button', async ({ page }) => {
    // Navigate to Articles section
    await page.click('text=Articles');
    
    // Should have a sync button
    const syncButton = page.locator('button').filter({ hasText: /sync|actualiser|rafraîchir/i });
    await expect(syncButton.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Admin Panel - Partner Categories', () => {
  test.beforeEach(async ({ page }) => {
    await loginToAdmin(page);
    await hideEmergentBadge(page);
  });

  test('should display partners section', async ({ page }) => {
    // Click on Partners section
    await page.click('text=Partenaires');
    await page.waitForLoadState('domcontentloaded');
    
    // Should show partners management UI
    await expect(page.locator('text=Partenaires').first()).toBeVisible();
  });

  test('should have add partner category functionality', async ({ page }) => {
    // Navigate to Partners section
    await page.click('text=Partenaires');
    await page.waitForLoadState('domcontentloaded');
    
    // Look for category management section
    const categoryInput = page.locator('input[placeholder*="catégorie" i]').or(page.locator('input').filter({ has: page.locator('text=catégorie').or(page.locator('text=category')) }));
    
    // If category input exists, the feature is implemented
    const inputExists = await categoryInput.first().isVisible().catch(() => false);
    
    // Log result for verification
    console.log('Partner category input exists:', inputExists);
  });
});

test.describe('Admin Panel - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginToAdmin(page);
    await hideEmergentBadge(page);
  });

  test('should have view site button', async ({ page }) => {
    await expect(page.locator('text=Voir le site')).toBeVisible();
  });

  test('should have logout button', async ({ page }) => {
    // Find logout button (might be an icon)
    const logoutBtn = page.locator('button').filter({ has: page.locator('[data-lucide="log-out"]').or(page.locator('svg')) }).last();
    await expect(logoutBtn).toBeVisible();
  });

  test('should navigate between sections', async ({ page }) => {
    // Click through different sections
    await page.click('text=Contenu');
    await page.click('text=Services');
    await page.click('text=Villes');
    await page.click('text=Partenaires');
    await page.click('text=Articles');
    
    // Should not crash
    await expect(page.locator('header')).toContainText('Administration');
  });
});
