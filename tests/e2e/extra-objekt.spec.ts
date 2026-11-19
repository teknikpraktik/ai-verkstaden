import { expect, test, type Page } from '@playwright/test';
import { answerChoice, answerNumeric, openLab, trackErrors } from './helpers';

const LAB = 'labb/kanna-igen-objekt-i-bilder/';
const next = async (page: Page) => page.getByRole('button', { name: /Gå vidare/ }).click();

test.describe('Extralabb 28: känn igen objekt i bilder @mobil', () => {
  test('förutsäg, jämför, glidande fönster, brus/tröskel, fel → återkoppling → rätt, omladdning', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('kapitel/maskininlarning/');
    await page.getByRole('link', { name: /Känn igen objekt i bilder/ }).first().click();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();

    // Steg 1: förutsäg – svaret döljs, bilden kan visas som tal
    await expect(page.getByTestId('bild-resultat')).toContainText('visas när du har gjort din förutsägelse');
    await page.getByLabel(/Visa bilden som tal/).check();
    await expect(page.locator('[data-cell="1-0"]')).toHaveText('1');
    await expect(page.locator('[data-cell="0-0"]')).toHaveText('0');
    await page.getByLabel(/Likheten sjunker, men modellen svarar fortfarande kopp/).check();
    await expect(page.getByText(/Din förutsägelse: Likheten sjunker/)).toBeVisible();
    await next(page);

    // Steg 2: likheter, fel → återkoppling → rätt
    await expect(page.getByTestId('bild-resultat')).toHaveText('Modellen svarar kopp med likheten 100 %.');
    let q = await answerNumeric(page, 'likhet-apple', '88');
    await expect(q.getByText(/15 ÷ 17 delar bara med koppens/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerNumeric(page, 'likhet-apple', '52');
    await expect(q.getByText('Rätt!')).toBeVisible();

    await page.reload();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Steg 2 av 6/ })).toBeVisible();
    await expect(page.locator('[data-question="likhet-apple"]').getByText('Rätt!')).toBeVisible();
    await next(page);

    // Steg 3: en ändring i taget, jämför med förutsägelsen
    await expect(page.getByTestId('jamfor-forutsagelse')).toContainText('Du förutsade att likheten skulle sjunka');
    await expect(page.getByTestId('bild-resultat')).toHaveText('Modellen svarar äpple med likheten 34 %.');
    const change = page.getByRole('group', { name: 'Ändring av koppen' });
    await change.getByRole('radio', { name: 'Vriden ett kvarts varv' }).check({ force: true });
    await expect(page.getByTestId('bild-resultat')).toHaveText('Modellen svarar äpple med likheten 38 %.');
    await change.getByRole('radio', { name: 'Högra delen skymd' }).check({ force: true });
    await expect(page.getByTestId('bild-resultat')).toHaveText('Modellen svarar kopp med likheten 41 %.');
    q = await answerChoice(page, 'skymd-kopp', 'Omvänd belysning (svart ↔ vitt)');
    await expect(q.getByText(/kopp 0 %/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerChoice(page, 'skymd-kopp', 'Högra delen skymd');
    await expect(q.getByText('Rätt!')).toBeVisible();
    await next(page);

    // Steg 4: glidande fönster
    await expect(page.getByTestId('fonster-status')).toContainText('Inget fönster ännu');
    await page.getByRole('button', { name: /Steg framåt/ }).click();
    await page.getByRole('button', { name: /Steg framåt/ }).click();
    await expect(page.getByTestId('fonster-status')).toContainText('Läge 2 av 69');
    await expect(page.getByTestId('fonster-status')).toContainText('äpple: 72 %, minst tröskeln 70 %');
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('fynd-resultat')).toContainText('Rätt: 3 av 3 föremål. Felaktiga fynd: 0. Missade: 0.');
    await answerNumeric(page, 'antal-lagen', '69');
    await expect(page.locator('[data-question="antal-lagen"]').getByText('Rätt!')).toBeVisible();
    await next(page);

    // Steg 5: brus 20 %, ändra tröskeln
    await expect(page.getByTestId('fynd-resultat')).toContainText('Rätt: 1 av 3 föremål. Felaktiga fynd: 0. Missade: 2 (nyckel, kopp).');
    await answerNumeric(page, 'missade', '2');
    await expect(page.locator('[data-question="missade"]').getByText('Rätt!')).toBeVisible();
    await page.getByLabel(/^Tröskel/).fill('50');
    await expect(page.getByTestId('fynd-resultat')).toContainText('Rätt: 2 av 3 föremål. Felaktiga fynd: 2. Missade: 1 (nyckel).');
    await expect(page.getByTestId('fynd-tabell')).toContainText('✗ fel');
    await answerChoice(page, 'sank-troskel', /två felaktiga fynd/);
    await expect(page.locator('[data-question="sank-troskel"]').getByText('Rätt!')).toBeVisible();
    await next(page);

    // Steg 6: egen bild + öppen fråga
    await expect(page.getByTestId('bild-resultat')).toHaveText('Modellen svarar kopp med likheten 100 %.');
    await expect(page.locator('[data-question="manniska-modell"]')).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe('Extralabb 28: interaktioner', () => {
  test('pixlar kan ritas med tangentbordet, tom bild ger inget svar @mobil', async ({ page }) => {
    await openLab(page, LAB);
    await page.getByRole('radio', { name: 'Experiment' }).check({ force: true });
    await page.getByLabel('Bild att testa').selectOption('egen');
    await page.getByRole('button', { name: 'Rensa bilden' }).click();
    await expect(page.getByTestId('bild-resultat')).toContainText('Modellen kan inte svara');
    await expect(page.getByTestId('bild-info')).toContainText('0 av 36');

    const grid = page.getByRole('grid', { name: /Din bild/ });
    await grid.locator('[data-cell="0-0"]').focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(grid.locator('[data-cell="2-1"]')).toBeFocused();
    await expect(grid.locator('[data-cell="2-0"]')).toHaveAttribute('aria-label', 'Rad 3, kolumn A: svart (1)');
    await expect(page.getByTestId('bild-info')).toContainText('2 av 36');
    await expect(page.getByTestId('bild-resultat')).toContainText('Modellen svarar nyckel');

    // klick växlar också
    await grid.locator('[data-cell="2-1"]').click();
    await expect(page.getByTestId('bild-info')).toContainText('1 av 36');

    // helt svart bild
    await page.getByLabel('Bild att testa').selectOption('svart');
    await expect(page.getByTestId('bild-resultat')).toHaveText('Modellen svarar äpple med likheten 75 %.');

    // ritningen sparas
    await page.getByLabel('Bild att testa').selectOption('egen');
    await page.reload();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();
    await expect(page.getByTestId('bild-info')).toContainText('1 av 36');
  });

  test('experimentläge: tröskel 100 % och 0 %, nytt brus', async ({ page }) => {
    await openLab(page, LAB);
    await page.getByRole('radio', { name: 'Experiment' }).check({ force: true });
    await expect(page.getByTestId('fynd-resultat')).toContainText('brus 10 % och tröskel 70 %: 3 fynd');
    await page.getByLabel(/^Brus i den stora bilden/).fill('0');
    await page.getByLabel(/^Tröskel/).fill('100');
    await expect(page.getByTestId('fynd-resultat')).toContainText('Rätt: 3 av 3 föremål. Felaktiga fynd: 0. Missade: 0.');
    await page.getByLabel(/^Tröskel/).fill('40');
    await expect(page.getByTestId('fynd-resultat')).toContainText('Felaktiga fynd: 1.');
    await page.getByLabel(/^Brus i den stora bilden/).fill('20');
    await page.getByRole('button', { name: /Nytt slumpat brus/ }).click();
    await expect(page.getByRole('button', { name: /Nytt slumpat brus \(nr 2\)/ })).toBeVisible();
  });
});
