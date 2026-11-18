import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'En robot står vid **S** och ska ta sig till **M** i en labyrint. Den vet inte var målet ligger och måste prova sig fram. Men i vilken ordning ska den prova rutorna?',
    'Du jämför två klassiska sätt: [[bfs|bredden först]] som använder en [[ko|kö]], och [[dfs|djupet först]] som använder en [[stack]]. Labyrinten är en [[graf]] där varje ruta är en [[nod]] och varje möjligt steg en [[kant]].',
  ],
  sections: [
    {
      heading: 'Kö eller stack – det är hela skillnaden',
      blocks: [
        'Båda sökningarna gör samma sak i varje steg: ta ut en ruta ur listan med rutor som väntar, markera den som besökt och lägg till dess obesökta grannar i listan. Den enda skillnaden är **vilken ruta som tas ut**.',
        {
          type: 'table',
          caption: 'Skillnader mellan BFS och DFS',
          head: ['', 'Bredden först (BFS)', 'Djupet först (DFS)'],
          rows: [
            ['Lista med väntande rutor', 'Kö: först in, först ut', 'Stack: sist in, först ut'],
            ['Hur sökningen sprider sig', 'Som ringar på vattnet', 'Längs en korridor tills det tar stopp, sedan tillbaka'],
            ['Hittar kortast väg i antal steg?', 'Ja', 'Inte nödvändigtvis'],
            ['Tar hänsyn till kostnad?', 'Nej', 'Nej'],
          ],
        },
        'Listan över [[besokta-noder|besökta noder]] gör att ingen ruta undersöks två gånger. Utan den skulle sökningen kunna gå runt i en [[cykel]] för evigt.',
      ],
    },
    {
      heading: 'När ger BFS kortast väg?',
      blocks: [
        'BFS besöker alla rutor på avstånd 1 från start, sedan alla på avstånd 2, och så vidare. När målet tas ut ur kön för första gången har alla kortare vägar redan provats. Därför är vägen den kortaste – **räknat i antal steg**.',
        'Det gäller bara om varje steg räknas lika. Om stegen har olika [[kostnad]], som i leran, kan en väg med fler steg vara billigare. Då behövs en sökning som räknar kostnad, till exempel [[uniformkostnadssokning|uniformkostnadssökning]] eller [[a-stjarna|A*]] i [nästa labb](/labb/sok-med-kostnad-och-ledtrad/).',
        { type: 'note', kind: 'forenklad', text: 'Roboten ser hela kartan och provar grannarna i ordningen upp, höger, ned, vänster. En annan ordning ger andra vägar för DFS och kan ändra vilken av flera lika korta vägar BFS väljer.' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'BFS och DFS i pseudokod',
      minutes: 10,
      prerequisites: 'labbens genomgång; ingen programmering krävs',
      blocks: [
        'Så här kan sökningarna skrivas. Den enda skillnaden är raden där nästa nod tas ut.',
        {
          type: 'pseudo',
          title: 'Grafsökning med besökta noder',
          code: `väntande ← [start]
besökta ← tom mängd
så länge väntande inte är tom:
    nod ← ta ut FÖRSTA (BFS, kö) eller SENASTE (DFS, stack) ur väntande
    om nod är besökt: hoppa över
    lägg nod i besökta
    om nod är mål: klart – följ föräldrar bakåt för att få vägen
    för varje granne till nod som inte är besökt:
        kom ihåg att grannens förälder är nod
        lägg grannen i väntande
inget mål hittades → det finns ingen väg`,
        },
        'BFS:s minnesbehov kan bli stort eftersom hela ”ringen” av rutor måste ligga i kön samtidigt. DFS behöver bara minnas en gren åt gången, vilket är en anledning till att den ändå används.',
      ],
    },
  ],
  conclusion: [
    'Samma problem kan ge olika svar beroende på i vilken ordning en sökning provar möjligheterna. BFS hittar en väg med minst antal steg, DFS hittar någon väg – ibland snabbare, ibland en lång omväg.',
    'Men ”kortast” behöver inte betyda ”bäst”. När steg kostar olika måste sökningen räkna med kostnaden. Det är nästa labbs ämne.',
  ],
});
