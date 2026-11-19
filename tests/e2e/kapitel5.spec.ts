import { expect, test, type Page } from '@playwright/test';
import { answerChoice, answerNumeric, openLab, trackErrors } from './helpers';

const L19 = 'labb/styr-en-robot/';
const L20 = 'labb/hitta-fram-nar-kartan-forandras/';
const L21 = 'labb/valj-robot-for-ett-uppdrag/';

async function next(page: Page, times = 1) {
  for (let i = 0; i < times; i++) await page.getByRole('button', { name: /Gå vidare/ }).click();
}
async function pick(page: Page, name: string | RegExp) {
  await page.getByRole('radio', { name }).check({ force: true });
}

test.describe('Kapitel 5 Robotik @mobil', () => {
  test('labb 19: förutsäg, stega kedjan, fel → återkoppling → rätt, brus och progression', async ({ page }) => {
    const errors = trackErrors(page);
    await openLab(page, L19);

    // Förutsäg
    await page.getByLabel('Inte en enda gång').check();
    await next(page);
    await expect(page.getByText(/Du trodde: inga krockar/)).toBeVisible();

    // Stega 8 steg och läs kedjan sensor → program → motor → konsekvens
    const forward = page.getByRole('button', { name: /Steg framåt/ });
    for (let i = 0; i < 8; i++) await forward.click();
    const chain = page.getByTestId('kedja');
    await expect(chain).toContainText('0 rutor');
    await expect(chain).toContainText('0 < 1 → sväng höger');
    await expect(chain).toContainText('vänder sig nedåt');
    await expect(page.getByTestId('logg').locator('tbody tr')).toHaveCount(8);

    // Fel svar ger förklaring, nytt försök ger rätt
    let q = await answerChoice(page, 'kedja-steg8', /Sensorn vände roboten/);
    await expect(q.getByText('Inte riktigt.')).toBeVisible();
    await expect(q.getByText(/Sensorn mäter bara/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerChoice(page, 'kedja-steg8', /Programmet jämförde 0 < 1/);
    await expect(q.getByText('Rätt!')).toBeVisible();

    // Kontrollerat resultat: 0 krockar på 30 steg
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('resultat')).toContainText('Krockar: 0');
    await expect(page.getByTestId('resultat')).toContainText('Besökta rutor: 22');

    // Brus: samma slumpföljd, bara gränsen ändras
    await next(page, 4);
    await expect(page.getByRole('heading', { name: /Steg 6 av 7/ })).toBeVisible();
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('resultat')).toContainText('Krockar: 3');
    await expect(page.getByTestId('jamforelse')).toContainText('Brus, gräns 2');
    q = await answerNumeric(page, 'brus-krockar', '7');
    await expect(q.getByText(/antalet felaktiga mätvärden/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'brus-krockar', '3');
    await expect(q.getByText('Rätt!')).toBeVisible();
    await pick(page, 'Brus, gräns 2');
    await expect(page.getByTestId('resultat')).toContainText('Krockar: 0');

    // Progression efter omladdning
    await page.reload();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Steg 6 av 7/ })).toBeVisible();
    await expect(page.locator('[data-question="brus-krockar"]').getByText('Rätt!')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('labb 20: stopp och omplanering i lagret, fel → rätt', async ({ page }) => {
    await openLab(page, L20);
    await next(page);
    const forward = page.getByRole('button', { name: /Steg framåt/ });
    await forward.click();
    await forward.click();
    await expect(page.getByRole('status').filter({ hasText: 'Stopp:' })).toContainText('hinder i F5');
    await forward.click();
    await expect(page.getByRole('status').filter({ hasText: 'Planerar om:' })).toContainText('ny väg på 14 steg');
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('resultat')).toContainText('Körda steg: 15');
    await expect(page.getByTestId('slutsats')).toContainText('hade det räckt med 13 steg');
    const q = await answerNumeric(page, 'pall-steg', '5');
    await expect(q.getByText(/första planen/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'pall-steg', '15');
    await expect(q.getByText('Rätt!')).toBeVisible();
    // Räckvidd: en parameter i taget
    await next(page);
    await expect(page.getByTestId('jamforelse')).toContainText('17');
    await pick(page, '3 rutor');
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('resultat')).toContainText('Körda steg: 13');
  });

  test('labb 21: regn i odlingen och omsorgens regler', async ({ page }) => {
    await openLab(page, L21);
    await next(page, 3);
    await expect(page.getByRole('heading', { name: /Ogräsrensning i regn/ })).toBeVisible();
    await expect(page.getByTestId('utfall')).toContainText('Övertaganden: 9');
    const q = await answerNumeric(page, 'regn-overtaganden', '8');
    await expect(q.getByText(/något mer händer/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'regn-overtaganden', '9');
    await expect(q.getByText('Rätt!')).toBeVisible();

    await next(page);
    await pick(page, '+ närhetssensor');
    const outcome = page.getByTestId('utfall');
    await expect(outcome).toContainText('Säkerhetsrisk');
    await expect(outcome).toContainText('fick vänta på hjälp');
    await pick(page, '+ närhet + larmvillkor');
    await expect(outcome).toContainText('Klart med mänsklig hjälp');
    await expect(outcome).toContainText('Personaltid: 10 min');
    await answerChoice(page, 'omsorg-varfor', /En boende som kände sig yr/);
    await expect(page.locator('[data-question="omsorg-varfor"]').getByText('Rätt!')).toBeVisible();
  });
});

test.describe('Kapitel 5 på dator', () => {
  test('labb 19: ställ ut ett hinder med tangentbordet i experimentläget', async ({ page }) => {
    await openLab(page, L19);
    await page.getByRole('radio', { name: 'Experiment' }).check({ force: true });
    await expect(page.getByRole('heading', { name: 'Bygg din robot' })).toBeVisible();
    const grid = page.getByRole('grid');
    await grid.getByRole('gridcell').first().focus();
    // från A1 till D2: ned 1, höger 3
    await page.keyboard.press('ArrowDown');
    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', /^D2/);
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-cell="1-3"]')).toHaveAttribute('aria-label', /hinder/);
    await page.getByRole('button', { name: /Steg framåt/ }).click();
    await expect(page.getByTestId('kedja')).toContainText('1 ruta');
  });

  test('labb 21: lidar i experimentläget klarar mörkret', async ({ page }) => {
    await openLab(page, L21);
    await page.getByRole('radio', { name: 'Experiment' }).check({ force: true });
    await page.getByRole('checkbox', { name: 'Mörker' }).check();
    await expect(page.getByTestId('utfall')).toContainText('Uppdraget blev inte utfört');
    await page.getByRole('checkbox', { name: 'Lidar (laseravståndsmätare)' }).check();
    await expect(page.getByTestId('utfall')).toContainText('Klart med mänsklig hjälp');
    await expect(page.getByTestId('regler')).toContainText('(används nu)');
  });

  test('kunskapskontrollen för kapitel 5', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('kapitel/robotik/');
    await expect(page.getByRole('heading', { level: 1, name: 'Robotik' })).toBeVisible();
    const q = page.locator('[data-question="k5-omplanering"]');
    await q.scrollIntoViewIfNeeded();
    // vänta tills kontrollen är hydrerad (client:visible): knappen aktiveras när fältet har ett tal
    await expect(async () => {
      await q.getByLabel('Ditt svar').fill('');
      await q.getByLabel('Ditt svar').fill('15');
      await expect(q.getByRole('button', { name: 'Kontrollera svaret' })).toBeEnabled({ timeout: 500 });
    }).toPass();
    await answerNumeric(page, 'k5-omplanering', '15');
    await expect(q.getByText(/inte hela den första planen/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'k5-omplanering', '11');
    await expect(q.getByText('Rätt!')).toBeVisible();
    expect(errors).toEqual([]);
  });
});
