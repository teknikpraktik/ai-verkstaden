import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'En [[robot]] är en maskin som känner av världen, fattar beslut och påverkar världen – om och om igen, många gånger per sekund. Här styr du en städrobot i ett klassrum. Den har en enda [[sensor]] som mäter avståndet rakt fram, ett [[styrprogram]] med en regel och en motor som kör eller svänger.',
    'Du förutsäger vad som händer, stegar roboten och jämför mätvärde, beslut och konsekvens i varje steg. Sedan provar du hinder, en sensor med kort sikt och [[sensorbrus]].',
  ],
  sections: [
    {
      heading: 'Kedjan: sensor → styrprogram → motor',
      blocks: [
        'Alla robotar, från robotdammsugare till självkörande bilar, arbetar i samma slinga: **känn av – bestäm – handla**. Sedan börjar slingan om, och världen har ändrats lite.',
        {
          type: 'table',
          caption: 'Kedjans tre delar i labbens städrobot',
          head: ['Del', 'Uppgift', 'I labben'],
          rows: [
            ['Sensor', 'Mäter något i omgivningen', 'Antal fria rutor rakt fram, upp till sikten'],
            ['Styrprogram', 'Bestämmer vad som ska göras utifrån mätvärdet', 'OM mätvärde < gräns SÅ sväng, ANNARS kör framåt'],
            ['Motor ([[stalldon|ställdon]])', 'Påverkar omgivningen', 'Kör 1 eller 2 rutor, eller svänger'],
          ],
        },
        'Roboten vet ingenting om rummet utöver mätvärdet. Om mätvärdet är fel blir beslutet fel – även om programmet och motorn fungerar perfekt.',
      ],
    },
    {
      heading: 'Tre saker som kan gå fel',
      blocks: [
        {
          type: 'list',
          items: [
            '**Fel regel.** Med gränsen 0 blir villkoret ”mätvärde < 0” aldrig sant. Sensorn ser väskan, men roboten kör ändå in i den – 26 gånger på 30 steg.',
            '**Begränsad sikt.** En sensor kan bara rapportera det den ser. Om roboten kör 2 rutor per steg men sensorn bara ser 1 ruta, hinner den inte reagera: 4 krockar trots gränsen 2.',
            '**Brus.** Verkliga sensorer mäter aldrig exakt. Med lågt brus blir 7 av 30 mätvärden fel. Tre gånger säger sensorn ”1 ruta fri” när roboten står vid väggen, och roboten krockar.',
          ],
        },
        'En [[sakerhetsmarginal]] – att reagera redan när mätvärdet är under 2 – tar bort krockarna i labben. Men roboten svänger då tidigare och städar 19 rutor i stället för 21. Säkerhet och effektivitet måste vägas mot varandra.',
        { type: 'note', kind: 'forenklad', text: 'Rummet är ett rutnät, roboten rör sig en eller två hela rutor åt gången och sensorn mäter i hela rutor. En verklig robot mäter avstånd i centimeter flera gånger per sekund och bromsar mjukt.' },
        { type: 'note', kind: 'simulering', text: 'Bruset kommer från en slumpföljd med ett startvärde. Samma startvärde ger samma brus, så att du kan jämföra två regler under exakt samma förhållanden. I experimentläget kan du byta startvärde.' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Styrslingan och bruset i pseudokod',
      minutes: 10,
      prerequisites: 'labbens genomgång; ingen programmering krävs',
      blocks: [
        'Så här ser simuleringen ut i varje steg. Bruset är ett normalfördelat tal med medelvärde 0 som avrundas till hela rutor.',
        {
          type: 'pseudo',
          title: 'Ett steg för städroboten',
          code: `avstånd ← antal fria rutor rakt fram          (det verkliga värdet)
brus ← avrunda(normalfördelat tal · brusnivå)  (lågt brus: 0,6)
mätvärde ← max(0, avstånd + brus)
om mätvärde ≥ sikt: mätvärde ← "inget hinder"

om mätvärde inte är "inget hinder" och mätvärde < gräns:
    gör handlingen (sväng höger, sväng vänster eller stanna)
annars:
    kör framåt fart rutor – stanna och räkna en krock om ett hinder är i vägen`,
        },
        { type: 'formula', text: 'P(fel mätvärde) ≈ P(|z · 0,6| ≥ 0,5) = P(|z| ≥ 0,83) ≈ 0,40', caption: 'Ungefär 40 % av mätningarna blir fel med lågt brus om sensorn ser hindret. I labben blir 7 av 30 fel, eftersom många mätningar är ”inget hinder” där små fel inte syns.' },
        'Verkliga robotar minskar bruset genom att mäta många gånger och ta medelvärdet, eller genom att kombinera flera sensorer.',
      ],
    },
  ],
  conclusion: [
    'En robot är aldrig smartare än kedjan sensor → styrprogram → motor. Ett fel i vilken del som helst – fel regel, för kort sikt eller brus – kan ge en krock, och felet syns först när man följer mätvärde, beslut och konsekvens steg för steg.',
    'I nästa labb har roboten en karta. Vad händer när kartan och verkligheten inte stämmer?',
  ],
});
