/**
 * Labb 29: Väx ett beslutsträd. Ett litet, påhittat dataset (blir
 * utomhusträningen inställd?) och ett CART-liknande beslutsträd med
 * Gini-orenhet. Allt är deterministiskt – ingen slump.
 *
 * Regler som eleverna möter i labben (testas i logic.test.ts):
 *  - Frågor är ja/nej: "väder = regn?" eller "vind ≥ 12 m/s?". Ja-grenen kommer först.
 *  - Talfrågor har gränser bland de värden som finns i träningsdatan (utom
 *    det minsta, som skulle ge en tom ja-gren vid roten).
 *  - Bästa fråga = lägst viktad Gini. Vid lika värden vinner frågan som kommer
 *    först i den fasta ordningen: väder (sol, moln, regn), temperatur
 *    (stigande gräns), vind (stigande gräns).
 *  - Algoritmen delar inte en ren nod, inte en nod på maxdjupet och inte om
 *    ingen fråga sänker orenheten. Frågor som ger en tom gren hoppas över.
 *  - Ett löv svarar med sin majoritetsklass. Vid lika många (eller inga rader)
 *    ärvs svaret från föräldern; roten utan majoritet svarar "genomförs".
 */

export type Weather = 'sol' | 'moln' | 'regn';
export type Label = 'installd' | 'genomfors';
export type Feature = 'vader' | 'temp' | 'vind';

export interface Row {
  id: string;
  /** Kort beskrivning, t.ex. "mån v. 3". */
  day: string;
  vader: Weather;
  /** Temperatur i °C. */
  temp: number;
  /** Vindstyrka i m/s. */
  vind: number;
  label: Label;
}

export type Split = { feature: 'vader'; value: Weather } | { feature: 'temp' | 'vind'; value: number };

export const WEATHERS: Weather[] = ['sol', 'moln', 'regn'];
export const FEATURES: Feature[] = ['vader', 'temp', 'vind'];
export const featureName: Record<Feature, string> = { vader: 'Väder', temp: 'Temperatur', vind: 'Vind' };
export const weatherSymbol: Record<Weather, string> = { sol: '☀', moln: '☁', regn: '☂' };
export const labelText: Record<Label, string> = { installd: 'inställd', genomfors: 'genomförs' };
export const labelSymbol: Record<Label, string> = { installd: '✗', genomfors: '✓' };

const r = (id: string, day: string, vader: Weather, temp: number, vind: number, label: Label): Row => ({ id, day, vader, temp, vind, label });
const I: Label = 'installd';
const G: Label = 'genomfors';

/** 24 träningsdagar. Dag t13 är ett undantag (inställd en fin dag – tränaren var sjuk). */
export const TRAIN: Row[] = [
  r('t1', 'Dag 1', 'sol', 18, 3, G),
  r('t2', 'Dag 2', 'sol', 22, 5, G),
  r('t3', 'Dag 3', 'sol', 12, 14, I),
  r('t4', 'Dag 4', 'sol', 6, 4, G),
  r('t5', 'Dag 5', 'sol', -3, 2, G),
  r('t6', 'Dag 6', 'sol', -10, 1, I),
  r('t7', 'Dag 7', 'sol', 15, 8, G),
  r('t8', 'Dag 8', 'moln', 10, 6, G),
  r('t9', 'Dag 9', 'moln', 14, 13, I),
  r('t10', 'Dag 10', 'moln', 2, 4, G),
  r('t11', 'Dag 11', 'moln', -1, 9, G),
  r('t12', 'Dag 12', 'moln', 8, 15, I),
  r('t13', 'Dag 13', 'moln', 16, 3, I),
  r('t14', 'Dag 14', 'moln', -9, 3, I),
  r('t15', 'Dag 15', 'regn', 3, 5, I),
  r('t16', 'Dag 16', 'regn', 1, 8, I),
  r('t17', 'Dag 17', 'regn', 12, 6, G),
  r('t18', 'Dag 18', 'regn', 9, 4, G),
  r('t19', 'Dag 19', 'regn', 4, 11, I),
  r('t20', 'Dag 20', 'regn', 16, 12, I),
  r('t21', 'Dag 21', 'regn', 7, 3, G),
  r('t22', 'Dag 22', 'regn', 2, 2, I),
  r('t23', 'Dag 23', 'sol', 9, 10, G),
  r('t24', 'Dag 24', 'moln', 5, 7, G),
];

/** 12 testdagar som aldrig används för att bygga trädet. */
export const TEST: Row[] = [
  r('p1', 'Testdag 1', 'sol', 20, 4, G),
  r('p2', 'Testdag 2', 'sol', 10, 13, I),
  r('p3', 'Testdag 3', 'moln', 17, 5, G),
  r('p4', 'Testdag 4', 'moln', 15, 2, G),
  r('p5', 'Testdag 5', 'regn', 2, 6, I),
  r('p6', 'Testdag 6', 'regn', 11, 5, G),
  r('p7', 'Testdag 7', 'moln', 0, 3, G),
  r('p8', 'Testdag 8', 'sol', -11, 2, I),
  r('p9', 'Testdag 9', 'regn', 5, 9, G),
  r('p10', 'Testdag 10', 'moln', 6, 16, I),
  r('p11', 'Testdag 11', 'sol', 13, 6, G),
  r('p12', 'Testdag 12', 'regn', 3, 3, I),
];

/** Exempeldag som klassificeras i "följ vägen"-steget. */
export const NEW_DAY: Omit<Row, 'label' | 'id'> = { day: 'Ny dag', vader: 'regn', temp: 3, vind: 4 };

export interface Counts {
  installd: number;
  genomfors: number;
}

export const countRows = (rows: readonly Row[]): Counts => ({
  installd: rows.filter((x) => x.label === 'installd').length,
  genomfors: rows.filter((x) => x.label === 'genomfors').length,
});

export const total = (c: Counts) => c.installd + c.genomfors;

/** Gini-orenhet: 1 − p(inställd)² − p(genomförs)². 0 = ren nod, 0,5 = hälften av varje. Tom nod ger 0. */
export function gini(c: Counts): number {
  const n = total(c);
  if (n === 0) return 0;
  const p = c.installd / n;
  const q = c.genomfors / n;
  return 1 - p * p - q * q;
}

export function answers(split: Split, row: Pick<Row, Feature>): boolean {
  if (split.feature === 'vader') return row.vader === split.value;
  return row[split.feature] >= split.value;
}

export function splitText(s: Split): string {
  if (s.feature === 'vader') return `Väder = ${s.value}?`;
  if (s.feature === 'temp') return `Temperatur ≥ ${fmtNum(s.value)} °C?`;
  return `Vind ≥ ${s.value} m/s?`;
}

export const splitKey = (s: Split) => `${s.feature}:${s.value}`;

export function parseSplitKey(key: string): Split | null {
  const [f, v] = key.split(':');
  if (f === 'vader') return WEATHERS.includes(v as Weather) ? { feature: 'vader', value: v as Weather } : null;
  if (f === 'temp' || f === 'vind') {
    const n = Number(v);
    return v !== undefined && v !== '' && Number.isFinite(n) && thresholds(f).includes(n) ? { feature: f, value: n } : null;
  }
  return null;
}

/** Möjliga gränser för en talfråga: alla värden i träningsdatan utom det minsta, i stigande ordning. */
export function thresholds(feature: 'temp' | 'vind', rows: readonly Row[] = TRAIN): number[] {
  const vals = [...new Set(rows.map((x) => x[feature]))].sort((a, b) => a - b);
  return vals.slice(1);
}

/** Alla frågor i den fasta ordningen som också avgör lika värden. */
export function candidateSplits(rows: readonly Row[] = TRAIN): Split[] {
  return [
    ...WEATHERS.map((value): Split => ({ feature: 'vader', value })),
    ...thresholds('temp', rows).map((value): Split => ({ feature: 'temp', value })),
    ...thresholds('vind', rows).map((value): Split => ({ feature: 'vind', value })),
  ];
}

export interface SplitResult {
  split: Split;
  yes: Counts;
  no: Counts;
  giniYes: number;
  giniNo: number;
  /** Viktat medelvärde av grenarnas Gini (vikt = andel rader). */
  weighted: number;
  parent: number;
  /** Hur mycket orenheten minskar: parent − weighted. */
  gain: number;
}

export function evaluateSplit(rows: readonly Row[], split: Split): SplitResult {
  const yesRows = rows.filter((x) => answers(split, x));
  const noRows = rows.filter((x) => !answers(split, x));
  const yes = countRows(yesRows);
  const no = countRows(noRows);
  const n = rows.length;
  const giniYes = gini(yes);
  const giniNo = gini(no);
  const weighted = n === 0 ? 0 : (yesRows.length / n) * giniYes + (noRows.length / n) * giniNo;
  const parent = gini(countRows(rows));
  return { split, yes, no, giniYes, giniNo, weighted, parent, gain: parent - weighted };
}

const EPS = 1e-12;

/**
 * Bästa fråga för raderna: lägst viktad Gini bland frågor som ger rader i
 * båda grenarna. Lika värden: första frågan i den fasta ordningen vinner.
 * null om ingen fråga sänker orenheten.
 */
export function bestSplit(rows: readonly Row[], candidates: readonly Split[] = candidateSplits()): SplitResult | null {
  let best: SplitResult | null = null;
  for (const s of candidates) {
    const res = evaluateSplit(rows, s);
    if (total(res.yes) === 0 || total(res.no) === 0) continue;
    if (best === null || res.weighted < best.weighted - EPS) best = res;
  }
  if (best === null || best.gain <= EPS) return null;
  return best;
}

/** Alla frågor rankade (bäst först, stabil ordning vid lika). Frågor med tom gren kommer sist. */
export function rankSplits(rows: readonly Row[], candidates: readonly Split[] = candidateSplits()): SplitResult[] {
  const all = candidates.map((s, i) => ({ res: evaluateSplit(rows, s), i }));
  const valid = (x: SplitResult) => total(x.yes) > 0 && total(x.no) > 0;
  return all
    .sort((a, b) => {
      const va = valid(a.res) ? 0 : 1;
      const vb = valid(b.res) ? 0 : 1;
      if (va !== vb) return va - vb;
      if (Math.abs(a.res.weighted - b.res.weighted) > EPS) return a.res.weighted - b.res.weighted;
      return a.i - b.i;
    })
    .map((x) => x.res);
}

/* ---------- Träd ---------- */

/** Nodens väg från roten: "" är roten, "j" = ja-grenen, "n" = nej-grenen, "jn" osv. */
export type Path = string;

/** Ett träd beskrivs av vilken fråga som ställs i varje inre nod. */
export type SplitMap = Record<Path, Split>;

export interface TreeNode {
  path: Path;
  depth: number;
  rows: Row[];
  counts: Counts;
  gini: number;
  /** Svaret noden ger om den är ett löv (majoritet, annars ärvt från föräldern). */
  prediction: Label;
  /** true om svaret ärvdes för att noden saknar majoritet (lika många eller inga rader). */
  inherited: boolean;
  split?: Split;
  yes?: TreeNode;
  no?: TreeNode;
}

export function majority(c: Counts, fallback: Label): { label: Label; inherited: boolean } {
  if (c.installd > c.genomfors) return { label: 'installd', inherited: false };
  if (c.genomfors > c.installd) return { label: 'genomfors', inherited: false };
  return { label: fallback, inherited: true };
}

export function buildTree(rows: readonly Row[], splits: SplitMap, path: Path = '', fallback: Label = 'genomfors'): TreeNode {
  const counts = countRows(rows);
  const m = majority(counts, fallback);
  const node: TreeNode = { path, depth: path.length, rows: [...rows], counts, gini: gini(counts), prediction: m.label, inherited: m.inherited };
  const s = splits[path];
  if (s) {
    node.split = s;
    node.yes = buildTree(
      rows.filter((x) => answers(s, x)),
      splits,
      path + 'j',
      m.label,
    );
    node.no = buildTree(
      rows.filter((x) => !answers(s, x)),
      splits,
      path + 'n',
      m.label,
    );
  }
  return node;
}

export function leaves(node: TreeNode): TreeNode[] {
  return node.yes && node.no ? [...leaves(node.yes), ...leaves(node.no)] : [node];
}

export function treeDepth(node: TreeNode): number {
  return node.yes && node.no ? 1 + Math.max(treeDepth(node.yes), treeDepth(node.no)) : 0;
}

export function findNode(node: TreeNode, path: Path): TreeNode | null {
  if (node.path === path) return node;
  if (!path.startsWith(node.path)) return null;
  const nextStep = path[node.path.length];
  const child = nextStep === 'j' ? node.yes : nextStep === 'n' ? node.no : undefined;
  return child ? findNode(child, path) : null;
}

/** Följ frågorna från roten. Returnerar alla noder längs vägen (roten först). */
export function predictPath(tree: TreeNode, example: Pick<Row, Feature>): TreeNode[] {
  const out: TreeNode[] = [tree];
  let n = tree;
  while (n.split && n.yes && n.no) {
    n = answers(n.split, example) ? n.yes : n.no;
    out.push(n);
  }
  return out;
}

export const predict = (tree: TreeNode, example: Pick<Row, Feature>): Label => predictPath(tree, example).at(-1)!.prediction;

export interface Accuracy {
  correct: number;
  total: number;
  accuracy: number;
}

export function accuracy(tree: TreeNode, rows: readonly Row[]): Accuracy {
  const correct = rows.filter((x) => predict(tree, x) === x.label).length;
  return { correct, total: rows.length, accuracy: rows.length ? correct / rows.length : NaN };
}

/* ---------- Automatisk tillväxt ---------- */

export interface GrowthStep {
  path: Path;
  result: SplitResult;
}

/**
 * Girig tillväxt bredden först: varje nod delas med sin bästa fråga tills
 * noden är ren, maxdjupet nåtts eller ingen fråga sänker orenheten.
 * Stegen kommer i den ordning de görs, så att trädet efter i steg är de i första.
 */
export function growSteps(rows: readonly Row[] = TRAIN, maxDepth = Infinity, candidates: readonly Split[] = candidateSplits(rows)): GrowthStep[] {
  const steps: GrowthStep[] = [];
  const queue: { path: Path; rows: readonly Row[] }[] = [{ path: '', rows }];
  while (queue.length) {
    const { path, rows: rs } = queue.shift()!;
    if (path.length >= maxDepth) continue;
    if (gini(countRows(rs)) === 0) continue;
    const best = bestSplit(rs, candidates);
    if (!best) continue;
    steps.push({ path, result: best });
    queue.push({ path: path + 'j', rows: rs.filter((x) => answers(best.split, x)) });
    queue.push({ path: path + 'n', rows: rs.filter((x) => !answers(best.split, x)) });
  }
  return steps;
}

export function stepsToMap(steps: readonly GrowthStep[]): SplitMap {
  const m: SplitMap = {};
  for (const s of steps) m[s.path] = s.result.split;
  return m;
}

/** Trädet med maxdjup d (d = 0 är bara roten). */
export function growTree(maxDepth: number, rows: readonly Row[] = TRAIN): TreeNode {
  return buildTree(rows, stepsToMap(growSteps(rows, maxDepth)));
}

export interface DepthPoint {
  depth: number;
  leaves: number;
  train: Accuracy;
  test: Accuracy;
}

/** Djupet där trädet slutar växa av sig självt (alla löv rena eller odelbara). */
export const FULL_DEPTH = treeDepth(growTree(Infinity));

export function depthCurve(maxDepth = FULL_DEPTH): DepthPoint[] {
  const out: DepthPoint[] = [];
  for (let d = 0; d <= maxDepth; d++) {
    const t = growTree(d);
    out.push({ depth: d, leaves: leaves(t).length, train: accuracy(t, TRAIN), test: accuracy(t, TEST) });
  }
  return out;
}

/* ---------- Formatering ---------- */

export function fmtNum(v: number, decimals = 0): string {
  const s = v.toFixed(decimals).replace('.', ',');
  return s.startsWith('-') ? `−${s.slice(1)}` : s;
}

/** Gini med tre decimaler och decimalkomma, t.ex. "0,497". */
export const fmtGini = (v: number) => fmtNum(Math.abs(v) < 5e-13 ? 0 : v, 3);

export const pct = (v: number) => (Number.isFinite(v) ? `${Math.round(v * 100)} %` : '–');

export const countsText = (c: Counts) => `${c.installd} ${labelSymbol.installd} inställd, ${c.genomfors} ${labelSymbol.genomfors} genomförs`;

/** Validering av sparad handbyggd delningskarta. */
export function isSplitMap(v: unknown): v is Record<string, string> {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  return Object.entries(v).every(([k, s]) => /^[jn]{0,4}$/.test(k) && typeof s === 'string' && parseSplitKey(s) !== null);
}

/** Gör om sparade nycklar till en delningskarta och tar bort noder vars förälder saknar fråga. */
export function decodeSplitMap(v: Record<string, string>): SplitMap {
  const out: SplitMap = {};
  for (const k of Object.keys(v).sort((a, b) => a.length - b.length)) {
    if (k !== '' && !out[k.slice(0, -1)]) continue;
    const s = parseSplitKey(v[k]!);
    if (s) out[k] = s;
  }
  return out;
}

export function encodeSplitMap(m: SplitMap): Record<string, string> {
  return Object.fromEntries(Object.entries(m).map(([k, s]) => [k, splitKey(s)]));
}

/** Ta bort en nods fråga och hela dess underträd. */
export function pruneAt(m: SplitMap, path: Path): SplitMap {
  return Object.fromEntries(Object.entries(m).filter(([k]) => !k.startsWith(path)));
}

/** Text för en nods väg, t.ex. "Väder = regn? ja → Temperatur ≥ 5 °C? nej". */
export function pathText(tree: TreeNode, path: Path): string {
  if (path === '') return 'Roten';
  const parts: string[] = [];
  let n: TreeNode | undefined = tree;
  for (const step of path) {
    if (!n?.split) break;
    parts.push(`${splitText(n.split)} ${step === 'j' ? 'ja' : 'nej'}`);
    n = step === 'j' ? n.yes : n.no;
  }
  return parts.join(' → ');
}
