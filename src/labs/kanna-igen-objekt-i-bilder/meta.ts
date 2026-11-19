import { defineLab } from '../../course/types';

export default defineLab({
  id: 'kanna-igen-objekt-i-bilder',
  number: 28,
  part: 'maskininlarning',
  title: 'Känn igen objekt i bilder',
  summary: 'Se hur en enkel modell hittar och känner igen föremål i små bilder – och var den går fel.',
  goals: [
    'Förklara att en digital bild för datorn är ett rutnät av tal (pixlar).',
    'Beskriva hur en enkel modell klassificerar en bild genom att jämföra den med en mall per klass, och räkna ut likheten.',
    'Förklara hur ett glidande fönster används för att hitta var i en större bild föremålen finns, och hur tröskeln påverkar missade och felaktiga fynd.',
    'Ge exempel på när enkel bildigenkänning misslyckas (flyttat, vridet, skymt, omvänd belysning, brus, liknande föremål) och jämföra med hur människor och större inlärda modeller känner igen föremål.',
  ],
  prerequisites: ['Veta vad klassificering är och att en modell jämför nya exempel med kända exempel.', 'Kunna räkna ut en andel i procent.'],
  prerequisiteLabs: ['trana-en-klassificerare'],
  minutes: [15, 20],
  concepts: ['datorseende', 'objektigenkanning', 'pixel', 'mallmatchning', 'glidande-fonster', 'faltningsnatverk', 'klassificering', 'troskel', 'falskt-positiv', 'falskt-negativ', 'generalisering', 'traningsdata'],
  keywords: ['objektigenkänning', 'bildigenkänning', 'datorseende', 'vision', 'pixel', 'mall', 'glidande fönster', 'brus', 'tröskel', 'faltningsnätverk', 'CNN', 'kopp', 'äpple', 'nyckel'],
  coverage: [
    {
      topic: 'Översikt av tekniker för AI, däribland sökning, klassificering och objektigenkänning',
      outcome: 'Eleven beskriver objektigenkänning som två delar – hitta var (glidande fönster) och avgöra vad (klassificering mot mallar) – och räknar ut likheten 15/29 = 52 % mellan koppen och äpplemallen.',
      verification: 'logic.test.ts (likheter, 69 fönsterlägen, fynd); Playwright: tests/e2e/extra-objekt.spec.ts (genomgång, frågorna likhet-apple och antal-lagen)',
    },
    {
      topic: 'Översikt över användningen av AI, däribland prediktion, robotik, vision',
      outcome: 'Eleven förklarar att datorseende bygger på att bilder är tal, och kan beskriva skillnaden mellan labbens mallar och verkliga system som lär sig från stora mängder märkta bilder.',
      verification: 'Öppen fråga manniska-modell med kriterier (facit i teacher.ts); innehållets avsnitt och fördjupning; manuell kontroll',
    },
    {
      topic: 'Enklare typ av problemlösning med hjälp av AI, till exempel klassificering, objektigenkänning',
      outcome: 'Eleven låter modellen leta i en bild, ändrar en sak i taget (brus eller tröskel) och läser av rätt, felaktiga och missade fynd; ritar och testar en egen bild med tangentbord eller klick.',
      verification: 'logic.test.ts (brus 20 %: tröskel 70 % → 1 rätt, 2 missade; tröskel 50 % → 2 rätt, 2 felaktiga; kantfall tom/svart bild, tröskel 0 och 100); Playwright: extra-objekt.spec.ts (brus/tröskel, pixelredigering med tangentbord)',
    },
  ],
  labels: ['syntetisk', 'forenklad'],
  extra: true,
});
