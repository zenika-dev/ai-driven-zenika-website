import { expect, test } from '@playwright/test';
import { ctaPage } from '../../src/i18n/routes';
import { locales, pageUrl } from '../helpers/routes';

const sectionOrder = ['about', 'offers', 'approach', 'clients', 'publications', 'contact'];

for (const locale of locales) {
  test.describe(`Presentation (${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(pageUrl(locale, 'index'));
    });

    test('has one h1 in the hero and the sections in mockup order', async ({ page }) => {
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('section').first().locator('h1')).toHaveCount(1);
      const ids = await page
        .locator('main > section[id]')
        .evaluateAll((sections) => sections.map((s) => s.id));
      expect(ids).toEqual(sectionOrder);
      for (const id of sectionOrder) {
        await expect(page.locator(`#${id}`)).toHaveAttribute('aria-labelledby', `${id}-title`);
        await expect(page.locator(`#${id}-title`)).toHaveText(/\S/);
      }
    });

    test('hero CTAs lead to Contact and to the about section', async ({ page }) => {
      const hero = page.locator('section').first();
      const links = hero.getByRole('link');
      await expect(links.nth(0)).toHaveAttribute('href', pageUrl(locale, ctaPage));
      await expect(links.nth(1)).toHaveAttribute('href', '#about');
      await links.nth(1).click();
      await expect(page.locator('#about')).toBeInViewport();
    });

    test('hero photo loads with its alt text', async ({ page }) => {
      const photo = page.locator('section').first().locator('img');
      await expect(photo).toHaveAttribute('alt', /\S/);
      await expect(photo).toHaveJSProperty('complete', true);
      expect(await photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    });

    test('shows 4 stats, 3 offers, 3 approach cards, 3 publications and the clients', async ({
      page,
    }) => {
      await expect(page.locator('#about dl > div')).toHaveCount(4);
      await expect(page.locator('#offers li')).toHaveCount(3);
      await expect(page.locator('#approach li')).toHaveCount(3);
      await expect(page.locator('#publications li')).toHaveCount(3);
      expect(await page.locator('#clients li').count()).toBeGreaterThan(0);
    });

    test('ends with the mailto contact block', async ({ page }) => {
      await expect(page.locator('#contact a[href="mailto:info@zenika.com"]')).toHaveCount(2);
    });

    test('does not scroll sideways', async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}
