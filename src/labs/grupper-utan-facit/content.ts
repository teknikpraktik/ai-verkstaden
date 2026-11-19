import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'I de förra labbarna hade varje exempel ett facit: äpple eller päron, sjuk eller frisk. Ofta finns inget facit alls. Då kan man ändå fråga: finns det grupper av exempel som liknar varandra? Det kallas [[klustring]] och är en form av [[oovervakad-inlarning|oövervakad inlärning]].',
    'Du stegar algoritmen [[k-means]] på påhittade fritidsvanor och undersöker hur resultatet beror på antalet grupper k och på [[startvarde|startvärdet]].',
    { type: 'note', kind: 'syntetisk', text: 'Eleverna och deras svar är påhittade. Inga verkliga personer finns med.' },
  ],
  sections: [
    {
      heading: 'Två steg som upprepas',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            '**Start:** välj k punkter slumpvis som startcentrum. Vilka det blir bestäms av startvärdet.',
            '**Tilldelning:** varje punkt går till det närmaste centrumet. Vid lika avstånd vinner centrumet med lägst nummer.',
            '**Uppdatering:** varje centrum flyttas till medelpunkten av sina punkter. Ett centrum utan punkter (tomt kluster) står kvar.',
            'Upprepa 2 och 3 tills ingen punkt byter grupp.',
          ],
        },
        'Varje varv kan bara minska (eller behålla) summan av kvadratavstånden mellan punkterna och deras centrum. Därför tar algoritmen alltid slut. Men den hittar inte alltid den bästa indelningen – bara en som inte blir bättre av fler varv.',
      ],
    },
    {
      heading: 'Startvärde och reproducerbarhet',
      blocks: [
        'Med k = 3 ger startvärde 1–7 samma tre grupper (summa 49,3). Startvärde 8 placerar två startcentrum bland idrottarna, och algoritmen fastnar i en sämre lösning (summa 143,4). Därför kör man ofta k-means flera gånger med olika startvärden och behåller den bästa.',
        'Eftersom ”slumpen” styrs av startvärdet blir resultatet exakt detsamma varje gång man använder samma startvärde. Det gör det möjligt för andra att kontrollera resultatet.',
      ],
    },
    {
      heading: 'Grupper måste tolkas',
      blocks: [
        'Algoritmen säger bara vilka punkter som ligger nära varandra. Den vet inte att en grupp ”tränar mycket” eller att en annan ”läser mycket” – det är vi som tolkar. Den väljer inte heller k. Summan av kvadratavstånd blir alltid mindre med fler grupper (49,3 för k = 3 men 24,4 för k = 5), så den kan inte ensam avgöra vilket k som är rätt.',
        { type: 'note', kind: 'varning', text: 'Grupper från klustring kan se objektiva ut men bygger på val: vilka egenskaper som mäts, hur de skalas och vilket k som används. Att dela in människor i grupper kan få följder – var försiktig med vad grupperna används till.' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'k-means i pseudokod',
      minutes: 10,
      prerequisites: 'medelvärde och avstånd i planet; labbens genomgång',
      blocks: [
        {
          type: 'pseudo',
          title: 'k-means',
          code: `centrum ← k slumpvalda punkter (styrs av startvärdet)
upprepa:
    för varje punkt p:
        grupp[p] ← numret på närmaste centrum
    om ingen grupp ändrades: sluta
    för varje centrum c:
        om c har punkter: c ← medelpunkten av punkterna i gruppen
        annars: låt c stå kvar (tomt kluster)`,
        },
        { type: 'formula', text: 'summa = Σ (avstånd från punkt till sitt centrum)²', caption: 'Det tal som k-means försöker göra litet.' },
        'Ett sätt att välja k är att rita summan mot k och leta efter en ”armbåge” där kurvan slutar sjunka snabbt. För klassen sjunker summan kraftigt från k = 2 (153,7) till k = 3 (49,3) men därefter långsamt.',
      ],
    },
  ],
  conclusion: [
    'k-means hittar grupper utan facit genom att växla mellan tilldelning och uppdatering. Resultatet beror på k och på startvärdet, och samma startvärde ger samma resultat.',
    'Grupperna är inte ”sanningen” om datan. De är ett förslag som människor måste tolka och pröva.',
  ],
});
