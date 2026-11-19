import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'En modell som har lärt sig träningsdatan utantill kan se fantastisk ut – och ändå fungera dåligt på nya fall. Hur väljer man modell på ett sätt som inte lurar en själv? Och hur mäter man resultatet ärligt?',
    'I labben ska ett växthus hitta sjuka tomatplantor med [[knn|k-närmaste grannar]]. Du väljer k med [[valideringsdata]], testar en gång på [[testdata]] och tittar på vilka fel modellen gör.',
    { type: 'note', kind: 'syntetisk', text: 'Plantorna och mätvärdena är påhittade och slumpade med ett fast startvärde, så alla får samma data.' },
  ],
  sections: [
    {
      heading: 'Tre delar med tre uppgifter',
      blocks: [
        {
          type: 'table',
          caption: 'Uppdelningen av de 150 plantorna',
          head: ['Del', 'Antal', 'Används till', 'Får inte användas till'],
          rows: [
            ['Träningsdata', '80', 'Det modellen lär sig av (grannarna som röstar).', 'Att bedöma hur bra modellen är.'],
            ['Valideringsdata', '35', 'Att jämföra olika k och välja ett.', 'Att lära modellen.'],
            ['Testdata', '35', 'En enda slutlig mätning efter valet.', 'Att välja eller justera något.'],
          ],
        },
        'Med k = 1 blir resultatet 100 % på [[traningsdata|träningsdatan]] men bara 80 % på valideringsdatan. Modellen har anpassat sig efter slumpen i just de plantorna – det kallas [[overanpassning|överanpassning]]. Med k = 79 blir modellen för enkel och säger ”frisk” om allt. Valideringskurvan är högst för k = 9 (94 %).',
        'Även valideringsresultatet blir lite för optimistiskt, eftersom vi valde det bästa av åtta försök. Därför behövs testdatan: med k = 9 blir testresultatet 86 %. Det är vår bästa gissning om hur modellen fungerar på nya plantor – förutsatt att testet bara används en gång.',
      ],
    },
    {
      heading: 'Förväxlingsmatrisen',
      blocks: [
        'En [[forvaxlingsmatris|förväxlingsmatris]] delar upp svaren i fyra rutor: sjuka som hittades, sjuka som missades ([[falskt-negativ|falskt negativa]]), friska som fick falsklarm ([[falskt-positiv|falskt positiva]]) och friska som bedömdes rätt.',
        '[[traffsakerhet|Träffsäkerhet]] räknar alla fel lika. Det kan dölja viktiga skillnader. En modell som alltid säger ”frisk” får 63 % på valideringsdatan men hittar inte en enda av de 13 sjuka plantorna. Det beror på att de flesta plantor är friska – datan är [[obalans|obalanserad]].',
      ],
    },
    {
      heading: 'Dataläckage',
      blocks: [
        '[[dataläckage|Dataläckage]] betyder att information från testdatan har tagit sig in i träningen eller i valet av modell. Det kan hända om samma planta finns med två gånger, om man väljer modell efter testresultatet eller om man räknar fram något (som ett medelvärde) på all data innan den delas upp.',
        'Demonstrationen i labben använder egna påhittade plantor, så att ditt låsta test förblir giltigt. Där får en läckt modell 100 % på testet men bara 74 % på helt nya plantor.',
        { type: 'note', kind: 'forenklad', text: 'I verkliga projekt används ofta fler plantor, upprepade uppdelningar (korsvalidering) och fler mått. Principen – att testdata hålls utanför allt som väljs – är densamma.' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Mått ur förväxlingsmatrisen',
      minutes: 10,
      prerequisites: 'bråkräkning; labbens genomgång',
      blocks: [
        'Med TP = sant positiva, FN = falskt negativa, FP = falskt positiva och TN = sant negativa:',
        { type: 'formula', text: 'träffsäkerhet = (TP + TN) / (TP + TN + FP + FN)' },
        { type: 'formula', text: 'känslighet = TP / (TP + FN)', caption: 'Andelen sjuka som hittas.' },
        { type: 'formula', text: 'precision = TP / (TP + FP)', caption: 'Andelen larm som var riktiga.' },
        'För testet med k = 9 (TP 8, FN 3, FP 2, TN 22) blir träffsäkerheten 30/35 ≈ 86 %, känsligheten 8/11 ≈ 73 % och precisionen 8/10 = 80 %. Vilket mått som är viktigast beror på vad felen kostar.',
        {
          type: 'pseudo',
          title: 'Ärlig arbetsgång',
          code: `blanda data med ett fast startvärde och dela EN gång: träning | validering | test
för varje kandidat-k:
    träna på träning, mät på validering
välj k med bäst valideringsresultat
lås valet
mät EN gång på test och rapportera resultatet`,
        },
      ],
    },
  ],
  conclusion: [
    'Träningsresultatet säger hur väl modellen minns, inte hur väl den generaliserar. Valideringsdata används för att välja, testdata för en enda ärlig mätning.',
    'Ett enda totalmått kan dölja de fel som spelar störst roll. Titta på förväxlingsmatrisen och fråga vilka fel som är dyrast.',
  ],
});
