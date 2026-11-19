import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben visar en hel textklassificerare som går att granska ord för ord. Eleverna ser varför bag-of-words fungerar ganska bra på enkla fall men missar negation, ordningsföljd och okända ord, och de övar på att redovisa fel på reserverade exempel. Modellen är multinomial naiv Bayes med Laplace-utjämning (α = 1) på ordformer med små bokstäver.',
  tips: [
    'Låt eleverna göra förutsägelsen om ”inte” innan de ser resultatet. Många tror att modellen byter beslut.',
    'Be eleverna skriva ett meddelande som lurar modellen åt båda hållen. Jämför i helklass vilka knep som fungerade.',
    'I experimentläget kan eleverna lägga till egna träningsexempel. Låt dem försöka rätta ett av felen på de reserverade exemplen och diskutera om det är fusk att träna på liknande meddelanden som testet.',
    'Utjämning α = 0 är ett bra sätt att visa varför utjämning behövs.',
  ],
  misconceptions: [
    { myth: 'Modellen förstår meddelandet.', reality: 'Den lägger bara ihop bidrag från ord den har räknat. ”Lektionen är inte inställd” och ”inställd inte lektionen är” får samma poäng.' },
    { myth: 'Okända ord räknas som oviktiga.', reality: 'Okända ord hoppas över helt och påverkar inte åt något håll.' },
    { myth: 'Att modellen gör rätt på träningsexemplen visar att den är bra.', reality: 'Det är först på reserverade exempel som man ser hur den klarar nya meddelanden. Här blev 2 av 6 fel.' },
    { myth: 'Sannolikheten modellen visar (t.ex. 97 %) är pålitlig.', reality: 'Naiv Bayes är ofta överdrivet säker eftersom orden räknas som oberoende. Använd sannolikheten för att jämföra, inte som en exakt chans.' },
  ],
  discussionStops: [
    'Efter ordbidragen: Varför ger ett vanligt ord som ”i” ett litet bidrag?',
    'Efter negationen: Hur skulle man kunna göra så att modellen märker ”inte inställd”? (Ordpar/bigram, regler, större modeller.)',
    'Efter de reserverade exemplen: Vilket fel är värst för eleverna – ett missat viktigt meddelande eller ett falsklarm? Vem bär konsekvensen?',
  ],
  answers: [
    { question: 'Förutsägelse: Vad händer om meddelandet blir ”Lektionen är inte inställd i morgon”?', answer: ['Modellen säger fortfarande Viktigt, med poängen +3,53 i stället för +3,54. ”inte” finns en gång i varje klass och ger −0,01.'] },
    { question: 'Vilket ord i ”Lektionen är inställd i morgon” drar mest mot Viktigt?', answer: ['”morgon” (+1,09): två förekomster i Viktigt och ingen i Kan vänta. ”lektionen”, ”är” och ”inställd” ger +0,68 var, ”i” +0,40. Summa +3,54. Vanligt felsvar: ”inställd”, eftersom det känns viktigast för oss.'] },
    { question: 'Poängen sjönk bara från +3,54 till +3,53. Varför?', answer: ['”inte” finns lika ofta i båda klasserna och bag-of-words ser inte vilket ord ”inte” hör till.'] },
    { question: 'Varför blir det oavgjort för ”Glassbilen kommer efter skolan”?', answer: ['Inget av orden finns i träningsdata, så alla hoppas över. Klasserna är lika vanliga (8 och 8), så förhandsläget är 0. Samma sak gäller ett tomt meddelande.'] },
    { question: 'Hur många av de 6 reserverade exemplen sorterar modellen fel?', answer: ['2 (33 %). Ett falskt negativt: ”Skolan stängd på grund av snöstorm” (bara ”på” är känt, −1,11). Ett falskt positivt: ”Det blir inget prov i morgon” (”i” +0,40 och ”morgon” +1,09; ”prov” är okänt eftersom träningsdata bara har ”provet”).'] },
    {
      question: 'Välj ett av felen. Förklara med ordens bidrag varför modellen gjorde fel och föreslå en förbättring.',
      answer: [
        'Exempelresonemang: ”Det blir inget prov i morgon” blev Viktigt eftersom ”morgon” (+1,09) och ”i” (+0,40) bara finns i träningsdatans viktiga meddelanden. ”inget” och ”prov” är okända och hoppas över, och modellen ser inte att ”inget” vänder betydelsen. Förbättringar: fler träningsexempel med negationer, eller ordpar som ”inget prov”. Stemming räcker inte här: då känns ”prov” igen som ”provet” och meddelandet dras ännu mer mot Viktigt (+2,86 i stället för +1,49). Felen måste mätas på reserverade exempel, annars ser modellen bättre ut än den är.',
      ],
    },
  ],
});
