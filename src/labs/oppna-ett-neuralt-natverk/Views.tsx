import { PlotFrame } from '../../components/lab/Charts';
import { classify, fmt, forward, neuron, type Example, type Net, type Neuron, type Snapshot } from './logic';

/** Karta över neuronens utdata i rutan −0,25…1,25 med de fyra exemplen. */
export function NeuronMap({ n, examples }: { n: Neuron; examples: Example[] }) {
  const N = 24;
  const lo = -0.25;
  const hi = 1.25;
  const step = (hi - lo) / N;
  return (
    <PlotFrame
      width={340}
      height={320}
      xDomain={[lo, hi]}
      yDomain={[lo, hi]}
      xLabel="x1"
      yLabel="x2"
      title="Neuronens svar över hela ytan"
      description={`Mörkare blått betyder utdata nära 1, ljust nära 0. Den svarta linjen är där z = 0 (utdata 0,5). Hörnen är de fyra exemplen: cirkel = önskat 0, triangel = önskat 1. Tabellen bredvid visar samma sak.`}
    >
      {(x, y) => {
        const cells = [];
        for (let i = 0; i < N; i++)
          for (let j = 0; j < N; j++) {
            const px = lo + (i + 0.5) * step;
            const py = lo + (j + 0.5) * step;
            const out = neuron(n, [px, py]).out;
            cells.push(<rect key={`${i}-${j}`} x={x(lo + i * step)} y={y(lo + (j + 1) * step)} width={x(lo + step) - x(lo) + 1} height={y(lo) - y(lo + step) + 1} fill="var(--c1)" opacity={out * 0.45} />);
          }
        // linjen w1·x + w2·y + b = 0
        let line = null;
        if (Math.abs(n.w2) > 1e-9) {
          const yAt = (vx: number) => -(n.w1 * vx + n.b) / n.w2;
          line = { x1: x(lo), y1: y(yAt(lo)), x2: x(hi), y2: y(yAt(hi)) };
        } else if (Math.abs(n.w1) > 1e-9) {
          const vx = -n.b / n.w1;
          line = { x1: x(vx), y1: y(lo), x2: x(vx), y2: y(hi) };
        }
        return (
          <g aria-hidden="true">
            <defs>
              <clipPath id="neuron-clip">
                <rect x={x(lo)} y={y(hi)} width={x(hi) - x(lo)} height={y(lo) - y(hi)} />
              </clipPath>
            </defs>
            <g shapeRendering="crispEdges">{cells}</g>
            {line && <line {...line} stroke="var(--text)" strokeWidth={2.5} clipPath="url(#neuron-clip)" />}
            {examples.map((e) => {
              const cx = x(e.x[0]);
              const cy = y(e.x[1]);
              const ok = classify(neuron(n, e.x).out) === e.y;
              return (
                <g key={e.x.join()}>
                  {e.y === 1 ? (
                    <polygon points={`${cx},${cy - 11} ${cx + 10},${cy + 7} ${cx - 10},${cy + 7}`} fill="var(--c2)" stroke="var(--surface)" strokeWidth={2} />
                  ) : (
                    <circle cx={cx} cy={cy} r={9} fill="var(--surface)" stroke="var(--c2)" strokeWidth={3} />
                  )}
                  <text x={cx + 14} y={cy - 8} fontSize={14} fontWeight={700} fill={ok ? 'var(--ok)' : 'var(--bad)'}>
                    {ok ? '✓' : '✗'}
                  </text>
                </g>
              );
            })}
          </g>
        );
      }}
    </PlotFrame>
  );
}

export function LossChart({ snaps, index, epochs }: { snaps: Snapshot[]; index: number; epochs: number }) {
  const shown = snaps.slice(0, index + 1);
  const cur = shown[shown.length - 1]!;
  return (
    <PlotFrame
      width={460}
      height={240}
      xDomain={[0, epochs * 1.06]}
      yDomain={[0, 0.35]}
      xLabel="Epok (antal träningsvarv)"
      yLabel="Förlust (MSE)"
      title="Förlusten under träningen"
      description={`Efter ${cur.epoch} epoker är förlusten ${fmt(cur.netLoss, 3)} för nätverket med dolt lager (heldragen linje) och ${fmt(cur.singleLoss, 3)} för en ensam neuron (streckad linje).`}
    >
      {(x, y) => (
        <g aria-hidden="true">
          <polyline points={shown.map((s) => `${x(s.epoch)},${y(Math.min(0.35, s.singleLoss))}`).join(' ')} fill="none" stroke="var(--c2)" strokeWidth={2.5} strokeDasharray="7 4" />
          <polyline points={shown.map((s) => `${x(s.epoch)},${y(Math.min(0.35, s.netLoss))}`).join(' ')} fill="none" stroke="var(--c1)" strokeWidth={3} />
          <circle cx={x(cur.epoch)} cy={y(Math.min(0.35, cur.netLoss))} r={5} fill="var(--c1)" />
          <rect x={x(cur.epoch) - 4} y={y(Math.min(0.35, cur.singleLoss)) - 4} width={8} height={8} fill="var(--c2)" />
        </g>
      )}
    </PlotFrame>
  );
}

/** Nätverksdiagram: linjetjocklek visar vikternas storlek, streckat = negativ vikt. */
export function NetDiagram({ net, input }: { net: Net; input: [number, number] }) {
  const H = net.hidden.length;
  const W = 460;
  const Ht = Math.max(220, 70 * H + 40);
  const inY = [Ht / 2 - 50, Ht / 2 + 50];
  const hidY = net.hidden.map((_, j) => (Ht / (H + 1)) * (j + 1));
  const f = forward(net, input);
  const xs = [60, 230, 400];
  const edge = (x1: number, y1: number, x2: number, y2: number, w: number, key: string, labelAt = 0.35) => (
    <g key={key}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={w >= 0 ? 'var(--c1)' : 'var(--c2)'} strokeWidth={Math.min(8, 1 + Math.abs(w) * 0.7)} strokeDasharray={w >= 0 ? undefined : '6 4'} opacity={0.8} />
      <text x={x1 + (x2 - x1) * labelAt} y={y1 + (y2 - y1) * labelAt - 4} fontSize={11} textAnchor="middle" fill="var(--text)" stroke="var(--surface)" strokeWidth={3} paintOrder="stroke">
        {fmt(w, 1)}
      </text>
    </g>
  );
  const node = (cx: number, cy: number, label: string, value: number, key: string, bias?: number) => (
    <g key={key}>
      <circle cx={cx} cy={cy} r={24} fill="var(--surface)" stroke="var(--text)" strokeWidth={2} />
      <text x={cx} y={cy - 3} fontSize={11} textAnchor="middle" fill="var(--text-muted)">
        {label}
      </text>
      <text x={cx} y={cy + 12} fontSize={13} fontWeight={700} textAnchor="middle" fill="var(--text)">
        {fmt(value)}
      </text>
      {bias !== undefined && (
        <text x={cx} y={cy + 40} fontSize={11} textAnchor="middle" fill="var(--text-muted)">
          bias {fmt(bias, 1)}
        </text>
      )}
    </g>
  );
  const desc = `Nätverk med 2 indata, ${H} dolda neuroner och 1 utdata. För indata (${input.join(', ')}) blir de dolda värdena ${f.h.map((h) => fmt(h)).join(' och ')} och utdata ${fmt(f.out)}. ${net.hidden.map(([w1, w2, b], j) => `Dold neuron ${j + 1}: vikter ${fmt(w1, 1)} och ${fmt(w2, 1)}, bias ${fmt(b, 1)}.`).join(' ')} Utdataneuronen: vikter ${net.out.map((w) => fmt(w, 1)).join(' och ')}, bias ${fmt(net.outBias, 1)}.`;
  return (
    <figure className="plot">
      <svg viewBox={`0 0 ${W} ${Ht}`} role="img" aria-label={`Nätverksdiagram. ${desc}`}>
        {net.hidden.map(([w1, w2], j) => [edge(xs[0]!, inY[0]!, xs[1]!, hidY[j]!, w1, `a${j}`), edge(xs[0]!, inY[1]!, xs[1]!, hidY[j]!, w2, `b${j}`)])}
        {net.out.map((w, j) => edge(xs[1]!, hidY[j]!, xs[2]!, Ht / 2, w, `o${j}`, 0.5))}
        {node(xs[0]!, inY[0]!, 'x1', input[0], 'x1')}
        {node(xs[0]!, inY[1]!, 'x2', input[1], 'x2')}
        {net.hidden.map((h, j) => node(xs[1]!, hidY[j]!, `h${j + 1}`, f.h[j]!, `h${j}`, h[2]))}
        {node(xs[2]!, Ht / 2, 'ut', f.out, 'ut', net.outBias)}
      </svg>
    </figure>
  );
}
