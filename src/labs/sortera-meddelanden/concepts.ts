import { defineConcepts } from '../../course/types';

export default defineConcepts([
  {
    id: 'naiv-bayes',
    term: 'Naiv Bayes',
    definition: 'Enkel klassificeringsmetod som räknar hur vanligt varje ord är i varje klass och lägger ihop ordens bidrag. ”Naiv” eftersom den behandlar orden som oberoende av varandra och ignorerar ordningen.',
    aliases: ['naive Bayes', 'multinomial naiv Bayes', 'Bayes-klassificerare'],
    related: ['bag-of-words', 'klassificering', 'utjamning'],
  },
  {
    id: 'utjamning',
    term: 'Utjämning',
    definition: 'Att lägga till ett litet tal (ofta 1) till alla räknade antal så att ett ord som aldrig har setts i en klass inte får sannolikheten 0.',
    aliases: ['Laplace-utjämning', 'smoothing', 'additiv utjämning'],
    related: ['naiv-bayes'],
  },
]);
