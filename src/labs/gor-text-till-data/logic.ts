/**
 * Labb 16: Gör text till data.
 * Tokenisering, en liten regelbaserad svensk stemmer, en REDUCERAD handgjord
 * lemmaordlista och ordvektorer som räknar förekomster.
 * Allt är medvetet förenklat så att varje steg går att följa för hand.
 */

export type TokenKind = 'ord' | 'tal' | 'skiljetecken';

export interface Token {
  text: string;
  kind: TokenKind;
}

/**
 * Ord: bokstäver (inklusive å, ä, ö och andra bokstäver), gärna med bindestreck
 * inuti ("e-post"). Tal: siffror, med decimaltecken eller tidsavskiljare ("8.30", "2,5").
 * Allt annat som inte är mellanslag blir ett skiljetecken var för sig.
 */
const TOKEN_RE = /\p{L}+(?:-\p{L}+)*|\d+(?:[.,:]\d+)*|[^\s\p{L}\d]/gu;

export function tokenize(text: string): Token[] {
  const out: Token[] = [];
  for (const m of text.matchAll(TOKEN_RE)) {
    const t = m[0];
    const kind: TokenKind = /^\p{L}/u.test(t) ? 'ord' : /^\d/.test(t) ? 'tal' : 'skiljetecken';
    out.push({ text: t, kind });
  }
  return out;
}

export const isWordLike = (t: Token) => t.kind !== 'skiljetecken';

/* ------------------------------------------------------------------ */
/* Stemming                                                            */
/* ------------------------------------------------------------------ */

/**
 * Ändelser som klipps bort, längsta först. Egen förenklad regelsamling –
 * inte en fullständig svensk stemmer.
 */
export const SUFFIXES = [
  'heterna', 'hetens', 'heten', 'heter',
  'arnas', 'ernas', 'ornas', 'andes',
  'arna', 'erna', 'orna', 'ande', 'ende', 'aste',
  'ast', 'are', 'ade', 'ens', 'ets', 'het',
  'ar', 'er', 'or', 'en', 'et', 'an', 'ad', 'at', 'it', 'na', 'as', 'es',
  'a', 'e', 's',
] as const;

/** Stammen måste ha minst så här många bokstäver kvar. */
export const MIN_STEM = 3;
const VOWEL = /[aeiouyåäö]/;

export interface StemResult {
  stem: string;
  /** Ändelsen som klipptes bort, eller null om ingen regel passade. */
  suffix: string | null;
}

/** Klipper bort den längsta ändelse som passar, om minst MIN_STEM bokstäver (med en vokal) blir kvar. */
export function stem(word: string): StemResult {
  const w = word.toLowerCase();
  if (!/^\p{L}+(?:-\p{L}+)*$/u.test(w)) return { stem: w, suffix: null };
  for (const s of SUFFIXES) {
    if (w.length - s.length >= MIN_STEM && w.endsWith(s)) {
      const rest = w.slice(0, -s.length);
      if (VOWEL.test(rest)) return { stem: rest, suffix: s };
    }
  }
  return { stem: w, suffix: null };
}

/* ------------------------------------------------------------------ */
/* Lemmatisering med en reducerad ordlista                             */
/* ------------------------------------------------------------------ */

/** Grundform → böjningsformer. Handgjord och REDUCERAD: bara orden i labbens exempel och några till. */
const LEMMA_ENTRIES: [string, string[]][] = [
  // verb
  ['vara', ['är', 'var', 'varit', 'vara']],
  ['ha', ['har', 'hade', 'haft', 'ha']],
  ['gå', ['går', 'gick', 'gått', 'gå']],
  ['springa', ['springer', 'sprang', 'sprungit', 'springa', 'spring']],
  ['läsa', ['läser', 'läste', 'läst', 'läsa']],
  ['skriva', ['skriver', 'skrev', 'skrivit', 'skriva']],
  ['se', ['ser', 'såg', 'sett', 'se']],
  ['sova', ['sover', 'sov', 'sovit', 'sova']],
  ['leka', ['leker', 'lekte', 'lekt', 'leka']],
  ['komma', ['kommer', 'kom', 'kommit', 'komma']],
  ['få', ['får', 'fick', 'fått', 'få']],
  ['göra', ['gör', 'gjorde', 'gjort', 'göra']],
  ['handla', ['handlar', 'handlade', 'handlat', 'handla']],
  ['skälla', ['skäller', 'skällde', 'skällt', 'skälla']],
  ['äta', ['äter', 'åt', 'ätit', 'äta']],
  // substantiv
  ['hund', ['hund', 'hunden', 'hundar', 'hundarna', 'hundens']],
  ['katt', ['katt', 'katten', 'katter', 'katterna']],
  ['bok', ['bok', 'boken', 'böcker', 'böckerna']],
  ['man', ['man', 'mannen', 'män', 'männen']],
  ['mus', ['mus', 'musen', 'möss', 'mössen']],
  ['barn', ['barn', 'barnet', 'barnen']],
  ['elev', ['elev', 'eleven', 'elever', 'eleverna']],
  ['skola', ['skola', 'skolan', 'skolor', 'skolorna']],
  ['lärare', ['lärare', 'läraren', 'lärarna']],
  ['dag', ['dag', 'dagen', 'dagar', 'dagarna']],
  ['park', ['park', 'parken', 'parker']],
  ['text', ['text', 'texten', 'texter', 'texterna']],
  ['ord', ['ord', 'ordet', 'orden']],
  ['dator', ['dator', 'datorn', 'datorer', 'datorerna']],
  ['hem', ['hem', 'hemmet', 'hemma']],
  // adjektiv
  ['bra', ['bra', 'bättre', 'bäst', 'bästa']],
  ['stor', ['stor', 'stort', 'stora', 'större', 'störst', 'största']],
  ['liten', ['liten', 'litet', 'lilla', 'små', 'mindre', 'minst']],
  ['gammal', ['gammal', 'gammalt', 'gamla', 'äldre', 'äldst']],
  // småord (grundform = sig själva)
  ['och', ['och']], ['i', ['i']], ['på', ['på']], ['till', ['till']], ['med', ['med']], ['om', ['om']],
  ['för', ['för']], ['av', ['av']], ['inte', ['inte']], ['att', ['att']], ['som', ['som']],
  ['en', ['en', 'ett']], ['den', ['den', 'det', 'de']], ['jag', ['jag', 'mig']], ['du', ['du', 'dig']],
  ['hon', ['hon', 'henne']], ['han', ['han', 'honom']], ['vi', ['vi', 'oss']], ['också', ['också']], ['hel', ['hel', 'helt', 'hela']],
];

export const LEMMA_DICT: ReadonlyMap<string, string> = (() => {
  const m = new Map<string, string>();
  for (const [lemma, forms] of LEMMA_ENTRIES) for (const f of forms) if (!m.has(f)) m.set(f, lemma);
  return m;
})();

/** Antal grundformer och böjningsformer i den reducerade ordlistan. */
export const DICT_SIZE = { lemmas: LEMMA_ENTRIES.length, forms: LEMMA_DICT.size };

/** Former där ordlistan alltid väljer en tolkning fast ordet kan betyda flera saker. */
export const AMBIGUOUS_FORMS: Readonly<Record<string, string>> = {
  var: '”var” kan vara verbet vara (”hon var trött”) eller frågeordet var (”var bor du?”). Ordlistan väljer alltid ”vara”.',
  får: '”får” kan vara verbet få eller djuret får. Ordlistan väljer alltid ”få”.',
  man: '”man” kan vara substantivet man eller pronomenet man (”man får inte springa”). Ordlistan väljer alltid substantivet.',
  en: '”en” kan vara räkneordet, artikeln eller trädet en. Ordlistan väljer artikeln.',
};

export interface LemmaResult {
  lemma: string;
  /** false om ordet inte finns i den reducerade ordlistan – då "faller det igenom" oförändrat. */
  known: boolean;
  ambiguous?: string;
}

export function lemmatize(word: string): LemmaResult {
  const w = word.toLowerCase();
  const lemma = LEMMA_DICT.get(w);
  if (lemma === undefined) return { lemma: w, known: false };
  const amb = AMBIGUOUS_FORMS[w];
  return amb ? { lemma, known: true, ambiguous: amb } : { lemma, known: true };
}

/* ------------------------------------------------------------------ */
/* Jämförelse per token                                                */
/* ------------------------------------------------------------------ */

export interface TokenRow {
  token: Token;
  normalized: string;
  stem: StemResult;
  lemma: LemmaResult;
}

export function analyze(text: string, lowercase = true): TokenRow[] {
  return tokenize(text).map((token) => {
    const normalized = lowercase ? token.text.toLowerCase() : token.text;
    if (token.kind !== 'ord') {
      return { token, normalized, stem: { stem: token.text, suffix: null }, lemma: { lemma: token.text, known: true } };
    }
    return { token, normalized, stem: stem(token.text), lemma: lemmatize(token.text) };
  });
}

export interface AnalysisSummary {
  tokens: number;
  words: number;
  numbers: number;
  punctuation: number;
  /** Antal olika termer (ord och tal) med respektive representation. */
  distinct: Record<Representation, number>;
  unknownWords: string[];
}

export function summarizeAnalysis(rows: TokenRow[]): AnalysisSummary {
  const termsOf = (rep: Representation) => new Set(rows.filter((r) => isWordLike(r.token)).map((r) => termFor(r, rep))).size;
  const unknown = [...new Set(rows.filter((r) => r.token.kind === 'ord' && !r.lemma.known).map((r) => r.lemma.lemma))];
  return {
    tokens: rows.length,
    words: rows.filter((r) => r.token.kind === 'ord').length,
    numbers: rows.filter((r) => r.token.kind === 'tal').length,
    punctuation: rows.filter((r) => r.token.kind === 'skiljetecken').length,
    distinct: { ordform: termsOf('ordform'), stam: termsOf('stam'), lemma: termsOf('lemma') },
    unknownWords: unknown,
  };
}

/* ------------------------------------------------------------------ */
/* Ordvektorer                                                         */
/* ------------------------------------------------------------------ */

export type Representation = 'ordform' | 'stam' | 'lemma';

export const representationLabel: Record<Representation, string> = {
  ordform: 'Ordform (bara tokenisering)',
  stam: 'Stam (stemming)',
  lemma: 'Lemma (ordlista)',
};

function termFor(row: TokenRow, rep: Representation): string {
  if (rep === 'stam') return row.stem.stem;
  if (rep === 'lemma') return row.lemma.lemma;
  return row.normalized;
}

/** Termerna i en text (skiljetecken räknas inte i vektorerna). */
export function terms(text: string, rep: Representation, lowercase = true): string[] {
  return analyze(text, lowercase)
    .filter((r) => isWordLike(r.token))
    .map((r) => termFor(r, rep));
}

export interface VectorTable {
  /** Ordförrådet i bokstavsordning (svensk sortering). */
  vocabulary: string[];
  /** counts[d][v] = antal gånger term v förekommer i dokument d. */
  counts: number[][];
}

export function countVectors(docs: string[], rep: Representation, lowercase = true): VectorTable {
  const termLists = docs.map((d) => terms(d, rep, lowercase));
  const vocabulary = [...new Set(termLists.flat())].sort((a, b) => a.localeCompare(b, 'sv'));
  const index = new Map(vocabulary.map((t, i) => [t, i]));
  const counts = termLists.map((list) => {
    const v: number[] = new Array<number>(vocabulary.length).fill(0);
    for (const t of list) v[index.get(t)!]! += 1;
    return v;
  });
  return { vocabulary, counts };
}

/** Antal termer som två dokument har gemensamt (summan av min(antal) över ordförrådet). */
export function sharedCount(table: VectorTable, a: number, b: number): number {
  const va = table.counts[a];
  const vb = table.counts[b];
  if (!va || !vb) return 0;
  return va.reduce((s, x, i) => s + Math.min(x, vb[i] ?? 0), 0);
}

/* ------------------------------------------------------------------ */
/* Labbens data                                                        */
/* ------------------------------------------------------------------ */

export const START_TEXT = 'Hundarna sprang till skolan. Hunden springer hem!';

export const DOCUMENTS: { id: string; name: string; text: string }[] = [
  { id: 'A', name: 'Dokument A', text: 'Hunden springer i parken. Hundarna leker.' },
  { id: 'B', name: 'Dokument B', text: 'Katten sov hela dagen. Hunden sover också.' },
  { id: 'C', name: 'Dokument C', text: 'Eleverna läste boken om en hund. Böckerna var bra.' },
];

/** Förslag på texter att prova (knappar i labben). */
export const SAMPLE_TEXTS: { label: string; text: string }[] = [
  { label: 'Starttexten', text: START_TEXT },
  { label: 'Starka verb', text: 'Jag läser boken. Jag läste böckerna. Han gick och går.' },
  { label: 'Ord utanför ordlistan', text: 'Robotdammsugaren dammsög köket 3 gånger på måndag!' },
  { label: 'Tvetydigt', text: 'Var var du? Man får inte mata fåren.' },
];
