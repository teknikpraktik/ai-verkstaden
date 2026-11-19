import { createRng } from '../../lib/random';

/**
 * Labb 3: Ett påhittat äppelpackeri vill träna en modell som avgör om ett äpple
 * ska godkännas eller kasseras. Varje äpple (observation) finns som tabellrad,
 * som liten bild (8 × 8 pixlar) och som en kort text från kontrollanten.
 * All data är syntetisk.
 */

export type Farm = 'A' | 'B';
export type Color = 'röd' | 'grön' | 'gul';
export type Label = 'godkänd' | 'kasseras';

export interface Apple {
  id: number;
  farm: Farm;
  /** Vikt i gram. */
  weight: number;
  color: Color;
  /** Antal fläckar på skalet. */
  spots: number;
  /** Etiketten som en människa har satt. */
  label: Label;
}

export const farmName: Record<Farm, string> = { A: 'Gård A (Österlen)', B: 'Gård B (Västergötland)' };
export const COLORS: Color[] = ['röd', 'grön', 'gul'];
export const LABELS: Label[] = ['godkänd', 'kasseras'];

/** Regeln kontrollanten följer när hon sätter etiketter på nya äpplen. */
export function inspectorLabel(weight: number, spots: number): Label {
  return spots >= 3 || weight < 110 ? 'kasseras' : 'godkänd';
}

const raw: [number, number][] = [
  [152, 0], [138, 1], [171, 0], [125, 2], [144, 0],
  [98, 0], [160, 1], [133, 4], [149, 0], [127, 1],
  [166, 0], [141, 2], [118, 0], [155, 1], [136, 0],
  [129, 3], [162, 0], [147, 1], [139, 0], [158, 2],
];

/** Startdatamängden: 20 äpplen, alla röda och alla från gård A. */
export const baseApples: Apple[] = raw.map(([weight, spots], i) => ({
  id: i + 1,
  farm: 'A',
  weight,
  color: 'röd',
  spots,
  label: inspectorLabel(weight, spots),
}));

/** Färgfördelning per gård när nya äpplen samlas in (påhittad). */
export const farmColors: Record<Farm, [Color, number][]> = {
  A: [['röd', 1]],
  B: [['grön', 0.5], ['gul', 0.2], ['röd', 0.3]],
};

function pickColor(rng: () => number, farm: Farm): Color {
  let u = rng();
  for (const [c, p] of farmColors[farm]) {
    if (u < p) return c;
    u -= p;
  }
  return farmColors[farm][0]![0];
}

/**
 * Samlar in `n` nya äpplen från en gård. Samma startvärde ger samma äpplen.
 * Vikt 100–179 g, fläckar 0–4 (oftast få), etikett enligt kontrollantens regel.
 */
export function collect(farm: Farm, n: number, seed: number, startId: number): Apple[] {
  const rng = createRng(seed);
  const out: Apple[] = [];
  for (let i = 0; i < n; i++) {
    const color = pickColor(rng, farm);
    const weight = 100 + Math.floor(rng() * 80);
    const u = rng();
    const spots = u < 0.45 ? 0 : u < 0.75 ? 1 : u < 0.9 ? 2 : u < 0.97 ? 3 : 4;
    out.push({ id: startId + i, farm, weight, color, spots, label: inspectorLabel(weight, spots) });
  }
  return out;
}

export const BATCH = 20;
/** Startvärde för insamling nummer k från en gård (reproducerbart). */
export const batchSeed = (farm: Farm, k: number) => (farm === 'A' ? 1000 : 2000) + k;

export const nextId = (apples: Apple[]) => apples.reduce((m, a) => Math.max(m, a.id), 0) + 1;

/** Lägg till en insamling från en gård. `k` är vilken insamling i ordningen det är för gården. */
export function addBatch(apples: Apple[], farm: Farm, k: number): Apple[] {
  return [...apples, ...collect(farm, BATCH, batchSeed(farm, k), nextId(apples))];
}

export interface Summary {
  total: number;
  byLabel: Record<Label, number>;
  byColor: Record<Color, number>;
  byFarm: Record<Farm, number>;
  meanWeight: number | null;
}

export function summarize(apples: Apple[]): Summary {
  const byLabel: Record<Label, number> = { godkänd: 0, kasseras: 0 };
  const byColor: Record<Color, number> = { röd: 0, grön: 0, gul: 0 };
  const byFarm: Record<Farm, number> = { A: 0, B: 0 };
  let sum = 0;
  for (const a of apples) {
    byLabel[a.label]++;
    byColor[a.color]++;
    byFarm[a.farm]++;
    sum += a.weight;
  }
  return { total: apples.length, byLabel, byColor, byFarm, meanWeight: apples.length ? Math.round(sum / apples.length) : null };
}

/** Andel i hela procent, null om datamängden är tom. */
export const percent = (part: number, whole: number) => (whole === 0 ? null : Math.round((100 * part) / whole));

/** Hittar obalanser: klasser eller färger som utgör under 20 % eller saknas helt. */
export function findImbalances(s: Summary): string[] {
  if (s.total === 0) return ['Datamängden är tom – det finns inget att lära sig av.'];
  const out: string[] = [];
  for (const l of LABELS) {
    const p = percent(s.byLabel[l], s.total)!;
    if (s.byLabel[l] === 0) out.push(`Det finns inga äpplen med etiketten ”${l}”.`);
    else if (p < 20) out.push(`Bara ${s.byLabel[l]} av ${s.total} äpplen (${p} %) har etiketten ”${l}”.`);
  }
  for (const c of COLORS) if (s.byColor[c] === 0) out.push(`Det finns inga ${c === 'röd' ? 'röda' : c === 'grön' ? 'gröna' : 'gula'} äpplen.`);
  if (s.byFarm.B === 0) out.push('Alla äpplen kommer från samma gård.');
  return out;
}

/* ---------- Samma äpple som bild och som text ---------- */

/** Pixelkoder i bilden: 0 bakgrund, 1 skal, 2 fläck, 3 skaft. */
export type Pixel = 0 | 1 | 2 | 3;
export const IMAGE_SIZE = 8;

/** Gör en 8 × 8-bild av ett äpple. Små äpplen (under 120 g) ritas mindre. */
export function toImage(a: Apple): Pixel[][] {
  const r = a.weight < 120 ? 2.6 : 3.4;
  const cx = 3.5;
  const cy = 4.2;
  const img: Pixel[][] = [];
  const skin: [number, number][] = [];
  for (let y = 0; y < IMAGE_SIZE; y++) {
    const row: Pixel[] = [];
    for (let x = 0; x < IMAGE_SIZE; x++) {
      const inside = (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
      row.push(inside ? 1 : 0);
      if (inside) skin.push([y, x]);
    }
    img.push(row);
  }
  // skaft överst i mitten
  const top = skin[0];
  if (top && top[0] > 0) img[top[0] - 1]![3] = 3;
  // fläckar på bestämda ställen som beror på äpplets nummer
  const rng = createRng(a.id * 7919);
  const free = [...skin];
  for (let i = 0; i < a.spots && free.length; i++) {
    const [y, x] = free.splice(Math.floor(rng() * free.length), 1)[0]!;
    img[y]![x] = 2;
  }
  return img;
}

export function countPixels(img: Pixel[][], code: Pixel): number {
  return img.flat().filter((p) => p === code).length;
}

const colorWord: Record<Color, string> = { röd: 'Rött', grön: 'Grönt', gul: 'Gult' };

/** Kontrollantens anteckning om äpplet (textdata). */
export function toText(a: Apple): string {
  const size = a.weight < 120 ? 'litet' : a.weight > 160 ? 'stort' : 'medelstort';
  const spots = a.spots === 0 ? 'inga fläckar' : a.spots === 1 ? 'en liten fläck' : `${a.spots} fläckar`;
  return `${colorWord[a.color]} ${size} äpple med ${spots}.`;
}

export function isApple(v: unknown): v is Apple {
  if (typeof v !== 'object' || v === null) return false;
  const a = v as Apple;
  return (
    typeof a.id === 'number' &&
    (a.farm === 'A' || a.farm === 'B') &&
    typeof a.weight === 'number' &&
    COLORS.includes(a.color) &&
    typeof a.spots === 'number' &&
    LABELS.includes(a.label)
  );
}

export const isAppleList = (v: unknown): v is Apple[] => Array.isArray(v) && v.every(isApple);
