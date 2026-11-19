import { defineLab } from '../../course/types';

export default defineLab({
  id: 'vaxa-ett-beslutstrad',
  number: 29,
  part: 'maskininlarning',
  title: 'Väx ett beslutsträd',
  summary: 'Bygg ett beslutsträd fråga för fråga och se hur djupet påverkar överanpassning.',
  goals: [
    'Förklara vad ett beslutsträd är och hur det lärs in från märkta exempel (övervakad inlärning).',
    'Räkna och tolka Gini-orenhet för en nod och viktad Gini för en delning.',
    'Jämföra en egen första fråga med den giriga algoritmens val och förklara varför algoritmen väljer som den gör.',
    'Visa med tränings- och testresultat att ett för djupt träd överanpassar.',
    'Följa vägen genom trädet för ett nytt exempel och resonera om vad transparens betyder och inte betyder.',
  ],
  prerequisites: ['Veta vad träningsdata och testdata är.', 'Känna till begreppet överanpassning.'],
  prerequisiteLabs: ['trana-valj-och-testa'],
  minutes: [15, 20],
  concepts: ['beslutstrad', 'gini-orenhet', 'tradlov', 'tradjup', 'overvakad-inlarning', 'klassificering', 'egenskap', 'etikett', 'traningsdata', 'testdata', 'overanpassning', 'hyperparameter', 'traffsakerhet', 'transparens', 'spelträd'],
  keywords: ['beslutsträd', 'Gini', 'orenhet', 'löv', 'träddjup', 'maxdjup', 'CART', 'girig algoritm', 'överanpassning', 'klassificering', 'förklarbarhet', 'transparens', 'utomhusträning'],
  coverage: [
    {
      topic: 'Översikt av metoder och algoritmer inom AI, däribland beslutsträd',
      outcome: 'Eleven bygger roten själv, ser antal och Gini i grenarna och räknar viktad Gini för Väder = regn? (0,469).',
      verification: 'logic.test.ts (rot 0,497, regn 0,469, handräknat); fråga gini-regn; Playwright extra-beslutstrad.spec.ts',
    },
    {
      topic: 'Övervakat lärande: algoritm som lär sig från märkta exempel',
      outcome: 'Eleven stegar den giriga algoritmen (6 delningar) och förklarar varför Vind ≥ 11 m/s? väljs i roten (0,342) och varför rena noder inte delas.',
      verification: 'logic.test.ts (delningsordning, likaläge, ren nod); frågor varfor-vind och ren-nod; Playwright',
    },
    {
      topic: 'Överanpassning och modellkomplexitet',
      outcome: 'Eleven ändrar bara maxdjupet och ser att djup 4 ger 100 % på träning men 83 % på test, medan djup 2 ger 83 % och 92 %.',
      verification: 'logic.test.ts (djupkurva); fråga overanpassning; Playwright extra-beslutstrad.spec.ts',
    },
    {
      topic: 'Transparens i AI-system',
      outcome: 'Eleven följer vägen för en ny dag fråga för fråga och förklarar att ett förklarbart beslut ändå kan vara fel eller orättvist.',
      verification: 'logic.test.ts (vägen för ny dag); frågor vilka-fragor och transparens; öppen fråga forklara-trad (facit i teacher.ts)',
    },
  ],
  labels: ['syntetisk', 'forenklad'],
  extra: true,
});
