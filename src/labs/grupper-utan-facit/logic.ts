/**
 * Labb 13: k-means-klustring steg för steg.
 *
 * Påhittade data: fritidsvanor i en påhittad klass – timmar träning och timmar
 * läsning per vecka. Inga etiketter finns: algoritmen hittar grupper själv.
 *
 * Regler (står också i labbens text):
 *  - Startcentrum: k olika slumpvalda datapunkter, bestämda av startvärdet.
 *    Om k är större än antalet punkter placeras de extra centrumen på
 *    slumpvalda platser i diagrammet (de blir tomma kluster).
 *  - Tilldelning: varje punkt går till närmaste centrum. Lika avstånd: lägst nummer.
 *  - Uppdatering: varje centrum flyttas till medelpunkten av sina punkter.
 *    Ett tomt kluster behåller sitt centrum där det är.
 *  - Algoritmen stannar när ingen punkt byter kluster (eller efter 20 varv).
 */
import { createRng, shuffle } from '../../lib/random';

export interface P {
  x: number;
  y: number;
}

export const DOMAIN: [number, number] = [0, 12];
export const MAX_ITER = 20;

export const datasets = {
  klassen: {
    name: 'Klassen (21 elever)',
    points: [
      { x: 9, y: 1 },
      { x: 10, y: 2 },
      { x: 8.5, y: 2.5 },
      { x: 10.5, y: 1 },
      { x: 9.5, y: 3 },
      { x: 8, y: 1.5 },
      { x: 11, y: 2.5 },
      { x: 1, y: 9 },
      { x: 2, y: 10.5 },
      { x: 1.5, y: 8 },
      { x: 3, y: 9.5 },
      { x: 0.5, y: 10 },
      { x: 2.5, y: 8.5 },
      { x: 4, y: 3 },
      { x: 5, y: 4 },
      { x: 3.5, y: 4.5 },
      { x: 5.5, y: 2.5 },
      { x: 4.5, y: 5 },
      { x: 3, y: 3 },
      { x: 6, y: 7 },
      { x: 7, y: 6 },
    ] as P[],
  },
  liten: {
    name: 'Liten grupp (4 elever)',
    points: [
      { x: 2, y: 2 },
      { x: 3, y: 2.5 },
      { x: 9, y: 9 },
      { x: 10, y: 8 },
    ] as P[],
  },
} as const;

export type DatasetId = keyof typeof datasets;

export type Phase = 'init' | 'assign' | 'update' | 'done';

export interface Frame {
  phase: Phase;
  iteration: number;
  centroids: P[];
  /** Klusterindex per punkt, null innan första tilldelningen. */
  assignment: number[] | null;
  /** Summan av kvadrerade avstånd till respektive centrum (null innan tilldelning). */
  inertia: number | null;
  /** Antal punkter som bytte kluster i denna tilldelning. */
  changed: number;
  /** Index för kluster utan punkter. */
  empty: number[];
  message: string;
}

const d2 = (a: P, b: P) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
const r2 = (v: number) => Math.round(v * 100) / 100;

export function initialCentroids(points: P[], k: number, seed: number): P[] {
  const rng = createRng(seed);
  const order = shuffle(
    rng,
    points.map((_, i) => i),
  );
  const out: P[] = order.slice(0, Math.min(k, points.length)).map((i) => ({ ...points[i]! }));
  while (out.length < k) out.push({ x: r2(DOMAIN[0] + rng() * (DOMAIN[1] - DOMAIN[0])), y: r2(DOMAIN[0] + rng() * (DOMAIN[1] - DOMAIN[0])) });
  return out;
}

export function assign(points: P[], centroids: P[]): number[] {
  return points.map((p) => {
    let best = 0;
    for (let c = 1; c < centroids.length; c++) if (d2(p, centroids[c]!) < d2(p, centroids[best]!)) best = c;
    return best;
  });
}

export function update(points: P[], centroids: P[], assignment: number[]): P[] {
  return centroids.map((c, j) => {
    const mine = points.filter((_, i) => assignment[i] === j);
    if (mine.length === 0) return c;
    return { x: mine.reduce((s, p) => s + p.x, 0) / mine.length, y: mine.reduce((s, p) => s + p.y, 0) / mine.length };
  });
}

export function inertia(points: P[], centroids: P[], assignment: number[]): number {
  return points.reduce((s, p, i) => s + d2(p, centroids[assignment[i]!]!), 0);
}

const emptyOf = (k: number, assignment: number[]) => Array.from({ length: k }, (_, j) => j).filter((j) => !assignment.includes(j));

/** Hela förloppet som ögonblicksbilder: start → tilldela → uppdatera → … → klart. */
export function kmeans(points: P[], k: number, seed: number): Frame[] {
  const frames: Frame[] = [];
  if (points.length === 0 || k < 1) {
    return [{ phase: 'done', iteration: 0, centroids: [], assignment: [], inertia: null, changed: 0, empty: [], message: 'Det finns inga punkter att dela in i grupper.' }];
  }
  let centroids = initialCentroids(points, k, seed);
  const extra = Math.max(0, k - points.length);
  frames.push({
    phase: 'init',
    iteration: 0,
    centroids,
    assignment: null,
    inertia: null,
    changed: 0,
    empty: [],
    message: `Start: ${Math.min(k, points.length)} centrum placeras på slumpvalda punkter (startvärde ${seed}).${extra ? ` k är större än antalet punkter, så ${extra} centrum placeras på slumpvalda platser.` : ''}`,
  });
  let prev: number[] | null = null;
  for (let it = 1; it <= MAX_ITER; it++) {
    const a = assign(points, centroids);
    const changed = prev ? a.filter((v, i) => v !== prev![i]).length : points.length;
    const empty = emptyOf(k, a);
    const inn = inertia(points, centroids, a);
    if (prev && changed === 0) {
      frames.push({ phase: 'done', iteration: it, centroids, assignment: a, inertia: inn, changed, empty, message: `Ingen punkt bytte grupp – algoritmen är klar efter ${it - 1} uppdateringar.` });
      return frames;
    }
    frames.push({
      phase: 'assign',
      iteration: it,
      centroids,
      assignment: a,
      inertia: inn,
      changed,
      empty,
      message: `Varv ${it}, tilldelning: varje punkt går till närmaste centrum.${prev ? ` ${changed} punkt${changed === 1 ? '' : 'er'} bytte grupp.` : ''}${empty.length ? ` Tomt kluster: ${empty.map((j) => `C${j + 1}`).join(', ')}.` : ''}`,
    });
    centroids = update(points, centroids, a);
    frames.push({
      phase: 'update',
      iteration: it,
      centroids,
      assignment: a,
      inertia: inertia(points, centroids, a),
      changed: 0,
      empty,
      message: `Varv ${it}, uppdatering: varje centrum flyttas till medelpunkten av sina punkter.${empty.length ? ' Tomma kluster står kvar.' : ''}`,
    });
    prev = a;
  }
  const a = assign(points, centroids);
  frames.push({ phase: 'done', iteration: MAX_ITER, centroids, assignment: a, inertia: inertia(points, centroids, a), changed: 0, empty: emptyOf(k, a), message: `Stoppade efter ${MAX_ITER} varv.` });
  return frames;
}

/** Slutresultat som jämförbar text: grupperna som mängder av punktnummer, sorterade. */
export function partitionKey(assignment: number[]): string {
  const groups = new Map<number, number[]>();
  assignment.forEach((c, i) => groups.set(c, [...(groups.get(c) ?? []), i + 1]));
  return [...groups.values()]
    .map((g) => g.join(','))
    .sort()
    .join(' | ');
}

export function finalFrame(points: P[], k: number, seed: number): Frame {
  const f = kmeans(points, k, seed);
  return f[f.length - 1]!;
}

export const fmt = (v: number | null, d = 1) => (v === null || !Number.isFinite(v) ? '–' : v.toFixed(d).replace('.', ','));
