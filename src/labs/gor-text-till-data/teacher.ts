import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben gör förbehandlingen av text konkret: eleverna ser att ”ord” inte är självklart för en dator och att varje val (tokenisering, stemming, lemmatisering) påverkar vilka tal texten blir. Ordvektorerna förbereder bag-of-words-klassificeraren i labb 17.',
  tips: [
    'Låt eleverna skriva egna meningar med starka verb och sammansatta ord. De hittar snabbt ord som faller igenom ordlistan.',
    'Visa ordvektortabellen på projektor och byt representation en gång i taget. Fråga vad som händer med antalet rader och varför.',
    'Knappen *Tvetydigt* är en bra brygga till labb 18: ordlistan väljer alltid samma tolkning av ”var” och ”får”.',
    'Experimentläget låter eleverna lägga till sin egen text som ett fjärde dokument och se vilka termer den delar med de andra.',
  ],
  misconceptions: [
    { myth: 'Datorn förstår att ”hunden” och ”hundarna” är samma ord.', reality: 'Utan bearbetning är de bara olika teckenföljder. Först efter stemming eller lemmatisering räknas de som samma term.' },
    { myth: 'Stemming och lemmatisering är samma sak.', reality: 'Stemming klipper ändelser med regler och kan ge stammar som inte är ord (bättr, böck). Lemmatisering slår upp grundformen i en ordlista men klarar bara ord som finns där.' },
    { myth: 'En ordlista löser allt.', reality: 'Okända ord faller igenom, och ordlistan vet inte vilken betydelse ett tvetydigt ord har.' },
    { myth: 'En ordvektor innehåller meningen.', reality: 'Den innehåller bara antal. Ordningen försvinner: ”hunden jagar katten” och ”katten jagar hunden” får samma vektor.' },
  ],
  discussionStops: [
    'Efter tokeniseringen: Borde skiljetecken räknas? När spelar ett frågetecken roll?',
    'Efter stemmingen: Hitta ett ord där stemmern klipper fel. Är det ett problem för en sökmotor?',
    'Efter vektorerna: Vad vinner man och vad förlorar man när ordförrådet krymper?',
  ],
  answers: [
    { question: 'Förutsägelse: Kommer datorn att räkna ”Hundarna” och ”Hunden” som samma ord?', answer: ['Bara om texten bearbetas först. Som token är de olika; efter stemming och lemmatisering blir båda *hund*. Elever som svarar ”ja” utgår ofta från sin egen språkförståelse.'] },
    { question: 'Hur många token blir starttexten?', answer: ['9: sju ord (Hundarna, sprang, till, skolan, Hunden, springer, hem) och två skiljetecken (. och !). Vanligt felsvar: 7 – eleven räknar bara orden.'] },
    { question: 'Varför får ”sprang” och ”springer” olika stammar?', answer: ['Stemming klipper bara ändelser. ”springer” − er = spring, men ”sprang” har ingen ändelse som matchar reglerna; vokalväxlingen inne i ordet syns inte för reglerna. Ordlistan ger däremot springa för båda.'] },
    { question: 'Vad händer med ett ord som inte finns i den reducerade ordlistan?', answer: ['Det passerar oförändrat (med små bokstäver) och märks ⚠. Det räknas alltså som en egen term även om en annan form av samma ord finns i texten.'] },
    { question: 'Välj Lemma. Hur många gånger förekommer termen ”hund” i dokument A?', answer: ['2 (”Hunden” och ”Hundarna”). Som ordform förekommer ”hund” 0 gånger i A. Ordförrådet: 21 ordformer, 18 stammar, 17 lemman.'] },
    {
      question: 'Förklara när stemming, lemmatisering och ren tokenisering ger olika resultat. Vilka begränsningar har den reducerade ordlistan?',
      answer: [
        'Exempelresonemang: ”sprang” och ”springer” är olika token och olika stammar (sprang, spring) men samma lemma (springa). ”böcker” blir stammen böck medan ”boken” blir bok, så stemmingen missar sambandet; ordlistan ger bok för båda. Ordlistan är liten, så ett ord som ”dammsög” faller igenom och räknas som ett eget ord. Den väljer också alltid samma tolkning av ”var” och ”får” fast de kan betyda olika saker. När fler former slås ihop blir ordförrådet mindre och fler ord delas mellan dokumenten, men skillnader som tempus försvinner.',
      ],
    },
  ],
});
