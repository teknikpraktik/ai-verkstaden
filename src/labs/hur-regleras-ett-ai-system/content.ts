import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Två EU-förordningar är särskilt viktiga för AI-system som rör människor: [[ai-forordningen|AI-förordningen]] (EU) 2024/1689, som ställer krav på AI-systemen själva, och dataskyddsförordningen [[gdpr|GDPR]] (EU) 2016/679, som reglerar personuppgifter. Båda kan gälla samtidigt.',
    'Här undersöker du påhittade användningsfall. För varje fall står de antaganden som bedömningen bygger på. Ibland är rätt svar att det behövs mer information.',
    {
      type: 'note',
      kind: 'varning',
      title: 'Inte juridisk rådgivning',
      text: 'Det här är undervisningsmaterial med förenklade, påhittade scenarier. Referensdatum: 2026-11-19. Regler och tillämpningsdatum kan ändras – kontrollera alltid aktuell text på [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/1689/oj) och hos behöriga myndigheter som [IMY](https://www.imy.se/verksamhet/ai/).',
    },
  ],
  sections: [
    {
      heading: 'AI-förordningens indelning',
      blocks: [
        {
          type: 'table',
          caption: 'Fyra nivåer i AI-förordningen (förenklat)',
          head: ['Nivå', 'Exempel', 'Var i förordningen'],
          rows: [
            ['Förbjuden användning', 'Känsloigenkänning på arbetsplatser och i utbildningsinstitutioner (utom av medicinska skäl eller säkerhetsskäl)', 'Art. 5, t.ex. 5.1 f'],
            ['[[hogrisksystem|Högrisksystem]]', 'Bedömning av läranderesultat, antagning till utbildning, rekrytering', 'Art. 6 och bilaga III, punkt 3 (utbildning) och 4 (anställning)'],
            ['[[oppenhetskrav|Krav på öppenhet]]', 'Chattbottar ska tala om att de är AI; deepfakes ska redovisas', 'Art. 50'],
            ['Övriga system', 'Schemaläggning, stavningskontroll, spel', 'Inga särskilda krav utöver de allmänna, t.ex. AI-kunnighet (art. 4)'],
          ],
        },
        'Klassningen utgår främst från **vad systemet används till**, inte från vilken teknik det bygger på. Ett system i ett område i bilaga III är ändå inte högrisk om det bara utför en snäv eller förberedande uppgift utan att påverka beslutet väsentligt (art. 6.3). Ett sådant system som profilerar personer räknas dock alltid som högrisk.',
        { type: 'note', kind: 'forenklad', text: 'Förordningen har också regler för AI-modeller för allmänna ändamål, krav på leverantörer och tillhandahållare, sanktioner med mera. Labben tar bara upp det som behövs för scenarierna.' },
      ],
    },
    {
      heading: 'Ikraftträdande är inte samma sak som tillämpning',
      blocks: [
        'AI-förordningen publicerades i EU:s officiella tidning 12 juli 2024 och [[ikrafttradande|trädde i kraft]] 20 dagar senare, 1 augusti 2024 (art. 113). Men reglerna började tillämpas stegvis: förbuden och AI-kunnighet 2 februari 2025, regler om AI-modeller för allmänna ändamål 2 augusti 2025 och huvuddelen 2 augusti 2026.',
        'Förordningen har ändrats genom (EU) 2026/1744, den så kallade AI-omnibusen, som trädde i kraft 27 juli 2026. Den sköt upp kraven för högrisksystem i bilaga III till **2 december 2027** och för högrisksystem i produkter enligt bilaga I till **2 augusti 2028**. Ändringen innebar också andra justeringar, bland annat av bestämmelsen om AI-kunnighet.',
        { type: 'note', kind: 'info', text: 'Det finns också ett separat förslag om att ändra GDPR (en del av EU:s ”digitala omnibus”). Det var inte antaget på referensdatumet 2026-11-19. Labben utgår från GDPR som den gällde då.' },
      ],
    },
    {
      heading: 'GDPR gäller parallellt',
      blocks: [
        {
          type: 'list',
          items: [
            '**Art. 5** – principer, bland annat ändamålsbegränsning, dataminimering och lagringsminimering (se [labb 24](/labb/vilka-uppgifter-behover-systemet/)).',
            '**Art. 6** – all behandling kräver en rättslig grund, till exempel avtal, rättslig förpliktelse, uppgift av allmänt intresse eller samtycke.',
            '**Art. 9** – [[kanslig-personuppgift|känsliga personuppgifter]], som hälsa och biometriska uppgifter för att identifiera någon, får bara behandlas i undantagsfall.',
            '**Art. 22** – rätt att inte bli föremål för beslut som enbart grundas på automatiserad behandling, inklusive profilering, om beslutet har rättsliga följder eller på liknande sätt påverkar en i betydande grad (med vissa undantag).',
            '**Art. 35** – konsekvensbedömning när en behandling sannolikt leder till hög risk, särskilt vid ny teknik.',
          ],
        },
        'I Sverige är Integritetsskyddsmyndigheten (IMY) tillsynsmyndighet för GDPR. För AI-förordningen har regeringen gett flera myndigheter uppdrag, bland andra IMY och Post- och telestyrelsen (PTS). Ansvarsfördelningen kan ändras – kontrollera aktuellt läge.',
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Läs själv i förordningstexten',
      minutes: 20,
      prerequisites: 'labbens genomgång; vana att läsa längre texter',
      blocks: [
        'Öppna AI-förordningen på EUR-Lex (svensk version finns) och leta upp:',
        {
          type: 'list',
          ordered: true,
          items: [
            'Artikel 5.1 f. Vilka två undantag finns från förbudet mot känsloigenkänning?',
            'Bilaga III punkt 3. Vilka fyra sorters system inom utbildning räknas upp?',
            'Artikel 50.1. När behöver en chattbot inte tala om att den är en AI?',
            'Artikel 113. Vilka kapitel började tillämpas 2 februari 2025?',
          ],
        },
        'Jämför sedan med ändringsförordningen (EU) 2026/1744. Vad står det om datumen för högrisksystem?',
      ],
    },
  ],
  conclusion: [
    'Samma AI-teknik kan vara förbjuden, högrisk eller helt okontroversiell beroende på vad den används till. Därför börjar en rättslig bedömning med frågan om användningen – och när den är oklar är ”det behövs mer information” ett bra svar.',
    'Lagar har datum: när de träder i kraft och när varje regel börjar tillämpas. Kontrollera alltid aktuell lydelse, eftersom reglerna för AI fortfarande ändras.',
  ],
});
