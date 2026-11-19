/**
 * Labb 10: k-närmaste grannar (k-NN) i två dimensioner.
 *
 * Påhittade data: frukter i en fruktlåda, mätta med bredd och höjd i centimeter.
 * Klass "a" = äpple (●), klass "b" = päron (▲).
 *
 * Regler som gäller överallt i labben (och står i labbens text):
 *  - Avstånd mäts rakt (euklidiskt) i centimeter.
 *  - Om två punkter ligger exakt lika långt bort räknas den punkt som har lägst
 *    nummer (lades in först) som närmast.
 *  - Om k är större än antalet punkter används alla punkter.
 *  - Vid lika röstetal vinner klassen hos den närmaste grannen.
 *  - Utan några punkter går det inte att förutsäga något (resultatet blir null).
 */

export type ClassId = 'a' | 'b';

export interface Point {
  id: number;
  x: number;
  y: number;
  label: ClassId;
}

export const classInfo: Record<ClassId, { name: string; plural: string; symbol: string; color: string }> = {
  a: { name: 'äpple', plural: 'äpplen', symbol: '●', color: 'var(--c1)' },
  b: { name: 'päron', plural: 'päron', symbol: '▲', color: 'var(--c2)' },
};

export const X_DOMAIN: [number, number] = [3, 10];
export const Y_DOMAIN: [number, number] = [4, 12];

/** Id på den avvikande punkten (ett ovanligt högt äpple bland päronen). */
export const OUTLIER_ID = 8;

/** Startdata. Punkt 8 är den avvikande punkten. */
export const startPoints: Point[] = [
  { id: 1, x: 6.5, y: 6.0, label: 'a' },
  { id: 2, x: 7.2, y: 6.6, label: 'a' },
  { id: 3, x: 7.8, y: 7.1, label: 'a' },
  { id: 4, x: 6.0, y: 6.8, label: 'a' },
  { id: 5, x: 7.4, y: 5.6, label: 'a' },
  { id: 6, x: 8.4, y: 6.4, label: 'a' },
  { id: 7, x: 6.9, y: 7.6, label: 'a' },
  { id: 8, x: 6.2, y: 9.1, label: 'a' },
  { id: 9, x: 5.8, y: 8.3, label: 'b' },
  { id: 10, x: 6.9, y: 8.4, label: 'b' },
  { id: 11, x: 5.0, y: 9.4, label: 'b' },
  { id: 12, x: 6.0, y: 10.0, label: 'b' },
  { id: 13, x: 7.0, y: 9.8, label: 'b' },
  { id: 14, x: 6.4, y: 10.9, label: 'b' },
];

/** Den nya frukten (★) som ska klassificeras från början. */
export const startQuery = { x: 6.3, y: 8.8 };

export interface Neighbour {
  point: Point;
  distance: number;
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** De k närmaste punkterna, närmast först. Lika avstånd: lägst id först. */
export function nearest(points: Point[], q: { x: number; y: number }, k: number): Neighbour[] {
  const all = points.map((p) => ({ point: p, distance: distance(p, q) }));
  all.sort((m, n) => m.distance - n.distance || m.point.id - n.point.id);
  return all.slice(0, Math.max(0, Math.min(k, all.length)));
}

export interface Prediction {
  label: ClassId;
  votes: Record<ClassId, number>;
  neighbours: Neighbour[];
  /** true om röstetalet var lika och den närmaste grannen avgjorde. */
  tie: boolean;
}

export function predict(points: Point[], q: { x: number; y: number }, k: number): Prediction | null {
  const neighbours = nearest(points, q, k);
  if (neighbours.length === 0) return null;
  const votes: Record<ClassId, number> = { a: 0, b: 0 };
  for (const n of neighbours) votes[n.point.label]++;
  const tie = votes.a === votes.b;
  const label: ClassId = tie ? neighbours[0]!.point.label : votes.a > votes.b ? 'a' : 'b';
  return { label, votes, neighbours, tie };
}

export interface BoundaryGrid {
  cols: number;
  rows: number;
  /** cells[r][c], r = 0 längst ned. null om det inte finns några punkter. */
  cells: (ClassId | null)[][];
  /** Andel av ytan som blir klass a respektive b. */
  share: Record<ClassId, number>;
}

/** Förutsäg mittpunkten i varje ruta i ett rutnät över diagrammet. */
export function boundaryGrid(points: Point[], k: number, cols = 35, rows = 32): BoundaryGrid {
  const cells: (ClassId | null)[][] = [];
  const count: Record<ClassId, number> = { a: 0, b: 0 };
  const [x0, x1] = X_DOMAIN;
  const [y0, y1] = Y_DOMAIN;
  for (let r = 0; r < rows; r++) {
    const row: (ClassId | null)[] = [];
    for (let c = 0; c < cols; c++) {
      const q = { x: x0 + ((c + 0.5) / cols) * (x1 - x0), y: y0 + ((r + 0.5) / rows) * (y1 - y0) };
      const p = predict(points, q, k);
      row.push(p?.label ?? null);
      if (p) count[p.label]++;
    }
    cells.push(row);
  }
  const total = rows * cols;
  return { cols, rows, cells, share: { a: count.a / total, b: count.b / total } };
}

/** Antal sammanhängande "öar" av klass `label` i rutnätet (4-grannskap). */
export function regionCount(grid: BoundaryGrid, label: ClassId): number {
  const seen = grid.cells.map((row) => row.map(() => false));
  let regions = 0;
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      if (seen[r]![c] || grid.cells[r]![c] !== label) continue;
      regions++;
      const stack: [number, number][] = [[r, c]];
      seen[r]![c] = true;
      while (stack.length) {
        const [cr, cc] = stack.pop()!;
        for (const [dr, dc] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ] as const) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (nr < 0 || nc < 0 || nr >= grid.rows || nc >= grid.cols) continue;
          if (seen[nr]![nc] || grid.cells[nr]![nc] !== label) continue;
          seen[nr]![nc] = true;
          stack.push([nr, nc]);
        }
      }
    }
  }
  return regions;
}

/** Träffsäkerhet när varje punkt klassificeras av de ANDRA punkterna (lämna-en-utanför). */
export function leaveOneOutAccuracy(points: Point[], k: number): { correct: number; total: number } {
  let correct = 0;
  for (const p of points) {
    const others = points.filter((o) => o.id !== p.id);
    const pred = predict(others, p, k);
    if (pred && pred.label === p.label) correct++;
  }
  return { correct, total: points.length };
}

export const clamp = (v: number, [lo, hi]: [number, number]) => Math.min(hi, Math.max(lo, v));

/** Avrunda till en decimal så att tabellvärden blir läsbara. */
export const round1 = (v: number) => Math.round(v * 10) / 10;

export function nextId(points: Point[]): number {
  return points.reduce((m, p) => Math.max(m, p.id), 0) + 1;
}

export function addPoint(points: Point[], x: number, y: number, label: ClassId): Point[] {
  return [...points, { id: nextId(points), x: round1(clamp(x, X_DOMAIN)), y: round1(clamp(y, Y_DOMAIN)), label }];
}

export function updatePoint(points: Point[], id: number, patch: Partial<Omit<Point, 'id'>>): Point[] {
  return points.map((p) =>
    p.id === id
      ? {
          ...p,
          ...patch,
          x: round1(clamp(patch.x ?? p.x, X_DOMAIN)),
          y: round1(clamp(patch.y ?? p.y, Y_DOMAIN)),
        }
      : p,
  );
}

export function removePoint(points: Point[], id: number): Point[] {
  return points.filter((p) => p.id !== id);
}

export function isPointList(v: unknown): v is Point[] {
  return (
    Array.isArray(v) &&
    v.every(
      (p) =>
        typeof p === 'object' &&
        p !== null &&
        typeof (p as Point).id === 'number' &&
        Number.isFinite((p as Point).x) &&
        Number.isFinite((p as Point).y) &&
        ((p as Point).label === 'a' || (p as Point).label === 'b'),
    )
  );
}

export const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');
