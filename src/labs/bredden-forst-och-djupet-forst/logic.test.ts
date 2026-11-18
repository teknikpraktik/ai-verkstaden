import { describe, expect, it } from 'vitest';
import { cellName, parseMaze, runMaze, scenarios, summarize, toggleWall } from './logic';
import { cellId } from '../../lib/search';

describe('labb 7: BFS och DFS', () => {
  const maze = parseMaze([...scenarios.labyrint.lines]);

  it('läser labyrinten', () => {
    expect(maze.start).toBe(cellId(0, 0));
    expect(maze.goal).toBe(cellId(4, 4));
    expect(cellName(maze.goal)).toBe('E5');
  });

  it('BFS hittar en kortare väg än DFS i labyrinten (siffror som används i labbens text)', () => {
    const s = summarize(maze);
    expect(s.bfs.steps).toBe(12);
    expect(s.dfs.steps).toBe(24);
    expect(s.bfs.expanded).toBe(36);
    expect(s.dfs.expanded).toBe(27);
    expect(s.dfs.steps).toBeGreaterThan(s.bfs.steps!);
    expect(s.bfs.steps).toBe(s.cheapest.steps);
  });

  it('i leran ger BFS färre steg men högre kostnad än billigaste vägen', () => {
    const mud = parseMaze([...scenarios.lera.lines]);
    const s = summarize(mud);
    expect(s.bfs.steps).toBe(6);
    expect(s.bfs.cost).toBe(26);
    expect(s.cheapest.cost).toBe(8);
    expect(s.cheapest.steps).toBe(8);
  });

  it('stängd labyrint ger "ingen väg"', () => {
    let m = parseMaze(['S#M']);
    expect(runMaze(m, 'bfs').path).toBeNull();
    m = toggleWall(m, 0, 1);
    expect(runMaze(m, 'bfs').path?.length).toBe(3);
  });

  it('start och mål kan inte bli väggar', () => {
    const m = toggleWall(maze, 0, 0);
    expect(m.walls[0]![0]).toBe(false);
  });
});
