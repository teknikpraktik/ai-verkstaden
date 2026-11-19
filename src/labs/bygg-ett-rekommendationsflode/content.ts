import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Appar för video, musik och nyheter använder [[rekommendationssystem]] för att välja vad du får se härnäst. De lär sig av vad du gör: vad du klickar på, vad du hoppar över och hur länge du stannar.',
    'Här styr du ett litet påhittat flöde med sex ämnen. Du mäter hur variationen förändras när du klickar, jämför två sätt att bygga flödet och tittar på vad systemet samlar in om dig.',
    { type: 'note', kind: 'simulering', text: 'Flödet är en förenklad simulering i webbläsaren med påhittade inlägg. Inget du klickar på skickas någonstans; det sparas bara i den här webbläsaren.' },
  ],
  sections: [
    {
      heading: 'Så fungerar det simulerade flödet',
      blocks: [
        'Systemet håller ett tal per ämne: antal klick. Varje plats på en sida slumpas fram med en chans som är proportionell mot **(1 + klick)²**. Kvadraten förstärker skillnaderna: ett ämne med 5 klick får vikten 36 medan ett ämne utan klick får vikten 1.',
        {
          type: 'table',
          caption: 'De två lägena',
          head: ['', 'Engagemangsläge', 'Variationsläge'],
          rows: [
            ['Platser som styrs av dina klick', '4 av 4', '2 av 4'],
            ['Övriga platser', '–', 'Slumpas jämnt bland ämnen som inte är ditt mest klickade'],
            ['Mål', 'Visa det du troligen klickar på', 'Visa det du troligen klickar på, men också annat'],
          ],
        },
        'Slumpen är reproducerbar: samma [[startvarde|startvärde]] ger samma sidor om man klickar likadant. Därför kan vi jämföra lägena rättvist – bara en sak ändras.',
      ],
    },
    {
      heading: 'Hur variationen mäts',
      blocks: [
        'Vi räknar **hur många olika ämnen** (1–6) som finns bland de 12 senast visade inläggen, och hur stor andel det vanligaste ämnet har. Det är ett enkelt mått: det säger inget om inläggen är bra, bara om flödet blandar ämnen.',
        'Med robot-eleven som alltid klickar på spel blir resultatet efter 15 klick: **1 ämne** i engagemangsläget (alla 12 inlägg är spel) och **5 ämnen** i variationsläget (spel står för 6 av 12). När ett flöde smalnar av på det här sättet talar man ibland om en [[filterbubbla]].',
        { type: 'note', kind: 'forenklad', text: 'Riktiga flöden använder många fler signaler och miljontals inlägg. Men grundidén – att det man klickat på förut får mer plats – är densamma.' },
      ],
    },
    {
      heading: 'Integritet och datainsamling',
      blocks: [
        'För att välja inlägg behöver simuleringen bara sex tal. Ändå loggas varje visat inlägg, varje överhoppat inlägg och hur länge det syntes. Sådana loggar är [[personuppgift|personuppgifter]] när de kan kopplas till dig.',
        'Principen om [[dataminimering]] säger att man bara ska samla in det som behövs för ändamålet. Ett flöde som vet mer om dig kan bli mer träffsäkert – men det påverkar din [[integritet]], och loggen kan användas till annat än du tror, till exempel reklam.',
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Ett mått på mångfald: Simpsons index',
      minutes: 10,
      prerequisites: 'labbens genomgång och procenträkning',
      blocks: [
        'Antal ämnen säger inte allt: 11 spel och 1 musik ger 2 ämnen, precis som 6 spel och 6 musik. Ett mått som tar hänsyn till fördelningen är chansen att två slumpvis valda inlägg handlar om **olika** ämnen.',
        { type: 'formula', text: 'mångfald = 1 − Σ (andel för ämnet)²', caption: '0 betyder att allt är samma ämne. Med sex lika stora ämnen blir värdet 1 − 6 · (1/6)² ≈ 0,83.' },
        'Räkna ut måttet för engagemangsläget (12 av 12 spel) och jämför med 6 spel och 6 andra inlägg fördelade på fyra ämnen.',
      ],
    },
  ],
  conclusion: [
    'Små regler i ett flöde får stora följder. När allt utrymme går till det du redan klickat på minskar variationen snabbt. Den som bygger systemet kan välja att ge plats åt annat – det är ett beslut, inte en naturlag.',
    'Ju mer ett system vet om dig, desto bättre kan det förutsäga vad du klickar på. Frågan är vilka uppgifter som verkligen behövs och vem som bestämmer det.',
  ],
});
