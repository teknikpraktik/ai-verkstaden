import { defineChapterTeacher } from '../../course/types';

export default defineChapterTeacher({
  lessons: [
    {
      title: 'Lektion 1: Flöden, fel och rättvisa',
      minutes: 70,
      plan: [
        '10 min: Inledande fråga – vad vet din favoritapp om dig? Skriv tre gissningar.',
        '20 min: Labb 22 i genomgångsläge. Gemensam genomgång av jämförelsetabellen (1 mot 5 ämnen).',
        '25 min: Labb 23 i par. Stanna efter steg 3 och diskutera vilken feltyp som är värst.',
        '15 min: Paren redovisar sin tröskel och sina villkor. Lyft att flera svar är försvarbara.',
      ],
    },
    {
      title: 'Lektion 2: Uppgifter och regler',
      minutes: 70,
      plan: [
        '20 min: Labb 24. Låt eleverna jämföra hur många uppgifter de behöll.',
        '35 min: Labb 25. Gör känsloläsaren och rättningsassistenten gemensamt, resten i par. Diskutera studievägledarboten i helklass.',
        '15 min: Tidslinjen – skillnaden mellan ikraftträdande och tillämpning. Kontrollera före lektionen att datumen fortfarande stämmer.',
      ],
    },
    {
      title: 'Lektion 3: Beslut med flera intressenter',
      minutes: 60,
      plan: [
        '5 min: Fördela de sex rollerna i labb 26.',
        '20 min: Eleverna gör labb 26 individuellt och skriver sitt yttrande.',
        '20 min: Grupper med en av varje roll förhandlar fram ett gemensamt beslut.',
        '15 min: Kunskapskontrollen för kapitlet och kort genomgång av svaren.',
      ],
    },
  ],
  checkAnswers: [
    { question: 'Vad händer med variationen i ett flöde som ger alla platser åt det mest klickade?', answer: ['Den minskar. I labb 22 blev det 1 ämne av 6 i engagemangsläget och 5 i variationsläget.'] },
    { question: 'Vad händer oftast om tröskeln höjs?', answer: ['Färre falskt positiva, fler falskt negativa.'] },
    { question: 'Andel korrekta ansökningar som utreds i onödan (6 av 24)', answer: ['25 %. Vanliga felsvar: 15 % (delat med alla 40) och 38 % (delat med de 16 felaktiga).'] },
    { question: 'Hemadress i ett matteverktyg', answer: ['Dataminimering.'] },
    { question: 'Uppgifter för övningar används för betyg', answer: ['Nytt ändamål som måste prövas för sig (ändamålsbegränsning). Koppla gärna till att bedömning av läranderesultat är högrisk enligt AI-förordningen (bilaga III punkt 3).'] },
    { question: 'Känsloigenkänning i klassrummet', answer: ['Förbjuden enligt AI-förordningen art. 5.1 f (från 2 februari 2025), utom av medicinska skäl eller säkerhetsskäl.'] },
    { question: 'Vad betyder ikraftträdandet 1 augusti 2024?', answer: ['Att förordningen blev bindande. Reglerna tillämpas stegvis: förbud 2 februari 2025, huvuddelen 2 augusti 2026, högrisk enligt bilaga III 2 december 2027 efter ändringen genom (EU) 2026/1744. Kontrollera aktuellt läge.'] },
    {
      question: 'AI för att prioritera extra studiehjälp: fakta och villkor',
      answer: [
        '**Exempel:** Kommunen måste ta reda på om systemets prioritering avgör vem som får hjälp eller bara är ett underlag, vilka uppgifter det använder (t.ex. hälsa, som är känsliga enligt GDPR art. 9), hur ofta det har fel och för vilka grupper, och om det kan räknas som högrisk enligt AI-förordningen. Villkor: bara nödvändiga uppgifter, radering efter läsåret, en handläggare bedömer varje fall, eleven får veta varför och kan begära omprövning, och felen granskas per grupp varje termin.',
      ],
    },
  ],
  notes: [
    'Labb 25 och kapitlets kontroll innehåller rättsliga datum. Materialet har referensdatum 2026-11-19. De nya tillämpningsdatumen och IMY:s uppdrag är kontrollerade direkt hos kommissionen och IMY. EUR-Lex kunde inte läsas maskinellt (webbläsarkontroll); förordningstexterna kontrollerades mot en konsoliderad återgivning och sökresultat. Kontrollera mot EUR-Lex före användning – se källistan och kontrollstatus i labb 25.',
    'Alla scenarier, organisationer och personer är påhittade. Uppmuntra eleverna att ifrågasätta antagandena – det är en del av lärandet.',
  ],
});
