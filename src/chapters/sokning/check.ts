import type { QuestionSpec } from '../../components/lab/Questions';

/** Kunskapskontroll för kapitel 2. Facit och exempelresonemang finns i teacher.ts. */
const check: QuestionSpec[] = [
  {
    kind: 'choice',
    id: 'k2-agent',
    prompt: 'En städrobot minns vilka rutor den redan har kontrollerat. Vilken del av agenten är det?',
    options: [
      { id: 'tillstand', text: 'Tillstånd', correct: true },
      { id: 'sensor', text: 'Sensorinformation', feedback: 'Sensorerna visar hur det ser ut just nu. Det roboten minns från tidigare är en del av dess tillstånd.' },
      { id: 'mal', text: 'Mål', feedback: 'Målet är det roboten ska åstadkomma: ett rent rum. Minnet hjälper den att nå målet men är inte målet.' },
      { id: 'handling', text: 'Handling', feedback: 'Handlingar är det roboten gör, till exempel suga eller gå ett steg. Att minnas är inget den gör i omgivningen.' },
    ],
    explanation: 'Tillståndet är det agenten vet om sig själv och världen, både det den mäter nu och det den minns.',
  },
  {
    kind: 'choice',
    id: 'k2-besokta',
    prompt: 'Varför håller en grafsökning reda på besökta noder?',
    options: [
      { id: 'a', text: 'För att inte undersöka samma nod flera gånger och inte fastna i cykler', correct: true },
      { id: 'b', text: 'För att kunna hitta den billigaste vägen', feedback: 'Billigaste vägen beror på i vilken ordning noderna tas ut (lägst g). Listan över besökta noder tar bort dubbletter och skyddar mot cykler.' },
      { id: 'c', text: 'För att veta var målet ligger', feedback: 'Listan säger bara var sökningen har varit, inget om var målet finns.' },
    ],
    explanation: 'Utan minne blir sökträdet fullt av dubbletter och kan bli oändligt när grafen har cykler.',
  },
  {
    kind: 'choice',
    id: 'k2-bfs-dfs',
    prompt: 'Vad är den enda skillnaden mellan bredden först (BFS) och djupet först (DFS) i labb 7?',
    options: [
      { id: 'a', text: 'BFS tar ut noder ur en kö (först in, först ut), DFS ur en stack (sist in, först ut)', correct: true },
      { id: 'b', text: 'BFS vet var målet ligger, DFS gör det inte', feedback: 'Ingen av dem vet var målet ligger. Det är sökningar med ledtråd, som A*, som använder en uppskattning.' },
      { id: 'c', text: 'DFS räknar kostnader, BFS räknar steg', feedback: 'Ingen av dem räknar kostnad. BFS hittar minst antal steg tack vare kön.' },
    ],
    explanation: 'Samma algoritm med en kö eller en stack ger helt olika sökordning.',
  },
  {
    kind: 'numeric',
    id: 'k2-kostnad',
    prompt: 'En väg går över tre kanter med vikterna 30, 30 och 40. En annan väg har två kanter med vikterna 30 och 80. Hur mycket billigare är den billigaste vägen?',
    answer: 10,
    wrong: [
      { value: 100, feedback: '100 är kostnaden för den billigaste vägen. Frågan gäller skillnaden mellan vägarna.' },
      { value: 1, feedback: '1 är skillnaden i antal kanter. Kostnaden är summan av vikterna: 100 mot 110.' },
    ],
    hint: 'Lägg ihop vikterna för varje väg och ta skillnaden.',
    explanation: '30 + 30 + 40 = 100 och 30 + 80 = 110. Vägen med fler steg är 10 billigare.',
  },
  {
    kind: 'choice',
    id: 'k2-girig',
    prompt: 'Varför kan girig bäst-först-sökning hitta en dyrare väg än A*?',
    options: [
      { id: 'a', text: 'Den väljer bara efter h, uppskattningen kvar, och bryr sig inte om vad vägen hittills har kostat', correct: true },
      { id: 'b', text: 'Den har ingen lista över besökta noder', feedback: 'I labben har alla sökningar en lista över besökta noder. Skillnaden är vad de sorterar efter.' },
      { id: 'c', text: 'Den använder en sämre heuristik än A*', feedback: 'I labb 8 använder båda samma h (fågelvägen). A* räknar också med g, kostnaden hittills.' },
    ],
    explanation: 'A* sorterar efter f = g + h. Därför märker den när en väg som ser kort ut blir dyr.',
  },
  {
    kind: 'choice',
    id: 'k2-astar-villkor',
    prompt: 'A* i labb 8 öppnar aldrig en redan besökt nod igen. När hittar den då säkert en billigaste väg?',
    options: [
      { id: 'a', text: 'När alla kostnader är positiva och h är konsistent: h(mål) = 0 och h(n) ≤ kostnad(n, m) + h(m)', correct: true },
      { id: 'b', text: 'Alltid', feedback: 'En överskattande h (3 × fågelvägen) gav en väg som kostade 450 i stället för 375.' },
      { id: 'c', text: 'Så fort h aldrig överskattar', feedback: 'Det räcker för A* som kan öppna besökta noder igen. I scenariot ”Lurig ledtråd” överskattar h aldrig men labbens A* hittar ändå en väg som kostar 9 i stället för 7.' },
    ],
    explanation: 'En konsistent h gör att första gången A* tar ut en nod har den redan hittat den billigaste vägen dit.',
  },
  {
    kind: 'choice',
    id: 'k2-minimax',
    prompt: 'Vad antar minimax om motståndaren?',
    options: [
      { id: 'a', text: 'Att motståndaren väljer det drag som är sämst för agenten', correct: true },
      { id: 'b', text: 'Att motståndaren väljer på måfå', feedback: 'Då skulle agenten räkna med ett genomsnitt. Minimax räknar med värsta fallet.' },
      { id: 'c', text: 'Att motståndaren följer samma regler som regelagenten', feedback: 'Minimax antar ingenting om motståndarens regler, bara att den spelar så bra som möjligt.' },
    ],
    explanation: 'Agenten maximerar sitt värde och antar att motståndaren minimerar det – därav namnet minimax.',
  },
  {
    kind: 'open',
    id: 'k2-jamfor',
    prompt: 'Välj två av kapitlets sökningar (BFS, DFS, uniformkostnadssökning, girig, A*, minimax) och jämför dem: vad prioriterar de, vad garanterar de och vad kostar det?',
    criteria: [
      'anger vad varje sökning väljer härnäst (kö, stack, g, h, f eller motståndarens bästa svar)',
      'anger vad sökningen garanterar, och under vilka villkor',
      'nämner en nackdel, till exempel många besökta noder, dyr väg eller stort spelträd',
      'använder ett konkret exempel från en labb',
    ],
  },
];

export default check;
