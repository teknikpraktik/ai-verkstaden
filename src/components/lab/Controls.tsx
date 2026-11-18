import { useId, type ReactNode } from 'react';

/** Reglage med synligt värde. Fungerar med piltangenter, Home/End och PageUp/PageDown. */
export function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  /** Text som visas och läses upp, t.ex. "3 grannar". */
  format?: (v: number) => string;
  disabled?: boolean;
  hint?: string;
  id?: string;
}) {
  const auto = useId();
  const id = props.id ?? auto;
  const text = props.format ? props.format(props.value) : String(props.value);
  return (
    <div className="field field-slider">
      <label htmlFor={id}>
        {props.label}: <output htmlFor={id}>{text}</output>
      </label>
      <input
        id={id}
        type="range"
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        value={props.value}
        disabled={props.disabled}
        aria-valuetext={text}
        aria-describedby={props.hint ? `${id}-hint` : undefined}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
      {props.hint && (
        <small id={`${id}-hint`} className="hint">
          {props.hint}
        </small>
      )}
    </div>
  );
}

export function NumberField(props: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{props.label}</label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={Number.isFinite(props.value) ? props.value : ''}
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        disabled={props.disabled}
        onChange={(e) => {
          const v = Number(e.target.value.replace(',', '.'));
          if (Number.isFinite(v)) props.onChange(v);
        }}
      />
    </div>
  );
}

export function Toggle(props: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; hint?: string }) {
  const id = useId();
  return (
    <div className="field field-toggle">
      <input id={id} type="checkbox" checked={props.checked} disabled={props.disabled} onChange={(e) => props.onChange(e.target.checked)} />
      <label htmlFor={id}>{props.label}</label>
      {props.hint && <small className="hint">{props.hint}</small>}
    </div>
  );
}

export function SelectField<T extends string>(props: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{props.label}</label>
      <select id={id} value={props.value} disabled={props.disabled} onChange={(e) => props.onChange(e.target.value as T)}>
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Grupp av radioknappar som ser ut som en knapprad. Piltangenter byter val. */
export function Segmented<T extends string>(props: {
  legend: string;
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
  name?: string;
  hideLegend?: boolean;
}) {
  const auto = useId();
  const name = props.name ?? auto;
  return (
    <fieldset className="segmented">
      <legend className={props.hideLegend ? 'visually-hidden' : undefined}>{props.legend}</legend>
      <div className="segmented-options">
        {props.options.map((o) => (
          <label key={o.value} className={o.value === props.value ? 'is-selected' : undefined}>
            <input type="radio" name={name} value={o.value} checked={o.value === props.value} onChange={() => props.onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Ruta för att meddela skärmläsare om förändringar ("3 noder besökta"). */
export function LiveStatus({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={`live-status ${className ?? ''}`} role="status" aria-live="polite">
      {children}
    </p>
  );
}

/** Panel med rubrik – används för att gruppera reglage eller resultat. */
export function Panel({ title, children, className, headingLevel = 3 }: { title: string; children: ReactNode; className?: string; headingLevel?: 2 | 3 | 4 }) {
  const H = `h${headingLevel}` as 'h3';
  return (
    <section className={`panel ${className ?? ''}`}>
      <H className="panel-title">{title}</H>
      {children}
    </section>
  );
}

/** Färgnyckel. Varje post har både färg och symbol/text så att färg aldrig är ensam bärare av information. */
export function Legend({ items, label = 'Färgnyckel' }: { items: { swatch: string; symbol?: string; text: string }[]; label?: string }) {
  return (
    <ul className="legend" aria-label={label}>
      {items.map((it) => (
        <li key={it.text}>
          <span className="legend-swatch" style={{ background: it.swatch }} aria-hidden="true">
            {it.symbol}
          </span>
          {it.text}
        </li>
      ))}
    </ul>
  );
}
