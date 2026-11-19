import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Extralabben täcker ämnesplanens ”beslutsträd” under översikten av metoder och algoritmer. Eleverna bygger roten själva med Gini-orenhet, jämför med en girig CART-algoritm, ser överanpassning när maxdjupet ökar och följer vägen för ett nytt exempel som en ingång till transparens. Den bygger vidare på labb 12 (träning/test, överanpassning).',
  tips: [
    'Räkna rotens Gini (0,497) gemensamt på tavlan innan eleverna börjar. Bråkformen 286/576 visar att det inte är något magiskt.',
    'Låt eleverna först gissa vilken fråga som är bäst. Många tror på regn – det ger 0,469 mot vindfrågans 0,342.',
    'Betona skillnaden mot spelträdet i labb 9: där är trädet alla möjliga drag, här en modell som lärts från data.',
    'Dag 13 (moln, 16 °C, inställd för att tränaren var sjuk) är planterat brus. Låt eleverna leta upp den i datatabellen när de ser att djup 4 blir sämre på test.',
    'Påpeka att labben jämför djup på testdata för att visa fenomenet, men att man i praktiken väljer djup med valideringsdata (labb 12).',
  ],
  misconceptions: [
    { myth: 'Algoritmen väljer vind för att den vet att vind är farligt.', reality: 'Algoritmen vet ingenting om världen. Den räknar bara hur träningsdagarna fördelas för varje möjlig fråga.' },
    { myth: 'Ett djupare träd är alltid bättre.', reality: 'Djup 4 får 100 % på träning men 83 % på test; djup 2 får 92 % på test.' },
    { myth: 'Ett beslutsträd är samma sak som spelträdet i labb 9.', reality: 'Spelträdet listar möjliga drag; beslutsträdet är en inlärd modell med frågor om egenskaper.' },
    { myth: 'Om man kan förklara ett beslut är det rättvist.', reality: 'Transparens gör det lättare att granska, men frågorna kan bygga på få eller skeva data och ändå ge fel.' },
    { myth: 'Den giriga algoritmen hittar alltid det bästa trädet.', reality: 'Den väljer bästa frågan just nu i varje nod. Ett annat träd med samma djup kan vara bättre totalt.' },
  ],
  discussionStops: [
    'Efter steg 3: Varför vann vind över regn, fast regn känns som den självklara frågan?',
    'Efter steg 5: Vad hände med dag 13? Borde den ha tagits bort ur datan?',
    'Efter steg 6: Var skulle ett beslutsträd för beslut om människor (t.ex. lån) kunna bli orättvist trots att det är lätt att förklara?',
  ],
  answers: [
    { question: 'Förutsägelse: Vilken fråga delar bäst i roten?', answer: ['Vind ≥ 11 m/s? (viktad Gini 0,342). Temperatur ≥ 5 °C? ger 0,444 och Väder = regn? 0,469.'] },
    {
      question: 'Vad blir den viktade Gini för Väder = regn? i roten?',
      answer: ['0,469. Ja: 5 inställda/3 genomförda → 1 − (5/8)² − (3/8)² = 30/64 ≈ 0,469. Nej: 6/10 → 1 − (6/16)² − (10/16)² = 120/256 ≈ 0,469. Viktat 8/24 · 0,469 + 16/24 · 0,469 ≈ 0,469. Vanliga felsvar: 0,497 (rotens Gini), 0,028 (minskningen), 0,938 (summan utan vikter).'],
    },
    { question: 'Varför väljer algoritmen Vind ≥ 11 m/s? framför Väder = regn?', answer: ['Lägst viktad Gini: ja-grenen är ren (5 inställda, 0 genomförda), nej-grenen 6/13 har Gini 156/361 ≈ 0,432, viktat 19/24 · 0,432 ≈ 0,342.'] },
    {
      question: 'Varför delas inte noden ”Vind ≥ 11 m/s? ja”?',
      answer: ['Den är ren (Gini 0). Algoritmens delningar i ordning: rot Vind ≥ 11; nej-grenen Temperatur ≥ 4 °C; därefter Väder = moln? och Väder = regn?; sist Temperatur ≥ 12 °C? och Temperatur ≥ −3 °C?. Totalt 6 delningar, djup 4, 7 löv.'],
    },
    {
      question: 'Förutsägelse och fråga: Vilket djup ger flest rätt på testdagarna, och varför är djup 4 sämre?',
      answer: ['Djup 2 och 3 ger 11 av 12 (92 %); djup 2 är enklast. Djup 4 ger 24 av 24 på träning men 10 av 12 på test: frågan Temperatur ≥ 12 °C? bland molniga dagar finns bara för dag 13, så testdag 3 och 4 (moln, 17 °C och 15 °C) blir felaktigt inställda.'],
    },
    { question: 'Vilka frågor ställer trädet (maxdjup 3) för den nya dagen (regn, 3 °C, vind 4 m/s)?', answer: ['Vind ≥ 11 m/s? (nej), Temperatur ≥ 4 °C? (nej), Väder = regn? (ja) → löv med 3 inställda, 0 genomförda → inställd.'] },
    { question: 'Betyder ett förklarbart beslut att det är rätt och rättvist?', answer: ['Nej. Transparens gör beslutet granskningsbart men garanterar inte att data eller frågor är bra.'] },
    {
      question: 'Öppen fråga: Förklara för tränaren hur trädet lärs in och svarar, och varför det inte ska vara så djupt som möjligt.',
      answer: [
        'Exempelresonemang: ”Trädet är en rad ja/nej-frågor som datorn har hittat själv i era 24 anteckningar. För varje fråga provar den alla möjligheter och väljer den som delar dagarna i så rena grupper som möjligt – först om det blåser minst 11 m/s, för alla sådana dagar blev inställda. För en ny dag följer man frågorna tills man kommer till ett löv, och lövet säger vad som oftast hände. Om man låter trädet växa tills varje träningsdag blir rätt lär det sig också undantag, som dagen då du var sjuk. Då gissar det fel på varma molniga dagar. Ett grundare träd, med djup 2, klarade 11 av 12 nya dagar.”',
      ],
    },
  ],
});
