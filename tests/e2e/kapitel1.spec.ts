import { expect, test, type Page } from '@playwright/test';
import { answerChoice, answerNumeric, openLab, trackErrors } from './helpers';

const next = (page: Page) => page.getByRole('button', { name: /Gå vidare/ }).click();

test.describe('Kapitel 1 @mobil', () => {
  test('labb 1: förutsäg, sortera, fel → återkoppling → rätt, gränsfall och människa mot modell', async ({ page }) => {
    const errors = trackErrors(page);
    await openLab(page, 'labb/ar-det-ai/');
    await page.getByLabel('3–5').check();
    await next(page);

    const termostat = page.locator('[data-system="termostat"]');
    await termostat.getByLabel('Fasta regler').check({ force: true });
    await page.locator('[data-system="dorr"]').getByLabel('Lärande system').check({ force: true });
    let q = await answerChoice(page, 'ledtrad', /Det har en sensor/);
    await expect(q.getByText('Inte riktigt.')).toBeVisible();
    await expect(q.getByText(/automatiska dörren har en sensor/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerChoice(page, 'ledtrad', /tränats på exempel/);
    await expect(q.getByText('Rätt!')).toBeVisible();

    await next(page);
    await expect(page.getByTestId('bedomning-termostat')).toContainText('✓ Välmotiverat');
    await expect(page.getByTestId('bedomning-dorr')).toContainText('✗ Svårt att motivera');
    q = await answerNumeric(page, 'antal-gransfall', '9');
    await expect(q.getByText(/Alla nio har minst ett/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'antal-gransfall', '3');
    await expect(q.getByText('Rätt!')).toBeVisible();

    await next(page);
    await next(page);
    await page.getByRole('radio', { name: 'Skräppost på engelska' }).check({ force: true });
    await expect(page.getByTestId('filter-resultat')).toContainText('poäng 0');
    await page.getByRole('radio', { name: 'Mejl från din mentor' }).check({ force: true });
    await expect(page.getByTestId('filter-resultat')).toContainText('Skräppost – stoppas (poäng 4)');

    // progression efter omladdning
    await page.reload();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Steg 5 av 7/ })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('labb 4: kör modellen, felandel med nämnare och ändrat urval', async ({ page }) => {
    await openLab(page, 'labb/vem-far-fel-svar/');
    await page.getByRole('radio', { name: 'Söderby' }).check();
    await next(page);
    await page.getByRole('button', { name: 'Kör modellen på testdata' }).click();
    await expect(page.getByTestId('fel-norrby')).toHaveText('0 av 40 (0 %)');
    await expect(page.getByTestId('fel-söderby')).toHaveText('5 av 10 (50 %)');
    await expect(page.getByTestId('fel-totalt')).toHaveText('5 av 50 (10 %)');
    const q = await answerNumeric(page, 'soderby-felandel', '10');
    await expect(q.getByText(/alla 50 svar tillsammans/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'soderby-felandel', '50');
    await expect(q.getByText('Rätt!')).toBeVisible();

    await next(page);
    await next(page);
    await expect(page.getByTestId('modellforklaring')).toContainText('3,65 mm');
    await next(page);
    await page.getByRole('radio', { name: '48 från Norrby', exact: true }).check({ force: true });
    await expect(page.getByTestId('fel-söderby')).toHaveText('5 av 10 (50 %)');
    await page.getByRole('radio', { name: '12 från Norrby + 12 från Söderby' }).check({ force: true });
    await expect(page.getByTestId('fel-söderby')).toHaveText('0 av 10 (0 %)');
    await expect(page.getByTestId('modellforklaring')).toContainText('4,85 mm');
    await answerNumeric(page, 'procentenheter', '50');
    await expect(page.locator('[data-question="procentenheter"]').getByText('Rätt!')).toBeVisible();
  });
});

test.describe('Kapitel 1 på dator', () => {
  test('labb 2: ordna milstolpar med knappar och tangentbord, ledtråd och rätt ordning', async ({ page }) => {
    await openLab(page, 'labb/fran-expertregler-till-stora-modeller/');
    await page.getByLabel('På 1950-talet').check();
    await next(page);
    await page.getByRole('button', { name: 'Kontrollera ordningen' }).click();
    await expect(page.getByTestId('ordning-resultat')).toContainText('0 av 8 står på rätt plats');
    await expect(page.getByTestId('ordning-resultat')).toContainText('Ledtråd');

    // Flytta med tangentbordet: fokus på knappen och Enter
    const up = page.getByRole('button', { name: 'Flytta upp Mötet i Dartmouth' });
    await up.focus();
    for (let i = 0; i < 4; i++) await page.keyboard.press('Enter');
    await expect(page.locator('[data-milestone]').first()).toHaveAttribute('data-milestone', 'dartmouth');
    // fokus följer med den flyttade milstolpen
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', /Mötet i Dartmouth/);

    const target = ['dartmouth', 'eliza', 'expertsystem', 'deepblue', 'alexnet', 'alphago', 'transformer', 'chatgpt'];
    for (let i = 0; i < target.length; i++) {
      const ids = await page.locator('ol[aria-label="Milstolpar, äldst först"] > li').evaluateAll((els) => els.map((e) => e.getAttribute('data-milestone')));
      const at = ids.indexOf(target[i]!);
      const li = page.locator(`ol[aria-label="Milstolpar, äldst först"] > li[data-milestone="${target[i]}"]`);
      for (let k = at; k > i; k--) await li.getByRole('button', { name: /Flytta upp/ }).click();
    }
    await page.getByRole('button', { name: 'Kontrollera ordningen' }).click();
    await expect(page.getByTestId('ordning-resultat')).toContainText('Rätt ordning');

    await next(page);
    await expect(page.getByTestId('tidslinje')).toContainText('november 2022');
    const q = await answerNumeric(page, 'antal-ar', '56');
    await expect(q.getByText(/tiden från ELIZA/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'antal-ar', '66');
    await expect(q.getByText('Rätt!')).toBeVisible();
  });

  test('labb 3: begrepp, insamling från samma urval och redigering i experimentläget', async ({ page }) => {
    const errors = trackErrors(page);
    await openLab(page, 'labb/vad-finns-i-datamangden/');
    await next(page);
    await expect(page.getByTestId('inspektor')).toContainText('äpple nr 8');
    const q = await answerChoice(page, 'vad-ar-etikett', /4 fläckar/);
    await expect(q.getByText(/egenskap/).first()).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerChoice(page, 'vad-ar-etikett', 'Att det kasseras');
    await expect(q.getByText('Rätt!')).toBeVisible();

    await next(page);
    await page.getByTestId('inspektor').getByLabel('Visa bilden som tal').check();
    await expect(page.getByTestId('inspektor').getByText('Varje tal är en pixel')).toBeVisible();

    await next(page);
    await answerNumeric(page, 'andel-kasseras', '15');
    await expect(page.locator('[data-question="andel-kasseras"]').getByText('Rätt!')).toBeVisible();
    await next(page);
    await page.getByRole('button', { name: 'Samla in 20 äpplen från gård A' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Datamängden har 40 äpplen: 6 kasseras, 0 gröna' })).toBeVisible();
    await answerNumeric(page, 'grona-efter', '0');
    await expect(page.locator('[data-question="grona-efter"]').getByText('Rätt!')).toBeVisible();

    // Experimentläge: ändra etikett och töm datamängden
    await page.getByRole('radio', { name: 'Experiment' }).check({ force: true });
    await page.getByRole('button', { name: 'Visa äpple nr 1', exact: true }).click();
    await page.getByRole('group', { name: 'Etikett' }).getByRole('radio', { name: 'kasseras' }).check({ force: true });
    await expect(page.getByRole('status').filter({ hasText: '4 kasseras' })).toBeVisible();
    for (let i = 0; i < 20; i++) await page.getByRole('button', { name: /^Ta bort äpple nr/ }).click();
    await expect(page.getByTestId('tom')).toBeVisible();
    await expect(page.getByText('Datamängden är tom – det finns inget att lära sig av.')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('kunskapskontroll för kapitel 1', async ({ page }) => {
    await page.goto('kapitel/introduktion/');
    // kontrollen renderas i webbläsaren (client:only)
    const q = page.locator('[data-question="k1-felandel"]');
    await q.scrollIntoViewIfNeeded();
    await q.getByLabel('Ditt svar').fill('6');
    await q.getByRole('button', { name: 'Kontrollera svaret' }).click();
    await expect(q.getByText(/antalet testade i grupp B/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await q.getByLabel('Ditt svar').fill('30');
    await q.getByRole('button', { name: 'Kontrollera svaret' }).click();
    await expect(q.getByText('Rätt!')).toBeVisible();
  });
});
