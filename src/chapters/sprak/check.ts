import type { QuestionSpec } from '../../components/lab/Questions';

/** Kunskapskontroll för kapitel 4. Facit och exempelresonemang finns i teacher.ts. */
const check: QuestionSpec[] = [
  {
    kind: 'numeric',
    id: 'sprak-token',
    prompt: 'Texten ”Katten sover. Hunden springer!” delas upp i token så att varje ord och varje skiljetecken blir en token. Hur många token blir det?',
    answer: 6,
    wrong: [
      { value: 4, feedback: '4 är antalet ord. Punkten och utropstecknet räknas också som token.' },
      { value: 5, feedback: 'Nästan – kontrollera att du har räknat båda skiljetecknen.' },
    ],
    hint: 'Räkna orden och skiljetecknen var för sig och lägg ihop.',
    explanation: 'Fyra ord (Katten, sover, Hunden, springer) och två skiljetecken (. och !) ger 6 token.',
  },
  {
    kind: 'choice',
    id: 'sprak-stem-lemma',
    prompt: 'Vilket påstående om stemming och lemmatisering stämmer?',
    options: [
      { id: 'a', text: 'Lemmatisering kan ge ”springa” för både ”sprang” och ”springer”, men bara om orden finns i ordlistan', correct: true },
      { id: 'b', text: 'Stemming ger alltid riktiga ord', feedback: 'Stemming klipper ändelser med regler och kan ge stammar som inte är ord, som ”bättr” av ”bättre”.' },
      { id: 'c', text: 'Stemming och lemmatisering ger alltid samma resultat', feedback: 'De skiljer sig ofta: ”böcker” blir stammen ”böck” men lemmat ”bok”.' },
      { id: 'd', text: 'En ordlista klarar alla ord, även nya sammansättningar', feedback: 'Ord som saknas i ordlistan faller igenom oförändrade. Svenska bildar hela tiden nya sammansatta ord.' },
    ],
    explanation: 'Lemmatisering slår upp grundformen och klarar starka verb, men bara för ord som finns i ordlistan. Stemming klarar alla ord men bara med enkla regler för ändelser.',
  },
  {
    kind: 'choice',
    id: 'sprak-bow-ordning',
    prompt: 'En bag-of-words-modell klassar ”Mötet är inställt” som Viktigt. Vad händer troligast med ”Mötet är inte inställt”?',
    options: [
      { id: 'a', text: 'Beslutet blir nästan detsamma, eftersom modellen bara räknar orden och inte ser vad ”inte” hör till', correct: true },
      { id: 'b', text: 'Modellen byter alltid beslut när ”inte” läggs till', feedback: 'Modellen förstår inte negation. ”inte” får bara ett bidrag utifrån hur ofta det fanns i varje klass i träningsdata.' },
      { id: 'c', text: 'Modellen kan inte klassa meningar med ”inte”', feedback: 'Den kan klassa alla meningar. ”inte” behandlas som vilket ord som helst.' },
    ],
    explanation: 'Bag-of-words ignorerar ordningen. Om ”inte” är ungefär lika vanligt i båda klasserna ändras poängen knappt.',
  },
  {
    kind: 'choice',
    id: 'sprak-okant',
    prompt: 'En textklassificerare av typen naiv Bayes får ett meddelande där inget ord fanns i träningsdata. Vad avgör då beslutet?',
    options: [
      { id: 'a', text: 'Bara hur vanliga klasserna var i träningsdata – orden ger inga bidrag', correct: true },
      { id: 'b', text: 'Modellen gissar betydelsen utifrån stavningen', feedback: 'Okända ord hoppas över helt. Modellen har inga räknade antal för dem.' },
      { id: 'c', text: 'Meddelandet klassas alltid som skräp', feedback: 'Det finns ingen sådan regel. Utan kända ord finns bara förhandsläget kvar.' },
    ],
    explanation: 'Okända ord ger inget bidrag. Kvar finns förhandsläget; om klasserna var lika vanliga blir det oavgjort.',
  },
  {
    kind: 'choice',
    id: 'sprak-moderering',
    multiple: true,
    prompt: 'Ett skolforum stoppar alla kommentarer som innehåller ordet ”slå”. Vilka påståenden stämmer?',
    options: [
      { id: 'a', text: 'En elev som frågar hur man slår upp ord kan få sin kommentar stoppad', correct: true },
      { id: 'b', text: 'En elev som citerar ett hot för att anmäla det kan bli tystad', correct: true },
      { id: 'c', text: 'Regeln stoppar alla hot', feedback: 'Hot utan ordet ”slå”, som ”Du vet vad som händer efter skolan”, passerar.' },
      { id: 'd', text: 'Eftersom regeln är enkel blir den rättvis för alla', feedback: 'En enkel regel kan ändå drabba vissa grupper mer än andra, till exempel den som anmäler eller den som använder vanliga uttryck.' },
    ],
    explanation: 'En nyckelordsregel ser inte sammanhanget. Den stoppar ofarliga kommentarer och missar hot utan nyckelord – och felen drabbar olika personer.',
  },
  {
    kind: 'choice',
    id: 'sprak-nasta-token',
    prompt: 'I en liten korpus följs ”en” av ”bok” 3 gånger, ”katt” 2 gånger och ”text” 1 gång. Vilket påstående stämmer för en bigrammodell?',
    options: [
      { id: 'a', text: 'Sannolikheten för ”bok” efter ”en” är 3/6 = 50 %, och girig generering väljer alltid ”bok”', correct: true },
      { id: 'b', text: 'Sannolikheten för ”bok” är 3/3 = 100 % eftersom ”bok” är vanligast', feedback: 'Sannolikheten är andelen av alla gånger något följer på ”en”: 3 av 6.' },
      { id: 'c', text: 'Modellen väljer det ord som passar bäst i hela meningen', feedback: 'En bigrammodell ser bara det senaste ordet. Den vet inget om resten av meningen.' },
    ],
    explanation: '3 av 6 = 50 %. Girig generering väljer alltid det mest sannolika ordet; slumpad generering väljer ibland ”katt” eller ”text”.',
  },
  {
    kind: 'open',
    id: 'sprak-llm',
    prompt: 'Förklara med egna ord vad en liten bigrammodell och en stor språkmodell har gemensamt och vad som skiljer dem åt. Använd ”Jag såg mannen med kikaren” som exempel.',
    criteria: [
      'Förklarar att båda förutsäger nästa token utifrån sannolikheter lärda från text.',
      'Nämner storleksskillnaden (räknade ordpar mot miljarder parametrar, liten mot enorm textmängd) utan att hitta på exakta siffror.',
      'Förklarar att stora modeller använder mycket längre sammanhang, vilket hjälper vid tvetydighet.',
      'Nämner att även stora modeller kan välja fel tolkning eller skriva felaktigheter.',
    ],
  },
];

export default check;
