import { describe, expect, it } from 'vitest';
import {
  classroom,
  consequenceText,
  decide,
  freeAhead,
  isController,
  isSensor,
  isWorld,
  measure,
  noiseSequence,
  parseWorld,
  runPreset,
  simulate,
  toggleObstacle,
} from './logic';

describe('labb 19: sensor → styrprogram → motor', () => {
  const room = parseWorld(classroom);

  it('läser klassrummet och mäter fria rutor rakt fram', () => {
    expect(room.start).toEqual({ r: 1, c: 1, heading: 1 });
    expect(freeAhead(room, 1, 1, 1)).toBe(7); // B2 → I2
    expect(freeAhead(room, 1, 8, 1)).toBe(0);
    expect(freeAhead(room, 1, 3, 2)).toBe(0); // bänken under D2
  });

  it('mätning: räckvidd ger "inget hinder" och brus kan inte ge negativa värden', () => {
    expect(measure(2, 0, 3)).toBe(2);
    expect(measure(3, 0, 3)).toBeNull();
    expect(measure(0, -1, 3)).toBe(0);
    expect(measure(0, 1, 3)).toBe(1);
    expect(measure(2, 1, 3)).toBeNull();
    expect(measure(1, 0, 1)).toBeNull(); // sikt 1 ser bara rutan närmast
  });

  it('beslut: villkoret "mätvärde < gräns"', () => {
    const ctrl = { threshold: 1, closeAction: 'hoger', speed: 1 } as const;
    expect(decide(0, ctrl).decision).toBe('hoger');
    expect(decide(1, ctrl).decision).toBe('framat');
    expect(decide(null, ctrl).decision).toBe('framat');
    expect(decide(0, { ...ctrl, threshold: 0 }).decision).toBe('framat');
    expect(decide(0, ctrl).reason).toBe('0 < 1 → sväng höger');
  });

  it('bruset är reproducerbart och oberoende av brusnivån i vilka tal som dras', () => {
    expect(noiseSequence(5, 'lagt', 30)).toEqual(noiseSequence(5, 'lagt', 30));
    expect(noiseSequence(5, 'inget', 30).every((x) => x === 0)).toBe(true);
    const low = noiseSequence(5, 'lagt', 30);
    const high = noiseSequence(5, 'hogt', 30);
    // samma underliggande slumptal: tecknet kan aldrig vara motsatt
    low.forEach((v, i) => expect(v * high[i]!).toBeGreaterThanOrEqual(0));
  });

  it('grundprogrammet: 0 krockar på 30 steg, 22 besökta rutor; i steg 8 mäts 0 och roboten svänger', () => {
    const s = runPreset('grund');
    expect(s.collisions).toBe(0);
    expect(s.visitedCount).toBe(22);
    const r8 = s.records[7]!;
    expect(r8.measured).toBe(0);
    expect(r8.decision).toBe('hoger');
    expect(r8.after.heading).toBe(2);
    expect(consequenceText(r8)).toBe('vänder sig nedåt ▼');
  });

  it('väskan: roboten svänger redan i F2 (steg 5) och kör en mindre slinga', () => {
    const s = runPreset('hinder');
    expect(s.collisions).toBe(0);
    expect(s.visitedCount).toBe(12);
    expect(s.records[4]!.decision).toBe('hoger');
    expect([s.records[4]!.r, s.records[4]!.c]).toEqual([1, 5]);
  });

  it('gränsen 0: villkoret blir aldrig sant – 26 krockar, den första i steg 5', () => {
    const s = runPreset('nollgrans');
    expect(s.collisions).toBe(26);
    expect(s.records.find((r) => r.consequence === 'krock')?.step).toBe(5);
    expect(s.records.every((r) => r.decision === 'framat')).toBe(true);
  });

  it('fart 2: gräns 1 ger 4 krockar, gräns 2 ger 0', () => {
    expect(runPreset('snabb').collisions).toBe(4);
    expect(runPreset('snabbMarginal').collisions).toBe(0);
    expect(runPreset('snabbMarginal').visitedCount).toBe(20);
  });

  it('begränsad sikt: sikt 1 ger 4 krockar trots gräns 2', () => {
    const s = runPreset('kortSikt');
    expect(s.collisions).toBe(4);
    const crash = s.records.find((r) => r.consequence === 'krock')!;
    expect(crash.trueDistance).toBe(1);
    expect(crash.measured).toBeNull();
    expect(crash.moved).toBe(1);
  });

  it('lågt brus (startvärde 5): gräns 1 ger 3 krockar och 21 rutor, gräns 2 ger 0 krockar och 19 rutor', () => {
    const a = runPreset('brus');
    const b = runPreset('brusMarginal');
    expect(a.collisions).toBe(3);
    expect(a.visitedCount).toBe(21);
    expect(a.wrongReadings).toBe(7);
    expect(b.collisions).toBe(0);
    expect(b.visitedCount).toBe(19);
    const first = a.records.find((r) => r.consequence === 'krock')!;
    expect(first.step).toBe(13);
    expect(first.trueDistance).toBe(0);
    expect(first.measured).toBe(1);
    const crashes = a.records.filter((r) => r.consequence === 'krock');
    expect(crashes.every((r) => r.trueDistance === 0 && r.measured === 1)).toBe(true);
  });

  it('stanna: roboten står still framför väggen utan brus', () => {
    const s = simulate(room, { threshold: 1, closeAction: 'stanna', speed: 1 }, { range: 3, noise: 'inget', seed: 1 }, 12);
    expect(s.collisions).toBe(0);
    expect(s.records.at(-1)!.consequence).toBe('stilla');
    expect(s.frames).toHaveLength(13);
  });

  it('hinder kan läggas till, men inte på start eller ytterväggar', () => {
    const w = toggleObstacle(room, 1, 4);
    expect(w.walls[1]![4]).toBe(true);
    expect(toggleObstacle(room, 0, 4)).toBe(room);
    expect(toggleObstacle(room, 1, 1)).toBe(room);
    expect(freeAhead(w, 1, 1, 1)).toBe(2);
  });

  it('validerar sparad data', () => {
    expect(isWorld(room)).toBe(true);
    expect(isWorld({ rows: 'x' })).toBe(false);
    expect(isController({ threshold: 1, closeAction: 'hoger', speed: 1 })).toBe(true);
    expect(isController({ threshold: 1, closeAction: 'hopp', speed: 1 })).toBe(false);
    expect(isSensor({ range: 3, noise: 'lagt', seed: 5 })).toBe(true);
    expect(isSensor({ range: 0, noise: 'lagt', seed: 5 })).toBe(false);
  });
});
