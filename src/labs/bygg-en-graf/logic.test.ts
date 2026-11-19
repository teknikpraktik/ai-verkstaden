import { describe, expect, it } from 'vitest';
import {
  addEdge,
  addNode,
  emptyGraph,
  exampleGraph,
  hasCycle,
  isGraphModel,
  pathText,
  problemOf,
  removeEdge,
  removeNode,
  runSearch,
  setWeight,
  treeStats,
} from './logic';

describe('labb 6: bygg en graf', () => {
  it('exemplet: viktad sökning (UCS) hittar billigaste vägen – siffror i labbens text', () => {
    const r = runSearch(exampleGraph)!;
    expect(pathText(r.path)).toBe('Västerås → Enköping → Uppsala → Stockholm');
    expect(r.cost).toBe(100);
    expect(r.expanded).toBe(5);
  });

  it('exemplet utan vikter: BFS hittar vägen med minst antal steg', () => {
    const r = runSearch({ ...exampleGraph, weighted: false })!;
    expect(pathText(r.path)).toBe('Västerås → Enköping → Stockholm');
    expect(r.path!.length - 1).toBe(2);
    expect(r.expanded).toBe(5);
    // Samma väg kostar 110 minuter med vikter
    expect(30 + 80).toBe(110);
  });

  it('sökträdet till djup 3 har dubbletter och cykler', () => {
    const t = treeStats(exampleGraph, 3)!;
    expect(t.size).toBe(20);
    expect(t.counts.stockholm).toBe(3);
    expect(t.counts.vasteras).toBe(3);
    expect(t.goalCount).toBe(3);
    expect(t.duplicates).toBe(15);
    expect(t.cycleRepeats).toBe(7);
    expect(treeStats(exampleGraph, 1)!.size).toBe(3);
    // Frågan trad-djup2: antal noder per djup i trädet till djup 3 är 1, 2, 5, 12.
    const perDepth: number[] = [];
    const walk = (n: { depth: number; children: unknown[] }) => {
      perDepth[n.depth] = (perDepth[n.depth] ?? 0) + 1;
      (n.children as { depth: number; children: unknown[] }[]).forEach(walk);
    };
    walk(treeStats(exampleGraph, 3)!.tree);
    expect(perDepth).toEqual([1, 2, 5, 12]);
    expect(treeStats(exampleGraph, 4)!.size).toBe(50);
  });

  it('cykler upptäcks', () => {
    expect(hasCycle(exampleGraph)).toBe(true);
    const tree = removeEdge(removeEdge(exampleGraph, 'sala', 'uppsala'), 'enkoping', 'stockholm');
    expect(hasCycle(tree)).toBe(false);
    expect(hasCycle(emptyGraph)).toBe(false);
  });

  it('redigering: lägg till, ändra, ta bort', () => {
    let g = addNode(emptyGraph, 'sala');
    g = addNode(g, 'sala');
    expect(g.nodes).toEqual(['sala']);
    expect(addNode(g, 'okand').nodes).toEqual(['sala']);
    g = addNode(g, 'uppsala');
    expect(addEdge(g, 'sala', 'sala', 5).ok).toBe(false);
    expect(addEdge(g, 'sala', 'stockholm', 5).ok).toBe(false);
    const r = addEdge(g, 'sala', 'uppsala', 40);
    expect(r.ok).toBe(true);
    g = r.graph;
    const again = addEdge(g, 'uppsala', 'sala', 7);
    expect(again.graph.edges).toEqual([{ a: 'sala', b: 'uppsala', w: 7 }]);
    expect(setWeight(g, 'uppsala', 'sala', 0).edges[0]!.w).toBe(1);
    expect(setWeight(g, 'uppsala', 'sala', 5000).edges[0]!.w).toBe(999);
    g = { ...g, start: 'sala', goal: 'uppsala' };
    g = removeNode(g, 'uppsala');
    expect(g.edges).toEqual([]);
    expect(g.goal).toBeNull();
  });

  it('kantfall: tom graf, ingen start, inget mål, start = mål, mål som inte går att nå', () => {
    expect(problemOf(emptyGraph)).toBe('tom');
    expect(runSearch(emptyGraph)).toBeNull();
    expect(treeStats(emptyGraph, 3)).toBeNull();
    expect(problemOf({ ...exampleGraph, start: null })).toBe('ingen-start');
    expect(problemOf({ ...exampleGraph, goal: null })).toBe('inget-mal');
    const same = runSearch({ ...exampleGraph, goal: 'vasteras' })!;
    expect(same.path).toEqual(['vasteras']);
    expect(same.cost).toBe(0);
    const cut = removeEdge(removeEdge(exampleGraph, 'enkoping', 'stockholm'), 'uppsala', 'stockholm');
    const r = runSearch(cut)!;
    expect(r.path).toBeNull();
    expect(r.frames.at(-1)!.kind).toBe('fail');
    expect(r.expanded).toBe(4);
  });

  it('validerar sparad data', () => {
    expect(isGraphModel(exampleGraph)).toBe(true);
    expect(isGraphModel({ nodes: ['x'], edges: [], weighted: true, start: null, goal: null })).toBe(false);
    expect(isGraphModel({ nodes: ['sala'], edges: [{ a: 'sala', b: 'uppsala', w: 3 }], weighted: true, start: null, goal: null })).toBe(false);
    expect(isGraphModel(null)).toBe(false);
  });
});
