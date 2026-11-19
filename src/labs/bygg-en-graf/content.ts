import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Många problem kan ritas som en [[graf]]: punkter ([[nod|noder]]) som binds samman av linjer ([[kant|kanter]]). Noderna kan vara orter, rum, brädlägen eller tillstånd hos en robot. Kanterna visar vilka steg som är möjliga.',
    'I den här labben bygger du en liten graf med orter i Mälardalen och ser hur en sökning ser ut på två sätt: som ett träd där samma ort kan dyka upp många gånger, och som en grafsökning som minns var den har varit.',
    { type: 'note', kind: 'pahittad', text: 'Restiderna är påhittade och orternas lägen är bara ungefärliga. Kartan är ett exempel, inte en reseplanerare.' },
  ],
  sections: [
    {
      heading: 'Start, mål och kostnad',
      blocks: [
        'Ett sökproblem i en graf har en **startnod** där sökningen börjar och en **målnod** som den ska hitta. En väg är en följd av kanter från start till mål.',
        'I en **viktad** graf har varje kant ett tal, en vikt. Vägens [[kostnad]] är summan av vikterna. I exemplet kostar Västerås → Enköping → Uppsala → Stockholm 30 + 30 + 40 = 100 minuter, medan vägen med färre steg, Västerås → Enköping → Stockholm, kostar 30 + 80 = 110. I en **oviktad** graf räknas varje kant som ett steg.',
      ],
    },
    {
      heading: 'Träd med dubbletter',
      blocks: [
        'Ett [[soktrad|sökträd]] visar alla vägar en sökning kan prova. Roten är start, och varje gren är ett steg till en granne. Samma ort kan nås på flera sätt, så den ritas flera gånger. Exemplets sökträd till djup 3 har 20 noder trots att grafen bara har 5, och Stockholm finns med 3 gånger.',
        'En [[cykel]] är en väg som leder tillbaka till en nod man redan passerat, till exempel Västerås → Enköping → Västerås. Sökträdet markerar sådana noder med ↺. Utan minne kan en sökning gå runt i en cykel hur länge som helst, och trädet blir oändligt djupt.',
      ],
    },
    {
      heading: 'Graf med besökta noder',
      blocks: [
        'En grafsökning för en lista över [[besokta-noder|besökta noder]]. När en nod redan är besökt hoppar sökningen över den. Därför undersöks varje nod högst en gång, cykler blir ofarliga och sökningen tar alltid slut i en ändlig graf.',
        {
          type: 'table',
          caption: 'Sökträd och grafsökning för samma problem',
          head: ['', 'Sökträd (utan minne)', 'Grafsökning (med besökta noder)'],
          rows: [
            ['Samma nod flera gånger?', 'Ja, en gång per väg dit', 'Nej, högst en gång'],
            ['Cykler', 'Ger oändligt långa grenar', 'Hoppas över'],
            ['Exemplet', '20 noder till djup 3', '5 besökta noder'],
          ],
        },
        'När målet inte går att nå besöker grafsökningen alla noder den kan nå. Sedan är listan med väntande noder tom, och svaret blir: det finns ingen väg.',
        { type: 'note', kind: 'forenklad', text: 'Vägarna går åt båda hållen och kostar lika mycket i båda riktningarna. Vikterna är heltal mellan 1 och 999.' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Hur stort blir sökträdet?',
      minutes: 10,
      prerequisites: 'potenser; labbens genomgång',
      blocks: [
        'Om varje nod har *b* grannar har sökträdet 1 nod på djup 0, *b* på djup 1, *b*² på djup 2 och så vidare. Totalt till djup *d*:',
        { type: 'formula', text: '1 + b + b² + … + bᵈ', caption: 'Antal noder i ett sökträd med förgreningsfaktor b till djup d' },
        'Med *b* = 3 och *d* = 10 blir det över 88 000 noder, även om grafen kanske bara har tio orter. Det är därför listan över besökta noder är så viktig: grafsökningen begränsas av antalet noder i grafen, inte av antalet vägar.',
      ],
    },
  ],
  conclusion: [
    'En graf beskriver vilka steg som är möjliga och vad de kostar. Samma graf kan ge ett enormt sökträd fullt av dubbletter och cykler, men en grafsökning som minns besökta noder undersöker varje nod bara en gång.',
    'I [nästa labb](/labb/bredden-forst-och-djupet-forst/) jämför du två sätt att välja i vilken ordning noderna ska besökas: bredden först och djupet först.',
  ],
});
