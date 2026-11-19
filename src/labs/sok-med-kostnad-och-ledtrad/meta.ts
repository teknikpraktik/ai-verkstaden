import { defineLab } from '../../course/types';

export default defineLab({
  id: 'sok-med-kostnad-och-ledtrad',
  number: 8,
  part: 'sokning',
  title: 'Sök med kostnad och ledtråd',
  summary: 'Jämför uniformkostnadssökning, girig bäst-först-sökning och A* på samma karta och se när en ledtråd hjälper och när den lurar.',
  goals: [
    'Följa uniformkostnadssökning, girig bäst-först-sökning och A* steg för steg och läsa av g, h och f.',
    'Visa med ett exempel att en girig sökning kan välja en dyrare väg.',
    'Jämföra sökningarna efter vägkostnad och antal expanderade noder.',
    'Ange under vilka villkor A* hittar en billigaste väg.',
  ],
  prerequisites: ['Veta vad en viktad graf och en vägs kostnad är.', 'Ha sett hur en sökning använder en lista med väntande noder.'],
  prerequisiteLabs: ['bygg-en-graf', 'bredden-forst-och-djupet-forst'],
  minutes: [15, 20],
  concepts: ['uniformkostnadssokning', 'girig-sokning', 'a-stjarna', 'heuristik', 'kostnad', 'graf', 'besokta-noder', 'konsistent-heuristik'],
  keywords: ['A*', 'A-stjärna', 'uniformkostnadssökning', 'Dijkstra', 'girig sökning', 'bäst-först', 'heuristik', 'ledtråd', 'fågelvägen', 'g h f', 'tillåten heuristik', 'konsistent heuristik', 'optimal väg', 'karta'],
  coverage: [
    {
      topic: 'Jämför uniformkostnadssökning, girig bäst-först-sökning och A* på samma karta',
      outcome: 'Eleven stegar alla tre på kartan runt Långsjön och jämför resultaten i en tabell.',
      verification: 'logic.test.ts (summarize); Playwright kapitel2.spec.ts (jämförelsetabell)',
    },
    {
      topic: 'Visa g, h och f samt expanderade noder och vägkostnad',
      outcome: 'Eleven läser av f = 210 + 158 = 368 för Sjövik och antalet expanderade orter (8, 4 och 6).',
      verification: 'logic.test.ts (f-värden 368, 369, 450; expanderade); fråga astar-f; Playwright kapitel2.spec.ts (gränstabellen)',
    },
    {
      topic: 'Scenario där en girig strategi väljer en dyrare väg',
      outcome: 'Eleven räknar ut att den giriga vägen kostar 450 medan billigaste vägen kostar 375.',
      verification: 'logic.test.ts (girig 450, optimal 375); fråga girig-kostnad med fel→rätt i Playwright kapitel2.spec.ts',
    },
    {
      topic: 'Villkor för att A* i implementationen hittar en optimal väg',
      outcome: 'Eleven anger att kostnaderna ska vara positiva och h konsistent, och ser i experimentläget att en överskattande h (450) och en tillåten men inkonsistent h (9 i stället för 7) kan ge en dyrare väg.',
      verification: 'logic.test.ts (isConsistent, tredubbel h, lurig ledtråd); fråga astar-villkor',
    },
  ],
  labels: ['forenklad', 'pahittad'],
});
