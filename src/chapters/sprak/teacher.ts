import { defineChapterTeacher } from '../../course/types';

export default defineChapterTeacher({
  lessons: [
    {
      title: 'Lektion 1: Från text till data och en första textmodell',
      minutes: 70,
      plan: [
        '10 min – Uppstart: skriv ”Hundarna sprang” på tavlan. Fråga hur en dator ska veta att det handlar om hundar som springer.',
        '20 min – Labb 16 *Gör text till data* i genomgångsläget, gärna i par. Stanna efter stemmingen och jämför elevernas exempel på konstiga stammar.',
        '25 min – Labb 17 *Sortera meddelanden*. Låt alla göra förutsägelsen om ”inte” innan de går vidare. Samla klassens försök att lura modellen.',
        '10 min – Helklass: gå igenom de reserverade exemplen. Vilket fel är värst för eleverna?',
        '5 min – Exit ticket: kontrollfrågorna om token och om negation i kunskapskontrollen.',
      ],
    },
    {
      title: 'Lektion 2: Tvetydighet, moderering och språkmodeller',
      minutes: 70,
      plan: [
        '10 min – Uppstart: eleverna hittar på egna tvetydiga meningar och särskrivningar.',
        '25 min – Labb 18 *Samma mening, flera tolkningar*, steg 1–5. Diskutera i helklass vem som drabbas av de två modereringsreglerna.',
        '15 min – Labb 18 steg 6–7: nästa ord. Låt eleverna jämföra girig och slumpad generering och hitta när modellen tystnar.',
        '15 min – Kunskapskontrollen för kapitlet. Den öppna frågan om språkmodeller kan lämnas in eller diskuteras.',
        '5 min – Avrundning: vad har en bag-of-words-modell, en bigrammodell och en stor språkmodell gemensamt?',
      ],
    },
  ],
  checkAnswers: [
    { question: 'Hur många token blir ”Katten sover. Hunden springer!”?', answer: ['6: fyra ord och två skiljetecken. Vanligt felsvar: 4 (bara orden).'] },
    { question: 'Vilket påstående om stemming och lemmatisering stämmer?', answer: ['Lemmatisering kan ge ”springa” för både ”sprang” och ”springer” om orden finns i ordlistan. Stemming kan ge stammar som inte är ord, och ordlistan klarar inte nya ord.'] },
    { question: 'Vad händer troligast med ”Mötet är inte inställt” i en bag-of-words-modell?', answer: ['Beslutet blir nästan detsamma. Modellen räknar bara ord och ser inte att ”inte” hör till ”inställt” (jämför labb 17: poängen sjönk från +3,54 till +3,53).'] },
    { question: 'Vad avgör beslutet när inget ord fanns i träningsdata?', answer: ['Bara förhandsläget, alltså hur vanliga klasserna var i träningsdata. Är de lika vanliga blir det oavgjort.'] },
    { question: 'Ett skolforum stoppar alla kommentarer med ordet ”slå”. Vilka påståenden stämmer?', answer: ['Rätt: eleven som frågar om att slå upp ord kan stoppas, och den som citerar ett hot för att anmäla det kan tystas. Fel: regeln stoppar inte hot utan ordet, och en enkel regel är inte automatiskt rättvis.'] },
    { question: 'Bigrammodell: ”en” följs av bok 3, katt 2, text 1. Vilket påstående stämmer?', answer: ['P(bok | en) = 3/6 = 50 %, och girig generering väljer alltid ”bok”. Modellen ser bara det senaste ordet.'] },
    {
      question: 'Vad har en bigrammodell och en stor språkmodell gemensamt, och vad skiljer dem åt?',
      answer: [
        'Exempelresonemang: Båda förutsäger nästa token utifrån sannolikheter som de har lärt sig av text. Bigrammodellen i labb 18 har bara räknat 71 ordpar från 20 meningar och ser ett ord bakåt. En stor språkmodell har miljarder parametrar, är tränad på enorma textmängder och använder tusentals token av sammanhang. Därför kan den ofta välja en rimlig tolkning av ”Jag såg mannen med kikaren” om det finns sammanhang före – bigrammodellen ser bara ”med” och tycker att kikaren och hatten är lika sannolika. Men även en stor modell kan välja fel tolkning eller skriva något som låter rimligt men är fel.',
      ],
    },
  ],
  notes: [
    'Kapitlet bygger på syntetiska svenska exempel. Uppmuntra eleverna att pröva egna meningar – all text sparas bara lokalt i webbläsaren.',
    'Undvik exakta siffror om enskilda AI-produkter. Tala om storleksordningar (”miljarder parametrar”) och om grundidén nästa-token-prediktion.',
  ],
});
