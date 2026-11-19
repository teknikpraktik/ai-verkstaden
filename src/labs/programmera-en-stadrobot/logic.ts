import { createRng } from '../../lib/random';

/**
 * Städrobot i ett rutnät (förenklad simulering).
 *
 * Rummet beskrivs med textrader:
 *   .  golv   #  möbel (går inte att köra på)   *  smuts   R  robotens start
 *
 * Roboten har två sensorer:
 *  - en smutssensor som ser smuts på rutor inom avståndet `sikt` (räknat i steg
 *    upp/ned/höger/vänster, utan hänsyn till möbler). Sikt 0 = bara den egna rutan.
 *  - en hindersensor som känner om grannrutorna är blockerade.
 * Den regelstyrda roboten har dessutom en karta över möblerna och ett minne.
 */
export type Dir = 'N' | 'O' | 'S' | 'V';
export type Pos = [number, number];

export const dirNames: Record<Dir, string> = { N: 'norrut (upp)', O: 'österut (höger)', S: 'söderut (ned)', V: 'västerut (vänster)' };
const dirDelta: Record<Dir, Pos> = { N: [-1, 0], O: [0, 1], S: [1, 0], V: [0, -1] };
export const dirOrder: Dir[] = ['N', 'O', 'S', 'V'];

export interface Room {
  rows: number;
  cols: number;
  blocked: boolean[][];
  dirt: Pos[];
  start: Pos;
}

export function parseRoom(lines: readonly string[]): Room {
  const rows = lines.length;
  const cols = rows === 0 ? 0 : Math.max(...lines.map((l) => l.length));
  const blocked: boolean[][] = [];
  const dirt: Pos[] = [];
  let start: Pos = [0, 0];
  for (let r = 0; r < rows; r++) {
    blocked.push([]);
    for (let c = 0; c < cols; c++) {
      const ch = lines[r]![c] ?? '#';
      blocked[r]!.push(ch === '#');
      if (ch === '*') dirt.push([r, c]);
      if (ch === 'R') start = [r, c];
    }
  }
  return { rows, cols, blocked, dirt, start };
}

export const rooms = {
  tomt: {
    name: 'Tomt rum',
    description: 'Inga möbler. Fem smutsfläckar.',
    lines: ['R....*', '..*...', '......', '*...*.', '...*..'],
  },
  moblerat: {
    name: 'Möblerat rum',
    description: 'En soffa och ett bord står i vägen. Fyra smutsfläckar.',
    lines: ['R..#.*', '.*.#..', '...##.', '*.....', '.##.*.'],
  },
} as const;
export type RoomId = keyof typeof rooms;
export const roomIds = Object.keys(rooms) as RoomId[];

export type Strategy = 'slump' | 'regler';
export const strategyNames: Record<Strategy, string> = { slump: 'Slumpstrategi', regler: 'Regelstyrd strategi' };

/** Instruktionerna som roboten kör, i den ordning de prövas. */
export const programs: Record<Strategy, string[]> = {
  slump: ['Om rutan där jag står är smutsig: suga.', 'Annars: gå ett steg åt ett slumpmässigt håll där det inte står något hinder.'],
  regler: [
    'Om rutan där jag står är smutsig: suga.',
    'Om jag ser eller minns smuts: gå ett steg mot den närmaste.',
    'Om det finns rutor jag inte har kontrollerat: gå ett steg mot den närmaste.',
    'Annars: stanna – alla rutor är kontrollerade.',
  ],
};

export type Action = { type: 'suga' } | { type: 'ga'; dir: Dir } | { type: 'stanna' };

export interface Percept {
  /** Är rutan där roboten står smutsig? */
  here: boolean;
  /** Smutsiga rutor som syns inom sikten (utom den egna). */
  seen: string[];
  /** Håll där det står ett hinder eller en vägg. */
  blocked: Dir[];
}

export interface SimFrame {
  step: number;
  pos: Pos;
  /** Smuts som finns kvar i rummet (rutnyckel "r,c"). */
  dirt: string[];
  /** Rutor vars smutsläge roboten känner till (besökta eller sedda). Bara regelstyrd. */
  checked: string[];
  /** Smuts roboten har sett men inte sugit upp än. Bara regelstyrd. */
  knownDirt: string[];
  /** Spår av rutor roboten har stått på. */
  trail: string[];
  /** Vad sensorerna visade innan handlingen (null i startbilden). */
  percept: Percept | null;
  /** Index i programmet för regeln som användes (null i startbilden). */
  rule: number | null;
  action: Action | null;
  result: string;
  cleaned: number;
  /** Steg när sista smutsen sögs upp, annars null. */
  cleanAt: number | null;
  done: boolean;
}

export interface SimResult {
  frames: SimFrame[];
  totalDirt: number;
  cleaned: number;
  /** Antal handlingar tills rummet var rent (null om det aldrig blev rent). */
  stepsToClean: number | null;
  stoppedBy: 'rent' | 'stannade' | 'maxsteg';
}

export const key = (p: Pos) => `${p[0]},${p[1]}`;
const parse = (k: string): Pos => k.split(',').map(Number) as Pos;
export const columnLetters = 'ABCDEFGHIJ';
export const posName = (p: Pos | string) => {
  const [r, c] = typeof p === 'string' ? parse(p) : p;
  return `${columnLetters[c] ?? '?'}${r + 1}`;
};

function free(room: Room, r: number, c: number) {
  return r >= 0 && c >= 0 && r < room.rows && c < room.cols && !room.blocked[r]![c];
}

export function blockedDirs(room: Room, p: Pos): Dir[] {
  return dirOrder.filter((d) => !free(room, p[0] + dirDelta[d][0], p[1] + dirDelta[d][1]));
}

export function cellsInSight(room: Room, p: Pos, sight: number): Pos[] {
  const out: Pos[] = [];
  for (let r = 0; r < room.rows; r++)
    for (let c = 0; c < room.cols; c++) if (!room.blocked[r]![c] && Math.abs(r - p[0]) + Math.abs(c - p[1]) <= sight) out.push([r, c]);
  return out;
}

/** Första steget på en kortaste väg (BFS på möbelkartan) till närmaste mål. Lika avstånd avgörs av ordningen N, O, S, V. */
export function stepToward(room: Room, from: Pos, targets: Set<string>): Dir | null {
  if (targets.size === 0) return null;
  const first = new Map<string, Dir | null>([[key(from), null]]);
  const queue: Pos[] = [from];
  while (queue.length) {
    const p = queue.shift()!;
    const k = key(p);
    if (targets.has(k) && k !== key(from)) return first.get(k) ?? null;
    for (const d of dirOrder) {
      const n: Pos = [p[0] + dirDelta[d][0], p[1] + dirDelta[d][1]];
      if (!free(room, n[0], n[1]) || first.has(key(n))) continue;
      first.set(key(n), first.get(k) ?? d);
      queue.push(n);
    }
  }
  return null;
}

export interface SimOptions {
  strategy: Strategy;
  sight: number;
  seed: number;
  maxSteps?: number;
}

export const MAX_STEPS = 300;

export function simulate(room: Room, opts: SimOptions): SimResult {
  const max = opts.maxSteps ?? MAX_STEPS;
  const rng = createRng(opts.seed);
  const dirt = new Set(room.dirt.map(key));
  const totalDirt = dirt.size;
  let pos: Pos = [...room.start];
  const checked = new Set<string>();
  const knownDirt = new Set<string>();
  const trail: string[] = [key(pos)];
  const frames: SimFrame[] = [];
  let cleaned = 0;
  let cleanAt: number | null = totalDirt === 0 ? 0 : null;
  const reachable = new Set<string>();
  {
    const q: Pos[] = [pos];
    reachable.add(key(pos));
    while (q.length) {
      const p = q.shift()!;
      for (const d of dirOrder) {
        const n: Pos = [p[0] + dirDelta[d][0], p[1] + dirDelta[d][1]];
        if (free(room, n[0], n[1]) && !reachable.has(key(n))) {
          reachable.add(key(n));
          q.push(n);
        }
      }
    }
  }

  const sense = (): Percept => {
    const seen = cellsInSight(room, pos, opts.sight)
      .map(key)
      .filter((k) => k !== key(pos) && dirt.has(k));
    return { here: dirt.has(key(pos)), seen, blocked: blockedDirs(room, pos) };
  };
  const remember = (p: Percept) => {
    for (const c of cellsInSight(room, pos, opts.sight)) {
      checked.add(key(c));
      if (!dirt.has(key(c))) knownDirt.delete(key(c));
    }
    for (const s of p.seen) knownDirt.add(s);
    if (p.here) knownDirt.add(key(pos));
  };
  const push = (percept: Percept | null, rule: number | null, action: Action | null, result: string, done: boolean) => {
    frames.push({
      step: frames.length,
      pos: [...pos],
      dirt: [...dirt],
      checked: opts.strategy === 'regler' ? [...checked] : [],
      knownDirt: opts.strategy === 'regler' ? [...knownDirt] : [],
      trail: [...trail],
      percept,
      rule,
      action,
      result,
      cleaned,
      cleanAt,
      done,
    });
  };

  push(null, null, null, `Roboten startar i ${posName(pos)}. Rummet har ${totalDirt} smutsiga rutor.`, totalDirt === 0 && opts.strategy === 'slump');
  let stoppedBy: SimResult['stoppedBy'] = 'maxsteg';

  for (let step = 1; step <= max; step++) {
    if (opts.strategy === 'slump' && dirt.size === 0) {
      stoppedBy = 'rent';
      break;
    }
    const percept = sense();
    if (opts.strategy === 'regler') remember(percept);
    let rule: number;
    let action: Action;
    if (percept.here) {
      rule = 0;
      action = { type: 'suga' };
    } else if (opts.strategy === 'slump') {
      rule = 1;
      const options = dirOrder.filter((d) => !percept.blocked.includes(d));
      action = options.length ? { type: 'ga', dir: options[Math.floor(rng() * options.length)]! } : { type: 'stanna' };
    } else {
      const toDirt = stepToward(room, pos, knownDirt);
      const unchecked = new Set([...reachable].filter((k) => !checked.has(k)));
      const toUnchecked = toDirt ? null : stepToward(room, pos, unchecked);
      if (toDirt) {
        rule = 1;
        action = { type: 'ga', dir: toDirt };
      } else if (toUnchecked) {
        rule = 2;
        action = { type: 'ga', dir: toUnchecked };
      } else {
        rule = 3;
        action = { type: 'stanna' };
      }
    }

    let result: string;
    if (action.type === 'suga') {
      dirt.delete(key(pos));
      knownDirt.delete(key(pos));
      cleaned++;
      if (dirt.size === 0) cleanAt = step;
      result = `Sög upp smutsen i ${posName(pos)}. ${dirt.size === 0 ? 'Rummet är rent!' : `${dirt.size} smutsiga rutor kvar.`}`;
    } else if (action.type === 'ga') {
      pos = [pos[0] + dirDelta[action.dir][0], pos[1] + dirDelta[action.dir][1]];
      trail.push(key(pos));
      result = `Gick ${dirNames[action.dir]} till ${posName(pos)}.`;
    } else {
      result = opts.strategy === 'regler' ? 'Roboten stannar. Den har kontrollerat alla rutor den kan nå.' : 'Roboten kan inte röra sig.';
    }
    const done = action.type === 'stanna' || (opts.strategy === 'slump' && dirt.size === 0);
    push(percept, rule, action, result, done);
    if (action.type === 'stanna') {
      stoppedBy = 'stannade';
      break;
    }
    if (opts.strategy === 'slump' && dirt.size === 0) {
      stoppedBy = 'rent';
      break;
    }
  }
  return { frames, totalDirt, cleaned, stepsToClean: cleanAt, stoppedBy };
}

export function runRoom(roomId: RoomId, opts: SimOptions): SimResult {
  return simulate(parseRoom(rooms[roomId].lines), opts);
}

/** Sammanfattning av slumpstrategin för flera startvärden. */
export function randomSummary(roomId: RoomId, sight: number, seeds: number[], maxSteps = MAX_STEPS) {
  const results = seeds.map((seed) => runRoom(roomId, { strategy: 'slump', sight, seed, maxSteps }).stepsToClean);
  const done = results.filter((x): x is number => x !== null).sort((a, b) => a - b);
  return {
    runs: results.length,
    finished: done.length,
    min: done.length ? done[0]! : null,
    max: done.length ? done[done.length - 1]! : null,
    median: done.length ? done[Math.floor((done.length - 1) / 2)]! : null,
    results,
  };
}

export function actionText(a: Action | null): string {
  if (!a) return '–';
  if (a.type === 'suga') return 'Suga';
  if (a.type === 'stanna') return 'Stanna';
  return `Gå ${dirNames[a.dir]}`;
}

export const isRoomId = (v: unknown): v is RoomId => typeof v === 'string' && v in rooms;
export const isStrategy = (v: unknown): v is Strategy => v === 'slump' || v === 'regler';
