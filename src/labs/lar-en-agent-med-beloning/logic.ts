/**
 * Labb 14: tabellbaserad Q-inlärning i en liten rutvärld.
 *
 * En påhittad robotdammsugare ska hitta till laddstationen (⚡) utan att ramla
 * nedför trappan (T). Väggar (#) går inte att köra in i: roboten står kvar.
 *
 * Q-uppdatering efter varje steg:
 *   Q(s,a) ← Q(s,a) + α · ( r + γ · max Q(s',·) − Q(s,a) )
 * där max Q(s',·) = 0 om s' är laddstationen eller trappan (episoden slutar).
 *
 * Handlingsval under träning (ε-girigt): med sannolikhet ε en slumpvald
 * handling (utforskning), annars den med högst Q (lika: slumpvis bland de bästa).
 * Under provet är modellen fryst: ε = 0, ingen uppdatering, lika Q löses i
 * ordningen upp, höger, ned, vänster. All slump styrs av startvärdet.
 */
import { createRng, randInt } from '../../lib/random';

export const ACTIONS = ['upp', 'höger', 'ned', 'vänster'] as const;
export const ARROWS = ['↑', '→', '↓', '←'] as const;
const DR = [-1, 0, 1, 0];
const DC = [0, 1, 0, -1];

export const MAP = ['S....', '.#.#.', '...T.', '#...G'];
export const ROWS = MAP.length;
export const COLS = MAP[0]!.length;

export type Cell = 'S' | '.' | '#' | 'T' | 'G';
export const cellAt = (r: number, c: number) => MAP[r]![c] as Cell;
export const stateOf = (r: number, c: number) => r * COLS + c;
export const rcOf = (s: number): [number, number] => [Math.floor(s / COLS), s % COLS];
export const START = stateOf(0, 0);
export const N_STATES = ROWS * COLS;

export const cellName = (s: number) => {
  const [r, c] = rcOf(s);
  return `${'ABCDE'[c]}${r + 1}`;
};

export interface Rewards {
  step: number;
  goal: number;
  trap: number;
}

export interface Config {
  rewards: Rewards;
  alpha: number;
  gamma: number;
  epsilon: number;
  episodes: number;
  maxSteps: number;
  seed: number;
}

export const goodRewards: Rewards = { step: -1, goal: 10, trap: -10 };
/** Dåligt formulerad belöning: "belöna roboten för varje steg den dammsuger". */
export const badRewards: Rewards = { step: 1, goal: 10, trap: -10 };

export const defaultConfig: Config = { rewards: goodRewards, alpha: 0.5, gamma: 0.95, epsilon: 0.2, episodes: 150, maxSteps: 40, seed: 14 };

export const isTerminal = (s: number) => {
  const [r, c] = rcOf(s);
  const t = cellAt(r, c);
  return t === 'G' || t === 'T';
};

/** Ett steg i miljön. */
export function move(s: number, a: number, rewards: Rewards): { s2: number; r: number; done: boolean } {
  const [r, c] = rcOf(s);
  const nr = r + DR[a]!;
  const nc = c + DC[a]!;
  const blocked = nr < 0 || nc < 0 || nr >= ROWS || nc >= COLS || cellAt(nr, nc) === '#';
  const s2 = blocked ? s : stateOf(nr, nc);
  const [r2, c2] = rcOf(s2);
  const t = cellAt(r2, c2);
  if (t === 'G') return { s2, r: rewards.goal, done: true };
  if (t === 'T') return { s2, r: rewards.trap, done: true };
  return { s2, r: rewards.step, done: false };
}

export type QTable = number[][];
export const emptyQ = (): QTable => Array.from({ length: N_STATES }, () => [0, 0, 0, 0]);

/** Q-uppdateringen. Returnerar det nya värdet. */
export function qUpdate(q: number, reward: number, maxNext: number, alpha: number, gamma: number): number {
  return q + alpha * (reward + gamma * maxNext - q);
}

export interface StepRecord {
  episode: number;
  /** Steg i episoden (1, 2, …). */
  t: number;
  s: number;
  a: number;
  r: number;
  s2: number;
  explored: boolean;
  done: boolean;
  /** true om episoden avbröts för att maxSteps nåddes. */
  timeout: boolean;
  oldQ: number;
  newQ: number;
}

const maxOf = (row: number[]) => Math.max(...row);

/** Kör hela träningen och returnerar en logg med varje steg. */
export function train(cfg: Config): StepRecord[] {
  const rng = createRng(cfg.seed);
  const Q = emptyQ();
  const log: StepRecord[] = [];
  for (let ep = 1; ep <= cfg.episodes; ep++) {
    let s = START;
    for (let t = 1; t <= cfg.maxSteps; t++) {
      let a: number;
      const explored = rng() < cfg.epsilon;
      if (explored) a = randInt(rng, 0, 4);
      else {
        const row = Q[s]!;
        const best = maxOf(row);
        const ties = [0, 1, 2, 3].filter((i) => row[i] === best);
        a = ties.length === 1 ? ties[0]! : ties[randInt(rng, 0, ties.length)]!;
      }
      const { s2, r, done } = move(s, a, cfg.rewards);
      const oldQ = Q[s]![a]!;
      const newQ = qUpdate(oldQ, r, done ? 0 : maxOf(Q[s2]!), cfg.alpha, cfg.gamma);
      Q[s]![a] = newQ;
      log.push({ episode: ep, t, s, a, r, s2, explored, done, timeout: !done && t === cfg.maxSteps, oldQ, newQ });
      s = s2;
      if (done) break;
    }
  }
  return log;
}

/** Q-tabellen efter de första `n` stegen i loggen. */
export function qAfter(log: StepRecord[], n: number): QTable {
  const Q = emptyQ();
  for (let i = 0; i < Math.min(n, log.length); i++) {
    const l = log[i]!;
    Q[l.s]![l.a] = l.newQ;
  }
  return Q;
}

/** Bästa handling i ett tillstånd (lika: ordningen upp, höger, ned, vänster). null om alla är 0. */
export function greedy(row: number[]): number | null {
  if (row.every((v) => v === 0)) return null;
  let best = 0;
  for (let a = 1; a < 4; a++) if (row[a]! > row[best]!) best = a;
  return best;
}

export interface TestResult {
  path: number[];
  actions: number[];
  total: number;
  outcome: 'goal' | 'trap' | 'timeout';
}

/** Provet: fryst modell, ingen utforskning, ingen inlärning. */
export function frozenTest(Q: QTable, rewards: Rewards, maxSteps: number, start = START): TestResult {
  let s = start;
  const path = [s];
  const actions: number[] = [];
  let total = 0;
  for (let t = 0; t < maxSteps; t++) {
    const a = greedy(Q[s]!) ?? 0;
    const { s2, r, done } = move(s, a, rewards);
    actions.push(a);
    total += r;
    path.push(s2);
    s = s2;
    if (done) return { path, actions, total, outcome: cellAt(...rcOf(s2)) === 'G' ? 'goal' : 'trap' };
  }
  return { path, actions, total, outcome: 'timeout' };
}

/** Index i loggen där varje episod börjar (för "hoppa en episod"). */
export function episodeStarts(log: StepRecord[]): number[] {
  const out: number[] = [];
  log.forEach((l, i) => {
    if (l.t === 1) out.push(i);
  });
  return out;
}

export const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',').replace('-', '−');

export function isConfigPart(v: unknown): v is Rewards {
  return typeof v === 'object' && v !== null && ['step', 'goal', 'trap'].every((k) => Number.isFinite((v as Record<string, number>)[k]));
}
