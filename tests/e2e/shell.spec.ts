import { expect, test } from '@playwright/test';
import { navPages } from '../../src/i18n/routes';
import { locales, pageUrl } from '../helpers/routes';

const [firstLocale = 'en', otherLocale = firstLocale] = locales;

test('skip link is the first focusable element and moves focus to main', async ({
  page,
  browserName,
}) => {
  await page.goto(pageUrl(firstLocale, 'contact'));
  // Safari only tabs to links with Option+Tab by default.
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  const skipLink = page.locator('a[href="#main"]');
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('main#main')).toBeFocused();
});

test('main nav lists only the nav pages and marks the current one', async ({ page }) => {
  await page.goto(pageUrl(firstLocale, 'contact'));
  const links = page.locator('header nav').first().getByRole('link');
  await expect(links).toHaveCount(navPages.length);
  for (const [i, navPage] of navPages.entries()) {
    await expect(links.nth(i)).toHaveAttribute('href', pageUrl(firstLocale, navPage));
  }
  await expect(page.locator('header a[aria-current="page"]')).toHaveAttribute(
    'href',
    pageUrl(firstLocale, 'contact'),
  );
});

test('language switcher links to the same page in every locale', async ({ page }) => {
  await page.goto(pageUrl(firstLocale, 'contact'));
  for (const locale of locales) {
    const link = page.locator(`header a[hreflang="${locale}"]`);
    await expect(link).toHaveAttribute('href', pageUrl(locale, 'contact'));
    await expect(link).toHaveAttribute('lang', locale);
  }
  await page.locator(`header a[hreflang="${otherLocale}"]`).click();
  await expect(page).toHaveURL(pageUrl(otherLocale, 'contact'));
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('navigation works and the page does not scroll sideways', async ({ page }) => {
    await page.goto(pageUrl(firstLocale, 'index'));
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    for (const link of await page.locator('header a').all()) {
      await expect(link).toBeVisible();
      await expect(link).toBeInViewport();
    }

    await page.locator(`header nav a[href="${pageUrl(firstLocale, 'contact')}"]`).click();
    await expect(page).toHaveURL(pageUrl(firstLocale, 'contact'));
  });
});
