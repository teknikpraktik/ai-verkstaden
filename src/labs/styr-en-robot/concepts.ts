import { defineConcepts } from '../../course/types';

export default defineConcepts([
  {
    id: 'styrprogram',
    term: 'Styrprogram',
    definition: 'Den del av en robot som tar emot mätvärden från sensorerna och bestämmer vad ställdonen ska göra, till exempel med regler av typen ”om … så …”.',
    aliases: ['styrsystem', 'regulator', 'controller'],
    related: ['sensor', 'stalldon', 'robot'],
  },
  {
    id: 'sakerhetsmarginal',
    term: 'Säkerhetsmarginal',
    definition: 'Extra avstånd eller tid som byggs in så att ett system hinner reagera även när mätningar är osäkra. Ger färre olyckor men ofta sämre prestanda.',
    aliases: ['marginal'],
    related: ['sensorbrus', 'styrprogram'],
  },
]);
