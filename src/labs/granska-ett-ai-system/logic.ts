/**
 * Slutprojektet "Granska ett AI-system": data, fullständighetsregler och
 * rapporttext. Fri från React så att allt kan enhetstestas.
 */

// ---------------------------------------------------------------------------
// Kursens labbar som kan användas som belägg
// ---------------------------------------------------------------------------

export interface EvidenceLab {
  id: string;
  number: number;
  title: string;
  /** Kapitel-id (för gruppering i listan). */
  part: string;
  /** Vad labben kan visa om ett AI-system – en mening på elevnivå. */
  shows: string;
}

/**
 * Labb 1–26. Numrering och id ska stämma med src/course/chapters.ts
 * (kontrolleras i logic.test.ts).
 */
export const evidenceLabs: EvidenceLab[] = [
  { id: 'ar-det-ai', number: 1, title: 'Är det AI?', part: 'introduktion', shows: 'om systemet bygger på fasta regler, lär sig av data eller både och.' },
  { id: 'fran-expertregler-till-stora-modeller', number: 2, title: 'Från expertregler till stora modeller', part: 'introduktion', shows: 'vilken typ av AI-teknik lösningen liknar och vad den tekniken brukar klara och inte klara.' },
  { id: 'vad-finns-i-datamangden', number: 3, title: 'Vad finns i datamängden?', part: 'introduktion', shows: 'vilka observationer, egenskaper och etiketter som behövs och om datan är obalanserad.' },
  { id: 'vem-far-fel-svar', number: 4, title: 'Vem får fel svar?', part: 'introduktion', shows: 'att felandelen kan skilja sig mellan grupper och hur man jämför med tydliga nämnare.' },
  { id: 'programmera-en-stadrobot', number: 5, title: 'Programmera en städrobot', part: 'sokning', shows: 'hur en agent beskrivs med mål, sensorer, tillstånd och handlingar.' },
  { id: 'bygg-en-graf', number: 6, title: 'Bygg en graf', part: 'sokning', shows: 'hur ett problem kan beskrivas som noder och kanter med start och mål.' },
  { id: 'bredden-forst-och-djupet-forst', number: 7, title: 'Bredden först och djupet först', part: 'sokning', shows: 'att olika sökordning ger olika vägar och att kortast i steg inte alltid är billigast.' },
  { id: 'sok-med-kostnad-och-ledtrad', number: 8, title: 'Sök med kostnad och ledtråd', part: 'sokning', shows: 'hur kostnader och en ledtråd (heuristik) påverkar vilken väg som väljs.' },
  { id: 'tre-i-rad-mot-en-agent', number: 9, title: 'Tre i rad mot en agent', part: 'sokning', shows: 'hur en agent kan planera flera drag framåt och vad det kostar i beräkningar.' },
  { id: 'trana-en-klassificerare', number: 10, title: 'Träna en klassificerare', part: 'maskininlarning', shows: 'hur en klassificerare drar en gräns mellan klasser och hur enskilda exempel påverkar den.' },
  { id: 'forutsag-ett-tal', number: 11, title: 'Förutsäg ett tal', part: 'maskininlarning', shows: 'hur stora felen i en prognos är och vad som händer utanför datans område.' },
  { id: 'trana-valj-och-testa', number: 12, title: 'Träna, välj och testa', part: 'maskininlarning', shows: 'varför man behöver separat testdata och hur överanpassning och dataläckage ser ut.' },
  { id: 'grupper-utan-facit', number: 13, title: 'Grupper utan facit', part: 'maskininlarning', shows: 'att grupper som hittas utan facit beror på startvärde och antal grupper.' },
  { id: 'lar-en-agent-med-beloning', number: 14, title: 'Lär en agent med belöning', part: 'maskininlarning', shows: 'att en agent lär sig det belöningen faktiskt mäter, inte det vi menade.' },
  { id: 'oppna-ett-neuralt-natverk', number: 15, title: 'Öppna ett neuralt nätverk', part: 'maskininlarning', shows: 'hur vikter i ett neuralt nätverk räknar och varför det är svårt att läsa av varför det svarar som det gör.' },
  { id: 'gor-text-till-data', number: 16, title: 'Gör text till data', part: 'sprak', shows: 'vad som går förlorat när text delas upp i ord och räknas.' },
  { id: 'sortera-meddelanden', number: 17, title: 'Sortera meddelanden med en textmodell', part: 'sprak', shows: 'hur en textklassificerare fattar beslut utifrån ord och var den gör fel.' },
  { id: 'samma-mening-flera-tolkningar', number: 18, title: 'Samma mening, flera tolkningar', part: 'sprak', shows: 'att tvetydig text kan tolkas på flera sätt och att en språkmodell gissar nästa ord.' },
  { id: 'styr-en-robot', number: 19, title: 'Styr en robot', part: 'robotik', shows: 'hur brus i sensorer och fördröjning påverkar en robot som styrs av ett program.' },
  { id: 'hitta-fram-nar-kartan-forandras', number: 20, title: 'Hitta fram när kartan förändras', part: 'robotik', shows: 'att en robots karta kan vara fel och att den då måste planera om.' },
  { id: 'valj-robot-for-ett-uppdrag', number: 21, title: 'Välj robot för ett uppdrag', part: 'robotik', shows: 'hur man väljer sensorer, autonominivå och när en människa ska ta över.' },
  { id: 'bygg-ett-rekommendationsflode', number: 22, title: 'Bygg ett rekommendationsflöde', part: 'etik', shows: 'hur rekommendationer påverkar variation och vilka uppgifter som samlas in.' },
  { id: 'bedom-en-rattvisekonflikt', number: 23, title: 'Bedöm en rättvisekonflikt', part: 'etik', shows: 'hur en tröskel flyttar fel mellan falskt positiva och falskt negativa, och mellan grupper.' },
  { id: 'vilka-uppgifter-behover-systemet', number: 24, title: 'Vilka uppgifter behöver systemet?', part: 'etik', shows: 'vilka personuppgifter som verkligen behövs för ändamålet och hur länge de får sparas.' },
  { id: 'hur-regleras-ett-ai-system', number: 25, title: 'Hur regleras ett AI-system?', part: 'etik', shows: 'hur EU:s AI-förordning och GDPR kan träffa systemet och när mer information behövs.' },
  { id: 'besluta-om-ett-framtida-ai-system', number: 26, title: 'Besluta om ett framtida AI-system', part: 'etik', shows: 'hur nytta, risk, ansvar och möjlighet att överklaga vägs mot varandra i ett beslut.' },
];

const evidenceById = new Map(evidenceLabs.map((l) => [l.id, l]));
export const getEvidenceLab = (id: string) => evidenceById.get(id);

// ---------------------------------------------------------------------------
// Fiktiva problem
// ---------------------------------------------------------------------------

export type ProblemId = 'matsvinn' | 'bibliotekschatt' | 'leveransrobot' | 'sommarjobb' | 'eget';

export interface Problem {
  id: ProblemId;
  title: string;
  /** Påhittad organisation. */
  organisation: string;
  description: string;
  /** Frågor som hjälper eleven att komma igång. */
  prompts: { goal: string; data: string; method: string };
  suggestedMethod: MethodId | '';
  suggestedLabs: string[];
}

export const problems: Problem[] = [
  {
    id: 'matsvinn',
    title: 'Prognos för matsvinn i skolmatsalen',
    organisation: 'Björkdalens gymnasium (påhittad skola)',
    description:
      'Skolköket vill förutsäga hur många som äter lunch varje dag så att mindre mat slängs. Ett AI-system ska varje morgon föreslå hur många portioner som ska lagas.',
    prompts: {
      goal: 'Vad ska bli bättre, och hur vet ni att det har blivit bättre? Vad händer om prognosen är för låg?',
      data: 'Vilka uppgifter finns redan (tidigare dagars antal, veckodag, meny, väder, prov, lov)? Behövs några uppgifter om enskilda elever?',
      method: 'Ska systemet förutsäga ett tal eller en klass? Vad är det enklaste som kan fungera?',
    },
    suggestedMethod: 'regression',
    suggestedLabs: ['vad-finns-i-datamangden', 'forutsag-ett-tal', 'trana-valj-och-testa', 'vilka-uppgifter-behover-systemet'],
  },
  {
    id: 'bibliotekschatt',
    title: 'Chattbot som sorterar frågor till skolbiblioteket',
    organisation: 'Kommunbiblioteket i Åsnäs (påhittat)',
    description:
      'Biblioteket får många meddelanden. Ett AI-system ska läsa varje meddelande, sortera det (lån, öppettider, studiehjälp, annat) och ge ett första svar.',
    prompts: {
      goal: 'Vilka frågor ska systemet kunna svara på själv, och vilka ska alltid gå till en bibliotekarie?',
      data: 'Vilka exempelmeddelanden finns att träna på? Kan meddelandena innehålla personuppgifter?',
      method: 'Räcker det med en textklassificerare, eller behövs en språkmodell som skriver svar?',
    },
    suggestedMethod: 'text',
    suggestedLabs: ['gor-text-till-data', 'sortera-meddelanden', 'samma-mening-flera-tolkningar', 'hur-regleras-ett-ai-system'],
  },
  {
    id: 'leveransrobot',
    title: 'Leveransrobot i ett sjukhus',
    organisation: 'Länssjukhuset i Fjällby (påhittat)',
    description:
      'En robot ska köra mat och prover mellan avdelningarna. Korridorerna har människor, sängar och dörrar som ibland är stängda.',
    prompts: {
      goal: 'Vad ska roboten klara, hur snabbt, och vad får aldrig hända?',
      data: 'Vilka sensorer behövs? Vilken karta finns och hur ofta ändras miljön?',
      method: 'Hur ska roboten hitta väg och planera om? När ska en människa ta över?',
    },
    suggestedMethod: 'robot',
    suggestedLabs: ['bygg-en-graf', 'sok-med-kostnad-och-ledtrad', 'styr-en-robot', 'hitta-fram-nar-kartan-forandras', 'valj-robot-for-ett-uppdrag'],
  },
  {
    id: 'sommarjobb',
    title: 'Urval till kommunens sommarjobb',
    organisation: 'Ekviks kommun (påhittad)',
    description:
      'Kommunen får tusentals ansökningar till sommarjobb för unga. Ett AI-system ska sortera ansökningarna och föreslå vilka som ska kallas till intervju.',
    prompts: {
      goal: 'Vad betyder ett rättvist urval här? Vem ska kunna överklaga, och hur?',
      data: 'Vilka uppgifter i ansökan får och behöver användas? Kan tidigare urval innehålla snedvridningar?',
      method: 'Ska systemet rangordna, sortera i klasser eller bara hjälpa handläggaren att läsa?',
    },
    suggestedMethod: 'klassificering',
    suggestedLabs: ['vad-finns-i-datamangden', 'vem-far-fel-svar', 'bedom-en-rattvisekonflikt', 'hur-regleras-ett-ai-system', 'besluta-om-ett-framtida-ai-system'],
  },
  {
    id: 'eget',
    title: 'Eget fiktivt problem',
    organisation: 'Hitta på en organisation',
    description: 'Beskriv ett eget påhittat AI-system. Använd inga verkliga personer och inga riktiga personuppgifter.',
    prompts: {
      goal: 'Vad ska systemet åstadkomma, för vem, och hur mäter ni om det lyckas?',
      data: 'Vilka data behövs, var kommer de ifrån och vilka personer finns i datan?',
      method: 'Vilken av kursens metoder passar bäst, och varför?',
    },
    suggestedMethod: '',
    suggestedLabs: ['ar-det-ai', 'vad-finns-i-datamangden', 'trana-valj-och-testa', 'hur-regleras-ett-ai-system'],
  },
];

export const getProblem = (id: ProblemId | '') => problems.find((p) => p.id === id);

// ---------------------------------------------------------------------------
// Metoder och mänsklig insyn
// ---------------------------------------------------------------------------

export type MethodId = 'regler' | 'sokning' | 'klassificering' | 'regression' | 'klustring' | 'forstarkning' | 'text' | 'robot';

export const methods: { id: MethodId; label: string; labs: string[] }[] = [
  { id: 'regler', label: 'Fasta regler (regelbaserat system)', labs: ['ar-det-ai', 'fran-expertregler-till-stora-modeller'] },
  { id: 'sokning', label: 'Sökning och planering i en graf', labs: ['bygg-en-graf', 'bredden-forst-och-djupet-forst', 'sok-med-kostnad-och-ledtrad'] },
  { id: 'klassificering', label: 'Klassificering (välja en klass)', labs: ['trana-en-klassificerare', 'trana-valj-och-testa', 'vem-far-fel-svar'] },
  { id: 'regression', label: 'Regression (förutsäga ett tal)', labs: ['forutsag-ett-tal', 'trana-valj-och-testa'] },
  { id: 'klustring', label: 'Klustring (grupper utan facit)', labs: ['grupper-utan-facit'] },
  { id: 'forstarkning', label: 'Förstärkningsinlärning (belöning)', labs: ['lar-en-agent-med-beloning'] },
  { id: 'text', label: 'Språkbehandling (textklassificering eller språkmodell)', labs: ['gor-text-till-data', 'sortera-meddelanden', 'samma-mening-flera-tolkningar'] },
  { id: 'robot', label: 'Robot med sensorer, styrprogram och planering', labs: ['styr-en-robot', 'hitta-fram-nar-kartan-forandras', 'valj-robot-for-ett-uppdrag'] },
];

export type OversightId = 'automatiskt' | 'overvakar' | 'beslutar' | 'avsta';

export const oversightLevels: { id: OversightId; label: string; explanation: string }[] = [
  { id: 'automatiskt', label: 'Helt automatiskt', explanation: 'Systemet fattar beslut själv. Ingen människa granskar enskilda beslut.' },
  { id: 'overvakar', label: 'Människa övervakar', explanation: 'Systemet fattar beslut, men en människa följer resultatet och kan stoppa eller ändra.' },
  { id: 'beslutar', label: 'Människa beslutar', explanation: 'Systemet ger ett förslag. En människa fattar varje beslut.' },
  { id: 'avsta', label: 'Avstå från AI', explanation: 'Uppgiften bör inte lösas med ett AI-system just nu.' },
];

export type RecommendationId = 'infor' | 'villkor' | 'vanta' | 'nej';

export const recommendations: { id: RecommendationId; label: string }[] = [
  { id: 'infor', label: 'Inför systemet' },
  { id: 'villkor', label: 'Inför med villkor' },
  { id: 'vanta', label: 'Vänta – mer underlag behövs' },
  { id: 'nej', label: 'Inför inte systemet' },
];

// ---------------------------------------------------------------------------
// Projektets tillstånd
// ---------------------------------------------------------------------------

export interface Project {
  problem: ProblemId | '';
  customTitle: string;
  customDescription: string;
  goal: string;
  affected: string;
  data: string;
  method: MethodId | '';
  methodWhy: string;
  /** Valda labbar (id) → elevens anteckning om vad labben visar för just det här systemet. */
  evidence: Record<string, string>;
  errors: string;
  risks: string;
  oversight: OversightId | '';
  oversightWhy: string;
  recommendation: RecommendationId | '';
  conclusion: string;
  /** Frivilliga självkontroller som eleven bockar av (id). */
  selfCheck: string[];
  /** Namn eller initialer (frivilligt) – visas bara i rapporten. */
  authors: string;
}

export const emptyProject = (): Project => ({
  problem: '',
  customTitle: '',
  customDescription: '',
  goal: '',
  affected: '',
  data: '',
  method: '',
  methodWhy: '',
  evidence: {},
  errors: '',
  risks: '',
  oversight: '',
  oversightWhy: '',
  recommendation: '',
  conclusion: '',
  selfCheck: [],
  authors: '',
});

const textKeys = ['customTitle', 'customDescription', 'goal', 'affected', 'data', 'methodWhy', 'errors', 'risks', 'oversightWhy', 'conclusion', 'authors'] as const;

/** Kontrollerar att sparad data har rätt form (sparad data kan vara gammal eller trasig). */
export function isProject(v: unknown): v is Project {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  const p = v as Record<string, unknown>;
  for (const k of textKeys) if (typeof p[k] !== 'string') return false;
  if (p.problem !== '' && !problems.some((x) => x.id === p.problem)) return false;
  if (p.method !== '' && !methods.some((x) => x.id === p.method)) return false;
  if (p.oversight !== '' && !oversightLevels.some((x) => x.id === p.oversight)) return false;
  if (p.recommendation !== '' && !recommendations.some((x) => x.id === p.recommendation)) return false;
  if (!Array.isArray(p.selfCheck) || !p.selfCheck.every((x) => typeof x === 'string')) return false;
  const ev = p.evidence;
  if (typeof ev !== 'object' || ev === null || Array.isArray(ev)) return false;
  return Object.entries(ev).every(([k, val]) => evidenceById.has(k) && typeof val === 'string');
}

export const wordCount = (s: string): number => (s.trim() === '' ? 0 : s.trim().split(/\s+/).length);

// ---------------------------------------------------------------------------
// Granskningslista
// ---------------------------------------------------------------------------

/** Minsta antal ord för att en textdel ska räknas som ifylld. */
export const MIN_WORDS = 8;
export const MIN_EVIDENCE = 2;

export interface CheckItem {
  id: string;
  /** Kort namn på delen. */
  label: string;
  /** Vilket steg i guiden delen fylls i (0-baserat). */
  step: number;
  done: boolean;
  /** Vad som saknas, om delen inte är klar. */
  missing: string;
}

export function checklist(p: Project): CheckItem[] {
  const words = (s: string) => wordCount(s) >= MIN_WORDS;
  const own = p.problem === 'eget';
  const selected = Object.entries(p.evidence);
  const withNotes = selected.filter(([, note]) => wordCount(note) >= 3).length;

  const items: (Omit<CheckItem, 'done'> & { ok: boolean })[] = [];
  const add = (id: string, label: string, step: number, ok: boolean, missing: string) => items.push({ id, label, step, ok, missing });

  add('problem', 'Problem valt', 0, p.problem !== '' && (!own || (p.customTitle.trim() !== '' && words(p.customDescription))),
    p.problem === '' ? 'Välj ett av de fiktiva problemen eller ett eget.' : 'Ge ditt egna problem en rubrik och en beskrivning på minst 8 ord.');
  add('goal', 'Mål', 1, words(p.goal), `Beskriv målet med minst ${MIN_WORDS} ord: vad ska bli bättre och hur mäts det?`);
  add('affected', 'Berörda personer', 1, wordCount(p.affected) >= 3, 'Skriv vilka som påverkas av systemet (minst 3 ord).');
  add('data', 'Data', 1, words(p.data), `Beskriv datan med minst ${MIN_WORDS} ord: vilka uppgifter, varifrån och om vem?`);
  add('method', 'Metod', 2, p.method !== '' && wordCount(p.methodWhy) >= 5,
    p.method === '' ? 'Välj en metod.' : 'Motivera metodvalet med minst 5 ord.');
  add('evidence', 'Belägg från kursen', 3, selected.length >= MIN_EVIDENCE && withNotes >= MIN_EVIDENCE,
    selected.length < MIN_EVIDENCE
      ? `Välj minst ${MIN_EVIDENCE} labbar som belägg (du har valt ${selected.length}).`
      : `Skriv minst 3 ord om vad varje labb visar – ${withNotes} av ${selected.length} valda har en anteckning, minst ${MIN_EVIDENCE} behövs.`);
  add('errors', 'Fel', 4, words(p.errors), `Beskriv med minst ${MIN_WORDS} ord vilka fel systemet kan göra och vem som drabbas.`);
  add('risks', 'Risker', 4, words(p.risks), `Beskriv med minst ${MIN_WORDS} ord risker för integritet, rättvisa eller säkerhet.`);
  add('oversight', 'Mänsklig insyn', 4, p.oversight !== '' && wordCount(p.oversightWhy) >= 5,
    p.oversight === '' ? 'Välj nivå av mänsklig insyn.' : 'Motivera nivån av mänsklig insyn med minst 5 ord.');
  add('conclusion', 'Rekommendation', 5, p.recommendation !== '' && words(p.conclusion),
    p.recommendation === '' ? 'Välj en rekommendation.' : `Motivera rekommendationen med minst ${MIN_WORDS} ord.`);

  return items.map(({ ok, ...rest }) => ({ ...rest, done: ok, missing: ok ? '' : rest.missing }));
}

export interface Completeness {
  done: number;
  total: number;
  complete: boolean;
  missing: CheckItem[];
}

export function completeness(p: Project): Completeness {
  const items = checklist(p);
  const missing = items.filter((i) => !i.done);
  return { done: items.length - missing.length, total: items.length, complete: missing.length === 0, missing };
}

export function completenessText(c: Completeness): string {
  if (c.complete) return `Alla ${c.total} obligatoriska delar är ifyllda. Läs igenom rapporten innan du lämnar in.`;
  return `${c.done} av ${c.total} obligatoriska delar är ifyllda. Saknas: ${c.missing.map((m) => m.label.toLowerCase()).join(', ')}.`;
}

/** Frivilliga självkontroller i granskningslistan. */
export const selfChecks: { id: string; text: string }[] = [
  { id: 'pahittat', text: 'Jag har skrivit att problemet och organisationen är påhittade.' },
  { id: 'belagg-antagande', text: 'Jag har skilt på vad labbarna visar och vad som är mina egna antaganden.' },
  { id: 'grupper', text: 'Jag har tänkt på om felen drabbar vissa grupper mer än andra.' },
  { id: 'personuppgifter', text: 'Jag har bara tagit med de personuppgifter som verkligen behövs.' },
  { id: 'overklaga', text: 'Jag har beskrivit hur en person kan få ett beslut förklarat eller ändrat.' },
];

// ---------------------------------------------------------------------------
// Rapport
// ---------------------------------------------------------------------------

export const EMPTY = '(inte ifyllt)';

export interface ReportSection {
  heading: string;
  /** Stycken eller punkter. Tomma fält ersätts med EMPTY. */
  paragraphs: string[];
}

export interface Report {
  title: string;
  subtitle: string;
  sections: ReportSection[];
  status: string;
}

const orEmpty = (s: string) => (s.trim() === '' ? EMPTY : s.trim());

export function projectTitle(p: Project): string {
  if (p.problem === 'eget') return p.customTitle.trim() || 'Eget fiktivt problem';
  return getProblem(p.problem)?.title ?? 'Inget problem valt';
}

export function buildReport(p: Project): Report {
  const problem = getProblem(p.problem);
  const method = methods.find((m) => m.id === p.method);
  const oversight = oversightLevels.find((o) => o.id === p.oversight);
  const rec = recommendations.find((r) => r.id === p.recommendation);
  const evidence = Object.entries(p.evidence)
    .map(([id, note]) => ({ lab: getEvidenceLab(id)!, note }))
    .filter((e) => e.lab)
    .sort((a, b) => a.lab.number - b.lab.number);
  const description = p.problem === 'eget' ? orEmpty(p.customDescription) : (problem?.description ?? EMPTY);
  const checks = selfChecks.filter((s) => p.selfCheck.includes(s.id));

  return {
    title: `Granskning: ${projectTitle(p)}`,
    subtitle: [
      p.problem === 'eget' ? 'Påhittad organisation (eget fiktivt problem)' : problem ? `${problem.organisation}. Scenariot är påhittat.` : 'Inget problem valt',
      p.authors.trim() ? `Av: ${p.authors.trim()}` : '',
    ]
      .filter(Boolean)
      .join(' · '),
    sections: [
      { heading: '1. Problemet', paragraphs: [description] },
      { heading: '2. Mål och berörda', paragraphs: [`Mål: ${orEmpty(p.goal)}`, `Berörda: ${orEmpty(p.affected)}`] },
      { heading: '3. Data', paragraphs: [orEmpty(p.data)] },
      { heading: '4. Metod', paragraphs: [`Vald metod: ${method?.label ?? EMPTY}`, `Motivering: ${orEmpty(p.methodWhy)}`] },
      {
        heading: '5. Belägg från kursens labbar',
        paragraphs: evidence.length
          ? evidence.map((e) => `Labb ${e.lab.number}, ${e.lab.title}: ${orEmpty(e.note)}`)
          : ['Inga labbar valda.'],
      },
      { heading: '6. Fel och risker', paragraphs: [`Möjliga fel: ${orEmpty(p.errors)}`, `Risker: ${orEmpty(p.risks)}`] },
      {
        heading: '7. Mänsklig insyn',
        paragraphs: [`Nivå: ${oversight ? `${oversight.label} – ${oversight.explanation}` : EMPTY}`, `Motivering: ${orEmpty(p.oversightWhy)}`],
      },
      { heading: '8. Rekommendation', paragraphs: [`Rekommendation: ${rec?.label ?? EMPTY}`, `Motivering: ${orEmpty(p.conclusion)}`] },
      {
        heading: '9. Självkontroll',
        paragraphs: checks.length ? checks.map((c) => `✓ ${c.text}`) : ['Inga självkontroller avbockade.'],
      },
    ],
    status: completenessText(completeness(p)),
  };
}

/** Rapporten som ren text (för nedladdning). */
export function reportToText(r: Report, date?: string): string {
  const lines = [r.title, '='.repeat(Math.min(r.title.length, 72)), r.subtitle];
  if (date) lines.push(`Sparad: ${date}`);
  lines.push('', `Status: ${r.status}`);
  for (const s of r.sections) {
    lines.push('', s.heading, '-'.repeat(s.heading.length));
    for (const p of s.paragraphs) lines.push(p);
  }
  lines.push('', 'Skapad i AI-verkstaden, slutprojektet "Granska ett AI-system". Allt innehåll är påhittat och sparades bara i din webbläsare.');
  return lines.join('\n') + '\n';
}

/** Filnamn för nedladdning, utan å/ä/ö och specialtecken. */
export function reportFileName(p: Project): string {
  const slug = projectTitle(p)
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
  return `granskning-${slug || 'ai-system'}.txt`;
}
