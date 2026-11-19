import { defineLab } from '../../course/types';

export default defineLab({
  id: 'besluta-om-ett-framtida-ai-system',
  number: 26,
  part: 'etik',
  title: 'Besluta om ett framtida AI-system',
  summary: 'Ta en roll, välj om och hur en påhittad skola ska införa ett AI-system och se konsekvenserna av beslut och villkor.',
  goals: [
    'Beskriva hur olika roller ser på samma AI-system utifrån sina intressen.',
    'Se hur beslut och villkor påverkar nytta, felaktiga utfall, integritet och möjlighet till överprövning.',
    'Motivera ett beslut genom att väga nytta, risk, ansvar och möjlighet till överprövning.',
  ],
  prerequisites: ['Labb 23–25 rekommenderas.'],
  prerequisiteLabs: ['bedom-en-rattvisekonflikt', 'vilka-uppgifter-behover-systemet', 'hur-regleras-ett-ai-system'],
  minutes: [20, 25],
  concepts: ['ansvar', 'manniska-i-loopen', 'rattvisa', 'dataminimering', 'lagringsminimering', 'transparens', 'falskt-positiv', 'integritet'],
  keywords: ['beslut', 'intressenter', 'roller', 'villkor', 'konsekvenser', 'överprövning', 'mänsklig tillsyn', 'avhopp', 'skola', 'framtid', 'etik'],
  coverage: [
    {
      topic: 'Ge eleven roller med olika intressen',
      outcome: 'Eleven väljer en av sex roller, läser rollens intressen och ser vilka konsekvenser rollen bryr sig mest om (★).',
      verification: 'Playwright: tests/e2e/kapitel6.spec.ts (labb 26: rollval markerar rader); logic.test.ts (alla roller pekar på befintliga mått)',
    },
    {
      topic: 'Låt beslutet och valda villkor få synliga konsekvenser i ett motiverat scenario',
      outcome: 'Eleven ser att införande utan villkor ger 16 av 20 hjälpta men 24 felaktiga kontakter, och att mänsklig granskning ger 15 och 6.',
      verification: 'logic.test.ts (nej/infor/villkor/pilot, ett villkor i taget); frågor felkontakter och felkontakter-granskning med förklarade felsvar; kapitel6.spec.ts',
    },
    {
      topic: 'Väga nytta, risk, ansvar och möjlighet till överprövning',
      outcome: 'Eleven skriver ett motiverat yttrande bedömt mot fem kriterier och jämför sedan med tre försvarbara exempelresonemang.',
      verification: 'Öppen fråga motivera-beslut; exempel visas först efter 40 ord (kapitel6.spec.ts); exempelresonemang i teacher.ts',
    },
  ],
  labels: ['pahittad', 'simulering', 'forenklad'],
});
