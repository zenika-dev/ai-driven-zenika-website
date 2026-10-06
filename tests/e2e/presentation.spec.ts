import { expect, test } from '@playwright/test';
import { ctaPage } from '../../src/i18n/routes';
import { locales, pageUrl } from '../helpers/routes';

const sectionOrder = ['values', 'services', 'methodology', 'clients', 'publications', 'contact'];

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

    test('hero CTAs lead to Contact and to the first section', async ({ page }) => {
      const hero = page.locator('section').first();
      const links = hero.getByRole('link');
      await expect(links.nth(0)).toHaveAttribute('href', pageUrl(locale, ctaPage));
      await expect(links.nth(1)).toHaveAttribute('href', '#values');
      await links.nth(1).click();
      await expect(page.locator('#values')).toBeInViewport();
    });

    test('hero photo loads with its alt text', async ({ page }) => {
      const photo = page.locator('section').first().locator('img');
      await expect(photo).toHaveAttribute('alt', /\S/);
      await expect(photo).toHaveJSProperty('complete', true);
      expect(await photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    });

    test('shows the service cards, levers, stats, publications and clients', async ({ page }) => {
      await expect(page.locator('#services .cards > li')).toHaveCount(3);
      await expect(page.locator('#methodology .levers > li')).toHaveCount(3);
      await expect(page.locator('#values dl > div')).toHaveCount(4);
      await expect(page.locator('#publications .cards > li')).toHaveCount(3);
      expect(await page.locator('#clients .logos').first().locator('li').count()).toBeGreaterThan(
        0,
      );
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
      await expect(page.locator('#contact form input, #contact form textarea')).toHaveCount(4);
      for (const field of await page.locator('#contact form input, #contact form textarea').all()) {
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

    test('header nav links to the home page sections', async ({ page }) => {
      const hrefs = await page
        .locator('header nav.main-nav a')
        .evaluateAll((links) => links.map((a) => a.getAttribute('href')));
      expect(hrefs).toEqual(
        ['values', 'services', 'methodology', 'clients', 'publications'].map(
          (id) => `${pageUrl(locale, 'index')}#${id}`,
        ),
      );
    });

    test('does not scroll sideways', async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  });
}
