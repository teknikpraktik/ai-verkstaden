import { describe, expect, it } from 'vitest';
import { buildSearchTree, countTreeNodes, fromEdgeList, gridGraph, isAdmissible, manhattan, pathCost, search, cellId } from './search';

// Cyklisk graf: A–B–C–A samt C–D
const cyclic = fromEdgeList({
  nodes: ['A', 'B', 'C', 'D'],
  edges: [
    { a: 'A', b: 'B' },
    { a: 'B', b: 'C' },
    { a: 'C', b: 'A' },
    { a: 'C', b: 'D' },
  ],
});

// Viktat fall: A→B→Z är 2 steg men kostar 10; A→C→D→Z är 3 steg men kostar 3.
const weighted = fromEdgeList({
  nodes: ['A', 'B', 'C', 'D', 'Z'],
  edges: [
    { a: 'A', b: 'B', cost: 5 },
    { a: 'B', b: 'Z', cost: 5 },
    { a: 'A', b: 'C', cost: 1 },
    { a: 'C', b: 'D', cost: 1 },
    { a: 'D', b: 'Z', cost: 1 },
  ],
});

describe('search', () => {
  it('BFS och DFS terminerar i en cyklisk graf och hittar målet', () => {
    for (const alg of ['bfs', 'dfs', 'ucs', 'greedy', 'astar'] as const) {
      const r = search(cyclic, 'A', 'D', alg);
      expect(r.path?.[0]).toBe('A');
      expect(r.path?.at(-1)).toBe('D');
      expect(new Set(r.explored).size).toBe(r.explored.length);
    }
  });

  it('BFS ger kortast väg i antal steg i cyklisk graf', () => {
    expect(search(cyclic, 'A', 'D', 'bfs').path).toEqual(['A', 'C', 'D']);
  });

  it('rapporterar mål som inte går att nå', () => {
    const g = fromEdgeList({ nodes: ['A', 'B', 'X'], edges: [{ a: 'A', b: 'B' }] });
    for (const alg of ['bfs', 'dfs', 'ucs', 'greedy', 'astar'] as const) {
      const r = search(g, 'A', 'X', alg);
      expect(r.path).toBeNull();
      expect(r.cost).toBeNull();
      expect(r.frames.at(-1)?.kind).toBe('fail');
      expect(r.expanded).toBe(2);
    }
  });

  it('färre steg kan ge högre kostnad: BFS väljer 2 steg (kostnad 10), UCS och A* 3 steg (kostnad 3)', () => {
    const bfs = search(weighted, 'A', 'Z', 'bfs');
    expect(bfs.path).toEqual(['A', 'B', 'Z']);
    expect(pathCost(weighted, bfs.path!)).toBe(10);
    const ucs = search(weighted, 'A', 'Z', 'ucs');
    expect(ucs.path).toEqual(['A', 'C', 'D', 'Z']);
    expect(ucs.cost).toBe(3);
    const astar = search(weighted, 'A', 'Z', 'astar', { heuristic: () => 0 });
    expect(astar.cost).toBe(3);
  });

  it('girig sökning kan välja en dyrare väg än A* med missvisande men tillåten ledtråd', () => {
    // h säger att B ligger nära målet (1) men vägen via B är dyr.
    const h: Record<string, number> = { A: 3, B: 1, C: 2, D: 1, Z: 0 };
    expect(isAdmissible(weighted, 'Z', (id) => h[id]!)).toBe(true);
    const greedy = search(weighted, 'A', 'Z', 'greedy', { heuristic: (id) => h[id]! });
    const astar = search(weighted, 'A', 'Z', 'astar', { heuristic: (id) => h[id]! });
    expect(greedy.cost).toBe(10);
    expect(astar.cost).toBe(3);
  });

  it('DFS följer en gren till botten först', () => {
    const tree = fromEdgeList({ nodes: ['S', 'A', 'B', 'A1', 'G'], edges: [{ a: 'S', b: 'A' }, { a: 'S', b: 'B' }, { a: 'A', b: 'A1' }, { a: 'B', b: 'G' }] });
    const r = search(tree, 'S', 'G', 'dfs');
    expect(r.explored).toEqual(['S', 'A', 'A1', 'B', 'G']);
    const b = search(tree, 'S', 'G', 'bfs');
    expect(b.explored).toEqual(['S', 'A', 'B', 'A1', 'G']);
  });

  it('start lika med mål ger väg med ett element och kostnad 0', () => {
    const r = search(cyclic, 'A', 'A', 'bfs');
    expect(r.path).toEqual(['A']);
    expect(r.cost).toBe(0);
  });

  it('okänd startnod ger misslyckande utan krasch', () => {
    const r = search(cyclic, 'Q', 'A', 'bfs');
    expect(r.path).toBeNull();
  });

  it('rutnät med väggar: A* med Manhattan hittar samma kostnad som UCS', () => {
    const W = true;
    const _ = false;
    const walls = [
      [_, _, _, _],
      [W, W, _, W],
      [_, _, _, _],
      [_, W, W, _],
    ];
    const g = gridGraph(walls);
    const s = cellId(0, 0);
    const t = cellId(3, 0);
    const u = search(g, s, t, 'ucs');
    const a = search(g, s, t, 'astar', { heuristic: manhattan(t) });
    expect(u.cost).toBe(7);
    expect(a.cost).toBe(7);
    expect(a.expanded).toBeLessThanOrEqual(u.expanded);
  });

  it('tomt rutnät (bara väggar) hanteras', () => {
    const g = gridGraph([[true]]);
    expect(search(g, cellId(0, 0), cellId(0, 0), 'bfs').path).toBeNull();
  });
});

describe('buildSearchTree', () => {
  it('visar dubbletter och cykler i trädsökning', () => {
    const t = buildSearchTree(cyclic, 'A', 3);
    expect(countTreeNodes(t)).toBeGreaterThan(cyclic.nodes.length);
    const flat: { id: string; rep: boolean }[] = [];
    const walk = (n: typeof t) => {
      flat.push({ id: n.id, rep: n.repeatsAncestor });
      n.children.forEach(walk);
    };
    walk(t);
    expect(flat.some((x) => x.rep && x.id === 'A')).toBe(true);
  });
});
