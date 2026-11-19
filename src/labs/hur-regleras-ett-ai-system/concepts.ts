import { defineConcepts } from '../../course/types';

export default defineConcepts([
  {
    id: 'hogrisksystem',
    term: 'Högrisksystem (AI)',
    definition: 'AI-system som enligt EU:s AI-förordning kan påverka hälsa, säkerhet eller grundläggande rättigheter så mycket att de får särskilda krav, till exempel riskhantering, dokumentation och mänsklig tillsyn. Vilka områden som omfattas står bland annat i förordningens bilaga III, till exempel utbildning och rekrytering.',
    aliases: ['högrisk-AI', 'bilaga III', 'high-risk AI system'],
    related: ['ai-forordningen', 'manniska-i-loopen'],
  },
  {
    id: 'ikrafttradande',
    term: 'Ikraftträdande och tillämpning',
    definition: 'En lag träder i kraft när den blir bindande, men enskilda regler kan börja tillämpas – alltså gälla i praktiken – senare. AI-förordningen trädde i kraft 1 augusti 2024, men olika delar börjar tillämpas vid olika datum.',
    aliases: ['ikraftträdande', 'tillämpningsdatum', 'entry into force'],
    related: ['ai-forordningen'],
  },
  {
    id: 'oppenhetskrav',
    term: 'Krav på öppenhet (AI)',
    definition: 'Regler i AI-förordningens artikel 50 om att människor ska få veta när de interagerar med ett AI-system, och att visst AI-genererat innehåll ska märkas eller redovisas, till exempel deepfakes.',
    aliases: ['transparenskrav', 'artikel 50'],
    related: ['ai-forordningen', 'transparens'],
  },
]);
