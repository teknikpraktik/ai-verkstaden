/**
 * Labb 12: träna, välj och testa.
 *
 * Påhittade data: tomatplantor i ett växthus. Varje planta har två mätvärden
 * på skalan 0–10 (fläckar på bladen och jordfuktighet) och en etikett:
 * sjuk (positiv klass) eller frisk. Sjuka plantor är ovanligare.
 *
 * Modellen är k-närmaste grannar från labb 10 (samma regler vid lika röster).
 * Litet k = krokig, detaljerad gräns (komplex modell). Stort k = enkel modell.
 *
 * Uppdelningen görs EN gång med ett fast startvärde:
 *   träning (80) | validering (35) | test (35)  – disjunkta mängder.
 * Valet av k görs bara med tränings- och valideringsdata (selectK tar inte
 * emot testdata). Testdata används först när valet är låst.
 */
import { createRng, gaussian, shuffle } from '../../lib/random';
import { predict as knnPredict, type Point as KnnPoint } from '../trana-en-klassificerare/logic';

export interface Plant {
  id: number;
  /** Fläckar på bladen, 0–10. */
  x: number;
  /** Jordfuktighet, 0–10. */
  y: number;
  sick: boolean;
}

export const DOMAIN: [number, number] = [0, 10];
export const K_OPTIONS = [1, 3, 5, 9, 15, 25, 45, 79] as const;

const clamp10 = (v: number) => Math.round(Math.min(10, Math.max(0, v)) * 10) / 10;

/** Skapar `n` påhittade plantor. Ungefär 30 % är sjuka. */
export function generatePlants(seed: number, n: number, firstId = 1): Plant[] {
  const rng = createRng(seed);
  const out: Plant[] = [];
  for (let i = 0; i < n; i++) {
    const sick = rng() < 0.3;
    const x = clamp10((sick ? 6 : 3.6) + gaussian(rng, 1.5));
    const y = clamp10((sick ? 6.2 : 4.2) + gaussian(rng, 1.7));
    out.push({ id: firstId + i, x, y, sick });
  }
  return out;
}

export interface Split {
  train: Plant[];
  validation: Plant[];
  test: Plant[];
}

export const SPLIT_SEED = 67;

/** Blanda och dela upp en gång: 80 träning, 35 validering, 35 test. */
export function makeSplit(seed = SPLIT_SEED): Split {
  const all = shuffle(createRng(seed + 1000), generatePlants(seed, 150));
  return { train: all.slice(0, 80), validation: all.slice(80, 115), test: all.slice(115) };
}

const toKnn = (p: Plant): KnnPoint => ({ id: p.id, x: p.x, y: p.y, label: p.sick ? 'b' : 'a' });

/** Förutsäg sjuk (true) eller frisk (false). Utan träningsdata: null. */
export function predictSick(train: Plant[], q: { x: number; y: number }, k: number): boolean | null {
  const p = knnPredict(train.map(toKnn), q, k);
  return p ? p.label === 'b' : null;
}

export interface Confusion {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

export interface Evaluation extends Confusion {
  total: number;
  correct: number;
  /** Träffsäkerhet 0–1 (NaN om inga plantor). */
  accuracy: number;
}

/**
 * Utvärdera k-NN tränad på `train` på plantorna `data`. När data är samma
 * mängd som train räknas varje planta som sin egen närmaste granne – precis
 * som när man mäter "träningsresultat".
 */
export function evaluate(train: Plant[], data: Plant[], k: number): Evaluation {
  const c: Confusion = { tp: 0, fp: 0, fn: 0, tn: 0 };
  for (const p of data) {
    const s = predictSick(train, p, k);
    if (s === null) continue;
    if (s && p.sick) c.tp++;
    else if (s && !p.sick) c.fp++;
    else if (!s && p.sick) c.fn++;
    else c.tn++;
  }
  const total = c.tp + c.fp + c.fn + c.tn;
  const correct = c.tp + c.tn;
  return { ...c, total, correct, accuracy: total ? correct / total : NaN };
}

export interface CurvePoint {
  k: number;
  train: Evaluation;
  validation: Evaluation;
}

/** Tränings- och valideringsresultat för varje k. Tar INTE emot testdata. */
export function validationCurve(train: Plant[], validation: Plant[], ks: readonly number[] = K_OPTIONS): CurvePoint[] {
  return ks.map((k) => ({ k, train: evaluate(train, train, k), validation: evaluate(train, validation, k) }));
}

/**
 * Välj k med högst träffsäkerhet på valideringsdata. Vid lika resultat väljs
 * det större k:et (den enklare modellen). Tar INTE emot testdata.
 */
export function selectK(train: Plant[], validation: Plant[], ks: readonly number[] = K_OPTIONS): number {
  const curve = validationCurve(train, validation, ks);
  let best = curve[0]!;
  for (const c of curve) if (c.validation.correct >= best.validation.correct) best = c;
  return best.k;
}

/**
 * Separat demonstration av dataläckage. Använder EGNA påhittade plantor
 * (andra startvärden) så att det ordinarie testet aldrig rörs.
 * "Läckt" modell: demo-testplantorna har av misstag också hamnat i träningsdatan.
 */
export function leakageDemo(train: Plant[], k: number) {
  const demoTest = generatePlants(77, 35, 1001);
  const fresh = generatePlants(78, 35, 2001);
  const leakyTrain = [...train, ...demoTest];
  return {
    k,
    honestOnDemoTest: evaluate(train, demoTest, k),
    leakyOnDemoTest: evaluate(leakyTrain, demoTest, k),
    honestOnFresh: evaluate(train, fresh, k),
    leakyOnFresh: evaluate(leakyTrain, fresh, k),
  };
}

export const pct = (v: number) => (Number.isFinite(v) ? `${Math.round(v * 100)} %` : '–');

/** Rutnät med modellens svar, för att rita gränsen. */
export function decisionGrid(train: Plant[], k: number, n = 25): (boolean | null)[][] {
  const rows: (boolean | null)[][] = [];
  for (let r = 0; r < n; r++) {
    const row: (boolean | null)[] = [];
    for (let c = 0; c < n; c++) row.push(predictSick(train, { x: ((c + 0.5) / n) * 10, y: ((r + 0.5) / n) * 10 }, k));
    rows.push(row);
  }
  return rows;
}
