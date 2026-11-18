import { chapters, finale, labOrder } from './chapters';
import { coreConcepts } from './glossary';
import { routes } from './routes';
import type { ChapterMeta, Concept, LabContent, LabMeta, PartId, TeacherNotes } from './types';

const metaModules = import.meta.glob<{ default: LabMeta }>('../labs/*/meta.ts', { eager: true });
const contentModules = import.meta.glob<{ default: LabContent }>('../labs/*/content.ts', { eager: true });
const teacherModules = import.meta.glob<{ default: TeacherNotes }>('../labs/*/teacher.ts', { eager: true });
const conceptModules = import.meta.glob<{ default: Concept[] }>('../labs/*/concepts.ts', { eager: true });

function dirOf(path: string): string {
  const m = /\/labs\/([^/]+)\//.exec(path);
  if (!m?.[1]) throw new Error(`Okänd labbsökväg: ${path}`);
  return m[1];
}

function byDir<T>(mods: Record<string, { default: T }>): Map<string, T> {
  const out = new Map<string, T>();
  for (const [p, m] of Object.entries(mods)) out.set(dirOf(p), m.default);
  return out;
}

const metaByDir = byDir(metaModules);
const contentByDir = byDir(contentModules);
const teacherByDir = byDir(teacherModules);

export interface LabEntry extends LabMeta {
  href: string;
  content: LabContent | undefined;
  teacher: TeacherNotes | undefined;
}

export const labs: LabEntry[] = labOrder.map((id) => {
  const meta = metaByDir.get(id);
  if (!meta) throw new Error(`Labben "${id}" saknar src/labs/${id}/meta.ts`);
  return {
    ...meta,
    href: routes.lab(meta.id, meta.part),
    content: contentByDir.get(id),
    teacher: teacherByDir.get(id),
  };
});

const labById = new Map(labs.map((l) => [l.id, l]));

export function getLab(id: string): LabEntry {
  const lab = labById.get(id);
  if (!lab) throw new Error(`Okänd labb: ${id}`);
  return lab;
}

export function labsInPart(part: PartId): LabEntry[] {
  return labs.filter((l) => l.part === part);
}

export function neighbours(id: string): { prev: LabEntry | undefined; next: LabEntry | undefined } {
  const i = labs.findIndex((l) => l.id === id);
  return { prev: labs[i - 1], next: labs[i + 1] };
}

export function getChapter(id: string): ChapterMeta {
  const c = chapters.find((ch) => ch.id === id);
  if (!c) throw new Error(`Okänt kapitel: ${id}`);
  return c;
}

export function partTitle(part: PartId): string {
  if (part === 'avslutning') return finale.title;
  const c = getChapter(part);
  return `Kapitel ${c.number} · ${c.title}`;
}

/** Alla begrepp: kärnlistan plus labbspecifika tillägg. Kärnlistan vinner vid krock. */
export const concepts: Concept[] = (() => {
  const map = new Map<string, Concept>();
  for (const c of coreConcepts) map.set(c.id, c);
  for (const mod of Object.values(conceptModules)) {
    for (const c of mod.default) if (!map.has(c.id)) map.set(c.id, c);
  }
  return [...map.values()].sort((a, b) => a.term.localeCompare(b.term, 'sv'));
})();

export const conceptById = new Map(concepts.map((c) => [c.id, c]));

/** Labbar som använder ett visst begrepp. */
export function labsForConcept(conceptId: string): LabEntry[] {
  return labs.filter((l) => l.concepts.includes(conceptId));
}

export { chapters, finale };
