import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben visar att planering (A*) bara är så bra som kartan den räknar på, och att en robot därför måste kombinera planering med avkänning. Den förbereder labb 21:s frågor om när en människa ska ta över.',
  tips: [
    'Visa pallscenariot på projektor och stanna vid ”Stopp”. Låt eleverna peka ut skillnaden mellan de två kartorna innan ni går vidare.',
    'Använd konkreta exempel på skillnaden mellan karta och miljö: en pall som lämnats kvar i en lagergång, en brandsluss som stängs automatiskt, en hylla som flyttats i en matbutik, en rullstol som parkerats i en sjukhuskorridor, en vägbom vid vägarbete för en självkörande bil.',
    'Jämför med en GPS i bil: kartan säger att vägen är öppen, men det har hänt en olycka. Föraren (sensorn) ser det och väljer en annan väg.',
    'I experimentläget kan eleverna ändra verkligheten (Enter eller klick i den högra kartan). Utmaning: bygg en miljö där roboten kör minst dubbelt så långt som den första planen.',
  ],
  misconceptions: [
    { myth: 'Roboten ser hela verkligheten.', reality: 'Roboten vet bara det som står på kartan och det sensorn ser just nu. Den högra kartan är facit som bara du ser – inte roboten.' },
    { myth: 'A* har räknat fel när roboten måste vända.', reality: 'A* hittar kortaste vägen på kartan. Felet ligger i kartan, inte i sökningen.' },
    { myth: 'Om roboten inte hittar någon väg finns det ingen väg.', reality: 'Roboten vet bara vad den sett. En dörr som är öppen men står som stängd på kartan kan ge en väg som roboten inte känner till.' },
  ],
  discussionStops: [
    'Efter förutsägelsen: Hur gör du själv när vägen du brukar ta är avstängd?',
    'Efter räckvidden: Varför har inte alla robotar sensorer med lång räckvidd? (pris, energi, vikt, och att räckvidd inte hjälper bakom hörn)',
    'Efter ”Ingen väg”: Vem ska roboten larma, och vad ska meddelandet innehålla?',
  ],
  answers: [
    { question: 'Förutsägelse: Vad gör roboten när den ser pallen?', answer: ['Den stannar i F3, ritar in pallen på kartan och planerar en ny väg från där den står (14 steg via en sidogång). Den kör inte på pallen, eftersom sensorn ser den två rutor bort.'] },
    { question: 'Hur många steg kör roboten totalt i lagret?', answer: ['15: 1 steg till F3 plus den nya vägen på 14 steg. Vanliga felsvar: 5 (första planen), 14 (bara nya vägen) och 13 (kortaste vägen med rätt karta).'] },
    { question: 'Varför kör roboten färre steg när sensorn ser längre?', answer: ['Den upptäcker pallen tidigare. Räckvidd 1: ser pallen från F4, 17 steg. Räckvidd 2: från F3, 15 steg. Räckvidd 3: redan från start, 13 steg – samma som med rätt karta.'] },
    { question: 'Varför planerade roboten en väg genom en stängd dörr?', answer: ['Kartan visar dörröppningen men inte om dörren är stängd just nu. A* räknade rätt på kartan (11 steg). Roboten såg den stängda dörren från F2 och körde omvägen, totalt 23 steg.'] },
    { question: 'Hur många steg kortare blev resan än den första planen när dörren hade öppnats?', answer: ['12 steg: första planen var 23 steg, roboten körde 11. Den såg den öppna dörren när den passerade F2.'] },
    { question: 'Vad ska roboten göra när ingen väg finns?', answer: ['Stanna och larma en människa, med position och vad som blockerar. Roboten stannar i L2 efter 10 steg. Att köra slumpmässigt eller knuffa undan hindret kan skada människor eller saker.'] },
    {
      question: 'Öppen fråga: Förklara skillnaden mellan robotens karta och den faktiska miljön med ett eget exempel.',
      answer: [
        'Exempelresonemang: En robot som kör ut mat på ett sjukhus har en karta över korridorerna. Kartan visar inte att en säng har ställts i korridoren efter lunch. När robotens sensor ser sängen ritar den in den på kartan och räknar fram en ny väg från där den står. Om alla vägar är blockerade ska den stanna och ringa efter personal i stället för att försöka ta sig förbi.',
        'Ett starkt svar skiljer på vad roboten tror (kartan) och vad som är sant (miljön), beskriver hela kedjan upptäck → uppdatera → planera om, och tar upp vad som händer när ingen väg finns.',
      ],
    },
  ],
});
