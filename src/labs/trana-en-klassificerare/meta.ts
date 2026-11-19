import { defineLab } from '../../course/types';

export default defineLab({
  id: 'trana-en-klassificerare',
  number: 10,
  part: 'maskininlarning',
  title: 'Träna en klassificerare',
  summary: 'Sortera frukter med k-närmaste grannar: ändra k, flytta och lägg till punkter och se hur klassificeringsgränsen ändras.',
  goals: [
    'Förklara hur k-närmaste grannar klassificerar en ny observation genom att låta de k närmaste exemplen rösta.',
    'Förutsäga och kontrollera hur svaret och klassificeringsgränsen ändras när k ändras.',
    'Beskriva hur en avvikande eller felmärkt punkt påverkar modellen, och varför för litet och för stort k båda är problem.',
  ],
  prerequisites: ['Kunna läsa av ett punktdiagram med två axlar.'],
  prerequisiteLabs: [],
  minutes: [15, 20],
  concepts: ['knn', 'klassificering', 'beslutsgrans', 'overvakad-inlarning', 'egenskap', 'etikett', 'observation', 'hyperparameter', 'traningsdata'],
  keywords: ['k-närmaste grannar', 'k-NN', 'klassificeringsgräns', 'beslutsgräns', 'avvikande punkt', 'outlier', 'lika röster', 'övervakad inlärning', 'frukt'],
  coverage: [
    {
      topic: 'Lägg till eller flytta datapunkter',
      outcome: 'Eleven lägger till, flyttar och tar bort punkter (klick, knappar eller sifferfält i tabell) och ser gränsen ändras.',
      verification: 'Playwright: tests/e2e/kapitel3.spec.ts (labb 10: tabellredigering i experimentläget); enhetstest logic.test.ts (redigering, tomma data)',
    },
    {
      topic: 'Ändra värdet på k i k-närmaste grannar',
      outcome: 'Eleven ändrar k och förklarar varför ★ byter från äpple (k = 1) till päron (k = 3) och varför allt blir äpple med k = 14.',
      verification: 'Playwright: kapitel3.spec.ts (genomgång labb 10); logic.test.ts (k = 1, 2, 3, 5, 14)',
    },
    {
      topic: 'Visa klassificeringsgränsen',
      outcome: 'Eleven läser av klassificeringsgränsen och områdena i diagrammet, med textbeskrivning och grannlista som alternativ.',
      verification: 'logic.test.ts (boundaryGrid, regionCount); manuell kontroll av diagrammet i ljust och mörkt läge',
    },
    {
      topic: 'Förutsäga klassen för en ny punkt',
      outcome: 'Eleven förutsäger klassen för ★ innan svaret visas och jämför sedan med modellens röster.',
      verification: 'Playwright: kapitel3.spec.ts (förutsägelse, fel svar → återkoppling → rätt svar)',
    },
    {
      topic: 'Undersöka en avvikande punkt',
      outcome: 'Eleven ser att punkt 8 bildar en ö med k = 1 som försvinner med k = 3 eller när punkten tas bort.',
      verification: 'logic.test.ts (”den avvikande punkten bildar en egen ö”); fråga avvikande-o',
    },
    {
      topic: 'Regel vid lika röster',
      outcome: 'Eleven tillämpar regeln att den närmaste grannen avgör vid lika röster (k = 2).',
      verification: 'logic.test.ts (lika röster och lika avstånd); fråga lika-roster',
    },
  ],
  labels: ['syntetisk', 'forenklad'],
});
