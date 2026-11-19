import { Component, lazy, Suspense, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { LabContext, type LabMode } from './LabContext';
import { markVisited, resetLab } from '../../lib/progress';
import { readJSON, writeJSON } from '../../lib/storage';

export interface LabProps {
  labId: string;
}

const modules = import.meta.glob<{ default: ComponentType<LabProps> }>('../../labs/*/Lab.tsx');

class Boundary extends Component<{ children: ReactNode; onReset: () => void }, { error: Error | null }> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override render() {
    if (this.state.error) {
      return (
        <div className="callout callout-varning" role="alert">
          <p>
            <strong>Något gick fel i labben.</strong> Prova att börja om. Om felet kommer tillbaka, berätta för din lärare vad du gjorde precis innan.
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              this.setState({ error: null });
              this.props.onReset();
            }}
          >
            Börja om labben
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Gemensamt skal för alla labbar: läge (genomgång/experiment), "Börja om",
 * felhantering och registrering av besök. Själva labben laddas från
 * src/labs/<labId>/Lab.tsx.
 */
export default function LabHost({ labId, hasModes = true }: { labId: string; hasModes?: boolean }) {
  const loader = modules[`../../labs/${labId}/Lab.tsx`];
  const LabComponent = useMemo(() => (loader ? lazy(loader) : null), [loader]);
  const modeKey = `ui:${labId}:mode`;
  const [mode, setModeState] = useState<LabMode>(() => readJSON<LabMode>(modeKey, 'guided', (v): v is LabMode => v === 'guided' || v === 'experiment'));
  const [generation, setGeneration] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [announce, setAnnounce] = useState('');
  // När bekräftelsen stängs (Ja eller Avbryt) försvinner knappen som hade fokus.
  // Fokus lämnas då tillbaka till "Börja om" i stället för att hamna på sidans början.
  const resetButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);
  useEffect(() => {
    if (!confirming && returnFocus.current) {
      returnFocus.current = false;
      resetButton.current?.focus();
    }
  }, [confirming]);

  useEffect(() => {
    markVisited(labId);
  }, [labId]);

  const setMode = (m: LabMode) => {
    setModeState(m);
    writeJSON(modeKey, m);
    setAnnounce(m === 'guided' ? 'Genomgångsläge: ett steg i taget.' : 'Experimentläge: alla reglage är öppna.');
  };

  const doReset = () => {
    resetLab(labId);
    setGeneration((g) => g + 1);
    returnFocus.current = true;
    setConfirming(false);
    setAnnounce('Labben är återställd till startläget.');
  };

  if (!LabComponent) {
    return <p className="callout callout-varning">Labben kunde inte hittas.</p>;
  }

  return (
    <LabContext.Provider value={{ labId, mode, setMode }}>
      <div className="lab-toolbar" role="group" aria-label="Labbverktyg">
        {hasModes && (
          <fieldset className="segmented mode-switch">
            <legend className="visually-hidden">Arbetsläge</legend>
            <div className="segmented-options">
              <label className={mode === 'guided' ? 'is-selected' : undefined}>
                <input type="radio" name={`mode-${labId}`} checked={mode === 'guided'} onChange={() => setMode('guided')} />
                <span>Genomgång</span>
              </label>
              <label className={mode === 'experiment' ? 'is-selected' : undefined}>
                <input type="radio" name={`mode-${labId}`} checked={mode === 'experiment'} onChange={() => setMode('experiment')} />
                <span>Experiment</span>
              </label>
            </div>
          </fieldset>
        )}
        <div className="toolbar-spacer" />
        {!confirming ? (
          <button type="button" className="btn" ref={resetButton} onClick={() => setConfirming(true)}>
            <span aria-hidden="true">↺ </span>Börja om
          </button>
        ) : (
          <span className="confirm" role="group" aria-label="Bekräfta återställning">
            <span>Allt du gjort i labben raderas.</span>
            <button type="button" className="btn btn-danger" onClick={doReset} autoFocus>
              Ja, börja om
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                returnFocus.current = true;
                setConfirming(false);
              }}
            >
              Avbryt
            </button>
          </span>
        )}
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">
        {announce}
      </p>
      <Boundary onReset={doReset}>
        <Suspense fallback={<p className="loading">Laddar labben …</p>}>
          <div className="lab-root" data-mode={mode} data-ready="true">
            <LabComponent key={generation} labId={labId} />
          </div>
        </Suspense>
      </Boundary>
    </LabContext.Provider>
  );
}
