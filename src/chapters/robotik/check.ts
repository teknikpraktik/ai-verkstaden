import type { QuestionSpec } from '../../components/lab/Questions';

const check: QuestionSpec[] = [
  {
    kind: 'choice',
    id: 'k5-kedjan',
    prompt: 'En robotdammsugare kör in i en stol trots att avståndssensorn mätte rätt avstånd. Var i kedjan sensor → styrprogram → motor ligger felet troligast?',
    options: [
      { id: 'a', text: 'I styrprogrammet: regeln reagerade inte på mätvärdet', correct: true },
      { id: 'b', text: 'I sensorn', feedback: 'Sensorn mätte rätt enligt frågan. Om ett korrekt mätvärde ändå ger fel handling är det beslutet – styrprogrammet – som brister.' },
      { id: 'c', text: 'Det går inte att säga något om var felet ligger', feedback: 'Jo: genom att följa mätvärde → beslut → konsekvens kan man ringa in felet. Mätvärdet var rätt, så sensorn kan uteslutas.' },
    ],
    explanation: 'Som med gränsen 0 i labb 19: sensorn såg hindret, men villkoret blev aldrig sant och motorn fick order att köra framåt.',
  },
  {
    kind: 'choice',
    id: 'k5-brus',
    prompt: 'Sensorn har brus. Vad händer oftast om roboten reagerar redan när avståndet är under 2 rutor i stället för under 1?',
    options: [
      { id: 'a', text: 'Färre krockar, men roboten svänger tidigare och kommer inte lika nära väggarna', correct: true },
      { id: 'b', text: 'Bruset försvinner', feedback: 'Bruset finns kvar – mätvärdena är lika felaktiga. Det är regeln som får en marginal mot felen.' },
      { id: 'c', text: 'Fler krockar, eftersom roboten svänger oftare', feedback: 'Att svänga är inte en krock. Med gränsen 2 gav samma brus 0 krockar i labb 19 i stället för 3.' },
    ],
    explanation: 'En säkerhetsmarginal skyddar mot mätfel men kostar effektivitet: i labb 19 städades 19 rutor i stället för 21.',
  },
  {
    kind: 'numeric',
    id: 'k5-omplanering',
    prompt: 'En robot planerar en väg på 6 steg. Efter 2 steg upptäcker den ett hinder och planerar om. Den nya vägen från där den står är 9 steg. Hur många steg kör roboten totalt?',
    answer: 11,
    wrong: [
      { value: 9, feedback: '9 är bara den nya vägen. Roboten hade redan kört 2 steg innan den stannade.' },
      { value: 15, feedback: '15 = 6 + 9, men roboten körde inte hela den första planen – bara 2 steg av den.' },
      { value: 6, feedback: '6 var den första planen, som inte gick att följa ända fram.' },
    ],
    hint: 'Lägg ihop stegen som redan är körda och den nya vägen.',
    explanation: '2 steg innan hindret upptäcktes plus 9 steg på den nya vägen: 11 steg. Precis som i lagret i labb 20 (1 + 14 = 15).',
  },
  {
    kind: 'choice',
    id: 'k5-karta',
    prompt: 'Vilket påstående om en robots karta stämmer?',
    options: [
      { id: 'a', text: 'Kartan är robotens bild av världen och kan vara inaktuell – sensorerna behövs för att upptäcka skillnader', correct: true },
      { id: 'b', text: 'Om kartan är exakt ritad behöver roboten inga sensorer', feedback: 'Även en exakt karta blir fel när någon ställer en pall i gången eller stänger en dörr. Kartan är en ögonblicksbild.' },
      { id: 'c', text: 'A* hittar alltid den kortaste vägen i verkligheten', feedback: 'A* hittar den kortaste vägen på kartan. Om kartan är fel kan vägen i verkligheten bli längre – eller omöjlig.' },
    ],
    explanation: 'Planering och avkänning hör ihop: roboten planerar på kartan, jämför med vad den ser och planerar om när de skiljer sig åt.',
  },
  {
    kind: 'choice',
    id: 'k5-ingen-vag',
    multiple: true,
    prompt: 'En självständig robot upptäcker att den enda vägen till målet är blockerad. Vilka beteenden är rimliga? Välj alla som stämmer.',
    options: [
      { id: 'a', text: 'Stanna på ett säkert ställe', correct: true },
      { id: 'b', text: 'Larma en människa och berätta var den står och vad som blockerar', correct: true },
      { id: 'c', text: 'Köra åt ett slumpmässigt håll tills den hittar en väg', feedback: 'Att köra på måfå hjälper inte – med det roboten vet finns ingen väg – och kan skapa farliga situationer.' },
      { id: 'd', text: 'Knuffa bort hindret', feedback: 'Roboten vet inte vad hindret är. Det kan vara en människa eller något ömtåligt.' },
    ],
    explanation: 'När roboten inte kan lösa uppgiften är mänskligt övertagande det säkra valet: stanna, larma och vänta på hjälp.',
  },
  {
    kind: 'choice',
    id: 'k5-autonomi',
    prompt: 'En robot ska köra brickor på ett äldreboende där boende går med rullator. Vilket krav är viktigast att ställa?',
    options: [
      { id: 'a', text: 'Att den stannar för människor nära den och larmar personal direkt om någon behöver hjälp', correct: true },
      { id: 'b', text: 'Att den kör så självständigt som möjligt för att spara personaltid', feedback: 'Personaltid är viktig, men inte på bekostnad av de boendes trygghet. En självständig robot utan larmvillkor underkändes i labb 21.' },
      { id: 'c', text: 'Att den har så många kameror som möjligt', feedback: 'Fler kameror hotar de boendes integritet, och kameror fungerar dåligt i mörker. Närhetssensor och larmvillkor är viktigare.' },
    ],
    explanation: 'Ju mer som står på spel för människor, desto viktigare är mänsklig tillsyn. Värdighet och trygghet går före effektivitet.',
  },
  {
    kind: 'open',
    id: 'k5-resonemang',
    prompt: 'Välj ett eget exempel på en robot (till exempel en gräsklippare, en självkörande buss eller en lagerrobot). Beskriv vilka sensorer den behöver, under vilka förhållanden de kan svika och när en människa bör ta över.',
    criteria: [
      'nämner minst två sensorer och vad de mäter',
      'ger ett konkret förhållande där en sensor blir osäker (mörker, regn, trängsel, gammal karta)',
      'anger ett tydligt villkor för mänskligt övertagande och motiverar det med säkerhet för människor',
    ],
  },
];

export default check;
