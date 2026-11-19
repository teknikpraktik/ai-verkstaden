import type { ReactNode } from 'react';

export interface Scale {
  (v: number): number;
  domain: [number, number];
  range: [number, number];
}

export function linearScale(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const f = ((v: number) => (d1 === d0 ? (r0 + r1) / 2 : r0 + ((v - d0) / (d1 - d0)) * (r1 - r0))) as Scale;
  f.domain = domain;
  f.range = range;
  return f;
}

function ticks([a, b]: [number, number], count = 5): number[] {
  const span = b - a;
  if (span <= 0) return [a];
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(Number(v.toFixed(10)));
  return out;
}

const fmt = (v: number) => (Math.abs(v) >= 100 || Number.isInteger(v) ? String(Math.round(v)) : v.toFixed(1).replace('.', ','));

/**
 * SVG-ram med axlar. Barnen får skalorna och ritar själva. Ge alltid en
 * textbeskrivning (`description`) – och gärna en tabell bredvid – så att
 * diagrammet går att förstå utan att se det.
 */
export function PlotFrame(props: {
  width?: number;
  height?: number;
  xDomain: [number, number];
  yDomain: [number, number];
  xLabel: string;
  yLabel: string;
  title: string;
  description: string;
  children: (x: Scale, y: Scale) => ReactNode;
  onClickPlot?: (dataX: number, dataY: number) => void;
}) {
  const W = props.width ?? 480;
  const H = props.height ?? 320;
  const m = { l: 48, r: 24, t: 12, b: 40 };
  const x = linearScale(props.xDomain, [m.l, W - m.r]);
  const y = linearScale(props.yDomain, [H - m.b, m.t]);
  return (
    <figure className="plot">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${props.title}. ${props.description}`}
        onClick={
          props.onClickPlot
            ? (e) => {
                const svg = e.currentTarget;
                const pt = svg.createSVGPoint();
                pt.x = e.clientX;
                pt.y = e.clientY;
                const ctm = svg.getScreenCTM();
                if (!ctm) return;
                const p = pt.matrixTransform(ctm.inverse());
                const dx = props.xDomain[0] + ((p.x - m.l) / (W - m.l - m.r)) * (props.xDomain[1] - props.xDomain[0]);
                const dy = props.yDomain[0] + ((H - m.b - p.y) / (H - m.t - m.b)) * (props.yDomain[1] - props.yDomain[0]);
                props.onClickPlot!(dx, dy);
              }
            : undefined
        }
      >
        <g className="axis" aria-hidden="true">
          <line x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} />
          <line x1={m.l} x2={m.l} y1={m.t} y2={H - m.b} />
          {ticks(props.xDomain).map((t) => (
            <g key={`x${t}`}>
              <line x1={x(t)} x2={x(t)} y1={H - m.b} y2={H - m.b + 4} />
              <text x={x(t)} y={H - m.b + 16} textAnchor="middle">
                {fmt(t)}
              </text>
            </g>
          ))}
          {ticks(props.yDomain).map((t) => (
            <g key={`y${t}`}>
              <line x1={m.l - 4} x2={m.l} y1={y(t)} y2={y(t)} />
              <line className="gridline" x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} />
              <text x={m.l - 6} y={y(t) + 4} textAnchor="end">
                {fmt(t)}
              </text>
            </g>
          ))}
          <text x={(m.l + W - m.r) / 2} y={H - 4} textAnchor="middle" className="axis-label">
            {props.xLabel}
          </text>
          <text x={12} y={(m.t + H - m.b) / 2} textAnchor="middle" className="axis-label" transform={`rotate(-90 12 ${(m.t + H - m.b) / 2})`}>
            {props.yLabel}
          </text>
        </g>
        {props.children(x, y)}
      </svg>
      <figcaption className="visually-hidden">{props.description}</figcaption>
    </figure>
  );
}

/** Liggande stapeldiagram med värdet utskrivet som text på varje stapel. */
export function BarChart(props: {
  title: string;
  data: { label: string; value: number; color?: string; note?: string }[];
  max?: number;
  format?: (v: number) => string;
}) {
  const max = props.max ?? Math.max(1e-9, ...props.data.map((d) => d.value));
  const f = props.format ?? fmt;
  return (
    <figure className="barchart">
      <figcaption className="barchart-title">{props.title}</figcaption>
      <ul>
        {props.data.map((d) => (
          <li key={d.label}>
            <span className="bar-label">{d.label}</span>
            <span className="bar-track" aria-hidden="true">
              <span className="bar-fill" style={{ width: `${Math.max(0, Math.min(1, d.value / max)) * 100}%`, background: d.color }} />
            </span>
            <span className="bar-value">
              {f(d.value)}
              {d.note ? ` ${d.note}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Förväxlingsmatris med antal och förklarande text i varje ruta. */
export function ConfusionMatrix(props: {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  positive?: string;
  negative?: string;
  caption?: string;
}) {
  const pos = props.positive ?? 'Ja';
  const neg = props.negative ?? 'Nej';
  return (
    <table className="confusion">
      <caption>{props.caption ?? 'Förväxlingsmatris'}</caption>
      <thead>
        <tr>
          <td />
          <th scope="col">Modellen sa: {pos}</th>
          <th scope="col">Modellen sa: {neg}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Egentligen: {pos}</th>
          <td className="cm-ok">
            <strong>{props.tp}</strong>
            <span>sant positiva ✓</span>
          </td>
          <td className="cm-bad">
            <strong>{props.fn}</strong>
            <span>falskt negativa ✗</span>
          </td>
        </tr>
        <tr>
          <th scope="row">Egentligen: {neg}</th>
          <td className="cm-bad">
            <strong>{props.fp}</strong>
            <span>falskt positiva ✗</span>
          </td>
          <td className="cm-ok">
            <strong>{props.tn}</strong>
            <span>sant negativa ✓</span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/** Andel som text med nämnare: "3 av 20 (15 %)". */
export function ratioText(part: number, whole: number): string {
  if (whole === 0) return `${part} av 0 (kan inte beräknas)`;
  return `${part} av ${whole} (${Math.round((100 * part) / whole)} %)`;
}
