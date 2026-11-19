/**
 * Koppling till Skolverkets ämnesplan i artificiell intelligens.
 *
 * VIKTIGT OM KÄLLÄGET (kontrollerat 2026-11-19): Direkta hämtningar från
 * skolverket.se, syllabuswebb.skolverket.se och skolfs.skolverket.se var
 * blockerade i den miljö där webbplatsen byggdes. Uppgifterna nedan bygger
 * därför bara på sökresultat (titlar, adresser och korta utdrag) från en
 * webbsökning samma dag. Varje punkt har en `verified`-status som visar hur
 * säker den är. Läraren bör kontrollera mot ämnesplanen och fylla i det som
 * saknas – strukturen är gjord för det.
 */

export const checkedDate = '2026-11-19';

export interface PlanSource {
  title: string;
  url: string;
  /** Vad vi kunde se av källan. */
  note: string;
}

export const sources: PlanSource[] = [
  {
    title: 'Ämne – Artificiell intelligens (Gymnasieskola), Skolverkets ämnesplan',
    url: 'https://syllabuswebb.skolverket.se/syllabuscw/jsp/subject.htm?subjectCode=ART&date=2025-09-25&tos=gy',
    note: 'Ämnesplanens webbsida. Sidan kunde inte öppnas direkt (nätverksspärr i byggmiljön); titeln och utdrag sågs i sökresultat.',
  },
  {
    title: 'Ämnesplan för ämnet artificiell intelligens (PDF), Skolverket',
    url: 'https://syllabuswebb.skolverket.se/subject/ART/1/pdf',
    note: 'PDF-version av ämnesplanen. Kunde inte öppnas direkt; utdrag sågs i sökresultat.',
  },
  {
    title: 'Kommentarmaterial till ämnet artificiell intelligens (Gy25), Skolverket',
    url: 'https://www.skolverket.se/download/18.453ec2dd19a0a2d0a6b28df0/1761656862656/Kommentarmaterial%20till%20%C3%A4mnet%20artificiell%20intelligens%20(Gy25).pdf',
    note: 'Kommentar till ämnesplanen. Enligt sökresultatets sammanfattning är det centrala innehållet ordnat under tre rubriker. Kunde inte öppnas direkt.',
  },
  {
    title: 'Om ämnet artificiell intelligens (Skolverket 2024)',
    url: 'https://skolverket.se/download/18.365a295a19023f0f2241/1718612644742/Om%20%C3%A4mnet%20artificiell%20intelligens%20.pdf',
    note: 'Skolverkets kommentar till den tidigare versionen av ämnet. Kunde inte öppnas direkt.',
  },
];

/** Vad som kunde bekräftas om kursen via sökresultat. */
export const courseFacts: { text: string; verified: Verification }[] = [
  { text: 'Kursen heter Artificiell intelligens nivå 1 och har kurskoden ARTI1000X.', verified: 'utdrag' },
  { text: 'Kursen omfattar 100 gymnasiepoäng. Nivå 2 (100 poäng) bygger på nivå 1.', verified: 'utdrag' },
  {
    text: 'Enligt Skolverkets kommentarmaterial är det centrala innehållet ordnat under tre rubriker – ungefär ”artificiell intelligens”, ”praktisk användning av AI” och ”förhållningssätt till AI”. Den exakta formuleringen kunde inte kontrolleras.',
    verified: 'sammanfattning',
  },
];

/**
 * - `citat`: formuleringen fanns ordagrant i ett sökresultatsutdrag.
 * - `utdrag`: innehållet fanns i ett utdrag men återges här med egna ord.
 * - `sammanfattning`: bygger på sökmotorns sammanfattning – lägre säkerhet.
 * - `ej-verifierat`: kunde inte kontrolleras; läraren behöver fylla i.
 */
export type Verification = 'citat' | 'utdrag' | 'sammanfattning' | 'ej-verifierat';

export const verificationLabel: Record<Verification, string> = {
  citat: 'Ordagrant i sökresultat',
  utdrag: 'Sett i utdrag, egen formulering',
  sammanfattning: 'Enligt sammanfattning – kontrollera',
  'ej-verifierat': 'Ej verifierat – fyll i',
};

export interface PlanItem {
  id: string;
  /** Innehållspunkten. Citattecken används bara när verified = 'citat'. */
  text: string;
  verified: Verification;
  /** Kapitel (id) som behandlar punkten. */
  chapters: string[];
  /** Labbar (id) som behandlar punkten. */
  labs: string[];
  /** Hur webbplatsen täcker punkten, och eventuella luckor. */
  comment: string;
}

export const planItems: PlanItem[] = [
  {
    id: 'definition',
    text: 'Definition av AI och centrala begrepp inom området.',
    verified: 'utdrag',
    chapters: ['introduktion'],
    labs: ['ar-det-ai', 'fran-expertregler-till-stora-modeller'],
    comment: 'Labb 1 sorterar system efter regler och lärande. Begreppslistan samlar kursens begrepp.',
  },
  {
    id: 'data',
    text: 'Datas betydelse för AI, datakvalitet och urval av data.',
    verified: 'utdrag',
    chapters: ['introduktion', 'maskininlarning', 'etik'],
    labs: ['vad-finns-i-datamangden', 'vem-far-fel-svar', 'trana-valj-och-testa', 'vilka-uppgifter-behover-systemet'],
    comment: 'Obalans, urval, gruppvisa fel, tränings-/valideringsdata/testdata och dataminimering.',
  },
  {
    id: 'drivkrafter',
    text: 'Drivkrafter bakom AI:s utveckling.',
    verified: 'sammanfattning',
    chapters: ['introduktion'],
    labs: ['fran-expertregler-till-stora-modeller'],
    comment: 'Historiska milstolpar kopplade till data, beräkningskraft och metoder.',
  },
  {
    id: 'tekniker-oversikt',
    text: '”Översikt av tekniker för AI, däribland sökning, klassificering och objektigenkänning.”',
    verified: 'citat',
    chapters: ['sokning', 'maskininlarning', 'sprak'],
    labs: [
      'programmera-en-stadrobot',
      'bygg-en-graf',
      'bredden-forst-och-djupet-forst',
      'sok-med-kostnad-och-ledtrad',
      'tre-i-rad-mot-en-agent',
      'trana-en-klassificerare',
      'sortera-meddelanden',
    ],
    comment: 'Sökning och klassificering täcks utförligt. **Objektigenkänning (bildigenkänning) har ingen egen labb** – komplettera t.ex. med ett exempel på bildklassificering i helklass.',
  },
  {
    id: 'principer',
    text: '”Principer för, och tillämpningar av, vanliga tekniker inom AI, däribland maskininlärning och robotik.”',
    verified: 'citat',
    chapters: ['maskininlarning', 'robotik'],
    labs: [
      'trana-en-klassificerare',
      'forutsag-ett-tal',
      'trana-valj-och-testa',
      'grupper-utan-facit',
      'lar-en-agent-med-beloning',
      'oppna-ett-neuralt-natverk',
      'styr-en-robot',
      'hitta-fram-nar-kartan-forandras',
      'valj-robot-for-ett-uppdrag',
    ],
    comment: 'Kapitel 3 (maskininlärning) och kapitel 5 (robotik).',
  },
  {
    id: 'anvandning',
    text: 'Översikt av hur AI används, till exempel för prediktion, robotik, datorseende och generativ AI.',
    verified: 'sammanfattning',
    chapters: ['maskininlarning', 'sprak', 'robotik', 'etik'],
    labs: ['forutsag-ett-tal', 'samma-mening-flera-tolkningar', 'valj-robot-for-ett-uppdrag', 'bygg-ett-rekommendationsflode'],
    comment: 'Prediktion, robotik, språkmodeller och rekommendationssystem. Datorseende behandlas bara översiktligt.',
  },
  {
    id: 'problemlosning',
    text: 'Hur AI kan användas för att lösa problem.',
    verified: 'sammanfattning',
    chapters: ['sokning', 'robotik', 'etik'],
    labs: ['bygg-en-graf', 'valj-robot-for-ett-uppdrag', 'besluta-om-ett-framtida-ai-system', 'granska-ett-ai-system'],
    comment: 'Problemformulering som graf, val av lösning för ett uppdrag och slutprojektet.',
  },
  {
    id: 'manniska-ai',
    text: 'Jämförelse mellan mänsklig och artificiell intelligens.',
    verified: 'sammanfattning',
    chapters: ['introduktion', 'sprak'],
    labs: ['ar-det-ai', 'samma-mening-flera-tolkningar'],
    comment: 'Enligt sökresultatet förekommer detta i betygskriterierna. Diskutera i samband med labb 1 och 18.',
  },
  {
    id: 'lagar',
    text: 'Lagar och andra bestämmelser som gäller för AI.',
    verified: 'sammanfattning',
    chapters: ['etik'],
    labs: ['vilka-uppgifter-behover-systemet', 'hur-regleras-ett-ai-system', 'besluta-om-ett-framtida-ai-system'],
    comment: 'GDPR och EU:s AI-förordning. Enligt sökresultatet nämns detta i betygskriterierna för nivå 1.',
  },
  {
    id: 'nlp',
    text: 'Bearbetning av naturligt språk.',
    verified: 'sammanfattning',
    chapters: ['sprak'],
    labs: ['gor-text-till-data', 'sortera-meddelanden', 'samma-mening-flera-tolkningar'],
    comment: 'Fanns enligt sökresultatet i den **tidigare** versionen av ämnesplanen. Om och var det ingår i nuvarande nivå 1 kunde inte kontrolleras.',
  },
  {
    id: 'etik',
    text: 'Etiska frågor vid användning av AI, till exempel transparens.',
    verified: 'sammanfattning',
    chapters: ['etik'],
    labs: ['bygg-ett-rekommendationsflode', 'bedom-en-rattvisekonflikt', 'besluta-om-ett-framtida-ai-system', 'granska-ett-ai-system'],
    comment: 'Fanns enligt sökresultatet i den **tidigare** versionen. Om formuleringen finns i nuvarande nivå 1 kunde inte kontrolleras.',
  },
  {
    id: 'ovrigt',
    text: 'Övriga punkter i ämnesplanens centrala innehåll och syfte.',
    verified: 'ej-verifierat',
    chapters: [],
    labs: [],
    comment: 'Hela listan över centralt innehåll kunde inte läsas. Lägg till de punkter som saknas här och markera vilka labbar som täcker dem.',
  },
];
