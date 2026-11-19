import { createRng } from '../../lib/random';

/**
 * Labb 28: känna igen och hitta föremål i små svartvita bilder.
 * En bild är en rutnätslista med tal: 1 = svart pixel, 0 = vit pixel.
 * Igenkänning: jämför bilden med en mall per klass (likhet = överlapp).
 * Hitta föremål: låt ett fönster glida över en större bild och jämför i varje läge.
 */

export type Img = number[][];
export type ClassId = 'apple' | 'cup' | 'key';

/** Mallarnas storlek (6 × 6 pixlar). Fönstret som glider över scenen har samma storlek. */
export const SIZE = 6;

export const classOrder: ClassId[] = ['apple', 'cup', 'key'];

export const classInfo: Record<ClassId, { name: string; symbol: string; color: string }> = {
  apple: { name: 'äpple', symbol: '●', color: 'var(--c1)' },
  cup: { name: 'kopp', symbol: '▲', color: 'var(--c2)' },
  key: { name: 'nyckel', symbol: '◆', color: 'var(--c3)' },
};

/** Läs en bild ur strängar där '#' är svart och allt annat vitt. */
export function parse(rows: readonly string[]): Img {
  return rows.map((r) => [...r].map((ch) => (ch === '#' ? 1 : 0)));
}

export const templates: Record<ClassId, Img> = {
  apple: parse(['..#...', '.####.', '######', '######', '######', '.####.']),
  cup: parse(['......', '#..#..', '#..###', '#..#.#', '#..###', '####..']),
  key: parse(['......', '......', '###...', '#.####', '###.#.', '......']),
};

/** Ett föremål som liknar ett äpple men inte finns bland mallarna. */
export const ball = parse(['......', '..##..', '.####.', '.####.', '..##..', '......']);

export const emptyImage = (w = SIZE, h = SIZE): Img => Array.from({ length: h }, () => Array<number>(w).fill(0));
export const fullImage = (w = SIZE, h = SIZE): Img => Array.from({ length: h }, () => Array<number>(w).fill(1));

export const blackCount = (img: Img) => img.reduce((s, r) => s + r.reduce((a, b) => a + b, 0), 0);
export const pixelCount = (img: Img) => img.reduce((s, r) => s + r.length, 0);

export function isImage(v: unknown, w = SIZE, h = SIZE): v is Img {
  return Array.isArray(v) && v.length === h && v.every((r) => Array.isArray(r) && r.length === w && r.every((x) => x === 0 || x === 1));
}

export function togglePixel(img: Img, r: number, c: number): Img {
  return img.map((row, i) => (i === r ? row.map((v, j) => (j === c ? 1 - v : v)) : row));
}

/** Flytta bilden dx steg åt höger och dy steg nedåt. Det som hamnar utanför försvinner. */
export function shift(img: Img, dx: number, dy: number): Img {
  const h = img.length;
  const w = img[0]?.length ?? 0;
  return Array.from({ length: h }, (_, r) => Array.from({ length: w }, (_, c) => img[r - dy]?.[c - dx] ?? 0));
}

/** Vrid bilden ett kvarts varv medurs (kvadratisk bild). */
export function rotate(img: Img): Img {
  const n = img.length;
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => img[n - 1 - c]![r]!));
}

/** Byt svart mot vitt (som en bild med omvänd belysning). */
export const invert = (img: Img): Img => img.map((r) => r.map((v) => 1 - v));

/** Täck över kolumnerna från `fromCol` och åt höger med vitt (något skymmer föremålet). */
export const hideRight = (img: Img, fromCol: number): Img => img.map((r) => r.map((v, c) => (c >= fromCol ? 0 : v)));

/** Slumpa om varje pixel med sannolikheten p (vänd svart ↔ vitt). Samma startvärde ger samma brus. */
export function addNoise(img: Img, p: number, seed: number): Img {
  const rng = createRng(seed);
  return img.map((r) => r.map((v) => (rng() < p ? 1 - v : v)));
}

export interface Similarity {
  /** Svarta pixlar som finns i både bilden och mallen. */
  both: number;
  /** Svarta pixlar som finns i bilden eller mallen (eller båda). */
  either: number;
  /** both / either, mellan 0 och 1. 0 om båda är helt vita. */
  score: number;
}

/** Likhet = svarta pixlar i båda ÷ svarta pixlar i någon av dem (Jaccard-likhet). */
export function similarity(a: Img, b: Img): Similarity {
  let both = 0;
  let either = 0;
  for (let r = 0; r < a.length; r++)
    for (let c = 0; c < (a[r]?.length ?? 0); c++) {
      const x = a[r]![c]!;
      const y = b[r]?.[c] ?? 0;
      if (x && y) both++;
      if (x || y) either++;
    }
  return { both, either, score: either === 0 ? 0 : both / either };
}

export interface Classification {
  scores: ({ label: ClassId } & Similarity)[];
  /** Klassen med högst likhet, eller null om bilden saknar svarta pixlar. Lika: först i classOrder. */
  best: ClassId | null;
  bestScore: number;
}

export function classify(img: Img): Classification {
  const scores = classOrder.map((label) => ({ label, ...similarity(img, templates[label]) }));
  if (blackCount(img) === 0) return { scores, best: null, bestScore: 0 };
  let top = scores[0]!;
  for (const s of scores) if (s.score > top.score) top = s;
  return { scores, best: top.label, bestScore: top.score };
}

/** Procent med heltal, t.ex. 0.8148 → 81. */
export const pct = (score: number) => Math.round(score * 100);

/** Testbilder för igenkänningen (en ändring i taget jämfört med originalet). */
export type VariantId = 'original' | 'flyttad' | 'vriden' | 'dold' | 'inverterad' | 'tom' | 'svart';

export const variants: { id: VariantId; label: string; make: () => Img }[] = [
  { id: 'original', label: 'Koppen som i mallen', make: () => templates.cup },
  { id: 'flyttad', label: 'Flyttad 2 steg åt höger', make: () => shift(templates.cup, 2, 0) },
  { id: 'vriden', label: 'Vriden ett kvarts varv', make: () => rotate(templates.cup) },
  { id: 'dold', label: 'Högra delen skymd', make: () => hideRight(templates.cup, 3) },
  { id: 'inverterad', label: 'Omvänd belysning (svart ↔ vitt)', make: () => invert(templates.cup) },
  { id: 'tom', label: 'Helt vit bild', make: () => emptyImage() },
  { id: 'svart', label: 'Helt svart bild', make: () => fullImage() },
];
export const variantById = (id: VariantId) => variants.find((v) => v.id === id)!;
export const isVariantId = (v: unknown): v is VariantId => variants.some((x) => x.id === v);

// ---------- Scenen och det glidande fönstret ----------

export const SCENE_W = 28;
export const SCENE_H = 8;

export interface Placed {
  /** Klass, eller 'ball' för lurobjektet som inte finns bland mallarna. */
  label: ClassId | 'ball';
  x: number;
  y: number;
}

/** Föremålen i scenen (övre vänstra hörnet för deras 6 × 6-ruta). */
export const sceneObjects: Placed[] = [
  { label: 'apple', x: 1, y: 1 },
  { label: 'key', x: 8, y: 1 },
  { label: 'cup', x: 15, y: 0 },
  { label: 'ball', x: 22, y: 2 },
];

export const objectName = (l: Placed['label']) => (l === 'ball' ? 'boll' : classInfo[l].name);

export function buildScene(noise = 0, seed = 1): Img {
  const img = emptyImage(SCENE_W, SCENE_H);
  for (const o of sceneObjects) {
    const t = o.label === 'ball' ? ball : templates[o.label];
    t.forEach((row, r) => row.forEach((v, c) => {
      if (v) img[o.y + r]![o.x + c] = 1;
    }));
  }
  return noise > 0 ? addNoise(img, noise, seed) : img;
}

export function crop(img: Img, x: number, y: number, w = SIZE, h = SIZE): Img {
  return Array.from({ length: h }, (_, r) => Array.from({ length: w }, (_, c) => img[y + r]?.[x + c] ?? 0));
}

export interface WindowResult {
  x: number;
  y: number;
  best: ClassId | null;
  score: number;
  scores: Record<ClassId, number>;
}

/** Alla fönsterlägen, rad för rad från övre vänstra hörnet. */
export function slideWindow(scene: Img): WindowResult[] {
  const h = scene.length;
  const w = scene[0]?.length ?? 0;
  const out: WindowResult[] = [];
  for (let y = 0; y + SIZE <= h; y++)
    for (let x = 0; x + SIZE <= w; x++) {
      const c = classify(crop(scene, x, y));
      const scores = Object.fromEntries(c.scores.map((s) => [s.label, s.score])) as Record<ClassId, number>;
      out.push({ x, y, best: c.best, score: c.bestScore, scores });
    }
  return out;
}

const overlaps = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.abs(a.x - b.x) < SIZE && Math.abs(a.y - b.y) < SIZE;

/**
 * Fynd: fönster vars bästa likhet är minst tröskeln. Om två fynd överlappar
 * behålls bara det med högst likhet (lika: det som kom först).
 * Tröskeln jämförs i hela procent så att det eleven ser stämmer med regeln.
 */
export function detect(windows: WindowResult[], thresholdPct: number): WindowResult[] {
  const candidates = windows
    .map((w, i) => ({ w, i }))
    .filter(({ w }) => w.best !== null && pct(w.score) >= thresholdPct)
    .sort((a, b) => b.w.score - a.w.score || a.i - b.i);
  const kept: WindowResult[] = [];
  for (const { w } of candidates) if (!kept.some((k) => overlaps(k, w))) kept.push(w);
  return kept.sort((a, b) => a.x - b.x || a.y - b.y);
}

export interface Evaluation {
  /** Fynd med rätt klass högst 1 pixel från ett riktigt föremål. */
  correct: number;
  /** Fynd som inte motsvarar något föremål med den klassen (falskt positiva). */
  falsePos: number;
  /** Föremål ur mallklasserna som inget fynd träffade (missade). */
  missed: number;
  /** Per fynd: rätt eller fel. */
  verdicts: boolean[];
  /** Föremålen som missades. */
  missedObjects: Placed[];
}

export function evaluate(found: WindowResult[], objects: Placed[] = sceneObjects): Evaluation {
  const targets = objects.filter((o) => o.label !== 'ball');
  const hit = new Set<number>();
  const verdicts = found.map((f) => {
    const i = targets.findIndex((o, j) => !hit.has(j) && o.label === f.best && Math.abs(o.x - f.x) <= 1 && Math.abs(o.y - f.y) <= 1);
    if (i >= 0) hit.add(i);
    return i >= 0;
  });
  const correct = verdicts.filter(Boolean).length;
  const missedObjects = targets.filter((_, j) => !hit.has(j));
  return { correct, falsePos: found.length - correct, missed: missedObjects.length, verdicts, missedObjects };
}

/** Allt som labben visar för en viss brusnivå och tröskel. */
export function runScene(noisePct: number, thresholdPct: number, seed = 1) {
  const scene = buildScene(noisePct / 100, seed);
  const windows = slideWindow(scene);
  const found = detect(windows, thresholdPct);
  return { scene, windows, found, evaluation: evaluate(found) };
}

export const fmtPct = (score: number) => `${pct(score)} %`;
