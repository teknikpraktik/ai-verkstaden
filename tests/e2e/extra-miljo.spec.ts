import { expect, test, type Page } from '@playwright/test';
import { answerChoice, answerNumeric, openLab, trackErrors } from './helpers';

const next = (page: Page) => page.getByRole('button', { name: /Gå vidare/ }).click();
const LAB = 'labb/vad-kostar-ai-for-miljon/';

test.describe('Extralabb 30: Vad kostar AI för miljön? @mobil', () => {
  test('förutsäg, ändra frågor, enhetsfel → återkoppling → rätt, ett antagande i taget och progression efter omladdning', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('kapitel/etik/');
    await page
      .getByRole('link', { name: /Vad kostar AI för miljön/ })
      .first()
      .click();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();

    // Förutsäg
    await expect(page.getByTestId('sammanfattning')).toContainText(/936 kWh och 84 kg CO₂e/);
    await page.locator('[data-question="gissa-bil"]').getByLabel('Några hundra km').check();
    await next(page);

    // Prova: fler frågor ger mer energi
    await expect(page.getByTestId('jamforelser')).toContainText(/562 km/);
    await page.getByLabel(/^Frågor per elev och skoldag/).fill('20');
    await expect(page.getByTestId('sammanfattning')).toContainText(/1\s656 kWh/);

    // Fel svar (Wh i stället för kWh) → förklaring → nytt försök → rätt
    let q = await answerNumeric(page, 'kwh-per-dag', '3000');
    await expect(q.getByText('Inte riktigt.')).toBeVisible();
    await expect(q.getByText(/1 kWh = 1 000 Wh/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerNumeric(page, 'kwh-per-dag', '3');
    await expect(q.getByText('Rätt!')).toBeVisible();
    await next(page);

    // Träning mot användning
    await expect(page.getByTestId('traning-tabell')).toContainText('10 000 Wh');
    q = await answerChoice(page, 'traning-eller-anvandning', 'Träningen');
    await expect(q.getByText(/tre gånger större/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerChoice(page, 'traning-eller-anvandning', 'Användningen');
    await expect(q.getByText('Rätt!')).toBeVisible();
    await next(page);

    // Ett antagande i taget
    await expect(page.getByTestId('kanslighet').locator('tbody tr').first()).toContainText('Elmixen');
    await expect(page.getByTestId('sammanfattning')).toContainText(/197 kg CO₂e/);
    await page.getByLabel(/^Lågt: 20 g/).check({ force: true });
    await expect(page.getByTestId('sammanfattning')).toContainText(/19 kg CO₂e/);
    q = await answerChoice(page, 'vilket-antagande', 'Energi per fråga');
    await expect(q.getByText(/kan skilja tio gånger/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerChoice(page, 'vilket-antagande', 'Elmixen (utsläpp per kWh)');
    await expect(q.getByText('Rätt!')).toBeVisible();
    await next(page);

    // Rekyleffekt och nytta
    await expect(page.getByTestId('nytta')).toContainText(/minskar med 2\s910 kg/);
    q = await answerNumeric(page, 'rekyl', '90');
    await expect(q.getByText(/användningen ökade åtta gånger/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerNumeric(page, 'rekyl', '720');
    await expect(q.getByText('Rätt!')).toBeVisible();
    await next(page);

    // Förklara: egna inställningar och ställningstagande
    await page.getByLabel('Modell', { exact: true }).selectOption('liten');
    await expect(page.getByTestId('sammanfattning')).toContainText(/Huvudberäkning: 308 kWh/);
    await page.locator('[data-question="vag-nytta"] textarea').fill('Ja med villkor: ca 84 kg CO₂e per år, men licensen kostar 400 000 kr.');

    // Progression efter omladdning
    await page.reload();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Steg 6 av 6/ })).toBeVisible();
    await expect(page.getByTestId('sammanfattning')).toContainText(/Huvudberäkning: 308 kWh/);
    await expect(page.locator('[data-question="vag-nytta"] textarea')).toHaveValue(/licensen kostar/);
    await page.getByRole('button', { name: /Tillbaka/ }).click();
    await expect(page.locator('[data-question="rekyl"]').getByText('Rätt!')).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test('Extralabb 30: experimentläget visar alla reglage och klarar noll användning', async ({ page }) => {
  await openLab(page, LAB);
  await page.getByRole('radio', { name: 'Experiment' }).check({ force: true });
  await page.getByLabel(/^Frågor per elev och skoldag/).fill('0');
  await page.getByLabel(/^Bilder per elev och vecka/).fill('0');
  await expect(page.getByTestId('sammanfattning')).toContainText(/0 kWh och 0 kg/);
  await page.getByLabel('Var körs modellen?').selectOption('varlden');
  await page.getByRole('button', { name: 'Återställ huvudscenariot' }).click();
  await expect(page.getByTestId('sammanfattning')).toContainText(/936 kWh/);
  await page.getByLabel('Var körs modellen?').selectOption('varlden');
  await expect(page.getByTestId('sammanfattning')).toContainText(/440 kg CO₂e/);
  await expect(page.getByTestId('kanslighet').locator('tbody tr').first()).toContainText(/träningen|livstid/);
});
