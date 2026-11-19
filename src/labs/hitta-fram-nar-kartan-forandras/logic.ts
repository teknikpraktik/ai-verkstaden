import { cellId, gridGraph, manhattan, parseCell, search, type NodeId } from '../../lib/search';

/**
 * Labb 20: en robot planerar en väg med A* på sin KARTA och kör i den VERKLIGA
 * miljön. Kartan och verkligheten kan skilja sig åt.
 *
 * Scenarier skrivs som textrader:
 *   #  vägg (på kartan och i verkligheten)
 *   .  golv
 *   X  nytt hinder: finns i verkligheten men inte på kartan
 *   O  borttaget hinder: finns på kartan men inte i verkligheten
 *   S  start   M  mål
 *
 * Sensorn tittar rakt upp, ned, åt vänster och åt höger, högst `range` rutor,
 * och ser inte genom hinder. Efter varje mätning uppdateras kartan.
 * Regler för omplanering:
 *   - Om den planerade vägen går genom en ruta som nu är känd som hinder: stanna och planera om.
 *   - Om ett hinder på kartan visar sig vara borta: uppdatera kartan och planera om (en kortare väg kan finnas).
 *   - Om det inte finns någon väg på den uppdaterade kartan: stanna och larma.
 */

export interface Scenario {
  name: string;
  place: string;
  /** Kort beskrivning för eleven. */
  description: string;
  /** Konkret exempel som läraren kan använda om skillnaden mellan karta och verklighet. */
  example: string;
  lines: readonly string[];
}

export interface World {
  rows: number;
  cols: number;
  /** Vad roboten tror från början. */
  map: boolean[][];
  /** Hur det faktiskt ser ut. */
  actual: boolean[][];
  start: NodeId;
  goal: NodeId;
}

export type EventKind = 'start' | 'flytt' | 'upptackt' | 'omplanering' | 'framme' | 'ingen-vag' | 'avbruten';

export interface Change {
  cell: NodeId;
  /** 'nytt' = hinder som inte fanns på kartan, 'borta' = hinder på kartan som inte finns. */
  kind: 'nytt' | 'borta';
}

export interface RouteFrame {
  step: number;
  kind: EventKind;
  pos: NodeId;
  /** Riktning för senaste förflyttningen (0 upp, 1 höger, 2 ned, 3 vänster). */
  heading: 0 | 1 | 2 | 3;
  belief: boolean[][];
  /** Rutor sensorn såg i det här läget. */
  sensed: NodeId[];
  /** Planerad väg från nuvarande position (inklusive den). */
  plan: NodeId[] | null;
  /** Rutor roboten redan har kört genom. */
  trail: NodeId[];
  /** Alla upptäckta skillnader hittills. */
  changes: Change[];
  /** Skillnader som upptäcktes i just det här steget. */
  newChanges: Change[];
  moves: number;
  replans: number;
  message: string;
}

export interface RouteResult {
  frames: RouteFrame[];
  outcome: 'framme' | 'ingen-vag' | 'avbruten';
  moves: number;
  replans: number;
  /** Längden på första planen (antal steg). */
  firstPlan: number | null;
  /** Kortaste väg om roboten hade haft en korrekt karta från början. */
  optimal: number | null;
}

export const columnLetters = 'ABCDEFGHIJKLMNOP';
export function cellName(id: NodeId): string {
  const [r, c] = parseCell(id);
  return `${columnLetters[c] ?? '?'}${r + 1}`;
}

export function parseScenario(lines: readonly string[]): World {
  const rows = lines.length;
  const cols = Math.max(...lines.map((l) => l.length));
  const map: boolean[][] = [];
  const actual: boolean[][] = [];
  let start = cellId(0, 0);
  let goal = cellId(rows - 1, cols - 1);
  for (let r = 0; r < rows; r++) {
    map.push([]);
    actual.push([]);
    for (let c = 0; c < cols; c++) {
      const ch = lines[r]![c] ?? '#';
      map[r]!.push(ch === '#' || ch === 'O');
      actual[r]!.push(ch === '#' || ch === 'X');
      if (ch === 'S') start = cellId(r, c);
      if (ch === 'M') goal = cellId(r, c);
    }
  }
  return { rows, cols, map, actual, start, goal };
}

export function plan(walls: boolean[][], from: NodeId, goal: NodeId): NodeId[] | null {
  return search(gridGraph(walls), from, goal, 'astar', { heuristic: manhattan(goal) }).path;
}

const dirs: [number, number][] = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
];

/** Rutor sensorn ser från en position: fyra strålar, högst range rutor, stannar vid första hindret. */
export function sense(actual: boolean[][], pos: NodeId, range: number): NodeId[] {
  const [r, c] = parseCell(pos);
  const rows = actual.length;
  const cols = actual[0]?.length ?? 0;
  const out: NodeId[] = [];
  for (const [dr, dc] of dirs) {
    for (let k = 1; k <= range; k++) {
      const nr = r + dr * k;
      const nc = c + dc * k;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) break;
      out.push(cellId(nr, nc));
      if (actual[nr]![nc]) break;
    }
  }
  return out;
}

function headingBetween(a: NodeId, b: NodeId): 0 | 1 | 2 | 3 {
  const [ar, ac] = parseCell(a);
  const [br, bc] = parseCell(b);
  if (br < ar) return 0;
  if (bc > ac) return 1;
  if (br > ar) return 2;
  return 3;
}

export function simulateRoute(world: World, range: number, maxMoves = 200): RouteResult {
  const belief = world.map.map((row) => [...row]);
  const frames: RouteFrame[] = [];
  const changes: Change[] = [];
  const trail: NodeId[] = [world.start];
  let pos = world.start;
  let heading: 0 | 1 | 2 | 3 = 1;
  let moves = 0;
  let replans = 0;
  let current = plan(belief, pos, world.goal);
  const firstPlan = current ? current.length - 1 : null;
  const optimalPath = plan(world.actual, world.start, world.goal);
  const optimal = optimalPath ? optimalPath.length - 1 : null;

  const push = (kind: EventKind, sensed: NodeId[], newChanges: Change[], message: string) =>
    frames.push({
      step: frames.length,
      kind,
      pos,
      heading,
      belief: belief.map((row) => [...row]),
      sensed,
      plan: current ? [...current] : null,
      trail: [...trail],
      changes: [...changes],
      newChanges,
      moves,
      replans,
      message,
    });

  const done = (outcome: RouteResult['outcome']): RouteResult => ({ frames, outcome, moves, replans, firstPlan, optimal });

  if (!current) {
    push('ingen-vag', [], [], 'Kartan visar ingen väg från start till mål. Roboten kör inte.');
    return done('ingen-vag');
  }
  push('start', [], [], `Roboten planerar en väg på sin karta med A*: ${current.length - 1} steg till målet ${cellName(world.goal)}.`);

  while (pos !== world.goal) {
    // 1. Känn av
    const sensed = sense(world.actual, pos, range);
    const found: Change[] = [];
    for (const id of sensed) {
      const [r, c] = parseCell(id);
      if (belief[r]![c] !== world.actual[r]![c]) {
        belief[r]![c] = world.actual[r]![c]!;
        found.push({ cell: id, kind: world.actual[r]![c] ? 'nytt' : 'borta' });
      }
    }
    if (found.length > 0) {
      changes.push(...found);
      const blocked = current!.some((id) => {
        const [r, c] = parseCell(id);
        return belief[r]![c];
      });
      const names = (k: Change['kind']) => found.filter((f) => f.kind === k).map((f) => cellName(f.cell));
      const parts: string[] = [];
      if (names('nytt').length) parts.push(`hinder i ${names('nytt').join(', ')} som inte finns på kartan`);
      if (names('borta').length) parts.push(`att hindret i ${names('borta').join(', ')} på kartan är borta`);
      push(
        'upptackt',
        sensed,
        found,
        `Sensorn ser ${parts.join(' och ')}. ${blocked ? 'Den planerade vägen är blockerad – roboten stannar.' : 'Kartan uppdateras – roboten stannar och kontrollerar om det finns en bättre väg.'}`,
      );
      // 2. Planera om
      const before = current!.length - 1;
      current = plan(belief, pos, world.goal);
      replans++;
      if (!current) {
        push('ingen-vag', [], [], `Omplanering ${replans}: med det roboten vet nu finns ingen väg till ${cellName(world.goal)}. Roboten stannar i ${cellName(pos)} och larmar en människa.`);
        return done('ingen-vag');
      }
      const after = current.length - 1;
      const cmp = after > before ? `${after - before} steg längre än` : after < before ? `${before - after} steg kortare än` : 'lika lång som';
      push('omplanering', [], [], `Omplanering ${replans} från ${cellName(pos)}: ny väg på ${after} steg, ${cmp} den gamla vägen (${before} steg kvar).`);
    }
    if (moves >= maxMoves) {
      push('avbruten', [], [], `Roboten har kört ${moves} steg utan att komma fram och avbryter.`);
      return done('avbruten');
    }
    // 3. Kör ett steg
    const next = current![1]!;
    heading = headingBetween(pos, next);
    pos = next;
    current = current!.slice(1);
    trail.push(pos);
    moves++;
    if (pos === world.goal) {
      push('framme', sense(world.actual, pos, range), [], `Framme i ${cellName(pos)} efter ${moves} steg och ${replans} ${replans === 1 ? 'omplanering' : 'omplaneringar'}.`);
      return done('framme');
    }
    push('flytt', sense(world.actual, pos, range), [], `Kör till ${cellName(pos)}. ${current.length - 1} steg kvar enligt planen.`);
  }
  return done('framme');
}

export const scenarios = {
  pall: {
    name: 'Pallen i gången',
    place: 'Lager',
    description: 'Roboten ska hämta en låda vid M. Mittgången är fri på kartan, men någon har lämnat en lastpall där (X).',
    example: 'Kartan ritades när lagret var tomt. Under dagen ställs pallar, vagnar och kartonger tillfälligt i gångarna – det vet inte kartan.',
    lines: [
      '###########',
      '#....S....#',
      '#.###.###.#',
      '#.###.###.#',
      '#.###X###.#',
      '#.###.###.#',
      '#....M....#',
      '###########',
    ],
  },
  stangd: {
    name: 'Den stängda dörren',
    place: 'Skola',
    description: 'Roboten ska leverera post till M. Enligt kartan är dörren i F3 öppen, men i dag är den stängd (X).',
    example: 'Kartan visar väggar och dörröppningar, men inte om dörrarna är öppna eller låsta just nu.',
    lines: [
      '#############',
      '#S..........#',
      '#####X#####.#',
      '#...........#',
      '#M..........#',
      '#############',
    ],
  },
  oppnad: {
    name: 'Dörren som har öppnats',
    place: 'Skola',
    description: 'Samma korridor, men nu är det tvärtom: enligt kartan är dörren i F3 stängd (O), men någon har öppnat den.',
    example: 'Kartan är gammal: en hylla har flyttats eller en dörr har fått en dörröppnare. Roboten tar en omväg tills den själv ser att vägen är fri.',
    lines: [
      '#############',
      '#S..........#',
      '#####O#####.#',
      '#...........#',
      '#M..........#',
      '#############',
    ],
  },
  ingenVag: {
    name: 'Ingen väg fram',
    place: 'Skola',
    description: 'Dörren i F3 är låst och finns inte med som öppning på kartan. Den enda andra vägen, vid L3, är blockerad av en städvagn (X) som inte finns på kartan.',
    example: 'Ibland finns det ingen väg med det roboten vet. Då ska den stanna och be om hjälp – inte gissa.',
    lines: [
      '#############',
      '#S..........#',
      '###########X#',
      '#...........#',
      '#M..........#',
      '#############',
    ],
  },
} satisfies Record<string, Scenario>;

export type ScenarioId = keyof typeof scenarios;
export const scenarioIds = Object.keys(scenarios) as ScenarioId[];

/** Ändra den verkliga miljön i en ruta (hinder av/på). Start, mål och ytterväggar ändras inte. */
export function toggleActual(world: World, r: number, c: number): World {
  if (r <= 0 || c <= 0 || r >= world.rows - 1 || c >= world.cols - 1) return world;
  const id = cellId(r, c);
  if (id === world.start || id === world.goal) return world;
  const actual = world.actual.map((row) => [...row]);
  actual[r]![c] = !actual[r]![c];
  return { ...world, actual };
}

export function isWorld(v: unknown): v is World {
  if (typeof v !== 'object' || v === null) return false;
  const w = v as World;
  const okGrid = (g: unknown) => Array.isArray(g) && g.length === w.rows && g.every((row) => Array.isArray(row) && row.length === w.cols);
  return typeof w.rows === 'number' && typeof w.cols === 'number' && okGrid(w.map) && okGrid(w.actual) && typeof w.start === 'string' && typeof w.goal === 'string';
}
