import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Kan man lära en dator att ställa rätt frågor? Ett [[beslutstrad|beslutsträd]] är en kedja av ja/nej-frågor, som ”Blåser det minst 11 m/s?”, och svaret står i trädets [[tradlov|löv]]. Frågorna skriver ingen människa – de lärs in från märkta exempel. Det är alltså [[overvakad-inlarning|övervakad inlärning]] och [[klassificering]].',
    'Obs! Det här är något annat än [[spelträd|spelträdet]] i [labb 9](/labb/tre-i-rad-mot-en-agent/). Ett spelträd visar alla möjliga drag i ett spel. Ett beslutsträd är en modell som har lärts från data.',
    { type: 'note', kind: 'syntetisk', text: 'De 24 träningsdagarna och 12 testdagarna är påhittade. Dag 13 är ett medvetet undantag: träningen ställdes in en fin dag eftersom tränaren var sjuk.' },
    { type: 'note', kind: 'forenklad', text: 'Riktiga beslutsträd tränas på mycket mer data, har ofta fler klasser och stoppregler som minsta antal exempel per löv. Principen är densamma.' },
  ],
  sections: [
    {
      heading: 'Gini-orenhet: hur blandad är en grupp?',
      blocks: [
        'För att välja fråga behöver algoritmen ett mått på hur bra en delning är. Labben använder [[gini-orenhet|Gini-orenhet]]:',
        { type: 'formula', text: 'Gini = 1 − (andel inställda)² − (andel genomförda)²', caption: '0 = alla dagar har samma utfall (ren nod). 0,5 = hälften av varje.' },
        'Roten har 11 inställda och 13 genomförda dagar: 1 − (11/24)² − (13/24)² = 286/576 ≈ 0,497.',
        'Efter en delning vägs grenarnas Gini efter hur många dagar de har. Frågan med lägst **viktad Gini** vinner.',
        {
          type: 'table',
          caption: 'Två frågor i roten, räknade för hand',
          head: ['Fråga', 'Ja-gren', 'Nej-gren', 'Viktad Gini'],
          rows: [
            ['Väder = regn?', '5 inställda, 3 genomförda (Gini 30/64 ≈ 0,469)', '6 inställda, 10 genomförda (Gini 120/256 ≈ 0,469)', '8/24 · 0,469 + 16/24 · 0,469 ≈ 0,469'],
            ['Vind ≥ 11 m/s?', '5 inställda, 0 genomförda (Gini 0)', '6 inställda, 13 genomförda (Gini 156/361 ≈ 0,432)', '5/24 · 0 + 19/24 · 0,432 ≈ 0,342'],
          ],
        },
      ],
    },
    {
      heading: 'Den giriga algoritmen',
      blocks: [
        'Algoritmen (en förenklad variant av CART) gör samma sak i varje nod: den provar alla frågor och tar den med lägst viktad Gini. Den kallas girig eftersom den aldrig planerar flera frågor framåt.',
        {
          type: 'pseudo',
          title: 'Väx ett beslutsträd',
          code: `väx(nod):
    om noden är ren, maxdjupet är nått eller ingen fråga sänker Gini:
        gör noden till ett löv som svarar majoritetsklassen
    annars:
        för varje fråga (väder = …?, temperatur ≥ …?, vind ≥ …?):
            räkna viktad Gini för ja- och nej-grenen
        välj frågan med lägst viktad Gini
        väx(ja-grenen) och väx(nej-grenen)`,
        },
        {
          type: 'list',
          items: [
            '**Lika värden:** den fråga som kommer först i ordningen väder (sol, moln, regn), temperatur, vind (lägst gräns först) vinner.',
            '**Tom gren:** en fråga som skickar alla dagar åt samma håll räknas inte. Bygger du själv en sådan gren får den ärva svaret från föräldern.',
            '**Lika många i ett löv:** svaret ärvs också från föräldern.',
          ],
        },
        'Utan maxdjup gör algoritmen 6 delningar och slutar på [[tradjup|djup]] 4 med 7 löv, alla rena.',
      ],
    },
    {
      heading: 'Djup och överanpassning',
      blocks: [
        {
          type: 'table',
          caption: 'Träffsäkerhet för varje maxdjup',
          head: ['Maxdjup', 'Löv', 'Träning (24)', 'Test (12)'],
          rows: [
            ['0', '1', '13 (54 %)', '7 (58 %)'],
            ['1', '2', '18 (75 %)', '9 (75 %)'],
            ['2', '3', '20 (83 %)', '11 (92 %)'],
            ['3', '5', '21 (88 %)', '11 (92 %)'],
            ['4', '7', '24 (100 %)', '10 (83 %)'],
          ],
        },
        'Det fullvuxna trädet får alla träningsdagar rätt, men den sista nivån finns bara för att skilja ut undantaget dag 13. Då blir två varma, molniga testdagar fel. Det är [[overanpassning|överanpassning]]. Maxdjupet är en [[hyperparameter]].',
        'Med bara 12 testdagar motsvarar en dag 8 procentenheter, så skillnaderna är osäkra. Och egentligen ska djupet väljas med valideringsdata, inte testdata – se [labb 12](/labb/trana-valj-och-testa/).',
      ],
    },
    {
      heading: 'Lätt att förklara – men inte automatiskt rätt',
      blocks: [
        'En ny dag (regn, 3 °C, vind 4 m/s) följer vägen: Vind ≥ 11 m/s? nej → Temperatur ≥ 4 °C? nej → Väder = regn? ja → löv: inställd. Varje beslut kan förklaras fråga för fråga. Det är ett exempel på [[transparens]].',
        'Men att man ser *hur* beslutet fattas säger inget om *ifall* underlaget är bra. Frågorna kan bygga på få, felaktiga eller skeva exempel. Ett träd som används för beslut om människor kan till exempel ställa frågor som indirekt missgynnar en grupp.',
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Entropi i stället för Gini',
      minutes: 10,
      prerequisites: 'logaritmer; labbens genomgång',
      blocks: [
        'Ett annat vanligt orenhetsmått är entropi: −p · log₂(p) − q · log₂(q). Den är 0 för en ren nod och 1 för hälften av varje. Gini och entropi väljer oftast samma frågor.',
        'Beslutsträd kan också användas för [[regression]]: då svarar lövet med medelvärdet av träningsexemplen, och i stället för Gini mäts spridningen (variansen). Många träd tillsammans kallas en slumpskog (random forest).',
      ],
    },
  ],
  conclusion: [
    'Ett beslutsträd lärs in genom att algoritmen girigt väljer den fråga som gör grupperna renast, nod för nod.',
    'Ett djupare träd passar alltid träningsdatan bättre, men inte nödvändigtvis nya data. Maxdjupet måste väljas med data som trädet inte tränats på.',
    'Träd är lätta att förklara, och det gör dem lättare att granska – men en förklarbar modell kan fortfarande ha fel.',
  ],
});
