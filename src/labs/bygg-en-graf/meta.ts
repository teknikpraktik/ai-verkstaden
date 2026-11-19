import { defineLab } from '../../course/types';

export default defineLab({
  id: 'bygg-en-graf',
  number: 6,
  part: 'sokning',
  title: 'Bygg en graf',
  summary: 'Bygg och ändra en liten graf med orter och restider, och se samma sökning som träd med dubbletter och som graf med besökta noder.',
  goals: [
    'Bygga och ändra en graf med noder, oviktade eller viktade kanter, start och mål.',
    'Förklara varför ett sökträd kan innehålla samma nod många gånger och hur cykler uppstår.',
    'Förklara hur en lista över besökta noder gör att varje nod bara undersöks en gång.',
    'Räkna ut en vägs kostnad och visa att vägen med minst antal steg inte behöver vara billigast.',
  ],
  prerequisites: ['Inga särskilda förkunskaper.'],
  prerequisiteLabs: ['programmera-en-stadrobot'],
  minutes: [15, 20],
  concepts: ['graf', 'nod', 'kant', 'kostnad', 'cykel', 'soktrad', 'besokta-noder', 'sokning', 'uniformkostnadssokning', 'bfs'],
  keywords: ['graf', 'nod', 'kant', 'vikt', 'viktad graf', 'sökträd', 'dubbletter', 'cykel', 'start', 'mål', 'kostnad', 'besökta noder', 'restid'],
  coverage: [
    {
      topic: 'Bygg och ändra en liten graf med viktade eller oviktade kanter',
      outcome: 'Eleven lägger till och tar bort noder och kanter, ändrar vikter och växlar mellan viktad och oviktad graf utan att dra något.',
      verification: 'logic.test.ts (redigering, validering); Playwright kapitel2.spec.ts (ta bort kanter, ingen väg)',
    },
    {
      topic: 'Visa en möjlig sökning som träd med dubbletter',
      outcome: 'Eleven ser att sökträdet till djup 3 har 20 noder medan grafen har 5, och att Stockholm finns 3 gånger.',
      verification: 'logic.test.ts (treeStats: 20 noder, 15 dubbletter, 7 cykelupprepningar); fråga trad-djup2 (1, 2, 5, 12 noder per djup); Playwright kapitel2.spec.ts',
    },
    {
      topic: 'Samma problem som graf med besökta noder',
      outcome: 'Eleven stegar grafsökningen och förklarar varför den bara besöker 5 noder.',
      verification: 'logic.test.ts (BFS/UCS besöker 5 noder); fråga besokta-varfor',
    },
    {
      topic: 'Förklara cykler, start, mål och kostnad',
      outcome: 'Eleven räknar ut att billigaste vägen kostar 100 minuter medan vägen med minst antal steg kostar 110, och förklarar begreppen i en öppen fråga.',
      verification: 'logic.test.ts (kostnad 100, BFS-väg 2 steg); frågor billigaste-kostnad och graf-begrepp (kriterier, facit i teacher.ts)',
    },
    {
      topic: 'Kantfall: tom graf, saknad start eller mål, mål som inte går att nå',
      outcome: 'Labben förklarar vad som saknas och sökningen rapporterar ”ingen väg” när målet inte går att nå.',
      verification: 'logic.test.ts (kantfall); Playwright kapitel2.spec.ts (töm grafen, ingen väg)',
    },
  ],
  labels: ['forenklad', 'pahittad'],
});
