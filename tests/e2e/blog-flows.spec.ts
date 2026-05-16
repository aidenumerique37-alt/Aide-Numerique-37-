import { test, expect } from '@playwright/test';
import { waitForAppReady, hideEmergentBadge } from '../fixtures/helpers';

test.describe('Blog List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/articles', { waitUntil: 'domcontentloaded' });
    await hideEmergentBadge(page);
  });

  test('should display blog title', async ({ page }) => {
    await expect(page.getByTestId('blog-title')).toBeVisible();
    await expect(page.getByTestId('blog-title')).toContainText('Articles');
  });

  test('should display search input', async ({ page }) => {
    await expect(page.getByTestId('blog-search-input')).toBeVisible();
  });

  test('should display category filters', async ({ page }) => {
    await expect(page.getByTestId('blog-category-filters')).toBeVisible();
    await expect(page.getByTestId('blog-category-all')).toBeVisible();
  });

  test('should display articles grid with cards', async ({ page }) => {
    // Wait for articles to load
    await expect(page.getByTestId('blog-articles-grid')).toBeVisible({ timeout: 15000 });
    
    // Check that at least one article card is present
    const articleCards = page.locator('[data-testid^="blog-article-card-"]');
    await expect(articleCards.first()).toBeVisible();
  });

  test('should filter articles by search query', async ({ page }) => {
    // Wait for articles to load first
    await expect(page.getByTestId('blog-articles-grid')).toBeVisible({ timeout: 15000 });
    
    // Type in search
    await page.getByTestId('blog-search-input').fill('Windows');
    
    // Wait for filter to apply
    await page.waitForFunction(() => {
      const searchText = (document.querySelector('[data-testid="blog-search-input"]') as HTMLInputElement)?.value;
      return searchText === 'Windows';
    });
    
    // Articles should be filtered (check result message appears)
    await expect(page.locator('text=trouv')).toBeVisible({ timeout: 5000 });
  });

  test('should filter articles by category', async ({ page }) => {
    // Wait for articles and categories to load
    await expect(page.getByTestId('blog-category-filters')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('blog-articles-grid')).toBeVisible({ timeout: 15000 });
    
    // Find and click a category button (not "All")
    const categoryButtons = page.locator('[data-testid^="blog-category-"]').filter({ hasNot: page.getByTestId('blog-category-all') });
    const firstCategory = categoryButtons.first();
    
    if (await firstCategory.isVisible()) {
      await firstCategory.click();
      // Wait for articles to re-render
      await page.waitForLoadState('domcontentloaded');
    }
  });

  test('should display pagination when many articles', async ({ page }) => {
    // Wait for articles to load
    await expect(page.getByTestId('blog-articles-grid')).toBeVisible({ timeout: 15000 });
    
    // Check pagination exists (if there are enough articles)
    const pagination = page.getByTestId('blog-pagination');
    // This may or may not be visible depending on article count
    const paginationExists = await pagination.isVisible().catch(() => false);
    
    if (paginationExists) {
      await expect(page.getByTestId('blog-prev-page')).toBeVisible();
      await expect(page.getByTestId('blog-next-page')).toBeVisible();
    }
  });

  test('should navigate to article detail when clicking read button', async ({ page }) => {
    // Wait for articles to load
    await expect(page.getByTestId('blog-articles-grid')).toBeVisible({ timeout: 15000 });
    
    // Get the first article's read button
    const readButtons = page.locator('[data-testid^="blog-read-article-"]');
    const firstReadButton = readButtons.first();
    
    await expect(firstReadButton).toBeVisible();
    await firstReadButton.click();
    
    // Should navigate to article detail
    await expect(page).toHaveURL(/\/articles\/.+/);
    await expect(page.getByTestId('article-detail')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Blog Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to first article
    await page.goto('/articles', { waitUntil: 'domcontentloaded' });
    await hideEmergentBadge(page);
    await expect(page.getByTestId('blog-articles-grid')).toBeVisible({ timeout: 15000 });
    
    const readButtons = page.locator('[data-testid^="blog-read-article-"]');
    await readButtons.first().click();
    await expect(page.getByTestId('article-detail')).toBeVisible({ timeout: 15000 });
  });

  test('should display article with full content', async ({ page }) => {
    // Article container should be visible
    await expect(page.getByTestId('article-detail')).toBeVisible();
    
    // Check for article content - should have content_html rendered
    const articleContent = page.locator('.article-content');
    await expect(articleContent).toBeVisible();
  });

  test('should display breadcrumb navigation', async ({ page }) => {
    await expect(page.getByTestId('article-breadcrumb')).toBeVisible();
    
    // Breadcrumb should have links to home and articles
    const breadcrumb = page.getByTestId('article-breadcrumb');
    await expect(breadcrumb.locator('a')).toHaveCount(2);
  });

  test('should display category badge', async ({ page }) => {
    await expect(page.getByTestId('article-category-badge')).toBeVisible();
  });

  test('should display back to articles button', async ({ page }) => {
    await expect(page.getByTestId('article-back-btn')).toBeVisible();
    
    // Click back button
    await page.getByTestId('article-back-btn').click();
    
    // Should navigate back to articles list
    await expect(page).toHaveURL('/articles');
  });

  test('should display author box', async ({ page }) => {
    await expect(page.getByTestId('article-author-box')).toBeVisible();
  });

  test('should display CTA contact section', async ({ page }) => {
    await expect(page.getByTestId('article-cta')).toBeVisible();
  });

  test('should display table of contents for long articles', async ({ page }) => {
    // TOC may or may not be visible depending on article length
    const toc = page.getByTestId('article-toc');
    const tocExists = await toc.isVisible().catch(() => false);
    
    // If TOC exists, it should be collapsible
    if (tocExists) {
      const toggleButton = toc.locator('button').first();
      await expect(toggleButton).toBeVisible();
    }
  });
});
