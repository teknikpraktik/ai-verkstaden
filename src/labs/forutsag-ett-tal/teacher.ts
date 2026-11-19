import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben gör regression, residualer och medelkvadratfel konkreta och visar att ”lägst fel på träningsdata” inte betyder ”bra överallt”. Extrapoleringen förbereder resonemangen om generalisering och testdata i labb 12.',
  tips: [
    'Börja gemensamt: låt klassen gissa en linje på tavlan och räkna residualen för 28 °C tillsammans.',
    'Låt eleverna tävla om lägst MSE med reglagen innan den anpassade linjen visas. Det bästa reglagen kan nå är 10,4 (nivå 58, lutning 6).',
    'Uppmana eleverna att ändra ett reglage i taget och beskriva vad som händer med residualerna.',
    'Koppla extrapoleringen till verkliga exempel: prognoser för saker som aldrig hänt förut, eller en modell tränad på sommardata som används på vintern.',
  ],
  misconceptions: [
    { myth: 'Bästa linjen går genom så många punkter som möjligt.', reality: 'Minsta-kvadrat-linjen behöver inte gå genom någon punkt alls. Den minimerar summan av kvadrerade residualer.' },
    { myth: 'Positiva och negativa residualer tar ut varandra, så felet är litet.', reality: 'Därför kvadrerar man. Medelvärdet av residualerna för den anpassade linjen är 0 – men MSE är 10,0.' },
    { myth: 'En modell med lågt fel kan användas överallt.', reality: 'Den anpassade linjen har MSE 10,0 på träningsdata men ungefär 1027 på de nya dagarna utanför området.' },
  ],
  discussionStops: [
    'Efter steg 2: Varför kvadrerar man residualerna i stället för att bara lägga ihop dem?',
    'Efter jämförelsen: Datorn hittar en bättre linje än vi. Betyder det att datorn ”förstår” glassförsäljning?',
    'Efter extrapoleringen: Hur kunde kiosken ha upptäckt problemet innan de beställde glass för en värmebölja?',
  ],
  answers: [
    { question: 'Förutsägelse: Vad händer med MSE om linjen får luta uppåt?', answer: ['Det blir lägre (om lutningen inte blir alldeles för brant). Försäljningen ökar tydligt med temperaturen, så en platt linje missar mycket både kalla och varma dagar.'] },
    { question: 'Vad är residualen för 28 °C med startlinjen?', answer: ['44 (104 − 60). Vanliga fel: −44 (förutsagt − verkligt), 104 (bara det verkliga värdet) och 1936 (residualen i kvadrat).'] },
    { question: 'Hur mycket växer bidraget till MSE när en residual dubblas?', answer: ['Fyra gånger, eftersom (2r)² = 4r².'] },
    { question: 'Vad är MSE för den anpassade linjen?', answer: ['10,0 (lutning 5,9 glassar per grad, nivå 58,5 vid 20 °C).'] },
    { question: 'Kan man hitta en linje med lägre MSE på träningsdatan?', answer: ['Nej. Minsta kvadratmetoden ger exakt den raka linje som har lägst MSE. En krokig kurva genom alla punkter skulle kunna få lägre fel, men den skulle lära sig bruset.'] },
    { question: 'Vad förutsäger den anpassade linjen för 5 °C?', answer: ['Ungefär −30 (−29,7) glassar. Kiosken sålde i själva verket 4. Vid 36 °C förutsäger linjen 152,7 men kiosken rymmer bara 120.'] },
    {
      question: 'Öppen fråga: Vilka råd ger du kiosken?',
      answer: [
        'Exempelresonemang: ”Linjen har medelkvadratfel 10 på träningsdagarna, så den ligger i snitt ungefär 3 glassar fel där. Men den bygger bara på dagar mellan 14 och 28 grader. Om ni använder den vid 5 grader får ni negativa glassar, och vid värmebölja säger den mer än kiosken rymmer. Samla data från fler årstider och lägg in att försäljningen inte kan bli under 0 eller över 120.”',
      ],
    },
  ],
});
