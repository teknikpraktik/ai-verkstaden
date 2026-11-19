import { useEffect, useMemo, useState } from 'react';

export interface GlossaryItem {
  id: string;
  term: string;
  definition: string;
  aliases: string[];
  related: { id: string; term: string }[];
  labs: { title: string; href: string; number: number; chapter: string; chapterHref: string | null }[];
}

const norm = (s: string) => s.toLocaleLowerCase('sv').normalize('NFC');

/** Sökbar begreppslista. Utan JavaScript visas hela listan statiskt (se sidan). */
export default function GlossarySearch({ items }: { items: GlossaryItem[] }) {
  const [q, setQ] = useState('');
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('q');
    if (p) setQ(p);
  }, []);
  const hits = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return items;
    return items.filter((i) => [i.term, i.definition, ...i.aliases].some((t) => norm(t).includes(n)));
  }, [q, items]);

  return (
    <div className="glossary">
      <div className="field glossary-search">
        <label htmlFor="begrepp-sok">Sök bland begreppen</label>
        <input id="begrepp-sok" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="t.ex. kö, överanpassning, GDPR" autoComplete="off" />
      </div>
      <p role="status" aria-live="polite">
        {q.trim() ? `${hits.length} begrepp matchar ”${q.trim()}”.` : `${items.length} begrepp.`}
      </p>
      <dl className="glossary-list">
        {hits.map((i) => (
          <div key={i.id} id={i.id} className="glossary-item">
            <dt>{i.term}</dt>
            <dd>
              <p>{i.definition}</p>
              {i.aliases.length > 0 && <p className="hint">Även: {i.aliases.join(', ')}</p>}
              {i.labs.length > 0 && (
                <p>
                  Används i:{' '}
                  {i.labs.map((l, k) => (
                    <span key={l.href}>
                      {k > 0 && ', '}
                      <a href={l.href}>
                        {l.number}. {l.title}
                      </a>
                      {l.chapterHref && (
                        <>
                          {' '}
                          (<a href={l.chapterHref}>{l.chapter}</a>)
                        </>
                      )}
                    </span>
                  ))}
                </p>
              )}
              {i.related.length > 0 && (
                <p>
                  Se även:{' '}
                  {i.related.map((r, k) => (
                    <span key={r.id}>
                      {k > 0 && ', '}
                      <a href={`#${r.id}`} onClick={() => setQ('')}>
                        {r.term}
                      </a>
                    </span>
                  ))}
                </p>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
