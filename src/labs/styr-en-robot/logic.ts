import { createRng, gaussian } from '../../lib/random';

/**
 * Labb 19: en städrobot i ett rutnät med en avståndssensor som tittar rakt fram.
 *
 * Kedjan i varje steg:
 *   1. Sensorn mäter hur många fria rutor det finns rakt fram (med räckvidd och brus).
 *   2. Styrprogrammet jämför mätvärdet med en gräns och väljer en handling.
 *   3. Motorn utför handlingen – och världen avgör konsekvensen (flytt, sväng eller krock).
 *
 * Bruset är reproducerbart: varje steg drar exakt ett normalfördelat tal ur en
 * slumpföljd med ett givet startvärde. Samma startvärde ger alltså samma brus
 * oavsett vilka regler eleven väljer, så att jämförelser blir rättvisa.
 */

export type Heading = 0 | 1 | 2 | 3; // upp, höger, ned, vänster
export const arrows = ['▲', '▶', '▼', '◀'] as const;
export const headingNames = ['uppåt', 'åt höger', 'nedåt', 'åt vänster'] as const;
const dr = [-1, 0, 1, 0];
const dc = [0, 1, 0, -1];

export type CloseAction = 'hoger' | 'vanster' | 'stanna';
export type Decision = 'framat' | CloseAction;
export type NoiseLevel = 'inget' | 'lagt' | 'hogt';

export const noiseSd: Record<NoiseLevel, number> = { inget: 0, lagt: 0.6, hogt: 1.2 };
export const noiseNames: Record<NoiseLevel, string> = { inget: 'Inget brus', lagt: 'Lågt brus', hogt: 'Högt brus' };
export const actionNames: Record<Decision, string> = {
  framat: 'kör framåt',
  hoger: 'sväng höger',
  vanster: 'sväng vänster',
  stanna: 'stanna',
};

export interface Controller {
  /** Om mätvärdet är mindre än gränsen väljs closeAction, annars körs roboten framåt. */
  threshold: number;
  closeAction: CloseAction;
  /** Antal rutor roboten kör per steg när den kör framåt. */
  speed: 1 | 2;
}

export interface SensorSetup {
  /** Hur många rutor sensorn ser. Hinder längre bort syns inte. */
  range: number;
  noise: NoiseLevel;
  seed: number;
}

export interface World {
  rows: number;
  cols: number;
  walls: boolean[][];
  start: { r: number; c: number; heading: Heading };
}

export interface StepRecord {
  step: number;
  /** Position och riktning innan steget. */
  r: number;
  c: number;
  heading: Heading;
  /** Verkligt antal fria rutor rakt fram (facit, som roboten inte känner till). */
  trueDistance: number;
  /** Brusets storlek i hela rutor (0 utan brus). */
  noise: number;
  /** Sensorns mätvärde. null = inget hinder inom räckvidden ("fri sikt"). */
  measured: number | null;
  decision: Decision;
  /** Hur programmet kom fram till beslutet, t.ex. "1 < 2 → sväng höger". */
  reason: string;
  consequence: 'flytt' | 'krock' | 'sving' | 'stilla';
  /** Antal rutor roboten faktiskt flyttade sig. */
  moved: number;
  after: { r: number; c: number; heading: Heading };
}

export interface SimFrame {
  step: number;
  r: number;
  c: number;
  heading: Heading;
  collisions: number;
  visited: string[];
  record: StepRecord | null;
  /** Rutan roboten krockade med i det här steget. */
  crashAt: [number, number] | null;
}

export interface SimResult {
  frames: SimFrame[];
  records: StepRecord[];
  collisions: number;
  /** Antal olika rutor roboten har varit i (inklusive start). */
  visitedCount: number;
  /** Antal steg där mätvärdet skilde sig från det verkliga avståndet (inom räckvidden). */
  wrongReadings: number;
}

export const DEFAULT_STEPS = 30;
export const DEFAULT_SEED = 5;

export function parseWorld(lines: readonly string[], heading: Heading = 1): World {
  const rows = lines.length;
  const cols = Math.max(...lines.map((l) => l.length));
  let start = { r: 1, c: 1, heading };
  const walls: boolean[][] = [];
  for (let r = 0; r < rows; r++) {
    walls.push([]);
    for (let c = 0; c < cols; c++) {
      const ch = lines[r]![c] ?? '#';
      walls[r]!.push(ch === '#');
      if (ch === 'R') start = { r, c, heading };
    }
  }
  return { rows, cols, walls, start };
}

export const isWall = (w: World, r: number, c: number) => r < 0 || c < 0 || r >= w.rows || c >= w.cols || w.walls[r]![c]!;

/** Antal fria rutor rakt fram innan första hindret. */
export function freeAhead(w: World, r: number, c: number, h: Heading): number {
  let n = 0;
  while (!isWall(w, r + dr[h]! * (n + 1), c + dc[h]! * (n + 1))) n++;
  return n;
}

/**
 * Sensorns mätvärde: verkligt avstånd plus avrundat brus, aldrig under 0.
 * Om mätvärdet är minst lika stort som räckvidden ser sensorn inget hinder (null).
 */
export function measure(trueDistance: number, noise: number, range: number): number | null {
  const m = Math.max(0, trueDistance + noise);
  return m >= range ? null : m;
}

export function decide(measured: number | null, ctrl: Controller): { decision: Decision; reason: string } {
  if (measured !== null && measured < ctrl.threshold) {
    return { decision: ctrl.closeAction, reason: `${measured} < ${ctrl.threshold} → ${actionNames[ctrl.closeAction]}` };
  }
  const shown = measured === null ? 'inget hinder' : `${measured} är inte < ${ctrl.threshold}`;
  return { decision: 'framat', reason: `${shown} → kör framåt` };
}

/** Brusets värde i varje steg (heltal), bestämt av startvärdet och brusnivån. */
export function noiseSequence(seed: number, level: NoiseLevel, steps: number): number[] {
  const rng = createRng(seed);
  const sd = noiseSd[level];
  const out: number[] = [];
  for (let i = 0; i < steps; i++) {
    const z = gaussian(rng, 1); // dras alltid, så att följden inte beror på brusnivån
    out.push(sd === 0 ? 0 : Math.round(z * sd) || 0);
  }
  return out;
}

const key = (r: number, c: number) => `${r},${c}`;

export function simulate(world: World, ctrl: Controller, sensor: SensorSetup, steps = DEFAULT_STEPS): SimResult {
  const noise = noiseSequence(sensor.seed, sensor.noise, steps);
  let { r, c, heading } = world.start;
  let collisions = 0;
  let wrongReadings = 0;
  const visited = new Set<string>([key(r, c)]);
  const records: StepRecord[] = [];
  const frames: SimFrame[] = [{ step: 0, r, c, heading, collisions: 0, visited: [...visited], record: null, crashAt: null }];

  for (let step = 1; step <= steps; step++) {
    const trueDistance = freeAhead(world, r, c, heading);
    const e = noise[step - 1]!;
    const measured = measure(trueDistance, e, sensor.range);
    const exact = measure(trueDistance, 0, sensor.range);
    if (measured !== exact) wrongReadings++;
    const { decision, reason } = decide(measured, ctrl);
    const before = { r, c, heading };
    let consequence: StepRecord['consequence'] = 'stilla';
    let moved = 0;
    let crashAt: [number, number] | null = null;
    if (decision === 'framat') {
      consequence = 'flytt';
      for (let k = 0; k < ctrl.speed; k++) {
        const nr = r + dr[heading]!;
        const nc = c + dc[heading]!;
        if (isWall(world, nr, nc)) {
          consequence = 'krock';
          crashAt = [nr, nc];
          collisions++;
          break;
        }
        r = nr;
        c = nc;
        moved++;
        visited.add(key(r, c));
      }
    } else if (decision === 'hoger' || decision === 'vanster') {
      consequence = 'sving';
      heading = ((heading + (decision === 'hoger' ? 1 : 3)) % 4) as Heading;
    }
    const record: StepRecord = { step, ...before, trueDistance, noise: e, measured, decision, reason, consequence, moved, after: { r, c, heading } };
    records.push(record);
    frames.push({ step, r, c, heading, collisions, visited: [...visited], record, crashAt });
  }
  return { frames, records, collisions, visitedCount: visited.size, wrongReadings };
}

export const columnLetters = 'ABCDEFGHIJKLMNOP';
export const cellName = (r: number, c: number) => `${columnLetters[c] ?? '?'}${r + 1}`;

export function measuredText(m: number | null, range: number): string {
  return m === null ? `inget hinder inom ${range}` : `${m} ${m === 1 ? 'ruta' : 'rutor'}`;
}

export function consequenceText(rec: StepRecord): string {
  switch (rec.consequence) {
    case 'flytt':
      return `kör ${rec.moved} ${rec.moved === 1 ? 'ruta' : 'rutor'} till ${cellName(rec.after.r, rec.after.c)}`;
    case 'krock':
      return rec.moved > 0 ? `kör ${rec.moved} ruta och KROCKAR` : 'KROCKAR med hindret framför';
    case 'sving':
      return `vänder sig ${headingNames[rec.after.heading]} ${arrows[rec.after.heading]}`;
    case 'stilla':
      return 'står still';
  }
}

/** Klassrummet: väggar runt om och två bänkrader. R = robotens start (tittar åt höger). */
export const classroom = [
  '##########',
  '#R.......#',
  '#..##....#',
  '#........#',
  '#....##..#',
  '#........#',
  '##########',
] as const;

/** Samma klassrum med en väska som någon ställt på golvet (F2). */
export const classroomWithBag = [
  '##########',
  '#R....#..#',
  '#..##....#',
  '#........#',
  '#....##..#',
  '#........#',
  '##########',
] as const;

export const worlds = {
  klassrum: { name: 'Klassrummet', lines: classroom },
  vaska: { name: 'Klassrummet med en väska på golvet', lines: classroomWithBag },
} as const;
export type WorldId = keyof typeof worlds;

/** Byt hinder/golv i en ruta. Robotens startruta och ytterväggarna går inte att ändra. */
export function toggleObstacle(w: World, r: number, c: number): World {
  if (r <= 0 || c <= 0 || r >= w.rows - 1 || c >= w.cols - 1) return w;
  if (r === w.start.r && c === w.start.c) return w;
  const walls = w.walls.map((row) => [...row]);
  walls[r]![c] = !walls[r]![c];
  return { ...w, walls };
}

export function isWorld(v: unknown): v is World {
  if (typeof v !== 'object' || v === null) return false;
  const w = v as World;
  return (
    typeof w.rows === 'number' &&
    typeof w.cols === 'number' &&
    Array.isArray(w.walls) &&
    w.walls.length === w.rows &&
    w.walls.every((row) => Array.isArray(row) && row.length === w.cols) &&
    typeof w.start === 'object' &&
    w.start !== null &&
    typeof w.start.r === 'number' &&
    typeof w.start.c === 'number' &&
    [0, 1, 2, 3].includes(w.start.heading)
  );
}

export interface Preset {
  name: string;
  ctrl: Controller;
  sensor: SensorSetup;
  world: WorldId;
}

const quiet = (range = 3): SensorSetup => ({ range, noise: 'inget', seed: DEFAULT_SEED });

/** Inställningarna i genomgångens steg. Siffrorna i texten kontrolleras i logic.test.ts. */
export const presets = {
  grund: { name: 'Gräns 1, fart 1', world: 'klassrum', ctrl: { threshold: 1, closeAction: 'hoger', speed: 1 }, sensor: quiet() },
  hinder: { name: 'Väska, gräns 1', world: 'vaska', ctrl: { threshold: 1, closeAction: 'hoger', speed: 1 }, sensor: quiet() },
  nollgrans: { name: 'Väska, gräns 0', world: 'vaska', ctrl: { threshold: 0, closeAction: 'hoger', speed: 1 }, sensor: quiet() },
  snabb: { name: 'Fart 2, gräns 1', world: 'klassrum', ctrl: { threshold: 1, closeAction: 'hoger', speed: 2 }, sensor: quiet() },
  snabbMarginal: { name: 'Fart 2, gräns 2', world: 'klassrum', ctrl: { threshold: 2, closeAction: 'hoger', speed: 2 }, sensor: quiet() },
  kortSikt: { name: 'Fart 2, gräns 2, sikt 1', world: 'klassrum', ctrl: { threshold: 2, closeAction: 'hoger', speed: 2 }, sensor: quiet(1) },
  brus: { name: 'Brus, gräns 1', world: 'klassrum', ctrl: { threshold: 1, closeAction: 'hoger', speed: 1 }, sensor: { range: 3, noise: 'lagt', seed: DEFAULT_SEED } },
  brusMarginal: { name: 'Brus, gräns 2', world: 'klassrum', ctrl: { threshold: 2, closeAction: 'hoger', speed: 1 }, sensor: { range: 3, noise: 'lagt', seed: DEFAULT_SEED } },
} satisfies Record<string, Preset>;

export function runPreset(id: PresetId): SimResult {
  const p: Preset = presets[id];
  return simulate(parseWorld(worlds[p.world].lines), p.ctrl, p.sensor);
}

export type PresetId = keyof typeof presets;

export function isController(v: unknown): v is Controller {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Controller;
  return typeof o.threshold === 'number' && Number.isFinite(o.threshold) && ['hoger', 'vanster', 'stanna'].includes(o.closeAction) && (o.speed === 1 || o.speed === 2);
}

export function isSensor(v: unknown): v is SensorSetup {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as SensorSetup;
  return typeof o.range === 'number' && o.range >= 1 && ['inget', 'lagt', 'hogt'].includes(o.noise) && typeof o.seed === 'number' && Number.isFinite(o.seed);
}
