import { expect, test, type Page } from '@playwright/test';
import { answerChoice, answerNumeric, openLab, trackErrors } from './helpers';

const next = (page: Page) => page.getByRole('button', { name: /Gå vidare/ }).click();
const toStep = async (page: Page, n: number) => {
  for (let i = 0; i < n; i++) await next(page);
};

test.describe('Kapitel 2 @mobil', () => {
  test('labb 5: förutsäg, stega roboten, fel svar → förklaring → rätt svar', async ({ page }) => {
    const errors = trackErrors(page);
    await openLab(page, 'labb/programmera-en-stadrobot/');
    await page.getByLabel('Roboten som följer regler').check();
    await next(page);

    // Slumproboten: stega och läs agentpanelen
    await page.getByRole('button', { name: /Steg framåt/ }).click();
    const loop = page.getByTestId('agentloop');
    await expect(loop).toContainText('Mål');
    await expect(loop).toContainText('Egen ruta: ren');
    await expect(page.getByRole('list', { name: /Program för slumpstrategi/ })).toContainText('används nu');
    let q = await answerChoice(page, 'sensor-eller-tillstand', 'Jag har redan kontrollerat A1 och B1');
    await expect(q.getByText(/tillstånd/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerChoice(page, 'sensor-eller-tillstand', 'Rutan jag står på är ren');
    await expect(q.getByText('Rätt!')).toBeVisible();

    // Regelstyrd robot: kontrollerat resultat
    await next(page);
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('resultat')).toContainText('rent efter 32 handlingar');
    await expect(page.getByTestId('resultat')).toContainText('stannade efter 35');
    const n = await answerNumeric(page, 'regler-steg', '35');
    await expect(n.getByText(/inte kan veta att rummet är rent/)).toBeVisible();
    await n.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'regler-steg', '32');
    await expect(n.getByText('Rätt!')).toBeVisible();

    // Bara sikten ändras
    await toStep(page, 2);
    await expect(page.getByTestId('jamforelse-sikt')).toContainText('22');
    expect(errors).toEqual([]);
  });

  test('kunskapskontrollen på kapitelsidan ger återkoppling', async ({ page }) => {
    await page.goto('kapitel/sokning/');
    // Kunskapskontrollen hydreras först när den syns (client:visible).
    await page.locator('[data-question="k2-kostnad"]').scrollIntoViewIfNeeded();
    const q = await answerNumeric(page, 'k2-kostnad', '100');
    await expect(q.getByText(/kostnaden för den billigaste vägen/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'k2-kostnad', '10');
    await expect(q.getByText('Rätt!')).toBeVisible();
  });
});

test.describe('Kapitel 2 på dator', () => {
  test('labb 5: slumpen är reproducerbar med startvärde', async ({ page }) => {
    await openLab(page, 'labb/programmera-en-stadrobot/');
    await page.getByRole('radio', { name: 'Experiment' }).check({ force: true });
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('resultat')).toContainText('rent efter 88 handlingar');
    await page.getByLabel(/Startvärde för slumpen/).fill('9');
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('jamforelse')).toContainText('Slump, startvärde 9');
  });

  test('labb 6: sökträd med dubbletter, bygg om grafen, ingen väg och tom graf', async ({ page }) => {
    const errors = trackErrors(page);
    await openLab(page, 'labb/bygg-en-graf/');
    await next(page);
    await expect(page.getByTestId('tradfakta')).toContainText('20 noder');
    await expect(page.getByTestId('tradfakta')).toContainText('Stockholm finns 3 gånger');
    const q = await answerNumeric(page, 'trad-djup2', '20');
    await expect(q.getByText(/alla noder i trädet tillsammans/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'trad-djup2', '5');
    await expect(q.getByText('Rätt!')).toBeVisible();

    await toStep(page, 2);
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('resultat')).toContainText('Västerås → Enköping → Uppsala → Stockholm: 3 steg, kostnad 100');

    await next(page);
    await page.getByRole('button', { name: 'Ta bort kanten Enköping–Stockholm' }).click();
    await page.getByRole('button', { name: 'Ta bort kanten Uppsala–Stockholm' }).click();
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('resultat')).toContainText('det finns ingen väg');

    // Lägg till en kant med formuläret
    await page.getByLabel('Från', { exact: true }).selectOption({ label: 'Sala' });
    await page.getByLabel('Till', { exact: true }).selectOption({ label: 'Stockholm' });
    await page.getByLabel('Vikt (minuter)').fill('70');
    await page.getByRole('button', { name: 'Lägg till kant' }).click();
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('resultat')).toContainText('Västerås → Sala → Stockholm');

    await page.getByRole('button', { name: 'Töm grafen' }).click();
    await expect(page.getByTestId('resultat')).toContainText('Grafen är tom');
    expect(errors).toEqual([]);
  });

  test('labb 8: girig väg kostar 450, A* 375, gränstabell med g, h och f', async ({ page }) => {
    await openLab(page, 'labb/sok-med-kostnad-och-ledtrad/');
    await toStep(page, 2);
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('resultat')).toContainText('Ekeby → Björkås → Sjövik → Lindvik kostar 450');
    const q = await answerNumeric(page, 'girig-kostnad', '375');
    await expect(q.getByText(/billigaste vägen, söderut/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'girig-kostnad', '450');
    await expect(q.getByText('Rätt!')).toBeVisible();

    await next(page);
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /Steg framåt/ }).click();
    const row = page.getByTestId('gransen').getByRole('row', { name: /Sjövik/ });
    await expect(row).toContainText('210');
    await expect(row).toContainText('158');
    await expect(row).toContainText('368');

    await next(page);
    await expect(page.getByTestId('jamforelse')).toContainText('375 ✓ billigast');
    await expect(page.getByTestId('jamforelse')).toContainText('450 ✗ (75 dyrare)');

    await page.getByRole('radio', { name: 'Experiment' }).check({ force: true });
    await page.getByLabel('Ledtråd h').selectOption('tredubbel');
    await expect(page.getByTestId('h-egenskaper')).toContainText('inte tillåten');
  });

  test('labb 9: tangentbordsspel mot minimax, jämförelse och beslutsträd', async ({ page }) => {
    const errors = trackErrors(page);
    await openLab(page, 'labb/tre-i-rad-mot-en-agent/');
    await page.getByLabel(/C1 – i slutet/).check();
    await next(page);
    const table = page.getByTestId('jamforelse');
    await expect(table.getByRole('row', { name: /Minimaxagent/ })).toContainText('C1');
    await expect(table.getByRole('row', { name: /Regelagent/ })).toContainText('C1');
    let q = await answerChoice(page, 'vem-missar', 'Minimaxagenten');
    await expect(q.getByText(/X vinner direkt/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerChoice(page, 'vem-missar', 'Slumpagenten');
    await expect(q.getByText('Rätt!')).toBeVisible();

    // Fällan med två hörn: öppna trädet för C1
    await toStep(page, 2);
    await expect(table.getByRole('row', { name: /Regelagent/ })).toContainText('C1');
    await expect(table.getByRole('row', { name: /Minimaxagent/ })).toContainText('B1');
    const c1 = page.locator('[data-move="C1"]');
    await expect(c1).toContainText('förlust (om 4 drag)');
    await c1.getByRole('button', { name: /Visa X:s 5 svar/ }).click();
    await expect(c1).toContainText('X i A3');
    await expect(c1).toContainText('X:s bästa svar');

    // Spela med tangentbordet
    await next(page);
    const board = page.getByRole('grid', { name: /Tre i rad-bräde/ });
    await board.locator('[data-cell="0-0"]').focus();
    await page.keyboard.press('Enter');
    await expect(board.locator('[data-cell="0-0"]')).toHaveAttribute('aria-label', 'A1: X');
    await expect(board.locator('[data-cell="1-1"]')).toHaveAttribute('aria-label', 'B2: O');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', /^B1/);
    await page.keyboard.press('Enter');
    await expect(board.locator('[data-cell="0-2"]')).toHaveAttribute('aria-label', 'C1: O');
    await expect(page.getByRole('status').filter({ hasText: 'Minimaxagent lade O i C1' })).toBeVisible();
    // Upptagen ruta ger ett meddelande, inget drag
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status').filter({ hasText: 'redan upptagen' })).toBeVisible();
    await expect(page.getByTestId('serie')).toContainText('Regelagent');
    await answerNumeric(page, 'regler-forlust', '2');
    await expect(page.locator('[data-question="regler-forlust"]').getByText('Rätt!')).toBeVisible();
    expect(errors).toEqual([]);
  });
});
