import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SEED,
  ROBOT_ROUNDS,
  WINDOW,
  clickItem,
  isStoredFeed,
  makePage,
  noClicks,
  profileWeights,
  replay,
  robotChoice,
  simulate,
  startFeed,
  summarizeData,
  topTopic,
  variation,
} from './logic';

describe('labb 22: rekommendationsflöde', () => {
  it('profilvikterna är (1 + klick)² normerade', () => {
    const w = profileWeights({ ...noClicks(), spel: 5 });
    // 36 / (36 + 5 · 1) = 36/41
    expect(w.spel).toBeCloseTo(36 / 41, 10);
    expect(w.musik).toBeCloseTo(1 / 41, 10);
    const even = profileWeights(noClicks());
    expect(even.natur).toBeCloseTo(1 / 6, 10);
  });

  it('samma startvärde ger samma sida (reproducerbart)', () => {
    expect(makePage(3, 4, noClicks(), 'engagemang')).toEqual(makePage(3, 4, noClicks(), 'engagemang'));
    expect(makePage(3, 4, noClicks(), 'engagemang')).not.toEqual(makePage(4, 4, noClicks(), 'engagemang'));
  });

  it('variationsläget lägger alltid två platser på andra ämnen än favoriten', () => {
    const clicks = { ...noClicks(), spel: 10 };
    for (let r = 0; r < 30; r++) {
      const page = makePage(DEFAULT_SEED, r, clicks, 'variation');
      expect(page[2]!.topic).not.toBe('spel');
      expect(page[3]!.topic).not.toBe('spel');
    }
  });

  it('standardscenariot: siffrorna som används i labbens frågor', () => {
    const start = variation(startFeed(DEFAULT_SEED, 'engagemang').shown);
    expect(start.n).toBe(4);
    const e = simulate(DEFAULT_SEED, 'engagemang', ROBOT_ROUNDS);
    const v = simulate(DEFAULT_SEED, 'variation', ROBOT_ROUNDS);
    const ve = variation(e.shown);
    const vv = variation(v.shown);
    expect(WINDOW).toBe(12);
    // engagemangsläget: alla 12 senaste är spel
    expect(ve.distinct).toBe(1);
    expect(ve.top).toBe('spel');
    expect(ve.topCount).toBe(12);
    // variationsläget: 5 ämnen, spel 6 av 12
    expect(vv.distinct).toBe(5);
    expect(vv.top).toBe('spel');
    expect(vv.topCount).toBe(6);
    // de första 12 inläggen i engagemangsläget hade 4 ämnen
    expect(variation(e.shown.slice(0, 12)).distinct).toBe(4);
    expect(e.clicks.spel).toBe(15);
  });

  it('loggen innehåller en rad per visat inlägg', () => {
    const e = simulate(DEFAULT_SEED, 'engagemang', ROBOT_ROUNDS);
    const d = summarizeData(e);
    expect(d.views).toBe(60);
    expect(d.clicks).toBe(15);
    expect(d.inferences[0]).toBe('Du klickar mest på spel (15 av 15 klick).');
    expect(d.totalSeconds).toBe(e.log.reduce((a, x) => a + x.seconds, 0));
  });

  it('kantfall: inga klick, ogiltigt index, robot utan favorit på sidan', () => {
    expect(topTopic(noClicks())).toBeNull();
    const s = startFeed(1, 'engagemang');
    expect(clickItem(s, 9)).toBe(s);
    expect(variation([]).distinct).toBe(0);
    const page = s.page.map((it) => ({ ...it, topic: 'mat' as const }));
    expect(robotChoice(page, 'spel')).toBe(0);
    expect(summarizeData(s).inferences).toEqual([]);
  });

  it('sparade val spelas upp till samma tillstånd och valideras', () => {
    const choices = [0, 1, 2, 3, 0];
    let s = startFeed(5, 'variation');
    for (const c of choices) s = clickItem(s, c);
    expect(replay({ seed: 5, mode: 'variation', choices })).toEqual(s);
    expect(isStoredFeed({ seed: 5, mode: 'variation', choices })).toBe(true);
    expect(isStoredFeed({ seed: 5, mode: 'annat', choices })).toBe(false);
    expect(isStoredFeed({ seed: 5, mode: 'variation', choices: [7] })).toBe(false);
    expect(isStoredFeed(null)).toBe(false);
  });
});
