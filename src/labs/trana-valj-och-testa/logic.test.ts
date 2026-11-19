import { describe, expect, it } from 'vitest';
import { evaluate, generatePlants, leakageDemo, makeSplit, pct, predictSick, selectK, validationCurve, type Plant } from './logic';

const split = makeSplit();
const ids = (a: Plant[]) => new Set(a.map((p) => p.id));

describe('labb 12: uppdelning', () => {
  it('80 träning, 35 validering, 35 test – reproducerbart', () => {
    expect(split.train).toHaveLength(80);
    expect(split.validation).toHaveLength(35);
    expect(split.test).toHaveLength(35);
    expect(makeSplit()).toEqual(split);
  });

  it('testmängden är disjunkt från tränings- och valideringsmängden', () => {
    const test = ids(split.test);
    for (const p of [...split.train, ...split.validation]) expect(test.has(p.id)).toBe(false);
    const train = ids(split.train);
    for (const p of split.validation) expect(train.has(p.id)).toBe(false);
    expect(new Set([...ids(split.train), ...ids(split.validation), ...test]).size).toBe(150);
  });

  it('testdata används inte vid valet: valet ändras inte om testets etiketter ändras', () => {
    const k = selectK(split.train, split.validation);
    const flipped = split.test.map((p) => ({ ...p, sick: !p.sick }));
    // selectK tar inte emot testdata – och resten av uppdelningen påverkas inte
    expect(selectK(split.train, split.validation)).toBe(k);
    expect(evaluate(split.train, flipped, k).accuracy).not.toBe(evaluate(split.train, split.test, k).accuracy);
    expect(selectK.length).toBe(2);
  });

  it('13 av 35 valideringsplantor och 11 av 35 testplantor är sjuka', () => {
    expect(split.validation.filter((p) => p.sick)).toHaveLength(13);
    expect(split.test.filter((p) => p.sick)).toHaveLength(11);
  });
});

describe('labb 12: siffror som används i labbens text', () => {
  const curve = validationCurve(split.train, split.validation);
  const at = (k: number) => curve.find((c) => c.k === k)!;

  it('överanpassning: k = 1 ger 100 % på träning men 80 % på validering', () => {
    expect(pct(at(1).train.accuracy)).toBe('100 %');
    expect(at(1).validation.correct).toBe(28);
    expect(pct(at(1).validation.accuracy)).toBe('80 %');
  });

  it('valideringen väljer k = 9 (33 av 35 = 94 %)', () => {
    expect(selectK(split.train, split.validation)).toBe(9);
    expect(at(9).validation.correct).toBe(33);
    expect(pct(at(9).validation.accuracy)).toBe('94 %');
  });

  it('testresultatet för k = 9: 30 av 35 (86 %), 3 missade sjuka, 2 falsklarm', () => {
    const t = evaluate(split.train, split.test, 9);
    expect(t).toMatchObject({ correct: 30, total: 35, tp: 8, fn: 3, fp: 2, tn: 22 });
    expect(pct(t.accuracy)).toBe('86 %');
  });

  it('k = 79 säger alltid frisk: 63 % rätt men hittar 0 av 13 sjuka', () => {
    expect(at(79).validation).toMatchObject({ tp: 0, fn: 13, fp: 0, tn: 22 });
    expect(pct(at(79).validation.accuracy)).toBe('63 %');
  });

  it('k = 5 och k = 25 har samma träffsäkerhet (89 %) men olika feltyper', () => {
    expect(at(5).validation.correct).toBe(31);
    expect(at(25).validation.correct).toBe(31);
    expect(at(5).validation).toMatchObject({ fn: 3, fp: 1 });
    expect(at(25).validation).toMatchObject({ fn: 2, fp: 2 });
  });

  it('läckagedemo (egna data): 100 % med läckage mot 80 % utan, men bara 74 % på nya plantor', () => {
    const d = leakageDemo(split.train, 1);
    expect(pct(d.honestOnDemoTest.accuracy)).toBe('80 %');
    expect(pct(d.leakyOnDemoTest.accuracy)).toBe('100 %');
    expect(pct(d.honestOnFresh.accuracy)).toBe('71 %');
    expect(pct(d.leakyOnFresh.accuracy)).toBe('74 %');
    // demodata delar inga id med den ordinarie uppdelningen
    const all = new Set([...split.train, ...split.validation, ...split.test].map((p) => p.id));
    for (const p of generatePlants(77, 35, 1001)) expect(all.has(p.id)).toBe(false);
  });
});

describe('labb 12: kantfall', () => {
  it('ingen träningsdata ger inget svar och ingen träffsäkerhet', () => {
    expect(predictSick([], { x: 1, y: 1 }, 3)).toBeNull();
    const e = evaluate([], split.test, 3);
    expect(e.total).toBe(0);
    expect(Number.isNaN(e.accuracy)).toBe(true);
    expect(pct(e.accuracy)).toBe('–');
  });
});
