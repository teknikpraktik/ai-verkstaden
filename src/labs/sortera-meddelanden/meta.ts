import { defineLab } from '../../course/types';

export default defineLab({
  id: 'sortera-meddelanden',
  number: 17,
  part: 'sprak',
  title: 'Sortera meddelanden med en textmodell',
  summary: 'Låt en liten bag-of-words-modell sortera skolmeddelanden, se vilka ord som avgör och testa negation, okända ord och reserverade exempel.',
  goals: [
    'Beskriva hur en bag-of-words-klassificerare lägger ihop ordens bidrag till ett beslut.',
    'Läsa av vilka ord som drar mot respektive klass, med tecken och storlek.',
    'Visa med exempel att negation och ordningsföljd inte syns i en bag-of-words-modell och att okända ord hoppas över.',
    'Redovisa och förklara modellens fel på reserverade exempel som inte användes i träningen.',
  ],
  prerequisites: ['Veta vad träningsdata och testdata är.', 'Ha gjort labb 16 eller känna till ordvektorer.'],
  prerequisiteLabs: ['gor-text-till-data'],
  minutes: [15, 20],
  concepts: ['bag-of-words', 'ordvektor', 'klassificering', 'traningsdata', 'testdata', 'forvaxlingsmatris', 'falskt-positiv', 'falskt-negativ', 'felandel', 'naiv-bayes', 'utjamning'],
  keywords: ['textklassificering', 'naiv Bayes', 'bag-of-words', 'ordvikter', 'negation', 'okända ord', 'reserverade exempel', 'skräppost', 'Laplace-utjämning', 'sortera meddelanden'],
  coverage: [
    {
      topic: 'Liten bag-of-words-klassificerare med tillgängliga exempel',
      outcome: 'Eleven ser 16 påhittade träningsmeddelanden och hur modellen räknar ord per klass (multinomial naiv Bayes med Laplace-utjämning).',
      verification: 'logic.test.ts (räkning per klass, handräknade sannolikheter)',
    },
    {
      topic: 'Visa vilka ord som påverkar utfallet',
      outcome: 'Eleven läser av ordens bidrag med tecken och pil (▲/▼) och pekar ut att ”morgon” (+1,09) drar mest i startmeddelandet med summan +3,54.',
      verification: 'logic.test.ts (handräknad poäng 3,5383); fråga starkast-ord; Playwright tests/e2e/kapitel4.spec.ts',
    },
    {
      topic: 'Testa nya meddelanden, negation och ord som saknas i träningsmaterialet',
      outcome: 'Eleven skriver egna meddelanden, ser att ”inte” bara sänker poängen med 0,01 och att okända ord hoppas över (oavgjort när inga ord är kända eller meddelandet är tomt).',
      verification: 'logic.test.ts (negation, ordningsföljd, okända ord, tomt meddelande); frågor negation-varfor och okanda-ord; Playwright kapitel4.spec.ts',
    },
    {
      topic: 'Redovisa fel på reserverade exempel',
      outcome: 'Eleven räknar 2 fel av 6 reserverade exempel, läser förväxlingsmatrisen och förklarar felen med ordens bidrag.',
      verification: 'logic.test.ts (evaluate: 2 fel, tp 2, fn 1, fp 1, tn 2); fråga antal-fel; Playwright kapitel4.spec.ts',
    },
  ],
  labels: ['forenklad', 'syntetisk', 'pahittad'],
});
