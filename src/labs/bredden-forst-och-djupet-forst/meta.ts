import { defineLab } from '../../course/types';

export default defineLab({
  id: 'bredden-forst-och-djupet-forst',
  number: 7,
  part: 'sokning',
  title: 'Bredden först och djupet först',
  summary: 'Kör BFS och DFS steg för steg i samma labyrint och se hur en kö och en stack ger helt olika sökningar.',
  goals: [
    'Följa BFS och DFS steg för steg och beskriva vad kön, stacken och listan över besökta noder innehåller.',
    'Förklara varför BFS hittar en väg med så få steg som möjligt.',
    'Visa med ett exempel att vägen med minst antal steg kan ha högre kostnad än en annan väg.',
  ],
  prerequisites: ['Veta vad en graf, en nod och en kant är.'],
  prerequisiteLabs: ['bygg-en-graf'],
  minutes: [15, 20],
  concepts: ['bfs', 'dfs', 'ko', 'stack', 'besokta-noder', 'graf', 'kostnad', 'sokning', 'cykel'],
  keywords: ['bredden först', 'djupet först', 'BFS', 'DFS', 'kö', 'stack', 'labyrint', 'kortaste väg', 'sökalgoritm'],
  coverage: [
    {
      topic: 'Kör BFS och DFS stegvis i samma labyrint',
      outcome: 'Eleven stegar båda sökningarna fram och tillbaka i samma labyrint och ser ordningen i rutorna.',
      verification: 'Playwright: tests/e2e/vertical-slice.spec.ts (stegning BFS/DFS); enhetstest logic.test.ts',
    },
    {
      topic: 'Visa kö, stack, besökta noder, väg och kostnad',
      outcome: 'Eleven läser av kö/stack, besökta rutor och vägens längd och kostnad i varje steg.',
      verification: 'Playwright: vertical-slice.spec.ts kontrollerar kö-listan och resultatraden',
    },
    {
      topic: 'Förklara när BFS ger kortast väg i antal steg',
      outcome: 'Eleven besvarar en kontrollfråga om varför BFS hittar kortast väg när alla steg kostar lika.',
      verification: 'Fråga bfs-varfor med återkoppling; src/lib/search.test.ts (BFS kortast väg i cyklisk graf)',
    },
    {
      topic: 'Variant där vägen med färre steg har högre kostnad',
      outcome: 'Eleven räknar ut att BFS-vägen genom leran kostar 26 medan billigaste vägen kostar 8.',
      verification: 'logic.test.ts (lera: 6 steg/kostnad 26 mot 8); search.test.ts (viktat fall)',
    },
  ],
  labels: ['forenklad'],
});
