import { expect, test, type Page } from '@playwright/test';
import { answerChoice, answerNumeric, openLab, trackErrors } from './helpers';

const LAB = 'labb/vaxa-ett-beslutstrad/';
const next = async (page: Page, times = 1) => {
  for (let i = 0; i < times; i++) await page.getByRole('button', { name: /Gå vidare/ }).click();
};

test.describe('Extralabb 29: Väx ett beslutsträd @mobil', () => {
  test('förutsäg, bygg roten, fel → återkoppling → rätt, jämför, väx, djup, väg och omladdning', async ({ page }) => {
    const errors = trackErrors(page);
    await openLab(page, LAB);

    // Förutsäg
    await expect(page.getByTestId('traningsdata')).toContainText('Dag 13');
    await page.getByLabel('Vind ≥ 11 m/s?').check();
    await expect(page.getByText('Din förutsägelse: Vind ≥ 11 m/s?')).toBeVisible();
    await next(page);

    // Prova: förhandsvisningen är förladdad med Väder = regn?
    await expect(page.getByTestId('forhandsvisning')).toContainText('= 0,469');
    let q = await answerNumeric(page, 'gini-regn', '0,497');
    await expect(q.getByText('Inte riktigt.')).toBeVisible();
    await expect(q.getByText(/orenheten i roten innan du delar/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerNumeric(page, 'gini-regn', '0,469');
    await expect(q.getByText('Rätt!')).toBeVisible();

    await page.getByRole('button', { name: 'Ställ frågan ”Väder = regn?”' }).click();
    await expect(page.getByTestId('handtrad')).toContainText('Väder = regn?');
    await expect(page.getByTestId('handtrad-status')).toContainText('1 fråga');
    await expect(page.getByTestId('handtrad-status')).toContainText('15 av 24');

    // Omladdning: steg, svar och träd finns kvar
    await page.reload();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Steg 2 av 7/ })).toBeVisible();
    await expect(page.locator('[data-question="gini-regn"]').getByText('Rätt!')).toBeVisible();
    await expect(page.getByTestId('handtrad')).toContainText('Väder = regn?');

    // Jämför
    await next(page);
    await expect(page.getByTestId('jamfor-rot')).toContainText('Väder = regn? ger viktad Gini 0,469');
    await expect(page.getByTestId('jamfor-rot')).toContainText('Vind ≥ 11 m/s? ger 0,342');
    await expect(page.getByTestId('topplista')).toContainText('◀ ditt val');
    q = await answerChoice(page, 'varfor-vind', /vind är farligare/);
    await expect(q.getByText('Inte riktigt.')).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerChoice(page, 'varfor-vind', /lägst viktad Gini/);
    await expect(q.getByText('Rätt!')).toBeVisible();

    // Väx
    await next(page);
    await expect(page.getByTestId('vaxt-status')).toContainText('Bara roten');
    await page.getByRole('button', { name: /Steg framåt/ }).first().click();
    await expect(page.getByTestId('vaxt-status')).toContainText('Delning 1 av 6');
    await expect(page.getByTestId('vaxt-status')).toContainText('Vind ≥ 11 m/s?');
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('vaxt-status')).toContainText('Trädet har djup 4 och 7 löv');
    await answerChoice(page, 'ren-nod', /Noden är ren/);
    await expect(page.locator('[data-question="ren-nod"]').getByText('Rätt!')).toBeVisible();

    // Djup: testresultatet visas först efter förutsägelsen
    await next(page);
    await expect(page.getByTestId('djup-resultat')).toContainText('visas när du har gjort din förutsägelse');
    await page.getByLabel('Djup 2', { exact: true }).check();
    await page.getByLabel(/^Maxdjup/).fill('4');
    await expect(page.getByTestId('djup-resultat')).toContainText('Träning 24 av 24 (100 %), test 10 av 12 (83 %)');
    await page.getByLabel(/^Maxdjup/).fill('2');
    await expect(page.getByTestId('djup-resultat')).toContainText('Träning 20 av 24 (83 %), test 11 av 12 (92 %)');
    await answerChoice(page, 'overanpassning', /lärt sig undantag/);
    await expect(page.locator('[data-question="overanpassning"]').getByText('Rätt!')).toBeVisible();

    // Väg
    await next(page);
    await expect(page.getByTestId('vag-status')).toContainText('Fråga 1: Vind ≥ 11 m/s?');
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('vag-status')).toContainText('Lövet svarar: ✗ inställd');
    await expect(page.getByTestId('vag-trad').locator('[data-path="nnj"]')).toContainText('◀ här');
    expect(errors).toEqual([]);
  });
});

test.describe('Extralabb 29: tangentbord och experimentläge', () => {
  test('välj fråga och dela en gren med enbart tangentbord', async ({ page }) => {
    await openLab(page, LAB);
    await next(page);
    // Byt frågetyp med piltangenter i knappraden (Väder → Temperatur → Vind)
    await page.getByRole('radio', { name: /^(✓ )?Väder$/ }).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: /^(✓ )?Vind$/ })).toBeChecked();
    const sel = page.getByLabel('Vind ≥ … m/s?');
    await sel.focus();
    await sel.selectOption('11');
    await expect(page.getByTestId('forhandsvisning')).toContainText('= 0,342');
    const apply = page.getByRole('button', { name: 'Ställ frågan ”Vind ≥ 11 m/s?”' });
    await apply.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('handtrad')).toContainText('Vind ≥ 11 m/s?');

    // Välj nej-grenen med tangentbordet och dela den
    const pick = page.getByRole('button', { name: 'Dela noden nej' });
    await pick.focus();
    await page.keyboard.press('Enter');
    await expect(pick).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('radio', { name: /^(✓ )?Vind$/ }).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('radio', { name: /^(✓ )?Temperatur$/ })).toBeChecked();
    await page.getByLabel('Temperatur ≥ … °C?').selectOption('4');
    await page.getByRole('button', { name: 'Ställ frågan ”Temperatur ≥ 4 °C?”' }).press('Enter');
    await expect(page.getByTestId('handtrad').locator('[data-path="n"]')).toContainText('Temperatur ≥ 4 °C?');
    await expect(page.getByTestId('handtrad-status')).toContainText('2 frågor');
    await expect(page.getByTestId('handtrad-status')).toContainText('20 av 24');

    // Ta bort frågan i roten tar bort hela trädet
    await page.getByRole('button', { name: 'Ta bort frågan i roten' }).press('Enter');
    await expect(page.getByTestId('handtrad-status')).toContainText('bara en rot');
  });

  test('experimentläge: egen dag, djup 0 och tom gren', async ({ page }) => {
    const errors = trackErrors(page);
    await openLab(page, LAB);
    await page.getByRole('radio', { name: 'Experiment' }).check({ force: true });
    await page.getByLabel(/^Maxdjup/).fill('0');
    await expect(page.getByTestId('djup-resultat')).toContainText('Djup 0: 1 löv. Träning 13 av 24 (54 %), test 7 av 12 (58 %)');
    await expect(page.getByTestId('vag-status')).toContainText('Lövet svarar: ✓ genomförs');
    await page.getByLabel(/^Maxdjup/).fill('4');
    await page.getByLabel('Vind (m/s)').fill('15');
    await expect(page.getByTestId('vag-status')).toContainText('Fråga 1: Vind ≥ 11 m/s? Här är vinden 15 m/s, så svaret är ja');

    // Tom gren i handbygget
    await page.getByRole('radio', { name: /^(✓ )?Vind$/ }).first().check({ force: true });
    await page.getByLabel('Vind ≥ … m/s?').selectOption('11');
    await page.getByRole('button', { name: 'Ställ frågan ”Vind ≥ 11 m/s?”' }).click();
    await page.getByRole('button', { name: 'Dela noden ja' }).click();
    await page.getByLabel('Vind ≥ … m/s?').selectOption('2');
    await expect(page.getByTestId('forhandsvisning')).toContainText('Frågan delar inte');
    await page.getByRole('button', { name: 'Ställ frågan ”Vind ≥ 2 m/s?”' }).click();
    await expect(page.getByTestId('handtrad').locator('[data-path="jn"]')).toContainText('0 dagar – svaret ärvs från föräldern');
    expect(errors).toEqual([]);
  });
});
