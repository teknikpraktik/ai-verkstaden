import { describe, expect, it } from 'vitest';
import { byId, checkOrder, correctOrder, isOrder, milestones, milestonesWith, move, startOrder } from './logic';

describe('labb 2: milstolpar', () => {
  it('rätt ordning och årtal', () => {
    expect(correctOrder).toEqual(['dartmouth', 'eliza', 'expertsystem', 'deepblue', 'alexnet', 'alphago', 'transformer', 'chatgpt']);
    expect(byId.get('dartmouth')!.year).toBe(1956);
    expect(byId.get('eliza')!.year).toBe(1966);
    expect(byId.get('deepblue')!.year).toBe(1997);
    expect(byId.get('alexnet')!.year).toBe(2012);
    expect(byId.get('alphago')!.year).toBe(2016);
    expect(byId.get('transformer')!.year).toBe(2017);
    expect(byId.get('chatgpt')!.year).toBe(2022);
  });

  it('antal år i labbens räknefråga', () => {
    expect(byId.get('chatgpt')!.year - byId.get('dartmouth')!.year).toBe(66);
    expect(byId.get('chatgpt')!.year - byId.get('eliza')!.year).toBe(56);
  });

  it('startordningen är blandad och giltig', () => {
    expect(isOrder(startOrder)).toBe(true);
    const c = checkOrder(startOrder);
    expect(c.done).toBe(false);
    expect(c.correctPositions).toBe(0);
    expect(c.inversions).toBe(15);
    expect(c.firstSwap).toEqual(['chatgpt', 'eliza']);
  });

  it('rätt ordning ger inga fel', () => {
    expect(checkOrder(correctOrder)).toMatchObject({ done: true, inversions: 0, correctPositions: 8, firstSwap: null });
  });

  it('flytta upp och ned, men inte utanför listan', () => {
    expect(move(['a', 'b', 'c'], 1, -1)).toEqual(['b', 'a', 'c']);
    expect(move(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'c', 'b']);
    expect(move(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
    expect(move(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'b', 'c']);
    expect(move([], 0, 1)).toEqual([]);
  });

  it('ett byte i taget kan lösa uppgiften (bubbelsortering)', () => {
    let o = [...startOrder];
    let swaps = 0;
    for (let guard = 0; guard < 100 && checkOrder(o).firstSwap; guard++) {
      const [a] = checkOrder(o).firstSwap!;
      o = move(o, o.indexOf(a), 1);
      swaps++;
    }
    expect(checkOrder(o).done).toBe(true);
    expect(swaps).toBe(checkOrder(startOrder).inversions);
  });

  it('validerar sparad ordning', () => {
    expect(isOrder(['x'])).toBe(false);
    expect(isOrder([...startOrder.slice(1), startOrder[1]])).toBe(false);
    expect(isOrder(null)).toBe(false);
  });

  it('drivkrafter', () => {
    expect(milestonesWith('data')).toEqual(['alexnet', 'chatgpt']);
    expect(milestonesWith('berakning')).toEqual(['deepblue', 'alexnet', 'alphago', 'chatgpt']);
    for (const m of milestones) expect(Object.keys(m.drivers).length).toBeGreaterThan(0);
    expect(Object.keys(byId.get('chatgpt')!.drivers)).toHaveLength(4);
  });
});
