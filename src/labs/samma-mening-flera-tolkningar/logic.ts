/**
 * Labb 18: Samma mening, flera tolkningar.
 *  1. Svensk tvetydighet där kontext avgör tolkningen.
 *  2. Moderering av ett kontrollerat, påhittat utdrag: nyckelordsregel mot kontextregel.
 *  3. En liten bigrammodell (nästa-ord-prediktion) tränad på en liten inbyggd korpus.
 */
import { tokenize } from '../gor-text-till-data/logic';
import { createRng } from '../../lib/random';

/* ------------------------------------------------------------------ */
/* 1. Tvetydighet                                                      */
/* ------------------------------------------------------------------ */

export interface Ambiguity {
  id: string;
  sentence: string;
  /** Vad som gör meningen tvetydig. */
  kind: string;
  readings: { id: string; text: string }[];
  contexts: { id: string; text: string; reading: string }[];
}

export const AMBIGUITIES: Ambiguity[] = [
  {
    id: 'kikaren',
    sentence: 'Jag såg mannen med kikaren.',
    kind: 'Meningens byggnad: ”med kikaren” kan höra till ”såg” eller till ”mannen”.',
    readings: [
      { id: 'jag', text: 'Jag tittade genom kikaren och såg mannen.' },
      { id: 'mannen', text: 'Mannen jag såg hade en kikare.' },
    ],
    contexts: [
      { id: 'balkong', text: 'Jag stod på balkongen och provade min nya kikare.', reading: 'jag' },
      { id: 'halsen', text: 'En man med en stor kikare runt halsen gick förbi.', reading: 'mannen' },
    ],
  },
  {
    id: 'tomten',
    sentence: 'Vi tittade på tomten.',
    kind: 'Ett ord med två betydelser: jultomten eller marken runt ett hus.',
    readings: [
      { id: 'jul', text: 'Vi tittade på jultomten.' },
      { id: 'mark', text: 'Vi tittade på marken där huset ska byggas.' },
    ],
    contexts: [
      { id: 'julafton', text: 'Det var julafton och barnen väntade på julklappar.', reading: 'jul' },
      { id: 'maklare', text: 'Mäklaren visade oss runt bland äppelträden.', reading: 'mark' },
    ],
  },
  {
    id: 'fil',
    sentence: 'Byt fil nu!',
    kind: 'Ett ord med flera betydelser: körfält, datorfil (eller filmjölk).',
    readings: [
      { id: 'korfalt', text: 'Byt körfält nu!' },
      { id: 'datorfil', text: 'Öppna en annan datorfil nu!' },
    ],
    contexts: [
      { id: 'lastbil', text: 'Lastbilen framför oss bromsar plötsligt.', reading: 'korfalt' },
      { id: 'dokument', text: 'Dokumentet du skickade är fel version.', reading: 'datorfil' },
    ],
  },
  {
    id: 'kassaskap',
    sentence: 'Vi säljer kassa skåp.',
    kind: 'Särskrivning: ”kassa skåp” (dåliga skåp) eller ”kassaskåp” (säkerhetsskåp) som skrivits isär.',
    readings: [
      { id: 'daliga', text: 'Vi säljer skåp som är i dåligt skick.' },
      { id: 'sakerhet', text: 'Vi säljer kassaskåp (låsbara säkerhetsskåp).' },
    ],
    contexts: [
      { id: 'repiga', text: 'Skåpen är repiga och dörrarna sitter snett.', reading: 'daliga' },
      { id: 'kodlas', text: 'Skåpen är brandsäkra och har kodlås.', reading: 'sakerhet' },
    ],
  },
];

/** Vilken tolkning ett sammanhang pekar på. null = inget sammanhang valt, meningen är tvetydig. */
export function interpret(a: Ambiguity, contextId: string | null): string | null {
  if (contextId === null) return null;
  return a.contexts.find((c) => c.id === contextId)?.reading ?? null;
}

/* ------------------------------------------------------------------ */
/* 2. Moderering                                                       */
/* ------------------------------------------------------------------ */

export type Decision = 'stoppa' | 'tillat';
export const decisionText: Record<Decision, string> = { stoppa: '⛔ Stoppas', tillat: '✓ Publiceras' };

/** Nyckelord som stoppar en kommentar i den enkla regeln. */
export const KEYWORDS = ['döda', 'dödar', 'slå', 'slår', 'skjuta', 'skjuter', 'idiot', 'idioten', 'hatar'] as const;
const KEYWORD_SET = new Set<string>(KEYWORDS);
const INSULTS = new Set(['idiot', 'idioten']);
/** Fasta, ofarliga uttryck: nyckelord + nästa ord. */
export const SAFE_PHRASES: Record<string, string[]> = {
  slå: ['upp'],
  slår: ['upp'],
  skjuta: ['upp'],
  skjuter: ['upp'],
  döda: ['tiden'],
};
const YOU = new Set(['du', 'dig', 'din', 'ditt', 'dina']);

export type ContextRuleId = 'fraser' | 'citat' | 'riktat';
export const CONTEXT_RULES: { id: ContextRuleId; label: string; description: string }[] = [
  { id: 'fraser', label: 'Fasta uttryck', description: 'Nyckelordet följs av ett ord som gör det till ett ofarligt uttryck: ”slå upp”, ”skjuta upp”, ”döda tiden”.' },
  { id: 'citat', label: 'Citat', description: 'Nyckelordet står inom citattecken – någon återger vad någon annan skrev.' },
  { id: 'riktat', label: 'Riktat mot någon', description: 'Skällsord (”idiot”) stoppas bara om ”du”, ”dig” eller ”din” finns högst tre ord bort.' },
];
export const ALL_CONTEXT_RULES: ContextRuleId[] = CONTEXT_RULES.map((r) => r.id);

export interface ModerationResult {
  decision: Decision;
  /** Nyckelord som hittades. */
  hits: string[];
  /** Förklaring på svenska. */
  reason: string;
}

interface WordPos {
  word: string;
  quoted: boolean;
}

/** Ord med små bokstäver och om de står inom citattecken ("…", ”…”, '…' eller ’…’). */
function wordsWithQuotes(text: string): WordPos[] {
  const out: WordPos[] = [];
  let quoted = false;
  for (const t of tokenize(text)) {
    if (t.kind === 'skiljetecken') {
      if (/["”“'’‘]/.test(t.text)) quoted = !quoted;
      continue;
    }
    out.push({ word: t.text.toLowerCase(), quoted });
  }
  return out;
}

/** Beslutssätt 1: stoppa om något nyckelord finns. */
export function moderateKeyword(text: string): ModerationResult {
  const hits = wordsWithQuotes(text)
    .map((w) => w.word)
    .filter((w) => KEYWORD_SET.has(w));
  if (hits.length === 0) return { decision: 'tillat', hits, reason: 'Inget nyckelord hittades.' };
  return { decision: 'stoppa', hits, reason: `Nyckelord: ${[...new Set(hits)].join(', ')}.` };
}

/** Beslutssätt 2: nyckelord, men med undantag som tittar på sammanhanget runt ordet. */
export function moderateContext(text: string, rules: readonly ContextRuleId[] = ALL_CONTEXT_RULES): ModerationResult {
  const ws = wordsWithQuotes(text);
  const hits: string[] = [];
  const excused: string[] = [];
  for (let i = 0; i < ws.length; i++) {
    const { word, quoted } = ws[i]!;
    if (!KEYWORD_SET.has(word)) continue;
    hits.push(word);
    const next = ws[i + 1]?.word;
    if (rules.includes('fraser') && next !== undefined && (SAFE_PHRASES[word] ?? []).includes(next)) {
      excused.push(`”${word} ${next}” är ett fast uttryck`);
      continue;
    }
    if (rules.includes('citat') && quoted) {
      excused.push(`”${word}” står i ett citat`);
      continue;
    }
    if (rules.includes('riktat') && INSULTS.has(word)) {
      const near = ws.slice(Math.max(0, i - 3), i + 4).some((w) => YOU.has(w.word));
      if (!near) {
        excused.push(`”${word}” riktas inte mot någon (inget ”du” i närheten)`);
        continue;
      }
    }
    return { decision: 'stoppa', hits, reason: `”${word}” stoppas – inget undantag passar.` };
  }
  if (hits.length === 0) return { decision: 'tillat', hits, reason: 'Inget nyckelord hittades.' };
  return { decision: 'tillat', hits, reason: `Undantag: ${excused.join('; ')}.` };
}

export interface ForumComment {
  id: string;
  text: string;
  /** Mänsklig bedömning i det påhittade scenariot. */
  shouldStop: boolean;
  /** Vem som påverkas om kommentaren hanteras fel. */
  affected: string;
}

/** Kontrollerat utdrag ur ett påhittat elevforum. */
export const FORUM: ForumComment[] = [
  { id: 'k1', text: 'Kan någon förklara hur man slår upp ord i ordboken?', shouldStop: false, affected: 'Eleven som ber om läxhjälp' },
  { id: 'k2', text: 'Jag måste döda tiden innan bussen går.', shouldStop: false, affected: 'Eleven som använder ett vanligt uttryck' },
  { id: 'k3', text: 'Vi kan skjuta upp mötet till torsdag.', shouldStop: false, affected: 'Elevrådet som planerar ett möte' },
  { id: 'k4', text: 'Någon skrev ”jag ska slå dig” till min kompis. Vad ska vi göra?', shouldStop: false, affected: 'Eleven som anmäler ett hot och kompisen som blev hotad' },
  { id: 'k5', text: 'Du är en idiot och alla hatar dig.', shouldStop: true, affected: 'Eleven som blir kränkt' },
  { id: 'k6', text: 'Jag var en sån idiot som glömde gympapåsen.', shouldStop: false, affected: 'Eleven som skämtar om sig själv' },
  { id: 'k7', text: 'Jag ska slå upp var du bor.', shouldStop: true, affected: 'Eleven som blir hotad' },
  { id: 'k8', text: 'Vi ses efter skolan. Du vet vad som händer då.', shouldStop: true, affected: 'Eleven som blir hotad' },
  { id: 'k9', text: 'Grattis till vinsten i schackturneringen!', shouldStop: false, affected: 'Ingen' },
  { id: 'k10', text: 'Akta dig, jag ska slå dig på rasten.', shouldStop: true, affected: 'Eleven som blir hotad' },
];

export interface ModerationRow {
  comment: ForumComment;
  keyword: ModerationResult;
  context: ModerationResult;
}

export interface MethodStats {
  stopped: number;
  /** Ofarliga kommentarer som stoppades (falskt positiva). */
  wrongStops: number;
  /** Skadliga kommentarer som publicerades (falskt negativa). */
  missed: number;
  correct: number;
}

function stats(rows: ModerationRow[], pick: (r: ModerationRow) => ModerationResult): MethodStats {
  let stopped = 0;
  let wrongStops = 0;
  let missed = 0;
  for (const r of rows) {
    const stop = pick(r).decision === 'stoppa';
    if (stop) stopped++;
    if (stop && !r.comment.shouldStop) wrongStops++;
    if (!stop && r.comment.shouldStop) missed++;
  }
  return { stopped, wrongStops, missed, correct: rows.length - wrongStops - missed };
}

export function compareModeration(comments: ForumComment[], rules: readonly ContextRuleId[] = ALL_CONTEXT_RULES) {
  const rows: ModerationRow[] = comments.map((comment) => ({ comment, keyword: moderateKeyword(comment.text), context: moderateContext(comment.text, rules) }));
  return { rows, keyword: stats(rows, (r) => r.keyword), context: stats(rows, (r) => r.context) };
}

/* ------------------------------------------------------------------ */
/* 3. Nästa ord: bigrammodell                                          */
/* ------------------------------------------------------------------ */

/** Liten egen korpus (påhittade meningar). Punkt räknas som ett eget ord och avslutar en mening. */
export const CORPUS: string[] = [
  'katten sover på soffan .',
  'katten jagar musen .',
  'hunden sover i korgen .',
  'hunden jagar katten .',
  'jag läser en bok .',
  'jag läser en tidning .',
  'jag såg en katt i parken .',
  'jag såg mannen med kikaren .',
  'mannen med hatten läser en bok .',
  'eleven läser en bok i skolan .',
  'eleven skriver en text .',
  'läraren skriver på tavlan .',
  'vi äter lunch i skolan .',
  'vi går till parken efter skolan .',
  'barnen leker i parken .',
  'barnen äter glass i parken .',
  'det regnar i dag .',
  'det är kallt i dag .',
  'i dag är det fredag .',
  'en katt sover på mattan .',
];

export const END = '.';

export interface Bigram {
  /** counts.get(föregående).get(nästa) = antal */
  counts: Map<string, Map<string, number>>;
  /** Antal ord (token) i korpusen. */
  tokens: number;
  sentences: number;
}

export function corpusTokens(sentence: string): string[] {
  return sentence.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function trainBigram(corpus: string[]): Bigram {
  const counts = new Map<string, Map<string, number>>();
  let tokens = 0;
  for (const s of corpus) {
    const ws = corpusTokens(s);
    tokens += ws.length;
    for (let i = 0; i + 1 < ws.length; i++) {
      const a = ws[i]!;
      const b = ws[i + 1]!;
      if (!counts.has(a)) counts.set(a, new Map());
      const m = counts.get(a)!;
      m.set(b, (m.get(b) ?? 0) + 1);
    }
  }
  return { counts, tokens, sentences: corpus.length };
}

/** Antal olika ordpar = antal tal modellen har lärt sig. */
export function pairCount(model: Bigram): number {
  let n = 0;
  for (const m of model.counts.values()) n += m.size;
  return n;
}

export interface NextWord {
  word: string;
  count: number;
  p: number;
}

/** Sannolikheter för nästa ord, flest först. Lika många: den som kom först i korpusen först. */
export function nextDistribution(model: Bigram, previous: string): NextWord[] {
  const m = model.counts.get(previous.toLowerCase());
  if (!m) return [];
  const total = [...m.values()].reduce((s, x) => s + x, 0);
  return [...m.entries()].map(([word, count]) => ({ word, count, p: count / total })).sort((a, b) => b.count - a.count);
}

export interface Generation {
  words: string[];
  /** Varför genereringen slutade. */
  stop: 'slut' | 'okant' | 'max';
}

/** Genererar från en startfras. Girigt = alltid mest sannolika ordet; annars dras ordet med startvärdet `seed`. */
export function generate(model: Bigram, start: string, opts: { greedy: boolean; seed?: number; maxWords?: number }): Generation {
  const words = tokenize(start)
    .filter((t) => t.kind !== 'skiljetecken')
    .map((t) => t.text.toLowerCase());
  const max = opts.maxWords ?? 10;
  if (words.length === 0) return { words, stop: 'okant' };
  const rng = createRng(opts.seed ?? 1);
  for (let i = 0; i < max; i++) {
    const dist = nextDistribution(model, words[words.length - 1]!);
    if (dist.length === 0) return { words, stop: 'okant' };
    let pick = dist[0]!;
    if (!opts.greedy) {
      let r = rng();
      for (const d of dist) {
        pick = d;
        r -= d.p;
        if (r < 0) break;
      }
    }
    words.push(pick.word);
    if (pick.word === END) return { words, stop: 'slut' };
  }
  return { words, stop: 'max' };
}
