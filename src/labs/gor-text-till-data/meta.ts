import { defineLab } from '../../course/types';

export default defineLab({
  id: 'gor-text-till-data',
  number: 16,
  part: 'sprak',
  title: 'Gör text till data',
  summary: 'Redigera svensk text och jämför tokenisering, stemming och lemmatisering. Räkna sedan ord till ordvektorer.',
  goals: [
    'Dela upp en svensk text i token och förklara varför skiljetecken och tal kan räknas som token.',
    'Jämföra stemming och lemmatisering och ge exempel där de ger olika resultat.',
    'Visa hur en text blir en ordvektor som räknar förekomster, och hur valet av representation ändrar ordförrådet.',
    'Beskriva begränsningar hos en reducerad ordlista: okända ord och tvetydiga former.',
  ],
  prerequisites: ['Inga särskilda förkunskaper.'],
  prerequisiteLabs: [],
  minutes: [15, 20],
  concepts: ['nlp', 'token', 'stemming', 'lemmatisering', 'ordvektor', 'bag-of-words', 'tvetydighet'],
  keywords: ['tokenisering', 'token', 'stemming', 'ordstam', 'lemmatisering', 'lemma', 'grundform', 'ordvektor', 'ordlista', 'räkna ord', 'textbearbetning', 'förbehandling'],
  coverage: [
    {
      topic: 'Redigera svensk exempeltext och jämföra tokenisering, stemming och lemmatisering',
      outcome: 'Eleven ändrar texten och läser av token, stam och lemma för varje ord sida vid sida; texten sparas lokalt.',
      verification: 'Playwright: tests/e2e/kapitel4.spec.ts (labb 16: redigera text, jämförelsetabell, omladdning); logic.test.ts (tokenisering, stemming, ordlista)',
    },
    {
      topic: 'Ordvektorer som räknar förekomster i ett litet dokumenturval',
      outcome: 'Eleven läser av att ”hund” förekommer 2 gånger i dokument A med lemman och att ordförrådet krymper från 21 till 18 till 17 termer.',
      verification: 'logic.test.ts (countVectors: 21/18/17, hund = 2 i A); fråga hund-a; Playwright kapitel4.spec.ts',
    },
    {
      topic: 'Märk den reducerade svenska ordlistan och visa var den ger begränsningar',
      outcome: 'Eleven ser att okända ord märks ⚠ och faller igenom oförändrade och att tvetydiga former (var, får, man) märks ◆.',
      verification: 'logic.test.ts (okända ord, tvetydiga former, ordlistans storlek 54/168); fråga okant-ord; Playwright kapitel4.spec.ts',
    },
    {
      topic: 'Kantfall: tom text, skiljetecken, å/ä/ö, tal och versaler',
      outcome: 'Labben visar ett tydligt meddelande för tom text och hanterar tal, skiljetecken, å/ä/ö och versaler.',
      verification: 'logic.test.ts (tom text, Åsa åt 2,5 äpplen …, versaler); Playwright kapitel4.spec.ts (tom text)',
    },
  ],
  labels: ['forenklad'],
});
