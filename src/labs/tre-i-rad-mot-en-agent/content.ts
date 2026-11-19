import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'En spelande dator är en [[agent]]: den ser brädet, väljer en [[handling|handling]] (ett drag) och vill nå sitt mål – att vinna. Men den har en motståndare som också vill vinna. Hur väljer man då ett bra drag?',
    'Du möter tre agenter i tre i rad: en som väljer på måfå, en som följer några regler och en som använder [[minimax]] för att tänka igenom alla fortsättningar i ett [[spelträd]]. Du spelar själv, ställer agenterna mot samma brädläge och tittar in i beslutsträdet.',
    { type: 'note', kind: 'forenklad', text: 'Slumpagenten använder ett startvärde, så samma läge och samma startvärde ger alltid samma drag. Vid lika bra drag väljer minimax rutan som kommer först (A1, B1, C1, A2 …).' },
  ],
  sections: [
    {
      heading: 'Tre sätt att välja drag',
      blocks: [
        {
          type: 'table',
          caption: 'Agenterna i labben',
          head: ['Agent', 'Hur den väljer', 'Svaghet'],
          rows: [
            ['Slumpagent', 'En slumpmässig tom ruta', 'Missar både vinster och hot'],
            ['Regelagent', '1 vinn om du kan, 2 blockera, 3 ta mitten, 4 ta ett hörn, 5 ta en kant', 'Ser bara läget just nu, inte vad som händer om två drag'],
            ['Minimaxagent', 'Går igenom alla fortsättningar till slutet och väljer det drag vars sämsta fall är bäst', 'Blir mycket långsam i större spel'],
          ],
        },
        'Regelagenten är ett [[regelbaserat-system|regelbaserat system]] och fungerar förvånansvärt bra. Men i fällan med två hörn leder regeln *ta ett hörn* till förlust: X blockerar och får sedan två hot samtidigt.',
      ],
    },
    {
      heading: 'Så räknar minimax',
      blocks: [
        'Varje brädläge är en nod i spelträdet och varje drag en gren. Löven är slutlägen: vinst, förlust eller oavgjort. Minimax ger löven ett värde och räknar bakåt:',
        {
          type: 'list',
          items: [
            'När det är **agentens** tur väljs det **största** värdet (max) – agenten tar sitt bästa drag.',
            'När det är **motståndarens** tur väljs det **minsta** värdet (min) – agenten antar att motståndaren spelar så bra som möjligt.',
            'Labben ger en snabb vinst högre värde än en långsam, och en sen förlust högre värde än en tidig. Därför visar trädet till exempel ”förlust (om 4 drag)”.',
          ],
        },
        'Om båda spelar perfekt blir tre i rad alltid oavgjort. Därför kan du som bäst spela oavgjort mot minimaxagenten. I labbens test mot slumpagenten vann minimax 77 och spelade 23 oavgjorda av 100 partier, utan en enda förlust. Regelagenten vann 81, spelade 17 oavgjorda och förlorade 2.',
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Minimax i pseudokod och spelträdets storlek',
      minutes: 15,
      prerequisites: 'labbens genomgång; fakultet (n!) är en fördel',
      blocks: [
        {
          type: 'pseudo',
          title: 'Minimax',
          code: `funktion värde(läge, djup):
    om läget är vinst för agenten:   returnera 10 − djup
    om läget är förlust för agenten: returnera djup − 10
    om brädet är fullt:              returnera 0
    värden ← [värde(läge efter drag, djup + 1) för varje möjligt drag]
    om det är agentens tur: returnera största värdet
    annars:                 returnera minsta värdet`,
        },
        'Från ett tomt bräde finns 9 första drag, sedan 8, sedan 7 … Utan att räkna bort partier som tar slut tidigt blir det 9! = 362 880 sätt att fylla brädet. En dator klarar det på en bråkdel av en sekund. I schack finns ungefär 30 möjliga drag i varje läge och partier på 80 drag – spelträdet blir ofattbart stort. Schackprogram söker därför bara några drag framåt och uppskattar värdet av lägena där de stannar, ungefär som ledtråden h i [labb 8](/labb/sok-med-kostnad-och-ledtrad/).',
      ],
    },
  ],
  conclusion: [
    'Slump, regler och minimax är tre helt olika sätt för en agent att välja handling. Reglerna är snabba och oftast bra, men bara minimax ser fällor som ligger flera drag bort.',
    'Minimax är en sökning i ett spelträd, precis som sökningarna i labb 6–8 är sökningar i grafer. Skillnaden är att det finns en motståndare som väljer varannan gren.',
  ],
});
