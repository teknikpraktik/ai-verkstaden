import { cellId, gridGraph, parseCell, search, type Algorithm, type NodeId, type SearchResult } from '../../lib/search';

/**
 * Labyrinter beskrivs som textrader:
 *   #  vägg   .  golv (kostnad 1)   ~  lera (kostnad 5)   S  start   M  mål
 */
export interface Maze {
  rows: number;
  cols: number;
  walls: boolean[][];
  costs: number[][];
  start: NodeId;
  goal: NodeId;
}

export const MUD_COST = 5;

export function parseMaze(lines: string[]): Maze {
  const rows = lines.length;
  const cols = Math.max(...lines.map((l) => l.length));
  let start = cellId(0, 0);
  let goal = cellId(rows - 1, cols - 1);
  const walls: boolean[][] = [];
  const costs: number[][] = [];
  for (let r = 0; r < rows; r++) {
    walls.push([]);
    costs.push([]);
    for (let c = 0; c < cols; c++) {
      const ch = lines[r]![c] ?? '#';
      walls[r]!.push(ch === '#');
      costs[r]!.push(ch === '~' ? MUD_COST : 1);
      if (ch === 'S') start = cellId(r, c);
      if (ch === 'M') goal = cellId(r, c);
    }
  }
  return { rows, cols, walls, costs, start, goal };
}

export const scenarios = {
  labyrint: {
    name: 'Labyrinten',
    description: 'Alla steg kostar lika mycket (1).',
    lines: [
      'S...#....',
      '.##.#.##.',
      '.#.....#.',
      '.#.###.#.',
      '...#M..#.',
      '##.###...',
      '.........',
    ],
  },
  lera: {
    name: 'Leran',
    description: 'Lerrutor (~) kostar 5 att gå in i. Vanliga rutor kostar 1.',
    lines: ['.......', 'S~~~~~M', '.#####.', '.......'],
  },
} as const;

export type ScenarioId = keyof typeof scenarios;

export const columnLetters = 'ABCDEFGHIJKLMNOP';

/** Läsbart namn på en ruta: kolumnbokstav + radnummer, t.ex. "C4". */
export function cellName(id: NodeId): string {
  const [r, c] = parseCell(id);
  return `${columnLetters[c] ?? '?'}${r + 1}`;
}

export function runMaze(maze: Maze, algorithm: Algorithm): SearchResult {
  const graph = gridGraph(maze.walls, maze.costs);
  return search(graph, maze.start, maze.goal, algorithm, { label: cellName });
}

export function summarize(maze: Maze) {
  const bfs = runMaze(maze, 'bfs');
  const dfs = runMaze(maze, 'dfs');
  const ucs = runMaze(maze, 'ucs');
  const steps = (r: SearchResult) => (r.path ? r.path.length - 1 : null);
  return {
    bfs: { expanded: bfs.expanded, steps: steps(bfs), cost: bfs.cost },
    dfs: { expanded: dfs.expanded, steps: steps(dfs), cost: dfs.cost },
    cheapest: { steps: steps(ucs), cost: ucs.cost },
  };
}

/** Byt vägg/golv i en ruta. Start och mål kan inte bli vägg. */
export function toggleWall(maze: Maze, r: number, c: number): Maze {
  const id = cellId(r, c);
  if (id === maze.start || id === maze.goal) return maze;
  const walls = maze.walls.map((row) => [...row]);
  walls[r]![c] = !walls[r]![c];
  return { ...maze, walls };
}

export function toggleMud(maze: Maze, r: number, c: number): Maze {
  if (maze.walls[r]![c]) return maze;
  const costs = maze.costs.map((row) => [...row]);
  costs[r]![c] = costs[r]![c] === 1 ? MUD_COST : 1;
  return { ...maze, costs };
}

export function moveEndpoint(maze: Maze, which: 'start' | 'goal', r: number, c: number): Maze {
  const id = cellId(r, c);
  if (maze.walls[r]![c]) return maze;
  if (which === 'start' && id !== maze.goal) return { ...maze, start: id };
  if (which === 'goal' && id !== maze.start) return { ...maze, goal: id };
  return maze;
}

export function isMaze(v: unknown): v is Maze {
  if (typeof v !== 'object' || v === null) return false;
  const m = v as Maze;
  return (
    typeof m.rows === 'number' &&
    typeof m.cols === 'number' &&
    Array.isArray(m.walls) &&
    m.walls.length === m.rows &&
    Array.isArray(m.costs) &&
    typeof m.start === 'string' &&
    typeof m.goal === 'string'
  );
}
