import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben visar att en tröskel byter en feltyp mot en annan och att samma tröskel kan ge mycket olika felandelar i grupper med olika poängfördelning. Eleverna tränar på att alltid ange nämnare och på att motivera en avvägning med rättvisa, transparens, ansvar och mänsklig tillsyn. Bygger vidare på förväxlingsmatrisen från kapitel 1 och 3.',
  tips: [
    'Börja med att låta eleverna säga högt vad ett falskt positivt respektive falskt negativt utfall betyder för en verklig person i scenariot.',
    'Tryck på nämnarna: ”14 av 24” och ”14 av 40” är olika påståenden. Det vanligaste felet är att räkna andelen bland alla ansökningar.',
    'Låt grupper välja olika trösklar och argumentera för dem. Det finns inget enda rätt svar på motiveringsfrågan.',
    'Experimentläget med olika trösklar per område väcker ofta en bra diskussion om likabehandling kontra lika utfall.',
  ],
  misconceptions: [
    { myth: 'En och samma tröskel för alla är automatiskt rättvis.', reality: 'Vid tröskel 50 utreds 1 av 32 korrekta ansökningar i Norr men 14 av 24 i Söder. Likabehandling i regeln kan ge olika utfall.' },
    { myth: 'Det finns en bästa tröskel som löser problemet.', reality: 'Högre tröskel ger färre onödiga utredningar men fler missade fel. Valet är en värdering.' },
    { myth: 'Om Söder har fler fel är det rimligt att fler korrekta ansökningar där utreds.', reality: 'Andelen onödiga utredningar räknas bland de korrekta ansökningarna. Att andra i området gjort fel säger ingenting om den enskilda korrekta ansökan.' },
  ],
  discussionStops: [
    'Efter steg 2: Hur skulle det kännas att vara en av de 14 i Söder vars korrekta ansökan utreds?',
    'Efter steg 3: Vilken feltyp är värst – för den sökande, för myndigheten, för samhället?',
    'Efter experimentläget: Är det rättvist med olika trösklar för olika områden? Vad skulle krävas för att det skulle vara godtagbart?',
  ],
  answers: [
    { question: 'Förutsägelse: Var utreds störst andel korrekta ansökningar i onödan vid tröskel 50?', answer: ['Område Söder: 14 av 24 (58 %), mot 1 av 32 (3 %) i Norr.'] },
    { question: 'Hur många korrekta ansökningar i Område Söder utreds i onödan vid tröskel 50?', answer: ['14. Vanliga felsvar: 24 (alla korrekta), 30 (alla som utreds), 58 (procent), 1 (Norr).'] },
    { question: 'Hur många felaktiga ansökningar i Område Norr missas vid tröskel 60?', answer: ['3 av 8 (38 %). Vid tröskel 50 missades 1 av 8.'] },
    { question: 'Fördjupning: lägsta gemensamma tröskel där ingen grupp har mer än 10 % onödiga utredningar', answer: ['63. Då utreds 0 av 32 (Norr) och 2 av 24 (Söder, 8 %) i onödan, och 3 av 8 (Norr) respektive 6 av 16 (Söder) fel missas – 38 % i båda.'] },
    {
      question: 'Vilken tröskel skulle du välja, och vilka villkor skulle du ställa?',
      answer: [
        '**Exempel 1 (hög tröskel, t.ex. 63):** En onödig utredning drabbar en person som gjort rätt och kan försena pengar hon behöver. Vid 63 är andelen onödiga utredningar högst 8 % i båda områdena. Fler fel missas (38 % i båda), men det är myndighetens ansvar att hitta dem på annat sätt, till exempel genom stickprov. Modellen bör inte använda antal flyttar. De som utreds ska få veta varför (transparens), och en handläggare ska göra en egen bedömning innan utredningen startar (mänsklig tillsyn).',
        '**Exempel 2 (tröskel 50 med villkor):** Felaktiga utbetalningar kostar skattepengar och kan behöva betalas tillbaka med stora belopp, vilket också drabbar den sökande. Därför vill jag missa få fel. Men skillnaden mellan områdena (3 % mot 58 %) är inte godtagbar. Villkor: poängen får bara vara ett underlag, handläggaren ska avsluta onödiga utredningar snabbt, felandelar per område ska redovisas offentligt varje kvartal och en namngiven chef ansvarar för tröskeln.',
        '**Exempel 3 (olika trösklar):** Med tröskel 50 i Norr och 60 i Söder blir andelen onödiga utredningar 3 % respektive 13 %, och missade fel 13 % respektive 13 %. Utfallen blir jämnare, men reglerna skiljer sig mellan områden, vilket kan uppfattas som orättvist och kan vara svårt att förena med likabehandling. Kräver öppen redovisning och rättslig prövning.',
        'Bedöm om eleven anger siffror med nämnare, tar ställning till vilken feltyp som är värst och använder alla fyra principerna konkret.',
      ],
    },
  ],
});
