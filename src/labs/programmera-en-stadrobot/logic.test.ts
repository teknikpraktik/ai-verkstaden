import { describe, expect, it } from 'vitest';
import { blockedDirs, parseRoom, randomSummary, rooms, runRoom, simulate, stepToward, key, posName, cellsInSight } from './logic';

describe('labb 5: städrobot', () => {
  it('läser rummen', () => {
    const t = parseRoom(rooms.tomt.lines);
    expect(t.rows).toBe(5);
    expect(t.cols).toBe(6);
    expect(t.dirt).toHaveLength(5);
    expect(t.start).toEqual([0, 0]);
    const m = parseRoom(rooms.moblerat.lines);
    expect(m.dirt).toHaveLength(4);
    expect(m.blocked.flat().filter(Boolean)).toHaveLength(6);
    expect(posName([4, 5])).toBe('F5');
  });

  it('regelstyrd robot: siffror som används i labbens text', () => {
    const r0 = runRoom('tomt', { strategy: 'regler', sight: 0, seed: 1 });
    expect(r0.stepsToClean).toBe(32);
    expect(r0.frames.length - 1).toBe(35);
    expect(r0.stoppedBy).toBe('stannade');
    expect(runRoom('tomt', { strategy: 'regler', sight: 1, seed: 1 }).stepsToClean).toBe(24);
    const r2 = runRoom('tomt', { strategy: 'regler', sight: 2, seed: 1 });
    expect(r2.stepsToClean).toBe(22);
    expect(r2.frames.length - 1).toBe(23);
    expect(runRoom('moblerat', { strategy: 'regler', sight: 0, seed: 1 }).stepsToClean).toBe(31);
  });

  it('regelstyrd robot är deterministisk och oberoende av startvärdet', () => {
    const a = runRoom('moblerat', { strategy: 'regler', sight: 1, seed: 1 });
    const b = runRoom('moblerat', { strategy: 'regler', sight: 1, seed: 77 });
    expect(a.frames.map((f) => key(f.pos))).toEqual(b.frames.map((f) => key(f.pos)));
  });

  it('slumprobot: samma startvärde ger samma körning, siffror i texten', () => {
    const a = runRoom('tomt', { strategy: 'slump', sight: 0, seed: 1 });
    const b = runRoom('tomt', { strategy: 'slump', sight: 0, seed: 1 });
    expect(a.frames.map((f) => key(f.pos))).toEqual(b.frames.map((f) => key(f.pos)));
    expect(a.stepsToClean).toBe(88);
    expect(runRoom('moblerat', { strategy: 'slump', sight: 0, seed: 1 }).stepsToClean).toBe(201);
    const s = randomSummary('tomt', 0, Array.from({ length: 20 }, (_, i) => i + 1));
    expect(s.finished).toBe(18);
    expect(s.min).toBe(60);
    expect(s.max).toBe(236);
    const m = randomSummary('moblerat', 0, Array.from({ length: 20 }, (_, i) => i + 1));
    expect(m.finished).toBe(13);
    expect(m.min).toBe(39);
    expect(m.max).toBe(295);
  });

  it('slumproboten går aldrig in i möbler eller väggar', () => {
    const room = parseRoom(rooms.moblerat.lines);
    const r = simulate(room, { strategy: 'slump', sight: 0, seed: 5 });
    for (const f of r.frames) expect(room.blocked[f.pos[0]]![f.pos[1]]).toBe(false);
  });

  it('suger alltid när egna rutan är smutsig (regel 1)', () => {
    const r = simulate(parseRoom(['R*']), { strategy: 'regler', sight: 0, seed: 1 });
    expect(r.frames[1]!.action).toEqual({ type: 'ga', dir: 'O' });
    expect(r.frames[2]!.rule).toBe(0);
    expect(r.frames[2]!.action).toEqual({ type: 'suga' });
    expect(r.stepsToClean).toBe(2);
  });

  it('sensorer: hinder och sikt', () => {
    const room = parseRoom(rooms.moblerat.lines);
    expect(blockedDirs(room, [0, 0])).toEqual(['N', 'V']);
    expect(cellsInSight(room, [0, 0], 0)).toEqual([[0, 0]]);
    expect(cellsInSight(room, [0, 0], 1)).toHaveLength(3);
    expect(stepToward(room, [0, 0], new Set())).toBeNull();
  });

  it('kantfall: rum utan smuts och instängd smuts', () => {
    const clean = simulate(parseRoom(['R..']), { strategy: 'regler', sight: 0, seed: 1 });
    expect(clean.stepsToClean).toBe(0);
    expect(clean.stoppedBy).toBe('stannade');
    const cleanRandom = simulate(parseRoom(['R..']), { strategy: 'slump', sight: 0, seed: 1 });
    expect(cleanRandom.frames).toHaveLength(1);
    const unreachable = simulate(parseRoom(['R.#*']), { strategy: 'regler', sight: 3, seed: 1, maxSteps: 50 });
    expect(unreachable.stepsToClean).toBeNull();
    expect(unreachable.stoppedBy).toBe('stannade');
  });
});
