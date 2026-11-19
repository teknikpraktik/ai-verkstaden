import { defineConcepts } from '../../course/types';

export default defineConcepts([
  {
    id: 'konsistent-heuristik',
    term: 'Konsistent heuristik',
    definition:
      'En heuristik h där uppskattningen aldrig sjunker mer än kostnaden för ett steg: h(n) ≤ kostnad(n, m) + h(m) för varje kant, och h(mål) = 0. En konsistent heuristik överskattar aldrig. Fågelvägen på en karta är konsistent.',
    aliases: ['monoton heuristik', 'consistent heuristic'],
    related: ['heuristik', 'a-stjarna'],
  },
]);
