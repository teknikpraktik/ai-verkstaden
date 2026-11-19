import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'En robot som ska ta sig från A till B planerar ofta vägen på en [[robotkarta|karta]], till exempel med [[a-stjarna|A*]]. Men kartan är bara robotens bild av världen. Pallar flyttas, dörrar stängs och hyllor byggs om.',
    'Här ser du robotens karta och verkligheten sida vid sida. Roboten kör ett steg i taget, tittar med sin [[sensor]] och [[omplanering|planerar om]] när den upptäcker att kartan inte stämmer.',
  ],
  sections: [
    {
      heading: 'Känn av – uppdatera – planera om',
      blocks: [
        'I varje steg gör roboten samma sak:',
        {
          type: 'list',
          ordered: true,
          items: [
            '**Känn av.** Sensorn tittar rakt fram, bakåt och åt sidorna, så långt räckvidden räcker. Den ser inte genom väggar.',
            '**Jämför med kartan.** Om sensorn ser ett hinder som inte finns på kartan – eller fri väg där kartan säger hinder – uppdateras kartan.',
            '**Stanna och planera om.** Om kartan ändrades räknar A* fram en ny väg från där roboten står just nu. Om den gamla vägen var blockerad stannar roboten först.',
            '**Kör ett steg** längs den aktuella planen.',
          ],
        },
        'A* hittar alltid den kortaste vägen **på kartan**. Om kartan är fel kan vägen ändå bli lång i verkligheten: i lagret planerade roboten 5 steg men körde 15, eftersom den upptäckte pallen först när den stod i gången. Med rätt karta hade det räckt med 13.',
      ],
    },
    {
      heading: 'Karta och verklighet – fyra exempel',
      blocks: [
        {
          type: 'table',
          caption: 'Labbens scenarier',
          head: ['Scenario', 'Kartan säger', 'Verkligheten', 'Följd'],
          rows: [
            ['Pallen i gången (lager)', 'Mittgången är fri', 'En lastpall står i F5', 'Stopp i F3, ny väg: 15 steg i stället för 5'],
            ['Den stängda dörren (skola)', 'Dörren är öppen', 'Dörren är stängd', 'Stopp i F2, omväg: 23 steg i stället för 11'],
            ['Dörren som öppnats (skola)', 'Dörren är stängd', 'Dörren är öppen', 'Ser öppningen i förbifarten: 11 steg i stället för 23'],
            ['Ingen väg fram (skola)', 'Passagen vid L3 är fri', 'En städvagn blockerar', 'Ingen väg – stannar i L2 och larmar'],
          ],
        },
        'Sensorns räckvidd spelar roll: ju tidigare roboten ser hindret, desto mindre behöver den köra i onödan. I lagret ger räckvidd 1, 2 och 3 rutor resor på 17, 15 och 13 steg.',
        'När ingen väg finns är det säkraste att stanna och be en människa om hjälp. Roboten vet inte vad hindret är och ska inte gissa. Det är ett exempel på [[manniska-i-loopen|mänsklig tillsyn]].',
        { type: 'note', kind: 'forenklad', text: 'Roboten rör sig i ett rutnät, en ruta per steg, och sensorn ser i fyra raka riktningar. Verkliga robotar mäter i alla riktningar, är osäkra på var de själva är och planerar ofta om flera gånger per sekund.' },
        { type: 'note', kind: 'pahittad', text: 'Lagret och skolan är påhittade miljöer.' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Omplanering i pseudokod',
      minutes: 10,
      prerequisites: 'labb 8 (A*); ingen programmering krävs',
      blocks: [
        {
          type: 'pseudo',
          title: 'Kör mot målet med en karta som kan vara fel',
          code: `karta ← den sparade kartan
plan ← A*(karta, position, mål)
om plan saknas: stanna – "kartan visar ingen väg"
så länge position ≠ mål:
    sett ← det sensorn ser härifrån
    om sett skiljer sig från karta:
        uppdatera karta med sett
        plan ← A*(karta, position, mål)
        om plan saknas: stanna och larma en människa
    position ← nästa ruta i plan`,
        },
        'Att köra hela A* på nytt varje gång är enkelt men kan bli långsamt på stora kartor. Verkliga robotar använder ofta algoritmer som D* Lite, som återanvänder det mesta av den förra sökningen och bara räknar om det som påverkas av ändringen.',
      ],
    },
  ],
  conclusion: [
    'En robots karta är alltid en förenkling, och den kan vara fel. Därför måste roboten hela tiden jämföra kartan med vad sensorerna ser, och planera om när de inte stämmer.',
    'En bra robot vet också när den inte kan lösa uppgiften själv: när ingen väg finns stannar den och ber om hjälp. Hur mycket en robot ska få göra på egen hand är ämnet i nästa labb.',
  ],
});
