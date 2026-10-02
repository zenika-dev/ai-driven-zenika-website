import { expect, test } from '@playwright/test';
import { ctaPage } from '../../src/i18n/routes';
import { locales, pageUrl } from '../helpers/routes';

const sectionOrder = ['expertises', 'approach', 'values', 'clients', 'publications', 'contact'];

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

    test('hero CTAs lead to Contact and to the expertises section', async ({ page }) => {
      const hero = page.locator('section').first();
      const links = hero.getByRole('link');
      await expect(links.nth(0)).toHaveAttribute('href', pageUrl(locale, ctaPage));
      await expect(links.nth(1)).toHaveAttribute('href', '#expertises');
      await links.nth(1).click();
      await expect(page.locator('#expertises')).toBeInViewport();
    });

    test('hero photo loads with its alt text', async ({ page }) => {
      const photo = page.locator('section').first().locator('img');
      await expect(photo).toHaveAttribute('alt', /\S/);
      await expect(photo).toHaveJSProperty('complete', true);
      expect(await photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    });

    test('shows the expertise levers, commitments, stats, publications and clients', async ({
      page,
    }) => {
      await expect(page.locator('#expertises .levers > li')).toHaveCount(3);
      await expect(page.locator('#expertises .list li').first()).toBeVisible();
      await expect(page.locator('#approach ol > li')).toHaveCount(5);
      await expect(page.locator('#values dl > div')).toHaveCount(4);
      await expect(page.locator('#publications .cards > li')).toHaveCount(3);
      expect(await page.locator('#clients .logos li').count()).toBeGreaterThan(0);
      expect(await page.locator('#clients .points li').count()).toBeGreaterThan(0);
    });

    test('uses the self-hosted brand fonts', async ({ page }) => {
      await page.evaluate(() => document.fonts.ready);
      const families = await page.evaluate(() => [
        getComputedStyle(document.querySelector('h1') as Element).fontFamily,
        getComputedStyle(document.body).fontFamily,
      ]);
      expect(families[0]).toContain('Montserrat');
      expect(families[1]).toContain('Nunito');
      expect(await page.evaluate(() => document.fonts.check('800 16px Montserrat'))).toBe(true);
      expect(await page.evaluate(() => document.fonts.check('400 16px Nunito'))).toBe(true);
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
