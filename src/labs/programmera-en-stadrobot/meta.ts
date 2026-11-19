import { defineLab } from '../../course/types';

export default defineLab({
  id: 'programmera-en-stadrobot',
  number: 5,
  part: 'sokning',
  title: 'Programmera en städrobot',
  summary: 'Stega en städrobot instruktion för instruktion och jämför en slumpstrategi med en regelstyrd strategi i samma rum.',
  goals: [
    'Beskriva en agent med mål, sensorinformation, tillstånd, handlingar och resultat.',
    'Följa ett program instruktion för instruktion och förklara vilken regel som används i varje steg.',
    'Jämföra en slumpstrategi med en regelstyrd strategi i samma miljö och förklara skillnaden.',
    'Visa hur sikten och möblerna i rummet påverkar resultatet, en sak i taget.',
  ],
  prerequisites: ['Inga särskilda förkunskaper.'],
  prerequisiteLabs: [],
  minutes: [15, 20],
  concepts: ['agent', 'sensor', 'tillstand', 'handling', 'regelbaserat-system', 'startvarde'],
  keywords: ['städrobot', 'agent', 'sensor', 'tillstånd', 'handling', 'slumpstrategi', 'regelstyrd', 'sikt', 'miljö', 'startvärde', 'program'],
  coverage: [
    {
      topic: 'Stega igenom körbara instruktioner',
      outcome: 'Eleven stegar roboten fram och tillbaka och ser vilken instruktion i programmet som används i varje steg.',
      verification: 'Playwright: tests/e2e/kapitel2.spec.ts (labb 5: stegning, aktiv regel); logic.test.ts (regel 1 suger alltid)',
    },
    {
      topic: 'Jämför slumpstrategi och regelstyrd strategi i samma miljö',
      outcome: 'Eleven läser av att regelstyrd robot behöver 32 handlingar och slumproboten 60–236 (2 av 20 körningar blir inte klara) i det tomma rummet.',
      verification: 'logic.test.ts (randomSummary, stepsToClean); Playwright kapitel2.spec.ts (jämförelsetabell, fråga regler-steg med fel→rätt)',
    },
    {
      topic: 'Visa mål, sensorinformation, tillstånd, handling och resultat',
      outcome: 'Eleven skiljer sensorinformation från mål och minne i en kontrollfråga och läser av alla fem delar i varje steg.',
      verification: 'Fråga sensor-eller-tillstand; Playwright kapitel2.spec.ts kontrollerar agentpanelen',
    },
    {
      topic: 'Låt sikten och minst en miljöegenskap variera',
      outcome: 'Eleven ändrar bara sikten (32 → 22 handlingar) och sedan rummet (möbler: 31 handlingar regelstyrt, 201 för slump med startvärde 1).',
      verification: 'logic.test.ts (sikt 0/1/2, möblerat rum); fråga sikt-skillnad',
    },
    {
      topic: 'Reproducerbar slump med valbart startvärde',
      outcome: 'Eleven väljer startvärde och ser att samma startvärde ger samma körning.',
      verification: 'logic.test.ts (samma startvärde ger samma körning)',
    },
  ],
  labels: ['forenklad', 'simulering'],
});
