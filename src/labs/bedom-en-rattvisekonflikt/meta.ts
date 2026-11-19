import { defineLab } from '../../course/types';

export default defineLab({
  id: 'bedom-en-rattvisekonflikt',
  number: 23,
  part: 'etik',
  title: 'Bedöm en rättvisekonflikt',
  summary: 'Ändra beslutströskeln i ett påhittat kontrollsystem och se hur falskt positiva och falskt negativa fördelas mellan två områden.',
  goals: [
    'Räkna ut falskt positiva och falskt negativa per grupp med tydliga nämnare.',
    'Förklara varför en gemensam tröskel kan ge olika felandelar i olika grupper.',
    'Motivera en avvägning med begreppen rättvisa, transparens, ansvar och mänsklig tillsyn.',
  ],
  prerequisites: ['Veta vad falskt positiv och falskt negativ betyder (förklaras kort i labben).'],
  prerequisiteLabs: ['bygg-ett-rekommendationsflode'],
  minutes: [15, 20],
  concepts: ['troskel', 'falskt-positiv', 'falskt-negativ', 'forvaxlingsmatris', 'rattvisa', 'bias', 'transparens', 'ansvar', 'manniska-i-loopen', 'syntetisk-data'],
  keywords: ['rättvisa', 'tröskel', 'beslutströskel', 'falskt positiv', 'falskt negativ', 'grupper', 'avvägning', 'kontrollsystem', 'felandel'],
  coverage: [
    {
      topic: 'Ändra en beslutströskel i ett fiktivt system',
      outcome: 'Eleven flyttar tröskeln med reglage eller piltangenter och ser utfallet uppdateras i diagram, matriser och text.',
      verification: 'Playwright: tests/e2e/kapitel6.spec.ts (labb 23, reglage → nya siffror); logic.test.ts (tröskel 0, 40, 50, 60, 70, 101)',
    },
    {
      topic: 'Jämför falskt positiva och falskt negativa utfall gruppvis',
      outcome: 'Eleven läser av att tröskel 50 ger 1 av 32 onödiga utredningar i Norr men 14 av 24 i Söder, och att tröskel 60 ökar missade fel i Norr till 3 av 8.',
      verification: 'logic.test.ts (fastlåsta antal); frågor fp-soder och fn-norr med förklarade felsvar; kapitel6.spec.ts (fel → återkoppling → rätt)',
    },
    {
      topic: 'Motivera en avvägning med rättvisa, transparens, ansvar och mänsklig tillsyn',
      outcome: 'Eleven skriver ett motiverat val av tröskel och villkor, bedömt mot fem kriterier.',
      verification: 'Öppen fråga motivera-troskel; exempelresonemang i teacher.ts',
    },
  ],
  labels: ['syntetisk', 'pahittad', 'forenklad'],
});
