import { defineLab } from '../../course/types';

export default defineLab({
  id: 'vilka-uppgifter-behover-systemet',
  number: 24,
  part: 'etik',
  title: 'Vilka uppgifter behöver systemet?',
  summary: 'Välj vilka uppgifter ett påhittat skolverktyg ska använda, för vilket ändamål och hur länge – och få återkoppling på dataminimering.',
  goals: [
    'Avgöra vilka personuppgifter som behövs för ett givet ändamål och förklara varför andra inte behövs.',
    'Välja och motivera en lagringstid utifrån ändamålet.',
    'Förklara att ett nytt ändamål kräver en ny prövning, och formulera följdfrågor som situationen väcker.',
  ],
  prerequisites: ['Inga särskilda förkunskaper.'],
  prerequisiteLabs: ['bygg-ett-rekommendationsflode'],
  minutes: [15, 20],
  concepts: ['personuppgift', 'dataminimering', 'andamalsbegransning', 'lagringsminimering', 'gdpr', 'integritet', 'pseudonymisering', 'kanslig-personuppgift'],
  keywords: ['dataminimering', 'ändamål', 'ändamålsbegränsning', 'lagringstid', 'gallring', 'personuppgifter', 'skolverktyg', 'GDPR', 'känsliga uppgifter', 'pseudonym'],
  coverage: [
    {
      topic: 'Välj vilka uppgifter ett fiktivt skolverktyg ska använda, för vilket ändamål och hur länge',
      outcome: 'Eleven bockar ur uppgifter, väljer lagringstid per uppgift och byter ändamål i ett påhittat matteverktyg.',
      verification: 'Playwright: tests/e2e/kapitel6.spec.ts (labb 24: ur-bockning ändrar status); logic.test.ts (evaluate för alla ändamål)',
    },
    {
      topic: 'Återkoppling på dataminimering och ändamål',
      outcome: 'Eleven ser att leverantörens förslag har 9 problem för ändamålet övningar och att 2 uppgifter räcker; samma urval saknar namn och klass för läraröversikten.',
      verification: 'logic.test.ts (9 problem, minimalt urval 2/3/1 uppgifter, byte av ändamål); frågor nodvandiga, hur-lange, andamal-styr med förklarade felsvar',
    },
    {
      topic: 'Vilka följdfrågor situationen väcker',
      outcome: 'Eleven skriver ett förslag till rektorn med motiverade uppgifter, lagringstid och två följdfrågor.',
      verification: 'Följdfrågelistan i labben (logic.test.ts: art. 9-frågan vid känslig uppgift); öppen fråga motivera-urval; exempel i teacher.ts',
    },
  ],
  labels: ['pahittad', 'forenklad'],
});
