import { defineChapterTeacher } from '../../course/types';

export default defineChapterTeacher({
  lessons: [
    {
      title: 'Lektion 1: Vad är AI – och var kommer det ifrån?',
      minutes: 70,
      plan: [
        '10 min: Uppstart. Eleverna skriver tre saker de tror är AI. Samla på tavlan.',
        '20 min: Labb 1 *Är det AI?* i par i genomgångsläget. Stanna efter steg 3 och låt par som valt olika svar för gränsfallen argumentera.',
        '25 min: Labb 2 *Från expertregler till stora modeller*. Låt paren ordna milstolparna utan att söka på nätet först.',
        '10 min: Helklass: svampscenariot. Vilken säkerhet hade ni krävt?',
        '5 min: Tillbaka till listan från start – vilka saker skulle ni sortera om nu?',
      ],
    },
    {
      title: 'Lektion 2: Data, urval och vem som får fel',
      minutes: 70,
      plan: [
        '5 min: Påminnelse: vad skiljer ett lärande system från fasta regler? (Svar: reglerna kommer från data.)',
        '25 min: Labb 3 *Vad finns i datamängden?*. Gå igenom observation, egenskap och etikett gemensamt efter steg 2.',
        '25 min: Labb 4 *Vem får fel svar?*. Stanna efter steg 2 och skriv upp ”5 fel” – fråga vad det betyder utan nämnare.',
        '15 min: Kunskapskontrollen på kapitelsidan, enskilt. Gå igenom den öppna frågan i helklass.',
      ],
    },
    {
      title: 'Kortversion: en lektion på 60 minuter',
      minutes: 60,
      plan: [
        '15 min: Labb 1, bara steg 1–3 (sortering och gränsfall).',
        '20 min: Labb 3, steg 1–5 (begrepp, obalans och insamling från samma urval).',
        '20 min: Labb 4, steg 1–3 och 6 (felandel med nämnare och transparens).',
        '5 min: Exit ticket: frågan om felandel i kunskapskontrollen.',
      ],
    },
  ],
  checkAnswers: [
    { question: 'Vad avgör om mejlsorteringen är ett lärande system?', answer: ['Att reglerna har tagits fram ur exempel. Snabbhet och uppkoppling säger inget om det.'] },
    { question: 'Ansiktsupplåsningen: lärande system eller kombination?', answer: ['Båda är välmotiverade: igenkänningen är lärd från bilder, spärren efter felförsök är en fast regel.'] },
    { question: 'Varför kom genombrottet för bildigenkänning 2012?', answer: ['Mer märkt data (ImageNet) och snabbare beräkning med grafikkort. Neurala nätverk fanns redan.'] },
    { question: 'Etiketten i cykeltabellen', answer: ['”Behöver service (ja/nej)”. En rad är en observation; färg, växlar och ålder är egenskaper.'] },
    { question: 'Felandel i grupp B', answer: ['30 % (6 av 20). Grupp A: 5 % (10 av 200). Vanliga felsvar: 6 (antal), 5 (grupp A), cirka 7 (alla 16 av 220).'] },
    { question: 'Röstappen och skånsk dialekt', answer: ['Samla in inspelningar från Skåne och träna om. Mer data från Stockholm ändrar inte urvalet.'] },
    { question: 'Transparens', answer: ['Transparens gör det möjligt att granska men ersätter inte test per grupp.'] },
    {
      question: 'Öppen fråga: ”AI är objektivt, det är ju bara matte.”',
      answer: [
        'Exempelresonemang: ”Räkningen är matte, men vad modellen lär sig beror på vilken data människor har valt. I labben om handskrift tränades skannern bara på Norrby och läste 5 av 10 svar från Söderby fel, fast totalen bara var 10 %. Mer data från Norrby hjälpte inte – urvalet måste ändras. Och att man kunde se exakt hur modellen räknade betydde inte att man kunde lita på den.”',
        'Godtagbart svar: minst två av kriterierna med ett konkret exempel.',
      ],
    },
  ],
  notes: [
    'Alla dataset i kapitlet är syntetiska och scenarierna påhittade. Betona det, särskilt i labb 4 där två grupper jämförs.',
    'Labbarna sparar elevernas svar lokalt i webbläsaren. Om datorerna delas kan eleverna använda ”Börja om”.',
  ],
});
