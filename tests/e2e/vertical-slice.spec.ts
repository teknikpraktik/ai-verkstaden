import { expect, test } from '@playwright/test';
import { answerChoice, answerNumeric, blockStorage, openLab, trackErrors } from './helpers';

const LAB = 'labb/bredden-forst-och-djupet-forst/';

test.describe('Lodrätt snitt: labb 7 BFS/DFS @mobil', () => {
  test('från startsidan via kapitel till labb, stegning, återkoppling och progression efter omladdning', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1, name: 'AI-verkstaden' })).toBeVisible();
    await page.getByRole('link', { name: /Grundläggande begrepp och sökalgoritmer/ }).first().click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Grundläggande begrepp');
    await page.getByRole('link', { name: /Bredden först och djupet först/ }).first().click();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();

    // Steg 1: förutsäg
    await page.getByLabel('Bredden först (BFS)').check();
    await page.getByRole('button', { name: /Gå vidare/ }).click();

    // Steg 2: stega BFS och läs kön
    const forward = page.getByRole('button', { name: /Steg framåt/ });
    await forward.click();
    await expect(page.getByRole('status').filter({ hasText: 'Expandera A1' })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Kön, första först' })).toContainText('B1');
    await expect(page.getByRole('list', { name: 'Kön, första först' })).toContainText('A2');

    // Fel svar ger förklaring och nytt försök
    let q = await answerChoice(page, 'bfs-ordning', 'BFS går alltid mot målet');
    await expect(q.getByText('Inte riktigt.')).toBeVisible();
    await expect(q.getByText(/vet inte var målet ligger/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    q = await answerChoice(page, 'bfs-ordning', /Alla rutor på avstånd 1/);
    await expect(q.getByText('Rätt!')).toBeVisible();

    // Kör till slutet
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('resultat')).toContainText('har 12 steg och kostar 12');

    // Progression efter omladdning
    await page.reload();
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Steg 2 av 7/ })).toBeVisible();
    await expect(page.locator('[data-question="bfs-ordning"]').getByText('Rätt!')).toBeVisible();

    // Senast besökta labb visas på startsidan
    await page.goto('./');
    await expect(page.getByRole('link', { name: /Fortsätt där du var: 7\. Bredden först/ })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('jämförelse och lera: färre steg men högre kostnad', async ({ page }) => {
    await openLab(page, LAB);
    for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /Gå vidare/ }).click();
    await expect(page.getByTestId('jamforelse')).toContainText('24');
    const q = await answerNumeric(page, 'dfs-langre', '24');
    await expect(q.getByText(/hela DFS-vägens längd/)).toBeVisible();
    await q.getByRole('button', { name: 'Försök igen' }).click();
    await answerNumeric(page, 'dfs-langre', '12');
    await expect(q.getByText('Rätt!')).toBeVisible();
    for (let i = 0; i < 2; i++) await page.getByRole('button', { name: /Gå vidare/ }).click();
    await page.getByRole('button', { name: /Till slutet/ }).click();
    await expect(page.getByTestId('resultat')).toContainText('har 6 steg och kostar 26');
    await answerNumeric(page, 'lera-kostnad', '26');
    await expect(page.locator('[data-question="lera-kostnad"]').getByText('Rätt!')).toBeVisible();
  });

  test('Börja om återställer labben', async ({ page }) => {
    await openLab(page, LAB);
    await page.getByRole('button', { name: /Gå vidare/ }).click();
    await page.getByRole('button', { name: /Börja om/ }).click();
    await page.getByRole('button', { name: 'Ja, börja om' }).click();
    await expect(page.getByRole('heading', { name: /Steg 1 av 7/ })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: /Steg 1 av 7/ })).toBeVisible();
  });
});

test.describe('Labb 7 på dator', () => {
  test('tangentbord: stega och redigera rutnätet i experimentläget', async ({ page }) => {
    await openLab(page, LAB);
    await page.getByRole('radio', { name: 'Experiment' }).check({ force: true });
    await expect(page.getByRole('heading', { name: 'Inställningar' })).toBeVisible();
    // Stäng passagen ned från A1: gå till A2 med piltangent och gör vägg
    const grid = page.getByRole('grid');
    await grid.getByRole('gridcell').first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', /^A2/);
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-cell="1-0"]')).toHaveAttribute('aria-label', /vägg/);
    // Stäng även B1 → målet går inte att nå
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    const end = page.getByRole('button', { name: /Till slutet/ });
    await end.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('resultat')).toContainText('ingen väg');
    await expect(page.getByRole('status').filter({ hasText: 'Gränsen är tom' })).toBeVisible();
  });

  test('fungerar när lokal lagring är blockerad', async ({ page }) => {
    const errors = trackErrors(page);
    await blockStorage(page);
    await openLab(page, LAB);
    await expect(page.getByText(/tillåter inte lokal lagring/)).toBeVisible();
    await page.getByRole('button', { name: /Gå vidare/ }).click();
    await page.getByRole('button', { name: /Steg framåt/ }).click();
    await expect(page.getByRole('list', { name: 'Kön, första först' })).toContainText('B1');
    const q = await answerChoice(page, 'bfs-ordning', /Alla rutor på avstånd 1/);
    await expect(q.getByText('Rätt!')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('trasig sparad data kraschar inte labben', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('aiv:v1:lab:bredden-forst-och-djupet-forst:guided-step', '{trasig');
      localStorage.setItem('aiv:v1:lab:bredden-forst-och-djupet-forst:custom-maze', '{"rows":"x"}');
    });
    await openLab(page, LAB);
    await expect(page.getByRole('heading', { name: /Steg 1 av 7/ })).toBeVisible();
  });
});
