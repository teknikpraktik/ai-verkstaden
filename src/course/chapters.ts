import type { ChapterMeta } from './types';

/** Kapitlen i kursens ordning. Labbordningen här styr navigation och numrering. */
export const chapters: ChapterMeta[] = [
  {
    id: 'introduktion',
    number: 1,
    title: 'Introduktion till artificiell intelligens',
    shortTitle: 'Introduktion',
    intro: [
      'Vad menar vi egentligen när vi säger att ett system är AI? I det här kapitlet sorterar du vardagssystem, följer hur AI har utvecklats och tittar närmare på det som alla lärande system bygger på: data.',
      'Du kommer också att se att ett system som fungerar bra i genomsnitt ändå kan göra fler fel för vissa grupper – och att det inte räcker att kunna se hur en modell räknar för att veta om man kan lita på den.',
    ],
    goals: [
      'Skilja system med fasta regler från system som lär sig av data, och motivera gränsfall.',
      'Beskriva viktiga steg i AI:s historia och vad som drivit utvecklingen.',
      'Använda begreppen observation, egenskap och etikett om en datamängd.',
      'Jämföra felandelar mellan grupper med tydliga nämnare och förklara hur urvalet påverkar en modell.',
    ],
    labs: ['ar-det-ai', 'fran-expertregler-till-stora-modeller', 'vad-finns-i-datamangden', 'vem-far-fel-svar'],
  },
  {
    id: 'sokning',
    number: 2,
    title: 'Grundläggande begrepp och sökalgoritmer',
    shortTitle: 'Agenter och sökning',
    intro: [
      'En agent uppfattar sin omgivning och väljer handlingar för att nå ett mål. Många problem – från vägbeskrivningar till spel – kan beskrivas som att söka efter en följd av handlingar i en graf av tillstånd.',
      'Här programmerar du en enkel robot, bygger grafer och kör sökalgoritmer steg för steg så att du ser exakt vad de gör och varför de ibland hittar olika vägar.',
    ],
    goals: [
      'Beskriva en agent med mål, sensorinformation, tillstånd och handlingar.',
      'Representera ett problem som en graf med start, mål, kanter och kostnader.',
      'Förklara hur BFS, DFS, uniformkostnadssökning, girig sökning och A* skiljer sig åt.',
      'Förklara hur en spelande agent kan använda minimax för att välja drag.',
    ],
    labs: [
      'programmera-en-stadrobot',
      'bygg-en-graf',
      'bredden-forst-och-djupet-forst',
      'sok-med-kostnad-och-ledtrad',
      'tre-i-rad-mot-en-agent',
    ],
  },
  {
    id: 'maskininlarning',
    number: 3,
    title: 'Maskininlärning',
    shortTitle: 'Maskininlärning',
    intro: [
      'I maskininlärning skriver vi inte reglerna själva – vi låter en algoritm hitta mönster i exempel. Men vilka exempel vi väljer, hur vi mäter och hur vi testar avgör om resultatet går att lita på.',
      'Du tränar klassificerare och regressionsmodeller, delar upp data i tränings-, validerings- och testdel, hittar grupper utan facit, lär en agent med belöning och öppnar ett litet neuralt nätverk.',
    ],
    goals: [
      'Förklara skillnaden mellan klassificering, regression, klustring och förstärkningsinlärning.',
      'Använda tränings-, validerings- och testdata korrekt och känna igen överanpassning och dataläckage.',
      'Tolka en förväxlingsmatris och förklara varför ett totalt mått kan dölja olika feltyper.',
      'Beskriva hur ett neuralt nätverk räknar och tränas, och vad ett dolt lager tillför.',
    ],
    labs: [
      'trana-en-klassificerare',
      'forutsag-ett-tal',
      'trana-valj-och-testa',
      'grupper-utan-facit',
      'lar-en-agent-med-beloning',
      'oppna-ett-neuralt-natverk',
    ],
  },
  {
    id: 'sprak',
    number: 4,
    title: 'Naturlig språkbehandling (NLP)',
    shortTitle: 'Språkbehandling',
    intro: [
      'Datorer räknar med tal, men vi skriver med ord. Språkbehandling handlar om att göra text till data som går att räkna med – och om allt som går förlorat på vägen.',
      'Du delar upp svensk text i delar, bygger en liten textklassificerare och undersöker hur tvetydighet och sammanhang gör språk svårt, även för stora språkmodeller.',
    ],
    goals: [
      'Förklara tokenisering, stemming, lemmatisering och ordvektorer.',
      'Beskriva hur en bag-of-words-klassificerare fattar beslut och var den brister.',
      'Ge exempel på svensk tvetydighet och förklara hur sekvensprediktion fungerar i stora drag.',
    ],
    labs: ['gor-text-till-data', 'sortera-meddelanden', 'samma-mening-flera-tolkningar'],
  },
  {
    id: 'robotik',
    number: 5,
    title: 'Robotik',
    shortTitle: 'Robotik',
    intro: [
      'En robot är en agent med kropp: den mäter världen med sensorer, fattar beslut i ett styrprogram och påverkar världen med motorer. Allt det sker med brus, begränsad sikt och kartor som inte alltid stämmer.',
      'Du bygger en styrkedja, låter en robot planera om när världen förändras och väljer robotlösningar för verkliga typer av uppdrag.',
    ],
    goals: [
      'Beskriva kedjan sensor → styrprogram → motor och hur brus och begränsad sikt påverkar den.',
      'Förklara skillnaden mellan en robots karta och den faktiska miljön, och varför omplanering behövs.',
      'Motivera val av sensorer, autonominivå och villkor för mänskligt övertagande.',
    ],
    labs: ['styr-en-robot', 'hitta-fram-nar-kartan-forandras', 'valj-robot-for-ett-uppdrag'],
  },
  {
    id: 'etik',
    number: 6,
    title: 'Etik och lagstiftning',
    shortTitle: 'Etik och lag',
    intro: [
      'AI-system påverkar vad vi ser, vilka beslut som fattas om oss och vilka uppgifter som samlas in. Därför finns både etiska principer och lagar som EU:s AI-förordning och dataskyddsförordningen (GDPR).',
      'I kapitlet bygger du ett rekommendationsflöde, väger rättvisa mot andra mål, minimerar uppgifter i ett skolverktyg, undersöker hur regler träffar olika system och fattar ett beslut med flera intressenter.',
    ],
    goals: [
      'Förklara hur rekommendationssystem påverkar variation, integritet och datainsamling.',
      'Väga falskt positiva mot falskt negativa utfall och motivera en avvägning.',
      'Tillämpa ändamålsbegränsning och dataminimering på ett konkret fall.',
      'Beskriva huvuddragen i EU:s AI-förordning och GDPR och avgöra när mer information behövs.',
      'Motivera ett beslut om ett AI-system utifrån nytta, risk, ansvar och möjlighet till överprövning.',
    ],
    labs: [
      'bygg-ett-rekommendationsflode',
      'bedom-en-rattvisekonflikt',
      'vilka-uppgifter-behover-systemet',
      'hur-regleras-ett-ai-system',
      'besluta-om-ett-framtida-ai-system',
    ],
  },
];

/** Avslutningen är inget kapitel men ingår i labbordningen. */
export const finale = {
  id: 'avslutning' as const,
  title: 'Avslutning',
  labs: ['granska-ett-ai-system'],
};

export const labOrder: string[] = [...chapters.flatMap((c) => c.labs), ...finale.labs];
