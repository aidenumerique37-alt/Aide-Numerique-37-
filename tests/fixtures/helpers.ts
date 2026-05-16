import { Page, expect } from '@playwright/test';

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
}

export async function dismissToasts(page: Page) {
  await page.addLocatorHandler(
    page.locator('[data-sonner-toast], .Toastify__toast, [role="status"].toast, .MuiSnackbar-root'),
    async () => {
      const close = page.locator('[data-sonner-toast] [data-close], [data-sonner-toast] button[aria-label="Close"], .Toastify__close-button, .MuiSnackbar-root button');
      await close.first().click({ timeout: 2000 }).catch(() => {});
    },
    { times: 10, noWaitAfter: true }
  );
}

export async function checkForErrors(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const errorElements = Array.from(
      document.querySelectorAll('.error, [class*="error"], [id*="error"]')
    );
    return errorElements.map(el => el.textContent || '').filter(Boolean);
  });
}

export async function hideEmergentBadge(page: Page) {
  await page.evaluate(() => {
    const badge = document.querySelector('[class*="emergent"], [id*="emergent-badge"], a[href*="emergentagent"]');
    if (badge) (badge as HTMLElement).style.display = 'none';
  });
}

export async function navigateToBlogList(page: Page) {
  await page.goto('/articles', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('blog-title')).toBeVisible();
}

export async function navigateToBlogDetail(page: Page, slug: string) {
  await page.goto(`/articles/${slug}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('article-detail')).toBeVisible();
}

export async function loginToAdmin(page: Page, password: string = 'admin37') {
  await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page.locator('header')).toContainText('Administration');
}
