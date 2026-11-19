import { defineLab } from '../../course/types';

export default defineLab({
  id: 'vad-finns-i-datamangden',
  number: 3,
  part: 'introduktion',
  title: 'Vad finns i datamängden?',
  summary: 'Inspektera och ändra ett syntetiskt dataset och upptäck obalans.',
  goals: [
    'Peka ut observation, egenskap och etikett i en datamängd med konkreta exempel.',
    'Jämföra hur samma sak beskrivs som bilddata, textdata och tabelldata.',
    'Hitta obalans i en datamängd och beskriva den med andelar.',
    'Förklara varför fler exempel från samma urval inte tar bort en skev fördelning.',
  ],
  prerequisites: ['Kunna räkna ut en andel i procent.'],
  prerequisiteLabs: ['ar-det-ai'],
  minutes: [15, 20],
  concepts: ['datamangd', 'observation', 'egenskap', 'etikett', 'obalans', 'urval', 'traningsdata', 'syntetisk-data'],
  keywords: ['datamängd', 'dataset', 'observation', 'egenskap', 'etikett', 'bilddata', 'textdata', 'tabelldata', 'obalans', 'urval', 'pixlar'],
  coverage: [
    {
      topic: 'Inspektera och ändra ett syntetiskt dataset',
      outcome: 'Eleven väljer observationer i tabellen och ändrar etikett, fläckar och vikt eller tar bort och samlar in äpplen i experimentläget.',
      verification: 'Playwright: tests/e2e/kapitel1.spec.ts (labb 3: experimentläge ändrar och tömmer datamängden); logic.test.ts (tom datamängd)',
    },
    {
      topic: 'Visa observation, egenskap och etikett med konkreta exempel',
      outcome: 'Eleven skiljer etiketten ”kasseras” från egenskapen ”4 fläckar” och observationen ”rad 8”.',
      verification: 'Fråga vad-ar-etikett med förklarade felsvar; kapitel1.spec.ts (fel → återkoppling → rätt)',
    },
    {
      topic: 'Jämför bild-, text- och tabelldata',
      outcome: 'Eleven ser samma äpple som tabellrad, 8 × 8-bild (även som tal) och text och förklarar skillnaden.',
      verification: 'logic.test.ts (äpple nr 8 som tabellrad, bild och text); fråga tre-former',
    },
    {
      topic: 'Hitta obalans',
      outcome: 'Eleven räknar ut att 3 av 20 (15 %) kasseras och att inga äpplen är gröna.',
      verification: 'logic.test.ts (startdatamängden, hittar obalans); fråga andel-kasseras',
    },
    {
      topic: 'Visa följden av att samla in fler exempel från samma urval',
      outcome: 'Eleven samlar in 20 äpplen till från gård A (fortfarande 0 gröna, 15 % kasserade) och jämför med 20 från gård B (11 gröna).',
      verification: 'logic.test.ts (20 fler från samma gård / annan gård); kapitel1.spec.ts (insamling i genomgången)',
    },
  ],
  labels: ['syntetisk', 'pahittad'],
});
