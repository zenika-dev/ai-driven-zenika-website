import { expect, test, type Page } from '@playwright/test';
import { defaultLocale, pageUrl } from '../helpers/routes';

const home = pageUrl(defaultLocale, 'index');
const contact = pageUrl(defaultLocale, 'contact');
const html = (page: Page) => page.locator('html');
const toggle = (page: Page) => page.locator('[data-theme-toggle]');

test('follows the system preference by default', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(home);
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');

  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload();
  await expect(html(page)).toHaveAttribute('data-theme', 'light');
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'false');
});

test('toggle switches theme and the choice persists', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(home);
  await toggle(page).click();
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true');

  await page.goto(contact);
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');

  await toggle(page).click();
  await expect(html(page)).toHaveAttribute('data-theme', 'light');
});

test('theme is applied before the body is parsed (no flash)', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => {
    new MutationObserver((_, observer) => {
      if (!document.body) return;
      (window as Window & { themeAtBody?: string }).themeAtBody =
        document.documentElement.dataset.theme;
      observer.disconnect();
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto(home);
  const themeAtBody = await page.evaluate(
    () => (window as Window & { themeAtBody?: string }).themeAtBody,
  );
  expect(themeAtBody).toBe('dark');
});

/** Every custom property declared in the `[data-theme="dark"]` token block, with its value. */
function readDarkTokens() {
  const names = new Set<string>();
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      if (rule instanceof CSSStyleRule && rule.selectorText.includes('[data-theme="dark"]')) {
        for (const name of Array.from(rule.style)) {
          if (name.startsWith('--')) names.add(name);
        }
      }
    }
  }
  const style = getComputedStyle(document.documentElement);
  return Object.fromEntries([...names].map((name) => [name, style.getPropertyValue(name).trim()]));
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false, colorScheme: 'dark' });

  test('dark tokens match the JavaScript dark theme and the toggle is hidden', async ({
    page,
    browser,
    baseURL,
  }) => {
    await page.goto(home);
    await expect(toggle(page)).toBeHidden();
    const withoutJs = await page.evaluate(readDarkTokens);

    // Contexts inherit this block's options, so re-enable JavaScript explicitly.
    const context = await browser.newContext({
      baseURL,
      colorScheme: 'dark',
      javaScriptEnabled: true,
    });
    const jsPage = await context.newPage();
    await jsPage.goto(home);
    await expect(html(jsPage)).toHaveAttribute('data-theme', 'dark');
    const withJs = await jsPage.evaluate(readDarkTokens);
    await context.close();

    expect(Object.keys(withJs).length).toBeGreaterThan(0);
    expect(withoutJs).toEqual(withJs);
  });
});
