import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben knyter ihop kapitlet: tvetydighet visar varför ord ensamma inte räcker, modereringen visar att val av beslutssätt fördelar fel mellan olika grupper, och bigrammodellen ger en konkret bild av nästa-token-prediktion som grund för stora språkmodeller – med tydlig storleksskillnad.',
  tips: [
    'Börja med att låta eleverna hitta på egna tvetydiga svenska meningar. Särskrivningar är ofta roliga och lätta att hitta.',
    'Låt eleverna göra förutsägelsen om modereringen innan besluten visas. Ta sedan upp kommentar k4: anmälan av ett hot stoppas av nyckelordsregeln.',
    'I experimentläget kan eleverna stänga av ett undantag i taget. Utan ”fasta uttryck” stoppas 3 ofarliga kommentarer, men hotet ”Jag ska slå upp var du bor” stoppas igen.',
    'Var försiktig med påståenden om specifika AI-produkter. Säg ”miljarder parametrar” generellt; exakta siffror för enskilda produkter är ofta inte offentliga.',
  ],
  misconceptions: [
    { myth: 'Datorn kan alltid avgöra betydelsen om meningen är grammatiskt korrekt.', reality: 'Grammatiskt korrekta meningar kan ha flera rimliga tolkningar. Det krävs sammanhang.' },
    { myth: 'Att stoppa för mycket är alltid säkrast.', reality: 'Onödiga stopp tystar vanliga elever och i värsta fall den som försöker anmäla ett hot.' },
    { myth: 'En smartare regel löser problemet.', reality: 'Kontextregeln gör färre onödiga stopp men missar fler hot. Felen flyttas, de försvinner inte.' },
    { myth: 'Språkmodeller slår upp svar i en databas.', reality: 'De räknar ut sannolikheter för nästa token och väljer ett i taget. Därför kan de skriva nya meningar – och fel.' },
  ],
  discussionStops: [
    'Efter tvetydigheten: Hur skulle en översättningstjänst översätta ”Vi tittade på tomten” till engelska utan sammanhang?',
    'Efter modereringen: Vem bör bestämma vilket beslutssätt forumet använder? Vad ska hända med en stoppad kommentar?',
    'Efter nästa-ord-demon: Varför blir texten konstigare ju längre den genereras? Vad skulle hända om modellen såg tio ord bakåt?',
  ],
  answers: [
    { question: 'Förutsägelse: Vem hade kikaren?', answer: ['Det går inte att avgöra från meningen ensam. Båda tolkningarna är grammatiskt möjliga; sammanhanget avgör.'] },
    { question: 'Vad avgör vilken tolkning som är rimligast?', answer: ['Sammanhanget. Meningen är densamma i båda fallen, så ordningen på orden räcker inte.'] },
    { question: 'Förutsägelse: Vilket beslutssätt stoppar flest ofarliga kommentarer?', answer: ['Nyckelordsregeln: 5 ofarliga stoppas (k1, k2, k3, k4, k6). Kontextregeln stoppar 0 ofarliga.'] },
    { question: 'Hur många ofarliga kommentarer stoppar nyckelordsregeln?', answer: ['5. Vanliga felsvar: 8 (alla stoppade) och 3 (rätt stoppade hot). Nyckelordsregeln missar 1 hot (k8), kontextregeln missar 2 (k7 och k8).'] },
    { question: 'Vilka drabbas när nyckelordsregeln stoppar ofarliga kommentarer?', answer: ['Eleven som ber om hjälp att slå upp ord och eleven som anmäler ett hot mot en kompis (och kompisen). Den som får det nyckelordslösa hotet i k8 drabbas av att för lite stoppas, inte för mycket.'] },
    {
      question: 'Vilket beslutssätt skulle du välja för forumet, och vad skulle du lägga till?',
      answer: [
        'Exempelresonemang: Jag skulle välja kontextregeln, eftersom nyckelordsregeln stoppar 5 av 6 ofarliga kommentarer, bland annat en anmälan om hot. Men kontextregeln missar 2 av 4 hot, så den räcker inte ensam. Jag skulle låta en vuxen granska kommentarer med nyckelord i stället för att publicera dem direkt, och ge eleverna ett sätt att anmäla hot som inte går via filtret. Den som blir hotad drabbas av missade hot; den som ber om hjälp eller anmäler drabbas av onödiga stopp.',
        'Ett lika godtagbart svar väljer nyckelordsregeln plus mänsklig granskning av allt som stoppas, om det motiveras med att missade hot är allvarligast.',
      ],
    },
    { question: 'Hur stor är sannolikheten att ”en” följs av ”bok”?', answer: ['3/7 ≈ 43 %. Efter ”en” kommer bok 3, katt 2, tidning 1, text 1 (summa 7). Vanliga felsvar: 3 (antalet) och 50 % (summan räknas till 6).'] },
    { question: 'Vad har labbens lilla modell gemensamt med en stor språkmodell?', answer: ['Båda förutsäger nästa token utifrån sannolikheter som lärts från text. Skillnaden: 71 räknade ordpar och ett ords sammanhang mot miljarder parametrar och tusentals token av sammanhang.'] },
  ],
});
