/**
 * Påhittat skolverktyg "Läxkompis" på det påhittade Ekbackens gymnasium.
 * Eleven väljer ändamål, uppgifter och lagringstid. Funktionen `evaluate`
 * ger återkoppling på dataminimering, ändamål, lagringstid och känsliga
 * uppgifter samt vilka följdfrågor situationen väcker. Inga riktiga elevuppgifter.
 */

export type PurposeId = 'ovningar' | 'oversikt' | 'utveckla';
export type FieldId = 'namn' | 'elevid' | 'klass' | 'svar' | 'tid' | 'betyg' | 'stod' | 'adress' | 'foto' | 'inlogg' | 'chatt' | 'plats';
export type Need = 'kravs' | 'kanske' | 'onodig';
export type Storage = 'lektion' | 'termin' | 'kurs' | 'ar5' | 'alltid';

export const purposes: { id: PurposeId; name: string; description: string }[] = [
  { id: 'ovningar', name: 'Föreslå övningar', description: 'Läxkompis föreslår repetitionsövningar utifrån vad just du har svårt för.' },
  { id: 'oversikt', name: 'Översikt för läraren', description: 'Läraren ser vilka moment varje elev i klassen har svårt med, för att kunna hjälpa till.' },
  { id: 'utveckla', name: 'Förbättra övningarna', description: 'Leverantören vill se vilka övningar som är för svåra eller för lätta för att förbättra dem.' },
];

export const fields: { id: FieldId; name: string; example: string; sensitive?: boolean }[] = [
  { id: 'namn', name: 'Namn', example: 'Förnamn och efternamn' },
  { id: 'elevid', name: 'Pseudonymt elev-id', example: 'Slumpat nummer, t.ex. 48213 – skolan vet vem det är' },
  { id: 'klass', name: 'Klass', example: 'T.ex. NA22b' },
  { id: 'svar', name: 'Svar på övningar', example: 'Rätt eller fel per uppgift' },
  { id: 'tid', name: 'Tid per uppgift', example: 'Sekunder från start till svar' },
  { id: 'betyg', name: 'Betyg i tidigare kurser', example: 'Från skolans betygssystem' },
  { id: 'stod', name: 'Diagnos eller stödbehov', example: 'Uppgift om hälsa från elevhälsan', sensitive: true },
  { id: 'adress', name: 'Hemadress', example: 'Gatuadress och postnummer' },
  { id: 'foto', name: 'Profilbild', example: 'Foto på eleven' },
  { id: 'inlogg', name: 'Inloggningstider och enhet', example: 'När och från vilken dator eller mobil' },
  { id: 'chatt', name: 'Meddelanden till läraren', example: 'Fritext i verktygets chatt' },
  { id: 'plats', name: 'Platsdata', example: 'Var mobilen befinner sig' },
];

export const storages: { id: Storage; name: string; rank: number }[] = [
  { id: 'lektion', name: 'Raderas efter lektionen', rank: 0 },
  { id: 'termin', name: 'Till terminens slut', rank: 1 },
  { id: 'kurs', name: 'Tills kursen är avslutad', rank: 2 },
  { id: 'ar5', name: 'I 5 år', rank: 3 },
  { id: 'alltid', name: 'För alltid', rank: 4 },
];

const rank = (s: Storage) => storages.find((x) => x.id === s)!.rank;

/** Hur mycket varje uppgift behövs för varje ändamål (labbens antagande, motiveras i teacher.ts). */
export const need: Record<PurposeId, Record<FieldId, Need>> = {
  ovningar: { namn: 'onodig', elevid: 'kravs', klass: 'onodig', svar: 'kravs', tid: 'kanske', betyg: 'onodig', stod: 'onodig', adress: 'onodig', foto: 'onodig', inlogg: 'kanske', chatt: 'onodig', plats: 'onodig' },
  oversikt: { namn: 'kravs', elevid: 'kanske', klass: 'kravs', svar: 'kravs', tid: 'kanske', betyg: 'onodig', stod: 'onodig', adress: 'onodig', foto: 'onodig', inlogg: 'onodig', chatt: 'onodig', plats: 'onodig' },
  utveckla: { namn: 'onodig', elevid: 'onodig', klass: 'onodig', svar: 'kravs', tid: 'kanske', betyg: 'onodig', stod: 'onodig', adress: 'onodig', foto: 'onodig', inlogg: 'onodig', chatt: 'onodig', plats: 'onodig' },
};

/** Rimligt kortaste och längsta lagringstid för uppgifter som behövs, per ändamål. */
export const storageLimits: Record<PurposeId, { min: Storage; max: Storage }> = {
  ovningar: { min: 'termin', max: 'kurs' },
  oversikt: { min: 'termin', max: 'kurs' },
  utveckla: { min: 'lektion', max: 'termin' },
};

/** Följdfråga när en "kanske"-uppgift väljs. */
const maybeQuestion: Partial<Record<FieldId, string>> = {
  tid: 'Tid per uppgift: förbättrar den verkligen förslagen, eller räcker rätt/fel? Kan den avslöja något eleven inte vill visa, som att hen har svårt att koncentrera sig?',
  inlogg: 'Inloggningstider: behövs de för säkerheten (t.ex. att upptäcka intrång)? Då är det ett eget ändamål med egen, kort lagringstid.',
  elevid: 'Elev-id: räcker namn och klass för läraren, eller behövs id:t för att koppla ihop uppgifter? Välj det ena, inte båda om det går.',
};

const unnecessaryReason: Partial<Record<FieldId, string>> = {
  namn: 'Verktyget behöver inte veta vad eleven heter för att föreslå övningar – ett pseudonymt id räcker.',
  betyg: 'Gamla betyg säger mindre än elevens svar just nu och är uppgifter från ett annat sammanhang.',
  stod: 'Uppgifter om hälsa är känsliga och behövs inte – svaren visar vilka moment eleven har svårt med.',
  chatt: 'Fritext kan innehålla vad som helst, också känsliga uppgifter. Den behövs inte för ändamålet.',
  plats: 'Var eleven befinner sig har inget med ändamålet att göra.',
  adress: 'Hemadressen har inget med ändamålet att göra.',
  foto: 'En bild behövs inte för ändamålet och är en uppgift som lätt identifierar eleven.',
  klass: 'Klassen behövs inte för just detta ändamål.',
  elevid: 'För att förbättra övningarna räcker det att veta hur många som svarade rätt – inte vem som svarade.',
  tid: 'Tid per uppgift behövs inte för ändamålet.',
  inlogg: 'Inloggningstider behövs inte för ändamålet.',
  svar: '',
};

export interface Choice {
  on: boolean;
  keep: Storage;
}
export type Selection = Record<FieldId, Choice>;

export interface Evaluation {
  missing: FieldId[];
  unnecessary: FieldId[];
  sensitive: FieldId[];
  maybe: FieldId[];
  tooLong: FieldId[];
  tooShort: FieldId[];
  /** Antal valda uppgifter. */
  chosen: number;
  /** Antal problem: saknade + onödiga + för lång + för kort lagring. Känsliga onödiga räknas en gång. */
  problems: number;
  ok: boolean;
  messages: { kind: 'ok' | 'bad' | 'warn'; field?: FieldId; text: string }[];
  followUps: string[];
}

const fieldName = (f: FieldId) => fields.find((x) => x.id === f)!.name;

export function evaluate(purpose: PurposeId, sel: Selection): Evaluation {
  const n = need[purpose];
  const lim = storageLimits[purpose];
  const ids = fields.map((f) => f.id);
  const on = ids.filter((f) => sel[f].on);
  const missing = ids.filter((f) => n[f] === 'kravs' && !sel[f].on);
  const unnecessary = on.filter((f) => n[f] === 'onodig');
  const sensitive = on.filter((f) => fields.find((x) => x.id === f)!.sensitive);
  const maybe = on.filter((f) => n[f] === 'kanske');
  const needed = on.filter((f) => n[f] !== 'onodig');
  const tooLong = needed.filter((f) => rank(sel[f].keep) > rank(lim.max));
  const tooShort = on.filter((f) => n[f] === 'kravs' && rank(sel[f].keep) < rank(lim.min));

  const messages: Evaluation['messages'] = [];
  for (const f of missing) messages.push({ kind: 'bad', field: f, text: `${fieldName(f)} saknas – utan den går ändamålet inte att uppnå.` });
  for (const f of unnecessary) {
    const s = fields.find((x) => x.id === f)!.sensitive;
    messages.push({
      kind: 'bad',
      field: f,
      text: `${fieldName(f)}: behövs inte (dataminimering). ${unnecessaryReason[f] ?? ''}${s ? ' Det är dessutom en känslig uppgift om hälsa, som bara får behandlas i undantagsfall (GDPR art. 9).' : ''}`.trim(),
    });
  }
  for (const f of tooLong)
    messages.push({ kind: 'bad', field: f, text: `${fieldName(f)}: sparas längre än ändamålet kräver (lagringsminimering). Rimligt: högst ”${storages.find((s) => s.id === lim.max)!.name.toLowerCase()}”.` });
  for (const f of tooShort)
    messages.push({ kind: 'warn', field: f, text: `${fieldName(f)}: raderas för tidigt för att ändamålet ska fungera över tid. Rimligt: minst ”${storages.find((s) => s.id === lim.min)!.name.toLowerCase()}”.` });
  for (const f of maybe) messages.push({ kind: 'warn', field: f, text: maybeQuestion[f] ?? `${fieldName(f)}: kan behövas – motivera varför.` });

  const followUps = [
    'Vem är personuppgiftsansvarig – skolans huvudman eller leverantören? Finns ett avtal som styr vad leverantören får göra med uppgifterna?',
    'Hur får eleverna veta vilka uppgifter som samlas in, varför och hur länge? (GDPR art. 13)',
    'Vilken rättslig grund har skolan för behandlingen? (GDPR art. 6)',
    'Vem kan se uppgifterna – bara eleven och läraren, eller fler?',
  ];
  if (purpose === 'utveckla') followUps.push('Kan uppgifterna göras anonyma eller sammanställas innan leverantören får dem? Då behövs varken namn eller id.');
  if (purpose === 'oversikt') followUps.push('Ska läraren kunna se varje svar, eller räcker en sammanfattning per moment?');
  if (sensitive.length > 0) followUps.push('Om känsliga uppgifter ändå behandlas: vilket undantag i GDPR art. 9 skulle gälla, och behövs en konsekvensbedömning (art. 35)?');
  if (on.includes('chatt')) followUps.push('Vad händer med fritext där elever skriver om sådant som inte har med matte att göra?');
  followUps.push('Får uppgifterna användas till något annat senare, till exempel betygssättning? Det vore ett nytt ändamål som måste prövas för sig.');

  const problems = missing.length + unnecessary.length + tooLong.length + tooShort.length;
  if (problems === 0) messages.unshift({ kind: 'ok', text: `Uppgifterna och lagringstiderna passar ändamålet. ${maybe.length > 0 ? 'Motivera de uppgifter som är markerade med frågor.' : ''}`.trim() });

  return { missing, unnecessary, sensitive, maybe, tooLong, tooShort, chosen: on.length, problems, ok: problems === 0, messages, followUps };
}

/** Leverantörens förslag: mycket insamling, lång lagring. Startläget i labben. */
export function vendorProposal(): Selection {
  const on: FieldId[] = ['namn', 'elevid', 'klass', 'svar', 'tid', 'betyg', 'stod', 'inlogg', 'chatt'];
  return Object.fromEntries(fields.map((f) => [f.id, { on: on.includes(f.id), keep: 'ar5' as Storage }])) as Selection;
}

/** En minimal lösning för ett ändamål (används i tester och lärarhandledningen). */
export function minimalSelection(purpose: PurposeId): Selection {
  const lim = storageLimits[purpose];
  return Object.fromEntries(fields.map((f) => [f.id, { on: need[purpose][f.id] === 'kravs', keep: lim.max }])) as Selection;
}

export const isPurpose = (v: unknown): v is PurposeId => v === 'ovningar' || v === 'oversikt' || v === 'utveckla';
const isStorage = (v: unknown): v is Storage => storages.some((s) => s.id === v);

export function isSelection(v: unknown): v is Selection {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return fields.every((f) => {
    const c = s[f.id] as Choice | undefined;
    return typeof c === 'object' && c !== null && typeof c.on === 'boolean' && isStorage(c.keep);
  });
}
