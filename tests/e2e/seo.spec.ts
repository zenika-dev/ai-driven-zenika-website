import { expect, test } from '@playwright/test';
import config from '../../astro.config.mjs';
import { defaultLocale, locales, pageUrl, routes } from '../helpers/routes';

const site = config.site?.replace(/\/$/, '') ?? '';

for (const { page, url } of routes) {
  test(`${url} has SEO metadata`, async ({ page: browserPage }) => {
    await browserPage.goto(url);
    const head = browserPage.locator('head');

    await expect(browserPage).toHaveTitle(/\S/);
    await expect(head.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
    await expect(head.locator('link[rel="canonical"]')).toHaveAttribute('href', `${site}${url}`);

    for (const code of locales) {
      await expect(head.locator(`link[rel="alternate"][hreflang="${code}"]`)).toHaveAttribute(
        'href',
        `${site}${pageUrl(code, page)}`,
      );
    }
    await expect(head.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      'href',
      `${site}${pageUrl(defaultLocale, page)}`,
    );

    await expect(head.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      `${site}${url}`,
    );
    for (const property of ['og:type', 'og:title', 'og:description', 'og:locale']) {
      await expect(head.locator(`meta[property="${property}"]`)).toHaveAttribute('content', /\S/);
    }
    await expect(head.locator('meta[property="og:locale:alternate"]')).toHaveCount(
      locales.length - 1,
    );
  });
}

test('titles are unique within each locale', async ({ page }) => {
  for (const locale of locales) {
    const titles = new Set<string>();
    for (const route of routes.filter((r) => r.locale === locale)) {
      await page.goto(route.url);
      titles.add(await page.title());
    }
    expect(titles.size).toBe(routes.filter((r) => r.locale === locale).length);
  }
});

test('favicon is linked and served', async ({ page, request }) => {
  await page.goto(pageUrl(defaultLocale, 'index'));
  const href = await page.locator('head link[rel="icon"]').getAttribute('href');
  expect(href).toBeTruthy();
  const response = await request.get(href ?? '');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/png');
});
