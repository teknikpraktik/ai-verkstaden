import { defineLab } from '../../course/types';

export default defineLab({
  id: 'lar-en-agent-med-beloning',
  number: 14,
  part: 'maskininlarning',
  title: 'Lär en agent med belöning',
  summary: 'Träna en robotdammsugare med Q-inlärning steg för steg, frys modellen för ett prov och se vad en dåligt formulerad belöning leder till.',
  goals: [
    'Beskriva förstärkningsinlärning med begreppen tillstånd, handling, belöning och utforskning.',
    'Räkna ut en Q-uppdatering för hand och följa hur Q-tabellen växer fram.',
    'Förklara varför en tränad modell ska frysas och prövas separat.',
    'Ge exempel på hur en dåligt formulerad belöning ger ett oavsiktligt beteende.',
  ],
  prerequisites: ['Kunna sätta in tal i en formel.'],
  prerequisiteLabs: ['trana-valj-och-testa'],
  minutes: [15, 20],
  concepts: ['forstarkningsinlarning', 'agent', 'tillstand', 'handling', 'beloning', 'q-inlarning', 'utforskning', 'startvarde', 'hyperparameter'],
  keywords: ['förstärkningsinlärning', 'Q-inlärning', 'Q-tabell', 'belöning', 'utforskning', 'epsilon', 'agent', 'rutvärld', 'belöningshackning', 'robotdammsugare'],
  coverage: [
    {
      topic: 'Liten rutmiljö med tabellbaserad Q-inlärning',
      outcome: 'Eleven tränar en agent i en 4 × 5-värld och läser Q-tabellen för varje ruta.',
      verification: 'logic.test.ts (miljö, reproducerbar träning); Playwright kapitel3.spec.ts (labb 14)',
    },
    {
      topic: 'Visa tillstånd, handling, belöning och utforskning när agenten tränar',
      outcome: 'Eleven stegar och pausar träningen och läser tillstånd, handling, belöning, utforskning och Q-ändring i varje steg.',
      verification: 'Playwright kapitel3.spec.ts (första steget visar Q 0,00 → −0,50); fråga forsta-q',
    },
    {
      topic: 'Ändra belöningsregler',
      outcome: 'Eleven byter belöningsregel (en regel i taget i genomgången, egna regler i experimentläget) och tränar om.',
      verification: 'logic.test.ts (bra och dålig belöning); manuell kontroll av reglagen',
    },
    {
      topic: 'Frysa modellen för ett separat prov',
      outcome: 'Eleven fryser modellen och ser att den når laddstationen på 7 steg utan inlärning och utforskning.',
      verification: 'logic.test.ts (fryst prov 7 steg, summa 4); Playwright kapitel3.spec.ts',
    },
    {
      topic: 'Oavsiktlig följd av dåligt formulerad belöning',
      outcome: 'Eleven ser att +1 per steg får roboten att köra in i en vägg i 40 steg i stället för att åka hem.',
      verification: 'logic.test.ts (dålig belöning ⇒ tiden tar slut); fråga dalig-foljd',
    },
    {
      topic: 'Q-uppdatering (fördjupning)',
      outcome: 'Eleven räknar ut Q-uppdateringen för hand.',
      verification: 'logic.test.ts (handräknade exempel 0,45, −0,5 och 7)',
    },
  ],
  labels: ['simulering', 'forenklad'],
});
