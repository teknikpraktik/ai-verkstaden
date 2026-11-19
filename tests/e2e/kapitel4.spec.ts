import { expect, test, type Page } from '@playwright/test';
import { answerChoice, answerNumeric, openLab, trackErrors } from './helpers';

const next = (page: Page) => page.getByRole('button', { name: /Gå vidare/ }).click();

test.describe('Kapitel 4: labb 16 Gör text till data @mobil', () => {
  test('förutsäg, tokenisera, fel→återkoppling→rätt, redigera text och omladdning', async ({ page }) => {
    const errors = trackErrors(page);
    await openLab(page, 'labb/gor-text-till-data/');
    await page.getByLabel('Bara om texten bearbetas först, till exempel genom att ändelser tas bort').check();
    await next(page);
    await expect(page.getByRole('heading', { name: /Steg 2 av 6/ })).toBeVisible();
    await expect(page.getByTestId('token-lista').locator('li')).toHaveCount(9);

    let q = await answerNumeric(page, 'antal-token', '7');
    await expect(q.getByText(/7 är antalet ord/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerNumeric(page, 'antal-token', '9');
    await expect(q.getByText('Rätt!')).toBeVisible();

    // Stemming och lemmatisering
    await next(page);
    await next(page);
    const table = page.getByTestId('jamfor-tabell');
    await expect(table.getByRole('row', { name: /sprang/ })).toContainText('springa');
    await page.getByRole('button', { name: 'Ord utanför ordlistan' }).click();
    await expect(table).toContainText('okänt – faller igenom');

    // Egen text sparas lokalt
    const box = page.getByRole('textbox', { name: /Exempeltext/ });
    await box.fill('Böckerna låg på bordet.');
    await page.reload();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Exempeltext/ })).toHaveValue('Böckerna låg på bordet.');
    await expect(page.getByTestId('jamfor-tabell').getByRole('row', { name: /Böckerna/ })).toContainText('bok');

    // Tom text
    await page.getByRole('button', { name: 'Töm' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Texten är tom' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('ordvektorer: byt representation och läs av räkningen', async ({ page }) => {
    await openLab(page, 'labb/gor-text-till-data/');
    for (let i = 0; i < 4; i++) await next(page);
    await expect(page.getByTestId('ordforrad')).toContainText('21 olika termer');
    await page.getByRole('radio', { name: 'Lemma (ordlista)' }).check({ force: true });
    await expect(page.getByTestId('ordforrad')).toContainText('17 olika termer');
    await expect(page.getByTestId('vektor-tabell').getByRole('row', { name: /^hund\b/ })).toContainText('2');
    let q = await answerNumeric(page, 'hund-a', '0');
    await expect(q.getByText(/gäller ordformer/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerNumeric(page, 'hund-a', '2');
    await expect(q.getByText('Rätt!')).toBeVisible();
  });
});

test.describe('Kapitel 4: labb 17 Sortera meddelanden', () => {
  test('ordbidrag, negation och reserverade exempel', async ({ page }) => {
    const errors = trackErrors(page);
    await openLab(page, 'labb/sortera-meddelanden/');
    await expect(page.getByTestId('traningsdata')).toContainText('Provet i matte flyttas till fredag');
    await page.getByLabel('Modellen byter till Kan vänta').check();
    await next(page);
    await expect(page.getByTestId('poang')).toHaveText('▲ +3,54');
    await expect(page.getByTestId('ordpaverkan').getByRole('row', { name: /^morgon/ })).toContainText('▲ +1,09');
    let q = await answerChoice(page, 'starkast-ord', /^i$/);
    await expect(q.getByText(/i båda klasserna/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerChoice(page, 'starkast-ord', /^morgon$/);
    await expect(q.getByText('Rätt!')).toBeVisible();

    await next(page);
    await expect(page.getByRole('textbox', { name: /^Meddelande/ })).toHaveValue('Lektionen är inte inställd i morgon');
    await expect(page.getByTestId('poang')).toHaveText('▲ +3,53');

    await next(page);
    await expect(page.getByTestId('beslut')).toContainText('Inget av de 4 orden');
    await page.getByRole('button', { name: 'Töm' }).click();
    await expect(page.getByTestId('beslut')).toContainText('Meddelandet är tomt');

    await next(page);
    await expect(page.getByTestId('felrapport')).toContainText('2 av 6 (33 %)');
    q = await answerNumeric(page, 'antal-fel', '4');
    await expect(q.getByText(/antalet som blev rätt/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerNumeric(page, 'antal-fel', '2');
    await expect(q.getByText('Rätt!')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('experimentläge: eget meddelande med okänt ord', async ({ page }) => {
    await openLab(page, 'labb/sortera-meddelanden/');
    await page.getByRole('radio', { name: 'Experiment' }).check({ force: true });
    await page.getByRole('textbox', { name: /^Meddelande/ }).fill('Provet flyttas');
    await expect(page.getByTestId('beslut')).toContainText('Beslut: Viktigt');
    await page.getByRole('textbox', { name: /^Meddelande/ }).fill('Snöstorm');
    await expect(page.getByTestId('ordpaverkan')).toContainText('finns inte i träningsdata');
  });
});

test.describe('Kapitel 4: labb 18 Samma mening, flera tolkningar', () => {
  test('kontext, moderering och nästa ord', async ({ page }) => {
    const errors = trackErrors(page);
    await openLab(page, 'labb/samma-mening-flera-tolkningar/');
    await page.getByLabel('Det går inte att avgöra från meningen ensam').check();
    await next(page);
    await expect(page.getByRole('status').filter({ hasText: 'tvetydig' })).toBeVisible();
    await page.getByLabel(/stor kikare runt halsen/).check();
    await expect(page.getByTestId('tolkningar').getByRole('row', { name: /Mannen jag såg/ })).toContainText('✓ rimligast här');
    const q1 = await answerChoice(page, 'vad-avgor', /Sammanhanget/);
    await expect(q1.getByText('Rätt!')).toBeVisible();

    await next(page);
    await page.getByLabel('Nyckelordsregeln').check();
    await next(page);
    await expect(page.getByTestId('moderering-summa').getByRole('row', { name: /Nyckelordsregel/ })).toContainText('8');
    let q = await answerNumeric(page, 'onodigt-stoppade', '8');
    await expect(q.getByText(/alla kommentarer som nyckelordsregeln stoppar/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerNumeric(page, 'onodigt-stoppade', '5');
    await expect(q.getByText('Rätt!')).toBeVisible();

    await next(page);
    await next(page);
    await page.getByRole('button', { name: 'en', exact: true }).click();
    await expect(page.getByTestId('nasta-ord').getByRole('row', { name: /^bok/ })).toContainText('3 av 7');
    q = await answerNumeric(page, 'p-bok', '43');
    await expect(q.getByText('Rätt!')).toBeVisible();
    await page.getByRole('button', { name: 'jag', exact: true }).click();
    await expect(page.getByTestId('girig')).toContainText('jag läser en bok.');
    await expect(page.getByTestId('slumpad')).toContainText('jag såg en katt sover i parken.');
    await page.getByRole('button', { name: 'robot' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'aldrig sett ordet ”robot”' })).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe('Kapitel 4: kunskapskontroll', () => {
  test('kontrollfråga med fel och rätt svar', async ({ page }) => {
    await page.goto('kapitel/sprak/');
    const q = page.locator('[data-question="sprak-token"]');
    await q.scrollIntoViewIfNeeded();
    await q.getByLabel('Ditt svar').fill('4');
    await q.getByRole('button', { name: 'Kontrollera svaret' }).click();
    await expect(q.getByText(/4 är antalet ord/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await q.getByLabel('Ditt svar').fill('6');
    await q.getByRole('button', { name: 'Kontrollera svaret' }).click();
    await expect(q.getByText('Rätt!')).toBeVisible();
  });
});
