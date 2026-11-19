import { buildSearchTree, countTreeNodes, fromEdgeList, search, type Graph, type NodeId, type SearchResult, type TreeNode } from '../../lib/search';

/**
 * En liten graf som eleven bygger själv. Noderna har fasta platser (inga
 * dragningar behövs) och kanterna är oriktade. Restiderna är påhittade.
 */
export interface Slot {
  id: NodeId;
  name: string;
  x: number;
  y: number;
}

export const slots: Slot[] = [
  { id: 'sala', name: 'Sala', x: 150, y: 40 },
  { id: 'vasteras', name: 'Västerås', x: 70, y: 120 },
  { id: 'enkoping', name: 'Enköping', x: 190, y: 140 },
  { id: 'uppsala', name: 'Uppsala', x: 320, y: 60 },
  { id: 'eskilstuna', name: 'Eskilstuna', x: 60, y: 240 },
  { id: 'strangnas', name: 'Strängnäs', x: 180, y: 250 },
  { id: 'stockholm', name: 'Stockholm', x: 350, y: 170 },
  { id: 'sodertalje', name: 'Södertälje', x: 300, y: 260 },
];

export const slotById = new Map(slots.map((s) => [s.id, s]));
export const nodeName = (id: NodeId) => slotById.get(id)?.name ?? id;

export interface GraphEdge {
  a: NodeId;
  b: NodeId;
  w: number;
}

export interface GraphModel {
  nodes: NodeId[];
  edges: GraphEdge[];
  weighted: boolean;
  start: NodeId | null;
  goal: NodeId | null;
}

export const MIN_WEIGHT = 1;
export const MAX_WEIGHT = 999;

export const exampleGraph: GraphModel = {
  nodes: ['sala', 'vasteras', 'enkoping', 'uppsala', 'stockholm'],
  edges: [
    { a: 'vasteras', b: 'enkoping', w: 30 },
    { a: 'vasteras', b: 'sala', w: 35 },
    { a: 'sala', b: 'uppsala', w: 40 },
    { a: 'enkoping', b: 'uppsala', w: 30 },
    { a: 'enkoping', b: 'stockholm', w: 80 },
    { a: 'uppsala', b: 'stockholm', w: 40 },
  ],
  weighted: true,
  start: 'vasteras',
  goal: 'stockholm',
};

export const emptyGraph: GraphModel = { nodes: [], edges: [], weighted: true, start: null, goal: null };

const sameEdge = (e: GraphEdge, a: NodeId, b: NodeId) => (e.a === a && e.b === b) || (e.a === b && e.b === a);

/** Ordna noderna i samma ordning som platserna, så att grannordningen blir förutsägbar. */
const sortNodes = (ids: NodeId[]) => slots.map((s) => s.id).filter((id) => ids.includes(id));

export function addNode(g: GraphModel, id: NodeId): GraphModel {
  if (!slotById.has(id) || g.nodes.includes(id)) return g;
  return { ...g, nodes: sortNodes([...g.nodes, id]) };
}

export function removeNode(g: GraphModel, id: NodeId): GraphModel {
  if (!g.nodes.includes(id)) return g;
  return {
    ...g,
    nodes: g.nodes.filter((n) => n !== id),
    edges: g.edges.filter((e) => e.a !== id && e.b !== id),
    start: g.start === id ? null : g.start,
    goal: g.goal === id ? null : g.goal,
  };
}

export type EdgeResult = { ok: true; graph: GraphModel; message: string } | { ok: false; graph: GraphModel; message: string };

export function clampWeight(w: number): number {
  if (!Number.isFinite(w)) return MIN_WEIGHT;
  return Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, Math.round(w)));
}

/** Lägger till en kant, eller ändrar vikten om kanten redan finns. */
export function addEdge(g: GraphModel, a: NodeId, b: NodeId, w: number): EdgeResult {
  if (!g.nodes.includes(a) || !g.nodes.includes(b)) return { ok: false, graph: g, message: 'Båda noderna måste finnas i grafen.' };
  if (a === b) return { ok: false, graph: g, message: 'En kant måste gå mellan två olika noder.' };
  const weight = clampWeight(w);
  const existing = g.edges.find((e) => sameEdge(e, a, b));
  if (existing) {
    return {
      ok: true,
      graph: { ...g, edges: g.edges.map((e) => (e === existing ? { ...e, w: weight } : e)) },
      message: `Kanten ${nodeName(a)}–${nodeName(b)} fanns redan. Vikten är nu ${weight}.`,
    };
  }
  return { ok: true, graph: { ...g, edges: [...g.edges, { a, b, w: weight }] }, message: `Kanten ${nodeName(a)}–${nodeName(b)} lades till.` };
}

export function removeEdge(g: GraphModel, a: NodeId, b: NodeId): GraphModel {
  return { ...g, edges: g.edges.filter((e) => !sameEdge(e, a, b)) };
}

export function setWeight(g: GraphModel, a: NodeId, b: NodeId, w: number): GraphModel {
  const weight = clampWeight(w);
  return { ...g, edges: g.edges.map((e) => (sameEdge(e, a, b) ? { ...e, w: weight } : e)) };
}

export function toGraph(g: GraphModel): Graph {
  return fromEdgeList({ nodes: g.nodes, edges: g.edges.map((e) => ({ a: e.a, b: e.b, cost: g.weighted ? e.w : 1 })) });
}

/** Finns det en cykel? (Oriktad graf: fler kanter än noder minus antal sammanhängande delar.) */
export function hasCycle(g: GraphModel): boolean {
  const parent = new Map(g.nodes.map((n) => [n, n]));
  const find = (x: NodeId): NodeId => {
    let r = x;
    while (parent.get(r) !== r) r = parent.get(r)!;
    return r;
  };
  for (const e of g.edges) {
    const ra = find(e.a);
    const rb = find(e.b);
    if (ra === rb) return true;
    parent.set(ra, rb);
  }
  return false;
}

export type Problem = 'tom' | 'ingen-start' | 'inget-mal' | null;

export function problemOf(g: GraphModel): Problem {
  if (g.nodes.length === 0) return 'tom';
  if (!g.start || !g.nodes.includes(g.start)) return 'ingen-start';
  if (!g.goal || !g.nodes.includes(g.goal)) return 'inget-mal';
  return null;
}

export const problemText: Record<Exclude<Problem, null>, string> = {
  tom: 'Grafen är tom. Lägg till noder och kanter, eller ladda exemplet.',
  'ingen-start': 'Välj en startnod för att kunna söka.',
  'inget-mal': 'Välj en målnod för att kunna söka.',
};

export const searchAlgorithm = (g: GraphModel) => (g.weighted ? 'ucs' : 'bfs');

export function runSearch(g: GraphModel): SearchResult | null {
  if (problemOf(g)) return null;
  return search(toGraph(g), g.start!, g.goal!, searchAlgorithm(g), { label: nodeName });
}

export interface TreeStats {
  tree: TreeNode;
  size: number;
  /** Hur många gånger varje nod förekommer i trädet. */
  counts: Record<NodeId, number>;
  /** Antal trädnoder som är en upprepning av en nod som redan finns i trädet. */
  duplicates: number;
  /** Antal trädnoder som upprepar en nod högre upp på samma gren (cykel). */
  cycleRepeats: number;
  goalCount: number;
}

export function treeStats(g: GraphModel, depth: number): TreeStats | null {
  if (!g.start || !g.nodes.includes(g.start)) return null;
  const tree = buildSearchTree(toGraph(g), g.start, depth);
  const counts: Record<NodeId, number> = {};
  let cycleRepeats = 0;
  const walk = (t: TreeNode) => {
    counts[t.id] = (counts[t.id] ?? 0) + 1;
    if (t.repeatsAncestor) cycleRepeats++;
    t.children.forEach(walk);
  };
  walk(tree);
  const size = countTreeNodes(tree);
  const distinct = Object.keys(counts).length;
  return { tree, size, counts, duplicates: size - distinct, cycleRepeats, goalCount: g.goal ? counts[g.goal] ?? 0 : 0 };
}

export function isGraphModel(v: unknown): v is GraphModel {
  if (typeof v !== 'object' || v === null) return false;
  const g = v as GraphModel;
  return (
    Array.isArray(g.nodes) &&
    g.nodes.every((n) => typeof n === 'string' && slotById.has(n)) &&
    Array.isArray(g.edges) &&
    g.edges.every((e) => typeof e === 'object' && e !== null && g.nodes.includes(e.a) && g.nodes.includes(e.b) && e.a !== e.b && typeof e.w === 'number' && Number.isFinite(e.w) && e.w >= MIN_WEIGHT) &&
    typeof g.weighted === 'boolean' &&
    (g.start === null || typeof g.start === 'string') &&
    (g.goal === null || typeof g.goal === 'string')
  );
}

export function pathText(path: NodeId[] | null): string {
  return path ? path.map(nodeName).join(' → ') : 'ingen väg';
}
