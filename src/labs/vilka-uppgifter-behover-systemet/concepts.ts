import { defineConcepts } from '../../course/types';

export default defineConcepts([
  {
    id: 'pseudonymisering',
    term: 'Pseudonymisering',
    definition: 'Att ersätta namn och andra direkta kännetecken med till exempel ett slumpat nummer, så att uppgifterna inte kan kopplas till en person utan en separat nyckel. Pseudonymiserade uppgifter räknas fortfarande som personuppgifter.',
    aliases: ['pseudonym', 'pseudonymt id'],
    related: ['personuppgift', 'dataminimering'],
  },
  {
    id: 'kanslig-personuppgift',
    term: 'Känsliga personuppgifter',
    definition: 'Särskilda kategorier av personuppgifter enligt GDPR artikel 9, till exempel uppgifter om hälsa, etniskt ursprung, religion eller biometriska uppgifter som används för att identifiera någon. De får bara behandlas om något av undantagen i artikeln gäller.',
    aliases: ['särskilda kategorier av personuppgifter', 'artikel 9'],
    related: ['personuppgift', 'gdpr'],
  },
]);
