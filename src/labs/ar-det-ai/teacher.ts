import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Kursens första labb. Den ger eleverna ett sätt att skilja fasta regler från lärande system, visar att verkliga system ofta är blandningar och introducerar frågan om vad modeller saknar jämfört med människor.',
  tips: [
    'Börja med att låta eleverna nämna system de tror är AI. Skriv upp dem och återkom till listan efter labben.',
    'Gränsfallen är labbens poäng. Låt elever som har valt olika svar för ansiktsupplåsningen argumentera för sina val.',
    'I experimentläget kan eleverna skriva egna meddelanden till skräppostfiltret. Utmana dem att lura filtret åt båda hållen.',
  ],
  misconceptions: [
    { myth: 'Allt som har en sensor eller kopplas till internet är AI.', reality: 'Den automatiska dörren har en sensor men följer en fast regel. Det som avgör är om reglerna har lärts från data.' },
    { myth: 'Ett system är antingen AI eller inte.', reality: 'Många system blandar lärda modeller med fasta regler. Svaret beror på vilken del man tittar på.' },
    { myth: 'Ett lärande system förstår vad det gör.', reality: 'Skräppostfiltret lägger ihop ordpoäng. Det stoppar mentorns mejl utan att förstå vem som skrev det.' },
  ],
  discussionStops: [
    'Efter steg 3: Vilka system var ni oense om? Var båda svaren välmotiverade?',
    'Efter steg 5: Skulle ett filter som tränats på miljoner mejl också ha stoppat mentorns mejl? Vad kunde det ha använt för fler ledtrådar?',
    'Efter steg 6: Vilka av de fyra förmågorna tror ni att framtida AI kommer att få – och vilka är svårast?',
  ],
  answers: [
    {
      question: 'Sortering av de nio systemen',
      answer: [
        {
          type: 'table',
          caption: 'Välmotiverade svar',
          head: ['System', 'Välmotiverat'],
          rows: [
            ['Termostaten, miniräknaren, trafikljuset, den automatiska dörren', 'Fasta regler'],
            ['Musiktjänstens låtförslag', 'Lärande system'],
            ['Kartappens vägförslag', 'Kombination'],
            ['Skräppostfiltret, ansiktsupplåsningen', 'Lärande system eller kombination'],
            ['Rättstavningen', 'Fasta regler eller kombination'],
          ],
        },
        'Förutsägelsen: fem av de nio lär sig av data helt eller delvis (skräppost, musik, ansikte, karta och – beroende på version – rättstavning). Svaret 3–5 är alltså rimligt.',
      ],
    },
    { question: 'Hur många system har mer än ett välmotiverat svar?', answer: ['3: skräppostfiltret, ansiktsupplåsningen och rättstavningen. Felsvaret 9 kommer av att man räknar alla system som har något välmotiverat svar.'] },
    { question: 'Varför släpper filtret igenom skräpposten på engelska?', answer: ['Inga av de sex orden finns i träningsmeddelandena. Alla får poäng 0, summan blir 0 och filtret släpper igenom. Det visar bristande generalisering.'] },
    { question: 'Vilken förmåga saknade filtret när det stoppade mentorns mejl?', answer: ['Förståelse av sammanhanget. ”Klicka” (+3), ”här” (+2) och ”för” (−1) ger poängen 4, alltså skräp.'] },
    {
      question: 'Öppen fråga: En situation där en människa skulle bedöma annorlunda',
      answer: [
        'Exempelresonemang: ”Musiktjänsten är ett lärande system. När jag har lyssnat på sorgsen musik inför en begravning fortsätter den att föreslå sorgsna låtar i veckor. En människa skulle förstå situationen och veta att det var ett undantag. Tjänsten har bara erfarenhet av vad jag har lyssnat på, inte av varför.”',
      ],
    },
  ],
});
