import { defineLab } from '../../course/types';

export default defineLab({
  id: 'trana-valj-och-testa',
  number: 12,
  part: 'maskininlarning',
  title: 'Träna, välj och testa',
  summary: 'Välj modellkomplexitet med valideringsdata, lås valet och testa en gång. Se överanpassning, förväxlingsmatris och vad dataläckage gör med resultatet.',
  goals: [
    'Förklara varför data delas i tränings-, validerings- och testdata och vad varje del används till.',
    'Känna igen överanpassning genom att jämföra träningsresultat med valideringsresultat.',
    'Läsa en förväxlingsmatris och förklara varför samma träffsäkerhet kan dölja olika feltyper.',
    'Förklara hur dataläckage ger för optimistiska resultat.',
  ],
  prerequisites: ['Veta hur k-närmaste grannar fungerar.'],
  prerequisiteLabs: ['trana-en-klassificerare'],
  minutes: [20, 25],
  concepts: ['traningsdata', 'valideringsdata', 'testdata', 'overanpassning', 'generalisering', 'hyperparameter', 'forvaxlingsmatris', 'falskt-positiv', 'falskt-negativ', 'traffsakerhet', 'dataläckage', 'knn', 'obalans'],
  keywords: ['träningsdata', 'valideringsdata', 'testdata', 'modellval', 'överanpassning', 'förväxlingsmatris', 'feltyper', 'dataläckage', 'träffsäkerhet', 'tomatplantor'],
  coverage: [
    {
      topic: 'Välja modellkomplexitet med ett separat valideringsurval',
      outcome: 'Eleven väljer k = 9 utifrån valideringskurvan (94 %) och förklarar varför träningsresultatet inte duger.',
      verification: 'logic.test.ts (selectK = 9, k = 1 ger 100 %/80 %); Playwright kapitel3.spec.ts (labb 12)',
    },
    {
      topic: 'Mäta resultat på ett reserverat testurval',
      outcome: 'Testdatan är låst tills valet görs; eleven låser valet och får 30 av 35 (86 %). Ångrat val märks som förbrukat test.',
      verification: 'logic.test.ts (disjunkt uppdelning, selectK tar inte emot testdata); Playwright kapitel3.spec.ts (låsning)',
    },
    {
      topic: 'Visualisera överanpassning',
      outcome: 'Eleven ser träning och validering för varje k i diagram och tabell samt hur gränsen blir krokig med litet k.',
      verification: 'Fråga k1-100; manuell kontroll av diagrammen',
    },
    {
      topic: 'Enkel förväxlingsmatris och skillnaden mellan totalt mått och feltyper',
      outcome: 'Eleven ser att k = 79 får 63 % men hittar 0 av 13 sjuka, och att k = 5 och k = 25 har samma träffsäkerhet men olika fel.',
      verification: 'logic.test.ts (k = 79, k = 5 mot 25); frågor k79-hittar och samma-traffsakerhet',
    },
    {
      topic: 'Separat demonstration av dataläckage',
      outcome: 'Eleven ser i en tydligt märkt ruta med egna data att läckage ger 100 % på demo-testet men 74 % på nya plantor.',
      verification: 'logic.test.ts (läckagedemo med egna id); fråga lackage-varfor',
    },
  ],
  labels: ['syntetisk', 'forenklad'],
});
