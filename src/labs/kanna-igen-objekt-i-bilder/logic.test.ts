import { describe, expect, it } from 'vitest';
import {
  addNoise,
  ball,
  blackCount,
  buildScene,
  classify,
  detect,
  emptyImage,
  evaluate,
  fullImage,
  invert,
  isImage,
  pct,
  rotate,
  runScene,
  shift,
  similarity,
  slideWindow,
  templates,
  togglePixel,
  variantById,
  type ClassId,
} from './logic';

const scoresOf = (img: number[][]) => Object.fromEntries(classify(img).scores.map((s) => [s.label, pct(s.score)])) as Record<ClassId, number>;

describe('labb 28: bilder som tal', () => {
  it('mallarna har de pixeltal som texten nämner', () => {
    expect(blackCount(templates.cup)).toBe(17);
    expect(blackCount(templates.apple)).toBe(27);
    expect(blackCount(templates.key)).toBe(12);
    expect(blackCount(ball)).toBe(12);
  });

  it('likheten mellan koppen och äpplemallen är 15/29 = 52 %', () => {
    const s = similarity(templates.cup, templates.apple);
    expect(s).toMatchObject({ both: 15, either: 29 });
    expect(pct(s.score)).toBe(52);
    expect(scoresOf(templates.cup)).toEqual({ apple: 52, cup: 100, key: 26 });
  });

  it('pixelredigering och validering', () => {
    const t = togglePixel(emptyImage(), 2, 3);
    expect(blackCount(t)).toBe(1);
    expect(togglePixel(t, 2, 3)).toEqual(emptyImage());
    expect(isImage(t)).toBe(true);
    expect(isImage([[1, 0]])).toBe(false);
    expect(isImage(null)).toBe(false);
  });
});

describe('labb 28: ändringar av koppen (siffror i labbens text och frågor)', () => {
  it('flyttad 2 steg: äpple 34 %, kopp 21 %', () => {
    const c = classify(variantById('flyttad').make());
    expect(c.best).toBe('apple');
    expect(scoresOf(variantById('flyttad').make())).toMatchObject({ apple: 34, cup: 21 });
  });
  it('vriden: äpple 38 %, kopp 31 %', () => {
    expect(classify(rotate(templates.cup)).best).toBe('apple');
    expect(scoresOf(rotate(templates.cup))).toMatchObject({ apple: 38, cup: 31 });
  });
  it('skymd: fortfarande kopp 41 %', () => {
    const c = classify(variantById('dold').make());
    expect(c.best).toBe('cup');
    expect(pct(c.bestScore)).toBe(41);
  });
  it('omvänd belysning: äpple 35 %, kopp 0 %', () => {
    expect(classify(invert(templates.cup)).best).toBe('apple');
    expect(scoresOf(invert(templates.cup))).toMatchObject({ apple: 35, cup: 0 });
  });
  it('kantfall: helt vit bild ger inget svar, helt svart ger äpple 75 %', () => {
    const empty = classify(emptyImage());
    expect(empty.best).toBeNull();
    expect(empty.scores.every((s) => s.score === 0)).toBe(true);
    expect(scoresOf(fullImage())).toEqual({ apple: 75, cup: 47, key: 33 });
    expect(classify(fullImage()).best).toBe('apple');
  });
  it('flytt utanför bilden lämnar en vit bild', () => {
    expect(blackCount(shift(templates.cup, 6, 0))).toBe(0);
  });
});

describe('labb 28: glidande fönster i scenen', () => {
  it('69 fönsterlägen, rad för rad', () => {
    const w = slideWindow(buildScene());
    expect(w).toHaveLength(69);
    expect(w[1]).toMatchObject({ x: 1, y: 0, best: 'apple' });
    expect(pct(w[1]!.score)).toBe(72);
    expect(w[24]).toMatchObject({ x: 1, y: 1, best: 'apple', score: 1 });
  });

  it('utan brus och tröskel 70 %: alla tre hittas', () => {
    const r = runScene(0, 70);
    expect(r.found.map((f) => [f.best, f.x, f.y])).toEqual([
      ['apple', 1, 1],
      ['key', 8, 1],
      ['cup', 15, 0],
    ]);
    expect(r.evaluation).toMatchObject({ correct: 3, falsePos: 0, missed: 0 });
  });

  it('bollen tas för äpple (44 %) när tröskeln är 40 % men inte 50 %', () => {
    const low = runScene(0, 40);
    expect(low.evaluation).toMatchObject({ correct: 3, falsePos: 1, missed: 0 });
    expect(pct(low.found.at(-1)!.score)).toBe(44);
    expect(runScene(0, 50).evaluation.falsePos).toBe(0);
  });

  it('brus 10 %, tröskel 70 %: alla tre hittas', () => {
    expect(runScene(10, 70).evaluation).toMatchObject({ correct: 3, falsePos: 0, missed: 0 });
  });

  it('brus 20 %, tröskel 70 %: bara äpplet (71 %), nyckel och kopp missas', () => {
    const r = runScene(20, 70);
    expect(r.found.map((f) => [f.best, pct(f.score)])).toEqual([['apple', 71]]);
    expect(r.evaluation).toMatchObject({ correct: 1, falsePos: 0, missed: 2 });
    expect(r.evaluation.missedObjects.map((o) => o.label)).toEqual(['key', 'cup']);
  });

  it('brus 20 %, tröskel 50 %: 2 rätt, 2 felaktiga (nyckel 59 % och boll 55 % som äpple), nyckeln missad', () => {
    const r = runScene(20, 50);
    expect(r.found.map((f) => [f.best, f.x, pct(f.score)])).toEqual([
      ['apple', 1, 71],
      ['apple', 8, 59],
      ['cup', 15, 67],
      ['apple', 21, 55],
    ]);
    expect(r.evaluation).toMatchObject({ correct: 2, falsePos: 2, missed: 1 });
    expect(r.evaluation.verdicts).toEqual([true, false, true, false]);
  });

  it('kantfall: tröskel 0 och 100', () => {
    const zero = runScene(0, 0);
    expect(zero.evaluation.correct).toBe(3);
    expect(zero.evaluation.falsePos).toBeGreaterThan(0);
    expect(runScene(0, 100).evaluation).toMatchObject({ correct: 3, falsePos: 0, missed: 0 });
    expect(runScene(20, 100).found).toEqual([]);
    expect(runScene(20, 100).evaluation.missed).toBe(3);
  });

  it('kantfall: tom scen ger inga fynd', () => {
    const w = slideWindow(emptyImage(28, 8));
    expect(detect(w, 0)).toEqual([]);
    expect(evaluate([])).toMatchObject({ correct: 0, falsePos: 0, missed: 3 });
  });

  it('bruset är reproducerbart med startvärde', () => {
    const a = addNoise(buildScene(), 0.2, 1);
    expect(addNoise(buildScene(), 0.2, 1)).toEqual(a);
    expect(addNoise(buildScene(), 0.2, 2)).not.toEqual(a);
    expect(buildScene(0.2, 1)).toEqual(a);
  });
});
