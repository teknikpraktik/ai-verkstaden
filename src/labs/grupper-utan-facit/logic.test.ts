import { describe, expect, it } from 'vitest';
import { assign, datasets, finalFrame, fmt, initialCentroids, kmeans, partitionKey, update } from './logic';

const pts = datasets.klassen.points;

describe('labb 13: k-means', () => {
  it('samma startvärde ger samma resultat', () => {
    expect(kmeans(pts, 3, 5)).toEqual(kmeans(pts, 3, 5));
    expect(initialCentroids(pts, 4, 2)).toEqual(initialCentroids(pts, 4, 2));
  });

  it('olika startvärden kan ge olika resultat: startvärde 8 ger en annan indelning än 1–7 (k = 3)', () => {
    const good = partitionKey(finalFrame(pts, 3, 1).assignment!);
    for (let s = 2; s <= 7; s++) expect(partitionKey(finalFrame(pts, 3, s).assignment!)).toBe(good);
    expect(partitionKey(finalFrame(pts, 3, 8).assignment!)).not.toBe(good);
    expect(fmt(finalFrame(pts, 3, 1).inertia)).toBe('49,3');
    expect(fmt(finalFrame(pts, 3, 8).inertia)).toBe('143,4');
    expect(good).toBe('1,2,3,4,5,6,7 | 14,15,16,17,18,19,20,21 | 8,9,10,11,12,13');
  });

  it('centrumen i lärarhandledningens tolkning (k = 3, startvärde 1) och startvärde 8:s grupper', () => {
    const f = finalFrame(pts, 3, 1);
    const cs = f.centroids.map((c) => `${fmt(c.x)};${fmt(c.y)}`).sort();
    expect(cs).toEqual(['1,8;9,3', '4,8;4,4', '9,5;1,9']);
    expect(partitionKey(finalFrame(pts, 3, 8).assignment!)).toBe('1,3,6,17 | 2,4,5,7 | 8,9,10,11,12,13,14,15,16,18,19,20,21');
  });

  it('startvärde 1 med k = 3: start, tilldelning, uppdatering, klar', () => {
    expect(kmeans(pts, 3, 1).map((f) => f.phase)).toEqual(['init', 'assign', 'update', 'done']);
    expect(kmeans(pts, 3, 8).map((f) => f.phase)).toEqual(['init', 'assign', 'update', 'assign', 'update', 'done']);
  });

  it('summan av kvadratavstånd minskar när k ökar (startvärde 1)', () => {
    const vals = [2, 3, 4, 5].map((k) => fmt(finalFrame(pts, k, 1).inertia));
    expect(vals).toEqual(['153,7', '49,3', '29,7', '24,4']);
  });

  it('summan minskar aldrig under förloppet', () => {
    for (let s = 1; s <= 8; s++) {
      const v = kmeans(pts, 4, s)
        .map((f) => f.inertia)
        .filter((x): x is number => x !== null);
      for (let i = 1; i < v.length; i++) expect(v[i]!).toBeLessThanOrEqual(v[i - 1]! + 1e-9);
    }
  });

  it('uppdatering: centrum flyttas till medelpunkten; tomt kluster står kvar', () => {
    const p = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
    ];
    expect(update(p, [{ x: 1, y: 5 }, { x: 9, y: 9 }], [0, 0])).toEqual([{ x: 1, y: 0 }, { x: 9, y: 9 }]);
  });

  it('lika avstånd: lägst klusternummer vinner', () => {
    expect(assign([{ x: 1, y: 0 }], [{ x: 0, y: 0 }, { x: 2, y: 0 }])).toEqual([0]);
  });

  it('k större än antalet punkter ger tomma kluster men kraschar inte', () => {
    const small = datasets.liten.points;
    const frames = kmeans(small, 6, 1);
    const last = frames[frames.length - 1]!;
    expect(last.phase).toBe('done');
    expect(last.centroids).toHaveLength(6);
    expect(last.empty.length).toBeGreaterThanOrEqual(2);
    expect(last.inertia).toBe(0);
  });

  it('inga punkter', () => {
    const f = kmeans([], 3, 1);
    expect(f).toHaveLength(1);
    expect(f[0]!.message).toMatch(/inga punkter/);
  });
});
