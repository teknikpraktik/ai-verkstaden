import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Mobilkameror hittar ansikten, appar läser av text i bilder och självkörande fordon letar efter fotgängare. Allt det är [[datorseende]]: att få en dator att tolka bilder. Men vad ”ser” egentligen datorn?',
    'I den här labben bygger du [[objektigenkanning|objektigenkänning]] i liten skala. En modell ska först avgöra **vad** en liten bild föreställer – äpple, kopp eller nyckel – och sedan **var** föremålen finns i en större bild.',
    { type: 'note', kind: 'syntetisk', text: 'Bilderna är påhittade och ritade för hand, 6 × 6 pixlar per föremål. Bruset slumpas med ett fast startvärde, så alla i klassen får samma bild.' },
    { type: 'note', kind: 'forenklad', text: 'Modellen jämför med en enda mall per klass. Riktiga system lär sig av miljontals bilder och är mycket bättre på att klara flyttade, vridna och delvis dolda föremål.' },
  ],
  sections: [
    {
      heading: 'En bild är bara tal',
      blocks: [
        'En digital bild består av [[pixel|pixlar]] i ett rutnät. I labben är varje pixel 1 (svart) eller 0 (vit), så koppen är 36 tal, varav 17 är ettor. I en färgbild har varje pixel i stället tre tal för rött, grönt och blått, och en mobilbild har miljontals pixlar.',
        'Datorn har alltså ingen aning om att det är en kopp. Den har bara talen – allt den ”vet” måste komma från hur talen jämförs med något annat.',
      ],
    },
    {
      heading: 'Känna igen: jämför med mallar',
      blocks: [
        'Labbens modell använder [[mallmatchning]]: det finns en mall per klass, och bilden får den klass vars mall liknar mest. Det är samma idé som [[knn|k-närmaste grannar]] med k = 1 i [labb 10](/labb/trana-en-klassificerare/), fast avståndet räknas pixel för pixel.',
        { type: 'formula', text: 'likhet = (svarta pixlar i både bild och mall) ÷ (svarta pixlar i bild eller mall)', caption: 'Ger 100 % om bilderna är lika och 0 % om de inte har någon svart pixel gemensamt.' },
        'Exempel: koppen och äpplemallen har 15 svarta pixlar gemensamt, och 29 pixlar är svarta i någon av dem. Likheten blir 15 ÷ 29 ≈ 52 %. Koppen mot sin egen mall ger 100 %, så modellen svarar kopp.',
        {
          type: 'table',
          caption: 'Samma kopp med en ändring i taget',
          head: ['Bild', 'Modellens svar', 'Likhet för kopp'],
          rows: [
            ['Som mallen', 'kopp 100 %', '100 %'],
            ['Flyttad 2 steg åt höger', 'äpple 34 % (fel)', '21 %'],
            ['Vriden ett kvarts varv', 'äpple 38 % (fel)', '31 %'],
            ['Högra delen skymd', 'kopp 41 %', '41 %'],
            ['Omvänd belysning', 'äpple 35 % (fel)', '0 %'],
            ['Helt svart bild', 'äpple 75 % (fel)', '47 %'],
            ['Helt vit bild', 'inget svar', '0 %'],
          ],
        },
        'Modellen måste alltid välja den mall som liknar mest – även när bilden är helt svart. Då vinner äpplet, eftersom det har flest svarta pixlar (27). En helt vit bild har inga svarta pixlar alls, och då svarar modellen inte.',
      ],
    },
    {
      heading: 'Hitta: ett glidande fönster',
      blocks: [
        'För att hitta **var** föremålen finns används ett [[glidande-fonster|glidande fönster]]. Ett fönster på 6 × 6 pixlar flyttas ett steg i taget över bilden på 28 × 8 pixlar: 23 lägen i sidled och 3 i höjdled, alltså 69 lägen. I varje läge jämförs innehållet med de tre mallarna.',
        {
          type: 'list',
          ordered: true,
          items: [
            'Om den bästa likheten i ett fönster är minst [[troskel|tröskeln]] blir fönstret ett fynd.',
            'Om två fynd överlappar behålls det med högst likhet, så att samma föremål inte räknas flera gånger.',
            'Ett fynd är rätt om klassen stämmer och rutan hamnar högst en pixel fel.',
          ],
        },
        {
          type: 'table',
          caption: 'Resultat i den stora bilden (3 föremål med mall, plus en boll som inte har någon mall)',
          head: ['Brus', 'Tröskel', 'Rätt', 'Felaktiga fynd', 'Missade'],
          rows: [
            ['0 %', '70 %', '3', '0', '0'],
            ['0 %', '40 %', '3', '1 (bollen tas för äpple, 44 %)', '0'],
            ['10 %', '70 %', '3', '0', '0'],
            ['20 %', '70 %', '1', '0', '2 (nyckel, kopp)'],
            ['20 %', '50 %', '2', '2 (nyckel och boll tas för äpple)', '1 (nyckel)'],
          ],
        },
        'Tröskeln är en avvägning, precis som i [labb 4](/labb/vem-far-fel-svar/): låg tröskel ger fler [[falskt-positiv|falskt positiva]] fynd (falska larm), hög tröskel ger fler [[falskt-negativ|missade]] föremål. Små föremål som nyckeln drabbas först av brus, eftersom några få fel pixlar är en stor del av dem.',
      ],
    },
    {
      heading: 'Människor, mallar och riktiga system',
      blocks: [
        'Du känner igen en kopp även när den är flyttad, vriden, halvt dold eller fotograferad i motljus. Du har sett tusentals koppar och vet vilka delar en kopp har. Det kallas att kunna [[generalisering|generalisera]].',
        'Riktiga system för bildigenkänning använder oftast [[neuralt-natverk|neurala nätverk]], till exempel [[faltningsnatverk]]. De lär sig själva vilka mönster som är viktiga – kanter, hörn, former – från mycket stora mängder märkta bilder ([[traningsdata|träningsdata]]), och de letar efter mönstren överallt i bilden. Skillnaden mot labben är framför allt storleken: miljontals bilder i stället för tre mallar, och miljontals [[parameter|parametrar]] i stället för 36 pixlar.',
        'Även stora system gör fel, särskilt på bilder som skiljer sig från dem de tränats på: ovanlig belysning, ovanliga vinklar eller föremål som liknar något annat. Därför måste de testas på bilder från den miljö där de ska användas.',
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Från mallar till faltningsnätverk',
      minutes: 10,
      prerequisites: 'Labbens genomgång',
      blocks: [
        'En mall som är lika stor som hela föremålet blir lätt fel om föremålet flyttas. Ett [[faltningsnatverk]] använder i stället många **små** mallar, till exempel 3 × 3 pixlar, som glider över bilden precis som labbens fönster. Varje liten mall reagerar på ett enkelt mönster, till exempel en lodrät kant.',
        'Resultaten från de små mallarna blir en ny ”bild” som nästa lager i nätverket letar mönster i. Lager för lager kan nätverket känna igen kanter, sedan former som ett handtag och till sist hela föremål.',
        {
          type: 'pseudo',
          title: 'Labbens modell jämfört med ett faltningsnätverk',
          code: `labbens modell:
    mallar ← ritade för hand, en per klass, 6 × 6
    för varje fönsterläge: jämför med varje mall

faltningsnätverk:
    små mallar ← lärs in från stora mängder märkta bilder
    lager 1: hitta kanter överallt i bilden
    lager 2: kombinera kanter till former
    sista lagret: avgör vilken klass bilden har`,
        },
        'Den stora skillnaden är att mallarna i ett nätverk **lärs in** från data i stället för att ritas av en människa. Därför behövs mycket träningsdata – och om datan saknar till exempel bilder i mörker, blir nätverket dåligt på mörka bilder.',
      ],
    },
  ],
  conclusion: [
    'För datorn är en bild bara tal. Labbens modell känner igen föremål genom att jämföra talen med en mall per klass, och hittar dem genom att låta ett fönster glida över bilden.',
    'Metoden fungerar när bilden ser ut precis som mallen, men går fel när föremålet flyttas, vrids eller belyses annorlunda. Tröskeln avgör balansen mellan falska larm och missade föremål. Riktiga system löser mycket av detta genom att lära sig från enorma mängder bilder – men de kan också göra fel på bilder som skiljer sig från träningsdatan.',
  ],
});
