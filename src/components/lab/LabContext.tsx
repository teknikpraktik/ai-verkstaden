import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { readJSON, STORAGE_EVENT, writeJSON } from '../../lib/storage';
import { labKey } from '../../lib/progress';

export type LabMode = 'guided' | 'experiment';

export interface LabContextValue {
  /** Labbens id (eller t.ex. "kapitel-sokning" för en kunskapskontroll). */
  labId: string;
  /** Genomgångsläge visar en sak i taget, experimentläget öppnar alla reglage. */
  mode: LabMode;
  setMode: (m: LabMode) => void;
}

export const LabContext = createContext<LabContextValue>({
  labId: 'okand',
  mode: 'guided',
  setMode: () => {},
});

export const useLab = () => useContext(LabContext);

/**
 * Som useState men sparas lokalt under lab:<labId>:<key> så att arbetet kan
 * återupptas efter omladdning. "Börja om" i verktygsraden rensar alla sådana
 * nycklar för labben. Använd `validate` för data som kan ha ändrat form.
 */
export function useStoredState<T>(
  key: string,
  initial: T | (() => T),
  validate?: (v: unknown) => v is T,
): [T, (v: T | ((prev: T) => T)) => void] {
  const { labId } = useLab();
  const full = labKey(labId, key);
  const init = () => {
    const fallback = typeof initial === 'function' ? (initial as () => T)() : initial;
    return readJSON<T>(full, fallback, validate);
  };
  const [value, setValue] = useState<T>(init);
  const ref = useRef(value);
  ref.current = value;

  // Håll flera komponenter med samma nyckel i takt (t.ex. en förutsägelse som läses i en annan komponent).
  useEffect(() => {
    const h = (e: Event) => {
      const key = (e as CustomEvent<{ key: string | null }>).detail?.key ?? null;
      if (key !== null && key !== full) return;
      const fallback = typeof initial === 'function' ? (initial as () => T)() : initial;
      const next = readJSON<T>(full, fallback, validate);
      if (JSON.stringify(next) !== JSON.stringify(ref.current)) {
        ref.current = next;
        setValue(next);
      }
    };
    window.addEventListener(STORAGE_EVENT, h);
    return () => window.removeEventListener(STORAGE_EVENT, h);
    // initial/validate behandlas som konstanta för en given nyckel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(ref.current) : v;
      ref.current = next;
      setValue(next);
      writeJSON(full, next);
    },
    [full],
  );
  return [value, set];
}

/** Lyssnar på ändringar i lokal lagring (t.ex. när en annan komponent sparar). */
export function useStorageListener(onChange: (key: string | null) => void): void {
  const cb = useRef(onChange);
  cb.current = onChange;
  useEffect(() => {
    const h = (e: Event) => cb.current((e as CustomEvent<{ key: string | null }>).detail?.key ?? null);
    window.addEventListener(STORAGE_EVENT, h);
    return () => window.removeEventListener(STORAGE_EVENT, h);
  }, []);
}

/** true om användaren har bett om minskad rörelse. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const h = () => setReduced(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return reduced;
}
