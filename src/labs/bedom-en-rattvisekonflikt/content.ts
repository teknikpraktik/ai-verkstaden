import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Många AI-system ger en poäng och låter en [[troskel|beslutströskel]] avgöra vad som händer. Var tröskeln hamnar bestämmer vilka fel systemet gör – och vem som drabbas.',
    'Här undersöker du ett påhittat system hos den påhittade myndigheten Bidragskontoret. Det väljer ut ansökningar för manuell utredning. Du jämför utfallet i två områden och tar ställning till vilken avvägning som går att försvara.',
    { type: 'note', kind: 'syntetisk', text: 'De 80 ansökningarna är [[syntetisk-data|syntetiska data]] som skapats för övningen. Områdena, myndigheten och systemet finns inte på riktigt.' },
  ],
  sections: [
    {
      heading: 'Två sorters fel',
      blocks: [
        {
          type: 'table',
          caption: 'Vad felen betyder i scenariot',
          head: ['', 'Systemet: utred', 'Systemet: utred inte'],
          rows: [
            ['Ansökan innehöll fel', 'Sant positiv ✓ – felet upptäcks', '[[falskt-negativ|Falskt negativ]] ✗ – felet släpps igenom'],
            ['Ansökan var korrekt', '[[falskt-positiv|Falskt positiv]] ✗ – onödig utredning, försenad utbetalning', 'Sant negativ ✓'],
          ],
        },
        'Andelar behöver en tydlig **nämnare**. ”Utreds i onödan” räknas bland de korrekta ansökningarna i området. ”Missade fel” räknas bland de ansökningar som faktiskt innehöll fel.',
      ],
    },
    {
      heading: 'Varför blir det skillnad mellan områdena?',
      blocks: [
        'I Område Söder har även de korrekta ansökningarna högre poäng. I scenariot beror det på att modellen använder antal flyttar det senaste året, vilket är vanligare i Söder av skäl som inte har med fel att göra. Vid tröskel 50 utreds därför **14 av 24** korrekta ansökningar i Söder men bara **1 av 32** i Norr.',
        'Om tröskeln höjs till 60 utreds färre i onödan (Söder 3 av 24), men fler fel släpps igenom (Norr 3 av 8). Det finns ingen tröskel som tar bort båda problemen – bara olika avvägningar.',
        'Man kan också ha **olika trösklar** för olika grupper (prova i experimentläget). Det kan jämna ut felandelarna, men innebär att människor behandlas olika beroende på var de bor. Om det är rättvist är en fråga om värderingar och lag, inte matematik.',
        { type: 'note', kind: 'forenklad', text: 'Riktiga system har fler grupper, fler uppgifter och osäkra ”facit”. Här vet vi exakt vilka ansökningar som innehöll fel, vilket man sällan gör i verkligheten.' },
      ],
    },
    {
      heading: 'Fyra principer för avvägningen',
      blocks: [
        {
          type: 'list',
          items: [
            '**[[rattvisa|Rättvisa]]** – fördelas felen jämnt mellan grupper? Vilket mått på rättvisa väljer man, och varför?',
            '**[[transparens|Transparens]]** – får de som utreds veta varför, och kan utomstående granska systemet?',
            '**[[ansvar|Ansvar]]** – vem står för beslutet om tröskeln och för följderna när det blir fel?',
            '**[[manniska-i-loopen|Mänsklig tillsyn]]** – prövar en handläggare varje fall, och kan beslutet överprövas?',
          ],
        },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Rättvisemått som inte går att uppfylla samtidigt',
      minutes: 15,
      prerequisites: 'labbens genomgång och procenträkning',
      blocks: [
        'Ett mått på rättvisa är att andelen onödiga utredningar ska vara lika i båda grupperna. Ett annat är att andelen missade fel ska vara lika. Ett tredje är att lika stor andel av varje grupp ska utredas.',
        'När grupperna har olika andel felaktiga ansökningar (här 8 av 40 mot 16 av 40) går det i regel inte att uppfylla alla tre samtidigt, utom i extremfall som att utreda alla eller ingen.',
        'Uppgift: Leta i experimentläget upp den lägsta gemensamma tröskeln där ingen grupp har mer än 10 % onödiga utredningar (svaret är 63). Hur stor andel av felen missas då i varje område?',
      ],
    },
  ],
  conclusion: [
    'En tröskel byter en feltyp mot en annan. När grupper har olika poängfördelning ger samma tröskel olika fel för olika grupper.',
    'Valet av tröskel är ett beslut som någon måste ta ansvar för och kunna förklara. Mänsklig tillsyn och möjlighet att överpröva minskar skadan när systemet har fel.',
  ],
});
