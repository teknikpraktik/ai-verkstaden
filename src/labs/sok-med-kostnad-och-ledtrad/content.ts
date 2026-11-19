import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'I [förra labben](/labb/bredden-forst-och-djupet-forst/) såg du att vägen med minst antal steg inte alltid är billigast. Nu räknar sökningarna med [[kostnad]] – och två av dem använder dessutom en ledtråd, en [[heuristik]], om hur långt det är kvar till målet.',
    'Du jämför tre sökningar på samma karta: [[uniformkostnadssokning|uniformkostnadssökning]], [[girig-sokning|girig bäst-först-sökning]] och [[a-stjarna|A*]]. Alla tre är grafsökningar med en lista över besökta noder. Skillnaden är vilken väntande ort de väljer att undersöka härnäst.',
    { type: 'note', kind: 'pahittad', text: 'Kartan, ortnamnen och avstånden är påhittade. Avstånden är i km och varje väg är minst lika lång som fågelvägen mellan sina orter.' },
  ],
  sections: [
    {
      heading: 'g, h och f',
      blocks: [
        {
          type: 'table',
          caption: 'Vad sökningarna sorterar efter',
          head: ['Sökning', 'Tar ut den ort som har lägst …', 'Betyder'],
          rows: [
            ['Uniformkostnadssökning', 'g', 'kostnaden från start hittills'],
            ['Girig bäst-först', 'h', 'uppskattad kostnad kvar till målet (här: fågelvägen)'],
            ['A*', 'f = g + h', 'uppskattad kostnad för hela vägen via orten'],
          ],
        },
        'Uniformkostnadssökningen hittar billigaste vägen (375 km) men undersöker åt alla håll – även Tallmo och Åsa som ligger bakom start. Den expanderar 8 orter.',
        'Den giriga sökningen går rakt mot målet och expanderar bara 4 orter. Men Sjövik ligger nära Lindvik fågelvägen (h = 158) medan vägen dit måste gå runt Långsjön och kostar 240. Den giriga vägen kostar 450 km, alltså 75 km mer än nödvändigt.',
        'A* väger ihop båda. Den slipper orterna bakom start eftersom deras f blir stort, och den märker att vägen via Sjövik blir dyr (f = 450) innan den tar ut Lindvik. A* hittar billigaste vägen och expanderar 6 orter.',
      ],
    },
    {
      heading: 'När hittar A* en billigaste väg?',
      blocks: [
        'Det beror både på ledtråden och på hur A* är programmerad. Labbens A* tar ut den väntande orten med lägst f, kontrollerar målet först när orten tas ut, uppdaterar en väntande ort om den hittar en billigare väg dit – men **öppnar aldrig en redan besökt ort igen**.',
        'För den implementationen gäller: om alla vägar har **positiv kostnad** och h är **[[konsistent-heuristik|konsistent]]** hittar A* alltid en billigaste väg. Konsistent betyder att h(mål) = 0 och att h(n) ≤ kostnad(n, m) + h(m) för varje väg mellan två orter n och m – ledtråden får aldrig sjunka mer än vad steget kostar.',
        {
          type: 'list',
          items: [
            'Fågelvägen är konsistent på en karta, eftersom ingen väg är kortare än fågelvägen.',
            'h = 0 är konsistent. Då blir A* precis samma sak som uniformkostnadssökning.',
            'En h som överskattar (till exempel 3 × fågelvägen) kan ge en dyrare väg. På kartan ger den 450 km.',
            'En h som aldrig överskattar (tillåten) men inte är konsistent räcker inte för just den här implementationen. Se scenariot ”Lurig ledtråd” i experimentläget och fördjupningen nedan.',
          ],
        },
        { type: 'note', kind: 'forenklad', text: 'Vägarna går åt båda hållen och kostar lika mycket i båda riktningarna. Vid lika prioritet tas den ort ut som lades till först.' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Tillåten räcker inte alltid – ett motexempel',
      minutes: 15,
      prerequisites: 'labbens genomgång; olikheter',
      blocks: [
        'En heuristik är *tillåten* om den aldrig överskattar den verkliga kostnaden kvar. I många läroböcker står att A* hittar billigaste vägen med en tillåten heuristik. Det stämmer för trädsökning och för grafsökning som öppnar besökta noder igen när en billigare väg hittas. Labbens A* gör inte det.',
        'I scenariot ”Lurig ledtråd” går vägarna Alby–Borg (4), Alby–Dala (1), Dala–Borg (1) och Borg–Viken (5). Billigaste vägen är Alby → Dala → Borg → Viken med kostnad 7. Ledtråden är h(Alby) = 0, h(Borg) = 0, h(Dala) = 6 och h(Viken) = 0. Den överskattar aldrig (från Dala kostar det 6 kvar), men den är inte konsistent: h(Dala) = 6 är större än kostnad(Dala, Borg) + h(Borg) = 1.',
        {
          type: 'pseudo',
          title: 'Vad labbens A* gör',
          code: `expandera Alby:   Borg (f = 4 + 0 = 4), Dala (f = 1 + 6 = 7)
expandera Borg:   Borg är nu besökt med g = 4
                  Viken (f = 9 + 0 = 9)
expandera Dala:   billigare väg till Borg (g = 2) – men Borg är besökt
                  och öppnas inte igen
expandera Viken:  klart, kostnad 9  (billigaste är 7)`,
        },
        'Med en konsistent heuristik kan det inte hända: då är g för en ort redan den billigaste möjliga när orten tas ut första gången.',
      ],
    },
    {
      heading: 'A* i pseudokod',
      minutes: 10,
      prerequisites: 'labbens genomgång; ingen programmering krävs',
      blocks: [
        {
          type: 'pseudo',
          title: 'A* som grafsökning',
          code: `gräns ← {start med g = 0, f = h(start)}
besökta ← tom mängd
så länge gränsen inte är tom:
    nod ← ta ut noden med lägst f ur gränsen
    lägg nod i besökta
    om nod är mål: klart – följ föräldrar bakåt
    för varje väg från nod till granne med kostnad c:
        om granne är besökt: hoppa över
        g_ny ← g(nod) + c
        om granne inte finns i gränsen eller g_ny < dess g:
            sätt g(granne) ← g_ny, f(granne) ← g_ny + h(granne)
            lägg granne i gränsen (eller uppdatera den)
inget mål hittades → det finns ingen väg`,
        },
        'Byt *lägst f* mot *lägst g* så får du uniformkostnadssökning, och mot *lägst h* så får du girig bäst-först (som inte uppdaterar g).',
      ],
    },
  ],
  conclusion: [
    'Kostnaden g gör att sökningen hittar billigaste vägen. Ledtråden h gör att den slipper undersöka åt fel håll. A* använder båda och hittar billigaste vägen med färre expanderade orter – så länge ledtråden är konsistent.',
    'En girig sökning som bara litar på ledtråden kan vara snabb men lurad: en ort kan ligga nära fågelvägen och ändå vara dyr att ta sig från.',
  ],
});
