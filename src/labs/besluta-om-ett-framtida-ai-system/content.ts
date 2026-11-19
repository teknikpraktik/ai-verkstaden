import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Beslut om AI-system fattas av människor med olika intressen. En elev, en mentor, en rektor och ett dataskyddsombud kan se samma system på helt olika sätt – och alla kan ha goda skäl.',
    'Här tar du en roll och bestämmer om ett påhittat gymnasium ska införa ett AI-system som varnar för avhopp, och i så fall med vilka villkor. Konsekvenserna visas direkt.',
    { type: 'note', kind: 'pahittad', text: 'Skolan, systemet och alla siffror är påhittade. Konsekvenserna räknas fram med enkla regler som står nedan – inte med en verklig modell.' },
  ],
  sections: [
    {
      heading: 'Antagandena bakom konsekvenserna',
      blocks: [
        {
          type: 'list',
          items: [
            'Årskursen har 200 elever. 20 av dem är i riskzonen. I dag hittar mentorerna 8 av de 20.',
            'Med alla uppgifter (6 sorter per elev) markerar systemet 40 elever: 16 i riskzonen och 24 som inte är det.',
            'Med bara närvaro och betyg (2 sorter) markerar det 14 rätt och 26 fel – lite sämre, men mycket mindre uppgifter.',
            'När mentorn granskar varje markering stryks 3 av 4 felaktiga markeringar, men också 1 riktig.',
            'Varje kontakt tar en halvtimme och varje granskning en kvarts timme av mentorns tid.',
            '2 av 3 felaktiga markeringar gäller elever på yrkesprogram, trots att de bara är en tredjedel av eleverna. Det syns bara om någon granskar felen per grupp.',
            'En pilot omfattar 50 elever under en termin. Antalen räknas om i proportion och avrundas.',
          ],
        },
        'Antagandena kan ifrågasättas. Ett viktigt steg i ett riktigt beslut är att ta reda på om de stämmer – till exempel genom en pilot.',
      ],
    },
    {
      heading: 'Fyra frågor att väga',
      blocks: [
        {
          type: 'table',
          caption: 'Det som ska vägas i beslutet',
          head: ['Fråga', 'Exempel i scenariot'],
          rows: [
            ['Nytta', 'Hur många fler elever i riskzonen får hjälp än i dag?'],
            ['Risk', 'Hur många kontaktas felaktigt? Drabbas vissa grupper mer? Vilka uppgifter samlas in och hur länge?'],
            ['[[ansvar|Ansvar]]', 'Vem bestämmer över systemet, och vem står för följderna när det blir fel?'],
            ['Överprövning', 'Får eleven veta att hen markerats, och kan markeringen prövas och ändras?'],
          ],
        },
        '[[manniska-i-loopen|Mänsklig tillsyn]] och överprövning är inte samma sak. Tillsyn betyder att en människa granskar systemets förslag. Överprövning betyder att den som berörs själv kan ifrågasätta beslutet.',
        { type: 'note', kind: 'info', text: 'Ett system som påverkar elevers utbildning kan behöva bedömas enligt EU:s AI-förordning, och profilering av elever kräver eftertanke enligt GDPR. Se [labb 25](/labb/hur-regleras-ett-ai-system/), där avhoppsvarnaren är ett av scenarierna.' },
      ],
    },
  ],
  conclusion: [
    'Samma system kan vara rätt eller fel beroende på villkoren. Utan villkor hjälpte systemet fler elever men kontaktade 24 felaktigt och gav ingen möjlighet att överpröva. Villkor flyttar balansen – men kostar tid och ibland träffsäkerhet.',
    'Ett bra beslut visar hur nytta och risk har vägts, vem som bär ansvaret och hur den som drabbas av ett fel kan få det rättat.',
  ],
});
