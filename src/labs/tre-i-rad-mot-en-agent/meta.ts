import { defineLab } from '../../course/types';

export default defineLab({
  id: 'tre-i-rad-mot-en-agent',
  number: 9,
  part: 'sokning',
  title: 'Tre i rad mot en agent',
  summary: 'Spela tre i rad mot en slumpagent, en regelagent och en minimaxagent, ställ dem mot samma brädläge och undersök en del av beslutsträdet.',
  goals: [
    'Jämföra hur en slumpagent, en regelagent och en minimaxagent väljer drag i samma brädläge.',
    'Förutsäga ett drag och kontrollera förutsägelsen mot agenterna.',
    'Läsa av en liten del av ett beslutsträd och förklara hur minimax räknar fram ett värde.',
    'Förklara varför regler kan missa en fälla som minimax upptäcker.',
  ],
  prerequisites: ['Kunna reglerna för tre i rad.'],
  prerequisiteLabs: ['programmera-en-stadrobot', 'bygg-en-graf'],
  minutes: [15, 20],
  concepts: ['minimax', 'spelträd', 'agent', 'regelbaserat-system', 'tillstand', 'handling', 'startvarde'],
  keywords: ['tre i rad', 'luffarschack', 'minimax', 'spelträd', 'beslutsträd', 'spel', 'motståndare', 'regelagent', 'slumpagent', 'förutsäga drag'],
  coverage: [
    {
      topic: 'Jämför slump, regelstyrning och minimax i ett spelbart tre i rad',
      outcome: 'Eleven spelar mot alla tre och läser av att minimax förlorar 0 av 100 partier mot slumpen medan regelagenten förlorar 2.',
      verification: 'logic.test.ts (serier över 100 partier); Playwright kapitel2.spec.ts (spela med tangentbord)',
    },
    {
      topic: 'Inspektera en liten del av beslutsträdet',
      outcome: 'Eleven öppnar draget C1 i fällan med två hörn och ser att det ger förlust om 4 drag medan kanterna ger oavgjort.',
      verification: 'logic.test.ts (scoreMoves för fällan); fråga gaffel-trad; Playwright kapitel2.spec.ts (öppnar trädet)',
    },
    {
      topic: 'Förutsäga ett drag',
      outcome: 'Eleven förutsäger var minimax lägger sitt O och jämför med agenternas val.',
      verification: 'Förutsägelsefråga gissa-drag; Playwright kapitel2.spec.ts',
    },
    {
      topic: 'Ställ olika motståndare mot samma brädläge',
      outcome: 'Eleven ser i en tabell vilket drag varje agent väljer i samma läge och varför.',
      verification: 'logic.test.ts (blockerar hot, tar vinst, regelagent tar hörn); fråga vem-missar med fel→rätt i Playwright',
    },
    {
      topic: 'Minimax testas på slutlägen och kända lägen',
      outcome: 'Vinst, förlust och oavgjort känns igen och minimax tar en direkt vinst och blockerar ett direkt hot.',
      verification: 'logic.test.ts (winner, minimax på slutlägen, kända lägen, perfekt spel blir oavgjort)',
    },
  ],
  labels: ['forenklad'],
});
