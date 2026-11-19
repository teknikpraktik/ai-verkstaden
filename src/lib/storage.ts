/**
 * Säker lokal lagring. Om localStorage är blockerat (privat läge, skolans
 * inställningar) eller trasigt används ett minne som bara lever tills sidan
 * laddas om. Inget skickas någonsin till en server.
 */
export const PREFIX = 'aiv:v1:';
export const STORAGE_EVENT = 'aiv-storage';

const memory = new Map<string, string>();
/** Nycklar vars senaste värde bara finns i minnet (skrivningen till localStorage misslyckades). */
const memoryOnly = new Set<string>();
let cachedAvailable: boolean | null = null;

function ls(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function storageAvailable(): boolean {
  if (cachedAvailable !== null) return cachedAvailable;
  const s = ls();
  if (!s) return (cachedAvailable = false);
  try {
    const k = PREFIX + '__test';
    s.setItem(k, '1');
    s.removeItem(k);
    cachedAvailable = true;
  } catch {
    cachedAvailable = false;
  }
  return cachedAvailable;
}

/** Endast för tester. */
export function _resetStorageForTests(): void {
  cachedAvailable = null;
  memory.clear();
  memoryOnly.clear();
}

function rawGet(key: string): string | null {
  const full = PREFIX + key;
  if (storageAvailable() && !memoryOnly.has(full)) {
    try {
      return ls()!.getItem(full);
    } catch {
      /* fall igenom till minnet */
    }
  }
  return memory.get(full) ?? null;
}

function rawSet(key: string, value: string): void {
  const full = PREFIX + key;
  memory.set(full, value);
  if (storageAvailable()) {
    try {
      ls()!.setItem(full, value);
      memoryOnly.delete(full);
    } catch {
      /* t.ex. full lagring – minnet räcker för stunden, och rawGet läser då därifrån */
      memoryOnly.add(full);
    }
  }
}

function notify(key: string | null): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
}

export function readJSON<T>(key: string, fallback: T, validate?: (v: unknown) => v is T): T {
  const raw = rawGet(key);
  if (raw === null) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback; // trasig data ska aldrig krascha en labb
  }
}

export function writeJSON(key: string, value: unknown): void {
  rawSet(key, JSON.stringify(value));
  notify(key);
}

export function removeKey(key: string): void {
  const full = PREFIX + key;
  memory.delete(full);
  memoryOnly.delete(full);
  if (storageAvailable()) {
    try {
      ls()!.removeItem(full);
    } catch {
      /* ignorera */
    }
  }
  notify(key);
}

/** Alla nycklar (utan prefix) som börjar med `prefix`. */
export function listKeys(prefix = ''): string[] {
  const keys = new Set<string>();
  for (const k of memory.keys()) if (k.startsWith(PREFIX + prefix)) keys.add(k.slice(PREFIX.length));
  if (storageAvailable()) {
    try {
      const s = ls()!;
      for (let i = 0; i < s.length; i++) {
        const k = s.key(i);
        if (k && k.startsWith(PREFIX + prefix)) keys.add(k.slice(PREFIX.length));
      }
    } catch {
      /* ignorera */
    }
  }
  return [...keys];
}

export function removePrefix(prefix: string): void {
  for (const k of listKeys(prefix)) {
    const full = PREFIX + k;
    memory.delete(full);
    memoryOnly.delete(full);
    if (storageAvailable()) {
      try {
        ls()!.removeItem(full);
      } catch {
        /* ignorera */
      }
    }
  }
  notify(null);
}

/** Rensar allt AI-verkstaden har sparat i den här webbläsaren. */
export function clearAll(): void {
  removePrefix('');
}
