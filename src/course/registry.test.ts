import { describe, expect, it } from 'vitest';
import { chapters, concepts, conceptById, finale, labs } from './registry';
import { labOrder } from './chapters';
import { renderInline } from '../lib/markup';
import type { Block } from './types';

const STRICT = process.env.STRICT_CONTENT === '1';

function blockTexts(b: Block): string[] {
  if (typeof b === 'string') return [b];
  switch (b.type) {
    case 'list':
      return b.items;
    case 'note':
      return [b.text];
    case 'formula':
      return b.caption ? [b.caption] : [];
    case 'table':
      return b.rows.flat();
    default:
      return [];
  }
}

describe('kursregistret', () => {
  it('har 6 kapitel och 27 numrerade sidor i rätt ordning', () => {
    expect(chapters).toHaveLength(6);
    expect(labs).toHaveLength(27);
    labs.forEach((l, i) => expect(l.number, l.id).toBe(i + 1));
    expect(labOrder).toEqual(labs.map((l) => l.id));
    expect(finale.labs).toEqual(['granska-ett-ai-system']);
  });

  it('id matchar mapp och kapitel matchar registret', () => {
    for (const c of chapters) for (const id of c.labs) expect(labs.find((l) => l.id === id)?.part, id).toBe(c.id);
  });

  it('id:n är unika och url-säkra', () => {
    const ids = labs.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('alla begreppsreferenser i metadata och text finns i begreppslistan', () => {
    const unknown: string[] = [];
    for (const l of labs) {
      for (const c of l.concepts) if (!conceptById.has(c)) unknown.push(`${l.id}: ${c}`);
      const c = l.content;
      const texts = c ? [...c.intro, ...c.sections.flatMap((s) => s.blocks), ...c.conclusion, ...(c.deepDives ?? []).flatMap((d) => d.blocks)].flatMap(blockTexts) : [];
      const teacher = l.teacher ? l.teacher.answers.flatMap((a) => a.answer).flatMap(blockTexts) : [];
      for (const t of [...texts, ...teacher]) {
        renderInline(t, { conceptHref: () => '', conceptTerm: (id) => conceptById.get(id)?.term, internalHref: (p) => p, onUnknownConcept: (id) => unknown.push(`${l.id}: [[${id}]]`) });
      }
    }
    expect(unknown).toEqual([]);
  });

  it('labbspecifika begrepp krockar inte med varandra eller med kärnlistan', async () => {
    const mods = import.meta.glob<{ default: { id: string }[] }>('../labs/*/concepts.ts', { eager: true });
    const { coreConcepts } = await import('./glossary');
    const seen = new Map<string, string>(coreConcepts.map((c) => [c.id, 'glossary.ts']));
    const clashes: string[] = [];
    for (const [path, m] of Object.entries(mods)) {
      for (const c of m.default) {
        const prev = seen.get(c.id);
        if (prev) clashes.push(`${c.id}: ${prev} och ${path}`);
        else seen.set(c.id, path);
      }
    }
    expect(clashes).toEqual([]);
  });

  it('begreppens relaterade id finns', () => {
    const bad = concepts.flatMap((c) => (c.related ?? []).filter((r) => !conceptById.has(r)).map((r) => `${c.id} → ${r}`));
    expect(bad).toEqual([]);
  });

  it('förkunskapslabbar finns och kommer före', () => {
    for (const l of labs) for (const p of l.prerequisiteLabs) {
      const pre = labs.find((x) => x.id === p);
      expect(pre, `${l.id} → ${p}`).toBeDefined();
      expect(pre!.number).toBeLessThan(l.number);
    }
  });

  it.runIf(STRICT)('varje labb är färdig: mål, täckning, innehåll och lärarstöd', () => {
    for (const l of labs) {
      expect(l.goals.length, l.id).toBeGreaterThan(0);
      expect(l.goals.join(' '), l.id).not.toContain('under arbete');
      expect(l.coverage.length, l.id).toBeGreaterThan(0);
      expect(l.concepts.length, l.id).toBeGreaterThan(0);
      expect(l.keywords.length, l.id).toBeGreaterThan(0);
      expect(l.content?.sections.length, l.id).toBeGreaterThan(0);
      expect(l.teacher?.answers.length, l.id).toBeGreaterThan(0);
    }
  });
});
