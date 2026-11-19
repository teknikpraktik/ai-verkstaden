import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben gör robotens styrslinga konkret: en sensor, en regel och en motor. Eleverna felsöker kedjan genom att jämföra mätvärde, beslut och konsekvens, och ser att fel kan uppstå i varje led. Brus och säkerhetsmarginal förbereder diskussionen om osäkerhet i labb 20 och 21.',
  tips: [
    'Starta gemensamt på projektor: stega de första 8 stegen och låt klassen säga högt vad sensorn mäter och vad programmet ”borde” göra innan ni trycker.',
    'Låt eleverna själva formulera regeln med ord: ”om det är mindre än en ruta kvar, sväng höger”. Det gör villkoret i gränsen 0-steget lättare att genomskåda.',
    'Påpeka att bruset är detsamma i båda försöken (samma startvärde). Det är det som gör jämförelsen rättvis – bara gränsen ändras.',
    'I experimentläget kan eleverna ställa ut egna hinder (klick eller Enter på en ruta) och prova ”stanna” som handling. Fråga: vad händer med en robot som stannar när sensorn har brus?',
  ],
  misconceptions: [
    { myth: 'Sensorn bestämmer vad roboten gör.', reality: 'Sensorn mäter bara. Beslutet fattas av styrprogrammet och utförs av motorn. Gränsen 0-försöket visar en korrekt sensor och ett felaktigt beslut.' },
    { myth: 'En bättre regel löser alla problem.', reality: 'Regeln kan bara använda det sensorn rapporterar. Med sikt 1 och fart 2 krockar roboten 4 gånger trots gränsen 2.' },
    { myth: 'Brus betyder att roboten gör slumpmässiga saker.', reality: 'Programmet är helt förutsägbart. Det är mätvärdet som ibland är fel. Samma mätvärden ger alltid samma beslut.' },
    { myth: 'Större säkerhetsmarginal är alltid bättre.', reality: 'Gränsen 2 ger 0 krockar men roboten städar 19 rutor i stället för 21. I verkligheten kostar marginal tid, energi och funktion.' },
  ],
  discussionStops: [
    'Efter steg 2: Vilka sensorer har en robotdammsugare eller en självkörande gräsklippare? Vad mäter de?',
    'Efter gränsen 0: Hur skulle man upptäcka ett sådant fel innan roboten säljs? (testning, loggar, simulering)',
    'Efter brus: Var i vardagen möter ni sensorer som ibland mäter fel? (stegräknare, backsensor i bil, ansiktsupplåsning i mörker)',
  ],
  answers: [
    { question: 'Förutsägelse: Hur många gånger krockar roboten på 30 steg?', answer: ['Inte en enda gång. Med gränsen 1, fart 1, sikt 3 och utan brus svänger roboten exakt när den står vid ett hinder. Den kör längs väggarna och besöker 22 rutor.'] },
    { question: 'Steg 8: sensorn mätte 0. Vad hände?', answer: ['Programmet jämförde 0 < 1. Villkoret var sant, så motorn vände roboten nedåt (▼). Ingen krock.'] },
    { question: 'Var i kedjan ligger felet med gränsen 0?', answer: ['I styrprogrammet. Ett mätvärde kan aldrig vara mindre än 0, så regeln väljer alltid ”kör framåt”. Sensorn mäter rätt (0 rutor). Roboten krockar 26 gånger, första gången i steg 5 framför väskan i G2.'] },
    { question: 'Hur många krockar blir det med fart 2 och gränsen 1?', answer: ['4. När 1 ruta är fri är 1 inte < 1, så roboten kör 2 rutor och krockar efter 1. Med gränsen 2 blir det 0 krockar. Vanliga felsvar: 0 (eleven har valt gränsen 2) och 2 (räknat bara en sträcka).'] },
    { question: 'Varför krockar roboten med sikt 1 trots gränsen 2?', answer: ['När hindret är 2 rutor bort (1 fri ruta) ligger det utanför sikten. Sensorn säger ”inget hinder”, programmet väljer ”kör framåt” och roboten kör 2 rutor rakt in i hindret. 4 krockar.'] },
    { question: 'Hur många krockar blir det med lågt brus och gränsen 1?', answer: ['3 (startvärde 5). Första krocken i steg 13: verkligt avstånd 0 men mätvärdet 1. 7 av 30 mätvärden är fel, men bara de där sensorn säger 1 i stället för 0 ger krock. Med gränsen 2 blir det 0 krockar.'] },
    {
      question: 'Öppen fråga: Varför besökte roboten färre rutor med gränsen 2, och vilken gräns skulle du välja?',
      answer: [
        'Exempelresonemang: Bruset gör att sensorn ibland säger 1 när roboten står vid väggen. Med gränsen 1 kör den då och krockar. Med gränsen 2 svänger den redan när mätvärdet är 1, så det felet ger ingen krock. Men den svänger också när det verkligen finns en fri ruta kvar, så den kommer aldrig ända fram till väggarna och städar 19 rutor i stället för 21.',
        'I ett klassrum där elever rör sig väger säkerheten tyngst: hellre lite smutsigare hörn än att roboten kör på någons fot. Ett starkt svar nämner också andra lösningar, som en bättre sensor, lägre fart eller att mäta flera gånger.',
      ],
    },
  ],
});
