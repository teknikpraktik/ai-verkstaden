import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben introducerar övervakad inlärning och klassificering med en metod som går att följa helt med ögonen. Hyperparametern k och den avvikande punkten förbereder överanpassning och val av modell i labb 12.',
  tips: [
    'Låt eleverna skriva ned sin förutsägelse för k = 1 innan de går vidare. Många väljer päron eftersom ★ ”ser ut att ligga bland päronen”.',
    'Visa på projektor hur ön runt punkt 8 försvinner när k går från 1 till 3. Fråga: är punkt 8 ett udda äpple eller felsorterad? Hur skulle vi kunna ta reda på det?',
    'I experimentläget kan eleverna ta bort alla punkter eller lägga till egna. Låt dem bygga en låda där k = 1 och k = 5 ger olika svar för ★.',
    'Koppla till vardagen: rekommendationer (”personer som liknar dig gillade …”) bygger på liknande närhetsidéer.',
  ],
  misconceptions: [
    { myth: 'Modellen förstår vad ett äpple är.', reality: 'Den jämför bara två tal (bredd och höjd) med sparade exempel. Den vet ingenting om frukt.' },
    { myth: 'Större k är alltid bättre eftersom fler grannar får rösta.', reality: 'Med k = 14 blir allt äpple eftersom äpplena är flest. Modellen blir för enkel.' },
    { myth: 'Gränsen är en rak linje.', reality: 'k-NN kan ge krokiga gränser och till och med öar, särskilt med litet k.' },
    { myth: 'Data är alltid rätt sorterade.', reality: 'Etiketter sätts av människor och kan vara fel. Punkt 8 kan vara en felsortering – och modellen lär sig felet med k = 1.' },
  ],
  discussionStops: [
    'Efter steg 2: Varför byter ★ klass när k ändras, fast ingen frukt har flyttats?',
    'Efter den avvikande punkten: Ska man ta bort punkter som verkar konstiga? Vad kan gå förlorat om man tar bort riktiga men ovanliga fall?',
    'Efter stort k: Vad händer om den ena klassen är mycket vanligare än den andra (obalanserade data)?',
  ],
  answers: [
    { question: 'Förutsägelse: Vilken klass får ★ med k = 1?', answer: ['Äpple. Den närmaste frukten är punkt 8 (ett äpple) på 0,32 cm avstånd. Många gissar päron eftersom ★ ligger i ”päronområdet” – det visar att modellen bara bryr sig om den allra närmaste frukten när k = 1.'] },
    { question: 'Sätt k = 3. Vilken klass får ★?', answer: ['Päron: punkt 8 (äpple), punkt 9 (päron) och punkt 10 (päron) röstar, 2 mot 1.'] },
    { question: 'Med k = 2: vilken klass får ★?', answer: ['Äpple. Rösterna blir 1–1 och regeln säger att den närmaste grannen (punkt 8, 0,32 cm) avgör.'] },
    { question: 'Hur många av de fem närmaste grannarna är päron med k = 5?', answer: ['4 (punkt 9, 10, 13 och 12). Det femte är punkt 8, ett äpple.'] },
    { question: 'Varför blir allt äpple med k = 14?', answer: ['Alla 14 frukter röstar alltid, och 8 av dem är äpplen. Modellen svarar då med majoritetsklassen överallt.'] },
    {
      question: 'Öppen fråga: Vilket k skulle du välja och varför?',
      answer: [
        'Exempelresonemang: ”Jag väljer k = 3 eller 5. Med k = 1 blir det en ö runt punkt 8, så ett enda konstigt äpple påverkar svaret för frukter i närheten. Med k = 14 blir allt äpple och modellen slutar titta på formen. För att veta säkert skulle jag testa olika k på frukter som modellen inte har sett och välja det som blir rätt flest gånger.”',
        'Godta olika val av k om eleven motiverar med något observerbart. Det viktiga är att eleven ser både risken med för litet och för stort k.',
      ],
    },
  ],
});
