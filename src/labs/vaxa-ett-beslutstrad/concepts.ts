import { defineConcepts } from '../../course/types';

export default defineConcepts([
  {
    id: 'beslutstrad',
    term: 'Beslutsträd',
    definition: 'Modell för övervakad inlärning som består av ja/nej-frågor om egenskaperna. Ett nytt exempel följer frågorna från roten till ett löv, som ger svaret. Frågorna lärs in från märkta exempel. Inte samma sak som ett spelträd.',
    aliases: ['decision tree', 'klassificeringsträd', 'CART'],
    related: ['tradlov', 'gini-orenhet', 'tradjup', 'klassificering', 'overvakad-inlarning'],
  },
  {
    id: 'gini-orenhet',
    term: 'Gini-orenhet',
    definition: 'Mått på hur blandad en grupp är: 1 − (andel klass A)² − (andel klass B)². 0 betyder att alla exempel har samma klass, 0,5 att det är hälften av varje (med två klasser).',
    aliases: ['Gini', 'Gini impurity', 'orenhet', 'impurity'],
    related: ['beslutstrad'],
  },
  {
    id: 'tradlov',
    term: 'Löv (i beslutsträd)',
    definition: 'En nod längst ut i trädet utan fler frågor. Lövet svarar med den klass som är vanligast bland träningsexemplen som hamnade där.',
    aliases: ['löv', 'blad', 'leaf', 'lövnod'],
    related: ['beslutstrad'],
  },
  {
    id: 'tradjup',
    term: 'Träddjup',
    definition: 'Det största antalet frågor i rad från roten till ett löv. Ett maxdjup är en hyperparameter: för grunda träd missar mönster, för djupa träd överanpassar.',
    aliases: ['maxdjup', 'max depth', 'djup'],
    related: ['beslutstrad', 'hyperparameter', 'overanpassning'],
  },
]);
