import { describe, expect, it } from 'vitest';
import {
  allLevels,
  assumptions,
  baseLevels,
  baseSettings,
  calculate,
  fmt,
  fmtCount,
  fmtRough,
  gramsPerKWh,
  heatingResult,
  isLevels,
  isPerDay,
  isProbe,
  isSettings,
  lifetimeExamples,
  lifetimeQuestions,
  REBOUND,
  rebound,
  sanitize,
  sensitivity,
  span,
  trainingMWh,
  trainingVsUse,
  whPerImage,
  whPerQuestion,
  type Settings,
} from './logic';

describe('antagandena', () => {
  it('varje intervall är ordnat så att lågt ger lägst och högt högst resultat', () => {
    for (const t of [...Object.values(whPerQuestion), whPerImage, ...Object.values(trainingMWh), ...Object.values(gramsPerKWh)]) {
      expect(t.lag).toBeLessThan(t.bas);
      expect(t.bas).toBeLessThan(t.hog);
    }
    // Fler frågor under livstiden ger lägre andel per fråga.
    expect(lifetimeQuestions.lag).toBeGreaterThan(lifetimeQuestions.bas);
    expect(lifetimeQuestions.bas).toBeGreaterThan(lifetimeQuestions.hog);
  });
});

describe('huvudscenariot (1 000 elever, 10 frågor per dag, 2 bilder per vecka, stor modell, nordisk elmix)', () => {
  const r = calculate(baseSettings);

  it('räknar antal frågor och bilder per läsår', () => {
    expect(r.questions).toBe(1_800_000);
    expect(r.images).toBe(72_000);
  });

  it('ger 540 + 216 + 180 = 936 kWh', () => {
    expect(r.kWh.fragor).toBeCloseTo(540, 6);
    expect(r.kWh.bilder).toBeCloseTo(216, 6);
    expect(r.trainingWhPerQuestion).toBeCloseTo(0.1, 9);
    expect(r.kWh.traning).toBeCloseTo(180, 6);
    expect(r.kWh.total).toBeCloseTo(936, 6);
  });

  it('ger ca 84 kg CO₂e, 936 liter vatten och vardagsjämförelser', () => {
    expect(r.co2Kg).toBeCloseTo(84.24, 6);
    expect(fmt(r.co2Kg)).toBe('84');
    expect(r.waterL).toBeCloseTo(936, 6);
    expect(r.kettleLitres).toBeCloseTo(9360, 6);
    expect(r.phoneCharges).toBeCloseTo(62_400, 6);
    expect(r.carKm).toBeCloseTo(561.6, 6);
    expect(r.whPerStudentDay).toBeCloseTo(5.2, 9);
  });

  it('ekonomi: elen kostar ca 1 400 kr medan licensen kostar 400 000 kr', () => {
    expect(r.electricityKr).toBeCloseTo(1404, 6);
    expect(r.licenseKr).toBe(400_000);
    expect(r.heating).toBeNull();
  });

  it('enhetsomvandling: 10 frågor × 1 000 elever × 0,3 Wh = 3 kWh per dag', () => {
    expect((r.questions / 180) * r.whPerQuestion / 1000).toBeCloseTo(3, 9);
  });
});

describe('osäkerhet', () => {
  it('hela spannet går från ca 6 till ca 1 346 kg CO₂e', () => {
    const { lag, hog } = span(baseSettings);
    expect(lag.kWh.total).toBeCloseTo(307.8, 6);
    expect(lag.co2Kg).toBeCloseTo(6.156, 6);
    expect(hog.kWh.total).toBeCloseTo(6408, 6);
    expect(hog.co2Kg).toBeCloseTo(1345.68, 6);
  });

  it('ett antagande i taget: elmixen påverkar mest i det nordiska huvudscenariot', () => {
    const s = sensitivity(baseSettings);
    expect(s).toHaveLength(5);
    expect(s[0]!.id).toBe('elmix');
    expect(s[0]!.lagKg).toBeCloseTo(18.72, 6);
    expect(s[0]!.hogKg).toBeCloseTo(196.56, 6);
    expect(s[0]!.spreadKg).toBeCloseTo(177.84, 6);
    const by = Object.fromEntries(s.map((x) => [x.id, x]));
    expect(by.perFraga!.spreadKg).toBeCloseTo(72.9, 6);
    expect(by.perBild!.spreadKg).toBeCloseTo(71.28, 6);
    expect(by.traning!.spreadKg).toBeCloseTo(79.38, 6);
    expect(by.livstid!.spreadKg).toBeCloseTo(79.38, 6);
    // Spridningen för elmixen är mer än dubbelt så stor som för något annat antagande.
    expect(s[0]!.spreadKg).toBeGreaterThan(2 * s[1]!.spreadKg);
  });

  it('med världsgenomsnittlig el är det i stället träningen/livslängden som påverkar mest', () => {
    const s = sensitivity({ ...baseSettings, mix: 'varlden' });
    expect(['traning', 'livstid']).toContain(s[0]!.id);
    expect(calculate({ ...baseSettings, mix: 'varlden' }).co2Kg).toBeCloseTo(439.92, 6);
  });

  it('ett ändrat antagande ändrar bara sin egen del', () => {
    const r = calculate({ ...baseSettings, levels: { ...baseLevels, perBild: 'hog' } });
    expect(r.kWh.fragor).toBeCloseTo(540, 6);
    expect(r.kWh.bilder).toBeCloseTo(828, 6);
    expect(r.kWh.total).toBeCloseTo(1548, 6);
  });

  it('vattnet påverkar inte utsläppen', () => {
    const r = calculate({ ...baseSettings, levels: { ...baseLevels, vatten: 'hog' } });
    expect(r.waterL).toBeCloseTo(1872, 6);
    expect(r.co2Kg).toBeCloseTo(84.24, 6);
  });
});

describe('träning mot användning', () => {
  it('ju fler gånger modellen används, desto mindre träningsenergi per fråga', () => {
    const rows = lifetimeExamples.map((n) => trainingVsUse('stor', n));
    expect(rows.map((r) => r.trainingWhPerQuestion)).toEqual([10_000, 10, 0.1]);
    expect(rows[0]!.useMWh).toBeCloseTo(0.3, 9);
    expect(rows[1]!.useMWh).toBeCloseTo(300, 9);
    expect(rows[2]!.useMWh).toBeCloseTo(30_000, 6);
    // Med 100 miljarder frågor drar användningen tre gånger så mycket som träningen.
    expect(rows[2]!.useMWh / rows[2]!.trainMWh).toBeCloseTo(3, 9);
  });

  it('noll användning ger oändlig andel per fråga utan att krascha', () => {
    expect(trainingVsUse('stor', 0).trainingWhPerQuestion).toBe(Infinity);
  });
});

describe('rekyleffekt', () => {
  it('liten modell (6 gånger effektivare) men 8 gånger fler frågor ger mer energi: 540 → 720 kWh', () => {
    const r = rebound(1000, REBOUND.before, REBOUND.after);
    expect(r.beforeKWh).toBeCloseTo(540, 6);
    expect(r.efficiencyOnlyKWh).toBeCloseTo(90, 6);
    expect(r.afterKWh).toBeCloseTo(720, 6);
    expect(r.efficiency).toBeCloseTo(6, 9);
    expect(r.useFactor).toBe(8);
  });
});

describe('nyttosidan: AI-styrd värme', () => {
  it('sparar 50 000 kWh värme och 3 000 kg CO₂e men kostar netto 11 500 kr', () => {
    const h = heatingResult('bas', 90);
    expect(h.savedKWh).toBeCloseTo(50_000, 6);
    expect(h.savedKg).toBeCloseTo(3000, 6);
    expect(h.systemKg).toBeCloseTo(90, 6);
    expect(h.netKg).toBeCloseTo(-2910, 6);
    expect(h.netKr).toBeCloseTo(11_500, 6);
    expect(heatingResult('lag', 90).savedKWh).toBeCloseTo(20_000, 6);
    expect(heatingResult('hog', 90).savedKWh).toBeCloseTo(100_000, 6);
  });

  it('kopplas in i resultatet när reglaget är på', () => {
    expect(calculate({ ...baseSettings, heating: true }).heating?.netKg).toBeCloseTo(-2910, 6);
  });
});

describe('kantfall', () => {
  it('noll användning ger noll överallt utom licensen', () => {
    const r = calculate({ ...baseSettings, questionsPerDay: 0, imagesPerWeek: 0 });
    expect(r.kWh.total).toBe(0);
    expect(r.co2Kg).toBe(0);
    expect(r.carKm).toBe(0);
    expect(r.licenseKr).toBe(400_000);
  });

  it('noll elever ger inga division med noll', () => {
    const r = calculate({ ...baseSettings, students: 0 });
    expect(r.kWh.total).toBe(0);
    expect(r.whPerStudentDay).toBe(0);
    expect(r.licenseKr).toBe(0);
  });

  it('extremvärden och ogiltiga tal kläms till gränserna', () => {
    const r = calculate({ ...baseSettings, students: 1e9, questionsPerDay: -5, imagesPerWeek: Number.NaN });
    expect(r.questions).toBe(0);
    expect(r.images).toBe(0);
    expect(sanitize({ ...baseSettings, students: 1e9 }).students).toBe(5000);
    const max = calculate({ ...baseSettings, students: 5000, questionsPerDay: 100, imagesPerWeek: 50, model: 'resonerande', levels: allLevels('hog') });
    expect(max.kWh.fragor).toBeCloseTo(900_000, 3);
    expect(Number.isFinite(max.co2Kg)).toBe(true);
  });
});

describe('formatering och validering', () => {
  it('formaterar svenska tal', () => {
    expect(fmt(62400)).toBe('62 400');
    expect(fmt(5.2, 1)).toBe('5,2');
    expect(fmt(-2910)).toBe('−2 910');
    expect(fmt(-0.2)).toBe('0');
    expect(fmt(Infinity)).toBe('–');
    expect(fmtRough(0.05)).toBe('0,050');
    expect(fmtRough(0.3)).toBe('0,30');
    expect(fmtRough(6.156)).toBe('6,2');
    expect(fmtRough(1345.68)).toBe('1 346');
    expect(fmtCount(1e11)).toBe('100 miljarder');
    expect(fmtCount(1.8e6)).toBe('1,8 miljoner');
    expect(fmtCount(1e6)).toBe('1 miljon');
    expect(fmtCount(2e10)).toBe('20 miljarder');
  });

  it('validerar sparade värden', () => {
    expect(isSettings(baseSettings)).toBe(true);
    expect(isSettings({ ...baseSettings, model: 'jätte' })).toBe(false);
    expect(isSettings({ ...baseSettings, levels: { perFraga: 'bas' } } as unknown as Settings)).toBe(false);
    expect(isSettings(null)).toBe(false);
    expect(isLevels(baseLevels)).toBe(true);
    expect(isProbe({ id: 'elmix', level: 'hog' })).toBe(true);
    expect(isProbe({ id: 'okänd', level: 'hog' })).toBe(false);
    expect(isPerDay(10)).toBe(true);
    expect(isPerDay(101)).toBe(false);
    expect(assumptions).toHaveLength(6);
  });
});
