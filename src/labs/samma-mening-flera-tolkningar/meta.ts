import { defineLab } from '../../course/types';

export default defineLab({
  id: 'samma-mening-flera-tolkningar',
  number: 18,
  part: 'sprak',
  title: 'Samma mening, flera tolkningar',
  summary: 'Pröva svensk tvetydighet och kontext, jämför två sätt att moderera ett påhittat elevforum och låt en liten modell förutsäga nästa ord.',
  goals: [
    'Ge exempel på svensk tvetydighet (meningsbyggnad, flertydiga ord, särskrivning) och visa hur kontext avgör tolkningen.',
    'Jämföra två beslutssätt för moderering på samma kontrollerade utdrag och redovisa vilka fel de gör.',
    'Bedöma vem som påverkas av onödiga stopp och av missade hot.',
    'Förklara hur nästa-ord-prediktion fungerar med sannolikheter, girigt val och slump, och vad som skiljer en liten modell från en stor språkmodell.',
  ],
  prerequisites: ['Ha gjort labb 16 och 17 eller känna till token och bag-of-words.'],
  prerequisiteLabs: ['sortera-meddelanden'],
  minutes: [15, 20],
  concepts: ['tvetydighet', 'kontext', 'sprakmodell', 'token', 'falskt-positiv', 'falskt-negativ', 'manniska-i-loopen', 'bigram', 'sarskrivning'],
  keywords: ['tvetydighet', 'flertydighet', 'kontext', 'sammanhang', 'särskrivning', 'moderering', 'innehållsmoderering', 'nyckelord', 'nästa ord', 'nästa token', 'bigram', 'språkmodell', 'stora språkmodeller', 'girig generering', 'slumpad generering'],
  coverage: [
    {
      topic: 'Pröva svensk tvetydighet och kontext',
      outcome: 'Eleven väljer sammanhang till fyra tvetydiga svenska meningar (kikaren, tomten, fil, kassa skåp) och ser tolkningen ändras.',
      verification: 'logic.test.ts (interpret); fråga vad-avgor; Playwright tests/e2e/kapitel4.spec.ts (sammanhang ändrar tolkning)',
    },
    {
      topic: 'Jämföra utfall mellan två beslutssätt i ett kontrollerat utdrag (moderering)',
      outcome: 'Eleven läser av att nyckelordsregeln stoppar 5 ofarliga kommentarer och missar 1 hot, medan kontextregeln inte stoppar några ofarliga men missar 2; i experimentläget stängs ett undantag av i taget.',
      verification: 'logic.test.ts (compareModeration 8/5/1 och 2/0/2, en regel i taget); fråga onodigt-stoppade; Playwright kapitel4.spec.ts',
    },
    {
      topic: 'Bedöma vem som påverkas',
      outcome: 'Eleven pekar ut att onödiga stopp drabbar den som ber om hjälp och den som anmäler hot, och att missade hot drabbar den som blir hotad.',
      verification: 'Fråga vem-drabbas (flerval med återkoppling) och öppen fråga valj-beslutssatt med kriterier; facit i teacher.ts',
    },
    {
      topic: 'Lokal nästa-token-demonstration: sekvensprediktion och begränsningar',
      outcome: 'Eleven läser av att ”en” följs av ”bok” med sannolikheten 3/7 ≈ 43 %, jämför girig och slumpad generering med startvärde och ser att modellen tystnar vid okända ord.',
      verification: 'logic.test.ts (bigram 3/7, girig och reproducerbar slump, okänt ord, tom start); fråga p-bok; Playwright kapitel4.spec.ts',
    },
    {
      topic: 'Samband med språkmodeller och storleksskillnad',
      outcome: 'Eleven förklarar att både den lilla modellen och stora språkmodeller förutsäger nästa token, men att stora modeller har miljarder parametrar och mycket längre sammanhang (labbens modell: 71 ordpar).',
      verification: 'Fråga likhet-llm; logic.test.ts (pairCount = 71); content.ts avsnitt om språkmodeller',
    },
  ],
  labels: ['forenklad', 'syntetisk', 'pahittad'],
});
