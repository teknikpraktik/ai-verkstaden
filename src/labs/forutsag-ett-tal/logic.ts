/**
 * Labb 11: linjär regression med en egenskap.
 *
 * Påhittade data: en glasskiosk noterar dagens högsta temperatur (°C) och hur
 * många glassar som såldes. Linjen skrivs som
 *     glassar = nivå + lutning · (temperatur − 20)
 * så att "nivå" betyder förutsagt antal glassar en 20-gradersdag. Det gör att
 * de två reglagen påverkar linjen oberoende av varandra.
 */

export interface DataPoint {
  x: number;
  y: number;
}

export interface Line {
  /** Förutsagt antal glassar vid 20 °C. */
  level: number;
  /** Ökning i antal glassar per grad. */
  slope: number;
}

export const PIVOT = 20;

/** Träningsdata: tio dagar i juni (påhittade). */
export const training: DataPoint[] = [
  { x: 14, y: 22 },
  { x: 16, y: 34 },
  { x: 17, y: 44 },
  { x: 19, y: 50 },
  { x: 20, y: 62 },
  { x: 22, y: 66 },
  { x: 23, y: 80 },
  { x: 25, y: 84 },
  { x: 26, y: 98 },
  { x: 28, y: 104 },
];

/**
 * Nya dagar utanför träningsdatans temperaturer: en kall vårdag och två
 * värmeböljedagar då kiosken sålde slut (den rymmer 120 glassar).
 */
export const newDays: DataPoint[] = [
  { x: 5, y: 4 },
  { x: 33, y: 118 },
  { x: 36, y: 112 },
];

export const startLine: Line = { level: 60, slope: 0 };

export const predictLine = (line: Line, x: number) => line.level + line.slope * (x - PIVOT);

export function residuals(line: Line, data: DataPoint[]): number[] {
  return data.map((p) => p.y - predictLine(line, p.x));
}

/** Medelkvadratfel. Tom data ger NaN (går inte att beräkna). */
export function mse(line: Line, data: DataPoint[]): number {
  if (data.length === 0) return NaN;
  return residuals(line, data).reduce((s, r) => s + r * r, 0) / data.length;
}

/**
 * Minsta-kvadrat-linjen. Med färre än två olika x-värden finns ingen unik
 * lutning; då blir lutningen 0 och nivån medelvärdet. Tom data ger null.
 */
export function fitLine(data: DataPoint[]): Line | null {
  const n = data.length;
  if (n === 0) return null;
  const mx = data.reduce((s, p) => s + p.x, 0) / n;
  const my = data.reduce((s, p) => s + p.y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  for (const p of data) {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) ** 2;
  }
  const slope = sxx === 0 ? 0 : sxy / sxx;
  return { slope, level: my + slope * (PIVOT - mx) };
}

/** Linjen skriven på formen y = k·x + m (för fördjupningen). */
export function slopeIntercept(line: Line): { k: number; m: number } {
  return { k: line.slope, m: line.level - line.slope * PIVOT };
}

export const fmt = (v: number, d = 1) => (Number.isFinite(v) ? v.toFixed(d).replace('.', ',').replace('-', '−') : '–');

export const isLine = (v: unknown): v is Line =>
  typeof v === 'object' && v !== null && Number.isFinite((v as Line).level) && Number.isFinite((v as Line).slope);

export const LEVEL_RANGE: [number, number] = [0, 150];
export const SLOPE_RANGE: [number, number] = [-5, 12];
