import { COLS, Grid } from '../../components/lab/Grid';
import { blackCount, classInfo, objectName, pct, sceneObjects, SIZE, type Img, type WindowResult } from './logic';

const ON = '#111418';
const OFF = '#ffffff';

/** Bilden som rutnät. Med `onToggle` kan pixlarna ändras med klick eller piltangenter + Enter. */
export function PixelGrid({ img, numbers, label, onToggle }: { img: Img; numbers: boolean; label: string; onToggle?: (r: number, c: number) => void }) {
  return (
    <Grid
      rows={img.length}
      cols={img[0]?.length ?? 0}
      coordinates
      cellSize={40}
      className="pixel-grid"
      label={label}
      onActivate={onToggle}
      cell={(r, c) => {
        const v = img[r]![c]!;
        return {
          content: numbers ? String(v) : '',
          label: `Rad ${r + 1}, kolumn ${COLS[c]}: ${v ? 'svart (1)' : 'vit (0)'}`,
          className: v ? 'px-on' : 'px-off',
        };
      }}
    />
  );
}

/** Liten bild som SVG med textalternativ. */
export function MiniImage({ img, label, width = 72 }: { img: Img; label: string; width?: number }) {
  const h = img.length;
  const w = img[0]?.length ?? 0;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={width} height={(width * h) / Math.max(w, 1)} role="img" aria-label={label} style={{ border: '1px solid var(--border-strong)' }}>
      {img.map((row, r) => row.map((v, c) => <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={v ? ON : OFF} stroke="#c9ced8" strokeWidth={0.04} />))}
    </svg>
  );
}

export function imageAlt(img: Img, what: string) {
  const n = blackCount(img);
  return `${what}: ${n} svarta pixlar av ${img.length * (img[0]?.length ?? 0)}`;
}

/**
 * Den större scenen med det glidande fönstret och fynden.
 * `window` är aktuellt fönster (eller null), `found` fynden som ska visas och `verdicts` om de är rätt.
 */
export function SceneView({ scene, window: win, found, verdicts, thresholdPct }: { scene: Img; window: WindowResult | null; found: WindowResult[]; verdicts: boolean[]; thresholdPct: number }) {
  const h = scene.length;
  const w = scene[0]?.length ?? 0;
  const top = 1.4;
  const bottom = 1.4;
  const desc = [
    `En svartvit bild på ${w} × ${h} pixlar med fyra föremål: ${sceneObjects.map((o) => `${objectName(o.label)} vid kolumn ${o.x + 1}`).join(', ')}.`,
    win ? `Fönstret står vid kolumn ${win.x + 1}–${win.x + SIZE}, rad ${win.y + 1}–${win.y + SIZE}.` : 'Inget fönster visas.',
    found.length === 0 ? 'Inga fynd visas.' : `Fynd: ${found.map((f, i) => `${f.best ? classInfo[f.best].name : '?'} ${pct(f.score)} % vid kolumn ${f.x + 1} (${verdicts[i] ? 'rätt' : 'fel'})`).join('; ')}.`,
    `Tröskel ${thresholdPct} %.`,
  ].join(' ');
  return (
    <figure className="pixel-scene">
      <svg viewBox={`-0.3 ${-top} ${w + 0.6} ${h + top + bottom}`} role="img" aria-label={desc}>
        <rect x={-0.3} y={-top} width={w + 0.6} height={h + top + bottom} fill="var(--surface)" />
        {scene.map((row, r) => row.map((v, c) => <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={v ? ON : OFF} stroke="#c9ced8" strokeWidth={0.03} />))}
        {found.map((f, i) => {
          const ok = verdicts[i];
          const color = ok ? 'var(--ok)' : 'var(--bad)';
          return (
            <g key={`${f.x}-${f.y}`}>
              <rect x={f.x + 0.1} y={f.y + 0.1} width={SIZE - 0.2} height={SIZE - 0.2} fill="none" stroke={color} strokeWidth={0.2} />
              <text x={f.x + 0.1} y={-0.35} fontSize={0.85} fill={color} fontWeight={700}>
                {ok ? '✓' : '✗'} {f.best ? classInfo[f.best].name : ''} {pct(f.score)}%
              </text>
            </g>
          );
        })}
        {win && <rect x={win.x} y={win.y} width={SIZE} height={SIZE} fill="none" stroke="var(--focus)" strokeWidth={0.18} strokeDasharray="0.5 0.3" />}
        {sceneObjects.map((o) => (
          <text key={o.x} x={o.x + SIZE / 2} y={h + 1} fontSize={0.75} textAnchor="middle" fill="var(--text-muted)">
            {objectName(o.label)}
          </text>
        ))}
      </svg>
      <figcaption className="hint">Grå text under bilden: vad som egentligen finns där (facit). Streckad ram: fönstret just nu. Hel ram med ✓ eller ✗: modellens fynd.</figcaption>
    </figure>
  );
}
