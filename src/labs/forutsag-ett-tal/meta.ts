import { defineLab } from '../../course/types';

export default defineLab({
  id: 'forutsag-ett-tal',
  number: 11,
  part: 'maskininlarning',
  title: 'Förutsäg ett tal',
  summary: 'Flytta en regressionslinje genom glasskioskens försäljning, se residualer och medelkvadratfel ändras och upptäck vad som händer vid extrapolering.',
  goals: [
    'Förklara vad en residual är och räkna ut den för en punkt.',
    'Beskriva hur medelkvadratfelet sammanfattar hur väl en linje passar data, och varför stora fel straffas hårt.',
    'Jämföra en egen linje med en linje anpassad på träningsdata.',
    'Förklara varför förutsägelser utanför träningsdatans område (extrapolering) kan bli orimliga.',
  ],
  prerequisites: ['Kunna läsa av ett diagram och känna till att en rät linje har en lutning.'],
  prerequisiteLabs: ['trana-en-klassificerare'],
  minutes: [15, 20],
  concepts: ['regression', 'residual', 'medelkvadratfel', 'extrapolering', 'modell', 'parameter', 'traningsdata', 'forlustfunktion', 'generalisering'],
  keywords: ['regression', 'regressionslinje', 'residual', 'medelkvadratfel', 'MSE', 'minsta kvadratmetoden', 'extrapolering', 'glass', 'temperatur'],
  coverage: [
    {
      topic: 'Ändra läget på en regressionslinje',
      outcome: 'Eleven ändrar lutning och nivå med reglage (tangentbord eller mus) och ser linjen flytta sig.',
      verification: 'Playwright: tests/e2e/kapitel3.spec.ts (labb 11: reglage ändrar MSE)',
    },
    {
      topic: 'Se hur residualer och medelkvadratfel förändras',
      outcome: 'Eleven läser av residualen 44 vid 28 °C och ser MSE minska från 687,2 när linjen lutar.',
      verification: 'logic.test.ts (startlinjens MSE och residual); fråga residual-28 med kända felsvar',
    },
    {
      topic: 'Jämför med en linje anpassad på träningsdata',
      outcome: 'Eleven jämför sin linje med minsta-kvadrat-linjen (MSE 10,0) och förklarar att ingen linje har lägre MSE på träningsdatan.',
      verification: 'logic.test.ts (”ingen linje har lägre MSE”); fråga mse-anpassad',
    },
    {
      topic: 'Undersöka vad som händer vid extrapolering',
      outcome: 'Eleven ser att linjen förutsäger −29,7 glassar vid 5 °C och 152,7 vid 36 °C och förklarar varför.',
      verification: 'logic.test.ts (extrapolering); Playwright kapitel3.spec.ts; fråga extrapolera-varfor',
    },
  ],
  labels: ['syntetisk', 'forenklad'],
});
