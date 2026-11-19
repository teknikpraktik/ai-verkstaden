import { expect, test, type Page } from '@playwright/test';
import { answerChoice, answerNumeric, openLab, trackErrors } from './helpers';

const next = (page: Page) => page.getByRole('button', { name: /Gå vidare/ }).click();

test.describe('Kapitel 6: kärnlabb 23 Bedöm en rättvisekonflikt @mobil', () => {
  test('förutsäg, läs av, fel → återkoppling → rätt, ändra tröskel och progression efter omladdning', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('kapitel/etik/');
    await page.getByRole('link', { name: /Bedöm en rättvisekonflikt/ }).first().click();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();

    // Förutsäg
    await page.locator('[data-question="gissa-grupp"]').getByLabel('Område Söder').check();
    await next(page);

    // Kontrollerat resultat vid tröskel 50
    await expect(page.getByTestId('resultat-soder')).toContainText('14 av 24 (58 %)');
    await expect(page.getByTestId('resultat-norr')).toContainText('1 av 32 (3 %)');

    // Fel svar → förklaring → nytt försök → rätt
    let q = await answerNumeric(page, 'fp-soder', '24');
    await expect(q.getByText('Inte riktigt.')).toBeVisible();
    await expect(q.getByText(/alla korrekta ansökningar i Söder/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerNumeric(page, 'fp-soder', '14');
    await expect(q.getByText('Rätt!')).toBeVisible();

    // Ett steg till: tröskel 60 och jämförelsetabell
    await next(page);
    await expect(page.getByTestId('jamforelse')).toContainText('3 av 8 (38 %)');
    await answerNumeric(page, 'fn-norr', '3');
    await expect(page.locator('[data-question="fn-norr"]').getByText('Rätt!')).toBeVisible();

    // Eget reglage
    await next(page);
    await page.getByLabel(/^Tröskel/).fill('70');
    await expect(page.getByTestId('resultat-soder')).toContainText('9 av 16');

    // Progression efter omladdning
    await page.reload();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Steg 4 av 5/ })).toBeVisible();
    await expect(page.getByTestId('resultat-norr')).toContainText('6 av 8');
    expect(errors).toEqual([]);
  });
});

test.describe('Kapitel 6: övriga labbar', () => {
  test('labb 22: klick ändrar flödet och jämförelsen ger 1 mot 5 ämnen', async ({ page }) => {
    await openLab(page, 'labb/bygg-ett-rekommendationsflode/');
    await page.getByRole('list', { name: 'Flödet just nu' }).getByRole('button').first().click();
    await expect(page.getByRole('status').filter({ hasText: '1 klick.' })).toBeVisible();
    await expect(page.getByTestId('insamlat')).toContainText('4 (vilka och i vilken ordning)');
    await next(page);
    await next(page);
    await expect(page.getByTestId('jamforelse')).toContainText('1 av 6');
    await expect(page.getByTestId('jamforelse')).toContainText('5 av 6');
    const q = await answerNumeric(page, 'antal-amnen', '4');
    await expect(q.getByText(/innan robot-eleven hade klickat/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'antal-amnen', '1');
    await expect(q.getByText('Rätt!')).toBeVisible();
  });

  test('labb 24: minimera uppgifterna och få återkoppling', async ({ page }) => {
    await openLab(page, 'labb/vilka-uppgifter-behover-systemet/');
    await expect(page.getByTestId('status')).toContainText('9 av 12 uppgifter valda');
    await expect(page.getByTestId('status')).toContainText('9 problem');
    await next(page);
    await page.locator('[data-field="stod"] input[type="checkbox"]').uncheck();
    await expect(page.getByTestId('status')).toContainText('8 av 12');
    await expect(page.getByTestId('aterkoppling')).not.toContainText('Diagnos eller stödbehov');
    const q = await answerChoice(page, 'nodvandiga', 'Namn');
    await expect(q.getByText(/Ett slumpat id räcker/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await q.getByLabel('Pseudonymt elev-id').check();
    await q.getByLabel('Svar på övningar').check();
    await q.getByRole('button', { name: 'Kontrollera svaret' }).click();
    await expect(q.getByText('Rätt!')).toBeVisible();
  });

  test('labb 25: referensdatum, klassning med återkoppling och ett faktum som ändrar bedömningen', async ({ page }) => {
    await openLab(page, 'labb/hur-regleras-ett-ai-system/');
    await expect(page.locator('.lab-root').getByText('Referensdatum: 2026-11-19.')).toBeVisible();
    await expect(page.getByText(/inte juridisk rådgivning/).first()).toBeVisible();
    await next(page);
    let q = await answerChoice(page, 'klass-kanslo', /^Högrisksystem/);
    await expect(q.getByText(/förbjudna enligt art\. 5\.1 f/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerChoice(page, 'klass-kanslo', /^Förbjuden användning/);
    await expect(q.getByText('Rätt!')).toBeVisible();
    await next(page);
    await next(page);
    await expect(page.getByTestId('variant-klass')).toContainText('Det behövs mer information');
    await page.getByRole('radio', { name: 'Ja', exact: true }).check({ force: true });
    await expect(page.getByTestId('variant-klass')).toContainText('Högrisksystem');
    await answerChoice(page, 'klass-vagledning', /^Det behövs mer information/);
    await expect(page.locator('[data-question="klass-vagledning"]').getByText('Rätt!')).toBeVisible();
  });

  test('labb 26: roll, konsekvenser, fel → rätt och exempelresonemang efter eget beslut', async ({ page }) => {
    await openLab(page, 'labb/besluta-om-ett-framtida-ai-system/');
    await page.getByLabel('Din roll').selectOption('mentor');
    await expect(page.getByText(/har begränsad tid/)).toBeVisible();
    await next(page);
    await expect(page.getByTestId('sammanfattning')).toContainText('16 av 20');
    const q = await answerNumeric(page, 'felkontakter', '40');
    await expect(q.getByText(/alla som systemet markerar/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'felkontakter', '24');
    await expect(q.getByText('Rätt!')).toBeVisible();
    await next(page);
    await expect(page.getByTestId('jamforelse')).toContainText('6 av 180');
    await next(page);
    await next(page);
    await expect(page.getByTestId('exempel-last')).toBeVisible();
    const text = Array.from({ length: 45 }, (_, i) => `ord${i}`).join(' ');
    await page.locator('[data-question="motivera-beslut"] textarea').fill(text);
    await page.getByRole('button', { name: /Visa exempelresonemang/ }).click();
    await expect(page.getByTestId('exempel')).toContainText('Pilot med villkor');
  });

  test('kapitlets kunskapskontroll: fel nämnare ger förklaring', async ({ page }) => {
    await page.goto('kapitel/etik/');
    const box = page.locator('[data-question="etik-namnare"]');
    await box.scrollIntoViewIfNeeded();
    const q = await answerNumeric(page, 'etik-namnare', '15');
    await expect(q.getByText(/alla 40 ansökningar/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'etik-namnare', '25');
    await expect(q.getByText('Rätt!')).toBeVisible();
  });
});
