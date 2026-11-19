import { expect, test, type Page } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { openLab, trackErrors } from './helpers';

/**
 * Tillgänglighet: centrala flöden med enbart tangentbord, rubrikstruktur,
 * sidledsrullning på mobil och smoke-test för minskad rörelse och mörkt läge.
 */

const labIds = readdirSync(new URL('../../src/labs/', import.meta.url)).sort();
const labPath = (id: string) => (id === 'granska-ett-ai-system' ? `projekt/${id}/` : `labb/${id}/`);

/** Beskrivning av elementet som har fokus (för felmeddelanden och villkor). */
async function focused(page: Page) {
  return page.evaluate(() => {
    const e = document.activeElement;
    if (!e || e === document.body) return { tag: 'BODY', text: '', href: '' };
    return { tag: e.tagName, text: (e.textContent ?? '').trim(), href: e.getAttribute('href') ?? '' };
  });
}

/** Trycker Tab tills villkoret uppfylls (högst max gånger). */
async function tabUntil(page: Page, cond: (f: Awaited<ReturnType<typeof focused>>) => boolean, max = 80) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    const f = await focused(page);
    if (cond(f)) return f;
  }
  throw new Error('Hittade inte målet med Tab');
}

test.describe('Tangentbord', () => {
  test('startsida → kapitel → labb med enbart tangentbord', async ({ page }) => {
    await page.goto('./');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Hoppa till innehållet' })).toBeFocused();
    await tabUntil(page, (f) => f.tag === 'A' && /kapitel\/introduktion\/$/.test(f.href));
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/kapitel\/introduktion\/$/);
    await tabUntil(page, (f) => f.tag === 'A' && /labb\/ar-det-ai\/$/.test(f.href));
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/labb\/ar-det-ai\/$/);
    await expect(page.locator('.lab-root[data-ready="true"]')).toBeVisible();
  });

  test('genomgång: förutsäga, gå vidare och svara på en fråga med tangentbordet', async ({ page }) => {
    const errors = trackErrors(page);
    await openLab(page, 'labb/ar-det-ai/');
    await page.getByRole('button', { name: /Börja om/ }).focus();

    // Tab in till förutsägelsen, välj med piltangent
    await tabUntil(page, (f) => f.tag === 'INPUT');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.question-predict input:checked')).toHaveCount(1);

    // Gå vidare med Enter → fokus på det nya stegets rubrik
    await tabUntil(page, (f) => /Gå vidare/.test(f.text));
    await page.keyboard.press('Enter');
    const heading = page.getByRole('heading', { name: /Steg 2 av 7/ });
    await expect(heading).toBeFocused();

    // Svara fel, få återkoppling, försök igen och svara rätt – allt med tangentbordet
    const q = page.locator('[data-question="ledtrad"]');
    await q.getByRole('radio', { name: /har en sensor/ }).focus();
    await page.keyboard.press('Space');
    await expect(q.getByRole('radio', { name: /har en sensor/ })).toBeChecked();
    await page.keyboard.press('Tab');
    await expect(q.getByRole('button', { name: 'Kontrollera svaret' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(q.getByText('Inte riktigt.')).toBeVisible();
    await expect(q.locator('.feedback')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(q.getByRole('button', { name: 'Försök igen' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(q.getByRole('radio').first()).toBeFocused();
    // Första alternativet är det rätta
    await page.keyboard.press('Space');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(q.getByText('Rätt!')).toBeVisible();

    // Tillbaka till första steget: fokus tappas inte trots att knappen blir inaktiv
    const back = page.getByRole('button', { name: 'Tillbaka' });
    await back.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: /Steg 1 av 7/ })).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('Börja om bekräftas och avbryts med tangentbordet, fokus stannar kvar', async ({ page }) => {
    await openLab(page, 'labb/ar-det-ai/');
    await page.getByRole('radio', { name: '3–5' }).check();
    await page.getByRole('button', { name: /Gå vidare/ }).click();
    await expect(page.getByRole('heading', { name: /Steg 2 av 7/ })).toBeVisible();

    const reset = page.getByRole('button', { name: /Börja om/ });
    await reset.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Ja, börja om' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Avbryt' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(reset).toBeFocused();
    await expect(page.getByRole('heading', { name: /Steg 2 av 7/ })).toBeVisible();

    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await expect(reset).toBeFocused();
    await expect(page.getByRole('heading', { name: /Steg 1 av 7/ })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'återställd' })).toBeAttached();
  });

  test('stegning: fokus flyttas när knappen blir inaktiv', async ({ page }) => {
    await openLab(page, 'labb/bredden-forst-och-djupet-forst/');
    await page.getByRole('button', { name: /Till slutet/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: /Steg bakåt/ })).toBeFocused();
    await page.getByRole('button', { name: /Till början/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: /Steg framåt/ })).toBeFocused();
  });

  test('begreppssökning och "Se även" med tangentbordet', async ({ page }) => {
    await page.goto('begrepp/');
    const search = page.getByLabel('Sök bland begreppen');
    await tabUntil(page, (f) => f.tag === 'INPUT');
    await expect(search).toBeFocused();
    await page.keyboard.type('stapel');
    await expect(page.getByRole('status').filter({ hasText: /begrepp matchar ”stapel”/ })).toBeVisible();
    const stack = page.locator('.glossary-item#stack');
    await expect(stack).toBeVisible();
    await expect(page.locator('.glossary-item#ko')).toHaveCount(0);
    await stack.getByRole('link', { name: 'Kö' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.glossary-item#ko')).toBeVisible();
    await expect(page).toHaveURL(/#ko$/);
    await expect(search).toHaveValue('');
  });

  test('Min arbetsöversikt: rensa allt med tangentbordet', async ({ page }) => {
    await openLab(page, 'labb/ar-det-ai/');
    await page.goto('min-oversikt/');
    await expect(page.getByText(/Du har öppnat 1 av/)).toBeVisible();
    const clear = page.getByRole('button', { name: 'Rensa allt sparat arbete' });
    await clear.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Ja, rensa allt' })).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Avbryt
    await expect(clear).toBeFocused();
    await expect(page.getByText(/Du har öppnat 1 av/)).toBeVisible();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter'); // Ja, rensa allt
    await expect(clear).toBeFocused();
    await expect(page.getByText('Allt sparat arbete är rensat.')).toBeVisible();
    await expect(page.getByText(/Du har öppnat 0 av/)).toBeVisible();
  });

  test('projektorläget slås på och av med tangentbordet', async ({ page }) => {
    await page.goto('./');
    const btn = page.getByRole('button', { name: 'Projektorläge' });
    // Knappen hydreras när webbläsaren är ledig (client:idle).
    await expect(page.locator('astro-island').filter({ has: btn })).not.toHaveAttribute('ssr');
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    await btn.focus();
    await page.keyboard.press('Space');
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-projector', '');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-projector', '');
    await expect(page.locator('astro-island').filter({ has: btn })).not.toHaveAttribute('ssr');
    await page.getByRole('button', { name: 'Projektorläge' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).not.toHaveAttribute('data-projector');
  });
});

test.describe('Struktur', () => {
  for (const id of labIds) {
    test(`rubriker och namn: ${id}`, async ({ page }) => {
      await openLab(page, labPath(id));
      const problems = await page.evaluate(() => {
        const out: string[] = [];
        const hs = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')];
        const h1 = hs.filter((h) => h.tagName === 'H1').length;
        if (h1 !== 1) out.push(`${h1} h1`);
        let prev = 0;
        for (const h of hs) {
          const level = Number(h.tagName[1]);
          if (level > prev + 1) out.push(`h${prev} → h${level}: ${h.textContent?.trim().slice(0, 40)}`);
          prev = level;
        }
        for (const lm of ['header', 'nav', 'main', 'footer']) if (!document.querySelector(lm)) out.push(`saknar <${lm}>`);
        return out;
      });
      expect(problems).toEqual([]);
      // Varje knapp och formulärfält i labben har ett tillgängligt namn.
      const controls = page.locator('.lab-root').getByRole('button').or(page.locator('.lab-root').getByRole('textbox')).or(page.locator('.lab-root').getByRole('combobox'));
      for (const el of await controls.all()) {
        const name = await el.evaluate((e) => {
          const label = e.getAttribute('aria-label') ?? (e as HTMLInputElement).labels?.[0]?.textContent ?? e.textContent ?? '';
          const by = e.getAttribute('aria-labelledby');
          return by ? by.split(' ').map((i) => document.getElementById(i)?.textContent ?? '').join(' ') : label;
        });
        expect(name.trim(), await el.evaluate((e) => e.outerHTML.slice(0, 120))).not.toBe('');
      }
    });
  }
});

test.describe('Mobil @mobil', () => {
  for (const id of labIds) {
    test(`ingen sidledsrullning på 390 px: ${id}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openLab(page, labPath(id));
      // Kontrollera de tre första stegen i genomgången.
      for (let step = 0; step < 3; step++) {
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `steg ${step + 1}`).toBeLessThanOrEqual(1);
        const next = page.getByRole('button', { name: /Gå vidare/ });
        if ((await next.count()) === 0 || (await next.isDisabled())) break;
        await next.click();
      }
    });
  }
});

test.describe('Minskad rörelse och mörkt läge', () => {
  test.use({ colorScheme: 'dark', reducedMotion: 'reduce' });
  for (const id of ['bredden-forst-och-djupet-forst', 'sok-med-kostnad-och-ledtrad', 'grupper-utan-facit', 'bygg-en-graf']) {
    test(`labb ${id} fungerar i mörkt läge med minskad rörelse`, async ({ page }) => {
      const errors = trackErrors(page);
      await openLab(page, `labb/${id}/`);
      const colors = await page.evaluate(() => {
        const body = getComputedStyle(document.body);
        return { bg: body.backgroundColor, text: body.color, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches };
      });
      expect(colors.reduced).toBe(true);
      // mörk bakgrund, ljus text
      const lum = (c: string) => {
        const [r, g, b] = (c.match(/\d+/g) ?? []).map(Number);
        return (r! + g! + b!) / 3;
      };
      expect(lum(colors.bg)).toBeLessThan(60);
      expect(lum(colors.text)).toBeGreaterThan(200);
      // Text i diagram och rutnät har tillräcklig kontrast mot sin bakgrund även i mörkt läge.
      const lowContrast = await page.evaluate(() => {
        const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
        const lum = (c: string) => {
          const [r, g, b] = rgb(c).map((v) => {
            const x = v / 255;
            return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
        };
        const ratio = (a: string, b: string) => {
          const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
          return (x! + 0.05) / (y! + 0.05);
        };
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
        const hex = (h: string) => `rgb(${parseInt(h.slice(1, 3), 16)}, ${parseInt(h.slice(3, 5), 16)}, ${parseInt(h.slice(5, 7), 16)})`;
        const bad: string[] = [];
        for (const t of document.querySelectorAll<HTMLElement | SVGElement>('.workspace .grid-cell')) {
          if (!t.textContent?.trim()) continue;
          const cs = getComputedStyle(t);
          if (ratio(cs.color, cs.backgroundColor) < 4.5) bad.push(`ruta ${t.getAttribute('aria-label')}`);
        }
        for (const t of document.querySelectorAll('.workspace svg text')) {
          if (!t.textContent?.trim()) continue;
          // text i SVG står normalt på ytfärgen (eller på en egen etikettbakgrund, som också följer temat)
          if (ratio(getComputedStyle(t).fill, hex(surface)) < 3) bad.push(`text ${t.textContent}`);
        }
        return bad;
      });
      expect(lowContrast).toEqual([]);
      // Övergångar är avstängda
      const transition = await page.locator('.btn').first().evaluate((e) => getComputedStyle(e).transitionDuration);
      expect(parseFloat(transition)).toBeLessThan(0.01);
      expect(errors).toEqual([]);
    });
  }
});
