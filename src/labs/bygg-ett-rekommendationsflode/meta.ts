import { defineLab } from '../../course/types';

export default defineLab({
  id: 'bygg-ett-rekommendationsflode',
  number: 22,
  part: 'etik',
  title: 'Bygg ett rekommendationsflöde',
  summary: 'Se hur dina val formar ett simulerat flöde, mät variationen och undersök vad systemet samlar in om dig.',
  goals: [
    'Beskriva hur ett rekommendationssystem använder klick för att välja vad du får se.',
    'Mäta variationen i ett flöde och jämföra två lägen där bara en regel skiljer.',
    'Förklara sambandet mellan flödets precision, insamlade uppgifter och integritet.',
  ],
  prerequisites: ['Inga särskilda förkunskaper.'],
  prerequisiteLabs: [],
  minutes: [15, 20],
  concepts: ['rekommendationssystem', 'filterbubbla', 'integritet', 'personuppgift', 'dataminimering', 'startvarde'],
  keywords: ['rekommendationsflöde', 'flöde', 'filterbubbla', 'variation', 'engagemang', 'klick', 'datainsamling', 'integritet', 'sociala medier'],
  coverage: [
    {
      topic: 'Låt elevens val påverka ett simulerat flöde',
      outcome: 'Eleven klickar på inlägg och ser hur nästa sida och ämnesfördelningen förändras.',
      verification: 'Playwright: tests/e2e/kapitel6.spec.ts (labb 22, klick ändrar mätaren); enhetstest logic.test.ts (profileWeights, makePage, replay)',
    },
    {
      topic: 'Mät variationen och jämför med ett läge som ger utrymme åt andra ämnen',
      outcome: 'Eleven läser av att engagemangsläget ger 1 ämne och variationsläget 5 ämnen bland de 12 senaste inläggen med samma robot-elev och samma startvärde.',
      verification: 'logic.test.ts (standardscenariot 1 mot 5 ämnen, spel 12 resp. 6 av 12); fråga antal-amnen med förklarade felsvar; kapitel6.spec.ts',
    },
    {
      topic: 'Koppla utfallet till integritet och datainsamling',
      outcome: 'Eleven ser vad systemet loggat, skiljer på uppgifter som behövs och som bara samlas in, och motiverar ett standardläge.',
      verification: 'Fråga behovs-data (flerval); öppen fråga motivera-flode med kriterier; logic.test.ts (summarizeData)',
    },
  ],
  labels: ['simulering', 'pahittad', 'forenklad'],
});
