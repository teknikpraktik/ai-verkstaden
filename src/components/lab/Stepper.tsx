import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './LabContext';

/**
 * Stegning av ett algoritmförlopp. Förloppet är en lista med förberäknade
 * ögonblicksbilder (frames), så att "steg bakåt" och "börja om" alltid är exakta.
 * Automatisk uppspelning startar aldrig av sig själv. Vid minskad rörelse går
 * uppspelningen långsammare och komponenter bör stänga av övergångar.
 */
export function useStepper(frameCount: number, opts: { initial?: number } = {}) {
  const [index, setIndex] = useState(Math.min(opts.initial ?? 0, Math.max(frameCount - 1, 0)));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const reduced = usePrefersReducedMotion();
  const last = Math.max(frameCount - 1, 0);

  useEffect(() => {
    if (index > last) setIndex(last);
  }, [index, last]);

  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (!playing) return;
    const delay = (reduced ? 1400 : 700) / speed;
    timer.current = window.setTimeout(() => {
      setIndex((i) => {
        if (i >= last) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, delay);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, index, last, speed, reduced]);

  useEffect(() => {
    if (index >= last) setPlaying(false);
  }, [index, last]);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, last)), [last]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const reset = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);
  const toEnd = useCallback(() => {
    setPlaying(false);
    setIndex(last);
  }, [last]);

  return { index, setIndex, playing, setPlaying, next, prev, reset, toEnd, speed, setSpeed, atEnd: index >= last, atStart: index === 0, last };
}

export type StepperState = ReturnType<typeof useStepper>;

export function StepperControls({ stepper, label = 'Förlopp', showSpeed = true }: { stepper: StepperState; label?: string; showSpeed?: boolean }) {
  const s = stepper;
  // En knapp som blir inaktiv (t.ex. "Till slutet" när slutet nåtts) tappar
  // fokus, och tangentbordsanvändaren hamnar då på sidans början. Flytta i så
  // fall fokus till närmaste knapp som fortfarande går att använda.
  const group = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = lastFocused.current;
    if (!(el instanceof HTMLButtonElement) || !el.disabled) return;
    const active = document.activeElement;
    if (active && active !== document.body && active !== el) return;
    const buttons = [...(group.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])];
    const prefer = s.atEnd ? buttons.slice().reverse() : buttons.slice(2).concat(buttons.slice(0, 2));
    prefer.find((b) => !b.disabled)?.focus();
  }, [s.atStart, s.atEnd, s.playing]);
  return (
    <div
      className="stepper"
      role="group"
      aria-label={label}
      ref={group}
      onFocus={(e) => {
        lastFocused.current = e.target;
      }}
    >
      <button type="button" className="btn" onClick={s.reset} disabled={s.atStart}>
        <span aria-hidden="true">⏮ </span>Till början
      </button>
      <button type="button" className="btn" onClick={s.prev} disabled={s.atStart}>
        <span aria-hidden="true">◀ </span>Steg bakåt
      </button>
      <button type="button" className="btn btn-primary" onClick={s.next} disabled={s.atEnd}>
        Steg framåt<span aria-hidden="true"> ▶</span>
      </button>
      <button type="button" className="btn" onClick={() => s.setPlaying(!s.playing)} disabled={s.atEnd && !s.playing} aria-pressed={s.playing}>
        {s.playing ? (
          <>
            <span aria-hidden="true">⏸ </span>Pausa
          </>
        ) : (
          <>
            <span aria-hidden="true">⏵ </span>Spela upp
          </>
        )}
      </button>
      <button type="button" className="btn" onClick={s.toEnd} disabled={s.atEnd}>
        Till slutet<span aria-hidden="true"> ⏭</span>
      </button>
      {showSpeed && (
        <label className="stepper-speed">
          Hastighet
          <select value={s.speed} onChange={(e) => s.setSpeed(Number(e.target.value))}>
            <option value={0.5}>Långsam</option>
            <option value={1}>Normal</option>
            <option value={2}>Snabb</option>
          </select>
        </label>
      )}
      <span className="stepper-count" aria-live="polite">
        Steg {s.index} av {s.last}
      </span>
    </div>
  );
}
