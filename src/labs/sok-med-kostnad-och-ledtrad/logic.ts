import { fromEdgeList, isAdmissible, search, type Algorithm, type Graph, type NodeId, type SearchResult } from '../../lib/search';

/**
 * Påhittade kartor med svenskklingande ortnamn. Koordinaterna är i km och
 * vägarnas längd är minst fågelvägen, så h = fågelvägen (avrundad nedåt) är
 * konsistent på huvudkartan. Scenariot "lurig" har en handgjord h som är
 * tillåten men inte konsistent.
 */
export interface Place {
  id: NodeId;
  name: string;
  x: number;
  y: number;
}

export interface MapScenario {
  name: string;
  description: string;
  places: Place[];
  roads: { a: NodeId; b: NodeId; cost: number; note?: string }[];
  start: NodeId;
  goal: NodeId;
  /** Handgjord heuristik. Saknas den används fågelvägen till målet. */
  h?: Record<NodeId, number>;
  lake?: { cx: number; cy: number; rx: number; ry: number; name: string };
}

export const scenarios = {
  karta: {
    name: 'Kartan runt Långsjön',
    description: 'Från Ekeby till Lindvik. Vägen norr om Långsjön ser kort ut fågelvägen men måste gå runt sjön.',
    places: [
      { id: 'ekeby', name: 'Ekeby', x: 90, y: 150 },
      { id: 'bjorkas', name: 'Björkås', x: 170, y: 90 },
      { id: 'hagby', name: 'Hagby', x: 170, y: 220 },
      { id: 'sjovik', name: 'Sjövik', x: 270, y: 60 },
      { id: 'granberga', name: 'Granberga', x: 280, y: 230 },
      { id: 'lindvik', name: 'Lindvik', x: 400, y: 150 },
      { id: 'tallmo', name: 'Tallmo', x: 10, y: 120 },
      { id: 'asa', name: 'Åsa', x: 10, y: 190 },
    ],
    roads: [
      { a: 'ekeby', b: 'bjorkas', cost: 100 },
      { a: 'ekeby', b: 'hagby', cost: 110 },
      { a: 'ekeby', b: 'tallmo', cost: 90 },
      { a: 'ekeby', b: 'asa', cost: 95 },
      { a: 'bjorkas', b: 'sjovik', cost: 110 },
      { a: 'bjorkas', b: 'hagby', cost: 135 },
      { a: 'sjovik', b: 'lindvik', cost: 240, note: 'runt sjön' },
      { a: 'hagby', b: 'granberga', cost: 115 },
      { a: 'granberga', b: 'lindvik', cost: 150 },
    ],
    start: 'ekeby',
    goal: 'lindvik',
    lake: { cx: 335, cy: 105, rx: 45, ry: 32, name: 'Långsjön' },
  },
  lurig: {
    name: 'Lurig ledtråd',
    description: 'En liten karta där h aldrig överskattar men ändå inte är konsistent.',
    places: [
      { id: 'alby', name: 'Alby', x: 60, y: 150 },
      { id: 'borg', name: 'Borg', x: 220, y: 70 },
      { id: 'dala', name: 'Dala', x: 200, y: 230 },
      { id: 'viken', name: 'Viken', x: 380, y: 150 },
    ],
    roads: [
      { a: 'alby', b: 'borg', cost: 4 },
      { a: 'alby', b: 'dala', cost: 1 },
      { a: 'dala', b: 'borg', cost: 1 },
      { a: 'borg', b: 'viken', cost: 5 },
    ],
    start: 'alby',
    goal: 'viken',
    h: { alby: 0, borg: 0, dala: 6, viken: 0 },
  },
} satisfies Record<string, MapScenario>;

export type ScenarioId = keyof typeof scenarios;
export const scenarioIds = Object.keys(scenarios) as ScenarioId[];
export type CostAlgorithm = Extract<Algorithm, 'ucs' | 'greedy' | 'astar'>;
export const costAlgorithms: CostAlgorithm[] = ['ucs', 'greedy', 'astar'];
export const algLabel: Record<CostAlgorithm, string> = { ucs: 'Uniformkostnadssökning', greedy: 'Girig bäst-först', astar: 'A*' };

export type HeuristicMode = 'standard' | 'noll' | 'tredubbel';
export const heuristicLabel: Record<HeuristicMode, string> = {
  standard: 'Fågelvägen (eller kartans egen h)',
  noll: 'Ingen ledtråd: h = 0',
  tredubbel: 'Överskattad: 3 × h',
};

export function getScenario(id: ScenarioId): MapScenario {
  return scenarios[id];
}

export function placeName(s: MapScenario, id: NodeId): string {
  return s.places.find((p) => p.id === id)?.name ?? id;
}

export function toGraph(s: MapScenario): Graph {
  return fromEdgeList({ nodes: s.places.map((p) => p.id), edges: s.roads.map((r) => ({ a: r.a, b: r.b, cost: r.cost })) });
}

export function straightLine(s: MapScenario, a: NodeId, b: NodeId): number {
  const p = s.places.find((x) => x.id === a)!;
  const q = s.places.find((x) => x.id === b)!;
  return Math.hypot(p.x - q.x, p.y - q.y);
}

export function heuristic(s: MapScenario, mode: HeuristicMode): (id: NodeId) => number {
  const base = (id: NodeId) => (s.h ? s.h[id] ?? 0 : Math.floor(straightLine(s, id, s.goal)));
  if (mode === 'noll') return () => 0;
  if (mode === 'tredubbel') return (id) => 3 * base(id);
  return base;
}

/** h är konsistent om h(mål) = 0 och h(n) ≤ kostnad(n, m) + h(m) för varje väg n–m (åt båda hållen). */
export function isConsistent(s: MapScenario, mode: HeuristicMode): boolean {
  const h = heuristic(s, mode);
  if (h(s.goal) !== 0) return false;
  return s.roads.every((r) => h(r.a) <= r.cost + h(r.b) && h(r.b) <= r.cost + h(r.a));
}

export function admissible(s: MapScenario, mode: HeuristicMode): boolean {
  return isAdmissible(toGraph(s), s.goal, heuristic(s, mode));
}

export function run(s: MapScenario, alg: CostAlgorithm, mode: HeuristicMode): SearchResult {
  return search(toGraph(s), s.start, s.goal, alg, { heuristic: heuristic(s, mode), label: (id) => placeName(s, id) });
}

export interface Summary {
  alg: CostAlgorithm;
  path: string;
  steps: number | null;
  cost: number | null;
  expanded: number;
  explored: string;
}

export function summarize(s: MapScenario, mode: HeuristicMode): Summary[] {
  return costAlgorithms.map((alg) => {
    const r = run(s, alg, mode);
    return {
      alg,
      path: r.path ? r.path.map((id) => placeName(s, id)).join(' → ') : 'ingen väg',
      steps: r.path ? r.path.length - 1 : null,
      cost: r.cost,
      expanded: r.expanded,
      explored: r.explored.map((id) => placeName(s, id)).join(', '),
    };
  });
}

export function optimalCost(s: MapScenario): number | null {
  return run(s, 'ucs', 'noll').cost;
}

export const isScenarioId = (v: unknown): v is ScenarioId => typeof v === 'string' && v in scenarios;
export const isCostAlg = (v: unknown): v is CostAlgorithm => v === 'ucs' || v === 'greedy' || v === 'astar';
export const isHeuristicMode = (v: unknown): v is HeuristicMode => v === 'standard' || v === 'noll' || v === 'tredubbel';
