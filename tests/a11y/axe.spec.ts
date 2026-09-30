import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { routes } from '../helpers/routes';

const themes = ['light', 'dark'] as const;
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const theme of themes) {
  for (const { url } of routes) {
    test(`${url} has no axe violations (${theme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(url);
      const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();
      expect(violations).toEqual([]);
    });
  }
}
