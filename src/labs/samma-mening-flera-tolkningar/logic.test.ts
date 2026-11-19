import { describe, expect, it } from 'vitest';
import {
  AMBIGUITIES,
  compareModeration,
  CORPUS,
  FORUM,
  generate,
  interpret,
  moderateContext,
  moderateKeyword,
  nextDistribution,
  pairCount,
  trainBigram,
} from './logic';

describe('labb 18: tvetydighet', () => {
  it('varje mening har två tolkningar och sammanhang som pekar på var sin', () => {
    for (const a of AMBIGUITIES) {
      expect(a.readings).toHaveLength(2);
      expect(new Set(a.contexts.map((c) => c.reading))).toEqual(new Set(a.readings.map((r) => r.id)));
    }
  });
  it('utan sammanhang är meningen tvetydig', () => {
    const a = AMBIGUITIES[0]!;
    expect(interpret(a, null)).toBeNull();
    expect(interpret(a, 'balkong')).toBe('jag');
    expect(interpret(a, 'halsen')).toBe('mannen');
    expect(interpret(a, 'finns-inte')).toBeNull();
  });
});

describe('labb 18: moderering (siffror i labbens text)', () => {
  const c = compareModeration(FORUM);
  it('nyckelordsregeln stoppar 8 av 10, varav 5 ofarliga, och missar 1', () => {
    expect(c.keyword).toEqual({ stopped: 8, wrongStops: 5, missed: 1, correct: 4 });
  });
  it('kontextregeln stoppar 2, inga ofarliga, men missar 2', () => {
    expect(c.context).toEqual({ stopped: 2, wrongStops: 0, missed: 2, correct: 8 });
    const missed = c.rows.filter((r) => r.comment.shouldStop && r.context.decision === 'tillat').map((r) => r.comment.id);
    expect(missed).toEqual(['k7', 'k8']);
  });
  it('en regel i taget: utan fasta uttryck stoppas 3 ofarliga', () => {
    expect(compareModeration(FORUM, ['citat', 'riktat']).context).toEqual({ stopped: 6, wrongStops: 3, missed: 1, correct: 6 });
    expect(compareModeration(FORUM, ['fraser', 'riktat']).context.wrongStops).toBe(1);
    expect(compareModeration(FORUM, ['fraser', 'citat']).context.wrongStops).toBe(1);
    expect(compareModeration(FORUM, []).context).toEqual(c.keyword);
  });
  it('undantagen förklaras', () => {
    expect(moderateContext('Kan någon förklara hur man slår upp ord?').reason).toMatch(/slår upp/);
    expect(moderateContext('Någon skrev ”jag ska slå dig”.').reason).toMatch(/citat/);
    expect(moderateContext('Jag var en idiot.').decision).toBe('tillat');
    expect(moderateContext('Du är en idiot.').decision).toBe('stoppa');
    expect(moderateContext('Idiot, det är du.').decision).toBe('stoppa');
  });
  it('tom text och versaler', () => {
    expect(moderateKeyword('').decision).toBe('tillat');
    expect(moderateContext('').decision).toBe('tillat');
    expect(moderateKeyword('JAG HATAR MÅNDAGAR').decision).toBe('stoppa');
    expect(moderateKeyword('JAG HATAR MÅNDAGAR').hits).toEqual(['hatar']);
  });
  it('citat med raka citattecken fungerar också', () => {
    expect(moderateContext('Han skrev "jag ska slå dig" i chatten.').decision).toBe('tillat');
    expect(moderateContext('Jag ska slå dig. "Hej" sa hon.').decision).toBe('stoppa');
  });
});

describe('labb 18: bigrammodell', () => {
  const m = trainBigram(CORPUS);
  it('storlek: 20 meningar, 112 ord, 71 ordpar', () => {
    expect(m.sentences).toBe(20);
    expect(m.tokens).toBe(112);
    expect(pairCount(m)).toBe(71);
  });
  it('"en" följs av "bok" 3 gånger av 7 (43 %)', () => {
    const d = nextDistribution(m, 'en');
    expect(d[0]).toEqual({ word: 'bok', count: 3, p: 3 / 7 });
    expect(Math.round(d[0]!.p * 100)).toBe(43);
    expect(d.map((x) => x.count)).toEqual([3, 2, 1, 1]);
    expect(d.reduce((s, x) => s + x.p, 0)).toBeCloseTo(1, 12);
  });
  it('bara ett ord bakåt: efter "med" är kikaren och hatten lika sannolika', () => {
    expect(nextDistribution(m, 'med').map((x) => [x.word, x.p])).toEqual([
      ['kikaren', 0.5],
      ['hatten', 0.5],
    ]);
  });
  it('girig generering är alltid densamma', () => {
    expect(generate(m, 'jag', { greedy: true }).words.join(' ')).toBe('jag läser en bok .');
    expect(generate(m, 'det', { greedy: true }).words.join(' ')).toBe('det regnar i parken .');
    expect(generate(m, 'Jag', { greedy: true }).stop).toBe('slut');
  });
  it('slump med startvärde är reproducerbar', () => {
    const a = generate(m, 'jag', { greedy: false, seed: 1 });
    const b = generate(m, 'jag', { greedy: false, seed: 1 });
    expect(a).toEqual(b);
    expect(a.words.join(' ')).toBe('jag såg en katt sover i parken .');
    expect(generate(m, 'jag', { greedy: false, seed: 2 }).words.join(' ')).toBe('jag såg en bok .');
  });
  it('okänt ord och tom start', () => {
    expect(nextDistribution(m, 'robot')).toEqual([]);
    expect(generate(m, 'robot', { greedy: true })).toEqual({ words: ['robot'], stop: 'okant' });
    expect(generate(m, '', { greedy: true })).toEqual({ words: [], stop: 'okant' });
    expect(generate(m, '  !? ', { greedy: true }).stop).toBe('okant');
  });
  it('maxlängd stoppar genereringen', () => {
    const g = generate(m, 'jag', { greedy: true, maxWords: 2 });
    expect(g).toEqual({ words: ['jag', 'läser', 'en'], stop: 'max' });
  });
});
