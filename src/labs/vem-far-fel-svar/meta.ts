import { defineLab } from '../../course/types';

export default defineLab({
  id: 'vem-far-fel-svar',
  number: 4,
  part: 'introduktion',
  title: 'Vem får fel svar?',
  summary: 'Jämför en klassificerares fel för två grupper med tydliga nämnare.',
  goals: [
    'Köra en enkel klassificerare och jämföra felandelen för två grupper med tydliga nämnare.',
    'Förklara varför en låg total felandel kan dölja att en grupp får många fel.',
    'Visa att urvalet i träningsdatan påverkar resultatet mer än mängden data från samma urval.',
    'Skilja mellan att kunna se hur en modell räknar (transparens) och att kunna lita på utfallet.',
  ],
  prerequisites: ['Veta vad observation, egenskap och etikett är (labb 3).', 'Kunna räkna ut en andel i procent.'],
  prerequisiteLabs: ['vad-finns-i-datamangden'],
  minutes: [15, 20],
  concepts: ['klassificering', 'felandel', 'urval', 'bias', 'traningsdata', 'testdata', 'troskel', 'transparens', 'rattvisa', 'egenskap'],
  keywords: ['felandel', 'nämnare', 'grupper', 'rättvisa', 'urval', 'träningsdata', 'transparens', 'förklarbarhet', 'klassificerare', 'handskrift'],
  coverage: [
    {
      topic: 'Kör en enkel klassificerare för två syntetiska grupper',
      outcome: 'Eleven kör modellen på testdata från Norrby och Söderby och läser av resultatet per grupp.',
      verification: 'Playwright: tests/e2e/kapitel1.spec.ts (labb 4: kör modellen, 0 av 40 och 5 av 10); logic.test.ts (tränad bara på Norrby)',
    },
    {
      topic: 'Jämför fel med tydliga nämnare',
      outcome: 'Eleven räknar ut Söderbys felandel (5 av 10 = 50 %) och förklarar varför totalen 5 av 50 (10 %) är missvisande.',
      verification: 'Frågorna soderby-felandel och totalt-missvisande med återkoppling; kapitel1.spec.ts (fel → återkoppling → rätt)',
    },
    {
      topic: 'Testa en förändring av urval eller träningsdata',
      outcome: 'Eleven jämför 24 och 48 svar från Norrby (ingen förbättring) med 12 + 12 (Söderbys fel 50 % → 0 %).',
      verification: 'logic.test.ts (dubbelt så mycket data från samma urval / blandat urval); fråga procentenheter',
    },
    {
      topic: 'Visa vad en enkel modellförklaring kan synliggöra',
      outcome: 'Eleven läser tröskeln i förklaringen och ser att Söderbys ettor (3,7–4,7 mm) ligger över den.',
      verification: 'logic.test.ts (Söderbys ettor 3,7–4,7 mm); fråga forklaring-visar',
    },
    {
      topic: 'Skilj transparens från att kunna lita på utfallet',
      outcome: 'Eleven förklarar att en genomskinlig modell ändå måste testas per grupp innan man kan lita på den.',
      verification: 'Fråga transparens-tillit med återkoppling; öppen fråga rad-till-skolan (kriterier, facit i teacher.ts)',
    },
  ],
  labels: ['syntetisk', 'pahittad', 'forenklad'],
});
