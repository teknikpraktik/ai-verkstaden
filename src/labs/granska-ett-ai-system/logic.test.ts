import { describe, expect, it } from 'vitest';
import { chapters, labOrder } from '../../course/chapters';
import { labs } from '../../course/registry';
import {
  EMPTY,
  buildReport,
  checklist,
  completeness,
  completenessText,
  emptyProject,
  evidenceLabs,
  isProject,
  methods,
  problems,
  reportFileName,
  reportToText,
  wordCount,
  type Project,
} from './logic';

const filled = (): Project => ({
  ...emptyProject(),
  problem: 'matsvinn',
  goal: 'Minska matsvinnet med en fjärdedel utan att någon elev blir utan lunch.',
  affected: 'Elever, kökspersonal och skolans ekonomi.',
  data: 'Antal ätande per dag de senaste två åren, veckodag, meny, lov och provdagar. Inga uppgifter om enskilda elever.',
  method: 'regression',
  methodWhy: 'Vi vill förutsäga ett tal, antalet portioner.',
  evidence: {
    'forutsag-ett-tal': 'Visar hur stora felen i en prognos blir.',
    'trana-valj-och-testa': 'Visar att vi måste testa på nya veckor.',
  },
  errors: 'För låg prognos gör att elever blir utan mat, för hög ger mer svinn.',
  risks: 'Små risker för integritet eftersom inga uppgifter om enskilda elever används.',
  oversight: 'beslutar',
  oversightWhy: 'Kocken kan justera prognosen inför särskilda dagar.',
  recommendation: 'villkor',
  conclusion: 'Inför systemet om felet testas på en hel termin och kocken alltid får sista ordet.',
});

describe('labblistan för belägg', () => {
  it('innehåller labb 1–26 med id och nummer som i kursens labbordning', () => {
    expect(evidenceLabs).toHaveLength(26);
    for (const l of evidenceLabs) {
      expect(labOrder, l.id).toContain(l.id);
      expect(labOrder.indexOf(l.id) + 1, l.id).toBe(l.number);
    }
    expect(new Set(evidenceLabs.map((l) => l.id)).size).toBe(26);
    expect(evidenceLabs.map((l) => l.id)).not.toContain('granska-ett-ai-system');
  });

  it('har rätt kapitel och samma titel som labbens metadata', () => {
    for (const l of evidenceLabs) {
      expect(chapters.find((c) => c.labs.includes(l.id))?.id, l.id).toBe(l.part);
      expect(labs.find((x) => x.id === l.id)?.title, l.id).toBe(l.title);
    }
  });

  it('förslag i problem och metoder pekar på befintliga labbar', () => {
    const ids = new Set(evidenceLabs.map((l) => l.id));
    for (const p of problems) for (const id of p.suggestedLabs) expect(ids.has(id), `${p.id} → ${id}`).toBe(true);
    for (const m of methods) for (const id of m.labs) expect(ids.has(id), `${m.id} → ${id}`).toBe(true);
  });
});

describe('isProject', () => {
  it('godkänner tomt och ifyllt projekt', () => {
    expect(isProject(emptyProject())).toBe(true);
    expect(isProject(filled())).toBe(true);
  });
  it('avvisar trasig eller gammal data', () => {
    expect(isProject(null)).toBe(false);
    expect(isProject([])).toBe(false);
    expect(isProject({ ...emptyProject(), goal: 3 })).toBe(false);
    expect(isProject({ ...emptyProject(), problem: 'finns-inte' })).toBe(false);
    expect(isProject({ ...emptyProject(), evidence: { 'okand-labb': 'x' } })).toBe(false);
    expect(isProject({ ...emptyProject(), selfCheck: 'pahittat' })).toBe(false);
    const { authors: _a, ...missing } = emptyProject();
    expect(isProject(missing)).toBe(false);
  });
});

describe('wordCount', () => {
  it('räknar ord och ignorerar blanktecken', () => {
    expect(wordCount('')).toBe(0);
    expect(wordCount('   ')).toBe(0);
    expect(wordCount(' ett  två\ntre ')).toBe(3);
  });
});

describe('granskningslistan', () => {
  it('tomt projekt: 0 av 10 delar, allt saknas med förklaring', () => {
    const c = completeness(emptyProject());
    expect(c.total).toBe(10);
    expect(c.done).toBe(0);
    expect(c.complete).toBe(false);
    expect(c.missing.every((m) => m.missing.length > 0)).toBe(true);
    expect(c.missing[0]!.missing).toMatch(/Välj ett av de fiktiva problemen/);
    expect(completenessText(c)).toMatch(/^0 av 10 obligatoriska delar/);
  });

  it('ifyllt projekt är komplett', () => {
    const c = completeness(filled());
    expect(c.missing.map((m) => m.id)).toEqual([]);
    expect(c.complete).toBe(true);
    expect(completenessText(c)).toMatch(/Alla 10/);
  });

  it('kräver minst två labbar med anteckning', () => {
    const p = filled();
    p.evidence = { 'forutsag-ett-tal': 'Visar felens storlek.' };
    let item = checklist(p).find((i) => i.id === 'evidence')!;
    expect(item.done).toBe(false);
    expect(item.missing).toMatch(/du har valt 1/);
    p.evidence = { 'forutsag-ett-tal': 'Visar felens storlek.', 'trana-valj-och-testa': '' };
    item = checklist(p).find((i) => i.id === 'evidence')!;
    expect(item.done).toBe(false);
    expect(item.missing).toMatch(/1 av 2 valda/);
  });

  it('eget problem kräver rubrik och beskrivning', () => {
    const p = { ...filled(), problem: 'eget' as const };
    expect(checklist(p).find((i) => i.id === 'problem')!.done).toBe(false);
    p.customTitle = 'Busskö-appen';
    p.customDescription = 'En påhittad app som förutsäger hur fulla bussarna blir varje morgon.';
    expect(checklist(p).find((i) => i.id === 'problem')!.done).toBe(true);
  });

  it('metodval utan motivering räknas inte', () => {
    const p = { ...filled(), methodWhy: 'tal' };
    const item = checklist(p).find((i) => i.id === 'method')!;
    expect(item.done).toBe(false);
    expect(item.missing).toMatch(/Motivera/);
  });
});

describe('rapporten', () => {
  it('tomt projekt ger en rapport med platshållare', () => {
    const r = buildReport(emptyProject());
    expect(r.title).toBe('Granskning: Inget problem valt');
    expect(r.sections).toHaveLength(9);
    const text = reportToText(r);
    expect(text).toContain(EMPTY);
    expect(text).toContain('Inga labbar valda.');
    expect(text).toContain('Status: 0 av 10');
  });

  it('innehåller elevens text, labbar i nummerordning och märkning av påhittat scenario', () => {
    const p = filled();
    p.evidence = { 'trana-valj-och-testa': 'Testa på nya veckor.', 'forutsag-ett-tal': 'Felens storlek.' };
    const text = reportToText(buildReport(p), '2026-11-19');
    expect(text).toContain('Granskning: Prognos för matsvinn i skolmatsalen');
    expect(text).toContain('Scenariot är påhittat');
    expect(text).toContain('Minska matsvinnet med en fjärdedel');
    expect(text).toContain('Vald metod: Regression (förutsäga ett tal)');
    expect(text.indexOf('Labb 11, Förutsäg ett tal')).toBeLessThan(text.indexOf('Labb 12, Träna, välj och testa'));
    expect(text).toContain('Nivå: Människa beslutar');
    expect(text).toContain('Rekommendation: Inför med villkor');
    expect(text).toContain('Sparad: 2026-11-19');
  });

  it('eget problem använder elevens rubrik', () => {
    const p = { ...emptyProject(), problem: 'eget' as const, customTitle: 'Smart skåp', authors: 'A & B' };
    const r = buildReport(p);
    expect(r.title).toBe('Granskning: Smart skåp');
    expect(r.subtitle).toContain('Av: A & B');
  });

  it('filnamn är filsäkra', () => {
    expect(reportFileName(filled())).toBe('granskning-prognos-for-matsvinn-i-skolmatsalen.txt');
    expect(reportFileName(emptyProject())).toBe('granskning-inget-problem-valt.txt');
    expect(reportFileName({ ...emptyProject(), problem: 'eget', customTitle: '!!!' })).toBe('granskning-ai-system.txt');
  });
});
