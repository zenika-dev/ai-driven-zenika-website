import { expect, test } from '@playwright/test';
import { ctaPage, navPages } from '../../src/i18n/routes';
import { defaultLocale, locales, pageUrl } from '../helpers/routes';

const firstLocale = defaultLocale;
const otherLocale = locales.find((locale) => locale !== defaultLocale) ?? defaultLocale;

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

test('main nav lists only the nav pages; the CTA marks the contact page', async ({ page }) => {
  await page.goto(pageUrl(firstLocale, ctaPage));
  // The main nav is hidden below 640px (the logo links home), so count it without visibility.
  const links = page.locator('header nav.main-nav a');
  await expect(links).toHaveCount(navPages.length);
  for (const [i, navPage] of navPages.entries()) {
    await expect(links.nth(i)).toHaveAttribute('href', pageUrl(firstLocale, navPage));
  }
  await expect(page.locator('header a[aria-current="page"]')).toHaveAttribute(
    'href',
    pageUrl(firstLocale, ctaPage),
  );
});

test('icon-only theme toggle has an accessible name', async ({ page }) => {
  await page.goto(pageUrl(firstLocale, 'index'));
  await expect(page.locator('[data-theme-toggle]')).toHaveAccessibleName(/\S/);
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

    const visibleLinks = await page.locator('header a:visible').all();
    expect(visibleLinks.length).toBeGreaterThan(0);
    for (const link of visibleLinks) {
      await expect(link).toBeInViewport();
    }

    await page.locator(`header a[href="${pageUrl(firstLocale, ctaPage)}"]`).click();
    await expect(page).toHaveURL(pageUrl(firstLocale, ctaPage));
  });
});

test('logo has an accessible name and follows the theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(pageUrl(firstLocale, 'index'));
  const headerLogo = page.locator('header .brand img:visible');
  await expect(headerLogo).toHaveCount(1);
  await expect(headerLogo).toHaveAttribute('alt', /\S/);
  const lightSrc = await headerLogo.getAttribute('src');

  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('header .brand img:visible')).toHaveCount(1);
  expect(await page.locator('header .brand img:visible').getAttribute('src')).not.toBe(lightSrc);

  await expect(page.locator('footer .brand img:visible')).toHaveCount(1);
});

test('header fits on one row', async ({ page }) => {
  await page.goto(pageUrl(firstLocale, 'index'));
  const brand = await page.locator('header .brand').boundingBox();
  const cta = await page.locator(`header a[href="${pageUrl(firstLocale, ctaPage)}"]`).boundingBox();
  expect(brand && cta).toBeTruthy();
  if (!brand || !cta) return;
  const centre = (box: { y: number; height: number }) => box.y + box.height / 2;
  expect(Math.abs(centre(brand) - centre(cta))).toBeLessThan(8);
});
