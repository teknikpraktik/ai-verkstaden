import { describe, expect, it } from 'vitest';
import { REFERENCE_DATE, categories, classifyGuidanceBot, milestones, passed, scenarioById, scenarios } from './logic';

describe('labb 25: hur regleras ett AI-system?', () => {
  it('har sju scenarier med unika id och minst två där facit är "mer information"', () => {
    expect(scenarios).toHaveLength(7);
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(7);
    expect(scenarios.filter((s) => s.answer === 'mer-info').map((s) => s.id)).toEqual(['vagledning', 'avhopp']);
  });

  it('facit per scenario', () => {
    expect(scenarioById.get('kanslo')!.answer).toBe('forbjuden');
    expect(scenarioById.get('rattning')!.answer).toBe('hogrisk');
    expect(scenarioById.get('chatt')!.answer).toBe('transparens');
    expect(scenarioById.get('rekrytering')!.answer).toBe('hogrisk');
    expect(scenarioById.get('schema')!.answer).toBe('ingen');
  });

  it('varje scenario har antaganden, återkoppling för alla felsvar och något att utreda', () => {
    for (const s of scenarios) {
      expect(s.assumptions.length, s.id).toBeGreaterThan(0);
      expect(s.investigate.length, s.id).toBeGreaterThan(0);
      expect(s.gdpr.length, s.id).toBeGreaterThan(0);
      for (const c of categories) if (c.id !== s.answer) expect(s.wrong[c.id], `${s.id}/${c.id}`).toBeTruthy();
      // Varje förklaring hänvisar till en artikel eller bilaga
      expect(s.explanation, s.id).toMatch(/art\. \d|bilaga [IV]+/);
    }
  });

  it('ett faktum ändrar klassningen av studievägledarboten', () => {
    expect(classifyGuidanceBot('ja').category).toBe('hogrisk');
    expect(classifyGuidanceBot('nej').category).toBe('transparens');
    expect(classifyGuidanceBot('okant').category).toBe('mer-info');
    expect(classifyGuidanceBot('okant').category).toBe(scenarioById.get('vagledning')!.answer);
  });

  it('tidslinjen: ikraftträdande skiljs från tillämpning och ligger i ordning', () => {
    const isos = milestones.map((m) => m.iso);
    expect([...isos].sort()).toEqual(isos);
    expect(milestones.find((m) => m.kind === 'ikrafttradande')!.iso).toBe('2024-08-01');
    expect(milestones.find((m) => m.text.includes('art. 5'))!.iso).toBe('2025-02-02');
    // 20 dagar efter publiceringen 12 juli 2024
    const pub = new Date('2024-07-12T00:00:00Z');
    pub.setUTCDate(pub.getUTCDate() + 20);
    expect(pub.toISOString().slice(0, 10)).toBe('2024-08-01');
  });

  it('på referensdatumet har förbud och art. 50 börjat tillämpas men inte högriskkraven för bilaga III', () => {
    expect(REFERENCE_DATE).toBe('2026-11-19');
    const p = passed(REFERENCE_DATE).map((m) => m.iso);
    expect(p).toContain('2025-02-02');
    expect(p).toContain('2026-08-02');
    expect(p).not.toContain('2027-12-02');
    expect(passed('2024-01-01')).toEqual([]);
  });
});
