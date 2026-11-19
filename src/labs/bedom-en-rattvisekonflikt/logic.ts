/**
 * Syntetisk datamängd för ett påhittat system hos den påhittade myndigheten
 * "Bidragskontoret". Varje ansökan har fått en riskpoäng 0–100. Ansökningar med
 * poäng ≥ tröskeln skickas till manuell utredning (systemet säger "ja").
 *
 *  - positiv  = ansökan innehöll faktiskt fel
 *  - negativ  = ansökan var korrekt
 *  - falskt positiv (FP) = korrekt ansökan utreds i onödan (utbetalningen försenas)
 *  - falskt negativ (FN) = felaktig ansökan släpps igenom
 *
 * Poängen skapades en gång med createRng(2310) och normalfördelat brus och är
 * sedan fastlåsta här. Grupp Söder har högre poäng även bland korrekta
 * ansökningar – i scenariot för att modellen använder "antal flyttar senaste
 * året", som är vanligare i Söder av skäl som inte har med fel att göra.
 */

export type GroupId = 'norr' | 'soder';

export interface Case {
  id: string;
  group: GroupId;
  score: number;
  /** true = ansökan innehöll fel. */
  error: boolean;
}

const raw: Record<GroupId, { neg: number[]; pos: number[] }> = {
  norr: {
    neg: [12, 15, 19, 20, 23, 25, 25, 27, 28, 28, 29, 31, 33, 36, 36, 36, 36, 36, 37, 37, 38, 39, 39, 40, 41, 41, 43, 43, 44, 47, 49, 60],
    pos: [42, 55, 56, 64, 64, 64, 71, 75],
  },
  soder: {
    neg: [32, 32, 33, 39, 40, 42, 45, 47, 48, 49, 50, 51, 52, 52, 52, 54, 55, 56, 56, 58, 59, 62, 71, 73],
    pos: [57, 58, 60, 60, 62, 62, 64, 65, 66, 71, 76, 78, 80, 82, 85, 85],
  },
};

export const groupName: Record<GroupId, string> = { norr: 'Område Norr', soder: 'Område Söder' };
export const groupIds: GroupId[] = ['norr', 'soder'];

export const cases: Case[] = groupIds.flatMap((g) => {
  const all = [...raw[g].neg.map((s) => ({ score: s, error: false })), ...raw[g].pos.map((s) => ({ score: s, error: true }))].sort(
    (a, b) => a.score - b.score || Number(a.error) - Number(b.error),
  );
  const prefix = g === 'norr' ? 'N' : 'S';
  return all.map((c, i) => ({ id: `${prefix}${String(i + 1).padStart(2, '0')}`, group: g, ...c }));
});

export interface GroupOutcome {
  group: GroupId;
  total: number;
  /** Ansökningar som faktiskt innehöll fel (positiva). */
  errors: number;
  /** Korrekta ansökningar (negativa). */
  correct: number;
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  /** Antal som skickas till utredning. */
  flagged: number;
}

/** Utfall för en grupp vid en tröskel: poäng ≥ tröskel → utredning. */
export function outcome(group: GroupId, threshold: number, data: Case[] = cases): GroupOutcome {
  const g = data.filter((c) => c.group === group);
  let tp = 0,
    fp = 0,
    fn = 0,
    tn = 0;
  for (const c of g) {
    const flagged = c.score >= threshold;
    if (flagged && c.error) tp++;
    else if (flagged) fp++;
    else if (c.error) fn++;
    else tn++;
  }
  return { group, total: g.length, errors: tp + fn, correct: fp + tn, tp, fp, fn, tn, flagged: tp + fp };
}

/** Andel i procent, avrundad till heltal. null om nämnaren är 0. */
export function pct(part: number, whole: number): number | null {
  return whole === 0 ? null : Math.round((100 * part) / whole);
}

/** Andel korrekta ansökningar som utreds i onödan: FP / korrekta. */
export const fpRate = (o: GroupOutcome) => pct(o.fp, o.correct);
/** Andel felaktiga ansökningar som missas: FN / felaktiga. */
export const fnRate = (o: GroupOutcome) => pct(o.fn, o.errors);

export interface Comparison {
  norr: GroupOutcome;
  soder: GroupOutcome;
  /** Skillnad i FP-andel (Söder − Norr) i procentenheter. */
  fpGap: number;
  fnGap: number;
}

export function compare(thresholds: Record<GroupId, number>): Comparison {
  const norr = outcome('norr', thresholds.norr);
  const soder = outcome('soder', thresholds.soder);
  return {
    norr,
    soder,
    fpGap: (fpRate(soder) ?? 0) - (fpRate(norr) ?? 0),
    fnGap: (fnRate(soder) ?? 0) - (fnRate(norr) ?? 0),
  };
}

/**
 * Lägsta gemensamma tröskel där ingen grupp har högre FP-andel än `maxFp` procent.
 * Används i fördjupningen. null om ingen tröskel 0–101 klarar det.
 */
export function lowestThresholdWithFpAtMost(maxFp: number): number | null {
  for (let t = 0; t <= 101; t++) {
    if (groupIds.every((g) => (fpRate(outcome(g, t)) ?? 0) <= maxFp)) return t;
  }
  return null;
}

export const DEFAULT_THRESHOLD = 50;
export const COMPARE_THRESHOLD = 60;

export const isThreshold = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 100;
