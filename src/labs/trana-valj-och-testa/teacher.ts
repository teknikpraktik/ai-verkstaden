import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben är kapitlets metodkärna: korrekt användning av tränings-, validerings- och testdata, överanpassning, förväxlingsmatris och dataläckage. Testdatan är tekniskt låst tills eleven har valt, så att arbetsgången blir en vana.',
  tips: [
    'Gå igenom tabellen med de tre delarna gemensamt innan eleverna börjar. Liknelse: träning = läxor, validering = övningsprov, test = det riktiga provet.',
    'Låt eleverna lägga märke till att testresultatet (86 %) blev lägre än valideringsresultatet (94 %). Det är normalt och ett tecken på att testet är ärligt.',
    'Om en elev ångrar sitt val visar labben att testet är förbrukat. Ta upp det som diskussionsfråga snarare än som fel.',
    'Läckagedemonstrationen använder egna data. Betona att det ordinarie testet aldrig påverkas.',
  ],
  misconceptions: [
    { myth: 'Bästa modellen är den med högst träffsäkerhet på träningsdatan.', reality: 'k = 1 får alltid 100 % på träningsdatan men bara 80 % på validering. Det är överanpassning.' },
    { myth: 'Man kan titta på testet så många gånger man vill, det ändrar ju inte datan.', reality: 'Varje gång testresultatet påverkar ett val blir testet en del av träningen och resultatet för optimistiskt.' },
    { myth: '63 % rätt betyder att modellen hittar ungefär två tredjedelar av de sjuka.', reality: 'Modellen med k = 79 hittar 0 av 13 sjuka. Träffsäkerheten kommer helt från de friska plantorna.' },
    { myth: 'Valideringsresultatet är ett ärligt mått.', reality: 'Det är lite för optimistiskt eftersom det bästa av flera försök valdes. Därför behövs ett separat test.' },
  ],
  discussionStops: [
    'Efter steg 2: Varför är 100 % på träningsdata inget att vara stolt över?',
    'Efter testet: Vad skulle hända om alla i klassen fick välja om tills testresultatet blev högt?',
    'Efter feltyper: Vem ska bestämma om missade sjuka plantor eller falsklarm är värst? Jämför med medicinska tester.',
  ],
  answers: [
    { question: 'Förutsägelse: Vilket k ger högst träffsäkerhet på träningsdatan?', answer: ['k = 1 (100 %). Varje träningsplanta är sin egen närmaste granne.'] },
    { question: 'Varför 100 % på träning men 80 % på validering med k = 1?', answer: ['Modellen har lärt sig träningsdatan utantill inklusive slumpen (överanpassning) och generaliserar sämre till nya plantor.'] },
    { question: 'Vilket k ger högst träffsäkerhet på valideringsdatan?', answer: ['k = 9: 33 av 35 (94 %). Vanliga felsvar: 1 (bäst på träning) och 79.'] },
    { question: 'Vad händer om man väljer om efter att ha sett testet?', answer: ['Testdatan blir en del av valet och resultatet blir för optimistiskt. Testresultatet för k = 9 är 30 av 35 (86 %), med 3 missade sjuka och 2 falsklarm.'] },
    { question: 'Hur många av de 13 sjuka hittar k = 79?', answer: ['0. Modellen säger frisk om alla. 22 av 35 rätt = 63 %.'] },
    { question: 'k = 5 eller k = 25 (båda 89 %)?', answer: ['k = 25 missar 2 sjuka och ger 2 falsklarm; k = 5 missar 3 och ger 1 falsklarm. Växthuset bör föredra k = 25 om missade sjuka plantor är värst.'] },
    { question: 'Varför 100 % med läckage men 74 % på nya plantor?', answer: ['Testplantorna fanns i träningsdatan; med k = 1 är varje testplanta sin egen närmaste granne. Utan läckage: 80 % på demo-testet och 71 % på nya plantor.'] },
    {
      question: 'Öppen fråga: Förklara arbetsgången för växthusets ägare.',
      answer: [
        'Exempelresonemang: ”Träningsplantorna använder modellen för att lära sig, så resultatet på dem är för bra – med k = 1 blir det 100 %. Därför väljer vi k med andra plantor, valideringsdatan, och där var k = 9 bäst. Sedan låste vi valet och testade en gång på plantor som aldrig använts: 86 % rätt. Men det säger inte allt – modellen missade 3 av 11 sjuka plantor, och det kan vara viktigare än totalsiffran.”',
      ],
    },
  ],
});
