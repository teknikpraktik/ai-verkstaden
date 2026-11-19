/**
 * Labb 21: en genomskinlig, regelbaserad och påhittad simulering. Varje utfall
 * förklaras av reglerna i `rules` – det finns inga dolda beräkningar och ingen slump.
 */

export type SensorId = 'kamera' | 'lidar' | 'narhet' | 'gps';
export type Autonomy = 'fjarrstyrd' | 'overvakad' | 'sjalvstandig';
export type Takeover = 'osaker' | 'blockerad' | 'hjalp';
export type MissionId = 'lager' | 'jordbruk' | 'omsorg';
export type SensorState = 'ok' | 'osaker' | 'nej';
export type Status = 'klart' | 'hjalp' | 'misslyckat' | 'risk';

export interface Conditions {
  morker: boolean;
  regn: boolean;
  trangt: boolean;
}

export interface RobotConfig {
  sensors: SensorId[];
  autonomy: Autonomy;
  takeover: Takeover[];
}

export interface Mission {
  name: string;
  place: string;
  task: string;
  outdoor: boolean;
  /** Antal delmoment, t.ex. hyllplatser eller rader. */
  segments: number;
  segmentName: string;
  minutes: number;
  /** Antal möten med människor när det är trångt. */
  encounters: number;
  /** Antal gånger vägen blockeras under uppdraget. */
  blocked: number;
  blockedText: string;
  /** Antal gånger någon behöver hjälp (bara omsorg). */
  help: number;
  /** Kameran behövs för själva uppgiften (skilja ogräs från grödor). */
  taskNeedsCamera: boolean;
  /** Förhållanden som kan väljas i uppdraget. */
  conditionPresets: { id: string; name: string; c: Conditions }[];
}

const normal: Conditions = { morker: false, regn: false, trangt: false };

export const missions: Record<MissionId, Mission> = {
  lager: {
    name: 'Plocka varor i ett lager',
    place: 'Lager',
    task: 'Roboten hämtar lådor från 10 hyllplatser och kör dem till packstationen.',
    outdoor: false,
    segments: 10,
    segmentName: 'hyllplatser',
    minutes: 60,
    encounters: 4,
    blocked: 1,
    blockedText: 'en pall står i gången',
    help: 0,
    taskNeedsCamera: false,
    conditionPresets: [
      { id: 'normalt', name: 'Normalt', c: normal },
      { id: 'morker', name: 'Mörker (nattskift, släckt)', c: { ...normal, morker: true } },
      { id: 'trangt', name: 'Trångt (personal i gångarna)', c: { ...normal, trangt: true } },
      { id: 'morker-trangt', name: 'Mörker och trångt', c: { ...normal, morker: true, trangt: true } },
    ],
  },
  jordbruk: {
    name: 'Rensa ogräs i en grönsaksodling',
    place: 'Jordbruk',
    task: 'Roboten kör längs 8 rader med morötter och tar bort ogräs mellan plantorna.',
    outdoor: true,
    segments: 8,
    segmentName: 'rader',
    minutes: 90,
    encounters: 2,
    blocked: 1,
    blockedText: 'en bevattningsslang ligger över raden',
    help: 0,
    taskNeedsCamera: true,
    conditionPresets: [
      { id: 'normalt', name: 'Normalt (dag, torrt)', c: normal },
      { id: 'morker', name: 'Mörker', c: { ...normal, morker: true } },
      { id: 'regn', name: 'Regn', c: { ...normal, regn: true } },
      { id: 'trangt', name: 'Folk i fältet', c: { ...normal, trangt: true } },
    ],
  },
  omsorg: {
    name: 'Köra ut måltidsbrickor på ett äldreboende',
    place: 'Omsorg',
    task: 'Roboten kör brickor från köket till dörren hos 8 boende. Personalen lämnar brickan, hälsar och hjälper till vid bordet.',
    outdoor: false,
    segments: 8,
    segmentName: 'rum',
    minutes: 45,
    encounters: 6,
    blocked: 1,
    blockedText: 'en rullator står i korridoren',
    help: 1,
    taskNeedsCamera: false,
    conditionPresets: [
      { id: 'normalt', name: 'Dag, lugn korridor', c: normal },
      { id: 'morker', name: 'Natt (nedsläckt)', c: { ...normal, morker: true } },
      { id: 'trangt', name: 'Trång korridor (boende med rullator)', c: { ...normal, trangt: true } },
      { id: 'morker-trangt', name: 'Natt och trångt', c: { ...normal, morker: true, trangt: true } },
    ],
  },
};

export const sensorNames: Record<SensorId, string> = {
  kamera: 'Kamera',
  lidar: 'Lidar (laseravståndsmätare)',
  narhet: 'Närhetssensor (ser ca 1 meter)',
  gps: 'GPS',
};
export const autonomyNames: Record<Autonomy, string> = {
  fjarrstyrd: 'Fjärrstyrd',
  overvakad: 'Övervakad',
  sjalvstandig: 'Självständig',
};
export const takeoverNames: Record<Takeover, string> = {
  osaker: 'när sensorerna är osäkra eller inte fungerar',
  blockerad: 'när vägen är blockerad',
  hjalp: 'när en människa behöver hjälp',
};
export const statusNames: Record<Status, string> = {
  klart: 'Klart',
  hjalp: 'Klart med mänsklig hjälp',
  misslyckat: 'Uppdraget blev inte utfört',
  risk: 'Säkerhetsrisk – får inte användas så här',
};

export type RuleId = 'S1' | 'S2' | 'S3' | 'S4' | 'U1' | 'U2' | 'U3' | 'R1' | 'R2' | 'A1' | 'A2' | 'A3' | 'A4' | 'O1' | 'O2' | 'O3' | 'N1';

/** Alla regler i simuleringen. Eleven ser exakt den här listan. */
export const rules: { id: RuleId; group: string; text: string }[] = [
  { id: 'S1', group: 'Sensorer', text: 'Kameran fungerar i dagsljus, är osäker i regn och fungerar inte i mörker.' },
  { id: 'S2', group: 'Sensorer', text: 'Lidar mäter med eget laserljus: fungerar i ljus och mörker, men är osäker i regn (dropparna ger falska ekon).' },
  { id: 'S3', group: 'Sensorer', text: 'Närhetssensorn fungerar alltid, men ser bara ungefär 1 meter.' },
  { id: 'S4', group: 'Sensorer', text: 'GPS fungerar bara utomhus. Regn påverkar inte uppdrag inomhus.' },
  { id: 'U1', group: 'Uppdrag', text: 'Inomhus behöver roboten kamera eller lidar för att hitta vägen. Den bästa av dem räknas.' },
  { id: 'U2', group: 'Uppdrag', text: 'Utomhus behöver roboten GPS och dessutom kamera eller lidar för att se hinder.' },
  { id: 'U3', group: 'Uppdrag', text: 'I odlingen behövs kameran för att skilja ogräs från morötter.' },
  { id: 'R1', group: 'Säkerhet', text: 'När människor rör sig nära roboten måste den ha en fungerande närhetssensor. Annars är det en säkerhetsrisk.' },
  { id: 'R2', group: 'Säkerhet', text: 'Närhetssensorn stoppar roboten när någon är närmare än 1 meter. Roboten väntar tills det är fritt (inget övertagande behövs).' },
  { id: 'A1', group: 'Autonomi', text: 'Fjärrstyrd: en person styr hela tiden med hjälp av robotens kamera. Kameran måste fungera. Personaltid = hela uppdragets tid.' },
  { id: 'A2', group: 'Autonomi', text: 'Övervakad: roboten kör själv, en person tittar hela tiden och tar över direkt när något händer. Personaltid = hela uppdragets tid.' },
  { id: 'A3', group: 'Autonomi', text: 'Självständig: roboten kör själv och kallar på en människa bara enligt villkoren för övertagande. Varje övertagande kostar 5 minuter personaltid.' },
  { id: 'A4', group: 'Autonomi', text: 'Saknas ett villkor för övertagande gör en självständig robot bara det reglerna säger: den fortsätter trots osäkerhet och väntar för evigt vid ett hinder.' },
  { id: 'O1', group: 'Omsorg', text: 'Roboten gör aldrig något som rör de boendes kroppar – inte lyfta, stötta eller mata. Det gör personal, som också lämnar brickan och hälsar.' },
  { id: 'O2', group: 'Omsorg', text: 'Kameran får bara användas i korridoren. Den filmar aldrig inne hos de boende och inga bilder sparas.' },
  { id: 'O3', group: 'Omsorg', text: 'Om en boende behöver hjälp ska personal larmas direkt. Gör roboten inte det är uppdraget en säkerhetsrisk, hur bra det än gick i övrigt.' },
  { id: 'N1', group: 'Nytta', text: 'Behöver roboten hjälp i lika många moment som uppdraget har är den inte till någon nytta – en människa kunde lika gärna göra jobbet.' },
];

export interface Explanation {
  rule: RuleId;
  text: string;
}

export interface Outcome {
  status: Status;
  takeovers: number;
  staffMinutes: number;
  sensorState: Record<SensorId, SensorState | 'saknas'>;
  nav: SensorState;
  task: SensorState;
  explanations: Explanation[];
  fired: RuleId[];
}

const rank: Record<SensorState, number> = { ok: 2, osaker: 1, nej: 0 };
const best = (a: SensorState, b: SensorState): SensorState => (rank[a] >= rank[b] ? a : b);
const worst = (a: SensorState, b: SensorState): SensorState => (rank[a] <= rank[b] ? a : b);
const stateText: Record<SensorState, string> = { ok: 'fungerar', osaker: 'är osäker', nej: 'fungerar inte' };

export function sensorStates(missionId: MissionId, cfg: RobotConfig, cond: Conditions): Record<SensorId, SensorState | 'saknas'> {
  const m = missions[missionId];
  const rain = cond.regn && m.outdoor;
  const raw: Record<SensorId, SensorState> = {
    kamera: cond.morker ? 'nej' : rain ? 'osaker' : 'ok',
    lidar: rain ? 'osaker' : 'ok',
    narhet: 'ok',
    gps: m.outdoor ? 'ok' : 'nej',
  };
  const out = {} as Record<SensorId, SensorState | 'saknas'>;
  for (const s of Object.keys(raw) as SensorId[]) out[s] = cfg.sensors.includes(s) ? raw[s] : 'saknas';
  return out;
}

export function evaluate(missionId: MissionId, cfg: RobotConfig, cond: Conditions): Outcome {
  const m = missions[missionId];
  const ex: Explanation[] = [];
  const say = (rule: RuleId, text: string) => ex.push({ rule, text });
  const st = sensorStates(missionId, cfg, cond);
  const get = (s: SensorId): SensorState => (st[s] === 'saknas' ? 'nej' : (st[s] as SensorState));
  const has = (t: Takeover) => cfg.takeover.includes(t);

  // Sensorer
  if (st.kamera !== 'saknas' && st.kamera !== 'ok') say('S1', `Kameran ${stateText[st.kamera]} (${cond.morker ? 'mörker' : 'regn'}).`);
  if (st.lidar === 'osaker') say('S2', 'Lidarn är osäker i regnet.');
  if (st.gps === 'nej') say('S4', 'GPS:en fungerar inte inomhus.');

  // Uppdrag
  const sight = best(get('kamera'), get('lidar'));
  const nav = m.outdoor ? worst(get('gps'), sight) : sight;
  say(m.outdoor ? 'U2' : 'U1', `Att hitta vägen ${stateText[nav]}${nav === 'nej' && cfg.sensors.length > 0 ? ' med de sensorer roboten har' : ''}.`);
  const task: SensorState = m.taskNeedsCamera ? get('kamera') : 'ok';
  if (m.taskNeedsCamera) say('U3', `Att skilja ogräs från morötter ${stateText[task]}.`);

  let risk = false;
  let failed = false;
  let takeovers = 0;

  // Säkerhet
  if (cond.trangt) {
    if (get('narhet') !== 'ok') {
      risk = true;
      say('R1', `Människor rör sig nära roboten (${m.encounters} möten), men den har ingen närhetssensor.`);
    } else {
      say('R2', `Roboten stannade och väntade ${m.encounters} gånger när någon kom nära.`);
    }
  }

  // Omsorg: alltid gällande gränser
  if (missionId === 'omsorg') {
    say('O1', 'Personal lämnar brickorna och hjälper de boende – roboten kör bara brickorna till dörren.');
    if (cfg.sensors.includes('kamera')) say('O2', 'Kameran används bara i korridoren.');
  }

  const worstNeed = worst(nav, task);
  if (cfg.autonomy === 'fjarrstyrd') {
    if (get('kamera') === 'nej') {
      failed = true;
      say('A1', 'Operatören ser ingenting, eftersom kameran inte fungerar. Uppdraget kan inte köras.');
    } else {
      say('A1', `En person styrde roboten hela tiden${get('kamera') === 'osaker' ? ' trots en osäker kamerabild' : ''} och tog hand om ${m.blockedText}${m.help ? ' och larmade personal när en boende behövde hjälp' : ''}.`);
    }
  } else if (cfg.autonomy === 'overvakad') {
    if (worstNeed === 'nej') {
      failed = true;
      say('A2', 'Roboten kan inte utföra uppdraget med sina sensorer. Personen som tittar får göra jobbet själv.');
    } else {
      if (worstNeed === 'osaker') {
        takeovers += m.segments;
        say('A2', `Sensorerna var osäkra i alla ${m.segments} ${m.segmentName}. Personen tog över varje gång.`);
      }
      takeovers += m.blocked;
      say('A2', `Personen tog över när ${m.blockedText}.`);
      if (m.help) {
        takeovers += m.help;
        say('O3', 'En boende sa att hon kände sig yr. Personen som övervakade larmade personal direkt.');
      }
    }
  } else {
    if (worstNeed !== 'ok') {
      if (has('osaker')) {
        if (worstNeed === 'nej') {
          failed = true;
          takeovers += 1;
          say('A3', 'Roboten kunde inte se det den behövde. Den stannade direkt och kallade på en människa, som fick göra uppdraget.');
        } else {
          takeovers += m.segments;
          say('A3', `Sensorerna var osäkra i alla ${m.segments} ${m.segmentName}. Roboten kallade på en människa varje gång.`);
        }
      } else {
        risk = true;
        say('A4', `Sensorerna ${worstNeed === 'nej' ? 'fungerade inte' : 'var osäkra'}, men det finns inget villkor för övertagande. Roboten fortsatte ändå – den kan köra fel eller ${m.taskNeedsCamera ? 'rycka upp morötter' : 'krocka'}.`);
      }
    }
    if (!failed) {
      if (has('blockerad')) {
        takeovers += m.blocked;
        say('A3', `När ${m.blockedText} kallade roboten på en människa.`);
      } else {
        failed = true;
        say('A4', `När ${m.blockedText} stod roboten och väntade. Den kom aldrig vidare.`);
      }
    }
    if (m.help) {
      if (has('hjalp')) {
        takeovers += m.help;
        say('O3', 'En boende sa att hon kände sig yr. Roboten larmade personal direkt.');
      } else {
        risk = true;
        say('O3', 'En boende sa att hon kände sig yr, men roboten hade inget villkor för att larma. Hon fick vänta på hjälp.');
      }
    }
  }

  const staffMinutes = cfg.autonomy === 'sjalvstandig' ? (failed && worstNeed === 'nej' ? m.minutes : takeovers * 5) : m.minutes;
  if (cfg.autonomy !== 'fjarrstyrd' && takeovers >= m.segments) say('N1', `Roboten behövde hjälp ${takeovers} gånger på ${m.segments} ${m.segmentName}.`);

  const status: Status = risk ? 'risk' : failed ? 'misslyckat' : takeovers > 0 ? 'hjalp' : 'klart';
  const fired = [...new Set(ex.map((e) => e.rule))];
  return { status, takeovers, staffMinutes, sensorState: st, nav, task, explanations: ex, fired };
}

export interface Preset {
  name: string;
  mission: MissionId;
  cfg: RobotConfig;
}

/** Inställningar i genomgången. Utfallen kontrolleras i logic.test.ts. */
export const presets = {
  lagerKamera: { name: 'Kamera + närhet', mission: 'lager', cfg: { sensors: ['kamera', 'narhet'], autonomy: 'sjalvstandig', takeover: ['osaker', 'blockerad'] } },
  lagerLidar: { name: 'Kamera + närhet + lidar', mission: 'lager', cfg: { sensors: ['kamera', 'narhet', 'lidar'], autonomy: 'sjalvstandig', takeover: ['osaker', 'blockerad'] } },
  jordbruk: { name: 'Alla fyra sensorerna', mission: 'jordbruk', cfg: { sensors: ['kamera', 'lidar', 'narhet', 'gps'], autonomy: 'sjalvstandig', takeover: ['osaker', 'blockerad'] } },
  omsorgUtan: { name: 'Kamera + lidar', mission: 'omsorg', cfg: { sensors: ['kamera', 'lidar'], autonomy: 'sjalvstandig', takeover: ['osaker', 'blockerad'] } },
  omsorgNarhet: { name: '+ närhetssensor', mission: 'omsorg', cfg: { sensors: ['kamera', 'lidar', 'narhet'], autonomy: 'sjalvstandig', takeover: ['osaker', 'blockerad'] } },
  omsorgLarm: { name: '+ närhet + larmvillkor', mission: 'omsorg', cfg: { sensors: ['kamera', 'lidar', 'narhet'], autonomy: 'sjalvstandig', takeover: ['osaker', 'blockerad', 'hjalp'] } },
} satisfies Record<string, Preset>;
export type PresetId = keyof typeof presets;

const SENSORS: SensorId[] = ['kamera', 'lidar', 'narhet', 'gps'];
const TAKEOVERS: Takeover[] = ['osaker', 'blockerad', 'hjalp'];

export function isConfig(v: unknown): v is RobotConfig {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as RobotConfig;
  return (
    Array.isArray(c.sensors) &&
    c.sensors.every((s) => SENSORS.includes(s)) &&
    Array.isArray(c.takeover) &&
    c.takeover.every((t) => TAKEOVERS.includes(t)) &&
    ['fjarrstyrd', 'overvakad', 'sjalvstandig'].includes(c.autonomy)
  );
}
export function isConditions(v: unknown): v is Conditions {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Conditions;
  return typeof c.morker === 'boolean' && typeof c.regn === 'boolean' && typeof c.trangt === 'boolean';
}
export const sensorIds = SENSORS;
export const takeoverIds = TAKEOVERS;
