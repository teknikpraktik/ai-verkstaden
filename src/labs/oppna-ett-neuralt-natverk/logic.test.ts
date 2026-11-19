import { describe, expect, it } from 'vitest';
import { correctCount, defaultSettings, fmt, forward, initNet, loss, netCorrect, neuron, sigmoid, tasks, trainBoth, type Net } from './logic';

const xor = tasks.xor.examples;

describe('labb 15: neuron', () => {
  it('framåtberäkning med handräknade värden', () => {
    expect(neuron({ w1: 1, w2: 1, b: -1 }, [1, 0])).toEqual({ z: 0, out: 0.5 });
    const r = neuron({ w1: 1, w2: 1, b: -1.5 }, [1, 1]);
    expect(r.z).toBe(0.5);
    expect(fmt(r.out)).toBe('0,62');
    expect(sigmoid(0)).toBe(0.5);
    expect(fmt(sigmoid(2), 3)).toBe('0,881');
  });

  it('w1 = w2 = 1, b = −1,5 ger OCH; b = −0,5 ger ELLER', () => {
    expect(correctCount({ w1: 1, w2: 1, b: -1.5 }, tasks.och.examples)).toBe(4);
    expect(correctCount({ w1: 1, w2: 1, b: -0.5 }, tasks.eller.examples)).toBe(4);
    expect(correctCount({ w1: 1, w2: 1, b: -1.5 }, xor)).toBe(1);
  });

  it('ingen enskild neuron klarar XOR (alla reglagelägen −10…10 i steg om 0,5)', () => {
    let best = 0;
    for (let w1 = -10; w1 <= 10; w1 += 0.5)
      for (let w2 = -10; w2 <= 10; w2 += 0.5) for (let b = -10; b <= 10; b += 0.5) best = Math.max(best, correctCount({ w1, w2, b }, xor));
    expect(best).toBe(3);
  });
});

describe('labb 15: nätverk', () => {
  it('framåtberäkning i nätverket med handräknade värden', () => {
    const zero: Net = { hidden: [[0, 0, 0], [0, 0, 0]], out: [1, 1], outBias: 0 };
    const f = forward(zero, [1, 1]);
    expect(f.h).toEqual([0.5, 0.5]);
    expect(f.out).toBeCloseTo(sigmoid(1), 12);
    expect(fmt(f.out, 4)).toBe('0,7311');
    // känd lösning: ELLER och INTE-OCH i dolda lagret, OCH i utdata
    const xorNet: Net = { hidden: [[20, 20, -10], [-20, -20, 30]], out: [20, 20], outBias: -30 };
    expect(netCorrect(xorNet, xor)).toBe(4);
    expect(loss(xorNet, xor)).toBeLessThan(0.001);
  });

  it('samma startvärde ger samma startvikter', () => {
    expect(initNet(2, 3)).toEqual(initNet(2, 3));
    expect(initNet(2, 3)).not.toEqual(initNet(2, 4));
  });

  it('med startvärde 3 når nätverket låg förlust medan en ensam neuron fastnar på 0,25 (siffror i labbens text)', () => {
    const snaps = trainBoth(xor, defaultSettings);
    expect(snaps).toHaveLength(41);
    const at = (e: number) => snaps.find((s) => s.epoch === e)!;
    expect(fmt(at(0).netLoss)).toBe('0,29');
    expect(fmt(at(200).netLoss)).toBe('0,25');
    expect(at(600).netLoss).toBeLessThan(0.05);
    expect(netCorrect(at(600).net, xor)).toBe(4);
    const last = snaps[snaps.length - 1]!;
    expect(last.netLoss).toBeLessThan(0.01);
    expect(netCorrect(last.net, xor)).toBe(4);
    expect(fmt(last.singleLoss)).toBe('0,25');
    expect(correctCount(last.single, xor)).toBeLessThan(4);
    // förlusten minskar från första till sista ögonblicksbilden
    expect(last.netLoss).toBeLessThan(snaps[0]!.netLoss);
  });

  it('startvärde 4 med två dolda neuroner fastnar, men tre dolda neuroner klarar det', () => {
    const stuck = trainBoth(xor, { ...defaultSettings, seed: 4 });
    expect(fmt(stuck[stuck.length - 1]!.netLoss)).toBe('0,25');
    const three = trainBoth(xor, { ...defaultSettings, seed: 4, hidden: 3 });
    expect(three[three.length - 1]!.netLoss).toBeLessThan(0.01);
  });

  it('tom data ger ingen förlust', () => {
    expect(Number.isNaN(loss(initNet(2, 1), []))).toBe(true);
  });
});
