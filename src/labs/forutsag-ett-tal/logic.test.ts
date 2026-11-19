import { describe, expect, it } from 'vitest';
import { fitLine, fmt, mse, newDays, predictLine, residuals, slopeIntercept, startLine, training } from './logic';

describe('labb 11: regression och medelkvadratfel', () => {
  it('startlinjen (platt, 60 glassar) har MSE 687,2 och residualen 44 vid 28 °C', () => {
    expect(mse(startLine, training)).toBeCloseTo(687.2, 6);
    const r = residuals(startLine, training);
    expect(r[training.findIndex((p) => p.x === 28)]).toBe(44);
  });

  it('den anpassade linjen: lutning 5,9 per grad, nivå 58,5 vid 20 °C, MSE 10,0', () => {
    const fit = fitLine(training)!;
    expect(fmt(fit.slope)).toBe('5,9');
    expect(fmt(fit.level)).toBe('58,5');
    expect(fmt(mse(fit, training))).toBe('10,0');
  });

  it('ingen linje har lägre MSE på träningsdata än den anpassade', () => {
    const fit = fitLine(training)!;
    const best = mse(fit, training);
    for (let level = 40; level <= 80; level += 0.5)
      for (let slope = 3; slope <= 9; slope += 0.1) expect(mse({ level, slope }, training)).toBeGreaterThanOrEqual(best - 1e-9);
    // Bästa läget som reglagen kan nå (heltal och halva steg) ligger nära
    expect(mse({ level: 58, slope: 6 }, training)).toBeCloseTo(10.4, 6);
  });

  it('extrapolering: −29,7 glassar vid 5 °C och 152,7 vid 36 °C', () => {
    const fit = fitLine(training)!;
    expect(fmt(predictLine(fit, 5))).toBe('−29,7');
    expect(fmt(predictLine(fit, 36))).toBe('152,7');
    expect(Math.round(mse(fit, newDays))).toBe(1027);
  });

  it('kantfall: tom data och bara ett x-värde', () => {
    expect(fitLine([])).toBeNull();
    expect(Number.isNaN(mse(startLine, []))).toBe(true);
    expect(fitLine([{ x: 20, y: 5 }, { x: 20, y: 7 }])).toEqual({ slope: 0, level: 6 });
  });

  it('fördjupningens siffror: k ≈ 5,88, m ≈ −59,2 och residualernas medelvärde 0', () => {
    const fit = fitLine(training)!;
    const { k, m } = slopeIntercept(fit);
    expect(fmt(k, 2)).toBe('5,88');
    expect(fmt(m)).toBe('−59,2');
    const r = residuals(fit, training);
    expect(r.reduce((s, v) => s + v, 0) / r.length).toBeCloseTo(0, 9);
  });

  it('omskrivning till y = kx + m', () => {
    expect(slopeIntercept({ level: 60, slope: 2 })).toEqual({ k: 2, m: 20 });
  });
});
