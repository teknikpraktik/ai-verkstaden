import { listKeys, readJSON, removeKey, removePrefix, writeJSON } from './storage';

/**
 * Elevens arbetsöversikt – sparas bara lokalt.
 *   progress:<labId>   { visitedAt, done }
 *   last               { labId, at }
 *   lab:<labId>:...    labbens eget arbete (tillstånd, svar)
 */
export interface LabProgress {
  visitedAt: number;
  done: boolean;
}

const isProgress = (v: unknown): v is LabProgress =>
  typeof v === 'object' && v !== null && typeof (v as LabProgress).visitedAt === 'number';

export function getProgress(labId: string): LabProgress | null {
  return readJSON<LabProgress | null>(`progress:${labId}`, null, (v): v is LabProgress | null => v === null || isProgress(v));
}

export function markVisited(labId: string): void {
  const p = getProgress(labId);
  writeJSON(`progress:${labId}`, { visitedAt: Date.now(), done: p?.done ?? false });
  writeJSON('last', { labId, at: Date.now() });
}

export function setDone(labId: string, done: boolean): void {
  const p = getProgress(labId);
  writeJSON(`progress:${labId}`, { visitedAt: p?.visitedAt ?? Date.now(), done });
}

export function getLastLab(): string | null {
  const v = readJSON<{ labId: string } | null>('last', null);
  return v && typeof v.labId === 'string' ? v.labId : null;
}

/** Nyckel för en fråga eller ett sparat tillstånd i en labb. */
export const labKey = (labId: string, key: string) => `lab:${labId}:${key}`;

/** Antal korrekt besvarade kontrollfrågor i en labb (svaren ligger under lab:<id>:q:<frågeid>). */
export function correctCount(labId: string): number {
  let n = 0;
  for (const k of listKeys(`lab:${labId}:q:`)) {
    const v = readJSON<{ correct?: boolean } | null>(k, null);
    if (v && v.correct === true) n++;
  }
  return n;
}

/** "Börja om": rensar labbens arbete och klarmarkering men behåller besöket. */
export function resetLab(labId: string): void {
  removePrefix(`lab:${labId}:`);
  const p = getProgress(labId);
  if (p) writeJSON(`progress:${labId}`, { ...p, done: false });
}

export function forgetLab(labId: string): void {
  resetLab(labId);
  removeKey(`progress:${labId}`);
}
