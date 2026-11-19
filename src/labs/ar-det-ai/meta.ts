import { defineLab } from '../../course/types';

export default defineLab({
  id: 'ar-det-ai',
  number: 1,
  part: 'introduktion',
  title: 'Är det AI?',
  summary: 'Sortera vardagssystem: fasta regler, lärande system eller både och?',
  goals: [
    'Sortera vardagssystem som fasta regler, lärande system eller kombinationer och motivera valet.',
    'Förklara varför vissa gränsfall har flera välmotiverade svar.',
    'Jämföra mänsklig förståelse, generalisering, erfarenhet och situationsbedömning med en enkel regelmodell och en enkel lärande modell.',
  ],
  prerequisites: ['Inga särskilda förkunskaper.'],
  prerequisiteLabs: [],
  minutes: [15, 20],
  concepts: ['artificiell-intelligens', 'regelbaserat-system', 'maskininlarning', 'modell', 'generalisering', 'traningsdata', 'sensor'],
  keywords: ['AI', 'artificiell intelligens', 'fasta regler', 'lärande system', 'gränsfall', 'skräppostfilter', 'termostat', 'generalisering', 'förståelse', 'situationsbedömning'],
  coverage: [
    {
      topic: 'Klassificera vardagssystem som fasta regler, lärande system eller kombinationer',
      outcome: 'Eleven sorterar nio vardagssystem och får en motiverad bedömning av varje val.',
      verification: 'Playwright: tests/e2e/kapitel1.spec.ts (labb 1: sortera och visa bedömning); logic.test.ts (räknar välmotiverade svar)',
    },
    {
      topic: 'Visa varför vissa gränsfall har flera välmotiverade svar',
      outcome: 'Eleven hittar de tre gränsfallen och förklarar att svaret beror på vilken del av systemet man tittar på.',
      verification: 'logic.test.ts (tre gränsfall); frågorna antal-gransfall och varfor-gransfall med återkoppling',
    },
    {
      topic: 'Jämför mänsklig förståelse, generalisering, erfarenhet och situationsbedömning med de modeller som visas',
      outcome: 'Eleven ser termostaten värma med öppet fönster och filtret stoppa mentorns mejl men släppa igenom engelsk skräppost, och jämför med en människa.',
      verification: 'logic.test.ts (situationerna ger de utfall som labbens text beskriver); kapitel1.spec.ts (situation engelska); frågorna engelska och mentor',
    },
  ],
  labels: ['forenklad', 'syntetisk'],
});
