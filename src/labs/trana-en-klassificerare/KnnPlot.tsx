import { PlotFrame } from '../../components/lab/Charts';
import { classInfo, fmt, X_DOMAIN, Y_DOMAIN, type BoundaryGrid, type ClassId, type Point, type Prediction } from './logic';

/** Symbol i SVG: cirkel för klass a, triangel för klass b. */
export function ClassMark({ x, y, label, size = 7, highlight = false }: { x: number; y: number; label: ClassId; size?: number; highlight?: boolean }) {
  const color = classInfo[label].color;
  const stroke = highlight ? 'var(--text)' : 'var(--surface)';
  const sw = highlight ? 2.5 : 1.5;
  if (label === 'a') return <circle cx={x} cy={y} r={size} fill={color} stroke={stroke} strokeWidth={sw} />;
  const s = size * 1.25;
  return <polygon points={`${x},${y - s} ${x + s * 0.87},${y + s * 0.6} ${x - s * 0.87},${y + s * 0.6}`} fill={color} stroke={stroke} strokeWidth={sw} />;
}

export function KnnPlot(props: {
  points: Point[];
  query: { x: number; y: number };
  prediction: Prediction | null;
  grid: BoundaryGrid | null;
  k: number;
  showNeighbours: boolean;
  highlightId?: number;
  onClickPlot?: (x: number, y: number) => void;
}) {
  const { points, query, prediction, grid } = props;
  const desc = [
    `${points.filter((p) => p.label === 'a').length} äpplen (cirklar) och ${points.filter((p) => p.label === 'b').length} päron (trianglar).`,
    `Den nya frukten (stjärna) har bredd ${fmt(query.x)} cm och höjd ${fmt(query.y)} cm.`,
    grid ? `Bakgrunden visar vad modellen svarar med k = ${props.k}: ${Math.round(grid.share.a * 100)} % av ytan blir äpple och ${Math.round(grid.share.b * 100)} % päron.` : 'Klassificeringsgränsen visas inte ännu.',
    'Tabellerna bredvid innehåller samma information.',
  ].join(' ');
  const neighbourIds = new Set(props.showNeighbours && prediction ? prediction.neighbours.map((n) => n.point.id) : []);
  return (
    <PlotFrame
      width={460}
      height={500}
      xDomain={X_DOMAIN}
      yDomain={Y_DOMAIN}
      xLabel="Bredd (cm)"
      yLabel="Höjd (cm)"
      title="Frukterna i fruktlådan"
      description={desc}
      onClickPlot={props.onClickPlot}
    >
      {(x, y) => {
        const cw = grid ? (X_DOMAIN[1] - X_DOMAIN[0]) / grid.cols : 0;
        const ch = grid ? (Y_DOMAIN[1] - Y_DOMAIN[0]) / grid.rows : 0;
        const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
        if (grid) {
          for (let r = 0; r < grid.rows; r++)
            for (let c = 0; c < grid.cols; c++) {
              const v = grid.cells[r]![c];
              const x0 = X_DOMAIN[0] + c * cw;
              const y0 = Y_DOMAIN[0] + r * ch;
              if (c + 1 < grid.cols && grid.cells[r]![c + 1] !== v) lines.push({ x1: x0 + cw, y1: y0, x2: x0 + cw, y2: y0 + ch });
              if (r + 1 < grid.rows && grid.cells[r + 1]![c] !== v) lines.push({ x1: x0, y1: y0 + ch, x2: x0 + cw, y2: y0 + ch });
            }
        }
        return (
          <g>
            {grid && (
              <g aria-hidden="true" shapeRendering="crispEdges">
                {grid.cells.flatMap((row, r) =>
                  row.map((v, c) =>
                    v ? (
                      <rect
                        key={`${r}-${c}`}
                        x={x(X_DOMAIN[0] + c * cw)}
                        y={y(Y_DOMAIN[0] + (r + 1) * ch)}
                        width={x(X_DOMAIN[0] + cw) - x(X_DOMAIN[0]) + 1}
                        height={y(Y_DOMAIN[0]) - y(Y_DOMAIN[0] + ch) + 1}
                        fill={classInfo[v].color}
                        opacity={0.13}
                      />
                    ) : null,
                  ),
                )}
                {lines.map((l, i) => (
                  <line key={i} x1={x(l.x1)} y1={y(l.y1)} x2={x(l.x2)} y2={y(l.y2)} stroke="var(--text)" strokeWidth={2} />
                ))}
              </g>
            )}
            {props.showNeighbours &&
              prediction?.neighbours.map((n) => (
                <line key={`n${n.point.id}`} x1={x(query.x)} y1={y(query.y)} x2={x(n.point.x)} y2={y(n.point.y)} stroke="var(--text-muted)" strokeDasharray="4 3" strokeWidth={1.5} aria-hidden="true" />
              ))}
            <g aria-hidden="true">
              {points.map((p) => (
                <g key={p.id}>
                  <ClassMark x={x(p.x)} y={y(p.y)} label={p.label} highlight={p.id === props.highlightId || neighbourIds.has(p.id)} />
                  <text x={x(p.x) + 9} y={y(p.y) - 7} fontSize={11} fill="var(--text)">
                    {p.id}
                  </text>
                </g>
              ))}
              <text x={x(query.x)} y={y(query.y) + 9} fontSize={26} textAnchor="middle" fill="var(--text)" stroke="var(--surface)" strokeWidth={1}>
                ★
              </text>
            </g>
          </g>
        );
      }}
    </PlotFrame>
  );
}
