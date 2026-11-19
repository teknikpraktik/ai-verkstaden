/**
 * Påhittat framtidsscenario: Ekbackens gymnasium (påhittat) överväger år 2030
 * att införa "Avhoppsvarnaren", ett AI-system som markerar elever som riskerar
 * att hoppa av. Konsekvenserna räknas fram med enkla, uttalade regler så att
 * eleven ser hur beslut och villkor slår igenom. Siffrorna är påhittade.
 *
 * Grundantaganden för en årskurs med 200 elever:
 *  - 20 elever är i riskzonen. Utan systemet hittar mentorerna 8 av dem.
 *  - Med alla uppgifter (6 per elev) markerar systemet 16 rätt och 24 fel.
 *  - Med bara närvaro och betyg (2 per elev) markerar det 14 rätt och 26 fel.
 *  - Mänsklig granskning: mentorn stryker 3 av 4 felaktiga markeringar men
 *    råkar också stryka 1 riktig.
 *  - Varje kontakt tar 0,5 timme, varje granskning 0,25 timme.
 *  - 2 av 3 felaktiga markeringar gäller elever på yrkesprogram.
 *  - En pilot omfattar 50 elever (en fjärdedel); antal skalas och avrundas.
 */

export type Decision = 'nej' | 'infor' | 'villkor' | 'pilot';
export type ConditionId = 'granskning' | 'overprovning' | 'minimera' | 'radera' | 'revision' | 'leverantor';
export type RoleId = 'elev' | 'mentor' | 'rektor' | 'kurator' | 'vardnadshavare' | 'dataskydd';
export type MetricId = 'hjalp' | 'felkontakt' | 'timmar' | 'uppgifter' | 'lagring' | 'overprovning' | 'snedvridning' | 'leverantor';

export const decisions: { id: Decision; name: string }[] = [
  { id: 'nej', name: 'Inför inte systemet' },
  { id: 'infor', name: 'Inför systemet utan villkor' },
  { id: 'villkor', name: 'Inför systemet med villkor' },
  { id: 'pilot', name: 'Gör en pilot med villkor (50 elever, en termin)' },
];

export const conditions: { id: ConditionId; name: string; detail: string }[] = [
  { id: 'granskning', name: 'Mentorn granskar varje markering', detail: 'Ingen elev kontaktas innan en mentor har bedömt om markeringen verkar rimlig.' },
  { id: 'overprovning', name: 'Eleven får veta och kan begära ändring', detail: 'Eleven får se varför hen markerats och kan få markeringen prövad och raderad.' },
  { id: 'minimera', name: 'Bara närvaro och betyg', detail: 'Inga uppgifter från lärplattformen, chattar eller elevhälsan.' },
  { id: 'radera', name: 'Radera efter läsåret', detail: 'Markeringar och underlag raderas när läsåret är slut i stället för efter 5 år.' },
  { id: 'revision', name: 'Granska felen per grupp varje termin', detail: 'Någon utanför projektet kontrollerar om felen drabbar vissa elevgrupper mer.' },
  { id: 'leverantor', name: 'Leverantören får inte använda uppgifterna', detail: 'Avtalet förbjuder leverantören att använda elevernas uppgifter för att träna andra system.' },
];

export const roles: { id: RoleId; name: string; interest: string; cares: MetricId[] }[] = [
  { id: 'elev', name: 'Elev', interest: 'Vill få hjälp om det behövs, men inte bli stämplad eller övervakad i onödan.', cares: ['felkontakt', 'overprovning', 'uppgifter'] },
  { id: 'mentor', name: 'Mentor', interest: 'Vill hitta elever som behöver stöd tidigt, men har begränsad tid.', cares: ['hjalp', 'timmar'] },
  { id: 'rektor', name: 'Rektor', interest: 'Ansvarar för att färre hoppar av, att lagen följs och att pengarna räcker.', cares: ['hjalp', 'timmar', 'snedvridning'] },
  { id: 'kurator', name: 'Kurator i elevhälsan', interest: 'Vill att elever med svårigheter får stöd, och att känsliga uppgifter skyddas.', cares: ['hjalp', 'uppgifter', 'felkontakt'] },
  { id: 'vardnadshavare', name: 'Vårdnadshavare', interest: 'Vill att barnet får hjälp, men också veta vad skolan registrerar och kunna ifrågasätta det.', cares: ['overprovning', 'lagring', 'hjalp'] },
  { id: 'dataskydd', name: 'Dataskyddsombud', interest: 'Ska se till att skolan följer GDPR: dataminimering, lagringstid, rättslig grund och rättigheter.', cares: ['uppgifter', 'lagring', 'leverantor', 'overprovning'] },
];

export const metricName: Record<MetricId, string> = {
  hjalp: 'Elever i riskzonen som får hjälp',
  felkontakt: 'Elever som kontaktas felaktigt',
  timmar: 'Mentortid per termin',
  uppgifter: 'Uppgifter per elev i systemet',
  lagring: 'Hur länge uppgifterna sparas',
  overprovning: 'Kan en markering överprövas?',
  snedvridning: 'Upptäcks om felen drabbar vissa grupper?',
  leverantor: 'Får leverantören använda uppgifterna?',
};

export const COHORT = 200;
export const PILOT = 50;
export const AT_RISK = 20;
export const FOUND_TODAY = 8;

export interface Outcome {
  students: number;
  atRisk: number;
  /** Elever i riskzonen som får hjälp. */
  helped: number;
  /** Jämförelse: så många skulle mentorerna hitta utan system i samma grupp. */
  helpedToday: number;
  wrongContacts: number;
  /** Felaktiga kontakter som gäller elever på yrkesprogram. */
  wrongVocational: number;
  flagged: number;
  hours: number;
  dataPerStudent: number;
  retention: string;
  appeal: boolean;
  biasDetected: boolean;
  vendorUse: boolean;
  systemUsed: boolean;
}

const scale = (x: number, size: number) => Math.round((x * size) / COHORT);

export function consequences(decision: Decision, chosen: ConditionId[]): Outcome {
  if (decision === 'nej') {
    return {
      students: COHORT,
      atRisk: AT_RISK,
      helped: FOUND_TODAY,
      helpedToday: FOUND_TODAY,
      wrongContacts: 0,
      wrongVocational: 0,
      flagged: 0,
      hours: 0,
      dataPerStudent: 0,
      retention: '–',
      appeal: true,
      biasDetected: false,
      vendorUse: false,
      systemUsed: false,
    };
  }
  const c = decision === 'infor' ? [] : chosen;
  const has = (id: ConditionId) => c.includes(id);
  const size = decision === 'pilot' ? PILOT : COHORT;

  const tp0 = has('minimera') ? 14 : 16;
  const fp0 = has('minimera') ? 26 : 24;
  const flaggedFull = tp0 + fp0;
  const tpFull = has('granskning') ? tp0 - 1 : tp0;
  const fpFull = has('granskning') ? Math.round(fp0 * 0.25) : fp0;

  const tp = scale(tpFull, size);
  const fp = scale(fpFull, size);
  const flagged = scale(flaggedFull, size);
  const hours = (tp + fp) * 0.5 + (has('granskning') ? flagged * 0.25 : 0);

  return {
    students: size,
    atRisk: scale(AT_RISK, size),
    helped: tp,
    helpedToday: scale(FOUND_TODAY, size),
    wrongContacts: fp,
    wrongVocational: Math.round((fp * 2) / 3),
    flagged,
    hours,
    dataPerStudent: has('minimera') ? 2 : 6,
    retention: has('radera') ? 'Till läsårets slut' : '5 år',
    appeal: has('overprovning'),
    biasDetected: has('revision'),
    vendorUse: !has('leverantor'),
    systemUsed: true,
  };
}

/** Text för ett mått, så att samma formulering används i labben och testerna. */
export function metricText(o: Outcome, m: MetricId): string {
  const hrs = (h: number) => `${String(h).replace('.', ',')} timmar`;
  switch (m) {
    case 'hjalp':
      return `${o.helped} av ${o.atRisk} (i dag: ${o.helpedToday} av ${o.atRisk})`;
    case 'felkontakt':
      return o.systemUsed ? `${o.wrongContacts} av ${o.students - o.atRisk} elever utan risk` : '0 (inget system)';
    case 'timmar':
      return o.systemUsed ? `${hrs(o.hours)} extra` : 'Ingen extra tid';
    case 'uppgifter':
      return o.systemUsed ? `${o.dataPerStudent} sorters uppgifter` : 'Inga nya';
    case 'lagring':
      return o.retention;
    case 'overprovning':
      return !o.systemUsed ? 'Inget system att överpröva' : o.appeal ? 'Ja' : 'Nej – eleven vet inte ens om markeringen';
    case 'snedvridning':
      return !o.systemUsed
        ? '–'
        : o.biasDetected
          ? `Ja: ${o.wrongVocational} av ${o.wrongContacts} felaktiga kontakter gäller yrkesprogram, som har en tredjedel av eleverna`
          : 'Nej – ingen kontrollerar';
    case 'leverantor':
      return !o.systemUsed ? '–' : o.vendorUse ? 'Ja, för att träna andra system' : 'Nej';
  }
}

/** Mått där utfallet bör uppmärksammas (visas med ✗/!). */
export function concerns(o: Outcome): MetricId[] {
  if (!o.systemUsed) return ['hjalp'];
  const out: MetricId[] = [];
  if (o.wrongContacts > o.helped) out.push('felkontakt');
  if (!o.appeal) out.push('overprovning');
  if (!o.biasDetected) out.push('snedvridning');
  if (o.vendorUse) out.push('leverantor');
  if (o.retention === '5 år') out.push('lagring');
  if (o.dataPerStudent > 2) out.push('uppgifter');
  return out;
}

export const metricIds = Object.keys(metricName) as MetricId[];
export const isDecision = (v: unknown): v is Decision => decisions.some((d) => d.id === v);
export const isRole = (v: unknown): v is RoleId => roles.some((r) => r.id === v);
export const isConditionList = (v: unknown): v is ConditionId[] =>
  Array.isArray(v) && v.every((x) => conditions.some((c) => c.id === x)) && new Set(v).size === v.length;
