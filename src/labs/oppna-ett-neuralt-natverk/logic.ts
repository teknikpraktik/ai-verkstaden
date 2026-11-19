/**
 * Labb 15: en neuron och ett litet neuralt nätverk.
 *
 * Neuron: z = w1·x1 + w2·x2 + b, utdata = sigmoid(z) = 1 / (1 + e^(−z)).
 * Svaret räknas som 1 om utdata ≥ 0,5, annars 0.
 *
 * Nätverk: 2 indata → H dolda neuroner (sigmoid) → 1 utdataneuron (sigmoid).
 * Förlust: medelkvadratfel över de fyra exemplen. Träning: gradientnedstigning
 * på alla fyra exempel samtidigt. Startvikterna slumpas jämnt i [−1, 1] med
 * ett startvärde, så träningen är reproducerbar.
 */
import { createRng } from '../../lib/random';

export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export interface Example {
  x: [number, number];
  y: number;
}

const inputs: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

export const tasks = {
  och: { name: 'OCH', examples: inputs.map((x) => ({ x, y: x[0] && x[1] ? 1 : 0 })) as Example[] },
  eller: { name: 'ELLER', examples: inputs.map((x) => ({ x, y: x[0] || x[1] ? 1 : 0 })) as Example[] },
  xor: { name: 'XOR (antingen eller)', examples: inputs.map((x) => ({ x, y: x[0] !== x[1] ? 1 : 0 })) as Example[] },
} as const;

export type TaskId = keyof typeof tasks;

export interface Neuron {
  w1: number;
  w2: number;
  b: number;
}

export function neuron(n: Neuron, x: [number, number]): { z: number; out: number } {
  const z = n.w1 * x[0] + n.w2 * x[1] + n.b;
  return { z, out: sigmoid(z) };
}

export const classify = (out: number) => (out >= 0.5 ? 1 : 0);

export function correctCount(n: Neuron, examples: Example[]): number {
  return examples.filter((e) => classify(neuron(n, e.x).out) === e.y).length;
}

export interface Net {
  /** hidden[j] = [w1, w2, b] */
  hidden: [number, number, number][];
  /** utdataneuronens vikter, en per dold neuron */
  out: number[];
  outBias: number;
}

export function initNet(hiddenCount: number, seed: number): Net {
  const rng = createRng(seed);
  const u = () => rng() * 2 - 1;
  const hidden = Array.from({ length: hiddenCount }, () => [u(), u(), u()] as [number, number, number]);
  const out = Array.from({ length: hiddenCount }, u);
  return { hidden, out, outBias: u() };
}

export function forward(net: Net, x: [number, number]): { h: number[]; out: number } {
  const h = net.hidden.map(([w1, w2, b]) => sigmoid(w1 * x[0] + w2 * x[1] + b));
  const z = net.out.reduce((s, w, j) => s + w * h[j]!, net.outBias);
  return { h, out: sigmoid(z) };
}

export function loss(net: Net, examples: Example[]): number {
  if (examples.length === 0) return NaN;
  return examples.reduce((s, e) => s + (forward(net, e.x).out - e.y) ** 2, 0) / examples.length;
}

/** Ett steg gradientnedstigning (alla exempel på en gång). */
export function trainStep(net: Net, examples: Example[], lr: number): Net {
  const H = net.hidden.length;
  const gHidden = net.hidden.map(() => [0, 0, 0]);
  const gOut = new Array<number>(H).fill(0);
  let gOutBias = 0;
  const n = examples.length;
  for (const e of examples) {
    const { h, out } = forward(net, e.x);
    const dOut = ((2 * (out - e.y)) / n) * out * (1 - out);
    for (let j = 0; j < H; j++) {
      gOut[j]! += dOut * h[j]!;
      const dh = dOut * net.out[j]! * h[j]! * (1 - h[j]!);
      gHidden[j]![0]! += dh * e.x[0];
      gHidden[j]![1]! += dh * e.x[1];
      gHidden[j]![2]! += dh;
    }
    gOutBias += dOut;
  }
  return {
    hidden: net.hidden.map(([w1, w2, b], j) => [w1 - lr * gHidden[j]![0]!, w2 - lr * gHidden[j]![1]!, b - lr * gHidden[j]![2]!]),
    out: net.out.map((w, j) => w - lr * gOut[j]!),
    outBias: net.outBias - lr * gOutBias,
  };
}

/** En ensam neuron som ett "nätverk" utan dolt lager. */
export function initNeuron(seed: number): Neuron {
  const rng = createRng(seed);
  return { w1: rng() * 2 - 1, w2: rng() * 2 - 1, b: rng() * 2 - 1 };
}

export function neuronLoss(n: Neuron, examples: Example[]): number {
  return examples.reduce((s, e) => s + (neuron(n, e.x).out - e.y) ** 2, 0) / examples.length;
}

export function neuronTrainStep(n: Neuron, examples: Example[], lr: number): Neuron {
  let g1 = 0;
  let g2 = 0;
  let gb = 0;
  for (const e of examples) {
    const { out } = neuron(n, e.x);
    const d = ((2 * (out - e.y)) / examples.length) * out * (1 - out);
    g1 += d * e.x[0];
    g2 += d * e.x[1];
    gb += d;
  }
  return { w1: n.w1 - lr * g1, w2: n.w2 - lr * g2, b: n.b - lr * gb };
}

export interface Snapshot {
  epoch: number;
  net: Net;
  netLoss: number;
  single: Neuron;
  singleLoss: number;
}

export interface TrainSettings {
  hidden: number;
  seed: number;
  lr: number;
  epochs: number;
  every: number;
}

export const defaultSettings: TrainSettings = { hidden: 2, seed: 3, lr: 2, epochs: 2000, every: 50 };

/** Tränar nätverket och en ensam neuron på samma uppgift och sparar ögonblicksbilder. */
export function trainBoth(examples: Example[], s: TrainSettings): Snapshot[] {
  let net = initNet(s.hidden, s.seed);
  let single = initNeuron(s.seed);
  const snaps: Snapshot[] = [{ epoch: 0, net, netLoss: loss(net, examples), single, singleLoss: neuronLoss(single, examples) }];
  for (let ep = 1; ep <= s.epochs; ep++) {
    net = trainStep(net, examples, s.lr);
    single = neuronTrainStep(single, examples, s.lr);
    if (ep % s.every === 0) snaps.push({ epoch: ep, net, netLoss: loss(net, examples), single, singleLoss: neuronLoss(single, examples) });
  }
  return snaps;
}

export const netCorrect = (net: Net, examples: Example[]) => examples.filter((e) => classify(forward(net, e.x).out) === e.y).length;

export const fmt = (v: number, d = 2) => {
  if (!Number.isFinite(v)) return '–';
  const t = v.toFixed(d);
  // undvik "−0,0" när ett litet negativt tal avrundas till noll
  return (Number(t) === 0 ? Math.abs(Number(t)).toFixed(d) : t).replace('.', ',').replace('-', '−');
};

export const isNeuron = (v: unknown): v is Neuron =>
  typeof v === 'object' && v !== null && ['w1', 'w2', 'b'].every((k) => Number.isFinite((v as Record<string, number>)[k]));
