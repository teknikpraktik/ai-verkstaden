import { defineLab } from '../../course/types';

export default defineLab({
  id: 'styr-en-robot',
  number: 19,
  part: 'robotik',
  title: 'Styr en robot',
  summary: 'Bygg kedjan sensor → styrprogram → motor för en städrobot och se vad hinder, begränsad sikt och sensorbrus gör med besluten.',
  goals: [
    'Beskriva kedjan sensor → styrprogram → motor och följa mätvärde, beslut och konsekvens i varje steg.',
    'Förklara hur en regel som ”om avståndet är mindre än X, sväng” avgör om roboten krockar.',
    'Visa med exempel hur begränsad sikt och sensorbrus leder till felaktiga beslut, och hur en säkerhetsmarginal hjälper men kostar.',
  ],
  prerequisites: ['Inga särskilda förkunskaper. Det hjälper att känna till begreppet agent från kapitel 1.'],
  prerequisiteLabs: [],
  minutes: [15, 20],
  concepts: ['robot', 'sensor', 'stalldon', 'styrprogram', 'sensorbrus', 'sakerhetsmarginal', 'agent', 'regelbaserat-system'],
  keywords: ['robot', 'sensor', 'avståndssensor', 'motor', 'ställdon', 'styrprogram', 'regel', 'brus', 'sikt', 'räckvidd', 'krock', 'städrobot', 'säkerhetsmarginal'],
  coverage: [
    {
      topic: 'Bygg en kedja mellan sensor, styrprogram och motor',
      outcome: 'Eleven ser i varje steg vad sensorn mätte, vilken regel som valde beslutet och vad motorn gjorde, och kan i experimentläget ändra sensor, regel och motor.',
      verification: 'Playwright: tests/e2e/kapitel5.spec.ts (kedjan i steg 8, fråga kedja-steg8); enhetstest logic.test.ts (beslut och steg 8)',
    },
    {
      topic: 'Prova hinder',
      outcome: 'Eleven ser roboten svänga vid en väska och felsöker en regel (gränsen 0) som leder till 26 krockar.',
      verification: 'logic.test.ts (väskan: sväng i F2; gränsen 0: 26 krockar, första i steg 5); fråga grans-noll; Playwright redigerar hinder med tangentbordet',
    },
    {
      topic: 'Prova begränsad sikt',
      outcome: 'Eleven förklarar varför sikt 1 ger 4 krockar trots gränsen 2 när roboten kör 2 rutor per steg.',
      verification: 'logic.test.ts (fart 2: 4 mot 0 krockar; sikt 1: 4 krockar); fråga kort-sikt',
    },
    {
      topic: 'Prova sensorbrus',
      outcome: 'Eleven jämför samma reproducerbara brus med gränsen 1 och 2 (3 mot 0 krockar) och resonerar om priset för en säkerhetsmarginal (21 mot 19 städade rutor).',
      verification: 'logic.test.ts (startvärde 5: 3/21 mot 0/19, 7 felaktiga mätvärden); Playwright: fel → återkoppling → rätt i fråga brus-krockar; öppen fråga marginal',
    },
    {
      topic: 'Visualisera mätvärde, beslut och konsekvens i samma vy',
      outcome: 'Kedjan, rutnätet med sensorns sikt och loggen visas tillsammans och uppdateras för varje steg, med text och symboler utöver färg.',
      verification: 'Playwright: kapitel5.spec.ts kontrollerar kedjan, loggen och resultatraden; manuell kontroll med skärmläsare av rutornas etiketter',
    },
  ],
  labels: ['forenklad', 'simulering'],
});
