import { describe, expect, it } from 'vitest';
import { admissible, heuristic, isConsistent, optimalCost, run, scenarios, summarize, straightLine, type MapScenario } from './logic';

const karta: MapScenario = scenarios.karta;
const lurig: MapScenario = scenarios.lurig;

describe('labb 8: kostnad och ledtråd', () => {
  it('vägarna är minst fågelvägen och h är konsistent och tillåten på kartan', () => {
    for (const r of karta.roads) expect(r.cost).toBeGreaterThanOrEqual(straightLine(karta, r.a, r.b));
    expect(isConsistent(karta, 'standard')).toBe(true);
    expect(admissible(karta, 'standard')).toBe(true);
    expect(isConsistent(karta, 'noll')).toBe(true);
    expect(admissible(karta, 'tredubbel')).toBe(false);
  });

  it('h-värden som används i labbens text', () => {
    const h = heuristic(karta, 'standard');
    expect(h('ekeby')).toBe(310);
    expect(h('bjorkas')).toBe(237);
    expect(h('hagby')).toBe(240);
    expect(h('sjovik')).toBe(158);
    expect(h('granberga')).toBe(144);
    expect(h('lindvik')).toBe(0);
  });

  it('jämförelsen på kartan (siffror i labbens text)', () => {
    const [ucs, greedy, astar] = summarize(karta, 'standard');
    expect(ucs!.path).toBe('Ekeby → Hagby → Granberga → Lindvik');
    expect(ucs!.cost).toBe(375);
    expect(ucs!.expanded).toBe(8);
    expect(greedy!.path).toBe('Ekeby → Björkås → Sjövik → Lindvik');
    expect(greedy!.cost).toBe(450);
    expect(greedy!.expanded).toBe(4);
    expect(astar!.path).toBe(ucs!.path);
    expect(astar!.cost).toBe(375);
    expect(astar!.expanded).toBe(6);
    expect(astar!.explored).toBe('Ekeby, Björkås, Hagby, Sjövik, Granberga, Lindvik');
    expect(optimalCost(karta)).toBe(375);
  });

  it('A*: f = g + h när Sjövik läggs till', () => {
    const r = run(karta, 'astar', 'standard');
    const f = r.frames.find((fr) => fr.added.includes('sjovik'))!;
    const item = f.frontier.find((x) => x.id === 'sjovik')!;
    expect(item.g).toBe(210);
    expect(item.h).toBe(158);
    expect(item.f).toBe(368);
    const fg = r.frames.find((fr) => fr.added.includes('granberga'))!.frontier.find((x) => x.id === 'granberga')!;
    expect(fg.f).toBe(369);
    expect(fg.g).toBe(225);
    const fl = r.frames.find((fr) => fr.added.includes('lindvik'))!.frontier.find((x) => x.id === 'lindvik')!;
    expect(fl.f).toBe(450);
    // Uniformkostnad: Tallmo och Åsa har g = 90 och 95
    const u = run(karta, 'ucs', 'standard');
    expect(u.explored.slice(0, 3)).toEqual(['ekeby', 'tallmo', 'asa']);
  });

  it('A* med h = 0 beter sig som uniformkostnadssökning', () => {
    const a = run(karta, 'astar', 'noll');
    const u = run(karta, 'ucs', 'noll');
    expect(a.explored).toEqual(u.explored);
    expect(a.cost).toBe(375);
  });

  it('överskattande h (3 × fågelvägen) ger A* en dyrare väg', () => {
    const r = run(karta, 'astar', 'tredubbel');
    expect(r.cost).toBe(450);
  });

  it('lurig ledtråd: tillåten men inte konsistent – den här A*-implementationen missar billigaste vägen', () => {
    expect(admissible(lurig, 'standard')).toBe(true);
    expect(isConsistent(lurig, 'standard')).toBe(false);
    expect(optimalCost(lurig)).toBe(7);
    const r = run(lurig, 'astar', 'standard');
    expect(r.cost).toBe(9);
    expect(r.path).toEqual(['alby', 'borg', 'viken']);
    // med h = 0 (konsistent) hittas billigaste vägen
    expect(run(lurig, 'astar', 'noll').cost).toBe(7);
  });
});
