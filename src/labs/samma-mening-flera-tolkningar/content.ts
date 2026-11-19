import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Språk är fullt av [[tvetydighet]]. ”Jag såg mannen med kikaren” kan betyda två helt olika saker, och vi märker det knappt eftersom vi använder [[kontext|sammanhanget]] utan att tänka på det. För ett datorprogram är det betydligt svårare.',
    'I labben prövar du först några tvetydiga svenska meningar. Sedan jämför du två sätt att moderera ett påhittat elevforum och bedömer vem som drabbas av felen. Till sist låter du en mycket liten [[sprakmodell|språkmodell]] förutsäga nästa ord.',
  ],
  sections: [
    {
      heading: 'Tre sorters svensk tvetydighet',
      blocks: [
        {
          type: 'table',
          caption: 'Exempel från labben',
          head: ['Sort', 'Exempel', 'Tolkningar'],
          rows: [
            ['Meningens byggnad', 'Jag såg mannen med kikaren.', 'Jag använde kikaren – eller mannen hade den'],
            ['Ord med flera betydelser', 'Vi tittade på tomten. / Byt fil nu!', 'Jultomten eller marken runt huset; körfält eller datorfil'],
            ['[[sarskrivning|Särskrivning]]', 'Vi säljer kassa skåp.', 'Dåliga skåp – eller kassaskåp som skrivits isär'],
          ],
        },
        'I alla fallen avgör sammanhanget. En mening om julafton gör jultomten rimlig, en mening om en mäklare gör marken rimlig. Ett system som bara tittar på en mening i taget – eller bara på enstaka ord – har inte den informationen.',
      ],
    },
    {
      heading: 'Moderering: två beslutssätt, olika fel',
      blocks: [
        'Moderering är ett område där tvetydighet får verkliga följder. Labbens elevforum, skola och kommentarer är påhittade, och facit är en mänsklig bedömning i scenariot.',
        {
          type: 'table',
          caption: 'Utfall på de tio kommentarerna',
          head: ['Beslutssätt', 'Stoppade', 'Ofarliga som stoppades', 'Skadliga som missades'],
          rows: [
            ['Nyckelordsregel', '8', '5', '1'],
            ['Kontextregel', '2', '0', '2'],
          ],
        },
        'Nyckelordsregeln gör många [[falskt-positiv|falskt positiva]] fel: den stoppar den som vill slå upp ett ord och – värst – den som citerar ett hot för att anmäla det. Kontextregeln stoppar inget i onödan, men den gör fler [[falskt-negativ|falskt negativa]] fel: undantaget för ”slå upp” lurades av ”Jag ska slå upp var du bor”, och ett hot utan nyckelord missas av båda.',
        'Inget av beslutssätten är felfritt. Att välja beslutssätt är att välja vilka som ska bära felen. Därför behövs [[manniska-i-loopen|mänsklig tillsyn]], till exempel att stoppade inlägg granskas och att man kan överklaga.',
        { type: 'note', kind: 'pahittad', text: 'Forumet, kommentarerna och bedömningarna är påhittade för labben. Riktiga modereringssystem är större och använder ofta maskininlärning, men samma avvägning mellan onödiga stopp och missade fall finns där.' },
      ],
    },
    {
      heading: 'Nästa ord – grunden i språkmodeller',
      blocks: [
        'Labbens språkmodell har räknat vilka ord som följer på varandra i 20 korta, påhittade meningar – så kallade [[bigram]]. Efter ”en” kommer ”bok” 3 gånger av 7, alltså med sannolikheten 3/7 ≈ 43 %.',
        {
          type: 'list',
          items: [
            '**Girig generering** väljer alltid det mest sannolika ordet. Det ger samma text varje gång.',
            '**Slumpad generering** drar nästa ord enligt sannolikheterna. Med samma startvärde blir det samma resultat, så försöket går att upprepa.',
            '**Begränsningar:** modellen ser bara det sista ordet, så ”jag såg en katt sover i parken” kan uppstå. Den tystnar helt vid ett ord den aldrig har sett. Och den kan bara upprepa ordpar ur sin lilla korpus.',
          ],
        },
        { type: 'note', kind: 'forenklad', text: 'Storleksskillnaden är enorm. Labbens modell har lärt sig 71 tal (antal ordpar) från 112 ord. Stora språkmodeller har miljarder parametrar, tränas på enorma textmängder, använder neurala nätverk i stället för en räknetabell och tar hänsyn till tusentals token bakåt. Grundidén – att förutsäga nästa token utifrån sannolikheter – är ändå densamma.' },
        'Att stora modeller ser långt sammanhang är en stor del av varför de ofta väljer rimliga tolkningar av tvetydiga meningar. Men de bygger fortfarande på sannolikheter från text de har tränats på, och de kan välja fel tolkning eller skriva saker som låter rimliga men är fel.',
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Bigrammodellen i pseudokod',
      minutes: 10,
      prerequisites: 'labbens genomgång; sannolikhet som andel räcker',
      blocks: [
        { type: 'formula', text: 'P(nästa = b | föregående = a) = antal(a b) / antal(a följt av något ord)', caption: 'Exempel: P(bok | en) = 3 / 7' },
        {
          type: 'pseudo',
          title: 'Träning och generering',
          code: `för varje mening i korpusen:
    för varje par av ord (a, b) som står efter varandra:
        antal[a][b] ← antal[a][b] + 1

text ← startorden
upprepa högst 10 gånger:
    a ← sista ordet i text
    om antal[a] är tomt: sluta (okänt ord)
    om girigt: b ← ordet med störst antal[a][b]
    annars:    b ← dra ett ord med sannolikheten antal[a][b] / summan av antal[a]
    lägg b sist i text
    om b är punkt: sluta`,
        },
        'En trigrammodell tittar på de två senaste orden. Fler ord bakåt ger bättre sammanhang men kräver mycket mer text, eftersom de flesta långa ordföljder bara förekommer en gång eller aldrig. Neurala språkmodeller löser det genom att lära sig mönster i stället för att räkna exakta ordföljder.',
      ],
    },
  ],
  conclusion: [
    'Samma mening kan betyda olika saker, och sammanhanget avgör. Ett system som tittar på enstaka ord gör fel åt ett håll, ett system med enkla kontextregler gör fel åt ett annat. Vem som drabbas beror på vilket beslutssätt som väljs.',
    'Språkmodeller förutsäger nästa token utifrån sannolikheter. Labbens modell visar idén i liten skala – och varför storlek och långt sammanhang betyder så mycket för de stora modellerna.',
  ],
});
