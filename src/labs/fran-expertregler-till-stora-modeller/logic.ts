/**
 * Labb 2: milstolpar i AI:s historia. Bara väletablerade händelser, med
 * årtal som finns i standardverk om AI:s historia (se teacher.ts, källor).
 */

export type Driver = 'data' | 'berakning' | 'algoritmer' | 'investeringar';
export const DRIVERS: Driver[] = ['data', 'berakning', 'algoritmer', 'investeringar'];
export const driverName: Record<Driver, string> = {
  data: 'Data',
  berakning: 'Beräkningskraft',
  algoritmer: 'Algoritmer',
  investeringar: 'Investeringar',
};
export const driverSymbol: Record<Driver, string> = { data: 'D', berakning: 'B', algoritmer: 'A', investeringar: 'I' };

export interface Milestone {
  id: string;
  /** Årtal som används för ordningen. */
  year: number;
  /** Årtal som det visas för eleven. */
  when: string;
  title: string;
  text: string;
  drivers: Partial<Record<Driver, string>>;
}

export const milestones: Milestone[] = [
  {
    id: 'dartmouth',
    year: 1956,
    when: '1956',
    title: 'Mötet i Dartmouth',
    text: 'Forskare samlas under en sommar vid Dartmouth College i USA för att undersöka om maskiner kan efterlikna intelligens. Begreppet ”artificial intelligence” kommer från ansökan till mötet.',
    drivers: { investeringar: 'Mötet betalades av ett forskningsbidrag. Under de följande decennierna kom mycket av pengarna till AI-forskning från staten.' },
  },
  {
    id: 'eliza',
    year: 1966,
    when: '1966',
    title: 'Chattprogrammet ELIZA',
    text: 'Joseph Weizenbaum vid MIT bygger ett program som låtsas vara samtalsterapeut. Det letar efter nyckelord och svarar med färdiga mallar – utan att förstå något.',
    drivers: { algoritmer: 'En ny idé: enkla mönsterregler som gör om användarens meningar till frågor.' },
  },
  {
    id: 'expertsystem',
    year: 1975,
    when: '1970- och 1980-talen',
    title: 'Expertsystemen',
    text: 'Experters kunskap skrivs ned som hundratals ”om … så …”-regler, till exempel i MYCIN som gav råd om infektioner. Under 1980-talet satsar många företag på expertsystem.',
    drivers: {
      algoritmer: 'Regelmotorer som kunde kedja ihop många regler.',
      investeringar: 'Företag och stater satsade stora summor på expertsystem under 1980-talet.',
    },
  },
  {
    id: 'deepblue',
    year: 1997,
    when: '1997',
    title: 'Deep Blue slår världsmästaren i schack',
    text: 'IBM:s schackdator Deep Blue vinner en match mot världsmästaren Garri Kasparov. Den söker igenom hundratals miljoner ställningar per sekund.',
    drivers: {
      berakning: 'Specialbyggda schackkretsar gjorde det möjligt att söka mycket djupare än tidigare.',
      investeringar: 'Ett stort företag satsade flera år och egen hårdvara på projektet.',
    },
  },
  {
    id: 'alexnet',
    year: 2012,
    when: '2012',
    title: 'AlexNet vinner ImageNet-tävlingen',
    text: 'Ett neuralt nätverk med många lager känner igen föremål i bilder mycket bättre än tidigare metoder i tävlingen ImageNet. Genombrottet startar den moderna vågen av djupinlärning.',
    drivers: {
      data: 'ImageNet-tävlingen hade över en miljon märkta träningsbilder.',
      berakning: 'Nätverket tränades på grafikkort (GPU), som kan göra väldigt många beräkningar samtidigt.',
    },
  },
  {
    id: 'alphago',
    year: 2016,
    when: '2016',
    title: 'AlphaGo slår Lee Sedol i go',
    text: 'DeepMinds program AlphaGo vinner med 4–1 mot en av världens bästa gospelare. Go har så många möjliga ställningar att det inte går att söka igenom dem som i schack.',
    drivers: {
      algoritmer: 'Neurala nätverk kombinerades med sökning och förstärkningsinlärning genom spel mot sig själv.',
      berakning: 'Träningen krävde mycket stor beräkningskraft.',
    },
  },
  {
    id: 'transformer',
    year: 2017,
    when: '2017',
    title: 'Transformern presenteras',
    text: 'Forskare på Google publicerar artikeln ”Attention Is All You Need” med en ny typ av neuralt nätverk: transformern. Den blir grunden för nästan alla stora språkmodeller.',
    drivers: { algoritmer: 'En ny arkitektur som kan träna på mycket text parallellt och väga ihop ord i ett långt sammanhang.' },
  },
  {
    id: 'chatgpt',
    year: 2022,
    when: 'november 2022',
    title: 'ChatGPT släpps',
    text: 'OpenAI släpper chattjänsten ChatGPT, byggd på en stor språkmodell. Den fick enligt uppskattningar över hundra miljoner användare inom några månader och gjorde AI till vardag för många.',
    drivers: {
      data: 'Språkmodellen tränades på enorma mängder text.',
      berakning: 'Träningen krävde tusentals specialiserade processorer under lång tid.',
      algoritmer: 'Bygger på transformern och på träning med mänsklig återkoppling.',
      investeringar: 'Mycket stora investeringar från techföretag gjorde träningen möjlig.',
    },
  },
];

export const byId = new Map(milestones.map((m) => [m.id, m]));
export const correctOrder = [...milestones].sort((a, b) => a.year - b.year).map((m) => m.id);

/** Startordning: blandad men fast, så att alla elever börjar likadant. */
export const startOrder = ['deepblue', 'chatgpt', 'eliza', 'alphago', 'dartmouth', 'transformer', 'expertsystem', 'alexnet'];

export function move(order: string[], index: number, delta: -1 | 1): string[] {
  const j = index + delta;
  if (index < 0 || index >= order.length || j < 0 || j >= order.length) return order;
  const next = [...order];
  [next[index], next[j]] = [next[j]!, next[index]!];
  return next;
}

export interface OrderCheck {
  /** Hur många som står på rätt plats. */
  correctPositions: number;
  total: number;
  /** Antal par som står i fel ordning sinsemellan (0 = helt rätt). */
  inversions: number;
  /** Första granne-par som står i fel ordning, för en ledtråd. */
  firstSwap: [string, string] | null;
  done: boolean;
}

export function checkOrder(order: string[]): OrderCheck {
  const year = (id: string) => byId.get(id)?.year ?? 0;
  let inversions = 0;
  for (let i = 0; i < order.length; i++) for (let j = i + 1; j < order.length; j++) if (year(order[i]!) > year(order[j]!)) inversions++;
  let firstSwap: [string, string] | null = null;
  for (let i = 0; i + 1 < order.length; i++) {
    if (year(order[i]!) > year(order[i + 1]!)) {
      firstSwap = [order[i]!, order[i + 1]!];
      break;
    }
  }
  const correctPositions = order.filter((id, i) => correctOrder[i] === id).length;
  return { correctPositions, total: order.length, inversions, firstSwap, done: inversions === 0 && order.length === correctOrder.length };
}

export const isOrder = (v: unknown): v is string[] =>
  Array.isArray(v) && v.length === milestones.length && v.every((x) => typeof x === 'string' && byId.has(x)) && new Set(v).size === v.length;

export const milestonesWith = (d: Driver) => milestones.filter((m) => d in m.drivers).map((m) => m.id);
