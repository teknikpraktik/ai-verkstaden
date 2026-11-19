import { defineConcepts } from '../../course/types';

export default defineConcepts([
  {
    id: 'bigram',
    term: 'Bigram',
    definition: 'Ett par av två ord som står efter varandra i en text. En bigrammodell räknar sådana par och förutsäger nästa ord bara utifrån det senaste ordet.',
    aliases: ['ordpar', 'n-gram', 'bigrammodell'],
    related: ['sprakmodell', 'token'],
  },
  {
    id: 'sarskrivning',
    term: 'Särskrivning',
    definition: 'När ett sammansatt ord skrivs som två ord, till exempel ”kassa skåp” i stället för ”kassaskåp”. Kan ändra betydelsen helt.',
    aliases: ['särskrivna ord'],
    related: ['tvetydighet'],
  },
]);
