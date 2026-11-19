import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Skräppostfilter, sortering av kundmejl och flaggning av inlägg bygger ofta på samma idé: räkna vilka ord som brukar finnas i olika sorters texter. I den här labben låter du en liten modell sortera meddelanden från en påhittad skola i **Viktigt** och **Kan vänta**.',
    'Modellen är en [[bag-of-words]]-[[klassificering|klassificerare]] av typen [[naiv-bayes|naiv Bayes]]. Du ser exakt vilka ord som avgör, och du prövar var den går sönder: negation, nya ord och meddelanden som den inte har tränats på.',
  ],
  sections: [
    {
      heading: 'Så räknar modellen',
      blocks: [
        'Under träningen räknar modellen hur många gånger varje ord förekommer i Viktigt-exemplen och i Kan vänta-exemplen. När ett nytt meddelande kommer får varje ord ett **bidrag**: positivt om ordet är vanligare bland de viktiga exemplen, negativt om det är vanligare bland de som kan vänta, och nära 0 om det är lika vanligt i båda.',
        'Bidragen läggs ihop till en poäng. Poäng över 0 betyder Viktigt, under 0 Kan vänta. I startmeddelandet ”Lektionen är inställd i morgon” ger ”morgon” +1,09, ”lektionen”, ”är” och ”inställd” +0,68 var och ”i” +0,40. Summan blir +3,54.',
        { type: 'note', kind: 'syntetisk', text: 'Alla 22 meddelanden (16 för träning och 6 reserverade) är påhittade för labben, och sorteringen i Viktigt och Kan vänta är gjord av labbens författare. En riktig modell behöver tusentals exempel.' },
      ],
    },
    {
      heading: 'Var bag-of-words går sönder',
      blocks: [
        {
          type: 'list',
          items: [
            '**Negation och ordning:** ”inte” finns en gång i varje klass, så bidraget är −0,01. Modellen ser inte att ”inte” hör till ”inställd”. Att kasta om orden ger exakt samma poäng.',
            '**Okända ord:** ord som inte finns i [[traningsdata|träningsdata]] hoppas över. Även en annan böjningsform (”inställt” i stället för ”inställd”) är okänd. Om inget ord är känt blir det oavgjort.',
            '**Tomt meddelande:** då finns bara förhandsläget – hur vanliga klasserna är i träningsdata. Här är de lika vanliga (8 och 8), så det blir oavgjort.',
          ],
        },
      ],
    },
    {
      heading: 'Varför reserverade exempel?',
      blocks: [
        'Att modellen sorterar sina egna träningsexempel rätt säger lite. Därför hålls sex meddelanden utanför träningen, som [[testdata]]. Där gör modellen 2 fel av 6: ”Skolan stängd på grund av snöstorm” blir Kan vänta eftersom det enda kända ordet är ”på”, och ”Det blir inget prov i morgon” blir Viktigt på grund av ”i morgon”. Det ena är ett [[falskt-negativ|falskt negativt]] fel och det andra ett [[falskt-positiv|falskt positivt]] – se [[forvaxlingsmatris|förväxlingsmatrisen]].',
        'Vilket fel är värst? Att missa att skolan är stängd är troligen allvarligare än ett onödigt larm. Sådana bedömningar avgör hur en modell bör justeras.',
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Matematiken bakom naiv Bayes',
      minutes: 15,
      prerequisites: 'logaritmer (Matematik 2) är bra men inte nödvändigt',
      blocks: [
        'Modellen uppskattar sannolikheten att ett ord förekommer i en klass. Med [[utjamning|Laplace-utjämning]] läggs 1 till varje antal så att inget ord får sannolikheten 0:',
        { type: 'formula', text: 'P(ord | klass) = (antal gånger ordet finns i klassen + 1) / (antal ord i klassen + antal ord i ordförrådet)', caption: 'Här: 46 ord i Viktigt, 45 i Kan vänta och 65 olika ord totalt.' },
        'För ”provet”, som finns 3 gånger i Viktigt och 0 gånger i Kan vänta:',
        { type: 'formula', text: 'P(provet | viktigt) = 4 / 111   P(provet | vänta) = 1 / 110   bidrag = ln((4/111) / (1/110)) ≈ +1,38' },
        'Naiv Bayes multiplicerar sannolikheterna för alla ord. Det blir mycket små tal, så man tar logaritmen – då blir multiplikation till addition. Det är därför labben kan visa beslutet som en summa av bidrag.',
        {
          type: 'pseudo',
          title: 'Klassning',
          code: `poäng ← ln(andel Viktigt-exempel) − ln(andel Kan vänta-exempel)
för varje ord i meddelandet:
    om ordet finns i ordförrådet:
        poäng ← poäng + ln P(ord | viktigt) − ln P(ord | vänta)
om poäng > 0: Viktigt
om poäng < 0: Kan vänta
annars: oavgjort`,
        },
        'I experimentläget kan du stänga av utjämningen (α = 0). Då får ett ord som bara finns i en klass bidraget ±∞ och avgör ensamt, och ett meddelande med ett sådant ord från varje klass går inte att avgöra alls.',
      ],
    },
  ],
  conclusion: [
    'En bag-of-words-modell är enkel, snabb och lätt att granska: varje beslut är en summa av ordbidrag. Men den ser bara vilka ord som finns, inte hur de hänger ihop, och den kan bara använda ord den har sett.',
    'Därför måste en textmodell alltid testas på nya exempel, och felen måste bedömas efter vem de drabbar. I nästa labb undersöker du hur sammanhang och tvetydighet gör språk ännu svårare.',
  ],
});
