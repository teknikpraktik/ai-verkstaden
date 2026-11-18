import { useState } from 'react';
import { getProgress, setDone, correctCount } from '../../lib/progress';
import { useStorageListener } from '../lab/LabContext';

/** "Markera som klar" + liten sammanfattning för elevens arbetsöversikt. */
export default function LabCompletion({ labId }: { labId: string }) {
  const read = () => ({ done: getProgress(labId)?.done ?? false, correct: correctCount(labId) });
  const [state, setState] = useState(read);
  useStorageListener(() => setState(read()));
  return (
    <div className="completion">
      <p role="status">
        {state.done ? '✓ Du har markerat labben som klar.' : 'Labben är inte markerad som klar.'} {state.correct > 0 && `Rätt besvarade kontrollfrågor: ${state.correct}.`}
      </p>
      <button
        type="button"
        className={state.done ? 'btn' : 'btn btn-primary'}
        aria-pressed={state.done}
        onClick={() => {
          setDone(labId, !state.done);
          setState(read());
        }}
      >
        {state.done ? 'Markera som ej klar' : 'Markera labben som klar'}
      </button>
      <p className="hint">Sparas bara i den här webbläsaren, som en del av din arbetsöversikt.</p>
    </div>
  );
}
