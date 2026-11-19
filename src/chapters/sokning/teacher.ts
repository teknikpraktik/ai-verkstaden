import { defineChapterTeacher } from '../../course/types';

export default defineChapterTeacher({
  lessons: [
    {
      title: 'Lektion 1: Agenter och grafer',
      minutes: 70,
      plan: [
        '10 min: Inledning – vad är en agent? Låt eleverna ge exempel från vardagen (robotdammsugare, navigationsapp, spel).',
        '20 min: Labb 5 Programmera en städrobot i par, genomgångsläget.',
        '10 min: Gemensam genomgång av jämförelsen slump mot regler och vad sikten betyder.',
        '20 min: Labb 6 Bygg en graf. Rita sökträdet till djup 2 på tavlan innan eleverna öppnar det.',
        '10 min: Avslutning: vad är skillnaden mellan sökträd och graf med besökta noder?',
      ],
    },
    {
      title: 'Lektion 2: Sökalgoritmer',
      minutes: 70,
      plan: [
        '5 min: Repetition av graf, start, mål och kostnad.',
        '25 min: Labb 7 Bredden först och djupet först. Stega de första stegen gemensamt.',
        '30 min: Labb 8 Sök med kostnad och ledtråd. Låt eleverna räkna f för Sjövik och Granberga för hand.',
        '10 min: Diskussion: när är en girig sökning bra nog? Varför måste h vara konsistent i labbens A*?',
      ],
    },
    {
      title: 'Lektion 3: Spelande agenter och kunskapskontroll',
      minutes: 60,
      plan: [
        '25 min: Labb 9 Tre i rad mot en agent. Låt eleverna försöka lura regelagenten med fällan med två hörn.',
        '10 min: Gemensam genomgång av beslutsträdet – fyll i minimaxvärden på tavlan.',
        '20 min: Kapitlets kunskapskontroll individuellt; den öppna frågan diskuteras i par efteråt.',
        '5 min: Koppla ihop: alla labbar handlar om att söka bland möjliga handlingar.',
      ],
    },
  ],
  checkAnswers: [
    { question: 'Agenten minns vilka rutor den kontrollerat – vilken del är det?', answer: ['Tillstånd. Vanligt felsvar är sensorinformation; påminn om att sensorerna bara visar läget just nu.'] },
    { question: 'Varför håller en grafsökning reda på besökta noder?', answer: ['För att inte undersöka samma nod flera gånger och inte fastna i cykler. I labb 6 har sökträdet till djup 3 20 noder medan grafsökningen besöker 5.'] },
    { question: 'Skillnaden mellan BFS och DFS?', answer: ['Kö (först in, först ut) mot stack (sist in, först ut). Resten av algoritmen är densamma.'] },
    { question: 'Hur mycket billigare är den billigaste vägen (30 + 30 + 40 mot 30 + 80)?', answer: ['10 (100 mot 110). Exemplet kommer från labb 6.'] },
    { question: 'Varför kan girig bäst-först hitta en dyrare väg än A*?', answer: ['Den sorterar bara efter h. I labb 8 kostar den giriga vägen 450 mot 375 eftersom Sjövik ligger nära målet fågelvägen men vägen går runt sjön.'] },
    { question: 'När hittar labbens A* säkert en billigaste väg?', answer: ['Positiva kostnader och konsistent h. Tillåten h räcker inte för en implementation som aldrig öppnar besökta noder igen (motexempel: ”Lurig ledtråd”, 9 i stället för 7).'] },
    { question: 'Vad antar minimax om motståndaren?', answer: ['Att motståndaren väljer det som är sämst för agenten, alltså spelar så bra som möjligt.'] },
    {
      question: 'Jämför två av kapitlets sökningar.',
      answer: [
        'Exempel: Uniformkostnadssökning tar alltid ut noden med lägst g och garanterar billigaste väg vid positiva kostnader, men undersöker åt alla håll (8 orter i labb 8). A* tar ut lägst f = g + h och hittar också billigaste vägen när h är konsistent, men behöver bara undersöka 6 orter eftersom h styr bort från orter åt fel håll.',
      ],
    },
  ],
  notes: [
    'Labb 7 (BFS/DFS) ingår i kapitlet och används i lektion 2.',
    'Alla labbar fungerar med tangentbord. Grafen i labb 6 byggs med formulär, inte genom att dra.',
  ],
});
