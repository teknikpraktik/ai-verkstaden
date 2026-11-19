import type { QuestionSpec } from '../../components/lab/Questions';

/** Kunskapskontroll för kapitel 6 · Etik och lagstiftning. Facit i teacher.ts. */
const check: QuestionSpec[] = [
  {
    kind: 'choice',
    id: 'etik-flode',
    prompt: 'Ett flöde ger alla platser åt det du klickat mest på. Vad händer med variationen om du klickar på samma ämne många gånger?',
    options: [
      { id: 'minskar', text: 'Den minskar, eftersom ämnet med flest klick får allt större chans att visas', correct: true },
      { id: 'okar', text: 'Den ökar, eftersom systemet vill visa nytt', feedback: 'Systemet visar bara annat om det är byggt för det, som variationsläget i labb 22. I engagemangsläget blev det 1 ämne av 6 bland de 12 senaste inläggen.' },
      { id: 'samma', text: 'Den påverkas inte, flödet är slumpmässigt', feedback: 'Slumpen styrs av vikter som bygger på dina klick. Därför förändras fördelningen när du klickar.' },
    ],
    explanation: 'När utrymmet följer klicken förstärks det du redan valt. Den som bygger flödet kan välja att reservera plats för annat.',
  },
  {
    kind: 'choice',
    id: 'etik-troskel',
    prompt: 'Ett system utreder ansökningar med riskpoäng över en tröskel. Vad händer oftast om tröskeln höjs?',
    options: [
      { id: 'byte', text: 'Färre falskt positiva men fler falskt negativa', correct: true },
      { id: 'battre', text: 'Både falskt positiva och falskt negativa minskar', feedback: 'En tröskel byter en feltyp mot en annan. I labb 23 minskade onödiga utredningar men missade fel ökade (Norr: 1 → 3 av 8).' },
      { id: 'tvart', text: 'Fler falskt positiva men färre falskt negativa', feedback: 'Det är tvärtom: med högre tröskel säger systemet ”ja” mer sällan, så färre korrekta ansökningar utreds i onödan.' },
    ],
    explanation: 'Högre tröskel → systemet säger ja mer sällan → färre falsklarm, fler missar.',
  },
  {
    kind: 'numeric',
    id: 'etik-namnare',
    prompt: 'I ett område finns 24 korrekta och 16 felaktiga ansökningar. 6 av de korrekta utreds i onödan. Hur stor andel (i procent) av de korrekta utreds i onödan?',
    answer: 25,
    unit: '%',
    wrong: [
      { value: 15, feedback: '15 % får du om du delar med alla 40 ansökningar. Andelen onödiga utredningar ska räknas bland de korrekta: 6 av 24.' },
      { value: 38, feedback: '38 % får du om du delar med de 16 felaktiga. Nämnaren ska vara de 24 korrekta.' },
    ],
    hint: 'Dela antalet onödiga utredningar med antalet korrekta ansökningar.',
    explanation: '6 av 24 = 25 %. Nämnaren ska vara den grupp som felet kan drabba.',
  },
  {
    kind: 'choice',
    id: 'etik-minimering',
    prompt: 'Ett matteverktyg ska föreslå övningar. Vilken princip bryter det mot om det också samlar in elevernas hemadress?',
    options: [
      { id: 'min', text: 'Dataminimering', correct: true },
      { id: 'lagring', text: 'Lagringsminimering', feedback: 'Lagringsminimering handlar om hur länge uppgifter sparas. Här är problemet att uppgiften inte behövs alls.' },
      { id: 'transparens', text: 'Transparens', feedback: 'Transparens kan också vara ett problem om eleverna inte informeras, men det grundläggande felet är att uppgiften inte behövs för ändamålet.' },
    ],
    explanation: 'Dataminimering: bara de uppgifter som behövs för ändamålet. Hemadressen behövs inte för att föreslå övningar.',
  },
  {
    kind: 'choice',
    id: 'etik-andamal',
    prompt: 'Uppgifter som samlats in för att föreslå övningar ska nu användas för att sätta betyg. Vad gäller?',
    options: [
      { id: 'prova', text: 'Det är ett nytt ändamål som måste prövas för sig', correct: true },
      { id: 'ok', text: 'Det går bra eftersom uppgifterna redan finns', feedback: 'Att uppgifterna finns gör inte ett nytt ändamål tillåtet. Ändamålsbegränsningen kräver att nya användningar inte är oförenliga med det ursprungliga ändamålet.' },
    ],
    explanation: 'Ändamålsbegränsning (GDPR art. 5). Dessutom räknas AI som bedömer läranderesultat som högrisk enligt AI-förordningen.',
  },
  {
    kind: 'choice',
    id: 'etik-klass',
    prompt: 'Hur behandlar EU:s AI-förordningen ett AI-system som tolkar elevers känslor från ansiktsuttryck i klassrummet (inte av medicinska skäl eller säkerhetsskäl)?',
    options: [
      { id: 'forbjuden', text: 'Det är förbjudet (art. 5)', correct: true },
      { id: 'hog', text: 'Det är högrisk men tillåtet', feedback: 'Känsloigenkänning kan vara högrisk i andra sammanhang, men i utbildningsinstitutioner och på arbetsplatser är den förbjuden (art. 5.1 f) om inte undantaget för medicinska skäl eller säkerhetsskäl gäller.' },
      { id: 'info', text: 'Det räcker att eleverna informeras', feedback: 'Information räcker inte här. Användningen är förbjuden i skolor (art. 5.1 f).' },
    ],
    explanation: 'Förbudet i art. 5.1 f har tillämpats sedan 2 februari 2025.',
  },
  {
    kind: 'choice',
    id: 'etik-datum',
    prompt: 'AI-förordningen trädde i kraft 1 augusti 2024. Vad betyder det?',
    options: [
      { id: 'bindande', text: 'Att förordningen blev bindande – men de flesta regler började tillämpas senare', correct: true },
      { id: 'alla', text: 'Att alla regler gällde från den dagen', feedback: 'Ikraftträdande och tillämpning är olika saker. Förbuden tillämpas från 2 februari 2025, huvuddelen från 2 augusti 2026 och högriskkraven i bilaga III från 2 december 2027 (efter ändringen genom (EU) 2026/1744).' },
      { id: 'forslag', text: 'Att förordningen fortfarande bara var ett förslag', feedback: 'Den var antagen och publicerad i EU:s officiella tidning 12 juli 2024. Ikraftträdandet betyder att den är bindande lag.' },
    ],
    explanation: 'Ikraftträdande = lagen är bindande. Tillämpning = en viss regel måste följas. För AI-förordningen sker tillämpningen stegvis.',
  },
  {
    kind: 'open',
    id: 'etik-beslut',
    prompt: 'En kommun vill använda AI för att prioritera vilka elever som får extra studiehjälp. Vilka fakta behöver kommunen ta reda på innan den bestämmer sig, och vilka villkor skulle du ställa?',
    criteria: [
      'Jag frågar hur systemets resultat används och om det påverkar beslut om eleverna.',
      'Jag tar upp vilka uppgifter som behövs (dataminimering) och hur länge de sparas.',
      'Jag tar upp risken för att felen drabbar vissa grupper mer.',
      'Jag föreslår mänsklig tillsyn och ett sätt för eleven att överpröva beslutet.',
    ],
  },
];

export default check;
