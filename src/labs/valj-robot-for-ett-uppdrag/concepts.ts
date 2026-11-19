import { defineConcepts } from '../../course/types';

export default defineConcepts([
  {
    id: 'lidar',
    term: 'Lidar',
    definition: 'Sensor som skickar ut laserljus och mäter hur lång tid det tar för ljuset att studsa tillbaka. Ger avstånd till omgivningen även i mörker, men kan störas av regn, dimma och blanka ytor.',
    aliases: ['laserskanner', 'laseravståndsmätare'],
    related: ['sensor', 'robot'],
  },
]);
