import { defineLab } from '../../course/types';

export default defineLab({
  id: 'granska-ett-ai-system',
  number: 27,
  part: 'avslutning',
  title: 'Granska ett AI-system',
  summary: 'Kursens slutprojekt: välj ett påhittat AI-system, granska mål, data och metod med belägg från labbarna och skriv en rapport.',
  goals: [
    'Beskriva ett AI-systems mål, data och metod och motivera metodvalet.',
    'Använda resultat från kursens labbar som belägg och skilja dem från egna antaganden.',
    'Bedöma vilka fel och risker systemet kan ge, vem som drabbas och hur mycket mänsklig insyn som behövs.',
    'Ge en motiverad rekommendation i en rapport som går att skriva ut eller spara.',
  ],
  prerequisites: ['Gärna minst en labb från varje kapitel. Du kan göra projektet ensam eller i par.'],
  prerequisiteLabs: ['vem-far-fel-svar', 'trana-valj-och-testa', 'hur-regleras-ett-ai-system'],
  minutes: [120, 240],
  concepts: [
    'artificiell-intelligens',
    'modell',
    'datamangd',
    'bias',
    'falskt-positiv',
    'falskt-negativ',
    'manniska-i-loopen',
    'transparens',
    'ansvar',
    'ai-forordningen',
    'gdpr',
    'dataminimering',
  ],
  keywords: ['slutprojekt', 'granskning', 'AI-granskning', 'riskbedömning', 'mänsklig insyn', 'rapport', 'projektarbete', 'belägg', 'rekommendation'],
  coverage: [
    {
      topic: 'Välj ett fiktivt problem och specificera mål, data och metod',
      outcome: 'Eleven väljer ett av fyra påhittade problem (eller ett eget) och beskriver mål, berörda, data och metod med motivering.',
      verification: 'Playwright: tests/e2e/avslutning.spec.ts (projektflöde); logic.test.ts (granskningslista)',
    },
    {
      topic: 'Välj experiment från kursen som belägg',
      outcome: 'Eleven kryssar i minst två labbar och skriver vad varje labb visar om det granskade systemet.',
      verification: 'logic.test.ts (labblistan mot labOrder, krav på två labbar med anteckning); avslutning.spec.ts',
    },
    {
      topic: 'Bedöm fel, risker och behov av mänsklig insyn',
      outcome: 'Eleven beskriver feltyper och risker och väljer och motiverar en nivå av mänsklig insyn; kontrollfråga med återkoppling.',
      verification: 'Kontrollfrågan insyn-kontroll; logic.test.ts (fullständighetsregler)',
    },
    {
      topic: 'Spara lokalt, granskningslista och utskriftsvänlig rapport',
      outcome: 'Arbetet finns kvar efter omladdning, granskningslistan visar vad som saknas och rapporten kan skrivas ut eller laddas ned som text.',
      verification: 'Playwright: avslutning.spec.ts (omladdning, rapportinnehåll, utskriftsknapp, utskriftsvy); logic.test.ts (rapporttext, tomt projekt)',
    },
  ],
  labels: ['pahittad'],
});
