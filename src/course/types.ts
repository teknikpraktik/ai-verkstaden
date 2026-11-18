/**
 * Kontrakt för kursinnehållet. Varje labb bor i src/labs/<id>/ och består av
 *   meta.ts     – defineLab({...})      metadata (mål, tid, begrepp, täckning)
 *   content.ts  – defineContent({...})  statisk text runt arbetsytan
 *   Lab.tsx     – React-komponent (default export) för själva arbetsytan
 *   teacher.ts  – defineTeacher({...})  facit, missuppfattningar, diskussionsstopp
 * Algoritmer och data hålls i egna filer (t.ex. logic.ts) med enhetstester.
 */

export type ChapterId =
  | 'introduktion'
  | 'sokning'
  | 'maskininlarning'
  | 'sprak'
  | 'robotik'
  | 'etik';

export type PartId = ChapterId | 'avslutning';

/** Märkning som visas överst i en labb när förenklingar eller påhittat material används. */
export type NoteKind = 'forenklad' | 'syntetisk' | 'pahittad' | 'simulering' | 'info' | 'tips' | 'varning';

export interface CoverageItem {
  /** Delämne ur kursplanen för webbplatsen, så ordagrant som möjligt. */
  topic: string;
  /** Vad eleven förväntas kunna göra/visa efter labben. */
  outcome: string;
  /** Hur det verifieras: enhetstest, Playwright-test eller manuell kontroll (ange fil/test). */
  verification: string;
}

export interface LabMeta {
  /** Stabil identifierare, samma som mappnamnet och URL-delen. Ändras aldrig. */
  id: string;
  /** 1–27 enligt kursplanen. */
  number: number;
  part: PartId;
  title: string;
  /** En mening som visas i listor. */
  summary: string;
  goals: string[];
  /** Förkunskaper i klartext. */
  prerequisites: string[];
  /** Labbar som bör vara gjorda innan (id). */
  prerequisiteLabs: string[];
  /** Ungefärlig tid i minuter [min, max] för den ordinarie labben. */
  minutes: [number, number];
  /** Begrepps-id ur begreppslistan (src/course/glossary.ts eller labbens concepts.ts). */
  concepts: string[];
  /** Ämnesregister: fria sökord. */
  keywords: string[];
  coverage: CoverageItem[];
  /** Märkningar som visas överst: syntetiska data, förenklad modell osv. */
  labels: NoteKind[];
}

export type Block =
  | string
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'pseudo'; title?: string; code: string }
  | { type: 'formula'; text: string; caption?: string }
  | { type: 'note'; kind: NoteKind; title?: string; text: string }
  | { type: 'table'; caption: string; head: string[]; rows: string[][] };

export interface ContentSection {
  heading: string;
  blocks: Block[];
}

export interface DeepDive {
  heading: string;
  /** Ungefärlig tid i minuter. */
  minutes: number;
  prerequisites: string;
  blocks: Block[];
}

export interface LabContent {
  /** Kort introduktion ovanför arbetsytan. */
  intro: Block[];
  /** Förklaringar under arbetsytan så att alla delämnen går att förstå. */
  sections: ContentSection[];
  /** Slutsats – vad labben visade. */
  conclusion: Block[];
  /** Frivilliga fördjupningar (märks med tid och förkunskaper). */
  deepDives?: DeepDive[];
}

export interface TeacherAnswer {
  /** Frågan eller uppgiften (gärna med samma formulering som i labben). */
  question: string;
  /** Facit eller ett/flera exempelresonemang. */
  answer: Block[];
}

export interface TeacherNotes {
  /** Varför labben finns och hur den passar i kursen. */
  purpose: string;
  /** Konkreta tips för genomförandet. */
  tips: string[];
  misconceptions: { myth: string; reality: string }[];
  /** Lämpliga diskussionsstopp under labben. */
  discussionStops: string[];
  answers: TeacherAnswer[];
  /** Källor som påståenden i labben bygger på, med kontrolldatum (ÅÅÅÅ-MM-DD). */
  sources?: { title: string; url: string; checked: string; note?: string }[];
}

export interface Concept {
  id: string;
  term: string;
  /** Kort förklaring på elevnivå (1–3 meningar). */
  definition: string;
  /** Synonymer/engelska termer som ska ge träff i sökningen. */
  aliases?: string[];
  /** Relaterade begrepps-id. */
  related?: string[];
}

export interface ChapterMeta {
  id: ChapterId;
  number: number;
  title: string;
  shortTitle: string;
  intro: string[];
  goals: string[];
  /** Labb-id i rekommenderad ordning. */
  labs: string[];
}

export const defineLab = (m: LabMeta): LabMeta => m;
export const defineContent = (c: LabContent): LabContent => c;
export const defineTeacher = (t: TeacherNotes): TeacherNotes => t;
export const defineConcepts = (c: Concept[]): Concept[] => c;

/** Lärarstöd på kapitelnivå: src/chapters/<kapitel-id>/teacher.ts */
export interface ChapterTeacherNotes {
  /** Förslag på lektionsupplägg (t.ex. 2–3 lektioner à 60–80 min). */
  lessons: { title: string; minutes: number; plan: string[] }[];
  /** Facit/exempelresonemang för kapitlets kunskapskontroll. */
  checkAnswers: TeacherAnswer[];
  /** Övriga råd för kapitlet. */
  notes?: string[];
}
export const defineChapterTeacher = (t: ChapterTeacherNotes): ChapterTeacherNotes => t;
