import { PlotFrame } from '../../components/lab/Charts';
import { pct, type CurvePoint, type Plant } from './logic';

/** Diagram med kategorisk x-axel (k-värdena) och träffsäkerhet på y-axeln. */
export function CurveChart({ curve, selected }: { curve: CurvePoint[]; selected: number }) {
  const W = 520;
  const H = 260;
  const m = { l: 52, r: 16, t: 14, b: 46 };
  const xs = (i: number) => m.l + ((i + 0.5) / curve.length) * (W - m.l - m.r);
  const ys = (v: number) => H - m.b - ((v - 0.5) / 0.5) * (H - m.t - m.b);
  const line = (get: (c: CurvePoint) => number) => curve.map((c, i) => `${xs(i)},${ys(get(c))}`).join(' ');
  const desc = curve.map((c) => `k = ${c.k}: träning ${pct(c.train.accuracy)}, validering ${pct(c.validation.accuracy)}`).join('; ');
  return (
    <figure className="plot">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Träffsäkerhet för olika k. ${desc}.`}>
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
            <text key={c.k} x={xs(i)} y={H - m.b + 16} textAnchor="middle" fontWeight={c.k === selected ? 700 : 400}>
              {c.k}
            </text>
          ))}
          <text x={(m.l + W - m.r) / 2} y={H - 6} textAnchor="middle" className="axis-label">
            k (← mer komplex modell · enklare modell →)
          </text>
        </g>
        <g aria-hidden="true">
          {curve.map((c, i) =>
            c.k === selected ? <rect key="sel" x={xs(i) - 22} y={m.t} width={44} height={H - m.t - m.b} fill="var(--accent-soft)" stroke="var(--accent)" strokeDasharray="3 3" /> : null,
          )}
          <polyline points={line((c) => c.train.accuracy)} fill="none" stroke="var(--c1)" strokeWidth={2.5} />
          <polyline points={line((c) => c.validation.accuracy)} fill="none" stroke="var(--c2)" strokeWidth={2.5} strokeDasharray="7 4" />
          {curve.map((c, i) => (
            <g key={c.k}>
              <circle cx={xs(i)} cy={ys(c.train.accuracy)} r={5.5} fill="var(--c1)" stroke="var(--surface)" />
              <polygon
                points={`${xs(i)},${ys(c.validation.accuracy) - 7} ${xs(i) + 6},${ys(c.validation.accuracy) + 4} ${xs(i) - 6},${ys(c.validation.accuracy) + 4}`}
                fill="var(--c2)"
                stroke="var(--surface)"
              />
            </g>
          ))}
        </g>
      </svg>
    </figure>
  );
}

export function PlantPlot({ train, grid, k }: { train: Plant[]; grid: (boolean | null)[][]; k: number }) {
  const n = grid.length;
  const sickShare = grid.flat().filter((v) => v === true).length / Math.max(1, n * n);
  return (
    <PlotFrame
      width={420}
      height={380}
      xDomain={[0, 10]}
      yDomain={[0, 10]}
      xLabel="Fläckar på bladen (0–10)"
      yLabel="Jordfuktighet (0–10)"
      title={`Träningsplantorna och modellens svar med k = ${k}`}
      description={`${train.filter((p) => p.sick).length} sjuka plantor (trianglar) och ${train.filter((p) => !p.sick).length} friska (cirklar). Modellen svarar sjuk på ungefär ${Math.round(sickShare * 100)} % av ytan, mest uppe till höger.`}
    >
      {(x, y) => (
        <g aria-hidden="true">
          <g shapeRendering="crispEdges">
            {grid.flatMap((row, r) =>
              row.map((v, c) =>
                v === null ? null : (
                  <rect
                    key={`${r}-${c}`}
                    x={x((c / n) * 10)}
                    y={y(((r + 1) / n) * 10)}
                    width={x(10 / n) - x(0) + 1}
                    height={y(0) - y(10 / n) + 1}
                    fill={v ? 'var(--c2)' : 'var(--c1)'}
                    opacity={0.14}
                  />
                ),
              ),
            )}
          </g>
          {train.map((p) =>
            p.sick ? (
              <polygon key={p.id} points={`${x(p.x)},${y(p.y) - 6} ${x(p.x) + 5.2},${y(p.y) + 3.5} ${x(p.x) - 5.2},${y(p.y) + 3.5}`} fill="var(--c2)" stroke="var(--surface)" />
            ) : (
              <circle key={p.id} cx={x(p.x)} cy={y(p.y)} r={4.2} fill="var(--c1)" stroke="var(--surface)" />
            ),
          )}
        </g>
      )}
    </PlotFrame>
  );
}
