import { useEffect, useRef, useState } from 'react';
import { correctCount, getLastLab, getProgress } from '../../lib/progress';
import { clearAll, storageAvailable } from '../../lib/storage';
import { useStorageListener } from '../lab/LabContext';

interface LabRow {
  id: string;
  number: number;
  title: string;
  href: string;
  part: string;
}

export default function ProgressOverview({ labs }: { labs: LabRow[] }) {
  const read = () =>
    labs.map((l) => {
      const p = getProgress(l.id);
      return { ...l, visited: p !== null, done: p?.done ?? false, correct: correctCount(l.id) };
    });
  const [rows, setRows] = useState(read);
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState('');
  // Fokus tillbaka till "Rensa"-knappen när bekräftelsen stängs (knappen med fokus försvinner).
  const clearButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);
  useEffect(() => {
    if (!confirm && returnFocus.current) {
      returnFocus.current = false;
      clearButton.current?.focus();
    }
  }, [confirm]);
  useStorageListener(() => setRows(read()));
  const last = getLastLab();
  const done = rows.filter((r) => r.done).length;
  const visited = rows.filter((r) => r.visited).length;

  return (
    <div className="progress-overview">
      {!storageAvailable() && (
        <p className="callout callout-varning">Webbläsaren blockerar lokal lagring. Det du gör sparas bara tills du laddar om sidan.</p>
      )}
      <p role="status">
        Du har öppnat {visited} av {labs.length} labbar och markerat {done} som klara.
      </p>
      {/* Rullbar på smala skärmar; tabIndex gör att den kan rullas med tangentbordet. */}
      <div className="table-wrap" role="region" aria-label="Status per labb" tabIndex={0}>
      <table className="table">
        <caption className="visually-hidden">Status per labb</caption>
        <thead>
          <tr>
            <th scope="col">Nr</th>
            <th scope="col">Labb</th>
            <th scope="col">Status</th>
            <th scope="col">Rätt besvarade frågor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.number}</td>
              <td>
                <a href={r.href}>{r.title}</a>
                {last === r.id && <span className="badge">senast besökt</span>}
              </td>
              <td>{r.done ? '✓ Klar' : r.visited ? '◐ Påbörjad' : '○ Ej öppnad'}</td>
              <td>{r.correct}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <h2>Rensa sparat arbete</h2>
      <p>Allt sparas bara i den här webbläsaren på den här datorn. Använder du en delad dator kan du rensa ditt arbete när du är klar.</p>
      {!confirm ? (
        <button type="button" className="btn btn-danger" ref={clearButton} onClick={() => setConfirm(true)}>
          Rensa allt sparat arbete
        </button>
      ) : (
        <span className="confirm" role="group" aria-label="Bekräfta rensning">
          <span>Det går inte att ångra.</span>
          <button
            type="button"
            className="btn btn-danger"
            autoFocus
            onClick={() => {
              clearAll();
              returnFocus.current = true;
              setConfirm(false);
              setRows(read());
              setMessage('Allt sparat arbete är rensat.');
            }}
          >
            Ja, rensa allt
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              returnFocus.current = true;
              setConfirm(false);
            }}
          >
            Avbryt
          </button>
        </span>
      )}
      <p role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
