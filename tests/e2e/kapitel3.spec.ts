import { expect, test, type Page } from '@playwright/test';
import { answerChoice, answerNumeric, openLab, trackErrors } from './helpers';

const next = async (page: Page, times = 1) => {
  for (let i = 0; i < times; i++) await page.getByRole('button', { name: /Gå vidare/ }).click();
};

test.describe('Kapitel 3: labb 10 genomgång @mobil', () => {
  test('förutsäg, ändra k, fel → återkoppling → rätt, progression efter omladdning', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('kapitel/maskininlarning/');
    await page.getByRole('link', { name: /Träna en klassificerare/ }).first().click();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();

    // Förutsäg: svaret visas inte förrän eleven har gått vidare
    await expect(page.getByTestId('knn-resultat')).toContainText('visas när du har gjort din förutsägelse');
    await page.getByLabel('Päron', { exact: true }).check();
    await expect(page.getByText('Din förutsägelse: Päron')).toBeVisible();
    await next(page);

    // Prova: k = 1 ger äpple
    await expect(page.getByTestId('knn-resultat')).toContainText('★ blir äpple');
    await expect(page.getByTestId('grannar')).toContainText('0,32');
    await page.getByLabel(/Antal grannar k/).fill('3');
    await expect(page.getByTestId('knn-resultat')).toContainText('1 röst för äpple och 2 för päron');
    await expect(page.getByTestId('knn-resultat')).toContainText('★ blir päron');

    let q = await answerChoice(page, 'k3-svar', /fler päron än äpplen/);
    await expect(q.getByText('Inte riktigt.')).toBeVisible();
    await expect(q.getByText(/fler äpplen \(8\)/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerChoice(page, 'k3-svar', /två av de tre närmaste/);
    await expect(q.getByText('Rätt!')).toBeVisible();

    await page.reload();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Steg 2 av 6/ })).toBeVisible();
    await expect(page.locator('[data-question="k3-svar"]').getByText('Rätt!')).toBeVisible();

    // Lika röster och avvikande punkt
    await next(page);
    await expect(page.getByTestId('knn-resultat')).toContainText('Lika röster');
    await answerChoice(page, 'lika-roster', 'Äpple');
    await expect(page.locator('[data-question="lika-roster"]').getByText('Rätt!')).toBeVisible();
    await next(page);
    await page.getByRole('radio', { name: 'k = 5' }).check({ force: true });
    await answerNumeric(page, 'k5-paron', '4');
    await expect(page.locator('[data-question="k5-paron"]').getByText('Rätt!')).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe('Kapitel 3: interaktioner per labb', () => {
  test('labb 10: punkter kan redigeras i tabell utan dragning, även tomt', async ({ page }) => {
    await openLab(page, 'labb/trana-en-klassificerare/');
    await page.getByRole('radio', { name: 'Experiment' }).check({ force: true });
    await page.getByText(/Ändra punkterna i en tabell/).click();
    await page.getByLabel('Klass för punkt 8').selectOption('b');
    await page.getByLabel(/Antal grannar k/).fill('1');
    await expect(page.getByTestId('knn-resultat')).toContainText('★ blir päron');
    await page.getByRole('button', { name: 'Ta bort alla' }).click();
    await expect(page.getByTestId('knn-resultat')).toContainText('kan inte förutsäga');
    await page.getByRole('button', { name: '+ Lägg till äpple' }).click();
    await expect(page.getByTestId('knn-resultat')).toContainText('★ blir äpple');
  });

  test('labb 11: reglage ändrar MSE, anpassad linje och extrapolering', async ({ page }) => {
    await openLab(page, 'labb/forutsag-ett-tal/');
    await expect(page.getByTestId('mse-resultat')).toContainText('MSE på träningsdata: 687,2');
    await next(page);
    await answerNumeric(page, 'residual-28', '-44');
    await expect(page.locator('[data-question="residual-28"]').getByText(/verkligt − förutsagt/)).toBeVisible();
    await next(page);
    await page.getByLabel(/Lutning/).fill('6');
    await page.getByLabel(/Nivå vid 20/).fill('58');
    await expect(page.getByTestId('mse-resultat')).toContainText('MSE på träningsdata: 10,4');
    await expect(page.getByTestId('mse-resultat')).toContainText('Under 20');
    await next(page);
    await answerNumeric(page, 'mse-anpassad', '10,0');
    await expect(page.locator('[data-question="mse-anpassad"]').getByText('Rätt!')).toBeVisible();
    await next(page);
    await expect(page.getByTestId('nya-dagar')).toContainText('−29,7');
    await answerNumeric(page, 'extrapolera-5', '-30');
    await expect(page.locator('[data-question="extrapolera-5"]').getByText('Rätt!')).toBeVisible();
  });

  test('labb 12: välj på validering, lås, testa en gång; läckagedemo är separat', async ({ page }) => {
    await openLab(page, 'labb/trana-valj-och-testa/');
    await next(page);
    await expect(page.getByTestId('val-resultat')).toContainText('träning 100 %, validering 80 %');
    await next(page);
    const q = await answerNumeric(page, 'basta-k', '1');
    await expect(q.getByText(/Valet ska göras på valideringsdata/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'basta-k', '9');
    await expect(q.getByText('Rätt!')).toBeVisible();
    await page.getByLabel(/Antal grannar k/).fill('3');
    await expect(page.getByTestId('val-resultat')).toContainText('validering 94 %');
    await expect(page.getByTestId('testresultat')).toHaveCount(0);
    await page.getByRole('button', { name: /Lås valet \(k = 9\)/ }).click();
    await expect(page.getByTestId('testresultat')).toContainText('30 av 35 (86 %)');
    await expect(page.getByLabel(/Antal grannar k/)).toBeDisabled();
    // Ångra → nytt test märks som förbrukat
    await page.getByRole('button', { name: /Ångra valet/ }).click();
    await page.getByRole('button', { name: /Lås valet/ }).click();
    await expect(page.getByTestId('testresultat')).toContainText('redan använts');
    await next(page, 3);
    await expect(page.getByTestId('lackage')).toContainText('Separat demonstration');
    await expect(page.getByTestId('lackage')).toContainText('100 %');
  });

  test('labb 13: stega k-means och jämför startvärden', async ({ page }) => {
    await openLab(page, 'labb/grupper-utan-facit/');
    await next(page);
    await page.getByRole('button', { name: /Steg framåt/ }).click();
    await expect(page.getByTestId('kmeans-status')).toContainText('tilldelning');
    await page.getByRole('button', { name: /Steg framåt/ }).click();
    await expect(page.getByTestId('kmeans-status')).toContainText('uppdatering');
    await next(page);
    await page.getByRole('radio', { name: '8', exact: true }).check({ force: true });
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('summa')).toHaveText('143,4');
    await expect(page.getByTestId('startvarden')).toContainText('✗ nej');
    await answerNumeric(page, 'annat-startvarde', '8');
    await expect(page.locator('[data-question="annat-startvarde"]').getByText('Rätt!')).toBeVisible();
  });

  test('labb 14: stega Q-inlärning, frys och prov, dålig belöning @mobil', async ({ page }) => {
    await openLab(page, 'labb/lar-en-agent-med-beloning/');
    await next(page);
    await page.getByRole('button', { name: /Steg framåt/ }).click();
    await expect(page.getByTestId('q-status')).toContainText('0,00 → −0,50');
    await answerNumeric(page, 'forsta-q', '-0,5');
    await expect(page.locator('[data-question="forsta-q"]').getByText('Rätt!')).toBeVisible();
    await next(page, 2);
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await page.getByRole('button', { name: /Frys modellen/ }).click();
    await expect(page.getByTestId('prov-resultat')).toContainText('nådde laddstationen på 7 steg');
    await next(page);
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await page.getByRole('button', { name: /Frys modellen/ }).click();
    await expect(page.getByTestId('prov-resultat')).toContainText('nådde aldrig laddstationen');
  });

  test('labb 15: neuron med reglage och tränat nätverk', async ({ page }) => {
    await openLab(page, 'labb/oppna-ett-neuralt-natverk/');
    await next(page);
    const bias = page.getByLabel(/Bias b/);
    await bias.focus();
    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('neuron-resultat')).toContainText('4 av 4 rätt för OCH');
    await answerNumeric(page, 'z-och', '2');
    await expect(page.locator('[data-question="z-och"]').getByText(/biasen −1,5/)).toBeVisible();
    await next(page, 2);
    await expect(page.getByTestId('neuron-resultat')).not.toContainText('4 av 4');
    await next(page);
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('natverk-status')).toContainText('Epok 2000');
    await expect(page.getByTestId('natverk-status')).toContainText('(4 av 4 rätt), 0,250 för en ensam neuron');
    await answerNumeric(page, 'forlust-ensam', '0,25');
    await expect(page.locator('[data-question="forlust-ensam"]').getByText('Rätt!')).toBeVisible();
  });

  test('kunskapskontroll för kapitel 3: fel → förklaring → rätt', async ({ page }) => {
    await page.goto('kapitel/maskininlarning/');
    const q = page.locator('[data-question="k3-missade"]');
    await q.scrollIntoViewIfNeeded();
    await expect(q).toBeVisible();
    // Fyll i tills knappen blir aktiv (fungerar oavsett hur kontrollen laddas på klienten)
    await expect(async () => {
      await q.getByLabel('Ditt svar').fill('2');
      await expect(q.getByRole('button', { name: 'Kontrollera svaret' })).toBeEnabled({ timeout: 500 });
    }).toPass();
    await q.getByRole('button', { name: 'Kontrollera svaret' }).click();
    await expect(q.getByText(/2 är de falskt positiva/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'k3-missade', '3');
    await expect(q.getByText('Rätt!')).toBeVisible();
  });
});
