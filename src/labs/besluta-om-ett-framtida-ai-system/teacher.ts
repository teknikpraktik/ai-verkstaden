import { defineTeacher } from '../../course/types';

/** Försvarbara exempelresonemang. Visas också i labben först när eleven har skrivit ett eget beslut. */
export const exampleDecisions: { title: string; text: string }[] = [
  {
    title: 'Pilot med villkor (rektorns perspektiv)',
    text: 'Utan systemet hittar mentorerna 8 av 20 elever i riskzonen. Utan villkor hittar systemet 16, men 24 elever utan risk kontaktas felaktigt och ingen kan överpröva. Jag väljer en pilot med 50 elever där mentorn granskar varje markering, eleven får veta och kan begära ändring, och felen granskas per grupp. Piloten visar om nyttan håller innan fler elever berörs. Jag som rektor ansvarar för beslutet och för att utvärderingen blir offentlig.',
  },
  {
    title: 'Inför inte (elevens perspektiv)',
    text: 'Även med granskning kontaktas elever felaktigt, och revisionen visar att felen oftare drabbar yrkesprogram. Att bli utpekad som ”avhoppsrisk” kan påverka hur lärare ser på en. Pengarna skulle kunna gå till fler mentorstimmar i stället. Om systemet ändå införs måste eleven kunna se och överpröva sin markering, och uppgifterna ska raderas efter läsåret.',
  },
  {
    title: 'Inför med villkor (kuratorns perspektiv)',
    text: 'Fler elever i riskzonen får hjälp (15 i stället för 8 med mentorsgranskning), och det väger tungt eftersom avhopp får stora följder. Men systemet ska bara använda närvaro och betyg – aldrig uppgifter från elevhälsan – och leverantören får inte använda uppgifterna. Mänsklig granskning gör att bara 6 kontaktas felaktigt, och eleven måste kunna begära ändring.',
  },
];

export default defineTeacher({
  purpose:
    'Kapitlets avslutande labb samlar det eleverna mött: nytta och risk (labb 22–23), dataminimering (labb 24) och reglering (labb 25). Eleverna tar en roll, väljer beslut och villkor, ser konsekvenserna och motiverar sitt beslut. Det finns flera försvarbara svar – bedömningen gäller resonemanget.',
  tips: [
    'Fördela rollerna i klassen så att alla sex finns representerade. Låt dem sedan mötas i grupper och förhandla fram ett gemensamt beslut.',
    'Påminn om att siffrorna bygger på uttalade, påhittade antaganden (se labbens text). Elever som ifrågasätter antagandena gör något bra.',
    'Exempelresonemangen visas i labben först när eleven skrivit minst 40 ord. Använd dem som underlag för att jämföra, inte som facit.',
    'Koppla till labb 25: ett system som påverkar elevers utbildning kan behöva bedömas enligt AI-förordningen, och profilering kräver eftertanke enligt GDPR.',
  ],
  misconceptions: [
    { myth: 'Om systemet hjälper fler är beslutet självklart.', reality: 'Utan villkor får 16 hjälp i stället för 8, men 24 kontaktas felaktigt och ingen kan överpröva. Nytta måste vägas mot risk och rättigheter.' },
    { myth: 'Mänsklig granskning löser alla problem.', reality: 'Granskningen minskar felaktiga kontakter från 24 till 6, men tar tid och kan inte upptäcka att felen drabbar en grupp mer – det kräver en revision.' },
    { myth: 'Det finns ett rätt svar.', reality: 'Flera beslut är försvarbara. Det som bedöms är om motiveringen väger nytta, risk, ansvar och överprövning mot varandra.' },
  ],
  discussionStops: [
    'Efter steg 2: Vilka elever är de 24 som kontaktas felaktigt? Hur kan det kännas?',
    'Efter steg 3: Vad kostar mänsklig granskning, och vem betalar?',
    'Avslutning: Vem bär ansvaret om systemet missar en elev som sedan hoppar av?',
  ],
  answers: [
    { question: 'Förutsägelse: Får fler elever i riskzonen hjälp om systemet införs utan villkor?', answer: ['Ja: 16 av 20 i stället för 8 av 20. Men 24 elever utan risk kontaktas felaktigt.'] },
    { question: 'Hur många elever kontaktas felaktigt om systemet införs utan villkor?', answer: ['24 (av 180 utan risk). Vanliga felsvar: 40 (alla markerade), 16 (rätt markerade), 180 (alla utan risk).'] },
    { question: 'Hur många kontaktas felaktigt med villkoret att mentorn granskar varje markering?', answer: ['6. Samtidigt minskar antalet som får hjälp från 16 till 15 och mentortiden ökar från 20 till 20,5 timmar.'] },
    { question: 'Vilket villkor gör att en elev kan få en felaktig markering ändrad?', answer: ['”Eleven får veta och kan begära ändring”. Mänsklig granskning minskar felen men ger inte eleven någon möjlighet att själv ifrågasätta.'] },
    {
      question: 'Ditt beslut: motivera med nytta, risk, ansvar och möjlighet till överprövning',
      answer: [...exampleDecisions.map((e) => `**${e.title}:** ${e.text}`), 'Bedöm om eleven använder siffror från labben, väger minst två roller mot varandra, anger vem som ansvarar och tar ställning till överprövning.'],
    },
  ],
});
