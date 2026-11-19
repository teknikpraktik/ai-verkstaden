import { defineConcepts } from '../../course/types';

export default defineConcepts([
  {
    id: 'datorseende',
    term: 'Datorseende',
    definition: 'Den del av AI som handlar om att få datorer att tolka bilder och video, till exempel att känna igen föremål, ansikten eller text.',
    aliases: ['bildanalys', 'computer vision', 'maskinseende', 'vision'],
    related: ['objektigenkanning', 'pixel'],
  },
  {
    id: 'objektigenkanning',
    term: 'Objektigenkänning',
    definition: 'Att avgöra vilka föremål som finns i en bild och var de finns. Består ofta av två delar: att hitta var något finns (lokalisera) och att avgöra vad det är (klassificera).',
    aliases: ['objektdetektering', 'object detection', 'object recognition', 'känna igen föremål'],
    related: ['datorseende', 'klassificering', 'glidande-fonster'],
  },
  {
    id: 'pixel',
    term: 'Pixel',
    definition: 'En bildpunkt – den minsta rutan i en digital bild. För datorn är varje pixel ett tal, till exempel 0 för vit och 1 för svart, eller tre tal för rött, grönt och blått.',
    aliases: ['bildpunkt', 'pixlar', 'upplösning'],
    related: ['datorseende'],
  },
  {
    id: 'mallmatchning',
    term: 'Mallmatchning',
    definition: 'En enkel metod för igenkänning: jämför bilden med en sparad mall för varje klass och välj den mall som liknar mest. Klarar sig dåligt när föremålet är flyttat, vridet eller belyst på ett annat sätt.',
    aliases: ['template matching', 'mall'],
    related: ['objektigenkanning', 'klassificering', 'knn'],
  },
  {
    id: 'glidande-fonster',
    term: 'Glidande fönster',
    definition: 'Ett sätt att leta efter föremål i en stor bild: ett litet fönster flyttas steg för steg över bilden, och i varje läge avgörs om fönstret innehåller ett föremål.',
    aliases: ['sliding window', 'sökfönster'],
    related: ['objektigenkanning', 'troskel'],
  },
  {
    id: 'faltningsnatverk',
    term: 'Faltningsnätverk',
    definition: 'Ett neuralt nätverk för bilder som lär sig små mönster (kanter, hörn, former) som kan kännas igen var de än finns i bilden. Tränas på mycket stora mängder märkta bilder.',
    aliases: ['CNN', 'convolutional neural network', 'konvolutionsnätverk', 'faltning'],
    related: ['neuralt-natverk', 'datorseende', 'traningsdata'],
  },
]);
