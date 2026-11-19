import { defineConcepts } from '../../course/types';

export default defineConcepts([
  {
    id: 'robotkarta',
    term: 'Robotens karta',
    definition: 'Robotens inre bild av omgivningen, till exempel ett rutnät med väggar och hinder. Kartan kan vara gammal eller ofullständig och stämmer inte alltid med den faktiska miljön.',
    aliases: ['karta', 'världsmodell', 'map'],
    related: ['omplanering', 'sensor'],
  },
]);
