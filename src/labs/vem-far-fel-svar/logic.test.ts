import { describe, expect, it } from 'vitest';
import { evaluate, evaluateAll, pct, pick, predict, runPreset, testSet, train, trainingPool, trainingSet, type Example } from './logic';

describe('labb 4: vem får fel svar?', () => {
  it('data är reproducerbar och har rätt storlek', () => {
    expect(trainingPool.norrby).toHaveLength(48);
    expect(trainingPool.soderby).toHaveLength(24);
    expect(testSet.filter((e) => e.group === 'norrby')).toHaveLength(40);
    expect(testSet.filter((e) => e.group === 'soderby')).toHaveLength(10);
    expect(trainingSet(24, 0)).toEqual(trainingSet(24, 0));
    expect(pick('norrby', 12).filter((e) => e.digit === 1)).toHaveLength(6);
  });

  it('modellen säger 7 när strecket är längre än tröskeln', () => {
    expect(predict(3, 3)).toBe(1);
    expect(predict(3, 3.1)).toBe(7);
  });

  it('tränad bara på Norrby: 0 av 40 fel i Norrby, 5 av 10 i Söderby, 5 av 50 totalt (siffror i labbens text)', () => {
    const { model, result } = runPreset('norrby24');
    expect(model!.threshold).toBe(3.65);
    expect(model!.trainErrors).toBe(0);
    expect(result!.norrby).toMatchObject({ errors: 0, n: 40 });
    expect(result!.soderby).toMatchObject({ errors: 5, n: 10, onesAsSeven: 5, ones: 5, sevensAsOne: 0 });
    expect(pct(result!.soderby.rate)).toBe(50);
    expect(result!.total).toMatchObject({ errors: 5, n: 50 });
    expect(pct(result!.total.rate)).toBe(10);
  });

  it('Söderbys ettor i testdatan ligger på 3,7–4,7 mm (används i förklaringsfrågan)', () => {
    const xs = testSet.filter((e) => e.group === 'soderby' && e.digit === 1).map((e) => e.x);
    expect(Math.min(...xs)).toBe(3.7);
    expect(Math.max(...xs)).toBe(4.7);
    const norrbySevens = testSet.filter((e) => e.group === 'norrby' && e.digit === 7).map((e) => e.x);
    expect(Math.min(...norrbySevens)).toBeGreaterThan(4.85);
  });

  it('dubbelt så mycket data från samma urval hjälper inte Söderby', () => {
    const { model, result } = runPreset('norrby48');
    expect(model!.threshold).toBe(3.65);
    expect(result!.soderby.errors).toBe(5);
    expect(pct(result!.soderby.rate)).toBe(50);
  });

  it('samma antal exempel men blandat urval: Söderbys felandel sjunker till 0 %', () => {
    const { model, result } = runPreset('blandat24');
    expect(model!.trainSize).toBe(24);
    expect(model!.threshold).toBe(4.85);
    expect(result!.soderby.errors).toBe(0);
    expect(result!.norrby.errors).toBe(0);
  });

  it('utan exempel av båda siffrorna går det inte att träna', () => {
    expect(train([])).toBeNull();
    expect(trainingSet(0, 0)).toEqual([]);
    const onlyOnes: Example[] = [{ id: 'a', group: 'norrby', x: 1, digit: 1 }];
    expect(train(onlyOnes)).toBeNull();
  });

  it('väljer mitten av intervallet med minst fel', () => {
    const ex: Example[] = [
      { id: 'a', group: 'norrby', x: 1, digit: 1 },
      { id: 'b', group: 'norrby', x: 2, digit: 1 },
      { id: 'c', group: 'norrby', x: 6, digit: 7 },
    ];
    expect(train(ex)!.threshold).toBe(4);
    expect(train(ex)!.trainErrors).toBe(0);
  });

  it('tom grupp ger ingen felandel', () => {
    expect(evaluate(4, [], 'soderby')).toMatchObject({ n: 0, errors: 0, rate: null });
    expect(evaluateAll(4, []).total.rate).toBeNull();
    expect(pct(null)).toBeNull();
  });
});
