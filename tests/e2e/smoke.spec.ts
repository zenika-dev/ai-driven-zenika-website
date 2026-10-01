import { expect, test } from '@playwright/test';
import { ctaPage, navPages, pages } from '../../src/i18n/routes';
import { defaultLocale, locales, pageUrl, routes } from '../helpers/routes';

for (const { locale, url } of routes) {
  test(`${url} loads`, async ({ page }) => {
    const response = await page.goto(url);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1')).toHaveCount(1);
  });
}

test('/ redirects to the default locale', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(`/${defaultLocale}/`);
});

for (const locale of locales) {
  test(`contact page in ${locale} links to the Zenika mailbox`, async ({ page }) => {
    await page.goto(pageUrl(locale, 'contact'));
    await expect(page.locator('main a[href^="mailto:"]').first()).toHaveAttribute(
      'href',
      'mailto:info@zenika.com',
    );
  });

  test(`pages outside the nav and CTA are hidden from the header in ${locale}`, async ({
    page,
  }) => {
    await page.goto(pageUrl(locale, 'index'));
    const linked: readonly string[] = [...navPages, ctaPage];
    for (const hidden of pages.filter((p) => !linked.includes(p))) {
      await expect(page.locator(`header a[href="${pageUrl(locale, hidden)}"]`)).toHaveCount(0);
    }
  });
}
