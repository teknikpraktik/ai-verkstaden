import { describe, expect, it } from 'vitest';
import { cellId } from '../../lib/search';
import { cellName, isWorld, parseScenario, plan, scenarios, sense, simulateRoute, toggleActual } from './logic';

const run = (id: keyof typeof scenarios, range: number) => simulateRoute(parseScenario(scenarios[id].lines), range);

describe('labb 20: planera och planera om', () => {
  it('läser karta och verklighet ur samma text', () => {
    const w = parseScenario(scenarios.pall.lines);
    expect(cellName(w.start)).toBe('F2');
    expect(cellName(w.goal)).toBe('F7');
    expect(w.map[4]![5]).toBe(false); // pallen finns inte på kartan
    expect(w.actual[4]![5]).toBe(true);
    const o = parseScenario(scenarios.oppnad.lines);
    expect(o.map[2]![5]).toBe(true); // dörren stängd på kartan
    expect(o.actual[2]![5]).toBe(false);
  });

  it('sensorn ser fyra strålar och inte genom hinder', () => {
    const w = parseScenario(scenarios.pall.lines);
    const seen = sense(w.actual, cellId(2, 5), 2);
    expect(seen).toContain(cellId(4, 5)); // pallen två rutor ned
    expect(seen).not.toContain(cellId(5, 5)); // bakom pallen
    expect(seen).toContain(cellId(2, 4)); // hyllan till vänster (vägg) syns men inget bakom
    expect(seen).not.toContain(cellId(2, 3));
  });

  it('pallen, räckvidd 2: första planen 5 steg, stopp i F3, ny väg 14 steg, totalt 15 steg', () => {
    const r = run('pall', 2);
    expect(r.outcome).toBe('framme');
    expect(r.firstPlan).toBe(5);
    expect(r.moves).toBe(15);
    expect(r.replans).toBe(1);
    expect(r.optimal).toBe(13);
    const stop = r.frames.find((f) => f.kind === 'upptackt')!;
    expect(cellName(stop.pos)).toBe('F3');
    expect(stop.newChanges).toEqual([{ cell: cellId(4, 5), kind: 'nytt' }]);
    const re = r.frames.find((f) => f.kind === 'omplanering')!;
    expect(re.plan!.length - 1).toBe(14);
    expect(re.message).toContain('10 steg längre');
  });

  it('pallen: längre räckvidd ger kortare total väg (17, 15, 13, 13)', () => {
    expect([1, 2, 3, 4].map((k) => run('pall', k).moves)).toEqual([17, 15, 13, 13]);
  });

  it('den stängda dörren: stopp i F2, 23 steg totalt – lika långt som med rätt karta', () => {
    const r = run('stangd', 2);
    expect(r.firstPlan).toBe(11);
    expect(r.moves).toBe(23);
    expect(r.optimal).toBe(23);
    expect(cellName(r.frames.find((f) => f.kind === 'upptackt')!.pos)).toBe('F2');
  });

  it('dörren som öppnats: omvägen 23 steg blir 11 steg (12 kortare)', () => {
    const r = run('oppnad', 2);
    expect(r.firstPlan).toBe(23);
    expect(r.moves).toBe(11);
    expect(r.replans).toBe(1);
    const d = r.frames.find((f) => f.kind === 'upptackt')!;
    expect(d.newChanges[0]!.kind).toBe('borta');
    expect(r.frames.find((f) => f.kind === 'omplanering')!.message).toContain('12 steg kortare');
  });

  it('ingen väg: roboten stannar i L2 efter 10 steg och larmar', () => {
    const r = run('ingenVag', 2);
    expect(r.outcome).toBe('ingen-vag');
    expect(r.moves).toBe(10);
    expect(r.optimal).toBeNull();
    const last = r.frames.at(-1)!;
    expect(last.kind).toBe('ingen-vag');
    expect(cellName(last.pos)).toBe('L2');
    expect(last.plan).toBeNull();
  });

  it('kantfall: ingen väg redan på kartan, start = mål och korrekt karta', () => {
    const blocked = simulateRoute(parseScenario(['#####', '#S#M#', '#####']), 2);
    expect(blocked.outcome).toBe('ingen-vag');
    expect(blocked.frames).toHaveLength(1);
    const exact = simulateRoute(parseScenario(['#####', '#S.M#', '#####']), 2);
    expect(exact.moves).toBe(2);
    expect(exact.replans).toBe(0);
  });

  it('plan ger kortaste väg på kartan', () => {
    const w = parseScenario(scenarios.pall.lines);
    expect(plan(w.map, w.start, w.goal)!.length - 1).toBe(5);
    expect(plan(w.actual, w.start, w.goal)!.length - 1).toBe(13);
  });

  it('verkligheten kan ändras, men inte start, mål eller ytterväggar', () => {
    const w = parseScenario(scenarios.pall.lines);
    expect(toggleActual(w, 4, 5).actual[4]![5]).toBe(false);
    expect(toggleActual(w, 0, 5)).toBe(w);
    expect(toggleActual(w, 1, 5)).toBe(w);
    // ta bort pallen: då stämmer kartan och roboten kör 5 steg utan omplanering
    const r = simulateRoute(toggleActual(w, 4, 5), 2);
    expect(r.moves).toBe(5);
    expect(r.replans).toBe(0);
  });

  it('validerar sparad data', () => {
    expect(isWorld(parseScenario(scenarios.pall.lines))).toBe(true);
    expect(isWorld({ rows: 2, cols: 2, map: [[false]], actual: [], start: 'a', goal: 'b' })).toBe(false);
    expect(isWorld(null)).toBe(false);
  });
});
