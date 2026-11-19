import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben visar förstärkningsinlärning konkret: tillstånd, handling, belöning och utforskning syns i varje steg. Den dåliga belöningen ger ett tydligt exempel på att system optimerar måttet och inte avsikten – en koppling till etikkapitlet.',
  tips: [
    'Räkna den första Q-uppdateringen tillsammans på tavlan innan eleverna stegar.',
    'Låt eleverna använda ”Till nästa episod” några gånger och beskriva hur pilarna sprider sig bakåt från laddstationen.',
    'Påpeka skillnaden mellan träning (utforskning, inlärning) och prov (fryst modell). Jämför med tränings- och testdata i labb 12.',
    'I experimentläget: låt eleverna hitta en egen belöning som får roboten att ramla i trappan med flit (t.ex. trappan +5).',
  ],
  misconceptions: [
    { myth: 'Roboten förstår att den ska åka hem och ladda.', reality: 'Den maximerar bara summan av belöningar. Med +1 per steg kör den hellre in i en vägg i 40 steg.' },
    { myth: 'Utforskning är ett fel som borde tas bort.', reality: 'Utan utforskning kan agenten fastna i den första väg den hittar. Under provet stängs utforskningen av.' },
    { myth: 'Q-värdet är belöningen i rutan.', reality: 'Q-värdet är en uppskattning av den totala framtida belöningen om man gör en viss handling i en viss ruta.' },
  ],
  discussionStops: [
    'Efter första episoden: Varför tar det 34 steg när den kortaste vägen är 7?',
    'Efter provet: Varför ska modellen frysas innan provet?',
    'Efter den dåliga belöningen: Hitta verkliga exempel där ett mått blev ett mål och fick oavsiktliga följder (t.ex. klick, visningstid, poäng).',
  ],
  answers: [
    { question: 'Förutsägelse: Vad gör roboten i första episoden?', answer: ['Den irrar runt: första episoden tar 34 steg innan den råkar hamna vid laddstationen (E4). Alla Q-värden är 0 från början, så den har ingen aning om vart den ska.'] },
    { question: 'Vad blir det nya Q-värdet i första steget?', answer: ['0 + 0,5 · (−1 + 0,95 · 0 − 0) = −0,5. Vanliga fel: −1 (bara belöningen) och 0,5 (fel tecken).'] },
    { question: 'Varför tar roboten ibland konstiga vägar sent i träningen?', answer: ['Utforskning: med ε = 0,2 väljs en slumpvald handling i ungefär vart femte steg.'] },
    { question: 'Hur många steg behöver den frysta roboten?', answer: ['7 steg, den kortaste vägen. Summa belöning: 6 · (−1) + 10 = 4.'] },
    { question: 'Vad har roboten lärt sig med +1 per steg?', answer: ['Att stanna ute så länge som möjligt – i provet kör den in i en vägg i alla 40 stegen och får summan 40. Laddstationen ger bara 10 och avslutar episoden.'] },
    {
      question: 'Öppen fråga: Varför fick +1 per steg en oavsiktlig följd, och vilken belöning är bättre?',
      answer: [
        'Exempelresonemang: ”Roboten försöker få så mycket poäng som möjligt totalt. När varje steg ger +1 lönar det sig att aldrig komma hem, och det spelar ingen roll om den dammsuger eller bara stöter i en vägg. Bättre vore att ge poäng för varje smutsig ruta som blir ren första gången, ett litet minus per steg så att den inte slösar batteri, och en belöning för att komma hem. Sedan måste vi frysa modellen och testa den i ett prov för att se att den gör det vi menade.”',
      ],
    },
  ],
});
