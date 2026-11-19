/**
 * Sökalgoritmer som producerar en lista med ögonblicksbilder (frames) så att
 * gränssnittet kan stega fram och tillbaka exakt. Alla algoritmer är
 * grafsökning med en lista över besökta (expanderade) noder.
 *
 *  - bfs:    kö (först in, först ut). Ger kortast väg i antal steg.
 *  - dfs:    stack (sist in, först ut). Ger någon väg, inte nödvändigtvis kortast.
 *  - ucs:    lägst g (kostnad hittills). Ger billigaste väg vid positiva kostnader.
 *  - greedy: lägst h (uppskattad kostnad kvar). Snabb men kan ge dyr väg.
 *  - astar:  lägst f = g + h. Ger billigaste väg om h aldrig överskattar
 *            (tillåten heuristik) och h är konsistent – se README/labb 8.
 * Målet testas när en nod expanderas (tas ut ur gränsen), inte när den läggs till.
 * Lika prioritet avgörs av ordningen noderna lades till (först tillagd först).
 */
export type NodeId = string;

export interface Edge {
  to: NodeId;
  cost: number;
}

export interface Graph {
  nodes: NodeId[];
  neighbours: (id: NodeId) => Edge[];
}

export type Algorithm = 'bfs' | 'dfs' | 'ucs' | 'greedy' | 'astar';

export const algorithmNames: Record<Algorithm, string> = {
  bfs: 'Bredden först (BFS)',
  dfs: 'Djupet först (DFS)',
  ucs: 'Uniformkostnadssökning',
  greedy: 'Girig bäst-först',
  astar: 'A*',
};

export interface FrontierItem {
  id: NodeId;
  g: number;
  h: number;
  f: number;
  parent: NodeId | null;
}

export interface Frame {
  step: number;
  kind: 'start' | 'expand' | 'skip' | 'found' | 'fail';
  current: NodeId | null;
  /** Gränsen i den ordning noderna kommer att tas ut (första = nästa). */
  frontier: FrontierItem[];
  explored: NodeId[];
  parents: Record<NodeId, NodeId | null>;
  g: Record<NodeId, number>;
  path: NodeId[] | null;
  pathCost: number | null;
  /** Noder som lades till i gränsen i det här steget. */
  added: NodeId[];
  message: string;
}

export interface SearchResult {
  frames: Frame[];
  path: NodeId[] | null;
  cost: number | null;
  expanded: number;
  explored: NodeId[];
}

export interface SearchOptions {
  heuristic?: (id: NodeId) => number;
  /** Säkerhetsgräns för antal expansioner. */
  maxExpansions?: number;
  label?: (id: NodeId) => string;
}

function reconstruct(parents: Record<NodeId, NodeId | null>, goal: NodeId): NodeId[] {
  const path: NodeId[] = [goal];
  let cur = parents[goal];
  const guard = new Set<NodeId>([goal]);
  while (cur !== null && cur !== undefined) {
    if (guard.has(cur)) break;
    guard.add(cur);
    path.unshift(cur);
    cur = parents[cur];
  }
  return path;
}

export function pathCost(graph: Graph, path: NodeId[]): number {
  let c = 0;
  for (let i = 0; i + 1 < path.length; i++) {
    const e = graph.neighbours(path[i]!).find((x) => x.to === path[i + 1]);
    if (!e) return Number.NaN;
    c += e.cost;
  }
  return c;
}

export function search(graph: Graph, start: NodeId, goal: NodeId, algorithm: Algorithm, opts: SearchOptions = {}): SearchResult {
  const h = opts.heuristic ?? (() => 0);
  const name = opts.label ?? ((id: NodeId) => id);
  const max = opts.maxExpansions ?? 10_000;
  const frames: Frame[] = [];
  const explored: NodeId[] = [];
  const exploredSet = new Set<NodeId>();
  const parents: Record<NodeId, NodeId | null> = { [start]: null };
  const gMap: Record<NodeId, number> = { [start]: 0 };
  let order = 0;
  type Entry = FrontierItem & { order: number };
  let frontier: Entry[] = [];

  const priority = (e: Entry): number => {
    switch (algorithm) {
      case 'ucs':
        return e.g;
      case 'greedy':
        return e.h;
      case 'astar':
        return e.f;
      default:
        return 0;
    }
  };
  const sorted = (): Entry[] => {
    if (algorithm === 'bfs') return [...frontier].sort((a, b) => a.order - b.order);
    if (algorithm === 'dfs') return [...frontier].sort((a, b) => b.order - a.order);
    return [...frontier].sort((a, b) => priority(a) - priority(b) || a.order - b.order);
  };
  const snapshot = (kind: Frame['kind'], current: NodeId | null, message: string, added: NodeId[] = [], path: NodeId[] | null = null): void => {
    frames.push({
      step: frames.length,
      kind,
      current,
      frontier: sorted().map(({ id, g, h: hh, f, parent }) => ({ id, g, h: hh, f, parent })),
      explored: [...explored],
      parents: { ...parents },
      g: { ...gMap },
      path,
      pathCost: path ? gMap[path[path.length - 1]!] ?? null : null,
      added,
      message,
    });
  };

  if (!graph.nodes.includes(start)) {
    snapshot('fail', null, 'Startnoden finns inte i grafen.');
    return { frames, path: null, cost: null, expanded: 0, explored };
  }

  const h0 = h(start);
  frontier.push({ id: start, g: 0, h: h0, f: h0, parent: null, order: order++ });
  snapshot('start', null, `Starta i ${name(start)}. Lägg startnoden i ${algorithm === 'dfs' ? 'stacken' : algorithm === 'bfs' ? 'kön' : 'gränsen'}.`, [start]);

  while (frontier.length > 0) {
    if (explored.length >= max) break;
    const next = sorted()[0]!;
    frontier = frontier.filter((e) => e !== next);

    if (exploredSet.has(next.id)) {
      snapshot('skip', next.id, `${name(next.id)} är redan besökt – hoppa över.`);
      continue;
    }
    explored.push(next.id);
    exploredSet.add(next.id);
    parents[next.id] = next.parent;
    gMap[next.id] = next.g;

    if (next.id === goal) {
      const path = reconstruct(parents, goal);
      snapshot('found', next.id, `Målet ${name(goal)} togs ut ur ${algorithm === 'dfs' ? 'stacken' : algorithm === 'bfs' ? 'kön' : 'gränsen'}. Vägen har ${path.length - 1} steg och kostar ${next.g}.`, [], path);
      return { frames, path, cost: next.g, expanded: explored.length, explored };
    }

    const added: NodeId[] = [];
    // DFS lägger grannarna i omvänd ordning så att den första grannen hamnar överst i stacken.
    const nbrs = algorithm === 'dfs' ? [...graph.neighbours(next.id)].reverse() : graph.neighbours(next.id);
    for (const e of nbrs) {
      if (exploredSet.has(e.to)) continue;
      const g = next.g + e.cost;
      const existing = frontier.find((x) => x.id === e.to);
      if (algorithm === 'bfs') {
        if (existing) continue;
      } else if (algorithm === 'dfs') {
        if (existing) frontier = frontier.filter((x) => x !== existing); // flytta upp överst i stacken
      } else if (existing) {
        const better = algorithm === 'greedy' ? false : g < existing.g;
        if (!better) continue;
        frontier = frontier.filter((x) => x !== existing);
      }
      const hh = h(e.to);
      frontier.push({ id: e.to, g, h: hh, f: g + hh, parent: next.id, order: order++ });
      if (!(e.to in parents) || algorithm !== 'bfs') parents[e.to] = next.id;
      added.push(e.to);
    }
    snapshot(
      'expand',
      next.id,
      added.length > 0
        ? `Expandera ${name(next.id)} (g = ${next.g}). Lägg till: ${added.map(name).join(', ')}.`
        : `Expandera ${name(next.id)} (g = ${next.g}). Inga nya grannar att lägga till.`,
      added,
    );
  }

  if (frontier.length > 0) {
    snapshot('fail', null, `Sökningen avbröts efter ${max} expansioner utan att hitta ${name(goal)}.`);
  } else {
    snapshot('fail', null, `Gränsen är tom – det finns ingen väg från ${name(start)} till ${name(goal)}.`);
  }
  return { frames, path: null, cost: null, expanded: explored.length, explored };
}

/* ---------- Hjälpfunktioner för grafer ---------- */

export interface EdgeListGraph {
  nodes: NodeId[];
  edges: { a: NodeId; b: NodeId; cost?: number }[];
  directed?: boolean;
}

/** Skapar en graf från en kantlista. Grannarna kommer i den ordning kanterna listas. */
export function fromEdgeList(def: EdgeListGraph): Graph {
  const adj = new Map<NodeId, Edge[]>(def.nodes.map((n) => [n, []]));
  for (const { a, b, cost = 1 } of def.edges) {
    adj.get(a)?.push({ to: b, cost });
    if (!def.directed) adj.get(b)?.push({ to: a, cost });
  }
  return { nodes: [...def.nodes], neighbours: (id) => adj.get(id) ?? [] };
}

export type Cell = [number, number];
export const cellId = (r: number, c: number): NodeId => `${r},${c}`;
export const parseCell = (id: NodeId): Cell => id.split(',').map(Number) as Cell;

/**
 * Rutnät som graf. walls[r][c] = true betyder vägg. costs[r][c] är kostnaden
 * för att gå IN i rutan (standard 1). Grannordning: upp, höger, ned, vänster.
 */
export function gridGraph(walls: boolean[][], costs?: number[][]): Graph {
  const rows = walls.length;
  const cols = walls[0]?.length ?? 0;
  const nodes: NodeId[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (!walls[r]![c]) nodes.push(cellId(r, c));
  const dirs: Cell[] = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];
  return {
    nodes,
    neighbours: (id) => {
      const [r, c] = parseCell(id);
      const out: Edge[] = [];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || walls[nr]![nc]) continue;
        out.push({ to: cellId(nr, nc), cost: costs?.[nr]?.[nc] ?? 1 });
      }
      return out;
    },
  };
}

/** Manhattanavstånd (antal steg om inga väggar fanns) gånger minsta stegkostnad. */
export function manhattan(goal: NodeId, minStepCost = 1): (id: NodeId) => number {
  const [gr, gc] = parseCell(goal);
  return (id) => {
    const [r, c] = parseCell(id);
    return (Math.abs(r - gr) + Math.abs(c - gc)) * minStepCost;
  };
}

/** Kontrollerar om en heuristik är tillåten (överskattar aldrig) genom att jämföra med UCS-avstånd till målet. */
export function isAdmissible(graph: Graph, goal: NodeId, h: (id: NodeId) => number): boolean {
  for (const n of graph.nodes) {
    const r = search(graph, n, goal, 'ucs');
    const true_ = r.cost ?? Infinity;
    if (h(n) > true_ + 1e-9) return false;
  }
  return true;
}

/**
 * Sökträd utan minne av besökta noder (trädsökning) till ett visst djup.
 * Visar hur samma nod dyker upp flera gånger och hur cykler ger oändliga grenar.
 */
export interface TreeNode {
  id: NodeId;
  depth: number;
  cost: number;
  children: TreeNode[];
  /** Noden förekommer redan längre upp på samma gren (cykel). */
  repeatsAncestor: boolean;
}

export function buildSearchTree(graph: Graph, start: NodeId, maxDepth: number): TreeNode {
  const make = (id: NodeId, depth: number, cost: number, ancestors: Set<NodeId>): TreeNode => {
    const node: TreeNode = { id, depth, cost, children: [], repeatsAncestor: ancestors.has(id) };
    if (depth >= maxDepth) return node;
    const next = new Set(ancestors).add(id);
    for (const e of graph.neighbours(id)) node.children.push(make(e.to, depth + 1, cost + e.cost, next));
    return node;
  };
  return make(start, 0, 0, new Set());
}

export function countTreeNodes(t: TreeNode): number {
  return 1 + t.children.reduce((s, c) => s + countTreeNodes(c), 0);
}
