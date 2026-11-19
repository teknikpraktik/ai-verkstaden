import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { _resetStorageForTests, clearAll, listKeys, PREFIX, readJSON, removeKey, removePrefix, storageAvailable, writeJSON } from './storage';
import { correctCount, forgetLab, getLastLab, getProgress, labKey, markVisited, resetLab, setDone } from './progress';
import { createRng, gaussian, randInt, shuffle } from './random';

/** Enkel localStorage i minnet. `failWrites` simulerar full lagring. */
class FakeStorage {
  data = new Map<string, string>();
  failWrites = false;
  get length() {
    return this.data.size;
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    if (this.failWrites && !k.endsWith('__test')) throw new Error('QuotaExceededError');
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}

let fake: FakeStorage;

beforeEach(() => {
  fake = new FakeStorage();
  vi.stubGlobal('window', { localStorage: fake, dispatchEvent: () => true });
  _resetStorageForTests();
});

afterEach(() => {
  vi.unstubAllGlobals();
  _resetStorageForTests();
});

describe('storage', () => {
  it('skriver och läser JSON med prefix', () => {
    expect(storageAvailable()).toBe(true);
    writeJSON('a', { x: 1 });
    expect(fake.data.get(`${PREFIX}a`)).toBe('{"x":1}');
    expect(readJSON('a', null)).toEqual({ x: 1 });
  });

  it('trasig eller ogiltig data ger reservvärdet', () => {
    fake.data.set(`${PREFIX}b`, '{inte json');
    expect(readJSON('b', 7)).toBe(7);
    writeJSON('c', 'text');
    expect(readJSON('c', 0, (v): v is number => typeof v === 'number')).toBe(0);
  });

  it('när localStorage är full läses det senaste värdet från minnet, inte ett gammalt värde', () => {
    writeJSON('k', 1);
    fake.failWrites = true;
    writeJSON('k', 2);
    expect(fake.data.get(`${PREFIX}k`)).toBe('1');
    expect(readJSON('k', 0)).toBe(2);
    writeJSON('ny', 'bara i minnet');
    expect(readJSON('ny', '')).toBe('bara i minnet');
    removeKey('k');
    expect(readJSON('k', 0)).toBe(0);
    fake.failWrites = false;
    writeJSON('k', 3);
    expect(readJSON('k', 0)).toBe(3);
  });

  it('fungerar utan localStorage', () => {
    vi.stubGlobal('window', { dispatchEvent: () => true });
    _resetStorageForTests();
    expect(storageAvailable()).toBe(false);
    writeJSON('m', [1, 2]);
    expect(readJSON('m', [])).toEqual([1, 2]);
    expect(listKeys()).toEqual(['m']);
  });

  it('listKeys, removePrefix och clearAll rör bara AI-verkstadens nycklar', () => {
    fake.data.set('annan-sajt', 'x');
    writeJSON('lab:a:q:1', 1);
    writeJSON('lab:ab:q:1', 1);
    expect(listKeys('lab:a:').sort()).toEqual(['lab:a:q:1']);
    removePrefix('lab:a:');
    expect(listKeys('lab:').sort()).toEqual(['lab:ab:q:1']);
    clearAll();
    expect(listKeys()).toEqual([]);
    expect(fake.data.get('annan-sajt')).toBe('x');
  });
});

describe('progress', () => {
  it('besök, klarmarkering, börja om och glöm', () => {
    expect(getProgress('x')).toBeNull();
    markVisited('x');
    expect(getProgress('x')!.done).toBe(false);
    expect(getLastLab()).toBe('x');
    setDone('x', true);
    expect(getProgress('x')!.done).toBe(true);
    writeJSON(labKey('x', 'q:1'), { correct: true });
    writeJSON(labKey('x', 'q:2'), { correct: false });
    writeJSON(labKey('xy', 'q:1'), { correct: true });
    expect(correctCount('x')).toBe(1);
    resetLab('x');
    expect(correctCount('x')).toBe(0);
    expect(correctCount('xy')).toBe(1);
    expect(getProgress('x')).toMatchObject({ done: false });
    forgetLab('x');
    expect(getProgress('x')).toBeNull();
  });
});

describe('random', () => {
  it('samma startvärde ger samma följd, olika startvärden olika', () => {
    const a = createRng(5);
    const b = createRng(5);
    const xs = Array.from({ length: 5 }, () => a());
    expect(Array.from({ length: 5 }, () => b())).toEqual(xs);
    expect(createRng(6)()).not.toBe(xs[0]);
    for (const x of xs) expect(x >= 0 && x < 1).toBe(true);
  });

  it('randInt håller sig inom [min, max) och shuffle ändrar inte indata', () => {
    const rng = createRng(1);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(randInt(rng, 2, 5));
    expect([...seen].sort()).toEqual([2, 3, 4]);
    const items = [1, 2, 3, 4, 5];
    const s = shuffle(createRng(3), items);
    expect(items).toEqual([1, 2, 3, 4, 5]);
    expect([...s].sort()).toEqual(items);
  });

  it('gaussian har ungefär medelvärde 0 och rätt spridning', () => {
    const rng = createRng(9);
    const n = 20000;
    const xs = Array.from({ length: n }, () => gaussian(rng, 2));
    const mean = xs.reduce((s, x) => s + x, 0) / n;
    const sd = Math.sqrt(xs.reduce((s, x) => s + (x - mean) ** 2, 0) / n);
    expect(Math.abs(mean)).toBeLessThan(0.05);
    expect(sd).toBeGreaterThan(1.9);
    expect(sd).toBeLessThan(2.1);
  });
});
