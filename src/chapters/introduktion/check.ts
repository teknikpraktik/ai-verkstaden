import type { QuestionSpec } from '../../components/lab/Questions';

/** Kunskapskontroll för kapitel 1. Facit och exempelresonemang finns i teacher.ts. */
const check: QuestionSpec[] = [
  {
    kind: 'choice',
    id: 'k1-larande',
    prompt: 'En skola köper ett system som sorterar inkommande mejl. Vad avgör om det är ett lärande system?',
    options: [
      { id: 'a', text: 'Att reglerna har tagits fram ur exempel i stället för att skrivas av en människa', correct: true },
      { id: 'b', text: 'Att det är snabbt och sorterar tusentals mejl per sekund', feedback: 'Snabbhet säger inget om hur reglerna kom till. En miniräknare är snabb men följer fasta regler.' },
      { id: 'c', text: 'Att det är kopplat till internet', feedback: 'Många regelbaserade system är uppkopplade. Det avgörande är om systemet har lärt sig av data.' },
    ],
    explanation: 'Ett lärande system har fått sina regler från mönster i data. Om det också har fasta regler, till exempel en lista över blockerade avsändare, är det en kombination.',
  },
  {
    kind: 'choice',
    id: 'k1-gransfall',
    prompt: 'Två elever är oense: är ansiktsupplåsningen ett lärande system eller en kombination? Vilket påstående stämmer bäst?',
    options: [
      { id: 'a', text: 'Båda kan ha rätt – igenkänningen är lärd, men spärren efter flera felförsök är en fast regel', correct: true },
      { id: 'b', text: 'Bara den ena kan ha rätt, eftersom varje system hör till exakt en kategori', feedback: 'Verkliga system är ofta byggda av flera delar. Ett bra svar säger vilken del man syftar på.' },
      { id: 'c', text: 'Ingen har rätt – det är fasta regler eftersom mobilen följer sitt program', feedback: 'Allt i en dator är program, men programmet för ansiktsigenkänning har tagits fram genom träning på bilder.' },
    ],
    explanation: 'Gränsfall har flera välmotiverade svar. Det viktiga är motiveringen.',
  },
  {
    kind: 'choice',
    id: 'k1-alexnet',
    prompt: 'Neurala nätverk fanns redan på 1990-talet. Varför kom det stora genombrottet för bildigenkänning först 2012?',
    options: [
      { id: 'a', text: 'Det fanns mycket mer märkt data och snabbare beräkning med grafikkort', correct: true },
      { id: 'b', text: 'Någon kom på neurala nätverk det året', feedback: 'Idén är mycket äldre. Det nya var att det fanns data och beräkningskraft nog att träna stora nätverk.' },
      { id: 'c', text: 'Expertsystemen hade lärt sig att känna igen bilder', feedback: 'Expertsystem bygger på handskrivna regler och användes framför allt på 1970- och 80-talen.' },
    ],
    explanation: 'AlexNet tränades på ImageNet med över en miljon märkta bilder, på grafikkort.',
  },
  {
    kind: 'choice',
    id: 'k1-begrepp',
    prompt: 'I en tabell över skolans cyklar finns kolumnerna ”färg”, ”antal växlar”, ”ålder i år” och ”behöver service (ja/nej)”. En modell ska förutsäga servicebehovet. Vad är etiketten?',
    options: [
      { id: 'a', text: '”Behöver service (ja/nej)”', correct: true },
      { id: 'b', text: 'En rad i tabellen', feedback: 'En rad är en observation – en cykel. Etiketten är den kolumn som modellen ska lära sig att förutsäga.' },
      { id: 'c', text: '”Ålder i år”', feedback: 'Åldern är en egenskap som modellen kan använda för att förutsäga etiketten.' },
    ],
    explanation: 'Observation = en cykel, egenskaper = färg, växlar och ålder, etikett = servicebehovet.',
  },
  {
    kind: 'numeric',
    id: 'k1-felandel',
    prompt: 'En modell testas på 200 personer från grupp A och gör 10 fel. Den testas på 20 personer från grupp B och gör 6 fel. Hur stor är felandelen i grupp B, i procent?',
    unit: '%',
    answer: 30,
    wrong: [
      { value: 6, feedback: '6 är antalet fel. Dela med nämnaren – antalet testade i grupp B (20).' },
      { value: 5, feedback: '5 % är felandelen i grupp A (10 av 200). Frågan gäller grupp B.' },
      { value: 7, feedback: 'Ungefär 7 % får du om du räknar alla 16 fel av 220. Frågan gäller bara grupp B.' },
    ],
    hint: 'Felandel = antal fel ÷ antal testade i gruppen.',
    explanation: '6 av 20 = 30 %, jämfört med 10 av 200 = 5 % i grupp A. Grupp B har färre fel men en sex gånger så hög felandel.',
  },
  {
    kind: 'choice',
    id: 'k1-urval',
    prompt: 'En röststyrd app fungerar sämre för personer med skånsk dialekt. Träningsdatan kommer nästan bara från Stockholm. Vad hjälper mest?',
    options: [
      { id: 'a', text: 'Att samla in inspelningar från personer i Skåne och träna om', correct: true },
      { id: 'b', text: 'Att samla in dubbelt så många inspelningar från Stockholm', feedback: 'Mer data från samma urval ger samma skeva fördelning. Det är urvalet som behöver ändras.' },
      { id: 'c', text: 'Att visa användarna exakt hur modellen räknar', feedback: 'Öppenhet gör det lättare att granska, men minskar inte felen. Modellen måste få se exempel från de grupper den ska fungera för.' },
    ],
    explanation: 'Urvalet avgör vad modellen kan lära sig. Fel för en grupp som saknas i träningsdatan försvinner inte av mer data från andra grupper.',
  },
  {
    kind: 'choice',
    id: 'k1-transparens',
    prompt: 'Ett företag publicerar exakt hur deras modell fattar beslut. Vilket påstående stämmer?',
    options: [
      { id: 'a', text: 'Det gör modellen möjlig att granska, men man behöver fortfarande testa hur den fungerar för olika grupper', correct: true },
      { id: 'b', text: 'Då kan man lita på att besluten är rätt', feedback: 'Skannern i labb 4 var helt genomskinlig och läste ändå hälften av Söderbys svar fel. Transparens är inte samma sak som tillit.' },
      { id: 'c', text: 'Det spelar ingen roll – en modell som går att förklara är alltid sämre', feedback: 'Förklarbarhet gör inte en modell sämre. I labb 4 var det förklaringen som visade varför felen uppstod.' },
    ],
    explanation: 'Transparens ger möjlighet att granska. Tillit kräver att utfallet har testats på data från alla som berörs.',
  },
  {
    kind: 'open',
    id: 'k1-sammanfattning',
    prompt: 'En kompis säger: ”AI är objektivt, det är ju bara matte.” Svara kompisen med hjälp av minst två saker du har lärt dig i kapitlet.',
    criteria: [
      'förklarar att lärande system bygger på data som människor har valt ut',
      'ger ett exempel på hur urval eller obalans kan ge fler fel för en grupp',
      'nämner att fel ska jämföras per grupp med tydlig nämnare',
      'skiljer på att kunna se hur en modell räknar och att kunna lita på den',
    ],
  },
];

export default check;
