import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Ett lärande system blir aldrig bättre än de exempel det lär sig av. Innan någon tränar en modell behöver man därför titta noga på [[datamangd|datamängden]]: vad finns med, vad saknas och hur har exemplen valts ut?',
    'I den här labben hjälper du ett påhittat äppelpackeri som vill att en modell ska sortera ut dåliga äpplen. Du undersöker deras data, hittar [[obalans]] och provar vad som händer när de samlar in mer.',
    { type: 'note', kind: 'syntetisk', text: 'Packeriet, gårdarna och alla äpplen är påhittade. Datan är skapad för övningen och är medvetet liten så att du kan se varje rad.' },
  ],
  sections: [
    {
      heading: 'Observation, egenskap och etikett',
      blocks: [
        {
          type: 'table',
          caption: 'Tre ord som beskriver en datamängd, med exempel från labben',
          head: ['Begrepp', 'Betyder', 'Exempel'],
          rows: [
            ['[[observation|Observation]]', 'Ett exempel i datamängden', 'Äpple nr 8 (en rad i tabellen)'],
            ['[[egenskap|Egenskap]]', 'Något som går att mäta eller beskriva hos observationen', 'Vikt 133 g, färg röd, 4 fläckar'],
            ['[[etikett|Etikett]]', 'Svaret som modellen ska lära sig att ge', '”Kasseras”'],
          ],
        },
        'Etiketterna sätts oftast av människor. Om kontrollanten gör fel, eller följer en annan regel än man tror, lär sig modellen samma fel.',
      ],
    },
    {
      heading: 'Bild, text och tabell',
      blocks: [
        'Samma äpple kan sparas på olika sätt. I **tabelldata** står egenskaperna färdiga i kolumner. En **bild** är för datorn bara ett rutnät av tal – en bild på 8 × 8 pixlar är 64 tal, och en mobilbild består av miljontals. **Text** är ord som först måste göras om till tal, till exempel genom att räkna hur ofta olika ord förekommer.',
        'I bild och text finns egenskaperna inte färdiga. Modellen eller den som bygger den måste hitta dem: var är fläckarna i bilden? Vad betyder ”medelstort” i texten?',
      ],
    },
    {
      heading: 'Obalans och urval',
      blocks: [
        'Packeriets data är obalanserad på två sätt: bara 3 av 20 äpplen (15 %) kasseras, och alla äpplen är röda från samma gård. En modell som tränas på den här datan har aldrig sett ett grönt äpple.',
        'Det ligger nära till hands att tro att mer data löser problemet. Men om de nya exemplen kommer från samma [[urval]] blir fördelningen densamma: 20 äpplen till från gård A ger 6 kasserade av 40 (fortfarande 15 %) och fortfarande inga gröna. Först när urvalet ändras – äpplen från gård B – kommer gröna och gula äpplen med.',
        { type: 'note', kind: 'info', title: 'Obalans är inte alltid fel', text: 'Det är normalt att de flesta äpplen godkänns. Obalansen blir ett problem när modellen behöver känna igen de ovanliga fallen, eller när grupper som modellen ska användas på saknas helt.' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Hur en bild blir tal',
      minutes: 8,
      prerequisites: 'labbens genomgång',
      blocks: [
        'I labben har varje pixel bara fyra möjliga värden (0 bakgrund, 1 skal, 2 fläck, 3 skaft). En riktig färgbild har tre tal per pixel – mängden rött, grönt och blått, vanligen från 0 till 255.',
        { type: 'formula', text: 'antal tal = bredd × höjd × 3', caption: 'En bild på 1 000 × 1 000 pixlar blir 3 miljoner tal.' },
        {
          type: 'pseudo',
          title: 'Räkna fläckar i en bild',
          code: `fläckar ← 0
för varje rad i bilden:
    för varje pixel i raden:
        om pixel = 2: fläckar ← fläckar + 1`,
        },
        'Här är det enkelt eftersom fläckarna redan har en egen kod. I riktiga bilder måste modellen själv lära sig vilka mönster av färger som betyder ”fläck”.',
      ],
    },
  ],
  conclusion: [
    'En datamängd består av observationer med egenskaper och, för att en modell ska kunna lära sig, etiketter. Samma sak kan beskrivas som tabell, bild eller text.',
    'Obalans syns när man räknar. Och den försvinner inte av att man samlar in mer från samma ställe – urvalet måste ändras.',
  ],
});
