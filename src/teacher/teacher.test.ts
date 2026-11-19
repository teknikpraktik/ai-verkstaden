import { describe, expect, it } from 'vitest';
import { chapters, extraLabs, labOrder } from '../course/chapters';
import { course, planGroups, planItems, sources, checkedDate } from './amnesplan';
import { termPlan } from './termplan';
import { rubric, rubricLevels, workForms } from './projekt';
import { labStatus } from './labStatus';
import type { TeacherNotes } from '../course/types';

const chapterIds = new Set(chapters.map((c) => c.id));

describe('terminsplanen', () => {
  it('har 18–20 veckor i följd', () => {
    expect(termPlan.length).toBeGreaterThanOrEqual(18);
    expect(termPlan.length).toBeLessThanOrEqual(20);
    termPlan.forEach((w, i) => expect(w.week).toBe(i + 1));
  });
  it('tar upp alla ordinarie labbar i kursordning och alla extralabbar', () => {
    const order = termPlan.flatMap((w) => w.labs).filter((id, i, a) => a.indexOf(id) === i);
    expect(order.filter((id) => !extraLabs.includes(id))).toEqual(labOrder.filter((id) => !extraLabs.includes(id)));
    for (const id of extraLabs) expect(order, id).toContain(id);
  });
});

describe('ämnesplanskopplingen', () => {
  it('pekar bara på befintliga kapitel och labbar', () => {
    for (const p of planItems) {
      for (const c of p.chapters) expect(chapterIds.has(c as never), `${p.id} → ${c}`).toBe(true);
      for (const l of p.labs) expect(labOrder, `${p.id} → ${l}`).toContain(l);
    }
  });
  it('har källor med https-adresser och kontrolldatum', () => {
    expect(checkedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sources.length).toBeGreaterThan(0);
    for (const s of sources) expect(s.url).toMatch(/^https:\/\/[a-z.]*skolverket\.se\//);
  });
  it('citat används bara för ordagranna formuleringar', () => {
    for (const p of planItems) expect(p.text.startsWith('”'), p.id).toBe(p.verified === 'citat');
  });
  it('återger hela det centrala innehållet för nivå 1 ordagrant under ämnesplanens rubriker', () => {
    expect(checkedDate).toBe('2026-11-19');
    expect(course).toMatchObject({ levelCode: 'ARTI1000X', points: 100, validFrom: '2025-07-01', subjectCode: 'ARTI' });
    expect(planItems).toHaveLength(15);
    expect(planGroups.map((g) => planItems.filter((p) => p.group === g).length)).toEqual([6, 4, 5]);
    expect(new Set(planItems.map((p) => p.id)).size).toBe(planItems.length);
    for (const p of planItems) {
      expect(p.verified, p.id).toBe('citat');
      expect(p.text.endsWith('”'), p.id).toBe(true);
    }
  });
  it('har labbar för allt som täcks och förslag för det som saknas', () => {
    for (const p of planItems) {
      if (p.coverage !== 'täcks-inte') expect(p.labs.length, p.id).toBeGreaterThan(0);
      if (p.coverage !== 'täcks') expect(p.comment, p.id).toMatch(/förslag:/i);
    }
  });
});

describe('bedömningsstöd för slutprojektet', () => {
  it('har individuell och parvis arbetsform', () => {
    expect(workForms.map((w) => w.id)).toEqual(expect.arrayContaining(['individuellt', 'par']));
  });
  it('har tre nivåer per kriterium', () => {
    expect(rubricLevels).toHaveLength(3);
    for (const r of rubric) expect(r.levels.every((l) => l.length > 10)).toBe(true);
  });
});

describe('labStatus', () => {
  const base: TeacherNotes = { purpose: 'Syfte.', tips: ['a'], misconceptions: [], discussionStops: [], answers: [] };
  it('känner igen platshållare och saknat lärarstöd', () => {
    expect(labStatus(undefined)).toBe('saknas');
    expect(labStatus({ ...base, purpose: 'Under arbete.', tips: [] })).toBe('saknas');
    expect(labStatus({ ...base, purpose: '', tips: [] })).toBe('saknas');
  });
  it('skiljer på delvis och färdigt', () => {
    expect(labStatus(base)).toBe('delvis');
    expect(labStatus({ ...base, answers: [{ question: 'F', answer: ['S'] }] })).toBe('klar');
  });
});
