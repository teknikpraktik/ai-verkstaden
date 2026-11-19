/**
 * Påhittat scenario: Åsens gymnasium (påhittat, 1 000 elever) i en påhittad
 * kommun använder en AI-assistent under ett läsår. Labben räknar fram energi,
 * utsläpp, vatten och kostnad ur uttalade antaganden. Varje antagande har ett
 * lågt värde, ett huvudvärde och ett högt värde – siffrorna är mycket osäkra.
 *
 * "lag" betyder alltid det värde som ger LÄGST resultat och "hog" det som ger
 * HÖGST resultat (för livslängden är det alltså tvärtom mot talets storlek).
 *
 * Källor och kontrollstatus för varje antagande står i teacher.ts (sources)
 * och i labbens text. Värden utan källa är tydligt märkta undervisningsantaganden.
 */

export type Level = 'lag' | 'bas' | 'hog';
export type ModelId = 'liten' | 'stor' | 'resonerande';
export type MixId = 'norden' | 'varlden';
export type AssumptionId = 'perFraga' | 'perBild' | 'traning' | 'livstid' | 'elmix' | 'vatten';

export interface Triple {
  lag: number;
  bas: number;
  hog: number;
}

export const levels: Level[] = ['lag', 'bas', 'hog'];
export const levelName: Record<Level, string> = { lag: 'Lågt', bas: 'Huvudvärde', hog: 'Högt' };

export const SCHOOL_DAYS = 180;
export const SCHOOL_WEEKS = 36;

export const models: { id: ModelId; name: string; detail: string }[] = [
  { id: 'liten', name: 'Liten språkmodell', detail: 'Klarar enkla frågor, kräver lite beräkning per svar.' },
  { id: 'stor', name: 'Stor språkmodell', detail: 'Vanlig stor chattmodell, ett vanligt textsvar.' },
  { id: 'resonerande', name: 'Stor modell som ”resonerar” länge', detail: 'Skriver långa mellansteg innan svaret – många fler beräkningar.' },
];

export const mixes: { id: MixId; name: string }[] = [
  { id: 'norden', name: 'Datacenter i Norden (nordisk elmix)' },
  { id: 'varlden', name: 'Datacenter med världsgenomsnittlig el' },
];

/** Energi per textfråga i Wh. */
export const whPerQuestion: Record<ModelId, Triple> = {
  liten: { lag: 0.02, bas: 0.05, hog: 0.1 },
  stor: { lag: 0.15, bas: 0.3, hog: 0.6 },
  resonerande: { lag: 1, bas: 4, hog: 10 },
};

/** Energi per genererad bild i Wh. */
export const whPerImage: Triple = { lag: 0.5, bas: 3, hog: 11.5 };

/** Energi för att träna modellen en gång, i MWh. */
export const trainingMWh: Record<ModelId, Triple> = {
  liten: { lag: 10, bas: 100, hog: 1000 },
  stor: { lag: 1000, bas: 10000, hog: 50000 },
  resonerande: { lag: 1000, bas: 10000, hog: 50000 },
};

/** Antal frågor som modellen besvarar under hela sin livstid (alla användare i världen). lag = flest frågor = lägst andel per fråga. */
export const lifetimeQuestions: Triple = { lag: 1e12, bas: 1e11, hog: 2e10 };

/** Utsläpp per kWh el, g CO₂e/kWh. */
export const gramsPerKWh: Record<MixId, Triple> = {
  norden: { lag: 20, bas: 90, hog: 210 },
  varlden: { lag: 380, bas: 470, hog: 560 },
};

/** Vatten som avdunstar vid kylning i datacentret, liter per kWh. */
export const litresPerKWh: Triple = { lag: 0.2, bas: 1, hog: 2 };

/** Vardagsjämförelser (undervisningsantaganden, avrundade). */
export const KETTLE_KWH_PER_LITRE = 0.1;
export const PHONE_CHARGE_WH = 15;
export const CAR_KG_PER_KM = 0.15;

/** Ekonomi (påhittade eller avrundade undervisningsantaganden). */
export const ELECTRICITY_KR_PER_KWH = 1.5;
export const LICENSE_KR_PER_STUDENT = 400;

/** Nyttosidan: AI-styrd värme i skolans byggnader (påhittat exempel). */
export const HEATING = {
  /** Skolans värmeanvändning per år, kWh (påhittad). */
  heatKWh: 1_000_000,
  /** Andel som AI-styrningen sparar. */
  saving: { lag: 0.02, bas: 0.05, hog: 0.1 } as Triple,
  /** Utsläpp per kWh värme (fjärrvärme), g CO₂e/kWh. */
  heatGramsPerKWh: 60,
  heatKrPerKWh: 1,
  /** Styrsystemets egen elanvändning, kWh per år. */
  systemKWh: 1000,
  licenseKr: 60_000,
};

export const assumptions: { id: AssumptionId; name: string; unit: string; affects: 'co2' | 'vatten' }[] = [
  { id: 'perFraga', name: 'Energi per fråga', unit: 'Wh', affects: 'co2' },
  { id: 'perBild', name: 'Energi per bild', unit: 'Wh', affects: 'co2' },
  { id: 'traning', name: 'Energi för träningen', unit: 'MWh', affects: 'co2' },
  { id: 'livstid', name: 'Antal frågor under modellens livstid', unit: 'frågor', affects: 'co2' },
  { id: 'elmix', name: 'Elmixen (utsläpp per kWh)', unit: 'g CO₂e/kWh', affects: 'co2' },
  { id: 'vatten', name: 'Vatten per kWh', unit: 'liter/kWh', affects: 'vatten' },
];

export type Levels = Record<AssumptionId, Level>;
export const baseLevels: Levels = { perFraga: 'bas', perBild: 'bas', traning: 'bas', livstid: 'bas', elmix: 'bas', vatten: 'bas' };
export const allLevels = (l: Level): Levels => ({ perFraga: l, perBild: l, traning: l, livstid: l, elmix: l, vatten: l });

export interface Settings {
  students: number;
  questionsPerDay: number;
  imagesPerWeek: number;
  model: ModelId;
  mix: MixId;
  heating: boolean;
  levels: Levels;
}

export const baseSettings: Settings = {
  students: 1000,
  questionsPerDay: 10,
  imagesPerWeek: 2,
  model: 'stor',
  mix: 'norden',
  heating: false,
  levels: baseLevels,
};

export const LIMITS = {
  students: { min: 0, max: 5000, step: 100 },
  questionsPerDay: { min: 0, max: 100, step: 1 },
  imagesPerWeek: { min: 0, max: 50, step: 1 },
};

/** Värdet för ett antagande givet modell, elmix och nivå. */
export function assumptionValue(id: AssumptionId, level: Level, model: ModelId, mix: MixId): number {
  switch (id) {
    case 'perFraga':
      return whPerQuestion[model][level];
    case 'perBild':
      return whPerImage[level];
    case 'traning':
      return trainingMWh[model][level];
    case 'livstid':
      return lifetimeQuestions[level];
    case 'elmix':
      return gramsPerKWh[mix][level];
    case 'vatten':
      return litresPerKWh[level];
  }
}

export interface HeatingResult {
  savedKWh: number;
  savedKg: number;
  savedKr: number;
  systemKWh: number;
  systemKg: number;
  /** Netto utsläpp: styrsystemets el minus sparad värme (negativt = minskning). */
  netKg: number;
  netKr: number;
}

export interface Result {
  questions: number;
  images: number;
  whPerQuestion: number;
  whPerImage: number;
  /** Träningens energi fördelad per fråga, Wh. */
  trainingWhPerQuestion: number;
  gramsPerKWh: number;
  kWh: { fragor: number; bilder: number; traning: number; total: number };
  co2Kg: number;
  waterL: number;
  electricityKr: number;
  licenseKr: number;
  kettleLitres: number;
  phoneCharges: number;
  carKm: number;
  /** Wh per elev och skoldag (0 om inga elever). */
  whPerStudentDay: number;
  heating: HeatingResult | null;
}

const clampInt = (v: number, min: number, max: number) => (Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : min);

export function sanitize(s: Settings): Settings {
  return {
    ...s,
    students: clampInt(s.students, LIMITS.students.min, LIMITS.students.max),
    questionsPerDay: clampInt(s.questionsPerDay, LIMITS.questionsPerDay.min, LIMITS.questionsPerDay.max),
    imagesPerWeek: clampInt(s.imagesPerWeek, LIMITS.imagesPerWeek.min, LIMITS.imagesPerWeek.max),
  };
}

export function heatingResult(level: Level, g: number): HeatingResult {
  const savedKWh = HEATING.heatKWh * HEATING.saving[level];
  const savedKg = (savedKWh * HEATING.heatGramsPerKWh) / 1000;
  const systemKg = (HEATING.systemKWh * g) / 1000;
  const savedKr = savedKWh * HEATING.heatKrPerKWh;
  return {
    savedKWh,
    savedKg,
    savedKr,
    systemKWh: HEATING.systemKWh,
    systemKg,
    netKg: systemKg - savedKg,
    netKr: HEATING.licenseKr + HEATING.systemKWh * ELECTRICITY_KR_PER_KWH - savedKr,
  };
}

export function calculate(input: Settings): Result {
  const s = sanitize(input);
  const v = (id: AssumptionId) => assumptionValue(id, s.levels[id], s.model, s.mix);
  const questions = s.students * s.questionsPerDay * SCHOOL_DAYS;
  const images = s.students * s.imagesPerWeek * SCHOOL_WEEKS;
  const wq = v('perFraga');
  const wi = v('perBild');
  const trainingWhPerQuestion = (v('traning') * 1e6) / v('livstid');
  const g = v('elmix');
  const fragor = (questions * wq) / 1000;
  const bilder = (images * wi) / 1000;
  const traning = (questions * trainingWhPerQuestion) / 1000;
  const total = fragor + bilder + traning;
  const co2Kg = (total * g) / 1000;
  return {
    questions,
    images,
    whPerQuestion: wq,
    whPerImage: wi,
    trainingWhPerQuestion,
    gramsPerKWh: g,
    kWh: { fragor, bilder, traning, total },
    co2Kg,
    waterL: total * v('vatten'),
    electricityKr: total * ELECTRICITY_KR_PER_KWH,
    licenseKr: s.students * LICENSE_KR_PER_STUDENT,
    kettleLitres: total / KETTLE_KWH_PER_LITRE,
    phoneCharges: (total * 1000) / PHONE_CHARGE_WH,
    carKm: co2Kg / CAR_KG_PER_KM,
    whPerStudentDay: s.students > 0 ? (total * 1000) / (s.students * SCHOOL_DAYS) : 0,
    heating: s.heating ? heatingResult('bas', g) : null,
  };
}

/** Hela spannet: alla antaganden lågt respektive högt samtidigt. */
export function span(s: Settings): { lag: Result; hog: Result } {
  return { lag: calculate({ ...s, levels: allLevels('lag') }), hog: calculate({ ...s, levels: allLevels('hog') }) };
}

export interface Sensitivity {
  id: AssumptionId;
  name: string;
  lagKg: number;
  hogKg: number;
  /** Hur mycket utsläppen kan skilja, kg CO₂e. */
  spreadKg: number;
}

/** Ett antagande i taget: övriga står kvar på sina nuvarande nivåer. Sorterad med störst spridning först. */
export function sensitivity(s: Settings): Sensitivity[] {
  return assumptions
    .filter((a) => a.affects === 'co2')
    .map((a) => {
      const lagKg = calculate({ ...s, levels: { ...s.levels, [a.id]: 'lag' } }).co2Kg;
      const hogKg = calculate({ ...s, levels: { ...s.levels, [a.id]: 'hog' } }).co2Kg;
      return { id: a.id, name: a.name, lagKg, hogKg, spreadKg: hogKg - lagKg };
    })
    .sort((a, b) => b.spreadKg - a.spreadKg);
}

/** Träning mot användning för en modell under hela livstiden (huvudvärden). */
export function trainingVsUse(model: ModelId, lifetime: number) {
  const trainMWh = trainingMWh[model].bas;
  const useMWh = (lifetime * whPerQuestion[model].bas) / 1e6;
  return { trainMWh, useMWh, trainingWhPerQuestion: lifetime > 0 ? (trainMWh * 1e6) / lifetime : Infinity };
}

export const lifetimeExamples = [1e6, 1e9, 1e11];

/**
 * Rekyleffekt: varje fråga blir billigare i energi (byte från stor till liten
 * modell), men användningen ökar. Gäller bara frågornas energi (kWh per år).
 */
export function rebound(students: number, before: { model: ModelId; perDay: number }, after: { model: ModelId; perDay: number }) {
  const kwh = (m: ModelId, perDay: number) => (students * perDay * SCHOOL_DAYS * whPerQuestion[m].bas) / 1000;
  const beforeKWh = kwh(before.model, before.perDay);
  const afterKWh = kwh(after.model, after.perDay);
  const efficiencyOnlyKWh = kwh(after.model, before.perDay);
  return { beforeKWh, afterKWh, efficiencyOnlyKWh, efficiency: whPerQuestion[before.model].bas / whPerQuestion[after.model].bas, useFactor: before.perDay > 0 ? after.perDay / before.perDay : Infinity };
}

export const REBOUND = { before: { model: 'stor' as ModelId, perDay: 10 }, after: { model: 'liten' as ModelId, perDay: 80 } };

/** Svensk talformatering med hårt mellanslag som tusentalsavgränsare. */
export function fmt(v: number, decimals = 0): string {
  if (!Number.isFinite(v)) return '–';
  const fixed = Math.abs(v).toFixed(decimals);
  const [int, dec] = fixed.split('.');
  const grouped = int!.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const sign = v < 0 && Number(fixed) !== 0 ? '−' : '';
  return `${sign}${grouped}${dec ? `,${dec}` : ''}`;
}

/** Avrundning till ett rimligt antal värdesiffror för osäkra tal. */
export function fmtRough(v: number): string {
  const a = Math.abs(v);
  if (a === 0) return '0';
  if (a < 0.1) return fmt(v, 3);
  if (a < 1) return fmt(v, 2);
  if (a < 10) return fmt(v, 1);
  return fmt(v, 0);
}

export function fmtCount(v: number): string {
  const unit = (n: number, one: string, many: string) => `${fmt(n, Number.isInteger(n) ? 0 : 1)} ${n === 1 ? one : many}`;
  if (v >= 1e9) return unit(v / 1e9, 'miljard', 'miljarder');
  if (v >= 1e6) return unit(v / 1e6, 'miljon', 'miljoner');
  return fmt(v);
}

// Validering av sparade värden.
const isLevel = (v: unknown): v is Level => v === 'lag' || v === 'bas' || v === 'hog';
export const isModel = (v: unknown): v is ModelId => models.some((m) => m.id === v);
export const isMix = (v: unknown): v is MixId => mixes.some((m) => m.id === v);
export const isAssumption = (v: unknown): v is AssumptionId => assumptions.some((a) => a.id === v);
export const isLevels = (v: unknown): v is Levels =>
  typeof v === 'object' && v !== null && assumptions.every((a) => isLevel((v as Record<string, unknown>)[a.id]));
export const isSettings = (v: unknown): v is Settings => {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.students === 'number' &&
    typeof o.questionsPerDay === 'number' &&
    typeof o.imagesPerWeek === 'number' &&
    isModel(o.model) &&
    isMix(o.mix) &&
    typeof o.heating === 'boolean' &&
    isLevels(o.levels)
  );
};
export const isProbe = (v: unknown): v is { id: AssumptionId; level: Level } =>
  typeof v === 'object' && v !== null && isAssumption((v as { id?: unknown }).id) && isLevel((v as { level?: unknown }).level);
export const isPerDay = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= LIMITS.questionsPerDay.min && v <= LIMITS.questionsPerDay.max;
