import { defineChapterTeacher } from '../../course/types';

export default defineChapterTeacher({
  lessons: [
    {
      title: 'Lektion 1: Robotens styrslinga och karta',
      minutes: 60,
      plan: [
        '5 min: Uppstart – vilka robotar har eleverna sett (robotdammsugare, gräsklippare, kassaautomat med kamera)? Vad mäter de?',
        '20 min: Labb 19 Styr en robot. Gemensam start på projektor (steg 1–2), sedan i par. Diskussionsstopp efter gränsen 0: var låg felet?',
        '25 min: Labb 20 Hitta fram när kartan förändras. Visa pallscenariot gemensamt och stanna vid ”Stopp”. Paren gör resten och jämför räckvidd 1–3.',
        '10 min: Sammanfattning: känn av – bestäm – handla, och karta mot verklighet. Exit-fråga: ge ett exempel på när en karta blir fel.',
      ],
    },
    {
      title: 'Lektion 2: Välj robot och mänsklig tillsyn',
      minutes: 60,
      plan: [
        '5 min: Repetition med kunskapskontrollens fråga om kedjan.',
        '25 min: Labb 21 Välj robot för ett uppdrag. Läs reglerna tillsammans. Grupperna tar lager, jordbruk eller omsorg i experimentläget och söker den robot som klarar alla förhållanden med minst personaltid utan säkerhetsrisk.',
        '15 min: Redovisning med regelhänvisningar. Fördjupa omsorgsfallet: vad ska alltid göras av människor? Vem bär ansvaret?',
        '15 min: Kunskapskontrollen för kapitlet, individuellt. Den öppna frågan kan bli hemuppgift.',
      ],
    },
  ],
  checkAnswers: [
    { question: 'Robotdammsugaren krockar trots korrekt mätvärde – var ligger felet?', answer: ['I styrprogrammet. Ett korrekt mätvärde som ger fel handling betyder att regeln brister (jämför gränsen 0 i labb 19).'] },
    { question: 'Vad händer med gränsen 2 i stället för 1 när sensorn har brus?', answer: ['Färre krockar men roboten svänger tidigare och kommer inte lika nära väggarna (labb 19: 0 mot 3 krockar, 19 mot 21 städade rutor).'] },
    { question: 'Planerad väg 6 steg, hinder efter 2 steg, ny väg 9 steg – hur många steg totalt?', answer: ['11 = 2 + 9. Vanliga felsvar: 9 (bara nya vägen), 15 (6 + 9) och 6 (första planen).'] },
    { question: 'Vilket påstående om en robots karta stämmer?', answer: ['Kartan är robotens bild av världen och kan vara inaktuell; sensorerna behövs för att upptäcka skillnader. A* ger kortaste väg på kartan, inte nödvändigtvis i verkligheten.'] },
    { question: 'Rimliga beteenden när den enda vägen är blockerad?', answer: ['Stanna säkert och larma en människa med position och vad som blockerar. Inte köra slumpmässigt eller knuffa bort hindret.'] },
    { question: 'Viktigaste kravet på en robot på ett äldreboende?', answer: ['Att den stannar för människor nära den (närhetssensor) och larmar personal direkt när någon behöver hjälp. Trygghet och värdighet går före sparad personaltid.'] },
    {
      question: 'Öppen fråga: sensorer, svikt och övertagande för en egen robot.',
      answer: [
        'Exempel: En robotgräsklippare behöver en stötsensor (känner när den kör på något), en lutningssensor (stannar kniven om den lyfts) och gärna en kamera för att upptäcka igelkottar och leksaker. Kameran blir osäker i skymning och mörker. Därför bör den inte köra på natten, och om någon lyfter den eller ett barn kommer nära ska kniven stanna och ägaren få en signal.',
        'Bedöm: två sensorer med funktion, ett konkret förhållande där en sensor sviker och ett motiverat villkor för mänskligt övertagande.',
      ],
    },
  ],
  notes: [
    'Alla tre labbar är förenklade simuleringar med påhittade miljöer. Betona att principerna (styrslinga, karta mot verklighet, mänsklig tillsyn) gäller verkliga robotar, men inte siffrorna.',
    'Labb 21 knyter an till kapitel 6: ansvar, transparens och mänsklig tillsyn. Omsorgsfallet passar som brygga.',
  ],
});
