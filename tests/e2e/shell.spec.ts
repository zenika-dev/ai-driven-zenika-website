import { expect, test } from '@playwright/test';
import { ctaPage, navSections } from '../../src/i18n/routes';
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

test('main nav lists the home page sections; the CTA marks the contact page', async ({ page }) => {
  await page.goto(pageUrl(firstLocale, ctaPage));
  // The main nav is hidden below 640px (the logo links home), so count it without visibility.
  const links = page.locator('header nav.main-nav a');
  await expect(links).toHaveCount(navSections.length);
  for (const [i, id] of navSections.entries()) {
    await expect(links.nth(i)).toHaveAttribute('href', `${pageUrl(firstLocale, 'index')}#${id}`);
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

// Runs at the 1280px and 375px projects. (At tablet widths, 640–1023px, the nav
// intentionally sits on its own second row, as in the 834px Figma frame.)
test('header fits on one row', async ({ page }) => {
  await page.goto(pageUrl(firstLocale, 'index'));
  const controls = page.locator(
    'header .brand, header nav a:visible, header [data-theme-toggle]:visible, header a.button',
  );
  const boxes = (await controls.evaluateAll((elements) =>
    elements.map((el) => {
      const { top, height } = el.getBoundingClientRect();
      return { label: el.textContent?.trim() || el.className, centre: top + height / 2 };
    }),
  )) as { label: string; centre: number }[];

  // Logo, nav link(s), FR, EN, theme toggle and CTA on desktop; nav hidden on mobile.
  expect(boxes.length).toBeGreaterThanOrEqual(5);
  const [first] = boxes;
  for (const box of boxes) {
    expect(Math.abs(box.centre - (first?.centre ?? 0)), box.label).toBeLessThan(8);
  }
});
