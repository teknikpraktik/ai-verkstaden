import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben avslutar kapitlet med en agent som söker i ett spelträd. Eleverna jämför slump, regler och minimax i samma brädläge och ser att regler kan missa en fälla som en fullständig sökning upptäcker.',
  tips: [
    'Låt eleverna spela ett parti mot regelagenten och försöka gillra fällan med två hörn (X i A1, O i mitten, X i C3).',
    'Brädet går att spela helt med tangentbord: piltangenter och Enter. Det är bra att visa på projektor.',
    'Rita en liten del av spelträdet för fällan på tavlan och fyll i värdena tillsammans: först löven, sedan min, sedan max.',
  ],
  misconceptions: [
    { myth: 'Minimax kan alltid vinna.', reality: 'Mot en perfekt motståndare blir tre i rad oavgjort. Minimax garanterar att inte förlora, inte att vinna.' },
    { myth: 'Regelagenten är lika bra som minimax.', reality: 'Oftast, men i fällan med två hörn väljer regelagenten C1 och förlorar. Mot slumpagenten förlorade den 2 av 100 partier, minimax 0.' },
    { myth: 'Minimax tänker som en människa.', reality: 'Den går mekaniskt igenom alla fortsättningar. Den har ingen ”känsla” för spelet – det fungerar bara för att tre i rad är litet.' },
  ],
  discussionStops: [
    'Efter steg 1: Varför är det rimligt att anta att motståndaren spelar så bra som möjligt? När är det inte rimligt?',
    'Efter steg 4: Vilken regel skulle du lägga till för att regelagenten inte ska gå i fällan? Blir den då perfekt?',
    'Efter steg 5: Varför fungerar inte minimax direkt för schack eller go? Vad gör man i stället?',
  ],
  answers: [
    { question: 'Förutsägelse: Var lägger minimaxagenten sitt O i läget ”Blockera”?', answer: ['C1. Alla andra drag låter X vinna direkt.'] },
    { question: 'Vilken motståndare kan missa att blockera?', answer: ['Slumpagenten. Med startvärde 1 väljer den en annan ruta än C1.'] },
    { question: 'Vad gör minimaxagenten när både X och O har två i rad?', answer: ['Lägger O i C2 och vinner direkt (värde: vinst om 1 drag).'] },
    { question: 'Vad visar beslutsträdet om draget O i C1 i fällan med två hörn?', answer: ['Förlust om 4 drag: X blockerar i A3 och hotar sedan både A2 och B3. Kanterna A2, B1, B3 och C2 ger oavgjort, och minimax väljer B1.'] },
    { question: 'Hur många av 100 partier förlorade regelagenten mot slumpagenten?', answer: ['2. Minimax förlorade 0 (vann 77, 23 oavgjorda); regelagenten vann 81 och spelade 17 oavgjorda.'] },
    {
      question: 'Förklara hur minimaxagenten väljer drag och varför metoden inte fungerar lika enkelt i schack.',
      answer: [
        'Exempelresonemang: Minimax provar varje möjligt drag, sedan varje svar från motståndaren och så vidare tills partiet är slut. Slutlägena får värden (vinst, oavgjort, förlust). På motståndarens tur antas motståndaren välja det som är sämst för agenten, på agentens tur väljs det bästa. Draget med bäst värde i värsta fall väljs.',
        'Regelagenten tittar bara på läget just nu och tar ett hörn i fällan. Minimax ser att X då kan skapa två hot samtidigt. I schack är spelträdet alldeles för stort att gå igenom till slutet, så man söker bara några drag framåt och uppskattar värdet av lägena där.',
      ],
    },
  ],
});
