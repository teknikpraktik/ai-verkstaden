import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben ger eleverna ett gemensamt språk för data (observation, egenskap, etikett) och visar att urvalet avgör vad en modell kan lära sig. Den förbereder labb 4 där samma princip ger fler fel för en grupp.',
  tips: [
    'Visa tabellen på projektor och låt eleverna peka ut en observation, en egenskap och en etikett innan de börjar.',
    'Låt eleverna slå på ”Visa bilden som tal” och fråga: hur många tal skulle en bild från din mobil bli?',
    'I experimentläget kan eleverna ta bort alla äpplen. Fråga vad en modell skulle lära sig av en tom datamängd – eller av en där alla har samma etikett.',
    'Ändra etiketten på ett äpple och diskutera: vad händer med modellen om kontrollanten är trött en dag?',
  ],
  misconceptions: [
    { myth: 'Mer data gör alltid modellen bättre.', reality: 'Fler äpplen från gård A ger fortfarande 0 gröna. Mer data från samma urval ger samma skeva bild.' },
    { myth: 'Etiketten är en egenskap som alla andra.', reality: 'Etiketten är svaret modellen ska lära sig. Den sätts ofta av en människa och kan vara fel.' },
    { myth: 'Bilder och text är inte data.', reality: 'Allt som kan göras om till tal kan användas som data. En bild är ett rutnät av tal.' },
  ],
  discussionStops: [
    'Efter steg 3: Vilken form av data är lättast för en människa att förstå? Vilken är lättast för en dator?',
    'Efter steg 5: Var din förutsägelse rätt? Varför trodde många att det skulle komma gröna äpplen?',
    'Efter steg 6: Ge ett exempel från verkligheten där data har samlats in från ”samma gård” – till exempel bara från vissa åldrar, platser eller språk.',
  ],
  answers: [
    { question: 'Förutsägelse: Hur många gröna äpplen efter 20 nya från gård A?', answer: ['Inga. Gård A odlar bara röda äpplen (i den påhittade datan).'] },
    { question: 'Vad är etiketten för äpple nr 8?', answer: ['”Kasseras”. 4 fläckar är en egenskap och hela raden är en observation.'] },
    { question: 'Vilket påstående stämmer om de tre formerna?', answer: ['I tabellen står antalet fläckar direkt; i bilden måste de hittas bland 64 pixeltal. Vikten (133 g) finns exakt bara i tabellen och gården syns inte i bilden.'] },
    { question: 'Hur stor andel kasseras?', answer: ['15 % (3 av 20). Vanliga felsvar: 3 (antal) och 85 (andelen godkända).'] },
    { question: 'Hur många gröna äpplen efter insamlingen från gård A?', answer: ['0. Datamängden har nu 40 äpplen och 6 kasserade (15 %). Med 20 från gård B blir det i stället 11 gröna och 3 gula.'] },
    {
      question: 'Öppen fråga: Förklara för chefen varför fler äpplen från gård A inte räcker.',
      answer: [
        'Exempelresonemang: ”Varje äpple i tabellen är en observation. Vikt, färg och fläckar är egenskaper och ’godkänd/kasseras’ är etiketten som modellen ska lära sig. Alla 20 observationer har egenskapen ’röd’, så modellen vet inte hur ett grönt äpple ser ut. När vi samlade in 20 till från gård A var det fortfarande 0 gröna av 40. Vi behöver äpplen från gårdar med andra sorter, och någon måste sätta etiketter på dem.”',
      ],
    },
  ],
});
