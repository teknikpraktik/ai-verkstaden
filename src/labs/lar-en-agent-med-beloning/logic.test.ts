import { describe, expect, it } from 'vitest';
import { badRewards, cellName, defaultConfig, emptyQ, episodeStarts, frozenTest, goodRewards, greedy, move, qAfter, qUpdate, START, stateOf, train } from './logic';

describe('labb 14: Q-inlärning', () => {
  it('Q-uppdateringen stämmer med handräknade exempel', () => {
    // 0 + 0,5 · (−1 + 0,95 · 2 − 0) = 0,45
    expect(qUpdate(0, -1, 2, 0.5, 0.95)).toBeCloseTo(0.45, 12);
    // labbens fråga: Q = 0, belöning −1, bästa Q i nästa tillstånd 0, α = 0,5 → −0,5
    expect(qUpdate(0, -1, 0, 0.5, 0.95)).toBe(-0.5);
    // nära målet: Q = 4, belöning 10, sluttillstånd (max 0), α = 0,5 → 7
    expect(qUpdate(4, 10, 0, 0.5, 0.95)).toBe(7);
  });

  it('miljön: väggar och kanter gör att roboten står kvar; mål och trappa avslutar', () => {
    expect(move(START, 0, goodRewards)).toEqual({ s2: START, r: -1, done: false });
    expect(move(stateOf(0, 1), 2, goodRewards).s2).toBe(stateOf(0, 1)); // vägg i B2
    expect(move(stateOf(3, 3), 1, goodRewards)).toEqual({ s2: stateOf(3, 4), r: 10, done: true });
    expect(move(stateOf(2, 2), 1, goodRewards)).toEqual({ s2: stateOf(2, 3), r: -10, done: true });
  });

  it('samma startvärde ger samma träning; första steget ger Q −0,5', () => {
    const a = train(defaultConfig);
    expect(train(defaultConfig)).toEqual(a);
    expect(a[0]!.newQ).toBe(-0.5);
    expect(train({ ...defaultConfig, seed: 1 })).not.toEqual(a);
  });

  it('första episoden tar 34 steg och slutar vid laddstationen (siffror i labbens text)', () => {
    const log = train(defaultConfig);
    const starts = episodeStarts(log);
    expect(starts).toHaveLength(defaultConfig.episodes);
    expect(starts[1]).toBe(34);
    expect(cellName(log[33]!.s2)).toBe('E4');
  });

  it('bra belöning: fryst modell når laddstationen på 7 steg med summa 4', () => {
    const log = train(defaultConfig);
    const t = frozenTest(qAfter(log, log.length), goodRewards, defaultConfig.maxSteps);
    expect(t.outcome).toBe('goal');
    expect(t.actions).toHaveLength(7);
    expect(t.total).toBe(4);
  });

  it('dålig belöning (+1 per steg): roboten kör in i väggen och når aldrig laddstationen', () => {
    const cfg = { ...defaultConfig, rewards: badRewards };
    const log = train(cfg);
    const t = frozenTest(qAfter(log, log.length), badRewards, cfg.maxSteps);
    expect(t.outcome).toBe('timeout');
    expect(t.total).toBe(40);
    expect(t.path.slice(-5).every((s) => s === t.path[t.path.length - 1])).toBe(true);
  });

  it('otränad modell: alla Q är 0, ingen bästa handling, provet tar slut på tid', () => {
    const q = emptyQ();
    expect(greedy(q[START]!)).toBeNull();
    expect(frozenTest(q, goodRewards, 40).outcome).toBe('timeout');
    expect(qAfter(train(defaultConfig), 0)).toEqual(q);
  });
});
