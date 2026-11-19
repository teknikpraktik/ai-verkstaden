import { describe, expect, it } from 'vitest';
import {
  accuracy,
  bestSplit,
  buildTree,
  candidateSplits,
  countRows,
  decodeSplitMap,
  depthCurve,
  evaluateSplit,
  fmtGini,
  FULL_DEPTH,
  gini,
  growSteps,
  growTree,
  isSplitMap,
  leaves,
  NEW_DAY,
  pct,
  predict,
  predictPath,
  pruneAt,
  rankSplits,
  splitText,
  TEST,
  thresholds,
  TRAIN,
  treeDepth,
  type Row,
} from './logic';

describe('labb 29: data', () => {
  it('24 träningsdagar (11 inställda) och 12 testdagar, utan gemensamma id', () => {
    expect(TRAIN).toHaveLength(24);
    expect(TEST).toHaveLength(12);
    expect(countRows(TRAIN)).toEqual({ installd: 11, genomfors: 13 });
    const ids = new Set(TRAIN.map((r) => r.id));
    for (const r of TEST) expect(ids.has(r.id)).toBe(false);
  });

  it('inga två träningsdagar har samma egenskaper men olika utfall (fullvuxet träd kan nå 100 %)', () => {
    const seen = new Map<string, string>();
    for (const r of TRAIN) {
      const k = `${r.vader}|${r.temp}|${r.vind}`;
      expect(seen.get(k) ?? r.label).toBe(r.label);
      seen.set(k, r.label);
    }
  });

  it('kandidatfrågor: 3 väder, 19 temperaturgränser, 14 vindgränser', () => {
    expect(thresholds('temp')).toHaveLength(19);
    expect(thresholds('vind')).toHaveLength(14);
    expect(candidateSplits()).toHaveLength(36);
  });
});

describe('labb 29: Gini (handräknat)', () => {
  it('roten: 1 − (11/24)² − (13/24)² = 286/576 ≈ 0,497', () => {
    expect(gini(countRows(TRAIN))).toBeCloseTo(286 / 576, 12);
    expect(fmtGini(gini(countRows(TRAIN)))).toBe('0,497');
  });

  it('ren nod och tom nod ger 0, hälften av varje ger 0,5', () => {
    expect(gini({ installd: 5, genomfors: 0 })).toBe(0);
    expect(gini({ installd: 0, genomfors: 0 })).toBe(0);
    expect(gini({ installd: 3, genomfors: 3 })).toBe(0.5);
  });

  it('Väder = regn?: 5/3 och 6/10, båda 0,469, viktat 0,469 (frågan gini-regn)', () => {
    const r = evaluateSplit(TRAIN, { feature: 'vader', value: 'regn' });
    expect(r.yes).toEqual({ installd: 5, genomfors: 3 });
    expect(r.no).toEqual({ installd: 6, genomfors: 10 });
    expect(r.giniYes).toBeCloseTo(30 / 64, 12);
    expect(r.giniNo).toBeCloseTo(120 / 256, 12);
    expect(r.weighted).toBeCloseTo(0.46875, 12);
    expect(fmtGini(r.weighted)).toBe('0,469');
    expect(fmtGini(r.gain)).toBe('0,028');
  });

  it('Vind ≥ 11 m/s?: 5/0 och 6/13, viktat 156/456 ≈ 0,342', () => {
    const r = evaluateSplit(TRAIN, { feature: 'vind', value: 11 });
    expect(r.yes).toEqual({ installd: 5, genomfors: 0 });
    expect(r.no).toEqual({ installd: 6, genomfors: 13 });
    expect(fmtGini(r.giniNo)).toBe('0,432');
    expect(r.weighted).toBeCloseTo(156 / 456, 12);
    expect(fmtGini(r.weighted)).toBe('0,342');
  });

  it('Temperatur ≥ 5 °C? ger 0,444 (förutsägelsealternativet)', () => {
    expect(fmtGini(evaluateSplit(TRAIN, { feature: 'temp', value: 5 }).weighted)).toBe('0,444');
  });
});

describe('labb 29: bästa fråga och likaläge', () => {
  it('algoritmen väljer Vind ≥ 11 m/s? i roten', () => {
    const b = bestSplit(TRAIN)!;
    expect(splitText(b.split)).toBe('Vind ≥ 11 m/s?');
    expect(rankSplits(TRAIN)[0]!.split).toEqual(b.split);
  });

  it('exakt likaläge i datan: Temperatur ≥ −3 °C? och Vind ≥ 14 m/s? ger 234/528, temperatur rankas först', () => {
    const a = evaluateSplit(TRAIN, { feature: 'temp', value: -3 });
    const b = evaluateSplit(TRAIN, { feature: 'vind', value: 14 });
    expect(a.weighted).toBeCloseTo(234 / 528, 12);
    expect(b.weighted).toBeCloseTo(234 / 528, 12);
    const ranked = rankSplits(TRAIN).map((r) => splitText(r.split));
    expect(ranked.indexOf('Temperatur ≥ −3 °C?')).toBeLessThan(ranked.indexOf('Vind ≥ 14 m/s?'));
  });

  it('likaläge: första frågan i den fasta ordningen vinner', () => {
    const rows: Row[] = [
      { id: 'a', day: 'a', vader: 'sol', temp: 10, vind: 10, label: 'genomfors' },
      { id: 'b', day: 'b', vader: 'regn', temp: 0, vind: 2, label: 'installd' },
    ];
    // alla tre frågetyper delar perfekt; väder kommer först
    const b = bestSplit(rows, candidateSplits(rows))!;
    expect(b.split).toEqual({ feature: 'vader', value: 'sol' });
  });

  it('ren nod och frågor med tom gren: ingen delning', () => {
    const pure = TRAIN.filter((r) => r.vind >= 11);
    expect(bestSplit(pure)).toBeNull();
    const one = TRAIN.slice(0, 1);
    expect(bestSplit(one)).toBeNull();
    // I den blåsiga noden ger Vind ≥ 2 m/s? en tom nej-gren; sådana frågor rankas sist och väljs aldrig
    const windy = TRAIN.filter((r) => r.vind >= 11);
    const empty = evaluateSplit(windy, { feature: 'vind', value: 2 });
    expect(empty.no).toEqual({ installd: 0, genomfors: 0 });
    expect(rankSplits(windy).at(-1)!.no.installd + rankSplits(windy).at(-1)!.no.genomfors).toBe(0);
  });
});

describe('labb 29: girig tillväxt', () => {
  const steps = growSteps();
  it('6 delningar i bredden-först-ordning', () => {
    expect(steps.map((s) => [s.path, splitText(s.result.split), fmtGini(s.result.weighted)])).toEqual([
      ['', 'Vind ≥ 11 m/s?', '0,342'],
      ['n', 'Temperatur ≥ 4 °C?', '0,293'],
      ['nj', 'Väder = moln?', '0,121'],
      ['nn', 'Väder = regn?', '0,300'],
      ['njj', 'Temperatur ≥ 12 °C?', '0,000'],
      ['nnn', 'Temperatur ≥ −3 °C?', '0,000'],
    ]);
  });

  it('fullvuxet träd: djup 4, 7 löv, alla rena, 100 % på träning', () => {
    const t = growTree(Infinity);
    expect(FULL_DEPTH).toBe(4);
    expect(treeDepth(t)).toBe(4);
    expect(leaves(t)).toHaveLength(7);
    expect(leaves(t).every((l) => l.gini === 0)).toBe(true);
    expect(accuracy(t, TRAIN).correct).toBe(24);
  });

  it('djup 0 är bara roten och svarar majoriteten (genomförs)', () => {
    const t = growTree(0);
    expect(t.split).toBeUndefined();
    expect(t.prediction).toBe('genomfors');
    expect(accuracy(t, TRAIN).correct).toBe(13);
  });

  it('deterministiskt', () => {
    expect(growSteps()).toEqual(steps);
  });
});

describe('labb 29: djup och överanpassning', () => {
  const curve = depthCurve();
  it('träning 54/75/83/88/100 %, test 58/75/92/92/83 %', () => {
    expect(curve.map((c) => [c.depth, c.leaves, c.train.correct, c.test.correct])).toEqual([
      [0, 1, 13, 7],
      [1, 2, 18, 9],
      [2, 3, 20, 11],
      [3, 5, 21, 11],
      [4, 7, 24, 10],
    ]);
    expect(curve.map((c) => pct(c.train.accuracy))).toEqual(['54 %', '75 %', '83 %', '88 %', '100 %']);
    expect(curve.map((c) => pct(c.test.accuracy))).toEqual(['58 %', '75 %', '92 %', '92 %', '83 %']);
  });

  it('djup 4 gör fel på testdag 3 och 4 (varma molniga dagar, jfr undantaget dag 13)', () => {
    const t = growTree(4);
    expect(TEST.filter((r) => predict(t, r) !== r.label).map((r) => r.id)).toEqual(['p3', 'p4']);
    expect(TRAIN.find((r) => r.id === 't13')).toMatchObject({ vader: 'moln', temp: 16, label: 'installd' });
  });
});

describe('labb 29: vägen för en ny dag', () => {
  it('regn, 3 °C, vind 4 m/s → tre frågor → inställd (löv 3/0) med maxdjup 3', () => {
    const p = predictPath(growTree(3), NEW_DAY);
    expect(p.map((n) => n.path)).toEqual(['', 'n', 'nn', 'nnj']);
    expect(p.slice(0, 3).map((n) => splitText(n.split!))).toEqual(['Vind ≥ 11 m/s?', 'Temperatur ≥ 4 °C?', 'Väder = regn?']);
    expect(p.at(-1)!.counts).toEqual({ installd: 3, genomfors: 0 });
    expect(p.at(-1)!.prediction).toBe('installd');
  });
});

describe('labb 29: handbyggt träd och kantfall', () => {
  it('tom gren ärver förälderns svar; lika många ärver också', () => {
    const windy = TRAIN.filter((r) => r.vind >= 11);
    const t = buildTree(windy, { '': { feature: 'vind', value: 2 } });
    expect(t.no!.rows).toHaveLength(0);
    expect(t.no!.prediction).toBe('installd');
    expect(t.no!.inherited).toBe(true);
    // moln-gren i roten: 4 inställda, 4 genomförda → ärver rotens majoritet (genomförs)
    const m = buildTree(TRAIN, { '': { feature: 'vader', value: 'moln' } });
    expect(m.yes!.counts).toEqual({ installd: 4, genomfors: 4 });
    expect(m.yes!.inherited).toBe(true);
    expect(m.yes!.prediction).toBe('genomfors');
  });

  it('handbyggda träd i Playwright-testet: regn i roten 15 av 24, vind + temperatur 20 av 24', () => {
    expect(accuracy(buildTree(TRAIN, { '': { feature: 'vader', value: 'regn' } }), TRAIN).correct).toBe(15);
    expect(accuracy(buildTree(TRAIN, { '': { feature: 'vind', value: 11 }, n: { feature: 'temp', value: 4 } }), TRAIN).correct).toBe(20);
  });

  it('sparad karta valideras och föräldralösa noder tas bort', () => {
    expect(isSplitMap({ '': 'vind:11', n: 'temp:4' })).toBe(true);
    expect(isSplitMap({ '': 'vind:99' })).toBe(false);
    expect(isSplitMap({ x: 'vind:11' })).toBe(false);
    expect(isSplitMap(null)).toBe(false);
    expect(Object.keys(decodeSplitMap({ '': 'vind:11', jn: 'temp:4' }))).toEqual(['']);
  });

  it('ta bort en fråga tar bort hela underträdet', () => {
    const m = { '': { feature: 'vind', value: 11 }, n: { feature: 'temp', value: 4 }, nj: { feature: 'vader', value: 'moln' } } as const;
    expect(Object.keys(pruneAt(m, 'n'))).toEqual(['']);
  });
});
