import { expect, test } from '@playwright/test';
import { trackErrors } from './helpers';
import { readdirSync } from 'node:fs';

const labs = readdirSync(new URL('../../src/labs/', import.meta.url)).sort();
const pages = ['./', 'begrepp/', 'larare/', 'reflektion/', 'min-oversikt/', 'om/', ...['introduktion', 'sokning', 'maskininlarning', 'sprak', 'robotik', 'etik'].map((c) => `kapitel/${c}/`)];

test.describe('Alla sidor laddar utan konsolfel', () => {
  for (const p of pages) {
    test(`sida ${p}`, async ({ page }) => {
      const errors = trackErrors(page);
      const res = await page.goto(p);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
    });
  }
  for (const id of labs) {
    const path = id === 'granska-ett-ai-system' ? `projekt/${id}/` : `labb/${id}/`;
    test(`labb ${id}`, async ({ page }) => {
      const errors = trackErrors(page);
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('h2#mal')).toHaveText('Mål');
      await expect(page.getByRole('button', { name: /Börja om/ })).toBeVisible();
      await expect(page.locator('.pager a').first()).toBeVisible();
      // ingen horisontell sidrullning
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      expect(errors).toEqual([]);
    });
  }
});
