import type { ReactNode } from 'react';
import { useLab, useStoredState } from './LabContext';

export type Phase = 'forutsag' | 'prova' | 'jamfor' | 'forklara';

export const phaseLabel: Record<Phase, string> = {
  forutsag: 'Förutsäg',
  prova: 'Prova',
  jamfor: 'Jämför',
  forklara: 'Förklara',
};

export interface GuidedStep {
  id: string;
  phase: Phase;
  title: string;
  /** Instruktion och eventuella frågor för steget. */
  body: ReactNode;
}

/**
 * Stegvis genomgång: förutsäg → prova → jämför → förklara.
 * I genomgångsläget visas ett steg i taget. I experimentläget visas alla steg
 * hopfällda så att eleven kan hoppa fritt. Aktuellt steg sparas lokalt.
 * `onStepChange` låter labben anpassa arbetsytan efter steget.
 */
export function GuidedSteps({
  steps,
  onStepChange,
  index: controlled,
  title = 'Steg för steg',
}: {
  steps: GuidedStep[];
  onStepChange?: (index: number, step: GuidedStep) => void;
  /** Styrt läge: labben äger stegnumret (t.ex. via useGuidedStep()) och får ändringar via onStepChange. */
  index?: number;
  title?: string;
}) {
  const { mode } = useLab();
  const [stored, setStored] = useGuidedStep();
  const current = controlled ?? stored;
  const setCurrent = controlled === undefined ? setStored : () => {};
  const index = Math.min(Math.max(current, 0), steps.length - 1);
  const step = steps[index];
  const go = (i: number) => {
    setCurrent(i);
    const s = steps[i];
    if (s) onStepChange?.(i, s);
  };
  if (!step) return null;

  if (mode === 'experiment') {
    return (
      <section className="guided guided-all" aria-label={title}>
        <h3 className="panel-title">{title}</h3>
        {steps.map((s, i) => (
          <details key={s.id} open={i === index} onToggle={(e) => (e.currentTarget.open ? go(i) : undefined)}>
            <summary>
              <span className={`phase-tag phase-${s.phase}`}>{phaseLabel[s.phase]}</span> {i + 1}. {s.title}
            </summary>
            <div className="guided-body">{s.body}</div>
          </details>
        ))}
      </section>
    );
  }

  return (
    <section className="guided" aria-label={title} data-step={step.id}>
      <ol className="phase-track" aria-label="Var i genomgången du är">
        {steps.map((s, i) => (
          <li key={s.id} className={i === index ? 'is-current' : i < index ? 'is-done' : undefined} aria-current={i === index ? 'step' : undefined}>
            <span className="visually-hidden">
              Steg {i + 1}: {s.title}
              {i < index ? ' (klart)' : ''}
            </span>
            <span aria-hidden="true">{i + 1}</span>
          </li>
        ))}
      </ol>
      <h3 className="guided-title" tabIndex={-1}>
        <span className={`phase-tag phase-${step.phase}`}>{phaseLabel[step.phase]}</span> Steg {index + 1} av {steps.length}: {step.title}
      </h3>
      <div className="guided-body">{step.body}</div>
      <div className="guided-nav">
        <button type="button" className="btn" onClick={() => go(index - 1)} disabled={index === 0}>
          <span aria-hidden="true">← </span>Tillbaka
        </button>
        <button type="button" className="btn btn-primary" onClick={() => go(index + 1)} disabled={index === steps.length - 1}>
          Gå vidare<span aria-hidden="true"> →</span>
        </button>
      </div>
    </section>
  );
}

/** Aktuellt genomgångssteg (sparas lokalt). Använd tillsammans med <GuidedSteps index=... />. */
export function useGuidedStep() {
  return useStoredState<number>('guided-step', 0, (v): v is number => typeof v === 'number');
}
