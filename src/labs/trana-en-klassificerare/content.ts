import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Hur kan en dator lära sig skilja äpplen från päron utan att någon skriver regler som ”päron är högre än de är breda”? Ett sätt är att låta den titta på exempel som redan är sorterade och fråga: *vilka kända frukter liknar den nya mest?*',
    'Det är idén bakom [[knn|k-närmaste grannar]], en enkel metod för [[klassificering]]. Varje frukt är en [[observation]] med två [[egenskap|egenskaper]] (bredd och höjd) och en [[etikett]] (äpple eller päron). De sorterade frukterna är [[traningsdata|träningsdata]].',
    { type: 'note', kind: 'syntetisk', text: 'Frukterna är påhittade och mätvärdena är valda för att visa idéerna tydligt. Riktiga frukter skulle överlappa mer.' },
  ],
  sections: [
    {
      heading: 'Så röstar grannarna',
      blocks: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Mät avståndet från den nya frukten ★ till varje frukt i lådan.',
            'Plocka ut de **k** frukter som ligger närmast.',
            'Låt dem rösta: den klass som får flest röster blir svaret.',
          ],
        },
        'Talet k är en [[hyperparameter]] – något du väljer innan modellen används, inte något den räknar ut själv. Om du gör samma sak för varje plats i diagrammet får du en karta över vad modellen svarar. Linjen där svaret byter klass kallas [[beslutsgrans|klassificeringsgränsen]].',
        {
          type: 'table',
          caption: 'Regler som labben använder',
          head: ['Situation', 'Regel'],
          rows: [
            ['Lika många röster (t.ex. k = 2)', 'Klassen hos den närmaste grannen vinner.'],
            ['Två frukter exakt lika långt bort', 'Frukten med lägst nummer (som lades in först) räknas som närmast.'],
            ['k är större än antalet frukter', 'Alla frukter röstar.'],
            ['Inga frukter alls', 'Modellen kan inte svara.'],
          ],
        },
      ],
    },
    {
      heading: 'Litet eller stort k?',
      blocks: [
        'Med **k = 1** följer gränsen varje enskild frukt. Det betyder att en enda avvikande eller felsorterad frukt – som punkt 8 – kan skapa en egen ”ö” där allt blir äpple. Med **k = 3** röstas punkt 8 ned av sina päron-grannar och ön försvinner.',
        'Med **k = 14** röstar alla frukter varje gång. Eftersom det finns 8 äpplen och 6 päron blir allt äpple – modellen har slutat titta på var frukten ligger.',
        'Ett lagom k ligger någonstans mittemellan. Hur man väljer det på ett ärligt sätt, utan att lura sig själv, är ämnet för [labb 12](/labb/trana-valj-och-testa/).',
        { type: 'note', kind: 'forenklad', text: 'Bredd och höjd mäts i samma enhet, så avstånden går att jämföra direkt. Om egenskaperna hade haft olika enheter (till exempel gram och centimeter) hade man behövt skala om dem först.' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Avstånd och röstning i formler',
      minutes: 10,
      prerequisites: 'Pythagoras sats; labbens genomgång',
      blocks: [
        'Avståndet mellan två frukter räknas med Pythagoras sats, som om du drog ett snöre mellan punkterna i diagrammet:',
        { type: 'formula', text: 'avstånd = √((bredd₁ − bredd₂)² + (höjd₁ − höjd₂)²)', caption: 'Euklidiskt avstånd i två dimensioner' },
        'Exempel: ★ ligger på (6,3; 8,8) och punkt 8 på (6,2; 9,1). Avståndet blir √(0,1² + 0,3²) = √0,10 ≈ 0,32 cm.',
        {
          type: 'pseudo',
          title: 'k-närmaste grannar',
          code: `för varje frukt f i lådan:
    räkna avståndet från ★ till f
sortera frukterna efter avstånd (lika avstånd: lägst nummer först)
grannar ← de k första
räkna rösterna för varje klass bland grannarna
om rösterna är lika: svara med klassen hos grannar[1]
annars: svara med klassen som har flest röster`,
        },
        'Lägg märke till att k-NN egentligen inte ”tränar” något i förväg – den sparar bara exemplen och gör allt arbete när en ny frukt kommer. Med miljontals exempel blir det långsamt, och då används andra metoder.',
      ],
    },
  ],
  conclusion: [
    'En klassificerare som k-NN lär sig av sorterade exempel. Svaret beror både på exemplen och på valet av k: litet k följer varje detalj (även fel), stort k sväljer detaljerna.',
    'Att modellen ger ett säkert svar betyder inte att svaret är rätt. Punkt 8 visar hur ett enda ovanligt eller felmärkt exempel kan ändra svaret för frukter i närheten.',
  ],
});
