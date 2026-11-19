import { useEffect, useState } from 'react';
import { readJSON, writeJSON } from '../../lib/storage';

/** Projektorläge: större text och tjockare linjer. Sparas lokalt. */
export default function DisplaySettings() {
  const [projector, setProjector] = useState(false);
  useEffect(() => {
    const v = readJSON<boolean>('ui:projector', false, (x): x is boolean => typeof x === 'boolean');
    setProjector(v);
  }, []);
  useEffect(() => {
    document.documentElement.toggleAttribute('data-projector', projector);
  }, [projector]);
  return (
    <button
      type="button"
      className="btn btn-quiet header-btn"
      aria-pressed={projector}
      onClick={() => {
        setProjector(!projector);
        writeJSON('ui:projector', !projector);
      }}
    >
      <span aria-hidden="true">⛶ </span>Projektorläge
    </button>
  );
}
