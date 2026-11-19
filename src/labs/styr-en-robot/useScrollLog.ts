import { useEffect, useRef } from 'react';

/** Rullar loggens behållare (inte sidan) så att raden med klassen rb-current syns. */
export function useScrollLog<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const box = ref.current;
    const row = box?.querySelector<HTMLElement>('tr.rb-current');
    if (!box || !row) return;
    const top = row.offsetTop - box.clientHeight / 2;
    box.scrollTop = Math.max(0, top);
  }, [dep]);
  return ref;
}
