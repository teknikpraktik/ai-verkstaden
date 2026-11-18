# Täckningsmatris

Genereras från `coverage` i varje labbs `meta.ts` med `npm run docs:coverage`. Ändra inte för hand.

| Nr | Labb | Rutt | Delämne | Förväntat elevresultat | Verifiering |
|---|---|---|---|---|---|
| | **Kapitel 1 · Introduktion till artificiell intelligens** | | | | |
| 1 | Är det AI? | `/labb/ar-det-ai/` | ⚠ saknas |  |  |
| 2 | Från expertregler till stora modeller | `/labb/fran-expertregler-till-stora-modeller/` | ⚠ saknas |  |  |
| 3 | Vad finns i datamängden? | `/labb/vad-finns-i-datamangden/` | ⚠ saknas |  |  |
| 4 | Vem får fel svar? | `/labb/vem-far-fel-svar/` | ⚠ saknas |  |  |
| | **Kapitel 2 · Grundläggande begrepp och sökalgoritmer** | | | | |
| 5 | Programmera en städrobot | `/labb/programmera-en-stadrobot/` | ⚠ saknas |  |  |
| 6 | Bygg en graf | `/labb/bygg-en-graf/` | ⚠ saknas |  |  |
| 7 | Bredden först och djupet först | `/labb/bredden-forst-och-djupet-forst/` | Kör BFS och DFS stegvis i samma labyrint | Eleven stegar båda sökningarna fram och tillbaka i samma labyrint och ser ordningen i rutorna. | Playwright: tests/e2e/vertical-slice.spec.ts (stegning BFS/DFS); enhetstest logic.test.ts |
| | | | Visa kö, stack, besökta noder, väg och kostnad | Eleven läser av kö/stack, besökta rutor och vägens längd och kostnad i varje steg. | Playwright: vertical-slice.spec.ts kontrollerar kö-listan och resultatraden |
| | | | Förklara när BFS ger kortast väg i antal steg | Eleven besvarar en kontrollfråga om varför BFS hittar kortast väg när alla steg kostar lika. | Fråga bfs-varfor med återkoppling; src/lib/search.test.ts (BFS kortast väg i cyklisk graf) |
| | | | Variant där vägen med färre steg har högre kostnad | Eleven räknar ut att BFS-vägen genom leran kostar 26 medan billigaste vägen kostar 8. | logic.test.ts (lera: 6 steg/kostnad 26 mot 8); search.test.ts (viktat fall) |
| 8 | Sök med kostnad och ledtråd | `/labb/sok-med-kostnad-och-ledtrad/` | ⚠ saknas |  |  |
| 9 | Tre i rad mot en agent | `/labb/tre-i-rad-mot-en-agent/` | ⚠ saknas |  |  |
| | **Kapitel 3 · Maskininlärning** | | | | |
| 10 | Träna en klassificerare | `/labb/trana-en-klassificerare/` | ⚠ saknas |  |  |
| 11 | Förutsäg ett tal | `/labb/forutsag-ett-tal/` | ⚠ saknas |  |  |
| 12 | Träna, välj och testa | `/labb/trana-valj-och-testa/` | ⚠ saknas |  |  |
| 13 | Grupper utan facit | `/labb/grupper-utan-facit/` | ⚠ saknas |  |  |
| 14 | Lär en agent med belöning | `/labb/lar-en-agent-med-beloning/` | ⚠ saknas |  |  |
| 15 | Öppna ett neuralt nätverk | `/labb/oppna-ett-neuralt-natverk/` | ⚠ saknas |  |  |
| | **Kapitel 4 · Naturlig språkbehandling (NLP)** | | | | |
| 16 | Gör text till data | `/labb/gor-text-till-data/` | ⚠ saknas |  |  |
| 17 | Sortera meddelanden med en textmodell | `/labb/sortera-meddelanden/` | ⚠ saknas |  |  |
| 18 | Samma mening, flera tolkningar | `/labb/samma-mening-flera-tolkningar/` | ⚠ saknas |  |  |
| | **Kapitel 5 · Robotik** | | | | |
| 19 | Styr en robot | `/labb/styr-en-robot/` | ⚠ saknas |  |  |
| 20 | Hitta fram när kartan förändras | `/labb/hitta-fram-nar-kartan-forandras/` | ⚠ saknas |  |  |
| 21 | Välj robot för ett uppdrag | `/labb/valj-robot-for-ett-uppdrag/` | ⚠ saknas |  |  |
| | **Kapitel 6 · Etik och lagstiftning** | | | | |
| 22 | Bygg ett rekommendationsflöde | `/labb/bygg-ett-rekommendationsflode/` | ⚠ saknas |  |  |
| 23 | Bedöm en rättvisekonflikt | `/labb/bedom-en-rattvisekonflikt/` | ⚠ saknas |  |  |
| 24 | Vilka uppgifter behöver systemet? | `/labb/vilka-uppgifter-behover-systemet/` | ⚠ saknas |  |  |
| 25 | Hur regleras ett AI-system? | `/labb/hur-regleras-ett-ai-system/` | ⚠ saknas |  |  |
| 26 | Besluta om ett framtida AI-system | `/labb/besluta-om-ett-framtida-ai-system/` | ⚠ saknas |  |  |
| | **Avslutning** | | | | |
| 27 | Granska ett AI-system | `/projekt/granska-ett-ai-system/` | ⚠ saknas |  |  |
