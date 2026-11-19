import { defineLab } from '../../course/types';

export default defineLab({
  id: 'grupper-utan-facit',
  number: 13,
  part: 'maskininlarning',
  title: 'Grupper utan facit',
  summary: 'Stega k-means från tilldelning till uppdatering, ändra k och startvärde och se att kluster behöver tolkas.',
  goals: [
    'Beskriva k-means som en växling mellan tilldelning och uppdatering.',
    'Visa att olika startvärden kan ge olika resultat och att samma startvärde ger samma resultat.',
    'Förklara varför valet av k och tolkningen av grupperna är mänskliga beslut.',
  ],
  prerequisites: ['Kunna räkna ut ett medelvärde och läsa av ett punktdiagram.'],
  prerequisiteLabs: ['trana-en-klassificerare'],
  minutes: [15, 20],
  concepts: ['klustring', 'k-means', 'oovervakad-inlarning', 'startvarde', 'hyperparameter', 'observation', 'egenskap'],
  keywords: ['klustring', 'k-means', 'oövervakad inlärning', 'kluster', 'centrum', 'startvärde', 'seed', 'tolkning', 'fritidsvanor'],
  coverage: [
    {
      topic: 'Stega genom k-means från tilldelning till uppdatering',
      outcome: 'Eleven stegar fram och tillbaka och beskriver vad som händer i tilldelning respektive uppdatering.',
      verification: 'Playwright: tests/e2e/kapitel3.spec.ts (labb 13 stegning); logic.test.ts (faser, summan minskar aldrig)',
    },
    {
      topic: 'Ändra k och startvärde',
      outcome: 'Eleven ändrar en sak i taget och jämför slutresultaten i tabeller.',
      verification: 'logic.test.ts (k = 2–5: 153,7 / 49,3 / 29,7 / 24,4); fråga storre-k',
    },
    {
      topic: 'Visa hur resultatet kan variera',
      outcome: 'Eleven hittar att startvärde 8 ger en sämre indelning (143,4) än startvärde 1–7 (49,3).',
      verification: 'logic.test.ts (samma startvärde ⇒ samma resultat; olika startvärden ⇒ olika); Playwright kapitel3.spec.ts',
    },
    {
      topic: 'Kluster behöver tolkas',
      outcome: 'Eleven namnger grupperna och förklarar vad algoritmen inte vet.',
      verification: 'Öppen fråga tolka-grupper med kriterier; exempelresonemang i teacher.ts',
    },
    {
      topic: 'Kantfall: k större än antalet punkter, tomma kluster',
      outcome: 'I experimentläget kan eleven välja en liten grupp med k = 6 och se tomma kluster.',
      verification: 'logic.test.ts (k större än antalet punkter, inga punkter)',
    },
  ],
  labels: ['syntetisk'],
});
