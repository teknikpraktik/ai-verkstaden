import { createRng } from '../../lib/random';

/**
 * Ett påhittat flöde med korta inlägg i sex ämnen. Systemet räknar klick per
 * ämne och väljer nästa sida med inlägg utifrån klicken. All slump är
 * reproducerbar: sida nummer r slumpas med startvärdet seed * 1000 + r.
 */

export type TopicId = 'spel' | 'musik' | 'sport' | 'natur' | 'mat' | 'vetenskap';
export type FeedMode = 'engagemang' | 'variation';

export const topics: { id: TopicId; name: string; symbol: string; color: string }[] = [
  { id: 'spel', name: 'Spel', symbol: '◆', color: 'var(--c1)' },
  { id: 'musik', name: 'Musik', symbol: '♪', color: 'var(--c2)' },
  { id: 'sport', name: 'Sport', symbol: '●', color: 'var(--c3)' },
  { id: 'natur', name: 'Natur', symbol: '▲', color: 'var(--c4)' },
  { id: 'mat', name: 'Mat', symbol: '■', color: 'var(--c5)' },
  { id: 'vetenskap', name: 'Vetenskap', symbol: '★', color: 'var(--c6)' },
];

export const topicIds = topics.map((t) => t.id);
export const topicById = new Map(topics.map((t) => [t.id, t]));

/** Påhittade rubriker. Inga riktiga kanaler eller personer. */
const titles: Record<TopicId, string[]> = {
  spel: ['Fem knep i ett påhittat plattformsspel', 'Speedrun genom Grottnivå 3', 'Topplista: pusselspel för regniga dagar', 'Så byggdes slottet i blockspelet'],
  musik: ['Lär dig tre ackord på tio minuter', 'Körrepetition i Ekbacka kulturhus', 'Vad gör en producent?', 'Trumkomp i slowmotion'],
  sport: ['Fyra övningar för bättre passningar', 'Matchsammandrag: Norrvik–Södervik', 'Så tränar en orienterare', 'Klättervägg för nybörjare'],
  natur: ['Fåglarna vid sjön på våren', 'Bygg ett insektshotell', 'Varför byter löven färg?', 'Nattvandring i en påhittad nationalpark'],
  mat: ['Pannkakor på tre sätt', 'Billig matlåda för en vecka', 'Varför jäser deg?', 'Grönsakssoppa på 20 minuter'],
  vetenskap: ['Hur fungerar en solcell?', 'Experiment: vulkan i köket', 'Vad är ett svart hål?', 'Så mäter man en jordbävning'],
};

export interface Item {
  /** Unikt inom en simulering: "r<runda>-<plats>". */
  key: string;
  topic: TopicId;
  title: string;
}

export type Clicks = Record<TopicId, number>;

export const noClicks = (): Clicks => ({ spel: 0, musik: 0, sport: 0, natur: 0, mat: 0, vetenskap: 0 });

export const PAGE_SIZE = 4;
/** Variationen mäts bland så här många av de senast visade inläggen (3 sidor). */
export const WINDOW = 12;

/** Ämnet med flest klick (vid lika: först i listan). null om inga klick. */
export function topTopic(clicks: Clicks): TopicId | null {
  let best: TopicId | null = null;
  for (const t of topicIds) if (clicks[t] > 0 && (best === null || clicks[t] > clicks[best])) best = t;
  return best;
}

/**
 * Hur stor chans varje ämne har att hamna på en plats som styrs av profilen.
 * Vikten är (1 + klick)² – kvadraten gör att ett ämne med många klick tar över snabbt.
 */
export function profileWeights(clicks: Clicks): Record<TopicId, number> {
  const raw = topicIds.map((t) => (1 + clicks[t]) ** 2);
  const sum = raw.reduce((a, b) => a + b, 0);
  const out = noClicks();
  topicIds.forEach((t, i) => (out[t] = raw[i]! / sum));
  return out;
}

function pickWeighted(rng: () => number, weights: [TopicId, number][]): TopicId {
  const sum = weights.reduce((a, [, w]) => a + w, 0);
  let x = rng() * sum;
  for (const [t, w] of weights) {
    x -= w;
    if (x < 0) return t;
  }
  return weights[weights.length - 1]![0];
}

/**
 * Nästa sida med inlägg.
 *  - engagemang: alla fyra platser väljs efter profilen.
 *  - variation:  två platser efter profilen, två platser slumpas jämnt bland
 *                de ämnen som INTE är ditt mest klickade ämne.
 */
export function makePage(seed: number, round: number, clicks: Clicks, mode: FeedMode): Item[] {
  const rng = createRng(seed * 1000 + round);
  const w = profileWeights(clicks);
  const top = topTopic(clicks);
  const items: Item[] = [];
  for (let slot = 0; slot < PAGE_SIZE; slot++) {
    const explore = mode === 'variation' && slot >= PAGE_SIZE / 2;
    const choices: [TopicId, number][] = explore
      ? topicIds.filter((t) => t !== top).map((t) => [t, 1])
      : topicIds.map((t) => [t, w[t]]);
    const topic = pickWeighted(rng, choices);
    const list = titles[topic];
    const title = list[Math.floor(rng() * list.length)]!;
    items.push({ key: `r${round}-${slot}`, topic, title });
  }
  return items;
}

export interface FeedEvent {
  round: number;
  topic: TopicId;
  title: string;
  clicked: boolean;
  /** Simulerad tid i sekunder som inlägget syntes på skärmen. */
  seconds: number;
}

export interface FeedState {
  seed: number;
  mode: FeedMode;
  round: number;
  clicks: Clicks;
  page: Item[];
  /** Allt som har visats, i ordning. */
  shown: Item[];
  /** Systemets logg: en rad per visat inlägg. */
  log: FeedEvent[];
}

export function startFeed(seed: number, mode: FeedMode): FeedState {
  const clicks = noClicks();
  const page = makePage(seed, 0, clicks, mode);
  return { seed, mode, round: 0, clicks, page, shown: [...page], log: [] };
}

/** Simulerad visningstid: klickade inlägg tittar man på längre. */
export function viewSeconds(clicked: boolean, round: number, slot: number): number {
  return clicked ? 25 + ((round * 7 + slot * 3) % 20) : 1 + ((round + slot) % 3);
}

/** Eleven klickar på inlägg nummer `index` på den aktuella sidan. */
export function clickItem(state: FeedState, index: number): FeedState {
  const chosen = state.page[index];
  if (!chosen) return state;
  const clicks = { ...state.clicks, [chosen.topic]: state.clicks[chosen.topic] + 1 };
  const events = state.page.map<FeedEvent>((it, slot) => ({
    round: state.round,
    topic: it.topic,
    title: it.title,
    clicked: slot === index,
    seconds: viewSeconds(slot === index, state.round, slot),
  }));
  const round = state.round + 1;
  const page = makePage(state.seed, round, clicks, state.mode);
  return { ...state, round, clicks, page, shown: [...state.shown, ...page], log: [...state.log, ...events] };
}

/** "Robot-eleven": klickar alltid på ett inlägg om favoritämnet om det finns, annars på det första. */
export function robotChoice(page: Item[], favourite: TopicId): number {
  const i = page.findIndex((it) => it.topic === favourite);
  return i >= 0 ? i : 0;
}

export function simulate(seed: number, mode: FeedMode, rounds: number, favourite: TopicId = 'spel'): FeedState {
  let s = startFeed(seed, mode);
  for (let r = 0; r < rounds; r++) s = clickItem(s, robotChoice(s.page, favourite));
  return s;
}

export interface Variation {
  /** Antal inlägg som mätningen gäller (högst WINDOW). */
  n: number;
  /** Antal olika ämnen bland dem (1–6). */
  distinct: number;
  /** Vanligaste ämnet och hur många av de n inläggen det står för. */
  top: TopicId | null;
  topCount: number;
  counts: Record<TopicId, number>;
}

/** Variation bland de WINDOW senast visade inläggen. */
export function variation(shown: Item[], window = WINDOW): Variation {
  const last = shown.slice(-window);
  const counts = noClicks();
  for (const it of last) counts[it.topic]++;
  let top: TopicId | null = null;
  for (const t of topicIds) if (counts[t] > 0 && (top === null || counts[t] > counts[top])) top = t;
  return {
    n: last.length,
    distinct: topicIds.filter((t) => counts[t] > 0).length,
    top,
    topCount: top ? counts[top] : 0,
    counts,
  };
}

export interface DataSummary {
  views: number;
  clicks: number;
  totalSeconds: number;
  skipped: Record<TopicId, number>;
  /** Slutsatser som systemet kan dra av loggen. */
  inferences: string[];
}

export function summarizeData(state: FeedState): DataSummary {
  const skipped = noClicks();
  let total = 0;
  for (const e of state.log) {
    total += e.seconds;
    if (!e.clicked) skipped[e.topic]++;
  }
  const clicks = topicIds.reduce((a, t) => a + state.clicks[t], 0);
  const inferences: string[] = [];
  const top = topTopic(state.clicks);
  if (top && clicks > 0) {
    inferences.push(`Du klickar mest på ${topicById.get(top)!.name.toLowerCase()} (${state.clicks[top]} av ${clicks} klick).`);
  }
  const never = topicIds.filter((t) => state.clicks[t] === 0 && skipped[t] > 0);
  if (never.length > 0) inferences.push(`Du hoppar över ${never.map((t) => topicById.get(t)!.name.toLowerCase()).join(', ')}.`);
  if (clicks >= 5) inferences.push('Hur länge du stannar vid ett inlägg avslöjar vad som fångar dig – även sådant du inte klickar på.');
  return { views: state.log.length, clicks, totalSeconds: total, skipped, inferences };
}

export function isFeedMode(v: unknown): v is FeedMode {
  return v === 'engagemang' || v === 'variation';
}

/** Det som sparas lokalt: bara startvärde, läge och vilka platser som klickades. */
export interface StoredFeed {
  seed: number;
  mode: FeedMode;
  choices: number[];
}

export function isStoredFeed(v: unknown): v is StoredFeed {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as StoredFeed;
  return (
    typeof s.seed === 'number' &&
    Number.isInteger(s.seed) &&
    isFeedMode(s.mode) &&
    Array.isArray(s.choices) &&
    s.choices.length <= 200 &&
    s.choices.every((c) => Number.isInteger(c) && c >= 0 && c < PAGE_SIZE)
  );
}

export function replay(stored: StoredFeed): FeedState {
  let s = startFeed(stored.seed, stored.mode);
  for (const c of stored.choices) s = clickItem(s, c);
  return s;
}

/** Standardscenariot i genomgången. */
export const DEFAULT_SEED = 7;
export const ROBOT_ROUNDS = 15;
