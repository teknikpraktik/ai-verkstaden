import { createRng, gaussian } from '../../lib/random';

/**
 * Labb 4: En enkel klassificerare som läser handskrivna siffror på inlämnade
 * mattesvar och avgör om det står 1 eller 7. Den tittar bara på en egenskap:
 * längden på det övre strecket (mm). Två påhittade skolor, Norrby och Söderby,
 * skriver ettan på olika sätt: i Söderby har ettan ofta en lång flagga upptill.
 * All data är syntetisk och skapas med fasta startvärden.
 */

export type Group = 'norrby' | 'soderby';
export type Digit = 1 | 7;

export interface Example {
  id: string;
  group: Group;
  /** Längd på det övre strecket i millimeter (en decimal). */
  x: number;
  digit: Digit;
}

export const groupName: Record<Group, string> = { norrby: 'Norrby', soderby: 'Söderby' };

interface Dist {
  mean: number;
  sd: number;
}

/** Hur långt övre streck de två skolornas ettor och sjuor har (påhittat). */
export const distributions: Record<Group, Record<Digit, Dist>> = {
  norrby: { 1: { mean: 1.8, sd: 0.6 }, 7: { mean: 5.8, sd: 0.7 } },
  soderby: { 1: { mean: 4.1, sd: 0.5 }, 7: { mean: 6.6, sd: 0.6 } },
};

const clamp = (v: number) => Math.min(8, Math.max(0.2, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

/** Skapar `perDigit` ettor och lika många sjuor från en skola. Reproducerbart. */
export function generate(group: Group, perDigit: number, seed: number, prefix: string): Example[] {
  const rng = createRng(seed);
  const out: Example[] = [];
  for (const digit of [1, 7] as Digit[]) {
    const d = distributions[group][digit];
    for (let i = 0; i < perDigit; i++) {
      out.push({ id: `${prefix}${digit}-${i + 1}`, group, digit, x: round1(clamp(d.mean + gaussian(rng, d.sd))) });
    }
  }
  return out;
}

/** Förråd av träningsexempel. Eleven väljer hur många från varje skola som ska användas. */
export const trainingPool: Record<Group, Example[]> = {
  norrby: generate('norrby', 24, 115, 'tn'),
  soderby: generate('soderby', 12, 202, 'ts'),
};

/** Testdata: 40 svar från Norrby och 10 från Söderby (olika stora grupper med flit). */
export const testSet: Example[] = [...generate('norrby', 20, 303, 'n'), ...generate('soderby', 5, 404, 's')];

export const MAX_TRAIN: Record<Group, number> = { norrby: 48, soderby: 24 };

/** Tar de första n/2 ettorna och n/2 sjuorna ur förrådet för en skola. */
export function pick(group: Group, n: number): Example[] {
  const half = Math.max(0, Math.floor(Math.min(n, MAX_TRAIN[group]) / 2));
  const pool = trainingPool[group];
  return [...pool.filter((e) => e.digit === 1).slice(0, half), ...pool.filter((e) => e.digit === 7).slice(0, half)];
}

export function trainingSet(norrby: number, soderby: number): Example[] {
  return [...pick('norrby', norrby), ...pick('soderby', soderby)];
}

export interface Model {
  /** Modellen svarar 7 om strecket är längre än tröskeln, annars 1. */
  threshold: number;
  trainErrors: number;
  trainSize: number;
}

export const predict = (threshold: number, x: number): Digit => (x > threshold ? 7 : 1);

function errorsAt(examples: Example[], t: number): number {
  return examples.filter((e) => predict(t, e.x) !== e.digit).length;
}

/**
 * Tränar modellen: provar trösklar mitt emellan alla värden i träningsdatan och
 * väljer den som ger minst antal fel. Vid lika många fel väljs mitten av det
 * första sammanhängande intervallet med minst fel. Returnerar null om någon av
 * siffrorna saknas i träningsdatan – då finns inget att lära sig.
 */
export function train(examples: Example[]): Model | null {
  if (!examples.some((e) => e.digit === 1) || !examples.some((e) => e.digit === 7)) return null;
  const xs = [...new Set(examples.map((e) => e.x))].sort((a, b) => a - b);
  const candidates: number[] = [];
  for (let i = 0; i < xs.length - 1; i++) candidates.push(round2((xs[i]! + xs[i + 1]!) / 2));
  if (candidates.length === 0) candidates.push(xs[0]!);
  const errs = candidates.map((t) => errorsAt(examples, t));
  const min = Math.min(...errs);
  const start = errs.indexOf(min);
  let end = start;
  while (end + 1 < errs.length && errs[end + 1] === min) end++;
  const threshold = candidates[Math.floor((start + end) / 2)]!;
  return { threshold, trainErrors: min, trainSize: examples.length };
}

const round2 = (v: number) => Math.round(v * 100) / 100;

export interface GroupResult {
  group: Group;
  n: number;
  errors: number;
  /** Felandel 0–1, null om gruppen är tom. */
  rate: number | null;
  /** Ettor som lästes som 7. */
  onesAsSeven: number;
  ones: number;
  /** Sjuor som lästes som 1. */
  sevensAsOne: number;
  sevens: number;
}

export function evaluate(threshold: number, examples: Example[], group: Group): GroupResult {
  const g = examples.filter((e) => e.group === group);
  const ones = g.filter((e) => e.digit === 1);
  const sevens = g.filter((e) => e.digit === 7);
  const onesAsSeven = ones.filter((e) => predict(threshold, e.x) === 7).length;
  const sevensAsOne = sevens.filter((e) => predict(threshold, e.x) === 1).length;
  const errors = onesAsSeven + sevensAsOne;
  return { group, n: g.length, errors, rate: g.length ? errors / g.length : null, onesAsSeven, ones: ones.length, sevensAsOne, sevens: sevens.length };
}

export function evaluateAll(threshold: number, examples: Example[] = testSet) {
  const norrby = evaluate(threshold, examples, 'norrby');
  const soderby = evaluate(threshold, examples, 'soderby');
  const errors = norrby.errors + soderby.errors;
  const n = norrby.n + soderby.n;
  return { norrby, soderby, total: { errors, n, rate: n ? errors / n : null } };
}

/** Procent avrundat till heltal, eller null. */
export const pct = (rate: number | null) => (rate === null ? null : Math.round(rate * 100));

/** Förinställda urval som används i genomgången. Antal exempel från Norrby/Söderby. */
export const presets = {
  norrby24: { name: '24 från Norrby', norrby: 24, soderby: 0 },
  norrby48: { name: '48 från Norrby', norrby: 48, soderby: 0 },
  blandat24: { name: '12 från Norrby + 12 från Söderby', norrby: 12, soderby: 12 },
} as const;
export type PresetId = keyof typeof presets;

export function runPreset(id: PresetId) {
  const p = presets[id];
  const model = train(trainingSet(p.norrby, p.soderby));
  return { model, result: model ? evaluateAll(model.threshold) : null };
}

/** Text för talet med decimalkomma. */
export const sv = (v: number) => String(v).replace('.', ',');
