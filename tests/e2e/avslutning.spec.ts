import { expect, test } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { openLab, trackErrors } from './helpers';

const PROJECT = 'projekt/granska-ett-ai-system/';
const labIds = readdirSync(new URL('../../src/labs/', import.meta.url));
const chapterIds = ['introduktion', 'sokning', 'maskininlarning', 'sprak', 'robotik', 'etik'];

test.describe('Slutprojektet @mobil', () => {
  test('välj problem, fyll i, välj belägg, granskningslistan uppdateras och allt finns kvar efter omladdning', async ({ page }) => {
    const errors = trackErrors(page);
    await openLab(page, PROJECT);
    await expect(page.getByTestId('projekt-status')).toContainText('0 av 10');

    // Steg 1: problem
    await page.getByLabel(/Prognos för matsvinn/).check();
    await expect(page.getByTestId('projekt-status')).toContainText('1 av 10');
    await page.getByRole('button', { name: /Gå vidare/ }).click();

    // Steg 2: mål och data
    await expect(page.getByRole('heading', { name: /Steg 2 av 7/ })).toBeFocused();
    await page.getByTestId('falt-mal').fill('Minska matsvinnet med en fjärdedel utan att någon elev blir utan lunch.');
    await page.getByLabel('Vilka påverkas av systemet?').fill('Elever, kökspersonal och skolans ekonomi.');
    await page.getByTestId('falt-data').fill('Antal ätande per dag i två år, veckodag, meny och lovdagar. Inga uppgifter om enskilda elever.');
    await page.getByRole('button', { name: /Gå vidare/ }).click();

    // Steg 3: metod (förvald utifrån problemet)
    await expect(page.getByLabel(/Regression \(förutsäga ett tal\)/)).toBeChecked();
    await page.getByTestId('falt-metod').fill('Vi vill förutsäga ett tal, nämligen antalet portioner.');
    await page.getByRole('button', { name: /Gå vidare/ }).click();

    // Steg 4: belägg
    await page.getByLabel(/Labb 11\. Förutsäg ett tal/).check();
    await expect(page.getByText('Du har valt 1 labb – minst 2 behövs.')).toBeVisible();
    await page.getByLabel('Vad visar labb 11 om ditt system?').fill('Hur stora felen i prognosen blir.');
    await page.getByLabel(/Labb 12\. Träna, välj och testa/).check();
    await page.getByLabel('Vad visar labb 12 om ditt system?').fill('Att modellen måste testas på nya veckor.');
    await expect(page.getByText('Du har valt 2 labbar.')).toBeVisible();

    // Granskningslistan visar vad som saknas
    await page.getByRole('button', { name: /6\. Slutsats och granskningslista/ }).click();
    const status = page.getByTestId('fullstandighet');
    await expect(status).toContainText('6 av 10');
    await expect(status).toContainText('fel, risker, mänsklig insyn, rekommendation');
    await expect(page.locator('[data-check="evidence"]')).toContainText('klar');
    await expect(page.locator('[data-check="errors"]')).toContainText('saknas');

    // Gå till det som saknas via listan
    await page.locator('[data-check="errors"]').getByRole('button', { name: /Gå till steg 5/ }).click();
    await page.getByTestId('falt-fel').fill('För låg prognos gör att elever blir utan mat, för hög ger mer svinn.');
    await page.getByRole('button', { name: /6\. Slutsats/ }).click();
    await expect(status).toContainText('7 av 10');

    // Omladdning: allt finns kvar
    await page.reload();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Steg 6 av 7/ })).toBeVisible();
    await expect(page.getByTestId('fullstandighet')).toContainText('7 av 10');
    await page.getByRole('button', { name: /2\. Mål och data/ }).click();
    await expect(page.getByTestId('falt-mal')).toHaveValue(/Minska matsvinnet/);

    // Rapporten
    await page.getByRole('button', { name: /7\. Rapport/ }).click();
    const report = page.getByTestId('rapport');
    await expect(report).toBeVisible();
    await expect(report).toContainText('Granskning: Prognos för matsvinn i skolmatsalen');
    await expect(report).toContainText('Minska matsvinnet med en fjärdedel');
    await expect(report).toContainText('Labb 11, Förutsäg ett tal: Hur stora felen i prognosen blir.');
    await expect(report).toContainText('För låg prognos gör att elever blir utan mat');
    await expect(page.getByRole('button', { name: /Skriv ut rapport/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Ladda ner som textfil/ })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('textfil laddas ner och utskriftsvyn visar bara rapporten', async ({ page }) => {
    await openLab(page, PROJECT);
    await page.getByLabel(/Leveransrobot i ett sjukhus/).check();
    await page.getByRole('button', { name: /7\. Rapport/ }).click();

    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: /Ladda ner som textfil/ }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe('granskning-leveransrobot-i-ett-sjukhus.txt');

    // Rapporten finns i utskriften även från ett annat steg
    await page.getByRole('button', { name: /1\. Välj problem/ }).click();
    await expect(page.getByTestId('rapport')).toBeHidden();
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByTestId('rapport')).toBeVisible();
    await expect(page.getByTestId('rapport')).toContainText('Leveransrobot i ett sjukhus');
    await expect(page.getByRole('heading', { name: /Steg 1 av 7/ })).toBeHidden();
    await expect(page.getByRole('heading', { level: 2, name: 'Mål' })).toBeHidden();
    await expect(page.locator('.site-header')).toBeHidden();
  });

  test('kontrollfrågan om mänsklig insyn ger förklarad återkoppling', async ({ page }) => {
    await openLab(page, PROJECT);
    await page.getByRole('button', { name: /5\. Fel, risker och insyn/ }).click();
    const q = page.locator('[data-question="insyn-kontroll"]');
    await q.getByLabel('Människa övervakar').check();
    await q.getByRole('button', { name: 'Kontrollera svaret' }).click();
    await expect(q.getByText(/fattar handläggaren varje beslut själv/)).toBeVisible();
  });
});

test.describe('Reflektion @mobil', () => {
  test('ett svar sparas efter omladdning och labbar länkas', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('reflektion/');
    const field = page.getByLabel(/Vilka två eller tre verktyg/);
    await field.fill('BFS använder en kö och hittar kortast väg i antal steg.');
    await expect(page.locator('[data-question="verktyg-forklara"]').getByText(/Sparat lokalt \(11 ord\)/)).toBeVisible();
    await page.reload();
    await expect(page.getByLabel(/Vilka två eller tre verktyg/)).toHaveValue('BFS använder en kö och hittar kortast väg i antal steg.');
    await expect(page.getByRole('link', { name: '7. Bredden först och djupet först' })).toHaveAttribute('href', /labb\/bredden-forst-och-djupet-forst\/$/);
    expect(errors).toEqual([]);
  });
});

test.describe('Lärarhandledning', () => {
  test('innehållsförteckning och ankare för alla kapitel och labbar', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('larare/');
    await expect(page.getByRole('heading', { level: 1, name: 'Lärarhandledning' })).toBeVisible();
    const toc = page.getByRole('navigation', { name: 'Innehåll' });
    await expect(toc).toBeVisible();
    for (const s of ['terminsplan', 'kapitel', 'labbar', 'slutprojekt', 'amnesplan']) {
      await expect(toc.locator(`a[href="#${s}"]`)).toHaveCount(1);
      await expect(page.locator(`#${s}`)).toHaveCount(1);
    }
    expect(labIds.length).toBeGreaterThanOrEqual(27);
    for (const id of labIds) {
      await expect(page.locator(`#labb-${id}`)).toHaveCount(1);
      await expect(toc.locator(`a[href="#labb-${id}"]`)).toHaveCount(1);
    }
    for (const id of chapterIds) {
      await expect(page.locator(`#kapitel-${id}`)).toHaveCount(1);
      await expect(toc.locator(`a[href="#kapitel-${id}"]`)).toHaveCount(1);
    }
    await expect(page.getByRole('heading', { name: 'Koppling till ämnesplanen' })).toBeVisible();
    await expect(page.locator('#amnesplan a[href*="skolverket.se"]').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Arbetsformer', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Individuellt/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /I par/ })).toBeVisible();
    await expect(page.getByText('Öppet undervisningsmaterial', { exact: true })).toBeVisible();

    await toc.locator('a[href="#labb-bredden-forst-och-djupet-forst"]').click();
    await expect(page).toHaveURL(/#labb-bredden-forst-och-djupet-forst$/);
    await expect(page.locator('#labb-bredden-forst-och-djupet-forst')).toBeInViewport();
    expect(errors).toEqual([]);
  });

  test('ingen horisontell rullning på mobil @mobil', async ({ page }) => {
    await page.goto('larare/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
