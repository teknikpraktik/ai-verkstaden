/**
 * Labb 1: Är det AI? Vardagssystem att sortera, en liten regelmodell
 * (termostat) och en liten lärande modell (skräppostfilter tränat på tio
 * påhittade meddelanden).
 */

export type Category = 'regler' | 'larande' | 'kombination';
export const CATEGORIES: Category[] = ['regler', 'larande', 'kombination'];
export const categoryName: Record<Category, string> = {
  regler: 'Fasta regler',
  larande: 'Lärande system',
  kombination: 'Kombination',
};

export interface EverydaySystem {
  id: string;
  name: string;
  description: string;
  /** Välmotiverade svar med en förklaring för varje. */
  motivated: Partial<Record<Category, string>>;
  /** Förklaring när eleven väljer ett svar som är svårt att motivera. */
  otherwise: string;
}

export const systems: EverydaySystem[] = [
  {
    id: 'termostat',
    name: 'Termostaten på elementet',
    description: 'Släpper på varmvatten när rummet blir kallare än den inställda temperaturen.',
    motivated: { regler: 'En människa har bestämt regeln ”värm om det är för kallt”. Termostaten blir inte bättre av erfarenhet.' },
    otherwise: 'Termostaten följer en enda regel som någon har ställt in. Den lär sig ingenting av tidigare dagar.',
  },
  {
    id: 'miniraknare',
    name: 'Miniräknaren',
    description: 'Räknar ut 17 · 23 och visar svaret direkt.',
    motivated: { regler: 'Räknereglerna är inprogrammerade. Samma knapptryck ger alltid samma svar.' },
    otherwise: 'Miniräknaren följer matematikens regler exakt. Inget i den förändras av exempel.',
  },
  {
    id: 'skrappost',
    name: 'Skräppostfiltret i e-posten',
    description: 'Har tränats på stora mängder mejl som användare markerat som skräp. Det finns också listor över avsändare som alltid stoppas.',
    motivated: {
      larande: 'Kärnan är en modell som har lärt sig av exempel på skräppost och vanliga mejl.',
      kombination: 'Modellen har lärt sig av exempel, men listorna över blockerade avsändare är fasta regler.',
    },
    otherwise: 'Filtret har tränats på exempel som användare har markerat. Det är ett tecken på ett lärande system.',
  },
  {
    id: 'musik',
    name: 'Musiktjänstens låtförslag',
    description: 'Föreslår låtar utifrån vad du och personer med liknande smak har lyssnat på.',
    motivated: { larande: 'Förslagen bygger på mönster i lyssningsdata från många användare och ändras när ny data kommer in.' },
    otherwise: 'Ingen har skrivit en regel för varje låt. Förslagen kommer från mönster i vad miljontals användare har lyssnat på.',
  },
  {
    id: 'trafikljus',
    name: 'Trafikljuset med fast schema',
    description: 'Byter mellan rött och grönt efter ett tidsschema som kommunen har bestämt.',
    motivated: { regler: 'Schemat är bestämt i förväg och ändras inte av erfarenhet.' },
    otherwise: 'Ljuset följer ett fast schema. Det lär sig inte av hur trafiken brukar se ut.',
  },
  {
    id: 'ansikte',
    name: 'Ansiktsupplåsningen i mobilen',
    description: 'Känner igen ditt ansikte med en modell som tränats på många ansiktsbilder. Efter fem misslyckade försök måste du skriva koden.',
    motivated: {
      kombination: 'Igenkänningen är lärd från bilder, men regeln om fem försök är en fast regel som en människa har skrivit.',
      larande: 'Det som gör systemet ”smart” – att känna igen ansikten – kommer från en modell som har lärt sig av data.',
    },
    otherwise: 'Ingen kan skriva regler för hur alla ansikten ser ut. Igenkänningen kommer från en modell som har tränats på bilder.',
  },
  {
    id: 'karta',
    name: 'Kartappens vägförslag',
    description: 'Söker snabbaste väg i vägnätet med en sökalgoritm och uppskattar restiden utifrån hur trafiken brukar vara.',
    motivated: { kombination: 'Vägsökningen följer en fast metod, medan restiden uppskattas med en modell som har lärt sig av tidigare trafikdata.' },
    otherwise: 'Här samverkar två delar: en sökning som följer fasta steg och en uppskattning som bygger på data.',
  },
  {
    id: 'stavning',
    name: 'Rättstavningen i ordbehandlaren',
    description: 'Markerar ord som inte finns i ordlistan och föreslår liknande ord. Nyare versioner föreslår också ord utifrån sammanhanget.',
    motivated: {
      regler: 'Den grundläggande kontrollen – finns ordet i ordlistan? – är en fast regel.',
      kombination: 'Ordlistan är fasta regler, men förslag utifrån sammanhanget bygger ofta på en modell som har lärt sig av text.',
    },
    otherwise: 'Det beror på versionen: en ordlista är fasta regler, men sammanhangsförslag kräver en modell som har lärt sig av text.',
  },
  {
    id: 'dorr',
    name: 'Den automatiska dörren i affären',
    description: 'Öppnas när en rörelsesensor känner av något framför dörren.',
    motivated: { regler: '”Om rörelse – öppna” är en fast regel. Sensorn gör inte dörren lärande.' },
    otherwise: 'En sensor gör inte ett system lärande. Dörren följer regeln ”om rörelse – öppna”.',
  },
];

export const isMotivated = (s: EverydaySystem, c: Category) => c in s.motivated;
export const borderlineCases = () => systems.filter((s) => Object.keys(s.motivated).length > 1);

export type Answers = Record<string, Category>;

export function scoreAnswers(answers: Answers) {
  const answered = systems.filter((s) => answers[s.id] !== undefined);
  const motivated = answered.filter((s) => isMotivated(s, answers[s.id]!));
  return { answered: answered.length, motivated: motivated.length, total: systems.length };
}

export const isAnswers = (v: unknown): v is Answers =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && Object.values(v).every((c) => CATEGORIES.includes(c as Category));

/* ---------- Termostaten: en regelmodell ---------- */

export type HeatAction = 'värmer' | 'av';

/** Värmer om rummet är kallare än inställd temperatur minus 0,5 grader. */
export function thermostat(roomTemp: number, setpoint: number): HeatAction {
  return roomTemp < setpoint - 0.5 ? 'värmer' : 'av';
}

/* ---------- Skräppostfiltret: en lärande modell ---------- */

export interface Message {
  text: string;
  spam: boolean;
}

/** Tio påhittade träningsmeddelanden. */
export const trainingMessages: Message[] = [
  { text: 'Vinn en gratis resa, klicka här', spam: true },
  { text: 'Grattis, du har vunnit ett presentkort! Klicka här', spam: true },
  { text: 'Gratis mobil om du svarar nu', spam: true },
  { text: 'Ditt paket väntar, betala tullavgift via länken', spam: true },
  { text: 'Vinn pengar nu, klicka på länken', spam: true },
  { text: 'Grattis på födelsedagen! Vi ses på lördag', spam: false },
  { text: 'Glöm inte matteprovet på fredag', spam: false },
  { text: 'Kan du hämta paketet på posten?', spam: false },
  { text: 'Träningen börjar klockan sex', spam: false },
  { text: 'Tack för hjälpen med läxan', spam: false },
];

export function tokenize(text: string): string[] {
  return [...new Set(text.toLowerCase().split(/[^a-zåäöéü]+/u).filter(Boolean))];
}

/**
 * Träning: varje ord får poängen (antal skräpmeddelanden där ordet finns)
 * minus (antal vanliga meddelanden där ordet finns).
 */
export function trainSpamModel(messages: Message[]): Map<string, number> {
  const w = new Map<string, number>();
  for (const m of messages) for (const t of tokenize(m.text)) w.set(t, (w.get(t) ?? 0) + (m.spam ? 1 : -1));
  return w;
}

export const spamModel = trainSpamModel(trainingMessages);

export interface SpamVerdict {
  score: number;
  verdict: 'skräp' | 'inte skräp' | 'vet inte';
  known: { word: string; weight: number }[];
  unknown: string[];
}

/** Summerar ordens poäng. Över 0: skräp. Under 0: inte skräp. Exakt 0: modellen vet inte (släpper igenom). */
export function classifyMessage(text: string, model: Map<string, number> = spamModel): SpamVerdict {
  const tokens = tokenize(text);
  const known = tokens.filter((t) => model.has(t)).map((t) => ({ word: t, weight: model.get(t)! }));
  const unknown = tokens.filter((t) => !model.has(t));
  const score = known.reduce((s, k) => s + k.weight, 0);
  return { score, verdict: score > 0 ? 'skräp' : score < 0 ? 'inte skräp' : 'vet inte', known, unknown };
}

export interface Situation {
  id: string;
  title: string;
  /** Meddelandet som skräppostfiltret får, eller null för termostatsituationen. */
  message: string | null;
  context: string;
  human: string;
  /** Vilken mänsklig förmåga situationen främst visar. */
  ability: 'förståelse' | 'generalisering' | 'erfarenhet' | 'situationsbedömning';
}

export const situations: Situation[] = [
  {
    id: 'vanlig',
    title: 'Ett typiskt skräpmejl',
    message: 'Vinn en gratis resa till Grekland!',
    context: 'Okänd avsändare.',
    human: 'Du känner igen tonen från tidigare skräppost och raderar mejlet.',
    ability: 'erfarenhet',
  },
  {
    id: 'mentor',
    title: 'Mejl från din mentor',
    message: 'Klicka här för att se schemat för friluftsdagen',
    context: 'Avsändaren är din mentor, och friluftsdagen är på torsdag.',
    human: 'Du vet vem mentorn är och att friluftsdagen är på riktigt. Mejlet är viktigt.',
    ability: 'förståelse',
  },
  {
    id: 'engelska',
    title: 'Skräppost på engelska',
    message: 'Congratulations, you won a free trip',
    context: 'Okänd avsändare.',
    human: 'Du ser direkt att det är samma sorts lockbete, bara på ett annat språk.',
    ability: 'generalisering',
  },
  {
    id: 'fonster',
    title: 'Termostaten och det öppna fönstret',
    message: null,
    context: 'Det är −10 °C ute och någon har glömt ett fönster öppet. Rummet är 16 °C och termostaten är inställd på 21 °C.',
    human: 'Du stänger fönstret i stället för att värma upp hela kvarteret.',
    ability: 'situationsbedömning',
  },
];
