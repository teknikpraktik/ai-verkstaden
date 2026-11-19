import { createRng } from '../../lib/random';

/** Tre i rad. Rutorna numreras 0–8 radvis: 0 1 2 / 3 4 5 / 6 7 8. */
export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];
export type Outcome = Player | 'oavgjort' | null;

export const LINES: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const emptyBoard = (): Board => Array<Cell>(9).fill(null);
export const other = (p: Player): Player => (p === 'X' ? 'O' : 'X');
/** Rutnamn som på ett schackbräde: kolumn A–C, rad 1–3. Ruta 0 = A1, 5 = C2. */
export const cellName = (i: number) => `${'ABC'[i % 3]}${Math.floor(i / 3) + 1}`;

export function parseBoard(s: string): Board {
  return s
    .replace(/\s/g, '')
    .split('')
    .map((ch) => (ch === 'X' ? 'X' : ch === 'O' ? 'O' : null));
}

export function boardString(b: Board): string {
  return b.map((c) => c ?? '.').join('');
}

export function winner(b: Board): Outcome {
  for (const [a, c, d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]!;
  return b.every((c) => c !== null) ? 'oavgjort' : null;
}

export function winningLine(b: Board): number[] | null {
  for (const l of LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return l;
  return null;
}

export const legalMoves = (b: Board): number[] => (winner(b) ? [] : b.flatMap((c, i) => (c === null ? [i] : [])));

/** Vems tur det är, givet vem som började. */
export function toMove(b: Board, starter: Player = 'X'): Player {
  const filled = b.filter((c) => c !== null).length;
  return filled % 2 === 0 ? starter : other(starter);
}

export function play(b: Board, i: number, p: Player): Board {
  if (b[i] !== null || winner(b)) return b;
  const n = [...b];
  n[i] = p;
  return n;
}

/* ---------- Minimax ---------- */

/**
 * Minimaxvärde för `me` när `turn` ska dra. Vinst = 10 − antal drag dit,
 * förlust = antal drag − 10, oavgjort = 0. Snabba vinster och sena förluster
 * föredras alltså.
 */
const memo = new Map<string, number>();

export function minimax(b: Board, turn: Player, me: Player, depth = 0): number {
  const w = winner(b);
  if (w === me) return 10 - depth;
  if (w === other(me)) return depth - 10;
  if (w === 'oavgjort') return 0;
  const k = `${boardString(b)}|${turn}|${me}|${depth}`;
  const hit = memo.get(k);
  if (hit !== undefined) return hit;
  const vals = legalMoves(b).map((i) => minimax(play(b, i, turn), other(turn), me, depth + 1));
  const v = turn === me ? Math.max(...vals) : Math.min(...vals);
  memo.set(k, v);
  return v;
}

export interface ScoredMove {
  move: number;
  value: number;
}

/** Värdet av varje möjligt drag för den som ska dra (`turn`). */
export function scoreMoves(b: Board, turn: Player): ScoredMove[] {
  return legalMoves(b).map((move) => ({ move, value: minimax(play(b, move, turn), other(turn), turn, 1) }));
}

export function minimaxMove(b: Board, turn: Player): number | null {
  const s = scoreMoves(b, turn);
  if (s.length === 0) return null;
  return s.reduce((best, m) => (m.value > best.value ? m : best)).move;
}

export function valueText(v: number): string {
  if (v > 0) return `vinst (om ${10 - v} drag)`;
  if (v < 0) return `förlust (om ${10 + v} drag)`;
  return 'oavgjort';
}

/* ---------- Regelagent och slumpagent ---------- */

export const ruleNames = ['Vinn om du kan', 'Blockera motståndarens tre i rad', 'Ta mitten', 'Ta ett hörn', 'Ta en kant'];

function completes(b: Board, p: Player): number | null {
  for (const i of legalMoves(b)) if (winner(play(b, i, p)) === p) return i;
  return null;
}

export function ruleMove(b: Board, turn: Player): { move: number; rule: number } | null {
  if (legalMoves(b).length === 0) return null;
  const win = completes(b, turn);
  if (win !== null) return { move: win, rule: 0 };
  const block = completes(b, other(turn));
  if (block !== null) return { move: block, rule: 1 };
  if (b[4] === null) return { move: 4, rule: 2 };
  const corner = [0, 2, 6, 8].find((i) => b[i] === null);
  if (corner !== undefined) return { move: corner, rule: 3 };
  return { move: [1, 3, 5, 7].find((i) => b[i] === null)!, rule: 4 };
}

export function randomMove(b: Board, rng: () => number): number | null {
  const m = legalMoves(b);
  return m.length ? m[Math.floor(rng() * m.length)]! : null;
}

export type AgentKind = 'slump' | 'regler' | 'minimax';
export const agentNames: Record<AgentKind, string> = { slump: 'Slumpagent', regler: 'Regelagent', minimax: 'Minimaxagent' };
export const agentKinds: AgentKind[] = ['slump', 'regler', 'minimax'];

export interface AgentChoice {
  move: number;
  reason: string;
}

export function agentChoice(kind: AgentKind, b: Board, turn: Player, rng: () => number): AgentChoice | null {
  if (kind === 'slump') {
    const m = randomMove(b, rng);
    return m === null ? null : { move: m, reason: `valde slumpmässigt bland ${legalMoves(b).length} lediga rutor` };
  }
  if (kind === 'regler') {
    const r = ruleMove(b, turn);
    return r && { move: r.move, reason: `regel ${r.rule + 1}: ${ruleNames[r.rule]!.toLowerCase()}` };
  }
  const m = minimaxMove(b, turn);
  if (m === null) return null;
  return { move: m, reason: `bästa värdet i spelträdet: ${valueText(scoreMoves(b, turn).find((s) => s.move === m)!.value)}` };
}

/** Slumpagentens val för ett visst startvärde och brädläge (samma läge och startvärde ger samma val). */
export function seededChoice(kind: AgentKind, b: Board, turn: Player, seed: number): AgentChoice | null {
  const rng = createRng(seed * 1000 + b.filter((c) => c !== null).length);
  return agentChoice(kind, b, turn, rng);
}

/* ---------- Matcher ---------- */

export function playGame(x: AgentKind, o: AgentKind, seed: number): Outcome {
  let b = emptyBoard();
  let turn: Player = 'X';
  while (!winner(b)) {
    const c = seededChoice(turn === 'X' ? x : o, b, turn, seed)!;
    b = play(b, c.move, turn);
    turn = other(turn);
  }
  return winner(b);
}

export function series(x: AgentKind, o: AgentKind, games = 100) {
  const res = { X: 0, O: 0, oavgjort: 0 };
  for (let s = 1; s <= games; s++) {
    const w = playGame(x, o, s)!;
    res[w]++;
  }
  return res;
}

/* ---------- Förinställda lägen ---------- */

export const positions = {
  tomt: { name: 'Tomt bräde', board: '.........', note: 'Ett nytt parti. X börjar.' },
  blockera: { name: 'Blockera', board: 'XX..O....', note: 'X hotar att få tre i rad på översta raden.' },
  vinst: { name: 'Vinna eller blockera', board: 'XX.OO.X..', note: 'Både X och O har två i rad.' },
  gaffel: { name: 'Fälla med två hörn', board: 'X...O...X', note: 'X har två motsatta hörn och O har mitten.' },
} as const;
export type PositionId = keyof typeof positions;
export const positionIds = Object.keys(positions) as PositionId[];

export const isBoard = (v: unknown): v is Board =>
  Array.isArray(v) && v.length === 9 && v.every((c) => c === null || c === 'X' || c === 'O') && Math.abs(v.filter((c) => c === 'X').length - v.filter((c) => c === 'O').length) <= 1;

export function describeBoard(b: Board): string {
  const rows = [0, 1, 2].map((r) => [0, 1, 2].map((c) => b[r * 3 + c] ?? 'tom').join(', '));
  return `Rad 1: ${rows[0]}. Rad 2: ${rows[1]}. Rad 3: ${rows[2]}.`;
}
