import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'En dator kan inte läsa som vi. För att ett program ska kunna räkna med text måste texten först göras om till data: delar som går att jämföra och tal som går att räkna med. Det är första steget i nästan all [[nlp|språkbehandling]].',
    'Du skriver eller väljer en svensk text och jämför tre sätt att bearbeta den: [[token|tokenisering]], [[stemming]] och [[lemmatisering]]. Sedan räknar du ord i tre korta dokument och ser hur de blir [[ordvektor|ordvektorer]].',
  ],
  sections: [
    {
      heading: 'Tre steg från text till ord',
      blocks: [
        {
          type: 'table',
          caption: 'Tre sätt att bearbeta ord',
          head: ['Metod', 'Hur den fungerar', 'Exempel', 'Svaghet'],
          rows: [
            ['Tokenisering', 'Delar upp texten i token: ord, tal och skiljetecken', '”Hunden springer hem!” → Hunden · springer · hem · !', 'Böjda former av samma ord blir olika token'],
            ['Stemming', 'Klipper bort ändelser enligt fasta regler', 'hundarna → hund, springer → spring', 'Missar starka verb (sprang) och kan ge stammar som inte är ord (bättr)'],
            ['Lemmatisering', 'Slår upp grundformen i en ordlista', 'sprang → springa, böcker → bok', 'Ord som saknas i ordlistan faller igenom; vet inte vilken betydelse som avses'],
          ],
        },
        'Vilken metod som är bäst beror på uppgiften. En sökmotor vill gärna att *böcker* ska hitta *bok*. Men om du vill skilja på *läste* och *läser* för att se om något har hänt, då förlorar du information när formerna slås ihop.',
        { type: 'note', kind: 'forenklad', text: 'Labbens stemmer är en egen, förenklad regelsamling med 35 ändelser. Ordlistan är handgjord och **reducerad**: 54 grundformer och 168 böjningsformer. Riktiga svenska ordlistor innehåller hundratusentals former.' },
      ],
    },
    {
      heading: 'Från ord till tal: ordvektorer',
      blocks: [
        'När texten är uppdelad kan vi räkna. Varje olika term i dokumenturvalet blir en rad i en tabell – det kallas ordförrådet. Varje dokument blir en kolumn med tal: hur många gånger varje term förekommer. Den listan med tal är dokumentets ordvektor.',
        'Den här sortens representation kallas [[bag-of-words]]: orden läggs i en ”påse” och bara antalet räknas. Ordningen försvinner. ”Hunden jagar katten” och ”katten jagar hunden” får exakt samma vektor.',
        'Med ordformer har labbens tre dokument 21 olika termer. Med stammar blir det 18 och med lemman 17. Färre termer betyder att mer av likheten mellan dokumenten syns – ”Hunden” i A och ”hund” i C räknas som samma – men också att skillnader suddas ut.',
      ],
    },
    {
      heading: 'Var ordlistan tar slut',
      blocks: [
        'Ett ord som inte finns i ordlistan passerar oförändrat. Svenska har många sammansatta ord, så nya ord som *robotdammsugaren* dyker upp hela tiden. Därför kombinerar riktiga system ofta ordlistor med regler eller med modeller som har lärt sig av stora textmängder.',
        'Ordlistan vet inte heller vilken betydelse som avses. *Var* kan vara verbet *vara* eller frågeordet *var*. *Får* kan vara verbet *få* eller djuret. Att avgöra det kräver [[kontext]] – det undersöker du i [labb 18](/labb/samma-mening-flera-tolkningar/).',
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Stemmern och vektorerna i pseudokod',
      minutes: 10,
      prerequisites: 'labbens genomgång; ingen programmering krävs',
      blocks: [
        {
          type: 'pseudo',
          title: 'Labbens stemmer',
          code: `ändelser ← [heterna, …, arna, erna, orna, ande, …, ar, er, or, en, et, an, …, a, e, s]   (längsta först)
ord ← ordet med små bokstäver
för varje ändelse i ändelser:
    om ord slutar på ändelse och minst 3 bokstäver (med en vokal) blir kvar:
        returnera ord utan ändelse
returnera ord   (ingen regel passade)`,
        },
        {
          type: 'pseudo',
          title: 'Ordvektorer',
          code: `ordförråd ← alla olika termer i alla dokument, sorterade
för varje dokument d:
    vektor[d] ← en nolla per term i ordförrådet
    för varje term t i d:
        vektor[d][t] ← vektor[d][t] + 1`,
        },
        'För att jämföra två dokument kan man räkna hur mycket vektorerna överlappar. Labben visar *gemensamma förekomster*: för varje term tas det minsta av de två antalen, och sedan summeras det. Ett vanligare mått är cosinuslikhet, som också tar hänsyn till hur långa dokumenten är.',
        { type: 'formula', text: 'cosinuslikhet(a, b) = (a₁b₁ + a₂b₂ + … + aₙbₙ) / (|a| · |b|)', caption: 'Ger 1 när vektorerna pekar åt samma håll och 0 när dokumenten inte har någon term gemensam.' },
      ],
    },
  ],
  conclusion: [
    'Att göra text till data kräver val. Tokenisering bestämmer vad som räknas som en del. Stemming och lemmatisering bestämmer vilka former som ska räknas som samma ord. Ordvektorer gör texten till tal – men tappar ordningen.',
    'Varje val vinner något och förlorar något. I nästa labb använder du ordvektorer för att låta en enkel modell sortera meddelanden.',
  ],
});
