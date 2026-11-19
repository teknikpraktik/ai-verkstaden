import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben ger det begreppsliga underlaget för resten av kapitlet: graf, nod, kant, start, mål, kostnad, cykel, sökträd och besökta noder. Skillnaden mellan träd- och grafsökning gör det begripligt varför sökalgoritmerna i labb 7 och 8 har en lista över besökta noder.',
  tips: [
    'Rita exempelgrafen på tavlan och låt klassen gemensamt rita sökträdet till djup 2 innan de öppnar trädet i labben.',
    'Låt eleverna i experimentläget bygga en graf utan cykler (ett träd) och jämföra sökträdets storlek med antalet noder.',
    'Alla ändringar görs med formulär och knappar – inga musdragningar behövs. Det fungerar bra på surfplatta och med tangentbord.',
  ],
  misconceptions: [
    { myth: 'Sökträdet och grafen är samma sak.', reality: 'Grafen har en nod per ort. Sökträdet har en nod per väg dit, så samma ort kan finnas många gånger (Stockholm 3 gånger till djup 3).' },
    { myth: 'Vägen med minst antal steg är alltid billigast.', reality: 'Västerås → Enköping → Stockholm har 2 steg men kostar 110, medan vägen via Uppsala har 3 steg och kostar 100.' },
    { myth: 'Sökningen slutar när den ser målet som granne.', reality: 'I labbens algoritmer kontrolleras målet när noden tas ut ur listan med väntande noder. Det är viktigt för att uniformkostnadssökning ska hitta billigaste väg.' },
  ],
  discussionStops: [
    'Efter steg 2: Varför blir trädet så mycket större än grafen? Vad händer om vi går till djup 10?',
    'Efter steg 4: I vilka vardagssituationer är minst antal steg viktigast, och när är kostnaden viktigast?',
    'Efter steg 5: Ge exempel på problem där det är viktigt att kunna säga ”det finns ingen lösning”.',
  ],
  answers: [
    { question: 'Förutsägelse: Hur många gånger finns Stockholm i sökträdet till djup 3?', answer: ['3 gånger: Västerås → Enköping → Stockholm, Västerås → Enköping → Uppsala → Stockholm och Västerås → Sala → Uppsala → Stockholm.'] },
    { question: 'Hur många noder har sökträdet till djup 3?', answer: ['20 (1 + 2 + 5 + 12). Felsvaren 5 (antal noder i grafen) och 12 (bara djup 3) är vanliga.'] },
    { question: 'Vad kostar den billigaste vägen från Västerås till Stockholm?', answer: ['100 minuter via Enköping och Uppsala. Vägen med minst antal steg kostar 110.'] },
    {
      question: 'Förklara start, mål, kostnad och cykel, och varför en sökning behöver komma ihåg besökta noder.',
      answer: [
        'Exempelresonemang: Start är noden där sökningen börjar, till exempel Västerås, och mål är noden den ska hitta, till exempel Stockholm. Kostnaden för en väg är summan av kanternas vikter, till exempel 30 + 30 + 40 = 100 minuter. En cykel är en väg som leder tillbaka till en nod man redan passerat, som Västerås → Enköping → Uppsala → Sala → Västerås.',
        'Om sökningen inte minns besökta noder undersöker den samma ort flera gånger och kan gå runt i en cykel för evigt. Med listan över besökta noder undersöks varje nod högst en gång.',
      ],
    },
  ],
});
