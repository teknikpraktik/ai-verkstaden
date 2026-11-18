import { useId, useState, type ReactNode } from 'react';
import { useStoredState } from './LabContext';

/**
 * Frågetyper med automatisk återkoppling.
 *  - choice:  ett eller flera rätta alternativ. Varje fel alternativ har en
 *             förklaring av varför det felsvaret är vanligt. Eleven kan försöka igen.
 *  - numeric: tal med tolerans; kända felsvar kan få egen förklaring.
 *  - open:    öppen fråga som sparas lokalt. Kriterier visas som självbedömning;
 *             exempelresonemang ligger i lärarhandledningen (teacher.ts).
 *  - predict: förutsägelse som sparas utan att rättas. Labben jämför sedan med utfallet.
 */
export interface ChoiceOption {
  id: string;
  text: string;
  correct?: boolean;
  /** Visas om eleven väljer alternativet och det är fel: förklara missuppfattningen. */
  feedback?: string;
}

export interface ChoiceSpec {
  kind: 'choice';
  id: string;
  prompt: string;
  options: ChoiceOption[];
  /** Flera rätta svar: eleven ska kryssa alla. */
  multiple?: boolean;
  /** Visas när svaret är rätt. */
  explanation: string;
}

export interface NumericSpec {
  kind: 'numeric';
  id: string;
  prompt: string;
  answer: number;
  tolerance?: number;
  unit?: string;
  /** Kända felsvar och varför de uppstår. */
  wrong?: { value: number; feedback: string }[];
  hint?: string;
  explanation: string;
}

export interface OpenSpec {
  kind: 'open';
  id: string;
  prompt: string;
  /** Vad ett bra svar innehåller. Visas som självbedömning. */
  criteria: string[];
  placeholder?: string;
}

export interface PredictSpec {
  kind: 'predict';
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
}

export type QuestionSpec = ChoiceSpec | NumericSpec | OpenSpec | PredictSpec;

interface StoredAnswer {
  value: string | string[];
  correct: boolean;
  attempts: number;
}

const isStored = (v: unknown): v is StoredAnswer | null =>
  v === null || (typeof v === 'object' && v !== null && 'correct' in v && 'attempts' in v);

export function Question({ spec, children }: { spec: QuestionSpec; children?: ReactNode }) {
  switch (spec.kind) {
    case 'choice':
      return <ChoiceQuestion spec={spec}>{children}</ChoiceQuestion>;
    case 'numeric':
      return <NumericQuestion spec={spec}>{children}</NumericQuestion>;
    case 'open':
      return <OpenQuestion spec={spec}>{children}</OpenQuestion>;
    case 'predict':
      return <Prediction spec={spec}>{children}</Prediction>;
  }
}

export function QuestionList({ specs }: { specs: QuestionSpec[] }) {
  return (
    <div className="question-list">
      {specs.map((s) => (
        <Question key={s.id} spec={s} />
      ))}
    </div>
  );
}

function sameSet(a: string[], b: string[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

export function ChoiceQuestion({ spec, children }: { spec: ChoiceSpec; children?: ReactNode }) {
  const [stored, setStored] = useStoredState<StoredAnswer | null>(`q:${spec.id}`, null, isStored);
  const [selected, setSelected] = useState<string[]>(() => (stored ? [stored.value].flat() : []));
  const [submitted, setSubmitted] = useState<boolean>(stored !== null);
  const name = useId();
  const correctIds = spec.options.filter((o) => o.correct).map((o) => o.id);

  const isCorrect = submitted && sameSet(selected, correctIds);
  const wrongPicked = submitted && !isCorrect ? spec.options.filter((o) => selected.includes(o.id) && !o.correct) : [];
  const missed = submitted && !isCorrect && spec.multiple ? spec.options.filter((o) => o.correct && !selected.includes(o.id)) : [];

  const submit = () => {
    if (selected.length === 0) return;
    const ok = sameSet(selected, correctIds);
    setSubmitted(true);
    setStored({ value: spec.multiple ? selected : selected[0]!, correct: ok, attempts: (stored?.attempts ?? 0) + 1 });
  };
  const retry = () => {
    setSubmitted(false);
    setSelected([]);
  };

  return (
    <fieldset className={`question ${submitted ? (isCorrect ? 'is-correct' : 'is-wrong') : ''}`} data-question={spec.id}>
      <legend>{spec.prompt}</legend>
      {children}
      {spec.multiple && <p className="hint">Välj alla som stämmer.</p>}
      <div className="options">
        {spec.options.map((o) => (
          <label key={o.id} className="option">
            <input
              type={spec.multiple ? 'checkbox' : 'radio'}
              name={name}
              value={o.id}
              disabled={submitted}
              checked={selected.includes(o.id)}
              onChange={(e) => {
                if (spec.multiple) setSelected((s) => (e.target.checked ? [...s, o.id] : s.filter((x) => x !== o.id)));
                else setSelected([o.id]);
              }}
            />
            <span>{o.text}</span>
          </label>
        ))}
      </div>
      {!submitted ? (
        <button type="button" className="btn btn-primary" onClick={submit} disabled={selected.length === 0}>
          Kontrollera svaret
        </button>
      ) : (
        <div className="feedback" role="status" aria-live="polite">
          {isCorrect ? (
            <>
              <p className="feedback-title">
                <span aria-hidden="true">✓ </span>Rätt!
              </p>
              <p>{spec.explanation}</p>
            </>
          ) : (
            <>
              <p className="feedback-title">
                <span aria-hidden="true">✗ </span>Inte riktigt.
              </p>
              {wrongPicked.map((o) => (
                <p key={o.id}>
                  <strong>{o.text}:</strong> {o.feedback ?? 'Det här alternativet stämmer inte. Läs frågan igen och jämför med det du såg i labben.'}
                </p>
              ))}
              {missed.length > 0 && <p>Du har inte valt alla alternativ som stämmer.</p>}
            </>
          )}
          {!isCorrect && (
            <button type="button" className="btn" onClick={retry}>
              Försök igen
            </button>
          )}
          {isCorrect && (
            <button type="button" className="btn btn-quiet" onClick={retry}>
              Svara om
            </button>
          )}
        </div>
      )}
    </fieldset>
  );
}

export function parseNumber(s: string): number | null {
  const t = s.trim().replace(/\s/g, '').replace(',', '.').replace('−', '-');
  if (t === '') return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
}

export function NumericQuestion({ spec, children }: { spec: NumericSpec; children?: ReactNode }) {
  const [stored, setStored] = useStoredState<StoredAnswer | null>(`q:${spec.id}`, null, isStored);
  const [text, setText] = useState<string>(stored ? String(stored.value) : '');
  const [submitted, setSubmitted] = useState(stored !== null);
  const id = useId();
  const tol = spec.tolerance ?? 1e-9;
  const value = parseNumber(text);
  const isCorrect = submitted && value !== null && Math.abs(value - spec.answer) <= tol;
  const known = submitted && !isCorrect && value !== null ? spec.wrong?.find((w) => Math.abs(w.value - value) <= tol) : undefined;

  const submit = () => {
    if (value === null) return;
    setSubmitted(true);
    setStored({ value: text, correct: Math.abs(value - spec.answer) <= tol, attempts: (stored?.attempts ?? 0) + 1 });
  };

  return (
    <div className={`question ${submitted ? (isCorrect ? 'is-correct' : 'is-wrong') : ''}`} data-question={spec.id} role="group" aria-labelledby={`${id}-p`}>
      <p id={`${id}-p`} className="question-prompt">
        {spec.prompt}
      </p>
      {children}
      <div className="numeric-row">
        <label htmlFor={id} className="visually-hidden">
          Ditt svar
        </label>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={text}
          disabled={submitted}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
        {spec.unit && <span>{spec.unit}</span>}
        {!submitted && (
          <button type="button" className="btn btn-primary" onClick={submit} disabled={value === null}>
            Kontrollera svaret
          </button>
        )}
      </div>
      {!submitted && text !== '' && value === null && <p className="hint">Skriv ett tal, till exempel 4 eller 2,5.</p>}
      {submitted && (
        <div className="feedback" role="status" aria-live="polite">
          {isCorrect ? (
            <>
              <p className="feedback-title">
                <span aria-hidden="true">✓ </span>Rätt!
              </p>
              <p>{spec.explanation}</p>
            </>
          ) : (
            <>
              <p className="feedback-title">
                <span aria-hidden="true">✗ </span>Inte riktigt.
              </p>
              <p>{known?.feedback ?? spec.hint ?? 'Räkna en gång till och kontrollera vad som ska räknas med.'}</p>
            </>
          )}
          <button
            type="button"
            className={isCorrect ? 'btn btn-quiet' : 'btn'}
            onClick={() => {
              setSubmitted(false);
              if (!isCorrect) setText('');
            }}
          >
            {isCorrect ? 'Svara om' : 'Försök igen'}
          </button>
        </div>
      )}
    </div>
  );
}

interface OpenStored {
  text: string;
  checked: number[];
}
const isOpen = (v: unknown): v is OpenStored =>
  typeof v === 'object' && v !== null && typeof (v as OpenStored).text === 'string' && Array.isArray((v as OpenStored).checked);

export function OpenQuestion({ spec, children }: { spec: OpenSpec; children?: ReactNode }) {
  const [stored, setStored] = useStoredState<OpenStored>(`open:${spec.id}`, { text: '', checked: [] }, isOpen);
  const id = useId();
  return (
    <div className="question question-open" data-question={spec.id}>
      <label htmlFor={id} className="question-prompt">
        {spec.prompt}
      </label>
      {children}
      <textarea
        id={id}
        rows={4}
        value={stored.text}
        placeholder={spec.placeholder ?? 'Skriv ditt resonemang här. Det sparas bara i den här webbläsaren.'}
        onChange={(e) => setStored({ ...stored, text: e.target.value })}
      />
      <fieldset className="criteria">
        <legend>Kontrollera ditt svar – ett bra svar …</legend>
        {spec.criteria.map((c, i) => (
          <label key={c} className="option">
            <input
              type="checkbox"
              checked={stored.checked.includes(i)}
              onChange={(e) =>
                setStored({ ...stored, checked: e.target.checked ? [...stored.checked, i] : stored.checked.filter((x) => x !== i) })
              }
            />
            <span>{c}</span>
          </label>
        ))}
      </fieldset>
      <p className="hint" role="status">
        {stored.text.trim().length === 0
          ? 'Inget sparat svar än.'
          : `Sparat lokalt (${stored.text.trim().split(/\s+/).length} ord). ${stored.checked.length} av ${spec.criteria.length} kriterier avbockade.`}
      </p>
    </div>
  );
}

/** Förutsägelse: sparas men rättas inte. Läs värdet med usePrediction(id). */
export function Prediction({ spec, children }: { spec: PredictSpec; children?: ReactNode }) {
  const [value, setValue] = usePrediction(spec.id);
  const name = useId();
  return (
    <fieldset className="question question-predict" data-question={spec.id}>
      <legend>
        <span className="phase-tag">Förutsäg</span> {spec.prompt}
      </legend>
      {children}
      <div className="options">
        {spec.options.map((o) => (
          <label key={o.id} className="option">
            <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => setValue(o.id)} />
            <span>{o.text}</span>
          </label>
        ))}
      </div>
      <p className="hint" role="status">
        {value ? `Din förutsägelse: ${spec.options.find((o) => o.id === value)?.text ?? ''}` : 'Välj vad du tror innan du provar.'}
      </p>
    </fieldset>
  );
}

export function usePrediction(id: string) {
  return useStoredState<string | null>(`predict:${id}`, null, (v): v is string | null => v === null || typeof v === 'string');
}
