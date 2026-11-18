import { expect, type Page } from '@playwright/test';

/** Samlar konsolfel och okontrollerade undantag. Anropa före page.goto. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

/** Väntar tills labbens React-del har laddats. */
export async function openLab(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();
}

/** Gör localStorage oanvändbart (som i vissa skolmiljöer/privata lägen). */
export async function blockStorage(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Blockerad', 'SecurityError');
      },
    });
  });
}

/** Svarar på en flervalsfråga (data-question=id) och kontrollerar. */
export async function answerChoice(page: Page, questionId: string, optionText: string | RegExp) {
  const q = page.locator(`[data-question="${questionId}"]`);
  await q.getByLabel(optionText).check();
  await q.getByRole('button', { name: 'Kontrollera svaret' }).click();
  return q;
}

export async function answerNumeric(page: Page, questionId: string, value: string) {
  const q = page.locator(`[data-question="${questionId}"]`);
  await q.getByLabel('Ditt svar').fill(value);
  await q.getByRole('button', { name: 'Kontrollera svaret' }).click();
  return q;
}
