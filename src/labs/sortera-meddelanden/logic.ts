/**
 * Labb 17: Sortera meddelanden med en textmodell.
 *
 * Modell: multinomial naiv Bayes med Laplace-utjämning (additiv utjämning med α),
 * på bag-of-words (ord räknas, ordningen ignoreras). Två klasser.
 *
 *   P(ord | klass) = (antal gånger ordet finns i klassens exempel + α) / (antal ord i klassen + α · |ordförrådet|)
 *   poäng(klass)   = ln P(klass) + summan av ln P(ord | klass) för varje känt ord i meddelandet
 *
 * Ord som inte finns i träningsmaterialet (utanför ordförrådet) hoppas över.
 * Labben visar skillnaden poäng(viktigt) − poäng(vänta) som en summa av
 * ordens bidrag: positivt tal (▲) drar mot "viktigt", negativt (▼) mot "kan vänta".
 */
import { stem, tokenize } from '../gor-text-till-data/logic';

export type Label = 'viktigt' | 'vanta';
export const LABELS: Label[] = ['viktigt', 'vanta'];
export const labelText: Record<Label, string> = { viktigt: 'Viktigt', vanta: 'Kan vänta' };
export const labelSymbol: Record<Label, string> = { viktigt: '▲', vanta: '▼' };

export interface Example {
  text: string;
  label: Label;
}

export interface Options {
  /** Utjämning α. 1 = Laplace-utjämning, 0 = ingen utjämning. */
  alpha: number;
  /** Använd stammar från labb 16 i stället för ordformer. */
  useStems: boolean;
}

export const DEFAULT_OPTIONS: Options = { alpha: 1, useStems: false };

/** Ord (och tal) med små bokstäver; skiljetecken tas bort. */
export function words(text: string, useStems = false): string[] {
  return tokenize(text)
    .filter((t) => t.kind !== 'skiljetecken')
    .map((t) => (useStems && t.kind === 'ord' ? stem(t.text).stem : t.text.toLowerCase()));
}

export interface Model {
  options: Options;
  vocabulary: Set<string>;
  docCount: Record<Label, number>;
  /** Antal förekomster per ord och klass. */
  wordCount: Record<Label, Map<string, number>>;
  /** Totalt antal ord (med upprepningar) per klass. */
  totalWords: Record<Label, number>;
}

export function train(examples: Example[], options: Options = DEFAULT_OPTIONS): Model {
  const vocabulary = new Set<string>();
  const docCount: Record<Label, number> = { viktigt: 0, vanta: 0 };
  const wordCount: Record<Label, Map<string, number>> = { viktigt: new Map(), vanta: new Map() };
  const totalWords: Record<Label, number> = { viktigt: 0, vanta: 0 };
  for (const ex of examples) {
    docCount[ex.label] += 1;
    for (const w of words(ex.text, options.useStems)) {
      vocabulary.add(w);
      wordCount[ex.label].set(w, (wordCount[ex.label].get(w) ?? 0) + 1);
      totalWords[ex.label] += 1;
    }
  }
  return { options, vocabulary, docCount, wordCount, totalWords };
}

/** ln P(ord | klass). −Infinity om sannolikheten är 0 (bara möjligt när α = 0). */
export function logLikelihood(model: Model, word: string, label: Label): number {
  const n = model.wordCount[label].get(word) ?? 0;
  const denom = model.totalWords[label] + model.options.alpha * model.vocabulary.size;
  const num = n + model.options.alpha;
  if (denom === 0 || num === 0) return -Infinity;
  return Math.log(num / denom);
}

export function logPrior(model: Model, label: Label): number {
  const total = model.docCount.viktigt + model.docCount.vanta;
  if (total === 0 || model.docCount[label] === 0) return -Infinity;
  return Math.log(model.docCount[label] / total);
}

/** Skillnad mellan två logaritmer som klarar oändligheter. NaN betyder "går inte att avgöra". */
function diff(a: number, b: number): number {
  if (a === b) return 0; // även −∞ − −∞
  return a - b;
}

export interface WordInfluence {
  word: string;
  /** Hur många gånger ordet står i meddelandet. */
  count: number;
  known: boolean;
  /** Antal gånger ordet finns i respektive klass i träningsdata. */
  inViktigt: number;
  inVanta: number;
  /** ln P(ord|viktigt) − ln P(ord|vänta) per förekomst. 0 för okända ord. */
  weight: number;
  /** weight · count */
  total: number;
}

export interface Classification {
  words: string[];
  influences: WordInfluence[];
  /** ln P(viktigt) − ln P(vänta) */
  prior: number;
  /** prior + summan av alla ords bidrag. NaN om modellen inte kan avgöra. */
  score: number;
  /** null = oavgjort eller går inte att avgöra. */
  decision: Label | null;
  knownCount: number;
  unknownCount: number;
  /** Sannolikheten för "viktigt" enligt modellen (0–1), NaN om den inte går att räkna ut. */
  pViktigt: number;
}

export function classify(model: Model, text: string): Classification {
  const ws = words(text, model.options.useStems);
  const counts = new Map<string, number>();
  for (const w of ws) counts.set(w, (counts.get(w) ?? 0) + 1);
  const influences: WordInfluence[] = [...counts].map(([word, count]) => {
    const known = model.vocabulary.has(word);
    const weight = known ? diff(logLikelihood(model, word, 'viktigt'), logLikelihood(model, word, 'vanta')) : 0;
    return {
      word,
      count,
      known,
      inViktigt: model.wordCount.viktigt.get(word) ?? 0,
      inVanta: model.wordCount.vanta.get(word) ?? 0,
      weight,
      total: weight * count,
    };
  });
  const prior = diff(logPrior(model, 'viktigt'), logPrior(model, 'vanta'));
  const score = influences.reduce((s, i) => s + i.total, prior);
  const decision: Label | null = Number.isNaN(score) || score === 0 ? null : score > 0 ? 'viktigt' : 'vanta';
  const pViktigt = Number.isNaN(score) ? NaN : score === Infinity ? 1 : score === -Infinity ? 0 : 1 / (1 + Math.exp(-score));
  const knownCount = influences.filter((i) => i.known).reduce((s, i) => s + i.count, 0);
  return { words: ws, influences, prior, score, decision, knownCount, unknownCount: ws.length - knownCount, pViktigt };
}

export interface HeldOutRow {
  example: Example;
  result: Classification;
  correct: boolean;
}

export interface HeldOutReport {
  rows: HeldOutRow[];
  errors: number;
  /** tp: viktigt som viktigt, fn: viktigt som vänta (eller oavgjort), fp: vänta som viktigt, tn: vänta som vänta (eller oavgjort räknas som fel). */
  tp: number;
  fn: number;
  fp: number;
  tn: number;
  undecided: number;
}

/** Utvärdera på reserverade exempel som modellen aldrig har sett. Oavgjort räknas som fel. */
export function evaluate(model: Model, heldOut: Example[]): HeldOutReport {
  const rows = heldOut.map((example) => {
    const result = classify(model, example.text);
    return { example, result, correct: result.decision === example.label };
  });
  const count = (f: (r: HeldOutRow) => boolean) => rows.filter(f).length;
  return {
    rows,
    errors: count((r) => !r.correct),
    tp: count((r) => r.example.label === 'viktigt' && r.result.decision === 'viktigt'),
    fn: count((r) => r.example.label === 'viktigt' && r.result.decision !== 'viktigt'),
    fp: count((r) => r.example.label === 'vanta' && r.result.decision === 'viktigt'),
    tn: count((r) => r.example.label === 'vanta' && r.result.decision === 'vanta'),
    undecided: count((r) => r.result.decision === null),
  };
}

/** Formaterar ett bidrag med tecken och pil, t.ex. "▲ +0,85" eller "▼ −0,40". */
export function formatWeight(w: number): string {
  if (Number.isNaN(w)) return '? (går inte att räkna)';
  if (w === Infinity) return '▲ +∞';
  if (w === -Infinity) return '▼ −∞';
  const r = Math.round(w * 100) / 100;
  if (r === 0) return '● 0,00';
  const s = Math.abs(r).toFixed(2).replace('.', ',');
  return r > 0 ? `▲ +${s}` : `▼ −${s}`;
}

/* ------------------------------------------------------------------ */
/* Syntetiska data: påhittade meddelanden från en påhittad skola        */
/* ------------------------------------------------------------------ */

export const TRAINING: Example[] = [
  { text: 'Provet i matte flyttas till fredag', label: 'viktigt' },
  { text: 'Lämna in uppsatsen senast i morgon', label: 'viktigt' },
  { text: 'Bussen till friluftsdagen går klockan sju', label: 'viktigt' },
  { text: 'Glöm inte att anmäla dig till provet', label: 'viktigt' },
  { text: 'Lektionen är inställd i dag', label: 'viktigt' },
  { text: 'Ta med legitimation till provet', label: 'viktigt' },
  { text: 'Inlämningen stänger i kväll', label: 'viktigt' },
  { text: 'Mötet med mentor flyttas till i morgon', label: 'viktigt' },
  { text: 'Tipsa gärna om böcker till biblioteket', label: 'vanta' },
  { text: 'Elevrådet söker idéer till vårfesten', label: 'vanta' },
  { text: 'Bilder från friluftsdagen finns nu', label: 'vanta' },
  { text: 'Kören övar som vanligt på torsdag', label: 'vanta' },
  { text: 'Ny meny i matsalen nästa månad', label: 'vanta' },
  { text: 'Fotoklubben träffas inte i dag', label: 'vanta' },
  { text: 'Vill du vara med i schackklubben', label: 'vanta' },
  { text: 'Lunchen serveras som vanligt på fredag', label: 'vanta' },
];

/** Reserverade exempel: används bara för att mäta fel, aldrig för träning. */
export const HELD_OUT: Example[] = [
  { text: 'Provet flyttas till måndag', label: 'viktigt' },
  { text: 'Lämna in labbrapporten i kväll', label: 'viktigt' },
  { text: 'Skolan stängd på grund av snöstorm', label: 'viktigt' },
  { text: 'Elevrådet söker fler medlemmar', label: 'vanta' },
  { text: 'Bilder från vårfesten finns i biblioteket', label: 'vanta' },
  { text: 'Det blir inget prov i morgon', label: 'vanta' },
];

/** Meddelanden som labben föreslår att prova. */
export const PROBES = {
  start: 'Lektionen är inställd i morgon',
  negation: 'Lektionen är inte inställd i morgon',
  unknown: 'Glassbilen kommer efter skolan',
  empty: '',
} as const;
