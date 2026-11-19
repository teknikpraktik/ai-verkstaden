import type { QuestionSpec } from '../../components/lab/Questions';

/** Kunskapskontroll för kapitel 3. Facit och exempelresonemang finns i teacher.ts. */
const check: QuestionSpec[] = [
  {
    kind: 'choice',
    id: 'k3-uppgiftstyp',
    prompt: 'En kiosk vill förutsäga hur många glassar som säljs i morgon utifrån väderprognosen. Vilken typ av uppgift är det?',
    options: [
      { id: 'a', text: 'Regression', correct: true },
      { id: 'b', text: 'Klassificering', feedback: 'Klassificering väljer en kategori, till exempel ”bra” eller ”dålig” dag. Här ska modellen förutsäga ett tal.' },
      { id: 'c', text: 'Klustring', feedback: 'Klustring letar efter grupper utan facit. Här finns ett facit – hur många glassar som faktiskt såldes.' },
      { id: 'd', text: 'Förstärkningsinlärning', feedback: 'Förstärkningsinlärning handlar om en agent som provar handlingar och får belöning. Här finns historiska exempel med facit.' },
    ],
    explanation: 'Att förutsäga ett tal med hjälp av exempel med facit är regression (labb 11).',
  },
  {
    kind: 'choice',
    id: 'k3-knn',
    prompt: 'En k-NN-klassificerare med k = 1 får 100 % rätt på träningsdatan. Vad kan du säga om hur bra den är på nya exempel?',
    options: [
      { id: 'a', text: 'Ingenting säkert – varje träningspunkt är sin egen närmaste granne, så 100 % är väntat. Man måste mäta på andra data.', correct: true },
      { id: 'b', text: 'Den är troligen nästan perfekt på nya exempel också', feedback: 'Det är en vanlig fälla. Med k = 1 blir träningsresultatet alltid 100 %, även när modellen generaliserar dåligt (i labb 12 blev det 80 % på validering).' },
      { id: 'c', text: 'Den är dålig, eftersom 100 % betyder att något är fel', feedback: '100 % på träning betyder inte automatiskt att modellen är dålig – bara att träningsresultatet inte säger något om nya exempel.' },
    ],
    explanation: 'Träningsresultatet mäter hur väl modellen minns. Generalisering måste mätas på data som inte användes för att träna.',
  },
  {
    kind: 'choice',
    id: 'k3-delar',
    prompt: 'Vilken del av datan ska användas för att välja k i k-NN?',
    options: [
      { id: 'a', text: 'Valideringsdata', correct: true },
      { id: 'b', text: 'Testdata', feedback: 'Om testdatan används för att välja blir testresultatet för optimistiskt – det har blivit en del av valet. Testdata används en gång, efter valet.' },
      { id: 'c', text: 'Träningsdata', feedback: 'På träningsdata vinner alltid k = 1 eftersom varje punkt är sin egen granne. Det leder till överanpassning.' },
    ],
    explanation: 'Träning: modellen lär sig. Validering: vi väljer. Test: en enda ärlig mätning efter valet.',
  },
  {
    kind: 'numeric',
    id: 'k3-missade',
    prompt: 'En modell ska hitta sjuka plantor. Förväxlingsmatrisen visar: 8 sant positiva, 3 falskt negativa, 2 falskt positiva, 22 sant negativa. Hur många sjuka plantor missade modellen?',
    answer: 3,
    wrong: [
      { value: 2, feedback: '2 är de falskt positiva – friska plantor som fick larm. Missade sjuka plantor är falskt negativa.' },
      { value: 5, feedback: '5 är alla fel tillsammans. Frågan gäller bara sjuka plantor som modellen kallade friska.' },
      { value: 8, feedback: '8 är de sjuka plantor som modellen hittade.' },
    ],
    hint: 'Missade sjuka = egentligen sjuk men modellen sa frisk (falskt negativa).',
    explanation: '3 falskt negativa. Träffsäkerheten är 30 av 35 (86 %), men 3 av 11 sjuka plantor missades – det syns inte i totalmåttet.',
  },
  {
    kind: 'choice',
    id: 'k3-lackage',
    prompt: 'Ett team får 99 % på sitt test. Senare visar det sig att samma bilder fanns både i tränings- och testdatan. Vad kallas problemet?',
    options: [
      { id: 'a', text: 'Dataläckage', correct: true },
      { id: 'b', text: 'Underanpassning', feedback: 'Underanpassning betyder att modellen är för enkel. Här är problemet att testet inte mäter något nytt.' },
      { id: 'c', text: 'Extrapolering', feedback: 'Extrapolering är att använda en modell utanför området den sett data. Här har modellen tvärtom redan sett testdatan.' },
    ],
    explanation: 'När testdata läcker in i träningen mäter testet minne i stället för förmåga, och resultatet blir för bra.',
  },
  {
    kind: 'choice',
    id: 'k3-kmeans',
    prompt: 'Du kör k-means två gånger på samma data med k = 3 men olika startvärden och får olika grupper. Vad stämmer?',
    options: [
      { id: 'a', text: 'Det är normalt: k-means hittar en lösning som beror på startcentrumen. Kör flera gånger och jämför.', correct: true },
      { id: 'b', text: 'Det är ett programfel – k-means ska alltid ge samma svar', feedback: 'Med samma startvärde blir det samma svar. Med olika startvärden kan algoritmen fastna i olika lösningar (startvärde 8 i labb 13).' },
      { id: 'c', text: 'Den ena körningen hittade de riktiga grupperna och den andra fel', feedback: 'Det finns inget facit vid klustring. Man kan jämföra summan av kvadratavstånd, men grupperna måste ändå tolkas.' },
    ],
    explanation: 'Klustring ger förslag på grupper. Resultatet beror på k och startvärde, och människor måste tolka det.',
  },
  {
    kind: 'choice',
    id: 'k3-beloning',
    prompt: 'En städrobot får +1 poäng för varje steg den kör. Efter träningen kör den in i en vägg om och om igen. Varför?',
    options: [
      { id: 'a', text: 'Den maximerar belöningen exakt som den är formulerad – att köra är värt poäng, att städa eller åka hem är det inte', correct: true },
      { id: 'b', text: 'Den har inte tränat tillräckligt länge', feedback: 'Mer träning gör bara roboten bättre på att samla stegpoäng. Problemet är belöningen, inte träningstiden.' },
      { id: 'c', text: 'Utforskningen gör att den beter sig slumpmässigt', feedback: 'Under ett prov med fryst modell finns ingen utforskning, och beteendet finns kvar. Det är inlärt.' },
    ],
    explanation: 'En agent lär sig det belöningen mäter, inte det vi menade (labb 14).',
  },
  {
    kind: 'choice',
    id: 'k3-dolt-lager',
    prompt: 'Varför kan ett nätverk med ett dolt lager lära sig XOR när en ensam neuron inte kan det?',
    options: [
      { id: 'a', text: 'Varje neuron drar en rak gräns. Med ett dolt lager kan flera raka gränser kombineras till en som inte är rak.', correct: true },
      { id: 'b', text: 'Nätverket har en bättre aktiveringsfunktion', feedback: 'Både neuronen och nätverket i labb 15 använder samma S-kurva. Skillnaden är antalet neuroner i följd.' },
      { id: 'c', text: 'Nätverket tränas längre', feedback: 'Den ensamma neuronen tränades lika länge och fastnade ändå på förlusten 0,25. Ingen rak linje räcker för XOR.' },
    ],
    explanation: 'Dolda lager låter nätverket bygga nya mellansteg av indata. Det är det som gör djupa nätverk kraftfulla.',
  },
];

export default check;
