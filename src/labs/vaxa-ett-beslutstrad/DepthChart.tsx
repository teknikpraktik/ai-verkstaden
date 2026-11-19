import { pct, type DepthPoint } from './logic';

/** Träffsäkerhet på tränings- och testdata för varje maxdjup. Text finns i tabellen bredvid. */
export function DepthChart({ curve, selected, showTest }: { curve: DepthPoint[]; selected: number; showTest: boolean }) {
  const W = 480;
  const H = 240;
  const m = { l: 52, r: 16, t: 14, b: 46 };
  const xs = (i: number) => m.l + ((i + 0.5) / curve.length) * (W - m.l - m.r);
  const ys = (v: number) => H - m.b - ((v - 0.5) / 0.5) * (H - m.t - m.b);
  const line = (get: (c: DepthPoint) => number) => curve.map((c, i) => `${xs(i)},${ys(get(c))}`).join(' ');
  const desc = curve.map((c) => `djup ${c.depth}: träning ${pct(c.train.accuracy)}${showTest ? `, test ${pct(c.test.accuracy)}` : ''}`).join('; ');
  return (
    <figure className="plot dt-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Träffsäkerhet för olika maxdjup. ${desc}.`}>
        <g className="axis" aria-hidden="true">
          <line x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} />
          <line x1={m.l} x2={m.l} y1={m.t} y2={H - m.b} />
          {[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((v) => (
            <g key={v}>
              <line className="gridline" x1={m.l} x2={W - m.r} y1={ys(v)} y2={ys(v)} />
              <text x={m.l - 6} y={ys(v) + 4} textAnchor="end">
                {Math.round(v * 100)} %
              </text>
            </g>
          ))}
          {curve.map((c, i) => (
            <text key={c.depth} x={xs(i)} y={H - m.b + 16} textAnchor="middle" fontWeight={c.depth === selected ? 700 : 400}>
              {c.depth}
            </text>
          ))}
          <text x={(m.l + W - m.r) / 2} y={H - 6} textAnchor="middle" className="axis-label">
            maxdjup (← enklare träd · fler frågor →)
          </text>
        </g>
        <g aria-hidden="true">
          {curve.map((c, i) =>
            c.depth === selected ? <rect key="sel" x={xs(i) - 22} y={m.t} width={44} height={H - m.t - m.b} fill="var(--accent-soft)" stroke="var(--accent)" strokeDasharray="3 3" /> : null,
          )}
          <polyline points={line((c) => c.train.accuracy)} fill="none" stroke="var(--c1)" strokeWidth={2.5} />
          {showTest && <polyline points={line((c) => c.test.accuracy)} fill="none" stroke="var(--c2)" strokeWidth={2.5} strokeDasharray="7 4" />}
          {curve.map((c, i) => (
            <g key={c.depth}>
              <circle cx={xs(i)} cy={ys(c.train.accuracy)} r={5.5} fill="var(--c1)" stroke="var(--surface)" />
              {showTest && (
                <polygon
                  points={`${xs(i)},${ys(c.test.accuracy) - 7} ${xs(i) + 6},${ys(c.test.accuracy) + 4} ${xs(i) - 6},${ys(c.test.accuracy) + 4}`}
                  fill="var(--c2)"
                  stroke="var(--surface)"
                />
              )}
            </g>
          ))}
        </g>
      </svg>
    </figure>
  );
}
