/** Lärarstöd för slutprojektet (labb 27): arbetsformer och bedömningsstöd. */

export interface WorkForm {
  id: string;
  title: string;
  lessons: string;
  steps: string[];
  assessment: string;
}

export const workForms: WorkForm[] = [
  {
    id: 'individuellt',
    title: 'Individuellt',
    lessons: '3–4 lektioner',
    steps: [
      'Lektion 1: Eleven väljer problem och skriver mål, berörda och data (steg 1–2). Kort avstämning med läraren innan nästa lektion.',
      'Lektion 2: Metod och belägg (steg 3–4). Eleven öppnar de labbar hon eller han tänker använda och kontrollerar vad de faktiskt visar.',
      'Lektion 3: Fel, risker, mänsklig insyn och rekommendation (steg 5–6). Granskningslistan används som självkontroll.',
      'Lektion 4: Kamratläsning två och två med granskningslistan, revidering och utskrift till PDF eller nedladdning som textfil för inlämning.',
    ],
    assessment: 'Läraren bedömer den inlämnade rapporten. Passar för individuell bedömning och för elever som vill välja ett eget fiktivt problem.',
  },
  {
    id: 'par',
    title: 'I par',
    lessons: '3 lektioner + redovisning',
    steps: [
      'Paret arbetar vid en dator (arbetet sparas i den datorns webbläsare). Ladda ner textfilen i slutet av varje lektion så att båda har en kopia.',
      'Fördela ansvar men skriv tillsammans: den ena ansvarar för mål, data och metod, den andra för fel, risker och insyn. Byt och granska varandras delar.',
      'Belägg: varje person väljer minst en labb och förklarar för den andra vad den visar innan den skrivs in.',
      'Avsluta med att paret byter rapport med ett annat par och ger återkoppling med granskningslistan. Kort muntlig redovisning (3–5 min) av rekommendationen.',
    ],
    assessment: 'För individuell bedömning: komplettera med reflektionssidan eller ett kort individuellt samtal där varje elev förklarar ett belägg och en risk med egna ord.',
  },
  {
    id: 'kombination',
    title: 'Kombination',
    lessons: '3–4 lektioner',
    steps: [
      'Paret gör steg 1–4 tillsammans (problem, mål, data, metod och belägg).',
      'Varje elev laddar ner textfilen och gör steg 5–6 individuellt på sin egen dator genom att skriva vidare i guiden.',
      'Jämför sedan era rekommendationer: blev de olika? Varför?',
    ],
    assessment: 'Ger en gemensam grund men individuella bedömningsunderlag för risker, insyn och slutsats.',
  },
];

export interface RubricRow {
  criterion: string;
  /** Tre nivåer: enkel, välgrundad, välgrundad och nyanserad. */
  levels: [string, string, string];
}

export const rubricLevels: [string, string, string] = ['Enkel', 'Välgrundad', 'Välgrundad och nyanserad'];

export const rubric: RubricRow[] = [
  {
    criterion: 'Mål, data och metod',
    levels: [
      'Beskriver mål, data och metod på ett enkelt sätt. Metodvalet har en kort motivering.',
      'Beskriver hur målet mäts och vilka data som behövs och om vem. Motiverar metodvalet med en jämförelse med ett annat alternativ.',
      'Som välgrundad, och resonerar dessutom om datakvalitet, urval och vad som händer om målet mäts på fel sätt.',
    ],
  },
  {
    criterion: 'Belägg från kursen',
    levels: [
      'Väljer labbar som har med problemet att göra och återger vad de handlade om.',
      'Förklarar vilken mekanism varje labb visar och hur den gäller för det granskade systemet.',
      'Som välgrundad, och skiljer tydligt på belägg och egna antaganden samt diskuterar vad labbarna inte kan visa.',
    ],
  },
  {
    criterion: 'Fel och risker',
    levels: [
      'Nämner fel och risker som systemet kan medföra.',
      'Skiljer på olika feltyper och beskriver vem som drabbas och hur allvarligt det är.',
      'Som välgrundad, och väger feltyper mot varandra och diskuterar fel för olika grupper, integritet och lagstiftning.',
    ],
  },
  {
    criterion: 'Mänsklig insyn och ansvar',
    levels: [
      'Väljer en nivå av mänsklig insyn.',
      'Motiverar nivån utifrån felens konsekvenser och beskriver vem som ansvarar.',
      'Som välgrundad, och diskuterar förutsättningar för att insynen ska fungera (tid, kunskap, mandat, möjlighet att överklaga).',
    ],
  },
  {
    criterion: 'Rekommendation',
    levels: [
      'Ger en rekommendation med en kort motivering.',
      'Rekommendationen följer av granskningen och anger villkor eller vilket underlag som behövs.',
      'Som välgrundad, och visar hur rekommendationen skulle ändras om viktiga förutsättningar ändrades.',
    ],
  },
];

export const rubricNote =
  'Bedömningsstödet är ett eget förslag för webbplatsen, inte Skolverkets text. Nivåorden liknar progressionen i betygskriterierna (enligt sökresultat), men stäm av mot de betygskriterier som gäller för kursen innan ni använder det för betygssättning.';
