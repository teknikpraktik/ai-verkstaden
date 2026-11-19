import { defineChapterTeacher } from '../../course/types';

export default defineChapterTeacher({
  lessons: [
    {
      title: 'Lektion 1: Lära av exempel (labb 10 och 11)',
      minutes: 70,
      plan: [
        '10 min: Uppstart. Hur skulle du sortera äpplen och päron om du bara fick mäta dem? Samla förslag på tavlan.',
        '20 min: Labb 10 i par i genomgångsläget. Stoppa efter steg 2 och diskutera varför ★ byter klass.',
        '20 min: Labb 11. Låt paren tävla om lägst MSE med reglagen innan den anpassade linjen visas.',
        '10 min: Gemensam genomgång av extrapolering: när kan en bra modell ge orimliga svar?',
        '10 min: Exit ticket: förklara skillnaden mellan klassificering och regression med ett eget exempel.',
      ],
    },
    {
      title: 'Lektion 2: Ärlig utvärdering (labb 12 och 13)',
      minutes: 80,
      plan: [
        '10 min: Liknelse: läxor, övningsprov och riktigt prov. Vad händer om man får se det riktiga provet i förväg?',
        '30 min: Labb 12. Alla låser sitt val innan testet visas. Diskutera varför testresultatet blev lägre än valideringen.',
        '10 min: Helklass: förväxlingsmatrisen. När är missade sjuka plantor värre än falsklarm? Koppla till medicinska tester.',
        '20 min: Labb 13. Låt halva klassen köra startvärde 1 och halva startvärde 8 och jämför.',
        '10 min: Diskussion: vem bestämmer vad grupperna betyder, och vad kan gå fel när människor delas in i grupper?',
      ],
    },
    {
      title: 'Lektion 3: Agenter och nätverk (labb 14 och 15) samt kunskapskontroll',
      minutes: 80,
      plan: [
        '20 min: Labb 14. Räkna första Q-uppdateringen gemensamt, låt sedan eleverna träna, frysa och prova.',
        '10 min: Diskussion om dåligt formulerade belöningar med egna exempel (klick, poäng, visningstid).',
        '30 min: Labb 15. Ge eleverna några minuter att försöka klara XOR med en neuron innan nätverket visas.',
        '20 min: Kapitlets kunskapskontroll individuellt, därefter genomgång av de frågor flest svarade fel på.',
      ],
    },
  ],
  checkAnswers: [
    { question: 'Glasskiosken: vilken typ av uppgift?', answer: ['Regression – modellen förutsäger ett tal utifrån exempel med facit. Klassificering väljer kategori, klustring saknar facit och förstärkningsinlärning bygger på belöning.'] },
    { question: 'k-NN med k = 1 får 100 % på träningsdata. Vad säger det?', answer: ['Ingenting om nya exempel. Varje träningspunkt är sin egen närmaste granne. I labb 12 gav k = 1 100 % på träning men 80 % på validering (överanpassning).'] },
    { question: 'Vilken del av datan används för att välja k?', answer: ['Valideringsdata. Testdata används en gång efter valet; träningsdata gynnar alltid k = 1.'] },
    { question: 'Hur många sjuka plantor missades (TP 8, FN 3, FP 2, TN 22)?', answer: ['3 (falskt negativa). Vanliga fel: 2 (falskt positiva), 5 (alla fel), 8 (hittade sjuka).'] },
    { question: 'Samma bilder i träning och test – vad kallas problemet?', answer: ['Dataläckage. Testet mäter minne i stället för förmåga och resultatet blir för optimistiskt.'] },
    { question: 'k-means ger olika grupper med olika startvärden – vad stämmer?', answer: ['Det är normalt; algoritmen kan fastna i olika lösningar. Samma startvärde ger samma resultat. Jämför flera körningar och tolka grupperna.'] },
    { question: 'Städroboten med +1 per steg kör in i väggen – varför?', answer: ['Den maximerar belöningen som den är formulerad. Att stanna ute ger mer poäng än att åka hem. Det är ett exempel på oavsiktlig följd av en dåligt formulerad belöning.'] },
    { question: 'Varför klarar ett dolt lager XOR?', answer: ['En neuron drar en rak gräns. Med ett dolt lager kombineras flera raka gränser (t.ex. ELLER och INTE-OCH) till en gräns som skiljer ut XOR.'] },
  ],
  notes: [
    'Alla data i kapitlet är syntetiska och slumpade med fasta startvärden, så alla elever får samma siffror. Det underlättar gemensamma genomgångar.',
    'Labb 12 är kapitlets metodkärna. Om tiden är knapp: prioritera labb 10, 12 och 15.',
    'Experimentlägena innehåller extra uppgifter för elever som blir klara tidigt, till exempel egna belöningsregler i labb 14 och startvärde 4 i labb 15.',
  ],
});
