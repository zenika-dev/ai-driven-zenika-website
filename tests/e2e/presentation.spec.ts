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

    test('uses the brand fonts, served from this site', async ({ page }) => {
      await page.evaluate(() => document.fonts.ready);
      const families = await page.evaluate(() => [
        getComputedStyle(document.querySelector('h1') as Element).fontFamily,
        getComputedStyle(document.body).fontFamily,
      ]);
      expect(families[0]).toContain('Montserrat');
      expect(families[1]).toContain('Nunito');
      // The Astro Fonts API hashes family names (e.g. "Montserrat-d611…"), so match by prefix.
      const loaded = await page.evaluate(() =>
        [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
      );
      expect(loaded.some((family) => family.startsWith('Montserrat'))).toBe(true);
      expect(loaded.some((family) => family.startsWith('Nunito'))).toBe(true);
      // Served from this site, never from a font CDN.
      const fontHosts = await page.evaluate(() =>
        performance
          .getEntriesByType('resource')
          .filter((entry) => entry.name.endsWith('.woff2'))
          .map((entry) => new URL(entry.name).origin),
      );
      expect(fontHosts.length).toBeGreaterThan(0);
      expect(new Set(fontHosts)).toEqual(new Set([new URL(page.url()).origin]));
    });

    test('ends with the contact form and a mailto fallback', async ({ page }) => {
      await expect(page.locator('#contact a[href="mailto:info@zenika.com"]')).toHaveCount(1);
      const fields = page.locator('#contact form input, #contact form textarea');
      await expect(fields).toHaveCount(4);
      for (const field of await fields.all()) {
        await expect(field).toHaveAccessibleName(/\S/);
      }
    });

    test('contact form blocks an empty submit and flags the first empty field', async ({
      page,
    }) => {
      await page.locator('#contact form .submit').click();
      await expect(page.locator('#contact-name')).toBeFocused();
      await expect(page.locator('#contact-name')).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('#contact .status')).toHaveText(/\S/);
    });

    test('each expertise lever has a Discover button leading to the approach section', async ({
      page,
    }) => {
      const buttons = page.locator('#expertises .levers .discover');
      await expect(buttons).toHaveCount(3);
      for (const button of await buttons.all()) {
        await expect(button).toHaveAttribute('href', '#approach');
      }
    });

    test('does not scroll sideways', async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}
