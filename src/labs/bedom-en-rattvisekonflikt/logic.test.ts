import { describe, expect, it } from 'vitest';
import { cases, compare, fnRate, fpRate, lowestThresholdWithFpAtMost, outcome, pct } from './logic';

describe('labb 23: rättvisekonflikt', () => {
  it('datamängden har 40 ansökningar per grupp med olika basfrekvens', () => {
    const n = outcome('norr', 0);
    const s = outcome('soder', 0);
    expect([n.total, n.errors, n.correct]).toEqual([40, 8, 32]);
    expect([s.total, s.errors, s.correct]).toEqual([40, 16, 24]);
    expect(new Set(cases.map((c) => c.id)).size).toBe(80);
  });

  it('tröskel 50 (startläget): siffror som används i labbens frågor', () => {
    const n = outcome('norr', 50);
    const s = outcome('soder', 50);
    expect(n).toMatchObject({ tp: 7, fp: 1, fn: 1, tn: 31, flagged: 8 });
    expect(s).toMatchObject({ tp: 16, fp: 14, fn: 0, tn: 10, flagged: 30 });
    expect(fpRate(n)).toBe(3);
    expect(fpRate(s)).toBe(58);
    expect(fnRate(n)).toBe(13);
    expect(fnRate(s)).toBe(0);
  });

  it('tröskel 60: färre onödiga utredningar men fler missade fel', () => {
    const n = outcome('norr', 60);
    const s = outcome('soder', 60);
    expect(n).toMatchObject({ fp: 1, fn: 3 });
    expect(s).toMatchObject({ fp: 3, fn: 2 });
    expect(fpRate(s)).toBe(13);
    expect(fnRate(n)).toBe(38);
    expect(fnRate(s)).toBe(13);
  });

  it('tröskel 40 och 70', () => {
    expect(outcome('norr', 40)).toMatchObject({ fp: 9, fn: 0 });
    expect(outcome('soder', 40)).toMatchObject({ fp: 20, fn: 0 });
    expect(outcome('norr', 70)).toMatchObject({ fp: 0, fn: 6 });
    expect(outcome('soder', 70)).toMatchObject({ fp: 2, fn: 9 });
  });

  it('poäng lika med tröskeln räknas som utredning (≥)', () => {
    // Norr har en korrekt ansökan med poäng 60 och Söder en med 62.
    expect(outcome('norr', 60).fp).toBe(1);
    expect(outcome('norr', 61).fp).toBe(0);
  });

  it('kantfall: tröskel 0 utreder alla, 101 ingen', () => {
    const all = outcome('soder', 0);
    expect(all.fn).toBe(0);
    expect(all.fp).toBe(24);
    const none = outcome('soder', 101);
    expect(none.flagged).toBe(0);
    expect(none.fn).toBe(16);
    expect(pct(0, 0)).toBeNull();
  });

  it('olika trösklar per grupp och lägsta gemensamma tröskel för FP ≤ 10 %', () => {
    const c = compare({ norr: 50, soder: 60 });
    expect(c.norr.fp).toBe(1);
    expect(c.soder.fp).toBe(3);
    expect(c.fpGap).toBe(13 - 3);
    expect(fnRate(c.norr)).toBe(13);
    expect(fnRate(c.soder)).toBe(13);
    expect(c.fnGap).toBe(0);
    expect(lowestThresholdWithFpAtMost(10)).toBe(63);
    // fördjupningens facit: vid 63 missas 3 av 8 (Norr) och 6 av 16 (Söder)
    expect(outcome('norr', 63)).toMatchObject({ fp: 0, fn: 3 });
    expect(outcome('soder', 63)).toMatchObject({ fp: 2, fn: 6 });
    expect(fnRate(outcome('norr', 63))).toBe(38);
    expect(fnRate(outcome('soder', 63))).toBe(38);
  });
});
