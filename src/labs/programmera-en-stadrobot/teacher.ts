import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben introducerar agentbegreppet (mål, sensorer, tillstånd, handlingar, resultat) med en konkret robot och visar varför regler och minne slår slump. Den förbereder kapitlets sökalgoritmer: ”gå mot närmaste” är en sökning.',
  tips: [
    'Låt eleverna stega de första fem handlingarna högt i par: en läser sensorerna, den andra säger vilken regel som gäller.',
    'Be olika elever välja olika startvärden för slumpen och samla resultaten på tavlan. Spridningen blir tydlig.',
    'Påminn om att bara en sak ändras i taget i jämförelsen över sikt: samma rum, samma regler.',
  ],
  misconceptions: [
    { myth: 'Roboten vet att rummet är rent när sista smutsen är borta.', reality: 'Med sikt 0 kan roboten inte veta det förrän den kontrollerat alla rutor. Därför är rummet rent efter 32 handlingar, men roboten stannar först efter 35.' },
    { myth: 'Slump är alltid sämst.', reality: 'Ibland har slumpen tur (60 handlingar med ett av startvärdena), men den är opålitlig och kan hamna på över 200 eller inte bli klar alls.' },
    { myth: 'Sensorinformation och tillstånd är samma sak.', reality: 'Sensorerna visar läget just nu. Tillståndet innehåller även det roboten minns, till exempel vilka rutor den redan kontrollerat.' },
  ],
  discussionStops: [
    'Efter steg 2: Vad skulle hända om slumproboten också fick ett minne? Är den fortfarande en slumpstrategi?',
    'Efter jämförelsen av sikt: Vad kostar bättre sensorer i verkligheten (pris, energi, beräkningar)?',
    'Efter möblerna: Vilka situationer skulle kunna lura den regelstyrda roboten? (Möbler som flyttas, smuts som kommer tillbaka.)',
  ],
  answers: [
    { question: 'Förutsägelse: Vilken robot gör rent med minst antal handlingar?', answer: ['Den regelstyrda: 32 handlingar i det tomma rummet med sikt 0. Slumproboten behövde 60–236 handlingar med startvärde 1–20, och 2 av 20 körningar blev inte klara inom 300.'] },
    { question: 'Efter hur många handlingar är rummet rent med den regelstyrda roboten (sikt 0)?', answer: ['32. Vanligt felsvar är 35, som är när roboten stannade – den fortsätter tills alla rutor är kontrollerade.'] },
    { question: 'Hur många färre handlingar med sikt 2 jämfört med sikt 0?', answer: ['10 (32 − 22). Felsvaret 12 uppstår om man jämför när roboten stannade (35 − 23).'] },
    {
      question: 'Beskriv den regelstyrda roboten som en agent. När kan en slumpstrategi ändå vara användbar?',
      answer: [
        'Exempelresonemang: Målet är att alla rutor ska bli rena. Sensorerna visar om egna rutan är smutsig, smuts inom sikten och hinder runt roboten. Tillståndet är var roboten står och vad den minns: kontrollerade rutor och känd smuts. Handlingarna är att suga, gå ett steg eller stanna.',
        'Slump kan vara användbar när roboten saknar karta och minne, när miljön ändras hela tiden så att en karta snabbt blir fel, eller för att inte fastna i samma mönster. Många enkla robotdammsugare kombinerar regler med slumpmässiga riktningsbyten.',
      ],
    },
  ],
});
