import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

/** Kolumnbokstäver för koordinater. */
export const COLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export interface CellView {
  /** Synligt innehåll (symbol/text). Använd alltid en symbol eller text – inte bara färg. */
  content?: ReactNode;
  /** Uppläst beskrivning, t.ex. "Rad 2, kolumn 3: vägg". */
  label: string;
  className?: string;
}

/**
 * Tillgängligt rutnät. Piltangenter flyttar fokus, Enter/mellanslag aktiverar
 * rutan (t.ex. växla vägg). Home/End går till radens början/slut. Klick fungerar
 * också, så dragning behövs aldrig.
 */
export function Grid(props: {
  rows: number;
  cols: number;
  cell: (r: number, c: number) => CellView;
  onActivate?: (r: number, c: number) => void;
  label: string;
  /** Storlek per ruta i px (skalas ned på smala skärmar). */
  cellSize?: number;
  className?: string;
  /** Visa kolumnbokstäver (A, B, …) och radnummer (1, 2, …) runt rutnätet. */
  coordinates?: boolean;
}) {
  const coords = props.coordinates ?? false;
  const [focus, setFocus] = useState<[number, number]>([0, 0]);
  const ref = useRef<HTMLDivElement>(null);
  const size = props.cellSize ?? 44;

  const move = (r: number, c: number) => {
    const nr = Math.max(0, Math.min(props.rows - 1, r));
    const nc = Math.max(0, Math.min(props.cols - 1, c));
    setFocus([nr, nc]);
    const el = ref.current?.querySelector<HTMLElement>(`[data-cell="${nr}-${nc}"]`);
    el?.focus();
  };

  const onKey = (e: KeyboardEvent, r: number, c: number) => {
    const map: Record<string, [number, number]> = {
      ArrowUp: [r - 1, c],
      ArrowDown: [r + 1, c],
      ArrowLeft: [r, c - 1],
      ArrowRight: [r, c + 1],
      Home: [r, 0],
      End: [r, props.cols - 1],
    };
    const t = map[e.key];
    if (t) {
      e.preventDefault();
      move(t[0], t[1]);
    } else if ((e.key === 'Enter' || e.key === ' ') && props.onActivate) {
      e.preventDefault();
      props.onActivate(r, c);
    }
  };

  return (
    <div
      ref={ref}
      role="grid"
      aria-label={props.label}
      aria-rowcount={props.rows}
      aria-colcount={props.cols}
      className={`grid-board ${props.className ?? ''}`}
      style={{
        ['--cell' as string]: `${size}px`,
        ['--cols' as string]: String(props.cols + (coords ? 1 : 0)),
        gridTemplateColumns: `${coords ? 'auto ' : ''}repeat(${props.cols}, var(--cell-fit, var(--cell)))`,
      }}
    >
      {coords && (
        <div role="row" className="grid-row" aria-hidden="true">
          <span className="grid-coord" />
          {Array.from({ length: props.cols }, (_, c) => (
            <span key={c} className="grid-coord">
              {COLS[c] ?? c + 1}
            </span>
          ))}
        </div>
      )}
      {Array.from({ length: props.rows }, (_, r) => (
        <div role="row" key={r} className="grid-row" aria-rowindex={r + 1}>
          {coords && (
            <span className="grid-coord" aria-hidden="true">
              {r + 1}
            </span>
          )}
          {Array.from({ length: props.cols }, (_, c) => {
            const v = props.cell(r, c);
            const focused = focus[0] === r && focus[1] === c;
            return (
              <div
                role="gridcell"
                key={c}
                aria-colindex={c + 1}
                data-cell={`${r}-${c}`}
                tabIndex={focused ? 0 : -1}
                aria-label={v.label}
                className={`grid-cell ${v.className ?? ''} ${props.onActivate ? 'is-editable' : ''}`}
                onClick={() => {
                  setFocus([r, c]);
                  props.onActivate?.(r, c);
                }}
                onKeyDown={(e) => onKey(e, r, c)}
                onFocus={() => setFocus([r, c])}
              >
                <span aria-hidden="true">{v.content}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
