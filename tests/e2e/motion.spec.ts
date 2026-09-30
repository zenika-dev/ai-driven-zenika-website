import { expect, test, type Page } from '@playwright/test';
import { defaultLocale, pageUrl } from '../helpers/routes';

const home = pageUrl(defaultLocale, 'index');
const contact = pageUrl(defaultLocale, 'contact');

/** Navigates home → contact and reports whether the new page was revealed with a view transition. */
async function navigateAndReadTransition(page: Page): Promise<boolean> {
  await page.addInitScript(() => {
    window.addEventListener('pagereveal', (event) => {
      sessionStorage.setItem('hadViewTransition', String(!!event.viewTransition));
    });
  });
  await page.goto(home);
  test.skip(
    !(await page.evaluate(() => 'onpagereveal' in window)),
    'Cross-document View Transitions are not supported in this browser',
  );
  await page.locator(`header nav a[href="${contact}"]`).click();
  await expect(page).toHaveURL(contact);
  return (await page.evaluate(() => sessionStorage.getItem('hadViewTransition'))) === 'true';
}

test('header carries a shared view-transition-name', async ({ page }) => {
  await page.goto(home);
  const name = await page
    .locator('header.site-header')
    .evaluate((el) => getComputedStyle(el).viewTransitionName);
  expect(name).toBe('site-header');
});

test('same-origin navigation uses a view transition', async ({ page }) => {
  expect(await navigateAndReadTransition(page)).toBe(true);
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('navigation has no view transition', async ({ page }) => {
    expect(await navigateAndReadTransition(page)).toBe(false);
  });
});
